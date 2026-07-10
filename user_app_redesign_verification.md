# Foodika User App - Redesign Verification Protocol

This document serves as the official manual verification guide for the mobile-first neobrutalist redesign of the Foodika User Portal (`apps/user-app`). Any future AI agents or developers working on the Partner/Admin panels can use this checklist to verify user-app screens and cross-app integrations.

---

## 🛠️ App Context & Auth Details
* **App URL**: [http://localhost:3000](http://localhost:3000)
* **Default Customer Login**: `rahul@gmail.com` / `customerpassword` (Rahul Patel)

---

## 1. ⚡ Automated Health Check
Run the following build command to verify that there are no TypeScript, compilation, or lint regressions:
```bash
# In the workspace root directory:
npx turbo typecheck --filter=user-app
```
*Expected Outcome: Command completes with zero compilation errors.*

---

## 2. 📱 Manual Verification Scenarios (Step-by-Step)

### Scenarios A & B: Authentication Flow
1. **Login Page (`/login`)**:
   - Verify soft-yellow background with colored glowing blur accents.
   - Enter credentials: `rahul@gmail.com` / `customerpassword`. Toggle password visibility to show/hide the letters.
   - Click **Login** (green container card, thick borders, solid black shadow).
2. **Registration Page (`/register`)**:
   - Verify name, email, phone, and password inputs are styled in mint green container block with thick shadows.
   - Verify error toasts trigger on mismatching passwords or short phone numbers.

### Scenarios C & D: Restaurant Explorer
3. **Explore Dashboard (`/`)**:
   - Verify category craving bubbles (Pizza, Burger, Sushi, Sweet, Taco) with custom images.
   - Verify restaurant branch cards display "Open" badge, rating star ("★ 4.8"), name, cuisine tier, and prep time badge.
4. **Restaurant Detail (`/restaurant/[id]`)**:
   - Verify image slide carousel, active branch selection dropdown, and Featured Menu items.
   - Click **Reserve a Table** (black button) or **Order Takeaway** (peach button).

### Scenarios E & F: Table Reservations
5. **Reservation Screen (`/reserve/[branchId]`)**:
   - Verify guest quantity steppers, scrollable calendar date chips, and time slot grids.
6. **Booking Success (`/reserve/success`)**:
   - Verify green checkmark badge and consolidated bento summary card (Date, Time, Party size).

### Scenarios G, H, I & J: Takeaway Order Flow
7. **Takeaway Catalog (`/takeaway/[restaurantId]/menu`)**:
   - Verify cravings category scroll tabs, item cards with veg/non-veg indicator, and "+" modifier drawer triggers.
   - **Modifiers Modal**: Verify single-select modifiers render as grid selector cards, and multi-select extras render as horizontal scrolling pastel cards.
8. **Takeaway Basket (`/takeaway/[restaurantId]/cart`)**:
   - Verify quantity adjustment stepper, kitchen notes textarea, and price breakdown.
9. **Takeaway Success (`/takeaway/[restaurantId]/success`)**:
   - Verify total paid amount card, loyalty points tier, and star feedback reviews section.
10. **Takeaway Tracker (`/takeaway/tracking/[orderId]`)**:
    - Verify SSE live indicator, order token number, and vertical progress step bar with cooking skillet animation.

### Scenarios K & L: Table QR Scanning
11. **QR Scanning Viewfinder (`/scan`)**:
    - Verify viewfinder frame, pulsing neon scanning line, flashlight toggle, and **Simulate Scan (Table 1)** button.
12. **Verify Table Selection (`/scan/confirm`)**:
    - Verify selection grid of 3 verification codes.
    - If incorrect code is selected, verify error toast displays and new verification numbers are generated locally in state.

### Scenarios M, N, O, P & Q: Dine-In Tableside Session
13. **Dine-In Menu (`/dine-in/[sessionId]/menu`)**:
    - Verify active Table Number badge, item card add drawers, and bottom persistent cart status checkout trigger.
14. **Dine-In Cart (`/dine-in/[sessionId]/cart`)**:
    - Verify items summary, kitchen instructions input, and total pay bill overview.
15. **Dine-In Status Tracker (`/dine-in/[sessionId]/tracking`)**:
    - Verify "Chef is Crafting..." hero banner with skillet rotation, bento ordered items list, and **Pay Bill** sticky button.
16. **Tableside Bill Settle (`/dine-in/[sessionId]/bill`)**:
    - Verify detailed bill breakdown mint card, UPI QR scanner box, and "I've Paid" CTA button.
    - Click **I've Paid**: Verify transition from "Verifying..." status to "Payment Notified" disabled grey button state.
17. **Settle Session Success (`/dine-in/[sessionId]/success?totalPaid=...`)**:
    - Triggers automatically after manager payment verification.
    - Verify ratings feedback stars interface, submit review button, and **Go Back to Explore** (clears tableside session).

### Scenarios R, S, T & U: Customer Bookings Dashboard
18. **Bookings History (`/orders`)**:
    - Verify soft-peach dot pattern layout.
    - Verify order listing tabs (All, Dine-in, Takeaway).
    - Verify **Reorder** buttons add all list items to cart and redirect to checkout cart.
19. **Receipt Viewer (`/orders/[id]`)**:
    - Verify soft-lavender theme, restaurant logo outline header, detailed modifiers list, and sticky **Reorder Everything** button.
20. **Profile Tab (`/profile`)**:
    - Verify edit avatar badge, user details cards, and stats bento grids (Total Orders & Foodie Points balance).
    - Click **Support & Feedback**: Verify slide-down complaint form card.
21. **Loyalty Wallet (`/loyalty`)**:
    - Verify gold/orange points available card, exclusive rewards bento boxes, and detailed log lists of earned (+pts) / spent (-pts) transactions.
