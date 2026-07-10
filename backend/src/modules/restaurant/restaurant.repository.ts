import { db } from '@foodmart/database';

export class RestaurantRepository {
  static async findActiveRestaurants() {
    return db.restaurant.findMany({
      where: {
        status: {
          in: ['ACTIVE', 'TRIAL'],
        },
      },
      include: {
        branches: {
          where: { isActive: true },
        },
        photos: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  static async findUniqueActiveRestaurant(id: string) {
    return db.restaurant.findUnique({
      where: { id },
      include: {
        branches: {
          where: { isActive: true },
        },
        photos: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }
}
