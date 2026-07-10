# Implementation Plan
## Restaurant Experience OS — MVP
**Version:** 1.0
**Last Updated:** June 2026
**Developer:** Solo
**Total Estimated Duration:** 1-2 weeks

---

## Guiding Principles

```
1. Functional requirements first, non-functional later
2. Build and test each phase before moving to next
3. No premature optimization
4. Real restaurant usable at end of Phase 3
5. Every phase ends with a working, testable product slice
```

---

## Phase 0 — Project Foundation

**Duration:** 3–5 Days

**Goal:** Build a complete development foundation with all applications running locally before implementing any business features.

---

### Day 1 — Repository & Monorepo Setup

```text
[ ] Initialize Git repository

[ ] Initialize Turborepo

[ ] Create root package.json

[ ] Configure pnpm workspaces

[ ] Configure turbo.json

[ ] Configure shared tsconfig

[ ] Configure ESLint

[ ] Configure Prettier

[ ] Setup Husky + lint-staged

[ ] Create .gitignore

[ ] Create .env.example

[ ] Create README.md
```

---

### Day 2 — Project Structure

Create repository structure.

```text
[ ] apps/
      customer/
      dashboard/
      admin/

[ ] backend/
      src/
      prisma/
      tests/

[ ] packages/
      shared/
      database/

[ ] docs/
```

Create empty folders inside backend.

```text
[ ] src/

      config/

      middleware/

      modules/

      routes/

      services/

      repositories/

      validators/

      lib/

      helpers/

      events/

      sse/

      types/
```

Create shared package.

```text
[ ] packages/shared/src/

      constants/

      enums/

      types/

      validators/

      utils/
```

---

### Day 3 — Backend Foundation

```text
[ ] Install Hono

[ ] Install TypeScript

[ ] Configure tsconfig

[ ] Setup Hono application

[ ] Create health endpoint

[ ] Configure global error handler

[ ] Configure logger

[ ] Setup environment loader

[ ] Configure CORS

[ ] Configure cookie middleware

[ ] Configure request logging

[ ] Configure API versioning (/api/v1)

[ ] Create route loader

[ ] Test using Postman / Bruno
```

---

### Day 4 — Database Foundation

```text
[ ] Create Supabase PostgreSQL project

[ ] Install Prisma

[ ] Initialize Prisma

[ ] Create base schema

[ ] Generate Prisma Client

[ ] Run initial migration

[ ] Test database connection

[ ] Create seed.ts

[ ] Test seed execution
```

---

### Day 5 — Frontend Foundation

Customer App

```text
[ ] Create Next.js project

[ ] Install TailwindCSS

[ ] Install Zustand

[ ] Install TanStack Query

[ ] Install React Hook Form

[ ] Install Zod

[ ] Configure layouts

[ ] Configure routing

[ ] Configure API client

[ ] Create loading page

[ ] Create error page
```

Dashboard

```text
[ ] Create Next.js project

[ ] Install TailwindCSS

[ ] Install Zustand

[ ] Install TanStack Query

[ ] Configure dashboard layout

[ ] Configure protected layout

[ ] Configure sidebar

[ ] Configure API client
```

Admin

```text
[ ] Create Next.js project

[ ] Configure same stack as Dashboard

[ ] Create admin layout
```

---

### Shared Packages

```text
[ ] shared/

      enums

      constants

      types

      validators

      utilities

[ ] database/

      Prisma Client export

      Database helpers
```

---

### Authentication Foundation

(No authentication APIs yet)

```text
[ ] JWT utility

[ ] Password hashing utility

[ ] Cookie helper

[ ] Auth middleware

[ ] RBAC middleware
```

---

### Real-Time Foundation

(No live features yet)

```text
[ ] SSE helper

[ ] Event publisher

[ ] Event manager

[ ] Connection registry
```

---

### Storage Foundation

```text
[ ] Configure Cloudinary

[ ] Upload helper

[ ] Delete helper

[ ] Image validation helper
```

---

### Development Tooling

```text
[ ] Configure npm scripts

[ ] dev

[ ] build

[ ] lint

[ ] typecheck

[ ] test

[ ] prisma generate

[ ] prisma migrate

[ ] prisma seed
```

---

### Phase 0 Deliverables

```text
✓ Repository initialized

✓ Monorepo configured

✓ Customer app running

✓ Dashboard running

✓ Admin running

✓ Backend running

✓ PostgreSQL connected

✓ Prisma working

✓ Shared packages compiling

✓ Health endpoint working

✓ API client configured

✓ Project folder structure finalized

✓ Ready to start Authentication
```

