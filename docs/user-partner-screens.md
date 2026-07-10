# Screens Document
## Restaurant Experience OS — MVP
**For:** Lovable frontend generation
**Version:** 1.0
**Last Updated:** June 2026

---

## How to Read This Document

Each screen has:
- **Route** — the URL path
- **Who sees it** — which user type
- **Layout** — mobile / desktop / both
- **Components** — every visible element on the screen
- **States** — loading, empty, error, success variations
- **Actions** — what buttons/interactions do

---

## PRODUCT 1 — CUSTOMER WEB APP
**Device:** Mobile first (customers use phones)
**Base URL:** app.domain.com

---

### SCREEN C-01 — Register
**Route:** /register
**Who:** New customer
**Layout:** Mobile

**Components:**
- App logo + name at top center
- Heading: "Create your account"
- Input: Full Name (text)
- Input: Phone Number (tel, Indian format)
- Input: Email Address (email)
- Input: Password (password, show/hide toggle)
- Input: Confirm Password (password, show/hide toggle)
- Button: "Create Account" (primary, full width)
- Divider: "Already have an account?"
- Link: "Login" (navigates to C-02)

**States:**
- Default: all fields empty
- Loading: button shows spinner, disabled
- Error: inline field errors below each invalid input (red text)
- Duplicate email: "This email is already registered. Login instead?"
- Success: redirect to C-03 (home)

**Validations shown inline:**
- Name: required
- Phone: 10 digits, starts with 6-9
- Email: valid format
- Password: min 8 chars
- Confirm password: must match

---

### SCREEN C-02 — Login
**Route:** /login
**Who:** Returning customer
**Layout:** Mobile

**Components:**
- App logo + name at top center
- Heading: "Welcome back"
- Input: Email Address
- Input: Password (show/hide toggle)
- Button: "Login" (primary, full width)
- Divider line
- Link: "Don't have an account? Register" (navigates to C-01)

**States:**
- Default
- Loading: spinner on button
- Error: "Invalid email or password" (banner below form, red)
- Success: redirect to C-03

---

### SCREEN C-03 — Home / Restaurant Discovery
**Route:** /
**Who:** Logged-in customer
**Layout:** Mobile

**Components:**
- Top bar:
  - App logo (left)
  - Greeting: "Hey, [Name] 👋" (center or left)
  - Profile avatar/icon (right, taps to C-14)
- Search bar: "Search restaurants..." (static in MVP, no search logic)
- Section heading: "Restaurants in Ahmedabad"
- Restaurant cards list (vertical scroll):
  - Each card contains:
    - Restaurant photo (full width, 16:9, from R2 or placeholder)
    - Restaurant name (bold)
    - Cuisine type (gray text)
    - Google rating: ⭐ 4.3 (if available)
    - Status badge: Open / Closed
- Bottom navigation bar:
  - Home (active)
  - Orders (navigates to C-13)
  - Loyalty (navigates to C-15)
  - Profile (navigates to C-14)

**States:**
- Loading: skeleton cards (3-4 placeholder cards)
- Empty: "No restaurants available right now"
- Error: "Failed to load. Tap to retry"
- Populated: list of restaurant cards

---

### SCREEN C-04 — Restaurant Detail
**Route:** /restaurant/[id]
**Who:** Logged-in customer
**Layout:** Mobile

**Components:**
- Back arrow (top left)
- Photo carousel (swipeable, up to 5 photos, dots indicator)
- Restaurant name (large, bold)
- Cuisine type + Google rating inline
- Short description paragraph
- Section: "What would you like to do?"
- Action buttons (3, stacked or grid):
  - "Reserve a Table" → navigates to C-07
  - "Order Takeaway" → navigates to C-09
  - (Walk-in note: "Walk in and scan the QR at your table")
- Section: "Menu Preview" (first 6 items, read-only, no add to cart)
  - Item cards: photo, name, price, veg badge

**States:**
- Loading: skeleton layout
- Error: retry button
- Loaded: full content

---

### SCREEN C-05 — QR Scanner
**Route:** /scan
**Who:** Customer at a restaurant table
**Layout:** Mobile

**Components:**
- Back arrow
- Heading: "Scan Table QR"
- Camera viewfinder (full screen or large box)
- Instruction text: "Point your camera at the QR code on your table"
- OR manual entry option: "Enter table code manually" (small link below)
- If camera not supported: show text input for QR URL paste

**States:**
- Scanning: camera active, animated corner brackets
- Processing: "Verifying..." spinner
- Error: "Invalid QR code. Please try again"
- Success: auto-navigates to C-06

**Note for Lovable:** QR scan result is a URL. When camera detects QR, it reads the URL and navigates to it. This screen is basically just a camera view that reads QR URLs.

---

### SCREEN C-06 — Table Verification
**Route:** /table/verify/[sessionId]
**Who:** Customer who just scanned QR
**Layout:** Mobile

**Components:**
- Restaurant name + Table number at top ("Spice Garden — Table 4")
- Heading: "Choose your code"
- Subtext: "Ask the staff which number to select"
- 3 large number buttons (side by side, full width row):
  - Button 1: [42]
  - Button 2: [17]
  - Button 3: [89]
  (Numbers are randomly generated each time)
- Small note below: "Can't find staff? Ask anyone at the counter"

**States:**
- Default: 3 buttons visible
- Loading: after tap, spinner overlay "Verifying..."
- Error: "Wrong code. Please try again" — buttons reset, new codes generated
- Success: navigate to C-07 (menu)
- Session expired: "This code has expired. Please scan the QR again"

---

