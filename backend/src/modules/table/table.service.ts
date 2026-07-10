import { TableRepository } from './table.repository';
import { redis } from '../../config/redis';
import { publish } from '../../lib/sse';

export class TableService {
  static async initiateSession(qrCode: string, userId: string) {
    // 1. Fetch table details
    const table = await TableRepository.findTableByQrCode(qrCode);
    if (!table) {
      throw new Error('Invalid QR code — table not found');
    }

    const restaurant = table.floor.branch.restaurant;
    if (restaurant.status === 'SUSPENDED' || restaurant.status === 'EXPIRED') {
      throw new Error('Restaurant access has been suspended or plan has expired');
    }

    if (!restaurant.allowDineIn) {
      throw new Error('Dine-in ordering is not supported by this restaurant');
    }

    if (table.status !== 'AVAILABLE') {
      throw new Error(`Table is currently not available (status: ${table.status})`);
    }

    // 2. Generate codes
    const codes: string[] = [];
    while (codes.length < 3) {
      const code = Math.floor(10 + Math.random() * 90).toString();
      if (!codes.includes(code)) {
        codes.push(code);
      }
    }

    const correctIndex = Math.floor(Math.random() * 3);
    const correctCode = codes[correctIndex];

    // 3. Cache correct code in Redis (5 min TTL)
    try {
      await redis.set(`table_verify:${table.id}`, correctCode, 'EX', 300);
    } catch (err) {
      console.error('Redis table verification code caching failed:', err);
    }

    // 4. Create TableSession record
    const session = await TableRepository.createTableSession({
      tableId: table.id,
      customerId: userId,
      verifyCode: correctCode,
      status: 'PENDING_VERIFICATION',
    });

    return {
      session: {
        id: session.id,
        tableId: table.id,
        status: session.status,
      },
      tableNumber: table.number,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      branchName: table.floor.branch.name,
      floorName: table.floor.name,
      verificationCodes: codes,
    };
  }

  static async verifySession(sessionId: string, verifyCode: string) {
    const session = await TableRepository.findSessionWithTable(sessionId);
    if (!session || session.status !== 'PENDING_VERIFICATION') {
      throw new Error('Session is invalid or already verified');
    }

    // Check verification code against Redis, fallback to DB
    let correctCode = null;
    try {
      correctCode = await redis.get(`table_verify:${session.tableId}`);
    } catch (err) {
      console.error('Redis get verify code failed:', err);
    }

    if (!correctCode) {
      correctCode = session.verifyCode;
    }

    if (verifyCode !== correctCode) {
      throw new Error('Incorrect verification code');
    }

    // Update statuses
    const updatedSession = await TableRepository.updateSessionStatus(sessionId, 'ACTIVE');
    await TableRepository.updateTableStatus(session.tableId, 'SEATED');

    const restaurantId = session.table.floor.branch.restaurantId;

    // Publish real-time events via SSE
    publish(`table:${sessionId}`, 'SESSION_ACTIVE', { sessionId });
    publish(`restaurant:${restaurantId}`, 'TABLE_SEATED', {
      tableId: session.tableId,
      tableNumber: session.table.number,
      floorName: session.table.floor.name,
      sessionId,
    });

    return updatedSession;
  }

