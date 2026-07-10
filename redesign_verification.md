# Redesign Verification Checklist - Foodika User App

This document outlines the step-by-step verification process for the neobrutalist mobile-first redesign of the user portal (including takeaway and dine-in QR flows). Future verification runs (by human developers or AI agents) should follow these scenarios.

---

## 🛠️ Port & Auth Credentials
* **User Portal**: [http://localhost:3000](http://localhost:3000)
* **Auth Credentials**: `rahul@gmail.com` / `customerpassword` (Rahul Patel)

---

## 1. 🔍 Automated Verification
To ensure no TypeScript or build regression has occurred:
```bash
# From the workspace root directory:
npx turbo typecheck --filter=user-app
```
*Expected: Command completes successfully with no TypeScript compilation errors.*

---

## 2. 📱 Step-by-Step Manual Verification Scenarios

### Scenario A: Login Page (`/login`)
1. Open [http://localhost:3000/login](http://localhost:3000/login) on a mobile emulation viewport.
2. **Verify Layout**:
   - Body has a soft yellow background (`#FEF3C7`).
   - Multiple colored background circles exist with blur effects.
   - A white badge containing "Foodika" with a red dot is centered at the top.
   - The login form resides within a green container card (`#D1FAE5`) with thick borders and a solid black shadow.
3. **Verify Interactive Behavior**:
   - Input your email: `rahul@gmail.com`.
   - Input your password: `customerpassword`.
   - Click the password visibility toggle icon (visibility/visibility_off) and check that password text displays and hides.
   - Press **Login**.
   - *Expected: Redirected to `/` (Home).*

### Scenario B: Create Account (`/register`)
1. Open [http://localhost:3000/register](http://localhost:3000/register).
2. **Verify Layout**:
   - The form card is in a green container (`#D1FAE5`) with fields for name, phone, email, password, and confirm password.
   - The top header has a "Login" round badge button linking back to `/login`.
3. **Verify Interactive Behavior**:
   - Type details, click **Create Account**. Check validation handling (e.g. error message if passwords do not match or phone is short).

### Scenario C: Home Portal (`/`)
1. After logging in, verify the landing dashboard.
2. **Verify Layout**:
   - Top banner has a round profile avatar, and personalized greeting ("Hey, Rahul 👋" or similar user name).
   - Category cravings row lists: Pizza, Burger, Sushi, Sweet, Taco with custom images inside round frames.
   - Restaurant card listings are styled in alternating pastel background colors with a solid neobrutalist shadow.
   - The restaurant cards display the open badge ("Open"), rating ("★ 4.8"), name, cuisine tier, and prep time badge ("25 min").
3. **Verify Interactive Behavior**:
   - Click a craving (e.g., "Pizza"). Verify the list filters accordingly.
   - Click the floating filter FAB button in the bottom right.
   - Click a restaurant card (e.g., *Pizzeria Da Luigi*).
   - *Expected: Navigates to `/restaurant/[id]`.*

### Scenario D: Restaurant Detail (`/restaurant/[id]`)
1. **Verify Layout**:
   - Image carousel displays pagination indicators at the bottom.
   - Selected restaurant info details are displayed with rating badge.
   - Contains a branch selection widget.
   - Action buttons: "Reserve a Table" (black button) and "Order Takeaway" (peach button).
   - Featured items list below displays menu item previews in pastel cards.
   - Bento grids display Location, Delivery time, and Safety score.
2. **Verify Interactive Behavior**:
   - Verify changing branch selections works.
   - Click **Order Takeaway**.
   - *Expected: Navigates to `/takeaway/[restaurantId]/menu`.*

### Scenario E: Reserve Table (`/reserve/[branchId]`)
1. Open the reservation screen of any branch.
2. **Verify Layout**:
   - Stepper guest counter.
   - Date picker row containing calendar date chips in multiple pastel colors.
   - Time slot picker grid.
3. **Verify Interactive Behavior**:
   - Step guests count up and down.
   - Click a date chip.
   - Click a time slot chip.
   - Submit the form.
   - *Expected: Navigates to `/reserve/success`.*

### Scenario F: Reservation Success (`/reserve/success`)
1. **Verify Layout**:
   - Green success checkmark inside a pastel mint circle.
   - Details overview card showing Date, Time, and Guest summary fields in custom styled boxes.
   - Important verification policy note banner in primary black background.
2. **Verify Interactive Behavior**:
   - Click **Back to Home** button.
   - *Expected: Redirected to `/`.*

### Scenario G: Takeaway Menu & Item Customization (`/takeaway/[restaurantId]/menu`)
1. Go to takeaway menu.
2. **Verify Layout**:
   - Cravings tabs, veg-only filter toggle.
   - Item cards list with round food images, veg/non-veg dot indicator, and black round "+" button.
3. **Verify Customization Drawer**:
   - Click on an item's add button.
   - *Expected: Slide-up modifiers customization drawer/modal opens.*
   - If modifier has `maxSelections: 1` (e.g. Select Base), it displays as a grid of buttons. Clicking toggles selection state.
   - If modifier is optional multi-select (e.g. Add Extras), it displays as a horizontal scrolling row of bento cards in pastel colors. Clicking toggles checkmark state.
   - Stepper increments quantity and updates the single price.
   - Clicking **Add to Takeaway** adds item to cart and closes drawer.

### Scenario H: Review Basket & Place Order (`/takeaway/[restaurantId]/cart`)
1. Once items are added, verify the bottom bar appears on mobile. Click **View Basket** / navigate to `/takeaway/[restaurantId]/cart`.
2. **Verify Layout**:
   - Summary of added items, options modifiers list.
   - Stepper quantity increments.
   - Pickup instructions note box.
   - Detailed price breakdown.
3. **Verify Interactive Behavior**:
   - Add notes and click **Place Takeaway Order**.
   - *Expected: Redirects to Success screen.*

### Scenario I: Takeaway Payment Success (`/takeaway/[restaurantId]/success`)
1. **Verify Layout**:
   - Success checkmark.
   - "Total Paid" amount card in black with mint border shadow.
   - Bento rewards points card and Est. Pickup counter.
   - Star rating review feedback widget.
2. **Verify Interactive Behavior**:
   - Click stars (1-5). Verify stars fill/unfill dynamically.
   - Type review text, click **Submit Review**.
   - Click **Track Order**.
   - *Expected: Redirects to `/takeaway/tracking/[orderId]`.*

### Scenario J: Takeaway Order Tracking (`/takeaway/tracking/[orderId]`)
1. **Verify Layout**:
   - Header with active Live SSE tracking dot status indicator.
   - Token card displaying `#token` and QR Counter code.
   - Visual progress stepper with dynamic active cooking skillet spinning loader.
   - Ordered dishes list showing item quantities and settled total.
2. **Verify SSE updates**:
   - *Test state changes by updating order status on partner dashboard (`localhost:8000`) or database. Ensure status steps update dynamically.*

---

## 3. 🍽️ QR Scanning & Tableside Dine-In Verification Scenarios

### Scenario K: Scan Table QR (`/scan`)
1. Open [http://localhost:3000/scan](http://localhost:3000/scan).
2. **Verify Layout**:
   - Gradient layout with "Scan Table QR" header.
   - Viewfinder display container with pulsing scan line and animated green brackets.
   - Action buttons: "Toggle Flash", manual code input box.
3. **Verify Interactive Behavior**:
   - Click **Simulate Scan (Table 1)**.
   - *Expected: Redirects to `/scan/confirm`.*

### Scenario L: Choose Table Code (`/scan/confirm`)
1. **Verify Layout**:
   - Top Bar containing restaurant name and "Table 1" subtitle.
   - Selection grid of 3 verification codes in pastel mint/purple/peach.
   - Contextual information block: "Why verify?".
2. **Verify Interactive Behavior**:
   - Select a code, then click **Confirm Selection**.
   - *Expected: On failure, displays error toast and dynamically updates/regenerates code values. On success, redirects to `/dine-in/[sessionId]/menu`.*

### Scenario M: Dine-In Menu & Basket (`/dine-in/[sessionId]/menu`)
1. **Verify Layout**:
   - Header with bold table badge "Table 1" and user avatar.
   - Top Category tabs (Starters, Mains, Breads, Drinks).
   - Sourdough pizza item cards list with neobrutalist border/shadow styles.
   - Item customized modifiers modal (gourmet preview image, size selection, extras checkboxes).
   - Bottom floating cart summary showing total price.
2. **Verify Interactive Behavior**:
   - Add items, select options in modifier modal, increase quantity, add to cart.
   - Click **View Cart** on the bottom checkout bar.
   - *Expected: Navigates to `/dine-in/[sessionId]/cart`.*

### Scenario N: Settle Dine-In Cart (`/dine-in/[sessionId]/cart`)
1. **Verify Layout**:
   - Summary list of session items, modifiers list.
   - Subtotal, GST (5%), total pay calculation.
   - Order button: "Place Dine-in Order".
2. **Verify Interactive Behavior**:
   - Click **Place Dine-in Order**.
   - *Expected: Clear cart and redirect to `/dine-in/[sessionId]/tracking`.*

### Scenario O: Dine-In Tracking & Running Bill (`/dine-in/[sessionId]/tracking`)
1. **Verify Layout**:
   - Live Status card showing "Chef is Crafting..." with spinning skillet background.
   - Tracking vertical steps (Received, Preparing, Ready, Served).
   - Bento grids showing dishes details.
   - Sticky bill overview card displaying current session sum.
2. **Verify Interactive Behavior**:
   - Click **Pay Bill** or **View Bill**.
   - *Expected: Navigates to `/dine-in/[sessionId]/bill`.*

### Scenario P: Settle Running Bill (`/dine-in/[sessionId]/bill`)
1. **Verify Layout**:
   - Detailed bill breakdown in vibrant mint card with subtotal/tax summary.
   - Settle options: cash/UPI instruction in peach card.
   - UPI QR placeholder scan box.
   - Bottom CTA: "I've Paid" green button.
2. **Verify Interactive Behavior**:
   - Click **I've Paid**.
   - *Expected: Button shows "Verifying..." animation for 1.5 seconds, then disables to "Payment Notified" grey state.*
   - If staff approves tableside session status to `COMPLETED` on partner app:
   - *Expected: Bill page automatically redirects to payment confirmed ratings page `/dine-in/[sessionId]/success?totalPaid=...`.*

### Scenario Q: Settle Session Success (`/dine-in/[sessionId]/success?totalPaid=...`)
1. **Verify Layout**:
   - "Payment Confirmed!" header with total paid amount card, loyalty points bento box, star ratings feedback widget.
2. **Verify Interactive Behavior**:
   - Tap rating stars (verify stars fill/unfill).
   - Input review, click **Submit Review**.
   - Click **Go Back to Explore**.
   - *Expected: Clears local storage session and returns to explore page `/`.*

---

## 4. 🗂️ Account Profile, Orders History & Loyalty Wallet Verification Scenarios

### Scenario R: Orders History Listing (`/orders`)
1. Open [http://localhost:3000/orders](http://localhost:3000/orders).
2. **Verify Layout**:
   - Soft peach background with smiley face floaters.
   - Foodika header bar on top with profile avatar thumbnail on right.
   - Filter Tabs: All, Dine-in, Takeaway.
   - Completed orders are rendered in white neobrutalist cards with bold shadows.
   - Custom badges are displayed for orders (Takeaway as green badge, Dine-in as purple badge).
3. **Verify Interactive Behavior**:
   - Click the tabs (Dine-in / Takeaway) and verify list updates.
   - Click **Reorder** on an order card.
   - *Expected: Adds all items from that order to cart and redirects to cart.*
   - Click **View Details** on an order card.
   - *Expected: Navigates to `/orders/[id]` receipt view.*

### Scenario S: Past Receipt Details (`/orders/[id]`)
1. **Verify Layout**:
   - Soft lavender background.
   - Back button circle, "Order Details" header, and "#FDK-XXXXXX" order ID on top.
   - Restaurant card detailing restaurant name, branch details, date/time info, and dining type.
   - Items list detailing quantity, item name, price, and custom modifiers tags.
   - Total amount paid is presented in a primary black box.
2. **Verify Interactive Behavior**:
   - Click **Reorder Everything** bottom sticky button.
   - *Expected: Adds all items to cart and redirects to cart.*

### Scenario T: Profile Tab & Support Complaints (`/profile`)
1. Open [http://localhost:3000/profile](http://localhost:3000/profile).
2. **Verify Layout**:
   - Circular profile image with edit pen button.
   - User critical stats (Total Orders card in black box, Foodie Points card in green box) inside a bento grid.
   - Navigation list blocks: "My Orders", "My Loyalty Points", "My Reservations", "Support & Feedback".
3. **Verify Interactive Behavior**:
   - Click **Logout** at bottom. Confirm prompt to confirm auth session clearing.
   - Click **Support & Feedback**.
   - *Expected: Slides open the feedback/complaint card.*
   - Fill in restaurant dropdown, rating star count, description and click **Submit Feedback**.
   - *Expected: Submits and displays AI analysis success toast.*

### Scenario U: Loyalty Wallet (`/loyalty`)
1. Open [http://localhost:3000/loyalty](http://localhost:3000/loyalty).
2. **Verify Layout**:
   - Loyalty Wallet header and available balance points card in gold/orange gradient containing star icon badge.
   - Exclusive Perks: Bento tiles for free sides/deliveries in mint/yellow colors.
   - Transaction History listing earned points (green text) and spent redemptions (red text) with merchant details.

