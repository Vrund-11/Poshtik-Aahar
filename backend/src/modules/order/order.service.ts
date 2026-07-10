import { OrderRepository } from './order.repository';
import { publish } from '../../lib/sse';

export class OrderService {
  static async verifyStaffMember(userId: string, restaurantId: string): Promise<boolean> {
    const staff = await OrderRepository.findStaff(userId);
    return !!staff && staff.restaurantId === restaurantId && staff.isActive;
  }

  static async placeOrder(userId: string, data: { sessionId: string; items: any[]; notes?: string }) {
    const { sessionId, items, notes } = data;

    // 1. Fetch active session
    const session = await OrderRepository.findSessionWithTable(sessionId);
    if (!session || session.status !== 'ACTIVE') {
      throw new Error('Table session is not active or invalid');
    }

    if (session.customerId !== userId) {
      throw new Error('Forbidden: You do not own this table session');
    }

    const restaurantId = session.table.floor.branch.restaurantId;

    // 2. Fetch menu items from DB to prevent client-side price tampering
    const menuItemIds = items.map((i) => i.menuItemId);
    const dbMenuItems = await OrderRepository.findMenuItemsForRestaurant(menuItemIds, restaurantId);

    if (dbMenuItems.length !== new Set(menuItemIds).size) {
      throw new Error('One or more menu items are invalid or currently unavailable');
    }

    const menuItemsMap = new Map(dbMenuItems.map((item) => [item.id, item]));

    // 3. Calculate subtotal using actual DB prices
    let subtotal = 0;
    const orderItemsData = items.map((item) => {
      const dbItem = menuItemsMap.get(item.menuItemId)!;
      const unitPrice = Number(dbItem.price);
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      return {
        menuItemId: item.menuItemId,
        name: dbItem.name,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        notes: item.notes,
        selectedModifiers: item.selectedModifiers ? JSON.stringify(item.selectedModifiers) : '[]',
      };
    });

    // 4. Retrieve Tax configuration for restaurant
    const taxConfig = await OrderRepository.findTaxConfig(restaurantId);
    const gstPercent = taxConfig && taxConfig.isActive ? Number(taxConfig.gstPercent) : 5.0;
    const taxAmount = (subtotal * gstPercent) / 100;
    const totalAmount = subtotal + taxAmount;

    // 5. Create Order + OrderItems in DB and update table status to ORDER_PENDING transactionally
    const order = await OrderRepository.createOrderTransaction(
      {
        sessionId,
        customerId: userId,
        restaurantId,
        type: 'DINE_IN',
        status: 'RECEIVED',
        subtotal,
        taxAmount,
        totalAmount,
        notes,
      },
      orderItemsData,
      session.tableId
    );

    // 6. Map Decimal fields to numbers for JSON output
    const sanitizedOrder = {
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
    };

    // 7. Publish SSE events
    publish(`table:${sessionId}`, 'ORDER_RECEIVED', sanitizedOrder);
    publish(`restaurant:${restaurantId}`, 'NEW_ORDER', {
      orderId: order.id,
      tableNumber: session.table.number,
      floorName: session.table.floor.name,
      totalAmount: sanitizedOrder.totalAmount,
      items: sanitizedOrder.items,
    });

    return sanitizedOrder;
  }

  static async updateOrderStatus(userId: string, role: string, id: string, status: any) {
    // Fetch order
    const order = await OrderRepository.findOrderWithSession(id);
    if (!order) {
      throw new Error('Order not found');
    }

    // Verify staff role
    const isStaff = await OrderService.verifyStaffMember(userId, order.restaurantId);
    if (!isStaff && role !== 'ADMIN') {
      throw new Error('Forbidden: Insufficient privileges');
    }

    let newTableStatus: 'PREPARING' | 'READY' | 'SERVED' | null = null;
    if (order.session) {
      if (status === 'PREPARING') {
        newTableStatus = 'PREPARING';
      } else if (status === 'READY') {
        newTableStatus = 'READY';
      } else if (status === 'SERVED') {
        newTableStatus = 'SERVED';
      }
    }

    // Update order status
    const updatedOrder = await OrderRepository.updateOrderStatusAndTable(
      id,
      status,
      order.session ? order.session.tableId : null,
      newTableStatus
    );

    const sanitizedOrder = {
      ...updatedOrder,
      subtotal: Number(updatedOrder.subtotal),
      taxAmount: Number(updatedOrder.taxAmount),
      totalAmount: Number(updatedOrder.totalAmount),
      items: updatedOrder.items.map((item) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
        selectedModifiers: typeof item.selectedModifiers === 'string'
          ? JSON.parse(item.selectedModifiers)
          : item.selectedModifiers,
      })),
    };

    // Publish SSE update
    if (order.sessionId) {
      publish(`table:${order.sessionId}`, 'ORDER_STATUS_CHANGED', sanitizedOrder);
    }
    publish(`restaurant:${order.restaurantId}`, 'ORDER_STATUS_UPDATED', sanitizedOrder);

    return sanitizedOrder;
  }

  static async getRestaurantActiveOrders(userId: string, role: string, restaurantId: string) {
    const isStaff = await OrderService.verifyStaffMember(userId, restaurantId);
    if (!isStaff && role !== 'ADMIN') {
      throw new Error('Forbidden: Insufficient privileges');
    }

    const activeOrders = await OrderRepository.getActiveRestaurantOrders(restaurantId);

    return activeOrders.map((order) => ({
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
  }

  static async getCustomerOrderHistory(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      OrderRepository.getCustomerHistory(userId, skip, limit),
      OrderRepository.countCustomerOrders(userId),
    ]);

    const sanitizedOrders = orders.map((order) => ({
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
      orders: sanitizedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getOrderDetails(userId: string, role: string, id: string) {
    const order = await OrderRepository.findOrderWithItems(id);
    if (!order) {
      throw new Error('Order not found');
    }

    const isStaff = await OrderService.verifyStaffMember(userId, order.restaurantId);
    if (order.customerId !== userId && !isStaff && role !== 'ADMIN') {
      throw new Error('Forbidden: Unauthorized access to order details');
    }

    return {
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
    };
  }

  static async getOrderUpsellPrompts(userId: string, id: string) {
    const order = await OrderRepository.findOrderOnly(id);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.customerId !== userId) {
      throw new Error('Forbidden');
    }

    // Fetch active upsell configs
    const configs = await OrderRepository.findActiveUpsellConfigs(order.restaurantId);
    if (configs.length === 0) {
      return { prompts: [] };
    }

    const menuItemIds = configs
      .filter((c) => c.menuItemId)
      .map((c) => c.menuItemId as string);

    let suggestedItems: any[] = [];
    if (menuItemIds.length > 0) {
      const items = await OrderRepository.findMenuItemsByIds(menuItemIds);
      suggestedItems = items.map((item) => ({
        ...item,
        price: Number(item.price),
      }));
    }

    const prompts = configs.map((config) => ({
      id: config.id,
      triggerPhase: config.triggerPhase,
      promptText: config.promptText,
      suggestedItem: suggestedItems.find((i) => i.id === config.menuItemId) || null,
    }));

    return { prompts };
  }
}