---

### Phase 0 Acceptance Criteria

```text
✓ pnpm dev starts every application successfully

✓ Backend available on localhost

✓ All frontend applications load correctly

✓ Database connection succeeds

✓ Prisma migrations execute successfully

✓ Shared packages build without errors

✓ No TypeScript errors

✓ No ESLint errors

✓ Health endpoint returns HTTP 200

✓ Repository is ready for Phase 1 (Authentication)
```

## Phase 1 — Auth
**Duration:** 4-5 days
**Goal:** All user types can register and log in securely

### Tasks

**Customer Auth**
```
[ ] POST /api/v1/auth/customer/register
    → Validate: name, phone, email, password
    → Check duplicate email/phone
    → Hash password (bcrypt + pepper)
    → Create customer record
    → Issue JWT pair
    → Set refresh token in httpOnly cookie
    → Return access token

[ ] POST /api/v1/auth/customer/login
    → Validate credentials
    → Verify password
    → Issue JWT pair
    → Set cookie

[ ] POST /api/v1/auth/customer/logout
    → Delete refresh token from DB
    → Clear cookie

[ ] POST /api/v1/auth/customer/refresh
    → Read refresh token from cookie
    → Verify against DB
    → Issue new access token
    → Rotate refresh token

[ ] Customer register page (UI)
[ ] Customer login page (UI)
[ ] Auth redirect logic
[ ] Persist access token in Zustand
```

**Staff Auth**
```
[ ] POST /api/v1/auth/staff/login
[ ] POST /api/v1/auth/staff/logout
[ ] POST /api/v1/auth/staff/refresh
[ ] Staff login page (UI — dashboard app)
[ ] Role-based redirect after login
    OWNER   → /owner/dashboard
    MANAGER → /manager/floor
    CHEF    → /kitchen/display
    ADMIN   → /admin/restaurants
```

**Password Reset (Owner only)**
```
[ ] POST /api/v1/auth/forgot-password
    → Find owner by email
    → Generate crypto.randomBytes(32) token
    → Hash and store in DB with 5 min expiry
    → Send reset email via Resend

[ ] POST /api/v1/auth/reset-password
    → Validate token
    → Check expiry (reject if > 5 min)
    → Update password
    → Delete token from DB
    → Force re-login

[ ] Forgot password page (UI)
[ ] Reset password page (UI)
```

**Admin Auth**
```
[ ] Seed first admin account (manual DB insert)
[ ] Admin uses same staff login endpoint
    with role ADMIN in JWT
```

**Phase 1 Done When:**
```
✓ Customer can register and log in
✓ Staff can log in with email + password
✓ JWT cookies set correctly (httpOnly)
✓ Refresh token rotation works
✓ Owner password reset email arrives
✓ Reset link expires after 5 minutes
✓ Role-based redirects work
✓ Logout clears session properly
```

---

## Phase 2 — Admin + Restaurant Setup
**Duration:** 5-6 days
**Goal:** Admin can create restaurants, owner can set up their restaurant fully

### Tasks

**Admin Panel**
```
[ ] GET  /api/v1/admin/restaurants       (list with filters)
[ ] POST /api/v1/admin/restaurants       (create restaurant + owner account)
[ ] PATCH /api/v1/admin/restaurants/:id  (update plan/status)
[ ] GET  /api/v1/admin/analytics         (basic counts)

[ ] Admin dashboard UI
[ ] Restaurant list with status badges
[ ] Create restaurant form
[ ] Auto-suspend on plan expiry (cron job or check on login)
```

**Owner — Restaurant Profile**
```
[ ] PATCH /api/v1/owner/profile
[ ] POST  /api/v1/owner/photos          (upload to R2, max 5)
[ ] DELETE /api/v1/owner/photos/:id

[ ] R2 upload utility
[ ] Image validation (type, size, magic bytes)
[ ] Profile setup page (UI)
[ ] Photo upload with preview (UI)
```

**Owner — Branch / Floor / Table**
```
[ ] CRUD /api/v1/owner/branches
[ ] CRUD /api/v1/owner/branches/:id/floors
[ ] CRUD /api/v1/owner/floors/:id/tables
[ ] POST /api/v1/owner/tables/:id/qr    (generate QR)
[ ] QR generation (qrcode library, client-side)

[ ] Branch management UI
[ ] Floor management UI
[ ] Table grid UI with QR download button
```

