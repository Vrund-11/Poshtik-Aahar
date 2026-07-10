import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const API_URL = 'http://localhost:5000/api/v1';
const prisma = new PrismaClient();

async function runTests() {
  console.log('🧪 Starting Authentication Verification Tests...');
  let testCustomerCookie: string | null = null;
  let testStaffCookie: string | null = null;

  // Helpers
  const parseCookie = (header: string | null, cookieName: string): string | null => {
    if (!header) return null;
    const cookies = header.split(';').map(c => c.trim());
    const target = cookies.find(c => c.startsWith(`${cookieName}=`));
    return target ? target.split('=')[1] : null;
  };

  // 1. Health Check
  console.log('\n--- 1. Testing Health Endpoint ---');
  const healthRes = await fetch(`${API_URL}/health`);
  console.log('Health Response Status:', healthRes.status);
  const healthData = await healthRes.json();
  console.log('Health Data:', healthData);

  // 2. Customer Registration
  console.log('\n--- 2. Testing Customer Registration ---');
  const uniqueEmail = `testuser_${Date.now()}@example.com`;
  const uniquePhone = `9898${Math.floor(100000 + Math.random() * 900000)}`;

  const registerRes = await fetch(`${API_URL}/auth/customer/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Verification User',
      email: uniqueEmail,
      phone: uniquePhone,
      password: 'testpassword123',
    }),
  });

  console.log('Register Customer Status:', registerRes.status);
  const registerData = await registerRes.json();
  console.log('Register Customer Data:', registerData);

  const customerCookieHeader = registerRes.headers.get('set-cookie');
  console.log('Register Set-Cookie Header:', customerCookieHeader);
  testCustomerCookie = parseCookie(customerCookieHeader, 'customerRefreshToken');
  console.log('Extracted Refresh Token Cookie:', testCustomerCookie);

  if (registerRes.status !== 200 || !registerData.accessToken || !testCustomerCookie) {
    throw new Error('Customer Registration Failed');
  }

  // 3. Customer Login
  console.log('\n--- 3. Testing Customer Login ---');
  const loginRes = await fetch(`${API_URL}/auth/customer/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: uniqueEmail,
      password: 'testpassword123',
    }),
  });

  console.log('Login Customer Status:', loginRes.status);
  const loginData = await loginRes.json();
  console.log('Login Customer Data:', loginData);

  const loginCookieHeader = loginRes.headers.get('set-cookie');
  testCustomerCookie = parseCookie(loginCookieHeader, 'customerRefreshToken');
  console.log('Login Refresh Token Cookie:', testCustomerCookie);

  if (loginRes.status !== 200 || !loginData.accessToken || !testCustomerCookie) {
    throw new Error('Customer Login Failed');
  }

  // 4. Customer Refresh Token Rotation
  console.log('\n--- 4. Testing Customer Token Refresh Rotation ---');
  const refreshRes = await fetch(`${API_URL}/auth/customer/refresh`, {
    method: 'POST',
    headers: {
      'Cookie': `customerRefreshToken=${testCustomerCookie}`,
    },
  });

  console.log('Refresh Customer Status:', refreshRes.status);
  const refreshData = await refreshRes.json();
  console.log('Refresh Customer Data:', refreshData);

  const refreshCookieHeader = refreshRes.headers.get('set-cookie');
  const rotatedCookie = parseCookie(refreshCookieHeader, 'customerRefreshToken');
  console.log('Rotated Refresh Token Cookie:', rotatedCookie);

  if (refreshRes.status !== 200 || !refreshData.accessToken || !rotatedCookie) {
    throw new Error('Customer Refresh Failed');
  }
  if (rotatedCookie === testCustomerCookie) {
    throw new Error('Refresh Token Rotation Failed: Cookie did not change!');
  }
  testCustomerCookie = rotatedCookie;

  // 5. Staff Login (Owner, Manager, Chef)
  console.log('\n--- 5. Testing Staff Login (Owner) ---');
  const ownerLoginRes = await fetch(`${API_URL}/auth/staff/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'owner@vintage.com',
      password: 'password123',
    }),
  });

  console.log('Owner Login Status:', ownerLoginRes.status);
  const ownerLoginData = await ownerLoginRes.json();
  console.log('Owner Login Data:', ownerLoginData);

  const staffCookieHeader = ownerLoginRes.headers.get('set-cookie');
  testStaffCookie = parseCookie(staffCookieHeader, 'staffRefreshToken');
  console.log('Staff Refresh Token Cookie:', testStaffCookie);

  if (ownerLoginRes.status !== 200 || ownerLoginData.user.role !== 'OWNER' || !testStaffCookie) {
    throw new Error('Owner Login Failed');
  }

  console.log('\n--- Testing Staff Login (Manager) ---');
  const managerLoginRes = await fetch(`${API_URL}/auth/staff/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'manager@vintage.com',
      password: 'password123',
    }),
  });
  const managerLoginData = await managerLoginRes.json();
  console.log('Manager Login Status:', managerLoginRes.status, 'Role:', managerLoginData.user.role);
  if (managerLoginRes.status !== 200 || managerLoginData.user.role !== 'MANAGER') {
    throw new Error('Manager Login Failed');
  }

  console.log('\n--- Testing Staff Login (Chef) ---');
  const chefLoginRes = await fetch(`${API_URL}/auth/staff/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'chef@vintage.com',
      password: 'password123',
    }),
  });
  const chefLoginData = await chefLoginRes.json();
  console.log('Chef Login Status:', chefLoginRes.status, 'Role:', chefLoginData.user.role);
  if (chefLoginRes.status !== 200 || chefLoginData.user.role !== 'CHEF') {
    throw new Error('Chef Login Failed');
  }

  // 6. Admin Login
  console.log('\n--- 6. Testing Admin Login ---');
  const adminLoginRes = await fetch(`${API_URL}/auth/staff/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@foodmart.com',
      password: 'adminpassword',
    }),
  });

  console.log('Admin Login Status:', adminLoginRes.status);
  const adminLoginData = await adminLoginRes.json();
  console.log('Admin Login Data:', adminLoginData);
  if (adminLoginRes.status !== 200 || adminLoginData.user.role !== 'ADMIN') {
    throw new Error('Admin Login Failed');
  }

  // 7. Owner Password Reset Flow
  console.log('\n--- 7. Testing Owner Forgot Password ---');
  const forgotRes = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'owner@vintage.com',
    }),
  });

  console.log('Forgot Password Status:', forgotRes.status);
  const forgotData = await forgotRes.json();
  console.log('Forgot Password Data:', forgotData);

  if (forgotRes.status !== 200) {
    throw new Error('Forgot Password Endpoint Failed');
  }

  // Get token directly from database to bypass email
  console.log('Querying reset token from DB...');
  const resetRecord = await prisma.passwordResetToken.findUnique({
    where: { email: 'owner@vintage.com' },
  });

  if (!resetRecord) {
    throw new Error('Reset token was not saved in DB!');
  }
  console.log('Found reset token in DB for owner@vintage.com');

  // Since the token stored in DB is hashed, we need the plain-text token.
  // Wait! In the controller, we generate a random 32-byte hex token, hash it, and store it in DB.
  // How do we get the plain token in the test?
  // Let's modify the forgot-password test to just check if the hash was created.
  // To test the reset-password endpoint, we need the plain token.
  // Wait! Let's temporarily inject a known token into the DB to test reset-password!
  console.log('Injecting mock reset token into DB...');
  const plainToken = 'verification_test_token_123456';
  const plainTokenHash = crypto.createHash('sha256').update(plainToken).digest('hex');
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.passwordResetToken.upsert({
    where: { email: 'owner@vintage.com' },
    update: { tokenHash: plainTokenHash, expiresAt },
    create: { email: 'owner@vintage.com', tokenHash: plainTokenHash, expiresAt },
  });

  console.log('Testing Reset Password using plain token...');
  const resetRes = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: plainToken,
      password: 'newownerpassword123',
    }),
  });

  console.log('Reset Password Status:', resetRes.status);
  const resetData = await resetRes.json();
  console.log('Reset Password Data:', resetData);

  if (resetRes.status !== 200) {
    throw new Error('Reset Password Failed');
  }

  // Verify login with new password
  console.log('Verifying login with new password...');
  const newLoginRes = await fetch(`${API_URL}/auth/staff/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'owner@vintage.com',
      password: 'newownerpassword123',
    }),
  });
  console.log('New Password Login Status:', newLoginRes.status);
  if (newLoginRes.status !== 200) {
    throw new Error('Login with new password failed');
  }

  // Restore owner password back to password123 for other parts of Phase 1/2/3
  console.log('Restoring owner password back to password123...');
  const restoredPasswordHash = await hashPassword('password123');
  await prisma.staff.update({
    where: { email: 'owner@vintage.com' },
    data: { passwordHash: restoredPasswordHash },
  });

  // Helpers
  async function hashPassword(password: string): Promise<string> {
    const PEPPER = process.env.AUTH_PEPPER || 'ab4635b64c94a24fb7ddaa466e6f1209b2d979e2805a50b080a84f4e737a22ff';
    const pepperedPassword = password + PEPPER;
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(pepperedPassword, salt);
  }

  console.log('\n🎉 ALL AUTHENTICATION ENDPOINTS VERIFIED SUCCESSFULLY!');
}

runTests()
  .catch((e) => {
    console.error('❌ Verification failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
