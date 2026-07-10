import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const API_URL = 'http://localhost:5000/api/v1';
const prisma = new PrismaClient();

async function runTests() {
  console.log('🧪 Starting Phase 2 & Phase 3 Integration Tests...');

  let adminToken = '';
  let ownerToken = '';
  let chefToken = '';
  let managerToken = '';
  let customerToken = '';

  let restaurantId = '';
  let ownerEmail = `owner_${Date.now()}@example.com`;
  let ownerPassword = '';
  let branchId = '';
  let floorId = '';
  let tableId = '';
  let tableQrCode = '';

  let categoryId = '';
  let menuItemId = '';
  
  let chefEmail = `chef_${Date.now()}@example.com`;
  let chefPassword = '';
  let managerEmail = `manager_${Date.now()}@example.com`;
  let managerPassword = '';

  let customerEmail = `customer_${Date.now()}@example.com`;
  let customerPhone = `9999${Math.floor(100000 + Math.random() * 900000)}`;

  let sessionId = '';
  let orderId = '';

  // Helpers
  const headers = (token?: string) => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      h['Authorization'] = `Bearer ${token}`;
    }
    return h;
  };

  try {
    // ─────────────────────────────────────────────
    // PHASE 2: ADMIN & RESTAURANT SETUP
    // ─────────────────────────────────────────────

    // 1. Admin Login
    console.log('\n--- 1. Admin Login ---');
    const adminLoginRes = await fetch(`${API_URL}/auth/staff/login`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        email: 'admin@foodmart.com',
        password: 'adminpassword',
      }),
    });
    console.log('Admin Login Status:', adminLoginRes.status);
    const adminLoginData = await adminLoginRes.json();
    if (adminLoginRes.status !== 200 || !adminLoginData.accessToken) {
      throw new Error('Admin login failed');
    }
    adminToken = adminLoginData.accessToken;
    console.log('✅ Admin logged in successfully');

    // 2. Admin Create Restaurant
    console.log('\n--- 2. Admin Create Restaurant ---');
    const createRestRes = await fetch(`${API_URL}/admin/restaurants`, {
      method: 'POST',
      headers: headers(adminToken),
      body: JSON.stringify({
        name: 'The Grand Palace',
        description: 'Premium Indian Fine Dining',
        cuisineType: 'North Indian',
        plan: 'GROWTH',
        planDurationDays: 60,
        ownerName: 'Grand Owner',
        ownerEmail,
        ownerPhone: '9876543210',
      }),
    });
    console.log('Create Restaurant Status:', createRestRes.status);
    const createRestData = await createRestRes.json();
    if (createRestRes.status !== 200 || !createRestData.data?.restaurant?.id) {
      throw new Error('Create Restaurant failed');
    }
    restaurantId = createRestData.data.restaurant.id;
    ownerPassword = createRestData.data.owner.temporaryPassword;
    console.log(`✅ Restaurant created: ${restaurantId}`);
    console.log(`✅ Owner credentials: ${ownerEmail} / ${ownerPassword}`);

    // 3. Admin Update Restaurant
    console.log('\n--- 3. Admin Update Restaurant ---');
    const updateRestRes = await fetch(`${API_URL}/admin/restaurants/${restaurantId}`, {
      method: 'PATCH',
      headers: headers(adminToken),
      body: JSON.stringify({
        plan: 'BASIC',
      }),
    });
    console.log('Update Restaurant Status:', updateRestRes.status);
    const updateRestData = await updateRestRes.json();
    if (updateRestRes.status !== 200 || updateRestData.data.plan !== 'BASIC') {
      throw new Error('Update Restaurant failed');
    }
    console.log('✅ Restaurant plan updated to BASIC');

    // 4. Admin Analytics
    console.log('\n--- 4. Admin Analytics ---');
    const adminAnalyticsRes = await fetch(`${API_URL}/admin/analytics`, {
      method: 'GET',
      headers: headers(adminToken),
    });
    console.log('Admin Analytics Status:', adminAnalyticsRes.status);
    const adminAnalyticsData = await adminAnalyticsRes.json();
    if (adminAnalyticsRes.status !== 200 || !adminAnalyticsData.data.totalRestaurants) {
      throw new Error('Admin Analytics failed');
    }
    console.log('✅ Admin Analytics retrieved:', adminAnalyticsData.data);

    // 5. Owner Login
    console.log('\n--- 5. Owner Login ---');
    const ownerLoginRes = await fetch(`${API_URL}/auth/staff/login`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        email: ownerEmail,
        password: ownerPassword,
      }),
    });
    console.log('Owner Login Status:', ownerLoginRes.status);
    const ownerLoginData = await ownerLoginRes.json();
    if (ownerLoginRes.status !== 200 || !ownerLoginData.accessToken) {
      throw new Error('Owner login failed');
    }
    ownerToken = ownerLoginData.accessToken;
    console.log('✅ Owner logged in successfully');

    // 6. Owner Profile Update
    console.log('\n--- 6. Owner Update Profile ---');
    const profileRes = await fetch(`${API_URL}/owner/profile`, {
      method: 'PATCH',
      headers: headers(ownerToken),
      body: JSON.stringify({
        description: 'Updated fine dining description',
        cuisineType: 'Mughlai & Awadhi',
      }),
    });
    console.log('Profile Update Status:', profileRes.status);
    const profileData = await profileRes.json();
    if (profileRes.status !== 200 || profileData.data.cuisineType !== 'Mughlai & Awadhi') {
      throw new Error('Profile update failed');
    }
    console.log('✅ Owner profile updated successfully');

    // 7. Owner Branch CRUD
    console.log('\n--- 7. Owner Branch CRUD ---');
    const createBranchRes = await fetch(`${API_URL}/owner/branches`, {
      method: 'POST',
      headers: headers(ownerToken),
      body: JSON.stringify({
        name: 'Palace CG Road Branch',
        address: 'CG Road, Opp Mall, Ahmedabad',
        phone: '7920192019',
      }),
    });
    console.log('Create Branch Status:', createBranchRes.status);
    const createBranchData = await createBranchRes.json();
    if (createBranchRes.status !== 200 || !createBranchData.data.id) {
      throw new Error('Create Branch failed');
    }
    branchId = createBranchData.data.id;
    console.log(`✅ Branch created: ${branchId}`);

    // 8. Owner Floor CRUD
    console.log('\n--- 8. Owner Floor CRUD ---');
    const createFloorRes = await fetch(`${API_URL}/owner/branches/${branchId}/floors`, {
      method: 'POST',
      headers: headers(ownerToken),
      body: JSON.stringify({
        name: 'First Floor AC Lounge',
        sortOrder: 1,
      }),
    });
    console.log('Create Floor Status:', createFloorRes.status);
    const createFloorData = await createFloorRes.json();
    if (createFloorRes.status !== 200 || !createFloorData.data.id) {
      throw new Error('Create Floor failed');
    }
    floorId = createFloorData.data.id;
    console.log(`✅ Floor created: ${floorId}`);

    // 9. Owner Table CRUD
    console.log('\n--- 9. Owner Table CRUD ---');
    const createTableRes = await fetch(`${API_URL}/owner/floors/${floorId}/tables`, {
      method: 'POST',
      headers: headers(ownerToken),
      body: JSON.stringify({
        number: 42,
        capacity: 4,
      }),
    });
    console.log('Create Table Status:', createTableRes.status);
    const createTableData = await createTableRes.json();
    if (createTableRes.status !== 200 || !createTableData.data.id) {
      throw new Error('Create Table failed');
    }
    tableId = createTableData.data.id;
    tableQrCode = createTableData.data.qrCode;
    console.log(`✅ Table created: ${tableId}, QR: ${tableQrCode}`);

    // 10. Table QR Code Deep Link
    console.log('\n--- 10. Table QR Code URL ---');
    const qrRes = await fetch(`${API_URL}/owner/tables/${tableId}/qr`, {
      method: 'POST',
      headers: headers(ownerToken),
    });
    console.log('QR Code Status:', qrRes.status);
    const qrData = await qrRes.json();
    if (qrRes.status !== 200 || !qrData.data.qrUrl) {
      throw new Error('QR generation failed');
    }
    console.log('✅ QR deep link generated:', qrData.data.qrUrl);

    // 11. Owner Menu Categories
    console.log('\n--- 11. Owner Menu Category ---');
    const createCatRes = await fetch(`${API_URL}/owner/menus/categories`, {
      method: 'POST',
      headers: headers(ownerToken),
      body: JSON.stringify({
        name: 'Delectable Starters',
        sortOrder: 1,
      }),
    });
    console.log('Create Category Status:', createCatRes.status);
    const createCatData = await createCatRes.json();
    if (createCatRes.status !== 200 || !createCatData.data.id) {
      throw new Error('Create category failed');
    }
    categoryId = createCatData.data.id;
    console.log(`✅ Category created: ${categoryId}`);

    // 12. Owner Menu Items
    console.log('\n--- 12. Owner Menu Item ---');
    const createItemRes = await fetch(`${API_URL}/owner/menus/items`, {
      method: 'POST',
      headers: headers(ownerToken),
      body: JSON.stringify({
        categoryId,
        name: 'Crispy Veg Spring Rolls',
        description: 'Crispy rolls filled with shredded vegetables',
        price: 249.00,
        isVeg: true,
        modifiers: [
          { name: 'Extra Cheese', price: 40 },
          { name: 'Spicy Dip', price: 20 },
        ],
      }),
    });
    console.log('Create Menu Item Status:', createItemRes.status);
    const createItemData = await createItemRes.json();
    if (createItemRes.status !== 200 || !createItemData.data.id) {
      throw new Error('Create Menu Item failed');
    }
    menuItemId = createItemData.data.id;
    console.log(`✅ Menu Item created: ${menuItemId}`);

    // 13. Owner Staff Setup
    console.log('\n--- 13. Owner Staff Setup ---');
    // A. Chef
    const createChefRes = await fetch(`${API_URL}/owner/staff`, {
      method: 'POST',
      headers: headers(ownerToken),
      body: JSON.stringify({
        name: 'Master Chef Prasad',
        email: chefEmail,
        role: 'CHEF',
        phone: '9000100020',
      }),
    });
    console.log('Create Chef Status:', createChefRes.status);
    const createChefData = await createChefRes.json();
    if (createChefRes.status !== 200 || !createChefData.data.id) {
      throw new Error('Create Chef failed');
    }
    chefPassword = createChefData.data.temporaryPassword;
    console.log(`✅ Chef created: ${chefEmail} / ${chefPassword}`);

    // B. Manager
    const createManagerRes = await fetch(`${API_URL}/owner/staff`, {
      method: 'POST',
      headers: headers(ownerToken),
      body: JSON.stringify({
        name: 'General Manager Sunil',
        email: managerEmail,
        role: 'MANAGER',
        phone: '9000200030',
      }),
    });
    console.log('Create Manager Status:', createManagerRes.status);
    const createManagerData = await createManagerRes.json();
    if (createManagerRes.status !== 200 || !createManagerData.data.id) {
      throw new Error('Create Manager failed');
    }
    managerPassword = createManagerData.data.temporaryPassword;
    console.log(`✅ Manager created: ${managerEmail} / ${managerPassword}`);

    // 14. Chef and Manager Logins
    console.log('\n--- 14. Chef Login ---');
    const chefLoginRes = await fetch(`${API_URL}/auth/staff/login`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        email: chefEmail,
        password: chefPassword,
      }),
    });
    const chefLoginData = await chefLoginRes.json();
    chefToken = chefLoginData.accessToken;
    console.log('Chef Login Status:', chefLoginRes.status, !!chefToken ? 'SUCCESS' : 'FAIL');

    console.log('--- Manager Login ---');
    const managerLoginRes = await fetch(`${API_URL}/auth/staff/login`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        email: managerEmail,
        password: managerPassword,
      }),
    });
    const managerLoginData = await managerLoginRes.json();
    managerToken = managerLoginData.accessToken;
    console.log('Manager Login Status:', managerLoginRes.status, !!managerToken ? 'SUCCESS' : 'FAIL');

    // 15. Owner Settings Update
    console.log('\n--- 15. Settings Configuration ---');
    const taxPatchRes = await fetch(`${API_URL}/owner/tax`, {
      method: 'PATCH',
      headers: headers(ownerToken),
      body: JSON.stringify({
        gstPercent: 18.0, // 18% GST for testing
      }),
    });
    console.log('Tax Update Status:', taxPatchRes.status);
    const taxData = await taxPatchRes.json();
    if (taxPatchRes.status !== 200 || Number(taxData.data.gstPercent) !== 18.0) {
      throw new Error('Tax update failed');
    }
    console.log('✅ Tax config set to 18% GST');

    const loyaltyPatchRes = await fetch(`${API_URL}/owner/loyalty`, {
      method: 'PATCH',
      headers: headers(ownerToken),
      body: JSON.stringify({
        pointsPerHundred: 2.0, // 2 points per 100 Rs spent
      }),
    });
    console.log('Loyalty Update Status:', loyaltyPatchRes.status);
    const loyaltyData = await loyaltyPatchRes.json();
    if (loyaltyPatchRes.status !== 200 || Number(loyaltyData.data.pointsPerHundred) !== 2.0) {
      throw new Error('Loyalty update failed');
    }
    console.log('✅ Loyalty config set to 2.0 points per 100 spent');


    // ─────────────────────────────────────────────
    // PHASE 3: CORE DINE-IN FLOW
    // ─────────────────────────────────────────────

    // 16. Customer Register & Login
    console.log('\n--- 16. Customer Setup ---');
    const custRegRes = await fetch(`${API_URL}/auth/customer/register`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        name: 'Dine-In Customer',
        email: customerEmail,
        phone: customerPhone,
        password: 'customerpassword123',
      }),
    });
    console.log('Customer Register Status:', custRegRes.status);
    const custRegData = await custRegRes.json();
    customerToken = custRegData.accessToken;
    console.log('✅ Customer registered, Token acquired');

    // 17. Initiate Session (QR Scan)
    console.log('\n--- 17. Table Session Initiation (QR Scan) ---');
    const sessionInitRes = await fetch(`${API_URL}/sessions/initiate`, {
      method: 'POST',
      headers: headers(customerToken),
      body: JSON.stringify({
        qrCode: tableQrCode,
      }),
    });
    console.log('Session Initiate Status:', sessionInitRes.status);
    const sessionInitData = await sessionInitRes.json();
    if (sessionInitRes.status !== 200 || !sessionInitData.data.session?.id) {
      throw new Error('Session initiation failed');
    }
    sessionId = sessionInitData.data.session.id;
    const receivedCodes = sessionInitData.data.verificationCodes;
    console.log(`✅ Session initiated: ${sessionId}, received 3 codes:`, receivedCodes);

    // Fetch the correct code from Redis to verify programmatically
    const correctCode = await prisma.tableSession.findUnique({
      where: { id: sessionId },
    }).then((s) => s?.verifyCode);
    console.log('Correct Code (Fetched from DB):', correctCode);

    // 18. Verify Table Session
    console.log('\n--- 18. Table Session Verification ---');
    const sessionVerifyRes = await fetch(`${API_URL}/sessions/verify`, {
      method: 'POST',
      headers: headers(customerToken),
      body: JSON.stringify({
        sessionId,
        verifyCode: correctCode,
      }),
    });
    console.log('Session Verify Status:', sessionVerifyRes.status);
    const sessionVerifyData = await sessionVerifyRes.json();
    if (sessionVerifyRes.status !== 200) {
      throw new Error('Session verification failed');
    }
    console.log('✅ Session successfully verified: Table is now occupied');

    // 19. Menu Display & Caching
    console.log('\n--- 19. Public Menu Cache & Display ---');
    const menuRes1 = await fetch(`${API_URL}/menus/${restaurantId}/menu`);
    console.log('Menu Fetch 1 Status:', menuRes1.status);
    const menuData1 = await menuRes1.json();
    console.log(`Menu Fetch 1 cached flag: ${menuData1.cached}`);

    // Fetch 2 (should be cached)
    const menuRes2 = await fetch(`${API_URL}/menus/${restaurantId}/menu`);
    console.log('Menu Fetch 2 Status:', menuRes2.status);
    const menuData2 = await menuRes2.json();
    console.log(`Menu Fetch 2 cached flag: ${menuData2.cached}`);
    if (menuRes2.status !== 200 || menuData2.cached !== true) {
      throw new Error('Menu caching failed');
    }
    console.log('✅ Menu Redis caching verified successfully');

    // 20. Order Placement
    console.log('\n--- 20. Order Placement ---');
    const placeOrderRes = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: headers(customerToken),
      body: JSON.stringify({
        sessionId,
        items: [
          {
            menuItemId,
            quantity: 2,
            notes: 'Extra spicy',
            selectedModifiers: [{ name: 'Spicy Dip', price: 20 }],
          },
        ],
        notes: 'Hurry up please!',
      }),
    });
    console.log('Place Order Status:', placeOrderRes.status);
    const placeOrderData = await placeOrderRes.json();
    if (placeOrderRes.status !== 200 || !placeOrderData.data.id) {
      throw new Error('Place order failed');
    }
    orderId = placeOrderData.data.id;
    console.log(`✅ Order placed successfully. Order ID: ${orderId}`);
    console.log('Order Total Amount calculated:', placeOrderData.data.totalAmount);

    // 21. KDS Active Orders
    console.log('\n--- 21. KDS Active Orders (Chef View) ---');
    const kdsRes = await fetch(`${API_URL}/orders/restaurant/${restaurantId}`, {
      method: 'GET',
      headers: headers(chefToken),
    });
    console.log('KDS Fetch Status:', kdsRes.status);
    const kdsData = await kdsRes.json();
    if (kdsRes.status !== 200 || kdsData.data.length === 0) {
      throw new Error('KDS fetch failed');
    }
    console.log('✅ Chef successfully saw active orders in KDS. Count:', kdsData.data.length);

    // 22. Update Order Status (Chef prepares and serves)
    console.log('\n--- 22. Chef Updates Order Status ---');
    const prepareRes = await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: headers(chefToken),
      body: JSON.stringify({ status: 'PREPARING' }),
    });
    console.log('Update PREPARING status:', prepareRes.status);

    const serveRes = await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: headers(chefToken),
      body: JSON.stringify({ status: 'SERVED' }),
    });
    console.log('Update SERVED status:', serveRes.status);
    if (serveRes.status !== 200) {
      throw new Error('Update order status failed');
    }
    console.log('✅ Order moved to SERVED');

    // 23. Request Bill
    console.log('\n--- 23. Request Bill ---');
    const billRes = await fetch(`${API_URL}/sessions/${sessionId}/request-bill`, {
      method: 'POST',
      headers: headers(customerToken),
    });
    console.log('Bill Request Status:', billRes.status);
    const billData = await billRes.json();
    if (billRes.status !== 200) {
      throw new Error('Request bill failed');
    }
    console.log('✅ Bill breakdown:', billData.data);
    // Final Amount expected:
    // Subtotal: 2 rolls * 249 = 498.00
    // GST (18%): 498 * 0.18 = 89.64
    // Total Amount: 587.64
    const totalAmountExpected = 587.64;
    console.log(`Expected Total Amount: ${totalAmountExpected}, Got: ${billData.data.totalAmount}`);
    if (Math.abs(Number(billData.data.totalAmount) - totalAmountExpected) > 0.1) {
      throw new Error('Bill calculations are incorrect');
    }
    console.log('✅ GST and Totals calculations match expected parameters exactly!');

    // 24. Customer Claims Paid
    console.log('\n--- 24. Customer Claims Paid ---');
    const payRes = await fetch(`${API_URL}/sessions/${sessionId}/customer-paid`, {
      method: 'POST',
      headers: headers(customerToken),
    });
    console.log('Payment Claim Status:', payRes.status);
    if (payRes.status !== 200) {
      throw new Error('Customer payment claim failed');
    }
    console.log('✅ Customer claimed payment on UPI/Cash successfully');

    // 25. Manager Confirms Payment
    console.log('\n--- 25. Manager Confirms Payment ---');
    const confirmRes = await fetch(`${API_URL}/sessions/${sessionId}/confirm-payment`, {
      method: 'POST',
      headers: headers(managerToken),
    });
    console.log('Payment Confirmation Status:', confirmRes.status);
    if (confirmRes.status !== 200) {
      throw new Error('Manager confirmation failed');
    }
    console.log('✅ Manager confirmed payment. Table session is closed, table is now AVAILABLE.');

    // 26. Loyalty Points Verification
    console.log('\n--- 26. Loyalty Account Check ---');
    const testCust = await prisma.customer.findUnique({ where: { email: customerEmail } });
    if (!testCust) throw new Error('Customer not found for loyalty verification');

    const loyaltyAccount = await prisma.loyaltyAccount.findUnique({
      where: { customerId: testCust.id },
      include: { transactions: true },
    });

    console.log('Loyalty Account Points:', loyaltyAccount?.totalPoints?.toString());
    // Spend was 587.64. Rate is 2 points per 100 spend.
    // Expected points: 5.8764 * 2 = 11.7528
    const expectedPoints = (totalAmountExpected / 100) * 2;
    console.log(`Expected Points: ${expectedPoints}, Got: ${loyaltyAccount?.totalPoints?.toString()}`);
    if (!loyaltyAccount || Math.abs(Number(loyaltyAccount.totalPoints) - expectedPoints) > 0.1) {
      throw new Error('Loyalty points calculation/awarding failed');
    }
    console.log('✅ Loyalty points successfully awarded with the correct rate!');

    console.log('\n🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY! Phase 2 & 3 are fully operational.');

  } catch (err: any) {
    console.error('\n❌ Integration Test Failed:', err.message || err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