**Owner — Menu**
```
[ ] CRUD /api/v1/owner/menus/categories
[ ] CRUD /api/v1/owner/menus/items
[ ] PATCH /api/v1/owner/menus/items/:id/availability
[ ] Image upload for menu items (R2)

[ ] Category management UI (drag to reorder)
[ ] Menu item form with modifier builder
[ ] Toggle availability switch
```

**Owner — Staff**
```
[ ] POST   /api/v1/owner/staff          (create, send email with credentials)
[ ] GET    /api/v1/owner/staff
[ ] PATCH  /api/v1/owner/staff/:id
[ ] DELETE /api/v1/owner/staff/:id      (deactivate, not delete)

[ ] Staff list UI
[ ] Create staff modal
```

**Owner — Tax + Loyalty Config**
```
[ ] PATCH /api/v1/owner/tax
[ ] PATCH /api/v1/owner/loyalty

[ ] Tax settings UI
[ ] Loyalty settings UI
```

**Phase 2 Done When:**
```
✓ Admin creates a restaurant from panel
✓ Owner email arrives with credentials
✓ Owner logs in and completes full setup
✓ Menu with categories and items created
✓ Tables created with QR codes downloadable
✓ Staff accounts created (manager + chef)
✓ Manager and chef can log in
```

---

## Phase 3 — Core Dine-in Flow
**Duration:** 8-10 days
**Goal:** Complete QR → order → kitchen → bill → payment cycle working

### Tasks

**QR Scan + Session**
```
[ ] POST /api/v1/sessions/initiate
    → Validate QR params (restaurantId, branchId, floorId, tableId)
    → Check table is AVAILABLE
    → Generate 3 random 2-digit codes
    → Cache correct code in Redis (5 min TTL)
    → Create session record (PENDING_VERIFICATION)
    → Return all 3 codes to customer

[ ] POST /api/v1/sessions/verify
    → Customer submits chosen code
    → Compare with Redis cached code
    → On match: mark session ACTIVE, update table to SEATED
    → Open SSE stream for this session
    → Return session details + menu

[ ] QR scanner page (UI — customer)
[ ] Code selection screen (3 buttons UI)
[ ] On verify success → redirect to menu
```

**Menu Display**
```
[ ] GET /api/v1/restaurants/:id/menu
    → Cache in Redis (1 hour TTL)
    → Invalidate on owner menu update

[ ] Menu page (UI — customer)
    → Category tabs horizontal
    → Item cards with photo, name, price, veg badge
    → Item detail modal (modifiers, quantity)
    → Add to cart
    → Cart drawer / bottom sheet
    → Cart review with total + GST
```

**Order Placement**
```
[ ] POST /api/v1/orders
    → Validate session is ACTIVE
    → Validate all menu items exist and available
    → Calculate subtotal, tax, total
    → Create Order + OrderItems in DB
    → Update table status → ORDER_PENDING
    → Publish SSE: table stream → ORDER_RECEIVED
    → Publish SSE: restaurant stream → NEW_ORDER
    → Return order

[ ] Order confirmation screen (UI — customer)
[ ] Live order status tracker (UI — customer)
    → Progress steps UI
    → SSE subscription hook
```

**Kitchen Display**
```
[ ] GET /sse/restaurant/:restaurantId
    → Staff auth required
    → SSE stream for all restaurant events

[ ] Kitchen display (UI — dashboard)
    → 4 columns: NEW, PREPARING, READY, SERVED
    → Order cards with items, table number, timer
    → Drag or tap to move between columns
    → Sound alert on new order

[ ] PATCH /api/v1/orders/:id/status
    → Chef updates status
    → Publish SSE: restaurant stream + table stream
    → Update table state accordingly
```

**Manager Floor Plan**
```
[ ] GET /sse/restaurant/:restaurantId (same stream, filtered by role)

[ ] Floor plan (UI — dashboard/manager)
    → Visual grid of tables
    → Color-coded by status
    → Click table to see details + orders
    → Real-time updates via SSE

[ ] Order list view (UI — dashboard/manager)
    → All active orders
    → Filter by status
```

