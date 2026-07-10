# Graph Report - foodmart  (2026-07-10)

## Corpus Check
- 144 files · ~154,872 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 457 nodes · 516 edges · 73 communities (58 shown, 15 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 31 edges
2. `OrderRepository` - 15 edges
3. `TableRepository` - 13 edges
4. `publish()` - 12 edges
5. `authMiddleware()` - 10 edges
6. `useSession()` - 10 edges
7. `OrderService` - 8 edges
8. `TableService` - 8 edges
9. `selectCartTotal()` - 7 edges
10. `rbacMiddleware()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `setRefreshTokenCookie()` --calls--> `setCookie()`  [INFERRED]
  backend/src/lib/cookie.ts → apps/user-app/app/lib/api.ts
- `runTests()` --calls--> `hashPassword()`  [INFERRED]
  backend/src/tests/test-auth.ts → prisma/seed.ts
- `QRLandingPage()` --calls--> `useSession()`  [INFERRED]
  apps/user-app/app/t/[code]/page.tsx → apps/user-app/app/context/SessionContext.tsx
- `DashboardShell()` --calls--> `useRestaurantStream()`  [INFERRED]
  apps/partner-app/app/layout.tsx → apps/partner-app/app/hooks/useRestaurantStream.ts
- `authenticate()` --calls--> `verifyAccessToken()`  [INFERRED]
  backend/src/modules/sse/sse.controller.ts → backend/src/lib/jwt.ts

## Communities (73 total, 15 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (7): handleSave(), useAuth(), handleSubmit(), onSubmit(), fetchStaff(), handleAddStaff(), handleToggleStaffActive()

### Community 1 - "Community 1"
Cohesion: 0.1
Nodes (12): QRLandingPage(), SessionProvider(), useSession(), useSessionOrders(), useTableStream(), handleReviewSubmit(), handleStarClick(), fetchOrders() (+4 more)

### Community 2 - "Community 2"
Cohesion: 0.13
Nodes (12): handlePlaceOrder(), useCart(), useMenu(), usePlaceOrder(), useRestaurant(), handleAddToCart(), handleAddToCartClick(), handleModifierToggle() (+4 more)

### Community 3 - "Community 3"
Cohesion: 0.1
Nodes (6): analyzeComplaint(), deleteFromR2(), uploadToR2(), validateImageMagicBytes(), authMiddleware(), rbacMiddleware()

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (5): getBranch(), getCuisine(), useLoyalty(), useOrderHistory(), useRestaurants()

### Community 5 - "Community 5"
Cohesion: 0.13
Nodes (5): handleCodeSelection(), handleVerify(), publish(), OrderService, TableService

### Community 6 - "Community 6"
Cohesion: 0.1
Nodes (7): useKitchenOrders(), useTakeawayOrders(), useUpdateOrderStatus(), fetchKitchenOrders(), handleUpdateStatus(), fetchOrders(), handleUpdateStatus()

### Community 7 - "Community 7"
Cohesion: 0.13
Nodes (13): getCookie(), removeCookie(), request(), setCookie(), clearRefreshTokenCookie(), setRefreshTokenCookie(), signAccessToken(), signRefreshToken() (+5 more)

### Community 8 - "Community 8"
Cohesion: 0.18
Nodes (9): DashboardShell(), RootLayout(), AuthProvider(), decodeJwt(), getCookie(), removeCookie(), setCookie(), CartProvider() (+1 more)

### Community 9 - "Community 9"
Cohesion: 0.17
Nodes (7): clearItemForm(), fetchMenu(), handleDeleteCategory(), handleDeleteItem(), handleSaveCategory(), handleSaveItem(), handleToggleItemAvailability()

### Community 11 - "Community 11"
Cohesion: 0.18
Nodes (4): useTables(), fetchTablesLayout(), handleConfirmPayment(), handleResetTable()

### Community 13 - "Community 13"
Cohesion: 0.24
Nodes (6): fetchBranches(), fetchFloors(), fetchTables(), handleAddBranch(), handleAddFloor(), handleAddTable()

### Community 14 - "Community 14"
Cohesion: 0.31
Nodes (4): fetchDetails(), handleResolve(), handleToggleMobileResolve(), handleUpdateSettings()

### Community 15 - "Community 15"
Cohesion: 0.31
Nodes (5): useQueue(), fetchQueue(), handleAddGuest(), handleCallGuest(), handleSeatGuest()

### Community 16 - "Community 16"
Cohesion: 0.32
Nodes (3): fetchReservations(), handleAddReservation(), handleUpdateStatus()

### Community 17 - "Community 17"
Cohesion: 0.38
Nodes (3): fetchComplaints(), getUrgencyColor(), handleResolve()

### Community 20 - "Community 20"
Cohesion: 0.43
Nodes (4): fetchDashboardData(), handleCreateRestaurant(), handleEditRestaurant(), handleQuickToggle()

### Community 21 - "Community 21"
Cohesion: 0.53
Nodes (4): fetchRestaurants(), handleCreateRestaurant(), handleEditRestaurant(), handleQuickToggle()

### Community 24 - "Community 24"
Cohesion: 0.5
Nodes (3): hashPassword(), main(), runTests()

## Knowledge Gaps
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAuth()` connect `Community 0` to `Community 1`, `Community 4`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 11`, `Community 13`, `Community 15`, `Community 16`, `Community 17`?**
  _High betweenness centrality (0.316) - this node is a cross-community bridge._
- **Why does `useSession()` connect `Community 1` to `Community 2`, `Community 19`, `Community 5`?**
  _High betweenness centrality (0.178) - this node is a cross-community bridge._
- **Why does `publish()` connect `Community 5` to `Community 3`, `Community 7`?**
  _High betweenness centrality (0.096) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `publish()` (e.g. with `.placeOrder()` and `.updateOrderStatus()`) actually correct?**
  _`publish()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._