### SCREEN C-07 — Dine-in Menu
**Route:** /table/[sessionId]/menu
**Who:** Customer with active table session
**Layout:** Mobile

**Components:**
- Top bar:
  - Restaurant name (left)
  - Table number badge: "Table 4" (right)
- Category tabs (horizontal scroll, sticky below top bar):
  - Starters | Mains | Breads | Drinks | Desserts
- Menu item list (scrollable):
  - Each item card:
    - Item image (left, square thumbnail) or veg/non-veg icon if no image
    - Veg/Non-veg dot indicator (green/red)
    - Item name (bold)
    - Short description (1 line, gray)
    - Price: ₹245
    - "+" Add button (right side)
- Sticky bottom:
  - Cart summary bar (shows only when cart has items):
    - "[N] items | ₹XXX"
    - "View Cart" button (right)
  - If cart empty: bar hidden

**States:**
- Loading: skeleton items
- Category switching: smooth scroll to section
- Item added: "+" becomes quantity stepper (- 1 +)
- Cart bar animates in when first item added

---

### SCREEN C-08 — Item Detail / Modifier Sheet
**Route:** Bottom sheet overlay on C-07
**Who:** Customer tapping an item
**Layout:** Mobile (bottom sheet)

**Components:**
- Item image (top, full width)
- Item name (bold, large)
- Description (full, multi-line)
- Price: ₹245
- Modifier sections (if any):
  - Each modifier group name as subheading
  - Radio buttons or chips for options
  - Extra price shown if applicable: "+₹20"
- Quantity selector: [−] [1] [+]
- Special instructions text area: "Add a note..." (optional)
- Button: "Add to Cart — ₹245" (primary, full width, price updates with modifiers)

**States:**
- Default: modifiers at first option
- Quantity changed: price updates in real time
- Added: sheet closes, cart bar updates

---

### SCREEN C-09 — Cart Review
**Route:** /table/[sessionId]/cart
**Who:** Customer reviewing order
**Layout:** Mobile

**Components:**
- Back arrow
- Heading: "Your Order"
- Order items list:
  - Each row: item name, modifiers (small gray), quantity, price
  - Swipe to delete or remove button
- Order summary section:
  - Subtotal: ₹490
  - GST (5%): ₹24.50
  - Total: ₹514.50
- Text area: "Any special instructions for this order?" (optional)
- Button: "Place Order" (primary, full width)

**States:**
- Empty cart: "Your cart is empty" with back button
- Loading: spinner after Place Order tap
- Success: navigate to C-10 (order tracking)
- Error: "Failed to place order. Try again"

---

### SCREEN C-10 — Order Tracking (Live)
**Route:** /table/[sessionId]/orders
**Who:** Customer after placing order
**Layout:** Mobile

**Components:**
- Top bar: Restaurant name + Table number
- Active order section (most recent first):
  - Order number: #ORD-001
  - Progress stepper (horizontal or vertical):
    - ✓ Order Received
    - ○ Being Prepared
    - ○ Ready
    - ○ On Its Way
    - ○ Delivered
  - Items list (collapsed, expandable)
- Previous orders in same session (below, smaller):
  - Order #ORD-000 — Delivered ✓
  - Tap to expand items
- Running bill section:
  - All orders subtotal
  - GST
  - Total so far
- Upsell prompt (if triggered):
  - Card: "Often ordered with your food: Butter Naan ₹45"
  - [Add] [No thanks]
- Two buttons at bottom:
  - "Add More Items" (secondary) → back to C-07
  - "Request Bill" (primary, red/danger) → triggers billing flow

**States:**
- Order status updates via SSE — stepper animates to next step
- New order placed: adds to top of list
- All delivered: "Request Bill" button becomes prominent

---

### SCREEN C-11 — Bill and Payment
**Route:** /table/[sessionId]/bill
**Who:** Customer who requested bill
**Layout:** Mobile

**Components:**
- Heading: "Your Bill"
- Restaurant name + Table number
- All orders breakdown:
  - Order #001: items list, subtotal
  - Order #002: items list, subtotal
- Bill totals:
  - Subtotal: ₹720
  - GST: ₹36
  - Total: ₹756
- Payment instructions section:
  - "Pay at the table using:"
  - Option A: Cash — hand to your server
  - Option B: UPI — scan the restaurant's QR code at the counter
- Button: "I've Paid" (primary, full width, green)
- Note: "Your server will confirm your payment"

**States:**
- Default: bill shown, "I've Paid" button active
- After "I've Paid" tap:
  - Button becomes disabled
  - Message: "Waiting for staff to confirm..."
  - Spinner
- Confirmed by manager: navigate to C-12

---

### SCREEN C-12 — Payment Confirmed / Session End
**Route:** /table/[sessionId]/complete
**Who:** Customer after payment confirmed
**Layout:** Mobile

**Components:**
- Large success checkmark animation (green)
- Heading: "Payment Confirmed! 🎉"
- Total paid: ₹756
- Loyalty points section:
  - "You earned 7 points!"
  - "Total points: 54 ⭐"
- "Rate your experience" prompt:
  - 5 star rating (tappable)
  - Text area: "Write a review (optional)"
  - Supports English, Hindi, Gujarati — show placeholder in all three
  - Button: "Submit Review"
  - Link: "Skip"
- Button: "Back to Home" (after review submitted or skipped)

**States:**
- Default: success animation plays once
- Review submitted: "Thanks for your feedback!" then home redirect
- Skipped: straight to home

---

### SCREEN C-13 — Takeaway Menu Browse
**Route:** /takeaway/[restaurantId]/menu
**Who:** Customer ordering takeaway
**Layout:** Mobile

