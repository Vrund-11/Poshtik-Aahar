import { Hono } from 'hono';
import { RestaurantService } from './restaurant.service';

const router = new Hono();

// ─────────────────────────────────────────────
// GET /restaurants (Discovery list — cached 6 hours)
// ─────────────────────────────────────────────
router.get('/', async (c) => {
  try {
    const { data, cached } = await RestaurantService.getDiscoveryList();
    return c.json({
      success: true,
      cached,
      data,
    });
  } catch (err: any) {
    c.status(500);
    return c.json({
      success: false,
      message: err.message,
    });
  }
});

// ─────────────────────────────────────────────
// GET /restaurants/:id (Detail — cached 1 hour)
// ─────────────────────────────────────────────
router.get('/:id', async (c) => {
  const id = c.req.param('id');

  try {
    const { data, cached } = await RestaurantService.getRestaurantDetail(id);
    return c.json({
      success: true,
      cached,
      data,
    });
  } catch (err: any) {
    c.status(404);
    return c.json({
      success: false,
      message: err.message,
    });
  }
});

export const restaurantRouter = router;
