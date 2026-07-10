import { Hono } from 'hono';
import { db } from '@foodmart/database';
import { authMiddleware } from '../../middleware/auth';

const router = new Hono();

// All loyalty endpoints require customer authentication
router.use('*', authMiddleware());

// ─────────────────────────────────────────────
// GET /loyalty/balance (Customer wallet balance)
// ─────────────────────────────────────────────
router.get('/balance', async (c) => {
  const user = c.get('user');

  const account = await db.loyaltyAccount.findUnique({
    where: { customerId: user.userId },
  });

  if (!account) {
    return c.json({
      success: true,
      data: {
        totalPoints: 0,
        message: 'No loyalty account yet. Points will be earned after your first payment.',
      },
    });
  }

  return c.json({
    success: true,
    data: {
      totalPoints: Number(account.totalPoints),
      updatedAt: account.updatedAt,
    },
  });
});

// ─────────────────────────────────────────────
// GET /loyalty/history (Customer transaction history)
// ─────────────────────────────────────────────
router.get('/history', async (c) => {
  const user = c.get('user');
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const skip = (page - 1) * limit;

  const account = await db.loyaltyAccount.findUnique({
    where: { customerId: user.userId },
  });

  if (!account) {
    return c.json({
      success: true,
      data: {
        transactions: [],
        totalPoints: 0,
        pagination: { page, limit, total: 0, totalPages: 0 },
      },
    });
  }

  const [transactions, total] = await Promise.all([
    db.loyaltyTransaction.findMany({
      where: { accountId: account.id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    db.loyaltyTransaction.count({
      where: { accountId: account.id },
    }),
  ]);

  const sanitizedTransactions = transactions.map((tx) => ({
    ...tx,
    points: Number(tx.points),
  }));

  return c.json({
    success: true,
    data: {
      transactions: sanitizedTransactions,
      totalPoints: Number(account.totalPoints),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

export const loyaltyRouter = router;
