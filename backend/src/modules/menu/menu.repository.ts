import { db } from '@foodmart/database';

export class MenuRepository {
  static async findActiveMenu(restaurantId: string) {
    return db.menu.findFirst({
      where: {
        restaurantId,
        isActive: true,
      },
    });
  }

  static async findCategoriesWithItems(menuId: string) {
    return db.menuCategory.findMany({
      where: {
        menuId,
        isActive: true,
      },
      include: {
        items: {
          where: { isAvailable: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }
}