**Billing + Payment**
```
[ ] POST /api/v1/sessions/:id/request-bill
    → Update session → BILL_REQUESTED
    → Update table → BILL_REQUESTED
    → Publish SSE: manager gets notified
    → Return full bill breakdown

[ ] POST /api/v1/sessions/:id/customer-paid
    → Customer claims they paid
    → Update session → PAYMENT_PENDING

[ ] POST /api/v1/sessions/:id/confirm-payment
    → Manager confirms (staff auth)
    → Update session → CLOSED
    → Update table → AVAILABLE
    → Calculate loyalty points
    → Add to LoyaltyAccount
    → Publish SSE: SESSION_CLOSED to customer

[ ] Bill screen (UI — customer)
[ ] Payment method selector (Cash / UPI — info only)
[ ] "I've Paid" button
[ ] Payment confirmed screen + points earned

[ ] Bill request indicator on manager floor (UI)
[ ] Confirm payment button on table detail (UI)
```

**Phase 3 Done When:**
```
✓ Customer scans QR, verifies, sees menu
✓ Customer places order, chef sees it on KDS instantly
✓ Chef moves order through statuses, customer sees updates
✓ Customer requests bill, manager sees alert
✓ Manager confirms payment, session closes
✓ Loyalty points show on customer profile
✓ Table resets to Available on floor plan
```

---

## Phase 4 — Queue, Reservations, Takeaway
**Duration:** 6-7 days
**Goal:** All three secondary flows working

### Tasks

**Queue**
```
[ ] POST   /api/v1/queue/:branchId      (add customer)
[ ] GET    /api/v1/queue/:branchId      (list with positions)
[ ] PATCH  /api/v1/queue/:id/call       (mark called)
[ ] PATCH  /api/v1/queue/:id/seat       (mark seated, remove from list)
[ ] DELETE /api/v1/queue/:id            (remove)
[ ] Auto-recalculate positions on remove

[ ] Queue management UI (manager)
[ ] Add to queue modal
[ ] Estimated wait time display (party count × avg service time)
[ ] Call button (opens phone dialer via tel: link)
```

**Reservations**
```
[ ] POST   /api/v1/reservations         (customer creates)
[ ] GET    /api/v1/reservations         (manager views, filter by date)
[ ] PATCH  /api/v1/reservations/:id/status

[ ] Reservation form (UI — customer)
    → Date picker
    → Time slot selector
    → Party size
    → Notes
    → Submit → show pending message

[ ] Reservation list (UI — manager)
[ ] Confirm / Cancel buttons
[ ] Today's reservations widget on manager home
```

**Takeaway**
```
[ ] POST   /api/v1/takeaway             (customer places order)
    → Status: PENDING_VERIFICATION
    → SSE to manager: NEW_TAKEAWAY

[ ] PATCH  /api/v1/takeaway/:id/accept  (manager verifies + accepts)
    → Status: CONFIRMED
    → SSE to customer: ORDER_CONFIRMED
    → Forward to kitchen

[ ] PATCH  /api/v1/takeaway/:id/reject  (manager rejects)
    → Status: CANCELLED
    → SSE to customer: ORDER_CANCELLED

[ ] PATCH  /api/v1/takeaway/:id/paid    (manager marks paid + picked up)
    → Status: PICKED_UP
    → SSE to customer: ORDER_COMPLETE

[ ] Takeaway order page (UI — customer)
    → Same menu browse as dine-in
    → Order placed → waiting screen with token

[ ] Takeaway live status (UI — customer)
    → Status steps with SSE updates

[ ] Takeaway dashboard (UI — manager)
    → Pending verification list
    → Active takeaway orders
    → Accept / Reject buttons
    → Mark Paid button
```

**Phase 4 Done When:**
```
✓ Manager adds customer to queue, calls them via dialer
✓ Customer submits reservation, manager confirms/cancels
✓ Customer places takeaway, manager verifies and accepts
✓ Chef sees takeaway on KDS
✓ Customer tracks takeaway status live
✓ Manager marks takeaway paid, customer sees completion
```

---

## Phase 5 — Discovery, Loyalty, Complaints
**Duration:** 4-5 days
**Goal:** Customer-facing discovery and loyalty working, complaints analyzed

### Tasks

**Restaurant Discovery**
```
[ ] GET /api/v1/restaurants
    → List active restaurants
    → Cache in Redis (6 hours)

[ ] GET /api/v1/restaurants/:id
    → Restaurant detail + photos
    → Cache in Redis (1 hour)

[ ] Discovery home (UI — customer)
[ ] Restaurant detail page (UI)
    → Photos, description, menu preview
    → Action buttons: Reserve, Takeaway
```

