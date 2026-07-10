# App Flow Document
## Restaurant Experience OS — MVP
**Version:** 1.0  
**Last Updated:** June 2026

---

## Flow 1 — Admin

```
Admin logs in (email + password)
↓
Admin Dashboard
├── Total Restaurants
├── Active / Trial / Expired / Suspended count
└── Platform order count

Admin creates restaurant:
→ Restaurant Name
→ Owner Name
→ Phone
→ Email
→ Plan: Free Trial / Basic / Growth
→ Expiry Date
↓
System creates:
  Restaurant record
  Owner staff account
  Sends email with credentials to owner
↓
Owner logs into dashboard
```

**Restaurant status transitions:**
```
Created → TRIAL
Trial expires → EXPIRED (auto)
Admin activates → ACTIVE
Admin suspends → SUSPENDED
```

---

## Flow 2 — Owner Setup

```
Owner receives email with credentials
↓
Owner logs into dashboard (email + password)
↓
Owner completes restaurant setup:

Step 1: Restaurant Profile
→ Upload logo
→ Add description
→ Set cuisine type
→ Add address
→ Add photos

Step 2: Branch Setup
→ Add branch name
→ Add branch address
→ Add branch phone

Step 3: Floor Setup (per branch)
→ Add floor name (Ground Floor, Rooftop etc.)

Step 4: Table Setup (per floor)
→ Add table number
→ Set capacity
→ System generates QR automatically

Step 5: Menu Setup
→ Add categories (Starters, Mains, Drinks etc.)
→ Add items per category
→ Each item: name, price, description, image, isVeg
→ Add modifiers per item (Spice Level, Size etc.)

Step 6: Staff Setup
→ Add manager: name, email, phone, password
→ Add chef: name, email, phone, password
→ Staff receives email with credentials

Step 7: Tax Setup
→ Set GST percentage

Step 8: Loyalty Setup
→ Set points per ₹100 spent (default: 1)
→ Enable / disable loyalty
```

---

## Flow 3 — Manager Dashboard

```
Manager logs in
↓
Manager Dashboard (real-time)
├── Floor Plan (visual table grid)
├── Queue List
├── Today's Reservations
├── Active Orders
└── Recent Activity

Floor Plan shows all tables with color-coded states:
AVAILABLE      → Green
SEATED         → Blue
ORDER_PENDING  → Yellow
PREPARING      → Orange
READY          → Purple
SERVED         → Teal
BILL_REQUESTED → Red
PAYMENT_PENDING→ Dark Red
COMPLETED      → Gray

Manager actions per table:
→ View table details
→ View running orders
→ Update order status
→ Confirm payment
→ Close table (resets to AVAILABLE)
→ Manually add customer to table (without QR)
```

---

## Flow 4 — Customer Registration and Login

```
Customer opens app
↓
Register:
→ Full name
→ Phone number
→ Email address
→ Password
→ Confirm password
↓
Account created
JWT cookie set
↓
Redirected to home (restaurant discovery)

Login:
→ Email
→ Password
↓
JWT cookie set
↓
Redirected to last page or home
```

---

## Flow 5 — Restaurant Discovery

```
Customer opens app (logged in)
↓
Home screen shows:
→ List of active restaurants in Ahmedabad
→ Restaurant card shows:
   Name, cuisine type, photo, Google rating

Customer taps restaurant:
↓
Restaurant page shows:
→ Photos
→ About
→ Menu (browse only, no order yet)
→ Google rating
→ Options: Reserve | Takeaway | View Queue

MVP: Simple list, no map, no filters
```

---

## Flow 6 — Reservation

```
Customer taps Reserve on restaurant page
↓
Reservation form:
→ Date (calendar picker)
→ Time (available slots)
→ Party size
→ Special requests (optional)
↓
Submit
↓
Reservation created as PENDING
Customer sees: "Request sent. Restaurant will call you to confirm."
↓
Manager sees new reservation in dashboard
Manager calls customer
Manager marks: CONFIRMED or CANCELLED
↓
Customer sees updated status in app

Reservation statuses customer sees:
Pending → Waiting for restaurant
Confirmed → Your table is booked
Cancelled → Please try another time
```

