# Product Requirements Document (PRD)
## Restaurant Experience OS — MVP
**Version:** 1.0  
**Location:** Ahmedabad, Gujarat  
**Stage:** MVP  
**Team:** 2 people (1 developer)  
**Last Updated:** June 2026

---

## 1. Overview

A platform that connects restaurants and customers through a single ecosystem. Reduces manual restaurant operations while improving customer experience through QR ordering, reservations, queue management, payments, and loyalty.

**North Star:** Make restaurant operations easier for staff and faster for customers.

---

## 2. MVP Scope

Only these features ship in MVP. Nothing else.

```
✅ Admin panel
✅ Restaurant onboarding
✅ Owner dashboard
✅ Manager dashboard
✅ Kitchen display
✅ Customer web app (QR based, no native app)
✅ QR table ordering
✅ Basic menu management
✅ Order lifecycle
✅ Table session with verification
✅ Basic loyalty points
✅ Takeaway ordering
✅ Queue management
✅ Reservations
✅ Complaint submission
✅ Basic analytics for owner
```

**Not in MVP:**
```
❌ Payment gateway (cash/UPI only, manager confirms)
❌ Universal loyalty network
❌ AI recommendations
❌ Social features
❌ Native mobile app
❌ Advanced analytics
❌ Membership subscriptions
❌ Multi-city expansion
```

---

## 3. Target Users

### 3.1 Customers
- Ahmedabad residents
- Age 18-45
- Comfortable with smartphones
- Expect fast, no-friction ordering
- **MVP auth:** Name + Phone + Email + Password
- **Scale auth:** Phone OTP (after growth)

### 3.2 Restaurant Partners
- 20 restaurants in Ahmedabad
- ~50 staff members (partners)
- Mix of casual dining and fast casual
- Not tech-heavy, need simple UI
- Roles: Owner, Manager, Chef

### 3.3 Admin
- Internal team only
- Full platform visibility
- Restaurant creation and management

---

## 4. User Roles and Capabilities

### Admin
```
Create restaurants
Assign plans and expiry
View all restaurants
Monitor revenue
Suspend/activate restaurants
View platform analytics
```

### Owner
```
Configure restaurant profile
Manage branches, floors, tables
Generate QR codes
Manage menu (categories, items, modifiers)
Create and manage staff accounts
Set tax rates
Configure loyalty rules
View revenue analytics
View complaints
```

### Manager
```
View real-time floor plan
Manage table states
Handle queue (add, call, seat)
Manage reservations
View and update all orders
Confirm payments
Close table sessions
```

### Chef
```
View incoming orders on KDS
Update order status
Mark orders ready
View order items and modifiers
```

### Customer
```
Register and login
Discover restaurants (Ahmedabad only for MVP)
Scan table QR code
Verify table session
Browse menu
Place dine-in orders
Track order status live
Request bill
Pay (cash or UPI, confirmed by manager)
Earn loyalty points
Place takeaway orders
Join walk-in queue
Make reservations
Submit complaints/reviews
View order history
```

---

## 5. Feature Requirements

### 5.1 Admin Panel

**Restaurant Creation**
- Fields: Restaurant name, owner name, phone, email, plan, expiry date
- Plans: Free Trial (30 days), Basic, Growth
- Status: Active, Trial, Expired, Suspended
- Auto-suspend on expiry

**Admin Dashboard Metrics**
- Total restaurants
- Active / Trial / Expired / Suspended count
- Total revenue (when billing added)
- Platform-wide order count

---

### 5.2 Authentication

**Customer**
- Register: Name, phone number, email, password
- Login: Email + password
- JWT in httpOnly cookie
- Access token: 15 min
- Refresh token: 30 days

**Staff (Owner, Manager, Chef)**
- Login: Email + password (set by owner)
- Same JWT cookie strategy
- Role encoded in JWT payload

---

### 5.3 Restaurant Setup (Owner)

**Branch Management**
- Add multiple branches
- Each branch has address, phone

**Floor Management**
- Add floors per branch
- Name each floor (Ground Floor, First Floor, Rooftop)

**Table Management**
- Add tables per floor
- Set table number and capacity
- Generate unique QR per table
- QR encodes: restaurantId, branchId, floorId, tableId

**Menu Management**
- Create categories
- Add items per category
- Fields per item: name, description, price, image, isVeg, isAvailable
- Modifiers: stored as JSON (e.g. spice level, size, add-ons)
- Sort order for categories and items

**Staff Management**
- Create staff: name, phone, email, password, role
- Roles: Manager, Chef
- Deactivate staff

**Tax Configuration**
- Set GST percentage per restaurant
- Applied automatically on bill

---

### 5.4 Table Session Flow

```
Customer scans QR
↓
System generates 3 random digit codes
↓
Customer sees all 3 codes on screen
↓
Manager sees the correct code on dashboard
↓
Manager asks customer verbally
↓
Customer taps correct code
↓
Backend verifies and creates session
↓
SSE stream opens for this session
↓
Customer can now browse and order
```

**Session States:**
```
PENDING_VERIFICATION
ACTIVE
BILL_REQUESTED
PAYMENT_PENDING
CLOSED
```

---

### 5.5 Order Lifecycle

**Dine-in Order Flow:**
```
Customer adds items to cart
↓
Reviews order
↓
Places order (HTTP POST)
↓
Order saved to DB
↓
SSE pushes to kitchen display
↓
SSE pushes to manager dashboard
↓
SSE pushes status back to customer
↓
Chef updates status
↓
Customer sees live updates
```

