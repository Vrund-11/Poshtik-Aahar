import { Hono } from 'hono';
import { MenuService } from './menu.service';

const router = new Hono();

// GET /menus/:restaurantId/menu (Public endpoint with Redis caching)
router.get('/:restaurantId/menu', async (c) => {
  const restaurantId = c.req.param('restaurantId');

  try {
    const { data, cached } = await MenuService.getRestaurantMenu(restaurantId);
    return c.json({
      success: true,
      data,
      cached,
    });
  } catch (err: any) {
    c.status(404);
    return c.json({
      success: false,
      message: err.message,
    });
  }
});

export const menuRouter = router;
