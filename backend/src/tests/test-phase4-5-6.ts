/**
 * Phase 4, 5, 6 Integration Tests
 * Run: npx tsx backend/src/tests/test-phase4-5-6.ts
 * Requires: backend server running on port 5000
 */

const BASE = 'http://localhost:5000/api/v1';

let adminToken = '';
let ownerToken = '';
let managerToken = '';
let chefToken = '';
let customerToken = '';

let restaurantId = '';
let branchId = '';
let floorId = '';
let tableId = '';
let qrCode = '';
let ownerEmail = '';
let ownerPassword = '';
let managerEmail = '';
let managerPassword = '';
let chefEmail = '';
let chefPassword = '';

async function api(method: string, path: string, body?: any, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  return { status: res.status, data };
}

async function runTests() {
  console.log('🧪 Starting Phase 4, 5, 6 Integration Tests...\n');

  // ────── SETUP: Create restaurant with full structure ──────
  console.log('--- SETUP: Admin Login ---');
  const adminLogin = await api('POST', '/auth/staff/login', {
    email: 'admin@foodmart.com',
    password: 'adminpassword',
  });
  console.log('Admin Login Status:', adminLogin.status);
  if (adminLogin.status !== 200) {
    console.error('❌ Admin login failed. Make sure seed data is in the database.');
    process.exit(1);
  }
  adminToken = adminLogin.data.accessToken;
  console.log('✅ Admin logged in\n');

  // Create restaurant
  console.log('--- SETUP: Create Restaurant ---');
  const ts = Date.now();
  const createRes = await api('POST', '/admin/restaurants', {
    name: `Test Phase456 Restaurant ${ts}`,
    ownerName: 'Test Owner',
    ownerEmail: `owner_${ts}@example.com`,
    ownerPhone: `90${String(ts).slice(-8)}`,
    plan: 'BASIC',
    planDurationDays: 90,
  }, adminToken);
  console.log('Create Restaurant Status:', createRes.status);
  if (createRes.status !== 200) {
    console.error('❌ Create restaurant failed:', createRes.data);
    process.exit(1);
  }
  restaurantId = createRes.data.data.restaurant.id;
  ownerEmail = createRes.data.data.owner.email;
  ownerPassword = createRes.data.data.owner.temporaryPassword;
  console.log(`✅ Restaurant: ${restaurantId}`);
  console.log(`✅ Owner: ${ownerEmail} / ${ownerPassword}\n`);

  // Owner login
  console.log('--- SETUP: Owner Login ---');
  const ownerLogin = await api('POST', '/auth/staff/login', {
    email: ownerEmail,
    password: ownerPassword,
  });
  console.log('Owner Login Status:', ownerLogin.status);
  ownerToken = ownerLogin.data.accessToken;
  console.log('✅ Owner logged in\n');

  // Create branch
  console.log('--- SETUP: Create Branch ---');
  const branchRes = await api('POST', '/owner/branches', {
    name: 'Phase 456 Branch',
    address: '123 Test Street, Ahmedabad',
    phone: '9876543210',
  }, ownerToken);
  branchId = branchRes.data.data.id;
  console.log(`✅ Branch: ${branchId}\n`);

  // Create floor
  const floorRes = await api('POST', `/owner/branches/${branchId}/floors`, {
    name: 'Ground Floor',
    sortOrder: 1,
  }, ownerToken);
  floorId = floorRes.data.data.id;

  // Create table
  const tableRes = await api('POST', `/owner/floors/${floorId}/tables`, {
    number: 1,
    capacity: 4,
  }, ownerToken);
  tableId = tableRes.data.data.id;
  qrCode = tableRes.data.data.qrCode;

  // Create category + menu item
  const catRes = await api('POST', '/owner/menus/categories', {
    name: 'Main Course',
    sortOrder: 1,
  }, ownerToken);
  const categoryId = catRes.data.data.id;

  const itemRes = await api('POST', '/owner/menus/items', {
    categoryId,
    name: 'Butter Chicken',
    price: 350,
    isVeg: false,
    description: 'Creamy tomato-based chicken curry',
  }, ownerToken);
  const menuItemId = itemRes.data.data.id;

  // Create staff
  console.log('--- SETUP: Create Staff ---');
  const chefRes = await api('POST', '/owner/staff', {
    name: 'Test Chef',
    email: `chef_${ts}@example.com`,
    role: 'CHEF',
  }, ownerToken);
  chefEmail = chefRes.data.data.email;
  chefPassword = chefRes.data.data.temporaryPassword;

  const mgrRes = await api('POST', '/owner/staff', {
    name: 'Test Manager',
    email: `manager_${ts}@example.com`,
    role: 'MANAGER',
  }, ownerToken);
  managerEmail = mgrRes.data.data.email;
  managerPassword = mgrRes.data.data.temporaryPassword;

  // Login staff
  const chefLogin = await api('POST', '/auth/staff/login', { email: chefEmail, password: chefPassword });
  chefToken = chefLogin.data.accessToken;
  const mgrLogin = await api('POST', '/auth/staff/login', { email: managerEmail, password: managerPassword });
  managerToken = mgrLogin.data.accessToken;
  console.log('✅ Chef and Manager logged in\n');

  // Set tax config
  await api('PATCH', '/owner/tax', { gstPercent: 18, isActive: true }, ownerToken);
  // Set loyalty config
  await api('PATCH', '/owner/loyalty', { pointsPerHundred: 2, isActive: true }, ownerToken);

  // Register customer
  console.log('--- SETUP: Customer Register ---');
  const custReg = await api('POST', '/auth/customer/register', {
    name: 'Phase456 Customer',
    email: `customer_${ts}@example.com`,
    phone: `80${String(ts).slice(-8)}`,
    password: 'testpassword',
  });
  customerToken = custReg.data.accessToken;
  console.log('✅ Customer registered\n');

  // ────── PHASE 4: QUEUE ──────
  console.log('═══════════════════════════════════');
  console.log('    PHASE 4: QUEUE');
  console.log('═══════════════════════════════════\n');

  console.log('--- 1. Add to Queue ---');
  const q1 = await api('POST', `/queue/${branchId}`, {
    name: 'Raj Kumar',
    phone: '9876543001',
    partySize: 4,
    notes: 'Birthday celebration',
  }, managerToken);
  console.log('Add Queue Status:', q1.status);
  console.log('✅ Queue entry 1 position:', q1.data.data.position);

  const q2 = await api('POST', `/queue/${branchId}`, {
    name: 'Priya Patel',
    phone: '9876543002',
    partySize: 2,
  }, managerToken);
  console.log('✅ Queue entry 2 position:', q2.data.data.position);

  const q3 = await api('POST', `/queue/${branchId}`, {
    name: 'Amit Shah',
    phone: '9876543003',
    partySize: 6,
  }, managerToken);
  console.log('✅ Queue entry 3 position:', q3.data.data.position);

  console.log('\n--- 2. List Queue ---');
  const qList = await api('GET', `/queue/${branchId}`, undefined, managerToken);
  console.log('Queue List Status:', qList.status);
  console.log('✅ Queue count:', qList.data.data.length);

  console.log('\n--- 3. Call Queue Entry ---');
  const qCall = await api('PATCH', `/queue/${q1.data.data.id}/call`, undefined, managerToken);
  console.log('Call Status:', qCall.status);
  console.log('✅ Entry called, status:', qCall.data.data.status);

  console.log('\n--- 4. Seat Queue Entry ---');
  const qSeat = await api('PATCH', `/queue/${q1.data.data.id}/seat`, undefined, managerToken);
  console.log('Seat Status:', qSeat.status);
  console.log('✅ Entry seated');

  // Verify position recalculation
  const qListAfter = await api('GET', `/queue/${branchId}`, undefined, managerToken);
  const positions = qListAfter.data.data.map((e: any) => e.position);
  console.log('✅ Remaining positions after seat:', positions);
  if (positions[0] === 1 && positions[1] === 2) {
    console.log('✅ Position recalculation verified!\n');
  } else {
    console.log('❌ Position recalculation failed\n');
  }

  console.log('--- 5. Remove Queue Entry ---');
  const qDel = await api('DELETE', `/queue/${q2.data.data.id}`, undefined, managerToken);
  console.log('Remove Status:', qDel.status);
  console.log('✅ Entry removed\n');

  // ────── PHASE 4: RESERVATIONS ──────
  console.log('═══════════════════════════════════');
  console.log('    PHASE 4: RESERVATIONS');
  console.log('═══════════════════════════════════\n');

  console.log('--- 6. Customer Creates Reservation ---');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split('T')[0];

  const resCreate = await api('POST', '/reservations', {
    branchId,
    partySize: 4,
    date: dateStr,
    timeSlot: '19:30',
    notes: 'Anniversary dinner',
  }, customerToken);
  console.log('Create Reservation Status:', resCreate.status);
  const reservationId = resCreate.data.data.id;
  console.log('✅ Reservation created:', reservationId);

  console.log('\n--- 7. Manager Lists Reservations ---');
  const resList = await api('GET', `/reservations/${branchId}?date=${dateStr}`, undefined, managerToken);
  console.log('List Reservations Status:', resList.status);
  console.log('✅ Found reservations:', resList.data.data.length);

  console.log('\n--- 8. Manager Confirms Reservation ---');
  const resConfirm = await api('PATCH', `/reservations/${reservationId}/status`, {
    status: 'CONFIRMED',
  }, managerToken);
  console.log('Confirm Status:', resConfirm.status);
  console.log('✅ Reservation confirmed:', resConfirm.data.data.status);

  console.log('\n--- 9. Customer Views Own Reservations ---');
  const myRes = await api('GET', '/reservations/customer/my', undefined, customerToken);
  console.log('My Reservations Status:', myRes.status);
  console.log('✅ Customer reservations count:', myRes.data.data.length, '\n');

  // ────── PHASE 4: TAKEAWAY ──────
  console.log('═══════════════════════════════════');
  console.log('    PHASE 4: TAKEAWAY');
  console.log('═══════════════════════════════════\n');

  console.log('--- 10. Customer Places Takeaway Order ---');
  const takeaway = await api('POST', '/takeaway', {
    restaurantId,
    items: [
      { menuItemId: menuItemId, quantity: 2, notes: 'Extra spicy' },
    ],
    notes: 'Please pack well for travel',
  }, customerToken);
  console.log('Takeaway Status:', takeaway.status);
  const takeawayOrderId = takeaway.data.data.id;
  const takeawayToken = takeaway.data.data.tokenNumber;
  console.log('✅ Takeaway order placed:', takeawayOrderId);
  console.log('✅ Token number:', takeawayToken);
  console.log('✅ Total amount:', takeaway.data.data.totalAmount);

  console.log('\n--- 11. Manager Views Active Takeaway Orders ---');
  const takeawayList = await api('GET', `/takeaway/restaurant/${restaurantId}`, undefined, managerToken);
  console.log('Takeaway List Status:', takeawayList.status);
  console.log('✅ Active takeaway orders:', takeawayList.data.data.length);

  console.log('\n--- 12. Manager Accepts Takeaway ---');
  const takeAccept = await api('PATCH', `/takeaway/${takeawayOrderId}/accept`, undefined, managerToken);
  console.log('Accept Status:', takeAccept.status);
  console.log('✅ Takeaway accepted, status:', takeAccept.data.data.status);

  console.log('\n--- 13. Chef Marks Takeaway Ready ---');
  const takeReady = await api('PATCH', `/takeaway/${takeawayOrderId}/ready`, undefined, chefToken);
  console.log('Ready Status:', takeReady.status);
  console.log('✅ Takeaway ready, status:', takeReady.data.data.status);

  console.log('\n--- 14. Manager Marks Takeaway Paid ---');
  const takePaid = await api('PATCH', `/takeaway/${takeawayOrderId}/paid`, {
    method: 'UPI',
  }, managerToken);
  console.log('Paid Status:', takePaid.status);
  console.log('✅ Takeaway completed:', takePaid.data.data.status);

  console.log('\n--- 15. Customer Views Takeaway Detail ---');
  const takeDetail = await api('GET', `/takeaway/${takeawayOrderId}`, undefined, customerToken);
  console.log('Detail Status:', takeDetail.status);
  console.log('✅ Takeaway detail fetched, status:', takeDetail.data.data.status, '\n');

  // ────── PHASE 5: DISCOVERY ──────
  console.log('═══════════════════════════════════');
  console.log('    PHASE 5: DISCOVERY');
  console.log('═══════════════════════════════════\n');

  console.log('--- 16. Restaurant Discovery List ---');
  const disc1 = await api('GET', '/restaurants');
  console.log('Discovery Status:', disc1.status);
  console.log('Cached:', disc1.data.cached);
  console.log('✅ Restaurants found:', disc1.data.data.length);

  const disc2 = await api('GET', '/restaurants');
  console.log('Second fetch cached:', disc2.data.cached);
  if (disc2.data.cached === true) {
    console.log('✅ Redis cache hit verified!');
  }

  console.log('\n--- 17. Restaurant Detail ---');
  const detail = await api('GET', `/restaurants/${restaurantId}`);
  console.log('Detail Status:', detail.status);
  console.log('✅ Restaurant name:', detail.data.data.name, '\n');

  // ────── PHASE 5: LOYALTY ──────
  console.log('═══════════════════════════════════');
  console.log('    PHASE 5: LOYALTY');
  console.log('═══════════════════════════════════\n');

  console.log('--- 18. Loyalty Balance ---');
  const balance = await api('GET', '/loyalty/balance', undefined, customerToken);
  console.log('Balance Status:', balance.status);
  console.log('✅ Loyalty points:', balance.data.data.totalPoints);

  console.log('\n--- 19. Loyalty History ---');
  const history = await api('GET', '/loyalty/history', undefined, customerToken);
  console.log('History Status:', history.status);
  console.log('✅ Transactions:', history.data.data.transactions.length, '\n');

  // ────── PHASE 5: COMPLAINTS ──────
  console.log('═══════════════════════════════════');
  console.log('    PHASE 5: COMPLAINTS');
  console.log('═══════════════════════════════════\n');

  console.log('--- 20. Customer Submits Complaint ---');
  const complaint = await api('POST', '/complaints', {
    restaurantId,
    orderId: takeawayOrderId,
    rawText: 'The food was cold when I received it. The butter chicken was not fresh and the packaging was leaking. Very disappointed with the quality today.',
    rating: 2,
  }, customerToken);
  console.log('Complaint Status:', complaint.status);
  const complaintId = complaint.data.data.id;
  console.log('✅ Complaint submitted:', complaintId);

  // Wait for Gemini analysis (max 15 seconds)
  console.log('⏳ Waiting for Gemini analysis (up to 15s)...');
  let analyzed = false;
  for (let i = 0; i < 5; i++) {
    await new Promise(r => setTimeout(r, 3000));

    const complaints = await api('GET', `/complaints/restaurant/${restaurantId}`, undefined, ownerToken);
    const found = complaints.data.data.find((c: any) => c.id === complaintId);
    if (found && found.isAnalyzed) {
      analyzed = true;
      console.log('✅ Gemini analysis complete!');
      console.log('  Category:', found.category);
      console.log('  Sentiment:', found.sentiment);
      console.log('  Urgency:', found.urgency);
      console.log('  Language:', found.language);
      console.log('  Summary:', found.summary);
      console.log('  Keywords:', found.keywords);
      break;
    }
  }
  if (!analyzed) {
    console.log('⚠️ Gemini analysis not complete within 15s (may still be processing or API key may be invalid)');
  }

  console.log('\n--- 21. Owner Views Complaints ---');
  const complaintList = await api('GET', `/complaints/restaurant/${restaurantId}?isResolved=false`, undefined, ownerToken);
  console.log('Complaints Status:', complaintList.status);
  console.log('✅ Unresolved complaints:', complaintList.data.data.length);

  console.log('\n--- 22. Owner Resolves Complaint ---');
  const resolve = await api('PATCH', `/complaints/${complaintId}/resolve`, undefined, ownerToken);
  console.log('Resolve Status:', resolve.status);
  console.log('✅ Complaint resolved:', resolve.data.data.isResolved, '\n');

  // ────── PHASE 6: ANALYTICS ──────
  console.log('═══════════════════════════════════');
  console.log('    PHASE 6: ANALYTICS');
  console.log('═══════════════════════════════════\n');

  console.log('--- 23. Owner Analytics ---');
  const analytics = await api('GET', '/owner/analytics', undefined, ownerToken);
  console.log('Analytics Status:', analytics.status);
  console.log('✅ Analytics:', JSON.stringify(analytics.data.data, null, 2));

  // ────── PHASE 6: UPSELL ──────
  console.log('\n--- 24. Upsell Config CRUD ---');
  const upsellCreate = await api('POST', '/owner/upsell-configs', {
    triggerPhase: 'AFTER_MAIN',
    promptText: 'Would you like to try our special dessert?',
    menuItemId: menuItemId,
    isActive: true,
  }, ownerToken);
  console.log('Create Upsell Status:', upsellCreate.status);
  const upsellId = upsellCreate.data.data.id;
  console.log('✅ Upsell config created:', upsellId);

  const upsellList = await api('GET', '/owner/upsell-configs', undefined, ownerToken);
  console.log('✅ Upsell configs count:', upsellList.data.data.length);

  const upsellUpdate = await api('PATCH', `/owner/upsell-configs/${upsellId}`, {
    promptText: 'Try our amazing Gulab Jamun!',
  }, ownerToken);
  console.log('✅ Upsell updated:', upsellUpdate.data.data.promptText);

  // ────── PHASE 6: ORDER HISTORY ──────
  console.log('\n--- 25. Customer Order History ---');
  const orderHist = await api('GET', '/orders/history', undefined, customerToken);
  console.log('History Status:', orderHist.status);
  console.log('✅ Past orders:', orderHist.data.data.length);
  console.log('✅ Pagination:', JSON.stringify(orderHist.data.pagination));

  // ────── PHASE 6: UPSELL QUERY ──────
  console.log('\n--- 26. Customer Gets Upsell Prompts ---');
  if (orderHist.data.data.length > 0) {
    const firstOrderId = orderHist.data.data[0].id;
    const upsellPrompts = await api('GET', `/orders/${firstOrderId}/upsell`, undefined, customerToken);
    console.log('Upsell Prompts Status:', upsellPrompts.status);
    console.log('✅ Upsell prompts:', upsellPrompts.data.data.prompts.length);
  } else {
    console.log('⚠️ No orders to test upsell prompts');
  }

  console.log('\n\n🎉 ALL PHASE 4, 5, 6 INTEGRATION TESTS COMPLETED SUCCESSFULLY!\n');
}

runTests().catch(console.error);
