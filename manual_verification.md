# Manual Verification Checklist - Partner & Kitchen Portal

This guide outlines step-by-step instructions to manually verify the features, backend integrations, and visual styling of all redesigned screens in the partner workspace.

---

## 1. Kitchen Display System (KDS)
**Path**: `/kitchen`

- [ ] **Live Clock Check**: Verify that the running clock in the top header updates every single second in `HH:MM:SS AM/PM` format.
- [ ] **Columns Load**: Verify three columns loaded with headers:
  - **NEW** (peach: `bg-[#FB923C]`)
  - **PREPARING** (yellow: `bg-[#FACC15]`)
  - **READY** (mint: `bg-[#4ADE80]`)
- [ ] **Order Transition Test**:
  - Click **Start Preparing** on a card in the **NEW** column. Verify it shifts to the **PREPARING** column.
  - Click **Mark Food Ready** on a card in the **PREPARING** column. Verify it shifts to the **READY** column.
  - Click **Served (Dispatch)** on a card in the **READY** column. Verify it disappears from the KDS layout.
- [ ] **Notes & Modifiers Preview**: Check if items with special options (e.g. "+ Extra Cheese") and kitchen notes (e.g. "No onions") are highlighted in colored boxes.

---

## 2. Manager Portal
**Path**: `/manager` (Floor Plan, Orders, Queue, Reservations)

### A. Floor Plan & Tables Drawer (`/manager`)
- [ ] **Dropdown Switcher**: Change selection in the branch dropdown. Verify that floors and tables reload corresponding to the new branch selection.
- [ ] **Pill Switcher**: Click different floors. Verify table layouts swap dynamically.
- [ ] **Table Status Indicator**: Confirm status color mappings:
  - `AVAILABLE` is mint green (`bg-[#D1FAE5]`)
  - `ORDER_PENDING` is pulsing yellow (`bg-[#FEF3C7]`)
  - `BILL_REQUESTED` is pulsing red (`bg-[#EF4444]`)
- [ ] **Table details side drawer**: Click any table button:
  - Verify that the drawer slides in from the right edge with table capacity and QR code fields.
  - Click **Confirm Cash/UPI Payment** on a table with a `BILL_REQUESTED` status. Verify that the table transitions back to `AVAILABLE`.
  - Click **Reset Table Status** on any occupied table. Verify that the table status updates to `AVAILABLE`.

### B. Live Service Dispatch (`/manager/orders`)
- [ ] **Tab Filter Bar**: Click through **All Orders**, **New**, **Preparing**, **Ready**, and **Served**. Verify that matching cards filter correctly.
- [ ] **Items Collapsible Accordion**: Click the expand/collapse icon on any card. Verify that the ordered items list expands and collapses without shifting layout sizes.
- [ ] **Card Dispatch Actions**: Click **Accept** or **Served** on order cards. Verify status updates correctly.

### C. Walk-in Queue Tracker (`/manager/queue`)
- [ ] **Add to Queue Dialog**:
  - Click **Add to Queue**. Verify modal container pops up.
  - Use the party size counter `+` / `-` buttons. Verify count increments/decrements.
  - Submit details. Verify a new row card is added to the roster.
- [ ] **Queue Roster Rows**:
  - Click **Call**. Verify row status transitions to `CALLED` (yellow background).
  - Click **Seat Now**. Verify row disappears from the active queue tracker list.

### D. Reservations Board (`/manager/reservations`)
- [ ] **New Booking Dialog**: Click **New Booking** and register a guest reservation. Verify table list updates.
- [ ] **Verification Detail Overlay**: Click **View Details** on any row:
  - Confirm detail panel loads with customer phone, VIP tags, and target time.
  - Check checklist checkboxes (Phone Verified, etc.). Verify row backgrounds toggle to green highlights.
  - Click **Confirm Reservation** or **Cancel Request**. Verify status patches successfully.

---

## 3. Owner Portal
**Path**: `/owner`

- [ ] **Bento stats cards**: Hover over stat cards. Verify translation animations.
- [ ] **Rosters**: Navigate to `/owner/staff`. Add a new roster record and confirm table ledger details.
- [ ] **Meal category lists**: Navigate to `/owner/menu`. View full-screen overlays when editing meals.
- [ ] **Analytics graphs**: Navigate to `/owner/analytics`. Confirm line charts and ranking bars scale correctly.
- [ ] **Settings controls**: Navigate to `/owner/settings`. Toggle Double Points, modify GST charges, and save configurations.

---

## 4. Device Responsiveness Check
- [ ] **Mobile Portals (<768px)**:
  - Switch dev console to Mobile view.
  - Verify KDS columns stack vertically as a single column.
  - Check that headers flex and wrap controls without overlapping text.
- [ ] **Tablet Portals (768px - 1024px)**:
  - Verify grids scale to 2-column or 3-column structures.
  - Verify tables scroll horizontally with scroll indicators instead of breaking container edges.