**Components:**
- Back arrow
- Restaurant name at top
- "Takeaway Order" badge (so customer knows mode)
- Category tabs (same as C-07)
- Menu items (same cards as C-07, same add/remove)
- Sticky cart bar at bottom
- "View Cart" → goes to C-14 (takeaway cart)

**States:** Same as C-07

---

### SCREEN C-14 — Takeaway Cart
**Route:** /takeaway/[restaurantId]/cart
**Who:** Customer reviewing takeaway order
**Layout:** Mobile

**Components:**
- Back arrow
- Heading: "Takeaway Order"
- Items list with quantities and prices
- Order summary: subtotal, GST, total
- Special instructions field
- Note: "Payment collected at pickup"
- Button: "Place Takeaway Order" (primary)

**States:**
- Loading after tap
- Success: navigate to C-15 (takeaway tracking)

---

### SCREEN C-15 — Takeaway Order Tracking
**Route:** /takeaway/orders/[orderId]
**Who:** Customer tracking takeaway
**Layout:** Mobile

**Components:**
- Top bar: Restaurant name
- Token number (large, bold, centered):
  - "Your Token"
  - #T-4521-847
- Status stepper:
  - ○ Pending Confirmation
  - ○ Order Confirmed
  - ○ Being Prepared
  - ○ Ready for Pickup
  - ○ Picked Up
- Items ordered (collapsible list)
- Total amount
- Note: "Show this token number at the counter"
- If status = CANCELLED:
  - Red banner: "Order was not accepted. Please try again or contact the restaurant."
- If status = READY:
  - Green banner: "Your order is ready! Head to the counter."

**States:** All status updates via SSE

---

### SCREEN C-16 — Reservation Form
**Route:** /restaurant/[id]/reserve
**Who:** Customer making reservation
**Layout:** Mobile

**Components:**
- Back arrow
- Restaurant name at top
- Heading: "Reserve a Table"
- Date picker: calendar (today onwards, no past dates)
- Time slot selector: grid of available time chips (e.g. 7:00 PM, 7:30 PM, 8:00 PM)
- Party size: stepper [−] [2] [+] (min 1, max 20)
- Special requests: text area (optional)
- Button: "Send Reservation Request" (primary)
- Note: "The restaurant will call you to confirm"

**States:**
- Default
- Loading after submit
- Success: navigate to C-17

---

### SCREEN C-17 — Reservation Confirmed
**Route:** /reservations/[id]
**Who:** Customer after reservation submitted
**Layout:** Mobile

**Components:**
- Icon: clock or calendar (yellow/orange — pending)
- Heading: "Request Sent!"
- Details:
  - Restaurant name
  - Date: Sunday, 13 July 2026
  - Time: 7:30 PM
  - Party: 2 guests
- Status badge: "Pending — Waiting for confirmation"
- Message: "The restaurant will call you shortly to confirm your table."
- When status updates to CONFIRMED:
  - Badge turns green: "Confirmed ✓"
  - Message: "Your table is booked!"
- When CANCELLED:
  - Badge turns red
  - Message: "Your request was not accepted. Please try a different time."
- Button: "Back to Home"

**States:** Status updates via polling (not SSE — reservations are low frequency)

---

### SCREEN C-18 — Order History
**Route:** /orders
**Who:** Logged-in customer
**Layout:** Mobile

**Components:**
- Back arrow or bottom nav highlight
- Heading: "My Orders"
- Filter tabs: All | Dine-in | Takeaway
- Order cards (newest first):
  - Restaurant name
  - Date and time
  - Items (first 2 items shown, "+N more")
  - Total amount
  - Status badge (Completed / Cancelled)
  - "Reorder" button (pre-fills cart with same items)
- Empty state: "No orders yet. Start by scanning a QR or ordering takeaway."

---

### SCREEN C-19 — Loyalty Wallet
**Route:** /loyalty
**Who:** Logged-in customer
**Layout:** Mobile

**Components:**
- Heading: "My Rewards"
- Points balance card (large, prominent):
  - ⭐ 54 Points
  - "Keep earning — ₹100 spent = 1 point"
- Transaction history (newest first):
  - Each row: restaurant name, date, "+7 points" or "-10 points", type badge
- Empty state: "No points yet. Complete an order to start earning!"
- Note: "Redemption coming soon!"

---

### SCREEN C-20 — Profile
**Route:** /profile
**Who:** Logged-in customer
**Layout:** Mobile

**Components:**
- Avatar (initials based, no photo upload)
- Name (editable inline)
- Phone number (read-only — shown, cannot change in MVP)
- Email (read-only)
- Menu items (list):
  - My Orders → C-18
  - My Loyalty Points → C-19
  - My Reservations (list of past reservations)
- Divider
- Button: "Logout" (destructive, bottom)

---

---

## PRODUCT 2 — PARTNER DASHBOARD
**Device:** Desktop primary, tablet secondary (kitchen = tablet only)
**Base URL:** partner.domain.com

---

### SCREEN P-01 — Staff Login
**Route:** /login
**Who:** Owner, Manager, Chef, Admin
**Layout:** Desktop + Mobile

**Components:**
- Centered card layout
- Logo at top
- Heading: "Partner Login"
- Input: Email address
- Input: Password (show/hide)
- Link: "Forgot password?" (Owner only flow → P-02)
- Button: "Login" (primary, full width)

**States:**
- Default
- Loading: spinner
- Error: "Invalid email or password"
- Success: role-based redirect
  - ADMIN → P-05
  - OWNER → P-10
  - MANAGER → P-20
  - CHEF → P-30

---

### SCREEN P-02 — Forgot Password
**Route:** /forgot-password
**Who:** Owner only
**Layout:** Desktop

