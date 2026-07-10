import { db } from '@foodmart/database';

export class TableRepository {
  static async findUniqueTable(tableId: string) {
    return db.table.findUnique({
      where: { id: tableId },
      include: {
        floor: {
          include: {
            branch: {
              include: {
                restaurant: true,
              },
            },
          },
        },
      },
    });
  }

  static async findTableByQrCode(qrCode: string) {
    return db.table.findUnique({
      where: { qrCode },
      include: {
        floor: {
          include: {
            branch: {
              include: {
                restaurant: true,
              },
            },
          },
        },
      },
    });
  }

  static async createTableSession(data: {
    tableId: string;
    customerId: string;
    verifyCode: string;
    status: 'PENDING_VERIFICATION';
  }) {
    return db.tableSession.create({
      data,
    });
  }

  static async findSessionWithTable(id: string) {
    return db.tableSession.findUnique({
      where: { id },
      include: {
        table: {
          include: {
            floor: {
              include: {
                branch: {
                  include: {
                    restaurant: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  static async findActiveSessionByTable(tableId: string) {
    return db.tableSession.findFirst({
      where: {
        tableId,
        status: {
          not: 'CLOSED',
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async updateSessionStatus(id: string, status: 'ACTIVE' | 'BILL_REQUESTED' | 'PAYMENT_PENDING' | 'CLOSED') {
    return db.tableSession.update({
      where: { id },
      data: {
        status,
        ...(status === 'ACTIVE' ? { verifiedAt: new Date() } : {}),
      },
    });
  }

  static async updateTableStatus(id: string, status: any) {
    return db.table.update({
      where: { id },
      data: { status },
    });
  }

  static async getSessionWithDetails(id: string) {
    return db.tableSession.findUnique({
      where: { id },
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
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        orders: {
          include: {
            items: {
              include: {
                menuItem: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        payment: true,
      },
    });
  }

  static async getActiveSessionOrders(sessionId: string) {
    return db.order.findMany({
      where: {
        sessionId,
        status: { not: 'CANCELLED' },
      },
    });
  }

  static async getTaxConfig(restaurantId: string) {
    return db.taxConfig.findUnique({
      where: { restaurantId },
    });
  }

  static async findStaff(id: string) {
    return db.staff.findUnique({
      where: { id },
    });
  }

  static async closeSessionTransaction(
    sessionId: string,
    tableId: string,
    totalAmount: string | number,
    restaurantId: string,
    customerId: string,
    staffId: string
  ) {
    return db.$transaction(async (tx) => {
      // 1. Update table session to CLOSED
      await tx.tableSession.update({
        where: { id: sessionId },
        data: {
          status: 'CLOSED',
          closedAt: new Date(),
        },
      });

      // 2. Reset Table status to AVAILABLE
      await tx.table.update({
        where: { id: tableId },
        data: { status: 'AVAILABLE' },
      });

      // 3. Create SessionPayment record
      await tx.sessionPayment.create({
        data: {
          sessionId,
          totalAmount,
          method: 'UPI', // Default to UPI for confirmation
          status: 'CONFIRMED',
          confirmedAt: new Date(),
          confirmedBy: staffId,
        },
      });

      // 4. Calculate and award loyalty points
      const loyaltyConfig = await tx.loyaltyConfig.findUnique({
        where: { restaurantId },
      });

      if (loyaltyConfig && loyaltyConfig.isActive) {
        const rate = Number(loyaltyConfig.pointsPerHundred);
        const pointsEarned = (Number(totalAmount) / 100) * rate;

        if (pointsEarned > 0) {
          const loyaltyAccount = await tx.loyaltyAccount.upsert({
            where: { customerId },
            update: {
              totalPoints: { increment: pointsEarned },
            },
            create: {
              customerId,
              totalPoints: pointsEarned,
            },
          });

          await tx.loyaltyTransaction.create({
            data: {
              accountId: loyaltyAccount.id,
              restaurantId,
              points: pointsEarned,
              type: 'EARNED',
              description: `Earned from Dine-in Session #${sessionId}`,
            },
          });
        }
      }
    });
  }
}