---

## Flow 7 — Queue

```
Customer walks into restaurant
Receptionist / Manager adds to queue manually:
→ Customer name
→ Phone number
→ Party size
↓
Queue list updates:
#1 Rahul (2) — ~14 mins
#2 Priya (4) — ~28 mins
↓
When table becomes free:
Manager taps "Call" next to customer
→ Dialer opens with customer number
→ Manager calls manually
→ Manager seats customer
→ Manager removes from queue
```

---

## Flow 8 — QR Scan and Table Verification

```
Customer sits at table
Customer scans QR code on table
↓
App opens (or prompts login if not logged in)
↓
Backend generates 3 random 2-digit numbers
Example: [42] [17] [89]
↓
Customer sees all 3 numbers on screen:
"Which number did the staff show you?"

Manager sees on dashboard for this table:
"Verification code: 17"
Manager shows/tells customer "17"
↓
Customer taps 17
↓
Backend verifies
Session created
SSE stream opens for this session
↓
Customer lands on menu page
Restaurant name + table number shown at top
```

---

## Flow 9 — Dine-in Ordering

```
Customer browses menu
→ Categories shown horizontally
→ Items shown with photo, name, price, veg/non-veg
→ Tap item to expand (modifiers, add to cart)
↓
Customer adds items to cart
↓
Reviews cart:
→ Items list
→ Subtotal
→ GST
→ Total
↓
Places order
↓
Order saved to DB
SSE event → Kitchen display (NEW_ORDER)
SSE event → Manager dashboard (TABLE_STATE: ORDER_PENDING)
SSE event → Customer (ORDER_RECEIVED)
↓
Customer sees live status:
[✓] Order Received
[ ] Being Prepared
[ ] Ready
[ ] On Its Way
[ ] Delivered

Chef updates status on KDS
↓
Each update streams to customer instantly
```

**Multiple orders in same session:**
```
Customer can order again while session is active
Each order added to running bill
Customer sees all orders under "My Orders"
```

---

## Flow 10 — Kitchen Display System (KDS)

```
Chef logs in on tablet
↓
Kitchen Display shows columns:
┌──────────┬──────────┬──────────┬──────────┐
│   NEW    │ PREPARING│  READY   │  SERVED  │
├──────────┼──────────┼──────────┼──────────┤
│ Order #5 │ Order #3 │ Order #1 │ Order #0 │
│ Table 4  │ Table 7  │ Table 2  │ Table 9  │
│ Paneer   │ Dal Makh │ Butter   │ Veg Fried│
│ Tikka x2 │ ani x1   │ Chicken  │ Rice x1  │
│ Naan x3  │ Naan x2  │ x1       │          │
│ 3 mins   │ 12 mins  │ 18 mins  │ 25 mins  │
└──────────┴──────────┴──────────┴──────────┘

Chef taps order card to move to next column
Each move triggers SSE event to customer and manager
```

---

## Flow 11 — Upsell Prompt

```
After starter items delivered:
Customer sees prompt in app:
"Customers who ordered Paneer Tikka
 often add Butter Naan 🍞"
[Add Butter Naan — ₹45]  [No thanks]

After mains delivered:
"Would you like to add dessert?"
[View Desserts]  [No thanks]

Configurable by restaurant owner
Can be disabled per restaurant
```

---

## Flow 12 — Bill Request and Payment

```
Customer taps "Request Bill"
↓
Bill summary shown in app:
→ All orders in session
→ Item-wise breakdown
→ GST
→ Total amount
↓
SSE event → Manager: BILL_REQUESTED
Table turns Red on floor plan
↓
Manager goes to table
Customer pays:
  Option A: Cash to manager
  Option B: Scan restaurant's own UPI QR
↓
Customer taps "I've Paid" in app
↓
Manager sees payment claim on dashboard
Manager taps "Confirm Payment"
↓
Session marked CLOSED
Loyalty points calculated and added
SSE event → Customer: PAYMENT_CONFIRMED + points earned
SSE stream for this session closed
Table resets to AVAILABLE
```

---

## Flow 13 — Takeaway Order

