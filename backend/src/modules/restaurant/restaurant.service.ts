import { RestaurantRepository } from './restaurant.repository';
import { redis } from '../../config/redis';

const DISCOVERY_LIST_TTL = 6 * 60 * 60; // 6 hours
const RESTAURANT_DETAIL_TTL = 60 * 60;  // 1 hour

export class RestaurantService {
  static async getDiscoveryList() {
    // Check Redis cache
    try {
      const cached = await redis.get('discovery:list');
      if (cached) {
        console.log('[Cache] Serving discovery list from Redis cache');
        return { data: JSON.parse(cached), cached: true };
      }
    } catch (err) {
      console.error('[Cache] Redis read error for discovery list:', err);
    }

    const restaurants = await RestaurantRepository.findActiveRestaurants();

    // Cache in Redis
    try {
      await redis.set('discovery:list', JSON.stringify(restaurants), 'EX', DISCOVERY_LIST_TTL);
      console.log('[Cache] Cached discovery list in Redis (6h TTL)');
    } catch (err) {
      console.error('[Cache] Redis write error for discovery list:', err);
    }

    return { data: restaurants, cached: false };
  }

  static async getRestaurantDetail(id: string) {
    // Check Redis cache
    try {
      const cached = await redis.get(`restaurant:${id}`);
      if (cached) {
        console.log(`[Cache] Serving restaurant ${id} from Redis cache`);
        return { data: JSON.parse(cached), cached: true };
      }
    } catch (err) {
      console.error(`[Cache] Redis read error for restaurant ${id}:`, err);
    }

    const restaurant = await RestaurantRepository.findUniqueActiveRestaurant(id);
    if (!restaurant || !['ACTIVE', 'TRIAL'].includes(restaurant.status)) {
      throw new Error('Restaurant not found or inactive');
    }

    // Cache in Redis
    try {
      await redis.set(`restaurant:${id}`, JSON.stringify(restaurant), 'EX', RESTAURANT_DETAIL_TTL);
      console.log(`[Cache] Cached restaurant ${id} in Redis (1h TTL)`);
    } catch (err) {
      console.error(`[Cache] Redis write error for restaurant ${id}:`, err);
    }

    return { data: restaurant, cached: false };
  }
}
