import { MenuRepository } from './menu.repository';
import { redis } from '../../config/redis';

export class MenuService {
  static async getRestaurantMenu(restaurantId: string) {
    const cacheKey = `menu:${restaurantId}`;

    // 1. Try reading from cache
    try {
      const cachedMenu = await redis.get(cacheKey);
      if (cachedMenu) {
        console.log(`[Cache] Serving menu for restaurant: ${restaurantId} from Redis`);
        return { data: JSON.parse(cachedMenu), cached: true };
      }
    } catch (err) {
      console.error('Redis cache read failed:', err);
    }

    // 2. Query DB
    const activeMenu = await MenuRepository.findActiveMenu(restaurantId);
    if (!activeMenu) {
      throw new Error('Active menu not found for this restaurant');
    }

    const categories = await MenuRepository.findCategoriesWithItems(activeMenu.id);

    // Sanitize and serialize Decimals and json modifiers
    const sanitizedMenu = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
      items: cat.items.map((item) => {
        let parsedModifiers = [];
        try {
          parsedModifiers = typeof item.modifiers === 'string'
            ? JSON.parse(item.modifiers)
            : (item.modifiers || []);
        } catch (e) {
          parsedModifiers = [];
        }
        return {
          id: item.id,
          name: item.name,
          description: item.description,
          price: Number(item.price),
          imageUrl: item.imageUrl,
          isVeg: item.isVeg,
          isAvailable: item.isAvailable,
          sortOrder: item.sortOrder,
          modifiers: parsedModifiers,
        };
      }),
    }));

    // 3. Cache the serialized menu in Redis (1 hour TTL)
    try {
      await redis.set(cacheKey, JSON.stringify(sanitizedMenu), 'EX', 3600);
      console.log(`[Cache] Cached menu for restaurant: ${restaurantId} in Redis`);
    } catch (err) {
      console.error('Redis cache write failed:', err);
    }

    return { data: sanitizedMenu, cached: false };
  }
}