**Order Statuses:**
```
RECEIVED → PREPARING → READY → SERVED → DELIVERED
```

**Customer visible statuses:**
```
Order Received
Being Prepared
Ready
On Its Way
Delivered
```

**Multiple orders per session:**
Customer can place additional orders while session is active. All orders linked to same session and shown as running bill.

---

### 5.6 Table States (Manager Floor View)

```
AVAILABLE
SEATED
ORDER_PENDING
PREPARING
READY
SERVED
BILL_REQUESTED
PAYMENT_PENDING
COMPLETED
```

Color coding:
```
AVAILABLE      → Green
SEATED         → Blue
ORDER_PENDING  → Yellow
PREPARING      → Orange
READY          → Purple
SERVED         → Teal
BILL_REQUESTED → Red
PAYMENT_PENDING→ Red (darker)
COMPLETED      → Gray (resets to AVAILABLE)
```

---

### 5.7 Billing and Payment (MVP)

No payment gateway in MVP.

```
Customer taps "Request Bill"
↓
Manager sees BILL_REQUESTED on floor
↓
Manager goes to table
↓
Customer pays: Cash OR scans restaurant's own UPI QR
↓
Customer taps "I've Paid" in app
↓
Manager confirms payment in dashboard
↓
System closes session
↓
Loyalty points awarded
↓
SSE stream closed
```

---

### 5.8 Queue Management

**Receptionist/Manager adds to queue:**
- Name
- Phone number
- Party size

**Queue display:**
```
#1 Rahul (2 people) — 14 mins
#2 Priya (4 people) — 28 mins
#3 Amit (1 person)  — 35 mins
```

**When table is free:**
- Manager taps "Call Customer"
- Device opens phone dialer with customer number
- Manager calls manually
- Manager seats them and removes from queue

**No SMS for queue in MVP** — manual call only.

---

### 5.9 Reservations

```
Customer fills form:
→ Date
→ Time
→ Party size
→ Special requests (optional)
↓
Reservation saved as PENDING
↓
Restaurant receives notification (in-app)
↓
Restaurant calls customer to confirm
↓
Manager marks as CONFIRMED or CANCELLED
```

**Statuses:** PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW

---

### 5.10 Takeaway

```
Customer browses menu
↓
Adds items
↓
Places order
↓
Token number generated
↓
Pays at counter on pickup (MVP)
↓
Restaurant sees order in dashboard
↓
Chef updates status
↓
Customer sees live status in app
↓
Customer arrives and picks up
↓
Manager marks PICKED_UP
```

**Statuses:** RECEIVED, PREPARING, READY, PICKED_UP

All takeaway orders stored in database. Never localStorage.

---

### 5.11 Loyalty

```
₹100 spent = 1 point (configurable by owner)

After payment confirmed:
→ Points calculated
→ Added to customer wallet
→ Shown on customer profile

MVP: Earn only
Redeem in post-MVP
```

---

### 5.12 Complaints and Reviews

```
Customer submits complaint after order
→ Text input (English, Hindi, Gujarati supported)
→ Saved immediately to DB
→ Background job sends to Gemini API
→ Gemini returns: category, sentiment, language, summary, urgency
→ Admin and owner see categorized complaint

Categories:
FOOD_QUALITY, SERVICE, WAIT_TIME, BILLING,
CLEANLINESS, STAFF_BEHAVIOR, ORDER_ACCURACY, OTHER

Urgency: LOW, MEDIUM, HIGH, CRITICAL
```

---

### 5.13 Restaurant Discovery (MVP — Ahmedabad only)

```
Customer opens app
↓
Sees list of active restaurants in Ahmedabad
↓
Can view: name, photos, menu, ratings
↓
Google rating shown only (MVP)
↓
Can tap to: reserve, takeaway, or join queue
```

No map view in MVP. Simple list only.

---

## 6. Non-Functional Requirements

### Performance
- Menu load time: under 2 seconds
- Order placement to kitchen display: under 1 second
- QR scan to menu: under 3 seconds
- Table session verification: under 2 seconds

### Availability
- Target: 99% uptime
- Acceptable downtime: max 7 hours/month

### Security
- All passwords hashed with bcrypt (12 rounds)
- JWT in httpOnly cookies only
- No sensitive data in localStorage
- Input validation on every endpoint
- Rate limiting on OTP and auth endpoints

### Scalability (MVP targets)
- 10,000 registered customers
- 20 restaurants
- 50 staff accounts
- Peak: ~2,000 concurrent users on weekends

---

## 7. Success Metrics for MVP

```
Primary:
→ 20 restaurants onboarded
→ 10,000 customer registrations
→ 500+ orders processed per day at peak
→ Zero data loss incidents

Secondary:
→ Average order placement time under 2 minutes
→ Kitchen display update latency under 1 second
→ Manager session close time under 30 seconds after payment
→ Complaint categorization accuracy above 85%

Business:
→ At least 5 restaurants willing to pay after trial
→ Net Promoter Score above 7 from restaurant partners
```

---

## 8. Out of Scope (Explicitly)

```
Payment gateway integration
Universal loyalty across restaurants
AI-powered recommendations
Native iOS / Android app
Multi-city support
Social features
Influencer or referral programs
Advanced inventory management
Staff scheduling
Table booking deposits
```