**Loyalty**
```
[ ] Points auto-calculated on payment confirm (already in Phase 3)
[ ] GET /api/v1/loyalty/balance         (customer wallet)
[ ] GET /api/v1/loyalty/history         (transaction history)

[ ] Loyalty wallet page (UI — customer)
[ ] Points earned notification after payment
```

**Complaints**
```
[ ] POST /api/v1/complaints
    → Save raw text immediately
    → Return 201 instantly
    → Trigger background Gemini analysis

[ ] Background job: analyzeComplaint.ts
    → Call Gemini API
    → Parse response (category, sentiment, language, summary, urgency)
    → Update complaint record

[ ] Complaint form (UI — customer, after order)
[ ] 1-5 star rating + text input
[ ] Multilingual placeholder text (EN/HI/GU)

[ ] Complaints list (UI — owner dashboard)
    → Filter by category, urgency, resolved
    → Mark resolved button
```

**Phase 5 Done When:**
```
✓ Customer sees restaurant list and detail
✓ Loyalty points show on customer wallet
✓ Customer submits complaint, gets instant confirmation
✓ Complaint analyzed by Gemini within 30 seconds
✓ Owner sees categorized complaint in dashboard
```

---

## Phase 6 — Owner Analytics + Polish
**Duration:** 3-4 days
**Goal:** Owner has useful analytics, overall product is stable

### Tasks

**Owner Analytics**
```
[ ] GET /api/v1/owner/analytics
    → Today's orders
    → Today's revenue
    → Total customers (unique)
    → Top 5 dishes
    → Orders by hour (for today)
    → All computed from existing DB data

[ ] Analytics dashboard (UI — owner)
    → Revenue card
    → Orders card
    → Top dishes list
    → Hourly orders bar chart
```

**Upsell Prompts**
```
[ ] CRUD /api/v1/owner/upsell-configs
[ ] Trigger in customer app after SERVED status
[ ] Upsell config UI (owner)
[ ] Upsell prompt display (UI — customer)
```

**Order History (Customer)**
```
[ ] GET /api/v1/orders/history          (customer's past orders)
[ ] Order history page (UI — customer)
[ ] Reorder button (pre-fills cart)
```

**Polish**
```
[ ] Loading states on all async operations
[ ] Error states with retry
[ ] Empty states (no orders, no queue etc.)
[ ] Form validation error messages
[ ] Toast notifications for key actions
[ ] Mobile responsive check on all pages
[ ] 404 and 500 error pages
```

**Phase 6 Done When:**
```
✓ Owner sees meaningful analytics
✓ Customer sees order history
✓ All loading/error/empty states handled
✓ Product is mobile-friendly
✓ Ready for real restaurant testing
```

---

## Phase Timeline Summary

```
Phase 0 — Setup           Days 1-4       (4 days)
Phase 1 — Auth            Days 5-9       (5 days)
Phase 2 — Restaurant Setup Days 10-15    (6 days)
Phase 3 — Core Dine-in    Days 16-25     (10 days)
Phase 4 — Queue/Res/Take  Days 26-32     (7 days)
Phase 5 — Discovery/Loyal Days 33-37     (5 days)
Phase 6 — Analytics/Polish Days 38-41   (4 days)
──────────────────────────────────────────────────
Total                                    ~41 working days
                                         ~8-9 weeks
```

---

## Dependencies Between Phases

```
Phase 0 must complete before anything
Phase 1 (Auth) before Phase 2 (Setup)
Phase 2 (Restaurant data) before Phase 3 (Ordering)
Phase 3 (Core flow) before Phase 5 (Loyalty, since points need payments)
Phase 4 is mostly independent after Phase 2
Phase 6 depends on all previous phases
```

---

## Risk Log

```
Risk 1: Prisma schema changes mid-development
Mitigation: Plan schema fully before Phase 1
            Migration files tracked in git

Risk 2: SSE connection drops not handled
Mitigation: EventSource auto-reconnects
            Test disconnect scenarios in Phase 3

Risk 3: Redis not running locally
Mitigation: Fail gracefully when Redis unavailable
            Log warning, serve uncached data

Risk 4: Gemini API response format inconsistent
Mitigation: Wrap in try/catch
            Save raw response for debugging
            Mark complaint as unanalyzed, retry later

Risk 5: R2 upload fails
Mitigation: Return error clearly to owner
            Never store partial upload URL
```