**Components:**
- Back to login link
- Heading: "Reset your password"
- Subtext: "Enter your email and we'll send a reset link"
- Input: Email address
- Button: "Send Reset Link"

**States:**
- Loading
- Success: "Check your email. The link expires in 5 minutes."
- Error: "No account found with this email"

---

### SCREEN P-03 — Reset Password
**Route:** /reset-password?token=xxx
**Who:** Owner
**Layout:** Desktop

**Components:**
- Heading: "Set new password"
- Input: New password
- Input: Confirm new password
- Button: "Update Password"

**States:**
- Loading
- Success: "Password updated. Redirecting to login..."
- Token expired: "This link has expired. Request a new one."
- Error: passwords don't match

---

---

## ADMIN SCREENS

### SCREEN P-05 — Admin Dashboard
**Route:** /admin
**Who:** Admin
**Layout:** Desktop

**Components:**
- Left sidebar navigation:
  - Restaurants
  - Analytics
  - [Admin name + logout]
- Main content — metric cards:
  - Total Restaurants (number)
  - Active (green badge + count)
  - Trial (yellow badge + count)
  - Expired (orange badge + count)
  - Suspended (red badge + count)
  - Platform-wide total orders today
- Restaurant table (below cards):
  - Columns: Name, Owner, Plan, Status, Expiry Date, Actions
  - Status badge colored per type
  - Actions: Edit, Suspend, Activate
- "Create Restaurant" button (top right, primary)

---

### SCREEN P-06 — Create Restaurant Modal
**Route:** Modal on P-05
**Who:** Admin
**Layout:** Desktop modal

**Components:**
- Modal heading: "Add New Restaurant"
- Input: Restaurant Name
- Input: Owner Full Name
- Input: Owner Phone
- Input: Owner Email
- Select: Plan (Free Trial / Basic / Growth)
- Date picker: Expiry Date
- Button: "Create Restaurant" (primary)
- Button: "Cancel" (secondary)

**States:**
- Loading: spinner, inputs disabled
- Success: modal closes, restaurant appears in list, success toast
- Error: inline field errors

---


### SCREEN P-07 — Admin Analytics
**Route:** /admin/analytics
**Who:** Admin
**Layout:** Desktop

**Components:**
- Same sidebar
- Heading: "Platform Analytics"
- Metric cards (row of 4):
  - Total customers registered
  - Total orders (all time)
  - Orders today
  - Active restaurants right now
- Restaurant breakdown table:
  - Columns: Restaurant name, Orders today, Orders all time, Revenue (when billing added), Status
  - Sortable columns
  - Each row clickable → goes to P-08 (Restaurant Detail)

---

### SCREEN P-08 — Admin Restaurant Detail
**Route:** /admin/restaurants/[id]
**Who:** Admin
**Layout:** Desktop

**Components:**
- Back arrow → returns to P-05
- Left sidebar (same as all admin screens)
- Top section — Restaurant Info:
  - Restaurant name (large heading)
  - Owner name, email, phone (inline, gray)
  - Plan badge: TRIAL / BASIC / GROWTH (colored)
  - Status badge: ACTIVE / TRIAL / EXPIRED / SUSPENDED (colored)
  - Expiry date: "Expires 25 Aug 2026" (red if expired)
  - Created date
- Action buttons (top right):
  - "Edit Plan" (secondary) → opens P-09 modal
  - "Suspend" (red ghost) — shown if ACTIVE or TRIAL
  - "Activate" (green) — shown if SUSPENDED or EXPIRED