```
Customer opens restaurant page
Taps Takeaway
↓
Browses menu
Adds items to cart
Reviews order + total amount shown
↓
Places order
Token number generated: #T045
↓
Customer sees:
Token: #T045
Status: Pending Verification
"Your order will be confirmed shortly"
↓
Manager / Receptionist sees new takeaway
order in dashboard with:
→ Token number
→ Customer name
→ Items list
→ Total amount
↓
Manager manually verifies
(calls customer if needed, same as reservation)
↓
Manager taps Accept Order
↓
SSE event → Customer: ORDER_CONFIRMED
Customer sees: Order Confirmed ✓
↓
Chef sees order on KDS (TAKEAWAY tag)
Chef updates status
↓
Customer sees live updates:
Confirmed → Preparing → Ready for Pickup
↓
Customer arrives at counter
Shows token number physically
↓
Manager collects payment (cash / UPI)
Manager taps Mark as Paid in dashboard
↓
Dashboard updates: PICKED_UP
Customer app shows: Order Complete 🎉
```

**Takeaway statuses:**
```
PENDING_VERIFICATION  → Waiting for manager to accept
CONFIRMED             → Manager accepted
PREPARING             → Chef started
READY                 → Ready for pickup
PICKED_UP             → Customer collected and paid
CANCELLED             → Manager rejected
```

---

## Flow 14 — Loyalty Points

```
After every completed payment:
↓
System calculates:
total_amount / 100 × loyalty_rate = points

Example:
₹450 bill ÷ 100 × 1 = 4.5 points (rounded to 4)
↓
Points added to customer wallet
Customer sees: "You earned 4 points! 🎉 Total: 47 points"
↓
Customer can view point history in profile
MVP: Earn only, no redemption yet
```

---

## Flow 15 — Complaint Submission

```
After order delivered or session closed:
Customer prompted: "How was your experience?"
↓
Customer can:
  Rate (1-5 stars)
  Write complaint/review (optional)
  Supports: English, Hindi, Gujarati
↓
Submit
↓
Saved to DB immediately (raw text)
↓
Background job → Gemini API
Returns: category, sentiment, language, summary, urgency
↓
Complaint updated in DB with analysis
↓
Owner sees in dashboard:
  Categorized complaints
  Filter by urgency, category, date
  Mark as resolved
```

---

## Flow 16 — Staff Auth Edge Cases

```
Token expiry handling:
Access token expires (15 min)
↓
Next API call returns 401
↓
Middleware catches it
Sends refresh token cookie automatically
↓
New access token issued
Request retried transparently
User never sees any interruption

Logout:
Staff taps logout
↓
Refresh token deleted from DB
Cookies cleared
Redirect to login
```

---

## Flow 17 — Restaurant Discovery to Action

```
Customer on restaurant page
Three entry points:

1. Reserve table
   → Goes to Flow 6 (Reservation)

2. Order takeaway
   → Goes to Flow 13 (Takeaway)

3. Walk in
   → Physical visit
   → Scan QR at table
   → Goes to Flow 8 (Table Verification)
   → Then Flow 9 (Ordering)
```

---

## SSE Event Reference

### Table Session Stream Events
```
CONNECTED           Session stream opened
ORDER_RECEIVED      Order placed by customer
ORDER_PREPARING     Chef started preparing
ORDER_READY         Food is ready
ORDER_SERVED        Food brought to table
ORDER_DELIVERED     All items delivered
BILL_GENERATED      Bill summary sent
PAYMENT_CONFIRMED   Payment confirmed by manager
SESSION_CLOSED      Session ended
```

### Restaurant Stream Events
```
CONNECTED           Restaurant stream opened
TABLE_VERIFIED      New customer verified at table
TABLE_STATE_CHANGED Table status updated
NEW_ORDER           New order placed (any table)
ORDER_STATUS_UPDATED Order status changed
BILL_REQUESTED      Customer requested bill
PAYMENT_RECEIVED    Manager confirmed payment
TABLE_CLOSED        Table session ended
NEW_RESERVATION     New reservation submitted
QUEUE_UPDATED       Queue list changed
```
