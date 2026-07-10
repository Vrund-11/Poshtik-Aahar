# Foodika Admin Console - Manual Verification Guide

This guide describes step-by-step how an AI agent can automatically verify the Foodika Admin Console features, layouts, and backend integration using browser automation.

---

## Prerequisites

1. **Backend Server**: Ensure the backend database and API server are active on `http://localhost:8000`.
2. **Admin App Server**: Ensure the Next.js admin app is running on `http://localhost:7070`.
3. **Database State**: The database should be seeded (`npm run db:seed`) to populate restaurants, customers, and complaints.

---

## Automated Verification Protocol

To verify the system, spawn a browser subagent with the task descriptions detailed below.

### Phase 1: Dashboard & Authentication Verify
1. **Navigate**: Go to `http://localhost:7070/admin`.
2. **Authentication**: If redirected to `/login`, enter default administrator credentials.
3. **Audit Dashboard Elements**:
   - Verify the page header displays "Network Overview" and "Real-time health of your platform ecosystem."
   - Verify the bento metrics grid displays 5 colored cards (Total, Active, Trial, Expired, Suspended) with non-zero counts.
   - Verify the "Recent Restaurants" table exists, displays at least 3 seeded restaurants, and includes badges for Plan Tiers and active status dot indicators.
4. **Onboarding Modal Test**:
   - Click the "Create Restaurant" button in the TopAppBar.
   - Verify the "Onboard Restaurant" modal displays.
   - Input test values: Restaurant Name = `"Test Bakery"`, Owner Name = `"Tim Baker"`, Owner Email = `"tim@bakery.com"`, Owner Phone = `"8889991111"`. Keep plan duration as `30` days.
   - Click "Create Restaurant".
   - Verify that a success alert displays showing the generated temporary password for the owner.
   - Close the modal.

---

### Phase 2: Restaurant Directory & Dynamic Details Verify
1. **Navigate**: Click on the "Restaurants" navigation item in the left sidebar, or go to `http://localhost:7070/admin/restaurants`.
2. **Audit Directory Elements**:
   - Verify top summary badges (Total, Active, Trial) render.
   - Type `"Test"` in the search input and verify results filter.
   - Choose different Status or Plan selectors and ensure table responds.
3. **Audit Restaurant Details**:
   - Locate a restaurant in the directory list table (e.g. `"Test Bakery"` or a seeded restaurant) and click its name link or the "Visibility" icon button.
   - Verify the page redirects to `/admin/restaurants/[id]`.
   - Verify the Restaurant Identity Card displays the name, plan badge (e.g., `TRIAL`), status badge (e.g., `ACTIVE`), and owner email/phone.
   - Verify the quick action subscription changer form exists.
   - Verify the stats row displays: Total Orders, Revenue (MTD), Avg Rating, and Avg Prep Time.
   - Verify the Active Branches table, Top Staff Directory, and Recent Live Orders Feed render with correct content.
   - Test changing the subscription status in the quick actions form to `SUSPENDED` and clicking `Apply Subscription`. Verify the status badge updates to `SUSPENDED` on reload.

---

### Phase 3: Customers Management Verify
1. **Navigate**: Click on "Customers" in the left sidebar, or go to `http://localhost:7070/admin/customers`.
2. **Audit Customer Database**:
   - Verify the metrics row displays: Platform Customers, Active Accounts, Total Spent, and Churn Rate.
   - Search for a seeded customer (e.g., `"Elena"`) and verify search filters the list.
   - Locate a customer row and click their status toggle button (e.g., `"Active"` or `"Suspended"`). Verify the button labels toggle and save successfully.

---

### Phase 4: Performance Analytics Verify
1. **Navigate**: Click on "Analytics" in the left sidebar, or go to `http://localhost:7070/admin/analytics`.
2. **Audit Metrics & Charts**:
   - Verify the date picker filter dropdown and export button render.
   - Verify the metrics row (Platform Customers, Total Orders, Orders Today, Active Restaurants) displays.
   - Verify the "Restaurant Breakdown" performance table displays names, categories, order counts, dynamic revenue figures, and average ratings.
   - Verify the "Trending Categories" progress-bars widget lists categories with custom percentage fills.
   - Verify the "Live Operations" feed lists real-time logs in monospace font.

---

### Phase 5: Complaints Hub & Priority Resolution Verify
1. **Navigate**: Click on "Complaints" in the left sidebar, or go to `http://localhost:7070/admin/complaints`.
2. **Audit Complaints Log**:
   - Verify the urgency indicators (Total, Unresolved, Avg Resolution Time) render at the top.
   - Verify the "Gemini Prioritization Panel" displays priority alerts.
   - Filter complaints by category `FOOD_QUALITY` or urgency `CRITICAL`.
   - Click "View Full" on a complaint to navigate to `/admin/complaints/[id]`.
3. **Audit Complaint Detail Analysis**:
   - Verify the warning alert bar renders at the top if the complaint is marked critical.
   - Verify the original customer comment quote block renders inside a mint-shaded panel.
   - Verify the AI classification metrics card displays Urgency, Sentiment, and Category.
   - Verify the Gemini Summary card displays keyword tags.
   - Verify associated profiles (Restaurant and Customer) cards and star rating selector.
   - Click the "Mark as Resolved" action button. Verify success notification and verify status badge updates to `RESOLVED`.

---

### Phase 6: System Settings & Subscription Setup Verify
1. **Navigate**: Click on "Settings" in the left sidebar, or go to `http://localhost:7070/admin/settings`.
2. **Audit Settings**:
   - Verify the "Account Settings" form (Display name, email, password fields) displays.
   - Verify the "Platform Defaults" card displays. Use the trial days stepper `+` and `-` buttons to verify incrementing/decrementing of duration values.
   - Verify the Senior Admin avatar and session logs metadata card displays.
3. **Audit Default Plans Layout**:
   - Click the "Edit Defaults Detail" button on the Platform Defaults card, or navigate directly to `http://localhost:7070/admin/settings/plans`.
   - Verify the global impact warning card displays.
   - Verify toggle switches for "Auto-enable Loyalty Program" and "Manual Document Verification" exist.
   - Test toggle clicks and confirm they toggle between active/inactive.
   - Click "Discard" and verify settings return to their original values.