  static async getSessionDetails(id: string) {
    const session = await TableRepository.getSessionWithDetails(id);
    if (!session) {
      throw new Error('Session not found');
    }

    // Map orders total amount Decimals to numbers
    const sanitizedOrders = session.orders.map((order) => ({
      ...order,
      subtotal: Number(order.subtotal),
      taxAmount: Number(order.taxAmount),
      totalAmount: Number(order.totalAmount),
      items: order.items.map((item) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
        selectedModifiers: typeof item.selectedModifiers === 'string'
          ? JSON.parse(item.selectedModifiers)
          : item.selectedModifiers,
      })),
    }));

    return {
      ...session,
      orders: sanitizedOrders,
    };
  }

  static async requestBill(id: string) {
    const session = await TableRepository.findSessionWithTable(id);
    if (!session || session.status !== 'ACTIVE') {
      throw new Error('Session must be ACTIVE to request a bill');
    }

    const orders = await TableRepository.getActiveSessionOrders(id);
    let subtotal = 0;
    orders.forEach((o) => {
      subtotal += Number(o.subtotal);
    });

    const restaurantId = session.table.floor.branch.restaurantId;
    const taxConfig = await TableRepository.getTaxConfig(restaurantId);

    const gstPercent = taxConfig ? Number(taxConfig.gstPercent) : 5.0;
    const taxAmount = (subtotal * gstPercent) / 100;
    const totalAmount = subtotal + taxAmount;

    // Update statuses
    await TableRepository.updateSessionStatus(id, 'BILL_REQUESTED');
    await TableRepository.updateTableStatus(session.tableId, 'BILL_REQUESTED');

    // Notify manager
    publish(`table:${id}`, 'BILL_REQUESTED_ACK', { subtotal, taxAmount, totalAmount });
    publish(`restaurant:${restaurantId}`, 'BILL_REQUESTED', {
      sessionId: id,
      tableId: session.tableId,
      tableNumber: session.table.number,
      subtotal,
      taxAmount,
      totalAmount,
    });

    return {
      subtotal,
      gstPercent,
      taxAmount,
      totalAmount,
    };
  }

  static async claimPayment(id: string) {
    const session = await TableRepository.findSessionWithTable(id);
    if (!session || !['ACTIVE', 'BILL_REQUESTED'].includes(session.status)) {
      throw new Error('Invalid session state for payment claim');
    }

    await TableRepository.updateSessionStatus(id, 'PAYMENT_PENDING');
    await TableRepository.updateTableStatus(session.tableId, 'PAYMENT_PENDING');

    const restaurantId = session.table.floor.branch.restaurantId;

    // Notify manager
    publish(`table:${id}`, 'PAYMENT_SUBMITTED', { sessionId: id });
    publish(`restaurant:${restaurantId}`, 'PAYMENT_PENDING_CONFIRMATION', {
      sessionId: id,
      tableId: session.tableId,
      tableNumber: session.table.number,
    });
  }

  static async confirmPayment(id: string, userId: string) {
    const staff = await TableRepository.findStaff(userId);
    if (!staff || !['OWNER', 'MANAGER'].includes(staff.role)) {
      throw new Error('Forbidden: Insufficient privileges to confirm payment');
    }

    const session = await TableRepository.getSessionWithDetails(id);
    if (!session || !['ACTIVE', 'BILL_REQUESTED', 'PAYMENT_PENDING'].includes(session.status)) {
      throw new Error('Session is not in a payable state');
    }

    const orders = await TableRepository.getActiveSessionOrders(id);
    let subtotal = 0;
    orders.forEach((o) => {
      subtotal += Number(o.subtotal);
    });

    const restaurantId = session.table.floor.branch.restaurantId;
    const taxConfig = await TableRepository.getTaxConfig(restaurantId);
    const gstPercent = taxConfig ? Number(taxConfig.gstPercent) : 5.0;
    const taxAmount = (subtotal * gstPercent) / 100;
    const totalAmount = subtotal + taxAmount;

    // Run transaction
    await TableRepository.closeSessionTransaction(
      id,
      session.tableId,
      totalAmount,
      restaurantId,
      session.customerId,
      staff.id
    );

    // Publish real-time events via SSE
    publish(`table:${id}`, 'SESSION_CLOSED', { sessionId: id });
    publish(`restaurant:${restaurantId}`, 'TABLE_COMPLETED', {
      tableId: session.tableId,
      tableNumber: session.table.number,
      sessionId: id,
    });
  }

  static async getActiveTableSession(tableId: string) {
    const session = await TableRepository.findActiveSessionByTable(tableId);
    if (!session) {
      throw new Error('No active session found for this table');
    }
    return session;
  }
}
