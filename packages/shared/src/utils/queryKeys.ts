// Centralized React Query key factory.
// Every key includes its scoping ID to prevent cross-entity cache collisions.
// Usage: queryKeys.menu('abc123') → ['menu', 'abc123']

export const queryKeys = {
  // ─── Customer App ───────────────────────────
  menu:           (restaurantId: string) => ['menu', restaurantId] as const,
  session:        (sessionId: string)    => ['session', sessionId] as const,
  sessionOrders:  (sessionId: string)    => ['orders', sessionId] as const,
  restaurants:    (filters?: Record<string, string>) => ['restaurants', filters] as const,
  restaurant:     (id: string)           => ['restaurant', id] as const,
  loyalty:        (customerId: string)   => ['loyalty', customerId] as const,
  orderHistory:   (customerId: string)   => ['order-history', customerId] as const,

  // ─── Partner App ────────────────────────────
  kitchenOrders:  (restaurantId: string) => ['kitchen-orders', restaurantId] as const,
  tables:         (branchId: string)     => ['tables', branchId] as const,
  queue:          (branchId: string)     => ['queue', branchId] as const,
  reservations:   (branchId: string)     => ['reservations', branchId] as const,
  analytics:      (restaurantId: string) => ['analytics', restaurantId] as const,
  staff:          (restaurantId: string) => ['staff', restaurantId] as const,
  ownerProfile:   ()                     => ['owner-profile'] as const,
  branches:       (restaurantId: string) => ['branches', restaurantId] as const,
  menuCategories: (menuId: string)       => ['menu-categories', menuId] as const,
  menuItems:      (categoryId: string)   => ['menu-items', categoryId] as const,
  takeawayOrders: (restaurantId: string) => ['takeaway-orders', restaurantId] as const,

  // ─── Admin App ──────────────────────────────
  adminAnalytics:    () => ['admin-analytics'] as const,
  adminRestaurants:  (filters?: Record<string, string>) => ['admin-restaurants', filters] as const,
  adminCustomers:    (search?: string) => ['admin-customers', search] as const,
  adminComplaints:   (filters?: Record<string, string>) => ['admin-complaints', filters] as const,
} as const;