- Stats row (today's numbers pulled from DB):
  - Total orders
  - Total revenue
  - Total customers
  - Active staff count
- Section: Branches
  - List of branches with name and address
  - Read-only (admin cannot edit restaurant data)
- Section: Staff
  - Table: Name, Email, Role, Status (Active/Inactive)
  - Read-only
- Section: Recent Orders (last 10)
  - Table: Order ID, Table/Token, Amount, Status, Date
  - Read-only

**States:**
- Loading: skeleton layout
- Restaurant not found: "Restaurant not found" with back button

---

### SCREEN P-09 — Edit Restaurant Plan Modal
**Route:** Modal on P-08
**Who:** Admin
**Layout:** Desktop modal

**Components:**
- Modal heading: "Edit Plan — [Restaurant Name]"
- Current plan shown: "Current: Free Trial"
- Select: Plan (Free Trial / Basic / Growth)
- Date picker: New expiry date
- Select: Status (Active / Trial / Expired / Suspended)
- Text area: Internal note (optional, admin-only, not shown to restaurant)
- Button: "Save Changes" (primary)
- Button: "Cancel" (secondary)

**States:**
- Loading: spinner, inputs disabled
- Success: modal closes, P-08 refreshes with new plan badge, success toast
- Error: inline error message

---

### SCREEN P-10-A — Admin Restaurant List (Full)
**Route:** /admin/restaurants
**Who:** Admin
**Layout:** Desktop

**Note:** This is the full-page version of the restaurant list. P-05 shows a condensed version on the dashboard. This is the dedicated page with filters and search.

**Components:**
- Left sidebar (same)
- Heading: "All Restaurants"
- Top bar:
  - Search input: "Search by name or owner..."
  - Filter dropdown: Status (All / Active / Trial / Expired / Suspended)
  - Filter dropdown: Plan (All / Free Trial / Basic / Growth)
  - "Create Restaurant" button (primary, top right)
- Summary counts (small badges below heading):
  - Total: 20 | Active: 12 | Trial: 5 | Expired: 2 | Suspended: 1
- Restaurant table:
  - Columns:
    - Restaurant Name (clickable → P-08)
    - Owner Name
    - Owner Email
    - Plan badge
    - Status badge
    - Expiry Date (red text if past)
    - Orders Today
    - Created Date
    - Actions column:
      - "View" button → P-08
      - "Edit Plan" button → P-09 modal
      - "Suspend" / "Activate" toggle button
- Pagination: 20 per page, page numbers at bottom
- Empty state: "No restaurants found"

**States:**
- Loading: skeleton table rows
- No results for filter: "No restaurants match your filters"
- Search active: results filter in real time (or on submit)

---

### SCREEN P-11-A — Admin Customer List
**Route:** /admin/customers
**Who:** Admin
**Layout:** Desktop

**Components:**
- Left sidebar (same)
- Heading: "Customers"
- Search input: "Search by name, email, or phone"
- Customer table:
  - Columns:
    - Name
    - Email
    - Phone
    - Registered date
    - Total orders
    - Total spent (₹)
    - Status: Active / Inactive
    - Actions: "View" button
- Pagination: 20 per page
- Empty state: "No customers registered yet"

**States:**
- Loading: skeleton rows
- Empty: message

---

### SCREEN P-12-A — Admin Customer Detail
**Route:** /admin/customers/[id]
**Who:** Admin
**Layout:** Desktop

**Components:**
- Back arrow → P-11-A
- Customer info card:
  - Name (large)
  - Email, Phone (gray)
  - Registered: date
  - Status badge: Active / Inactive
- Loyalty section:
  - Total points balance
  - Points history table (last 10 transactions):
    - Date, Restaurant, Points earned, Type
- Order history table (last 10):
  - Order ID, Restaurant, Amount, Type (Dine-in / Takeaway), Date, Status
- Action (admin only):
  - "Deactivate Account" button (red ghost) — disables login
  - "Activate Account" button — shown if inactive

**States:**
- Loading: skeleton
- Customer not found: error message

---

### SCREEN P-13-A — Admin Complaints Overview
**Route:** /admin/complaints
**Who:** Admin
**Layout:** Desktop

**Note:** Admin sees complaints across ALL restaurants. Owner sees only their own (P-19).

**Components:**
- Left sidebar (same)
- Heading: "All Complaints"
- Filter bar:
  - Restaurant dropdown (All / specific restaurant)
  - Category: All / Food Quality / Service / Wait Time / Billing / Cleanliness / Staff Behavior / Order Accuracy / Other
  - Urgency: All / Critical / High / Medium / Low
  - Sentiment: All / Positive / Negative / Neutral
  - Status: All / Unresolved / Resolved
  - Date range picker
- Summary row:
  - Total complaints | Unresolved | Critical unresolved
- Complaints table:
  - Columns:
    - Urgency badge
    - Category badge
    - Restaurant name (clickable → P-08)
    - Customer name (if logged in, else "Anonymous")
    - Rating (stars)
    - Language badge
    - Summary (1 line, from Gemini)
    - Submitted date
    - Status: Resolved ✓ / Unresolved
    - Actions: "View Full" button
- Click "View Full" → opens P-14-A (complaint detail modal)
- Empty state: "No complaints yet"

---

### SCREEN P-14-A — Admin Complaint Detail Modal
**Route:** Modal on P-13-A
**Who:** Admin
**Layout:** Desktop modal (wide, ~700px)

**Components:**
- Modal heading: "Complaint Detail"
- Section: Restaurant + Customer
  - Restaurant name, branch
  - Customer name + email (if logged in)
  - Submitted: date and time
- Section: Original Text
  - Full complaint text (no truncation)
  - Language badge below text
- Section: AI Analysis
  - Category badge
  - Sentiment badge
  - Urgency badge
  - Gemini Summary (English, 1-2 lines)
  - Keywords: shown as chips
- Section: Rating
  - Star rating display (read-only)
- Status section:
  - If unresolved: "Mark as Resolved" button (green)
  - If resolved: "Resolved on [date]" (green text)
- Button: "Close" (bottom right)

---

### SCREEN P-15-A — Admin Settings
**Route:** /admin/settings
**Who:** Admin
**Layout:** Desktop

**Components:**
- Left sidebar (same)
- Heading: "Admin Settings"
- Section: Admin Account
  - Name (editable)
  - Email (read-only)
  - "Change Password" button → inline form:
    - Current password
    - New password
    - Confirm new password
    - "Update Password" button
- Section: Platform Defaults
  - Default trial duration: input (days, default 30)
  - Default plan on creation: select (Free Trial)
  - Note: "These are defaults only. Each restaurant can be configured individually."
- Section: Danger Zone
  - "Export all restaurant data (CSV)" button
  - "Export all customer data (CSV)" button

---

## ADMIN SIDEBAR NAVIGATION

All admin screens share this sidebar:

```
Logo
─────────────
Dashboard          → /admin
Restaurants        → /admin/restaurants
Customers          → /admin/customers
Complaints         → /admin/complaints
Analytics          → /admin/analytics
Settings           → /admin/settings
─────────────
[Admin Name]
Logout
```

---

---

## OWNER SCREENS

### SCREEN P-10 — Owner Dashboard Home
**Route:** /owner
**Who:** Owner
**Layout:** Desktop

**Components:**
- Left sidebar navigation:
  - Dashboard (home)
  - Restaurant Setup
  - Menu
  - Staff
  - Settings (Tax, Loyalty)
  - Analytics
  - Complaints
  - [Owner name + logout]
- Plan status banner (if TRIAL):
  - "Trial expires in 12 days"
- Metric cards (today):
  - Revenue: ₹12,450
  - Orders: 47
  - New customers: 8
  - Avg order value: ₹264
- Quick actions:
  - "Add Menu Item"
  - "Add Staff"
  - "View Floor Plan"

---

### SCREEN P-11 — Restaurant Setup
**Route:** /owner/setup
**Who:** Owner
**Layout:** Desktop

**Components:**
- Heading: "Restaurant Setup"
- Section: Profile
  - Logo upload (single image, drag or click)
  - Restaurant name (editable)
  - Description text area
  - Cuisine type (text or select)
  - Address
- Section: Photos (max 5)
  - Photo upload grid (5 slots)
  - Each slot: upload or drag drop, shows preview, delete button
  - Remaining: "3/5 uploaded"
- Section: Branches
  - Branch list (each shows name, address)
  - "Add Branch" button
  - Each branch: expand to show floors
- Section: Floors (per branch)
  - Floor list
  - "Add Floor" button
- Section: Tables (per floor)
  - Table grid
  - Each table: number, capacity, QR download button
  - "Add Table" button
- "Save All Changes" button (sticky bottom)

---

### SCREEN P-12 — Table QR View
**Route:** Modal on P-11
**Who:** Owner
**Layout:** Desktop modal

**Components:**
- Modal: "Table [N] QR Code"
- Large QR code (centered)
- Table details: Floor name, Table number, Capacity
- Button: "Download QR" (downloads PNG)
- Button: "Print QR"
- Button: "Close"

---

### SCREEN P-13 — Menu Management
**Route:** /owner/menu
**Who:** Owner
**Layout:** Desktop (two-column)

**Components:**
- Left column: Category list
  - Each category: drag handle, name, item count, edit/delete icons
  - Toggle: active/inactive
  - "Add Category" button at bottom
- Right column: Items for selected category
  - Item cards (list view):
    - Thumbnail, name, price, veg badge
    - Available toggle (on/off)
    - Edit button
    - Delete button
  - "Add Item" button at top right
- Empty state (no category selected): "Select a category to view items"

---

### SCREEN P-14 — Add / Edit Menu Item
**Route:** /owner/menu/item/new or /owner/menu/item/[id]
**Who:** Owner
**Layout:** Desktop

**Components:**
- Heading: "Add Menu Item" or "Edit Menu Item"
- Left side (form):
  - Input: Item name
  - Text area: Description
  - Input: Price (₹ prefix)
  - Toggle: Is Vegetarian (green dot / red dot)
  - Toggle: Available
  - Input: Sort order
  - Category selector (dropdown)
- Right side:
  - Image upload (single, square preview, from R2)
  - Modifier builder:
    - Heading: "Modifiers (optional)"
    - "Add Modifier Group" button
    - Each group:
      - Input: Group name (e.g. "Spice Level")
      - Toggle: Required
      - Options list:
        - Each: label input + extra price input + delete
        - "Add Option" link
      - Delete group button
- Bottom buttons:
  - "Save Item" (primary)
  - "Cancel" (secondary)

---

### SCREEN P-15 — Staff Management
**Route:** /owner/staff
**Who:** Owner
**Layout:** Desktop

**Components:**
- Heading: "Staff"
- "Add Staff Member" button (top right)
- Staff table:
  - Columns: Name, Email, Phone, Role, Status, Actions
  - Role badge: Manager (blue) / Chef (orange)
  - Status: Active (green) / Inactive (gray)
  - Actions: Edit, Deactivate/Activate
- Empty state: "No staff added yet. Add your first team member."

---

### SCREEN P-16 — Add Staff Modal
**Route:** Modal on P-15
**Who:** Owner
**Layout:** Desktop modal

**Components:**
- Heading: "Add Staff Member"
- Input: Full name
- Input: Email (credentials sent here)
- Input: Phone (optional)
- Input: Temporary password
- Select: Role (Manager / Chef)
- Note: "Login credentials will be sent to their email"
- Button: "Add Staff" (primary)
- Button: "Cancel"

**States:**
- Loading
- Success: modal closes, staff appears in list, "Credentials sent to email" toast
- Error: duplicate email message

---

### SCREEN P-17 — Settings (Tax + Loyalty)
**Route:** /owner/settings
**Who:** Owner
**Layout:** Desktop

**Components:**
- Heading: "Settings"
- Section: Tax Configuration
  - Input: GST Percentage (number, e.g. 5)
  - Toggle: Enable GST
  - "Save Tax Settings" button
- Section: Loyalty Program
  - Toggle: Enable Loyalty Points
  - Input: Points per ₹100 spent (default: 1)
  - Example preview: "Customer spends ₹500 → earns 5 points"
  - "Save Loyalty Settings" button
- Section: Upsell Prompts
  - Toggle: Enable Upsell Prompts
  - List of configured prompts:
    - Trigger: After Starter
    - Prompt text
    - Suggested item
    - Edit / Delete
  - "Add Upsell Prompt" button

---

### SCREEN P-18 — Owner Analytics
**Route:** /owner/analytics
**Who:** Owner
**Layout:** Desktop

**Components:**
- Date range selector: Today / This Week / This Month / Custom
- Metric cards row:
  - Total Revenue
  - Total Orders
  - Unique Customers
  - Avg Order Value
- Bar chart: Orders by hour (today or selected day)
- Top dishes list (ranked 1-5):
  - Dish name, times ordered, revenue generated
- Orders over time line chart (for week/month view)

---

### SCREEN P-19 — Complaints
**Route:** /owner/complaints
**Who:** Owner
**Layout:** Desktop

**Components:**
- Heading: "Customer Feedback"
- Filter bar:
  - Status: All / Unresolved / Resolved
  - Category: All / Food Quality / Service / Wait Time / etc.
  - Urgency: All / Critical / High / Medium / Low
  - Date range picker
- Complaint cards list:
  - Each card:
    - Urgency badge (colored: red=critical, orange=high, yellow=medium, gray=low)
    - Category badge
    - Restaurant name + date
    - Customer rating (stars)
    - Original text (truncated, "Show more" link)
    - AI Summary (English, 1 line, gray)
    - Language detected badge
    - Sentiment badge (Positive/Negative/Neutral)
    - "Mark Resolved" button (if unresolved)
    - "Resolved ✓" text (if resolved)
- Empty state: "No complaints yet!"

---

---

## MANAGER SCREENS

### SCREEN P-20 — Manager Home / Floor Plan
**Route:** /manager
**Who:** Manager
**Layout:** Desktop (primary), Tablet (supported)

**Components:**
- Top bar:
  - Restaurant name
  - Branch selector (dropdown if multiple branches)
  - Floor selector (tabs: Ground Floor, First Floor, etc.)
  - [Manager name + logout]
- Left sidebar (narrow):
  - Floor Plan (active)
  - Queue
  - Reservations
  - Orders
  - Takeaway
- Main area: Visual Floor Plan
  - Table grid (responsive to actual table count)
  - Each table tile:
    - Table number (large, center)
    - Capacity (small, gray)
    - Status color (full background):
      - Green = AVAILABLE
      - Blue = SEATED
      - Yellow = ORDER_PENDING
      - Orange = PREPARING
      - Purple = READY
      - Teal = SERVED
      - Red = BILL_REQUESTED
      - Dark Red = PAYMENT_PENDING
      - Gray = COMPLETED
    - Status label (small text below number)
  - Click table → opens P-21 (Table Detail Panel)
- Right panel (slides in on table click):
  - Table detail — see P-21

**Real-time:** Table statuses update via SSE without page refresh

---

### SCREEN P-21 — Table Detail Panel
**Route:** Slide-in panel on P-20
**Who:** Manager
**Layout:** Desktop side panel (right side, ~380px wide)

**Components:**
- Panel heading: "Table [N] — [Status]"
- Customer name (if session active)
- Session start time
- Current orders list:
  - Each order: order number, items, status badge, time placed
- Running total: ₹XXX
- Action buttons (contextual based on status):
  - If BILL_REQUESTED:
    - "Confirm Payment" (primary green)
    - Payment method selector before confirm (Cash / UPI)
  - If AVAILABLE:
    - "Manually Seat Customer" (secondary)
  - If PAYMENT_PENDING:
    - "Confirm Payment" (primary)
  - If COMPLETED:
    - "Reset Table" (resets to AVAILABLE)
- Close panel button (X top right)

---

### SCREEN P-22 — Queue Management
**Route:** /manager/queue
**Who:** Manager
**Layout:** Desktop + Tablet

**Components:**
- Heading: "Walk-in Queue"
- "Add to Queue" button (primary, top right)
- Queue list (ordered by position):
  - Each row:
    - Position number (large, bold): #1
    - Customer name
    - Party size: (2 guests)
    - Estimated wait: ~14 mins
    - Status badge: Waiting / Called
    - Actions:
      - "Call" button (opens tel: dialer)
      - "Seat" button (marks as seated, removes from active queue)
      - "Remove" button (left queue)
- Empty state: "Queue is empty. No one is waiting."
- Summary at top: "3 waiting — Estimated wait for next: ~14 mins"

---

### SCREEN P-23 — Add to Queue Modal
**Route:** Modal on P-22
**Who:** Manager
**Layout:** Modal

**Components:**
- Heading: "Add to Queue"
- Input: Customer name
- Input: Phone number
- Stepper: Party size [−] [2] [+]
- Text area: Notes (optional)
- Button: "Add to Queue" (primary)
- Button: "Cancel"

---

### SCREEN P-24 — Reservations
**Route:** /manager/reservations
**Who:** Manager
**Layout:** Desktop

**Components:**
- Heading: "Reservations"
- Date selector (tab bar or calendar header): Today | Tomorrow | Pick date
- "Today's reservations" count badge
- Reservation list:
  - Each card:
    - Customer name + phone
    - Date + time slot
    - Party size
    - Special notes (if any)
    - Status badge: Pending (yellow) / Confirmed (green) / Cancelled (red)
    - Action buttons (if PENDING):
      - "Confirm" (green button)
      - "Cancel" (red/ghost button)
    - If CONFIRMED: "Mark No-show" button
- Empty state: "No reservations for this date"

---

### SCREEN P-25 — Order Management
**Route:** /manager/orders
**Who:** Manager
**Layout:** Desktop

**Components:**
- Heading: "All Orders"
- Filter tabs: All | Dine-in | Takeaway | Active | Completed
- Order list:
  - Each card:
    - Order number
    - Table number (dine-in) or Token number (takeaway)
    - Customer name
    - Items list (collapsed, expandable)
    - Total: ₹XXX
    - Time placed: 7:45 PM (and elapsed: "12 mins ago")
    - Status badge (colored)
    - For takeaway PENDING_VERIFICATION: "Accept" and "Reject" buttons
- Real-time: new orders appear at top via SSE

---

### SCREEN P-26 — Takeaway Management
**Route:** /manager/takeaway
**Who:** Manager
**Layout:** Desktop + Tablet

**Components:**
- Heading: "Takeaway Orders"
- Columns (Kanban-style or tabbed):
  - Pending Verification
  - Confirmed / Preparing
  - Ready for Pickup
  - Completed
- Each order card:
  - Token number (large, bold)
  - Customer name
  - Items list
  - Total amount
  - Time placed
  - Status-appropriate actions:
    - Pending: "Accept Order" (green) + "Reject" (red ghost)
    - Confirmed/Preparing: no action (kitchen handles)
    - Ready: "Mark as Paid & Picked Up" (green)
- Empty state per column: "No orders here"

---

---

## KITCHEN SCREENS

### SCREEN P-30 — Kitchen Display System (KDS)
**Route:** /kitchen
**Who:** Chef
**Layout:** Tablet (landscape, full screen)

**Components:**
- Top bar:
  - Restaurant name
  - Current time (live clock)
  - Connection status dot (green=connected, red=disconnected)
  - Logout button (small, top right)
- Four columns (equal width, full height):
  - Column 1: NEW (red header)
  - Column 2: PREPARING (orange header)
  - Column 3: READY (green header)
  - Column 4: SERVED (gray header)
- Each order card (within a column):
  - Order number: #ORD-047 (bold, large)
  - Source badge: TABLE 4 or TAKEAWAY #T-847
  - Time elapsed: "3 mins" (turns red after 15 mins)
  - Items list:
    - Item name
    - Quantity: ×2
    - Modifiers: "(Hot, No Onion)"
    - Notes if any
  - Action button at bottom of card:
    - In NEW: "Start Preparing" → moves to PREPARING
    - In PREPARING: "Mark Ready" → moves to READY
    - In READY: "Served" → moves to SERVED
    - In SERVED: no action (auto-clears after 10 min)
- Sound: audio alert (ding) when new order appears in NEW column
- New order animation: card slides/bounces in

**Real-time:** All updates via SSE — no refresh needed

**States:**
- All columns empty: "All clear! Waiting for orders."
- Disconnected: red banner at top "Connection lost — trying to reconnect..."
- Reconnected: banner disappears

---

---

## SCREEN COUNT SUMMARY

```
Customer App (C)
  C-01  Register
  C-02  Login
  C-03  Home / Discovery
  C-04  Restaurant Detail
  C-05  QR Scanner
  C-06  Table Verification
  C-07  Dine-in Menu
  C-08  Item Detail Sheet
  C-09  Cart Review
  C-10  Order Tracking (Live)
  C-11  Bill and Payment
  C-12  Payment Confirmed
  C-13  Takeaway Menu Browse
  C-14  Takeaway Cart
  C-15  Takeaway Tracking
  C-16  Reservation Form
  C-17  Reservation Status
  C-18  Order History
  C-19  Loyalty Wallet
  C-20  Profile
  Total: 20 screens

Partner Dashboard (P)
  Auth
    P-01  Staff Login
    P-02  Forgot Password
    P-03  Reset Password

  Admin
    P-05   Admin Dashboard
    P-06   Create Restaurant Modal
    P-07   Admin Analytics
    P-08   Admin Restaurant Detail
    P-09   Edit Restaurant Plan Modal
    P-10-A Admin Restaurant List (Full)
    P-11-A Admin Customer List
    P-12-A Admin Customer Detail
    P-13-A Admin Complaints Overview
    P-14-A Admin Complaint Detail Modal
    P-15-A Admin Settings

  Owner
    P-10  Owner Dashboard Home
    P-11  Restaurant Setup
    P-12  Table QR Modal
    P-13  Menu Management
    P-14  Add/Edit Menu Item
    P-15  Staff Management
    P-16  Add Staff Modal
    P-17  Settings (Tax + Loyalty)
    P-18  Owner Analytics
    P-19  Complaints

  Manager
    P-20  Floor Plan
    P-21  Table Detail Panel
    P-22  Queue Management
    P-23  Add to Queue Modal
    P-24  Reservations
    P-25  Order Management
    P-26  Takeaway Management

  Kitchen
    P-30  Kitchen Display (KDS)

  Total: 32 screens

Grand Total: 52 screens
```

---

## Notes for Lovable

```
1. Customer app is MOBILE ONLY
   Build for 390px width first
   No desktop layout needed for customer app

2. Partner dashboard is DESKTOP FIRST
   Sidebar navigation always visible on desktop
   Collapse to hamburger on tablet
   Kitchen display is tablet landscape only

3. Real-time screens (marked with SSE):
   C-10  Order Tracking
   C-15  Takeaway Tracking
   P-20  Floor Plan
   P-25  Order Management
   P-26  Takeaway Management
   P-30  Kitchen Display
   → These need polling or SSE hook
   → Lovable: just show the state correctly
      Backend will push updates

4. Modals vs pages:
   P-06, P-09, P-12, P-14-A, P-16, P-23 are modals
   Everything else is a full page

5. Color system for table states:
   AVAILABLE      → #22c55e (green-500)
   SEATED         → #3b82f6 (blue-500)
   ORDER_PENDING  → #eab308 (yellow-500)
   PREPARING      → #f97316 (orange-500)
   READY          → #a855f7 (purple-500)
   SERVED         → #14b8a6 (teal-500)
   BILL_REQUESTED → #ef4444 (red-500)
   PAYMENT_PENDING→ #b91c1c (red-700)
   COMPLETED      → #6b7280 (gray-500)

6. Veg / Non-veg indicators:
   Veg:     green filled circle
   Non-veg: red filled circle
   Show on every menu item

7. Loading states:
   Use skeleton loaders (not spinners) for list/card content
   Use spinner only for form submissions

8. Empty states:
   Every list screen needs an empty state illustration + message

9. Bottom navigation (customer app only):
   Home | Orders | Loyalty | Profile
   Always visible, 4 tabs
```
