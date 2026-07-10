import { db } from '@foodmart/database';

export class OrderRepository {
  static async findSessionWithTable(sessionId: string) {
    return db.tableSession.findUnique({
      where: { id: sessionId },
      include: {
        table: {
          include: {
            floor: {
              include: {
                branch: true,
              },
            },
          },
        },
      },
    });
  }

  static async findMenuItemsForRestaurant(menuItemIds: string[], restaurantId: string) {
    return db.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
        category: {
          menu: { restaurantId },
        },
        isAvailable: true,
      },
    });
  }

  static async findTaxConfig(restaurantId: string) {
    return db.taxConfig.findUnique({
      where: { restaurantId },
    });
  }

  static async createOrderTransaction(
    orderData: {
      sessionId: string;
      customerId: string;
      restaurantId: string;
      type: 'DINE_IN';
      status: 'RECEIVED';
      subtotal: number;
      taxAmount: number;
      totalAmount: number;
      notes?: string;
    },
    itemsData: Array<{
      menuItemId: string;
      name: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      notes?: string;
      selectedModifiers: string;
    }>,
    tableId: string
  ) {
    return db.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          ...orderData,
          items: {
            create: itemsData,
          },
        },
        include: {
          items: true,
        },
      });

      await tx.table.update({
        where: { id: tableId },
        data: { status: 'ORDER_PENDING' },
      });

      return newOrder;
    });
  }

  static async findOrderWithSession(id: string) {
    return db.order.findUnique({
      where: { id },
      include: {
        session: {
          include: {
            table: true,
          },
        },
        items: true,
      },
    });
  }

  static async findStaff(id: string) {
    return db.staff.findUnique({
      where: { id },
    });
  }

  static async updateOrderStatusAndTable(
    orderId: string,
    status: 'RECEIVED' | 'PREPARING' | 'READY' | 'SERVED' | 'DELIVERED' | 'CANCELLED',
    tableId: string | null,
    newTableStatus: 'PREPARING' | 'READY' | 'SERVED' | null
  ) {
    return db.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status },
        include: { items: true },
      });

      if (tableId && newTableStatus) {
        await tx.table.update({
          where: { id: tableId },
          data: { status: newTableStatus },
        });
      }

      return updatedOrder;
    });
  }

  static async getActiveRestaurantOrders(restaurantId: string) {
    return db.order.findMany({
      where: {
        restaurantId,
        status: {
          notIn: ['DELIVERED', 'CANCELLED'],
        },
      },
      include: {
        items: true,
        session: {
          include: {
            table: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  static async getCustomerHistory(customerId: string, skip: number, limit: number) {
    return db.order.findMany({
      where: { customerId },
      include: {
        items: {
          include: {
            menuItem: {
              select: { id: true, name: true, imageUrl: true, isVeg: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });
  }

  static async countCustomerOrders(customerId: string) {
    return db.order.count({
      where: { customerId },
    });
  }

  static async findOrderWithItems(id: string) {
    return db.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });
  }

  static async findOrderOnly(id: string) {
    return db.order.findUnique({
      where: { id },
      include: { items: true },
    });
  }

  static async findActiveUpsellConfigs(restaurantId: string) {
    return db.upsellConfig.findMany({
      where: {
        restaurantId,
        isActive: true,
      },
    });
  }

  static async findMenuItemsByIds(ids: string[]) {
    return db.menuItem.findMany({
      where: {
        id: { in: ids },
        isAvailable: true,
      },
    });
  }
}
