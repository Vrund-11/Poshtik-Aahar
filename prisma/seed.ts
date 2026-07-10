import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load env variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

const PEPPER = process.env.AUTH_PEPPER || 'ab4635b64c94a24fb7ddaa466e6f1209b2d979e2805a50b080a84f4e737a22ff';

async function hashPassword(password: string): Promise<string> {
  const pepperedPassword = password + PEPPER;
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(pepperedPassword, salt);
}

async function main() {
  console.log("🌱 Full Seed script starting...");

  // ─── CLEAN ───────────────────────────────────
  console.log("Cleaning database...");
  await prisma.adminSession.deleteMany({});
  await prisma.customerSession.deleteMany({});
  await prisma.staffSession.deleteMany({});
  await prisma.passwordResetToken.deleteMany({});
  await prisma.sessionPayment.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.tableSession.deleteMany({});
  await prisma.table.deleteMany({});
  await prisma.floor.deleteMany({});
  await prisma.queue.deleteMany({});
  await prisma.reservation.deleteMany({});
  await prisma.branch.deleteMany({});
  await prisma.staff.deleteMany({});
  await prisma.menuItem.deleteMany({});
  await prisma.menuCategory.deleteMany({});
  await prisma.menu.deleteMany({});
  await prisma.loyaltyTransaction.deleteMany({});
  await prisma.loyaltyAccount.deleteMany({});
  await prisma.loyaltyConfig.deleteMany({});
  await prisma.complaint.deleteMany({});
  await prisma.taxConfig.deleteMany({});
  await prisma.upsellConfig.deleteMany({});
  await prisma.restaurantPhoto.deleteMany({});
  await prisma.restaurant.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.admin.deleteMany({});

  // ─── ADMIN ────────────────────────────────────
  const adminPasswordHash = await hashPassword(process.env.ADMIN_PASSWORD || "adminpassword");
  const admin = await prisma.admin.create({
    data: { name: "System Admin", email: process.env.ADMIN_EMAIL || "admin@foodmart.com", passwordHash: adminPasswordHash },
  });
  console.log(`✅ Admin: ${admin.email}`);

  // ─── CUSTOMERS (25) ───────────────────────────
  const customerPasswordHash = await hashPassword("customerpassword");
  const customerNames = [
    { name: "Rahul Patel",      email: "rahul@gmail.com",     phone: "9876543210" },
    { name: "Priya Sharma",     email: "priya@gmail.com",     phone: "9876543211" },
    { name: "Amit Verma",       email: "amit@gmail.com",      phone: "9876543212" },
    { name: "Sneha Reddy",      email: "sneha@gmail.com",     phone: "9876543213" },
    { name: "Vikram Malhotra",  email: "vikram@gmail.com",    phone: "9876543214" },
    { name: "Anjali Gupta",     email: "anjali@gmail.com",    phone: "9876543215" },
    { name: "Rohan Das",        email: "rohan@gmail.com",     phone: "9876543216" },
    { name: "Karan Singh",      email: "karan@gmail.com",     phone: "9876543217" },
    { name: "Pooja Mehta",      email: "pooja@gmail.com",     phone: "9876543218" },
    { name: "Suresh Iyer",      email: "suresh@gmail.com",    phone: "9876543219" },
    { name: "Meera Nair",       email: "meera@gmail.com",     phone: "9876543220" },
    { name: "Aditya Roy",       email: "aditya@gmail.com",    phone: "9876543221" },
    { name: "Divya Joshi",      email: "divya@gmail.com",     phone: "9876543222" },
    { name: "Sanjay Dutta",     email: "sanjay@gmail.com",    phone: "9876543223" },
    { name: "Neha Sen",         email: "neha@gmail.com",      phone: "9876543224" },
    { name: "Arjun Kapoor",     email: "arjun@gmail.com",     phone: "9876543225" },
    { name: "Isha Tiwari",      email: "isha@gmail.com",      phone: "9876543226" },
    { name: "Manav Bhatt",      email: "manav@gmail.com",     phone: "9876543227" },
    { name: "Ritika Saxena",    email: "ritika@gmail.com",    phone: "9876543228" },
    { name: "Yash Tandon",      email: "yash@gmail.com",      phone: "9876543229" },
    { name: "Kavya Pillai",     email: "kavya@gmail.com",     phone: "9876543230" },
    { name: "Nikhil Chadha",    email: "nikhil@gmail.com",    phone: "9876543231" },
    { name: "Tanya Oberoi",     email: "tanya@gmail.com",     phone: "9876543232" },
    { name: "Sameer Khanna",    email: "sameer@gmail.com",    phone: "9876543233" },
    { name: "Ruchi Agarwal",    email: "ruchi@gmail.com",     phone: "9876543234" },
  ];

  const customers: any[] = [];
  for (const c of customerNames) {
    customers.push(await prisma.customer.create({
      data: { ...c, passwordHash: customerPasswordHash, isActive: true },
    }));
  }
  console.log(`✅ ${customers.length} customers`);

  // ─── RESTAURANTS (3) ──────────────────────────
  const nextMonth = new Date(); nextMonth.setDate(nextMonth.getDate() + 30);
  const expiredDate = new Date(); expiredDate.setDate(expiredDate.getDate() - 5);

  const r1 = await prisma.restaurant.create({
    data: {
      name: "The Vintage Kitchen", cuisineType: "North Indian, Continental",
      description: "Authentic local delicacies served in a premium, elegant atmosphere.",
      logoUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop",
      status: "TRIAL", plan: "TRIAL", planExpiresAt: nextMonth,
    },
  });
  const r2 = await prisma.restaurant.create({
    data: {
      name: "Pizzeria Da Luigi", cuisineType: "Italian, Mediterranean",
      description: "Woodfired Napoletana pizza baked with freshly pulled cheese.",
      logoUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop",
      status: "ACTIVE", plan: "GROWTH", planExpiresAt: nextMonth,
    },
  });
  const r3 = await prisma.restaurant.create({
    data: {
      name: "Chinatown Express", cuisineType: "Asian, Chinese",
      description: "Street-style wok noodles and delicious hot dim sums.",
      logoUrl: "https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=800&auto=format&fit=crop",
      status: "ACTIVE", plan: "BASIC", planExpiresAt: nextMonth,
    },
  });
  console.log(`✅ 3 restaurants`);

  // ─── RESTAURANT PHOTOS ────────────────────────
  const photoUrls = [
    "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=600",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=600",
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=600",
  ];
  for (let i = 0; i < photoUrls.length; i++) {
    await prisma.restaurantPhoto.create({ data: { restaurantId: r2.id, url: photoUrls[i], sortOrder: i } });
  }

  // ─── STAFF (10) ────────────────────────────────
  const staffHash = await hashPassword("password123");
  const staffData = [
    { restaurantId: r2.id, name: "Luigi Moretti",    email: "owner@pizzeria.com",    phone: "9998887771", role: "OWNER" as const },
    { restaurantId: r2.id, name: "Mario Rossi",      email: "manager@pizzeria.com",  phone: "9998887772", role: "MANAGER" as const },
    { restaurantId: r2.id, name: "Giovanni Bianchi",  email: "chef@pizzeria.com",     phone: "9998887773", role: "CHEF" as const },
    { restaurantId: r2.id, name: "Elena Vance",       email: "elena@pizzeria.com",    phone: "9998887774", role: "MANAGER" as const },
    { restaurantId: r2.id, name: "Marco Pierre",      email: "marco@pizzeria.com",    phone: "9998887775", role: "CHEF" as const },
    { restaurantId: r1.id, name: "Rajesh Patel",      email: "owner@vintage.com",     phone: "9996667771", role: "OWNER" as const },
    { restaurantId: r1.id, name: "Sunita Kapoor",     email: "manager@vintage.com",   phone: "9996667772", role: "MANAGER" as const },
    { restaurantId: r1.id, name: "Deepak Nair",       email: "chef@vintage.com",      phone: "9996667773", role: "CHEF" as const },
    { restaurantId: r3.id, name: "Wei Chen",          email: "owner@chinatown.com",   phone: "9997778881", role: "OWNER" as const },
    { restaurantId: r3.id, name: "Mei Lin",           email: "chef@chinatown.com",    phone: "9997778882", role: "CHEF" as const },
  ];
  const staffMembers: any[] = [];
  for (const s of staffData) {
    staffMembers.push(await prisma.staff.create({ data: { ...s, passwordHash: staffHash } }));
  }
  console.log(`✅ ${staffMembers.length} staff members`);

  // ─── TAX + LOYALTY CONFIG ────────────────────
  await prisma.taxConfig.create({ data: { restaurantId: r2.id, gstPercent: 5.0, isActive: true } });
  await prisma.taxConfig.create({ data: { restaurantId: r1.id, gstPercent: 5.0, isActive: true } });
  await prisma.loyaltyConfig.create({ data: { restaurantId: r2.id, pointsPerHundred: 2.0, isActive: true } });
  await prisma.loyaltyConfig.create({ data: { restaurantId: r1.id, pointsPerHundred: 1.5, isActive: true } });

  // ─── BRANCHES (5) ─────────────────────────────
  const b1 = await prisma.branch.create({ data: { restaurantId: r2.id, name: "Luigi Navrangpura",  address: "CG Road, Navrangpura, Ahmedabad",         phone: "07925559876" } });
  const b2 = await prisma.branch.create({ data: { restaurantId: r2.id, name: "Luigi SG Highway",   address: "Sindhu Bhavan Rd, SG Highway, Ahmedabad",  phone: "07925559877" } });
  const b3 = await prisma.branch.create({ data: { restaurantId: r1.id, name: "Vintage Prahlad Nagar", address: "Prahlad Nagar, Ahmedabad",              phone: "07926669876" } });
  const b4 = await prisma.branch.create({ data: { restaurantId: r1.id, name: "Vintage Law Garden",  address: "Law Garden, Ahmedabad",                    phone: "07926669877" } });
  const b5 = await prisma.branch.create({ data: { restaurantId: r3.id, name: "Chinatown Bodakdev",  address: "Bodakdev, Ahmedabad",                      phone: "07927779876" } });

  // ─── FLOORS + TABLES (20+) ───────────────────
  const gf1 = await prisma.floor.create({ data: { branchId: b1.id, name: "Ground Floor", sortOrder: 1 } });
  const ff1 = await prisma.floor.create({ data: { branchId: b1.id, name: "Rooftop Terrace", sortOrder: 2 } });
  const gf2 = await prisma.floor.create({ data: { branchId: b3.id, name: "Main Hall", sortOrder: 1 } });
  const gf3 = await prisma.floor.create({ data: { branchId: b5.id, name: "Dining Area", sortOrder: 1 } });

  const tableStatuses = ["AVAILABLE","SEATED","ORDER_PENDING","PREPARING","READY","SERVED","BILL_REQUESTED","PAYMENT_PENDING","COMPLETED","AVAILABLE"] as const;
  const allTables: any[] = [];

  // Luigi Navrangpura - 10 tables
  for (let i = 1; i <= 6; i++) {
    allTables.push(await prisma.table.create({ data: { floorId: gf1.id, number: i, capacity: i <= 3 ? 2 : 4, status: tableStatuses[i - 1] || "AVAILABLE" } }));
  }
  for (let i = 7; i <= 10; i++) {
    allTables.push(await prisma.table.create({ data: { floorId: ff1.id, number: i, capacity: i === 10 ? 8 : 6, status: tableStatuses[i - 1] || "AVAILABLE" } }));
  }
  // Vintage Prahlad Nagar - 8 tables
  for (let i = 1; i <= 8; i++) {
    allTables.push(await prisma.table.create({ data: { floorId: gf2.id, number: i, capacity: i <= 4 ? 2 : 4, status: i % 3 === 0 ? "SEATED" : "AVAILABLE" } }));
  }
  // Chinatown - 6 tables
  for (let i = 1; i <= 6; i++) {
    allTables.push(await prisma.table.create({ data: { floorId: gf3.id, number: i, capacity: 4, status: i <= 2 ? "SEATED" : "AVAILABLE" } }));
  }
  console.log(`✅ ${allTables.length} tables across 4 floors`);

  // ─── MENUS + CATEGORIES + ITEMS (30+ items) ──
  // === PIZZERIA DA LUIGI ===
  const menuLuigi = await prisma.menu.create({ data: { restaurantId: r2.id, name: "Luigi Delizioso" } });

  const catPizzas   = await prisma.menuCategory.create({ data: { menuId: menuLuigi.id, name: "Gourmet Pizzas",       sortOrder: 1 } });
  const catPasta    = await prisma.menuCategory.create({ data: { menuId: menuLuigi.id, name: "Fresh Pasta",           sortOrder: 2 } });
  const catStarters = await prisma.menuCategory.create({ data: { menuId: menuLuigi.id, name: "Starters & Antipasti", sortOrder: 3 } });
  const catDesserts = await prisma.menuCategory.create({ data: { menuId: menuLuigi.id, name: "Dolci (Desserts)",      sortOrder: 4 } });
  const catDrinks   = await prisma.menuCategory.create({ data: { menuId: menuLuigi.id, name: "Beverages",             sortOrder: 5 } });

  const luigiItems = [
    // Pizzas
    { categoryId: catPizzas.id, name: "Margherita Napoletana",    description: "San Marzano tomato, buffalo mozzarella, fresh basil, EVOO",       price: 299, isVeg: true,  sortOrder: 1, modifiers: JSON.stringify([{ name: "Size", required: true, minSelections: 1, maxSelections: 1, options: [{ name: "Regular 10\"", price: 0 }, { name: "Large 14\"", price: 120 }] }, { name: "Extra Cheese", required: false, minSelections: 0, maxSelections: 1, options: [{ name: "Extra Mozzarella", price: 60 }, { name: "Vegan Cheese", price: 80 }] }]) },
    { categoryId: catPizzas.id, name: "Pepperoni Piccante",       description: "Smoky pepperoni, jalapeños, hot honey drizzle",                   price: 449, isVeg: false, sortOrder: 2 },
    { categoryId: catPizzas.id, name: "Quattro Formaggi",         description: "Mozzarella, gorgonzola, parmesan, taleggio",                      price: 399, isVeg: true,  sortOrder: 3 },
    { categoryId: catPizzas.id, name: "Prosciutto e Rucola",      description: "Parma ham, wild rocket, shaved parmesan, truffle oil",             price: 499, isVeg: false, sortOrder: 4 },
    { categoryId: catPizzas.id, name: "Diavola",                  description: "Spicy salami, 'nduja, roasted peppers, chilli flakes",             price: 429, isVeg: false, sortOrder: 5 },
    { categoryId: catPizzas.id, name: "Vegetariana",              description: "Grilled zucchini, bell peppers, olives, artichoke hearts",         price: 349, isVeg: true,  sortOrder: 6 },
    // Pasta
    { categoryId: catPasta.id,  name: "Spaghetti Aglio e Olio",  description: "Garlic, chilli flakes, parsley, parmesan",                         price: 249, isVeg: true,  sortOrder: 1 },
    { categoryId: catPasta.id,  name: "Penne Arrabbiata",         description: "Spicy tomato sauce, fresh basil, grated pecorino",                 price: 279, isVeg: true,  sortOrder: 2 },
    { categoryId: catPasta.id,  name: "Fettuccine Alfredo",       description: "Creamy parmesan sauce, butter, black pepper",                      price: 319, isVeg: true,  sortOrder: 3 },
    { categoryId: catPasta.id,  name: "Bolognese Rigatoni",       description: "Slow-cooked beef ragu, pecorino, fresh herbs",                     price: 399, isVeg: false, sortOrder: 4 },
    { categoryId: catPasta.id,  name: "Carbonara Classica",       description: "Guanciale, egg yolk, pecorino romano, black pepper",               price: 379, isVeg: false, sortOrder: 5 },
    // Starters
    { categoryId: catStarters.id, name: "Truffle Fries",          description: "Crispy skin-on fries, truffle oil, grated parmesan",               price: 189, isVeg: true,  sortOrder: 1 },
    { categoryId: catStarters.id, name: "Bruschetta Trio",        description: "Tomato basil, mushroom truffle, olive tapenade",                   price: 229, isVeg: true,  sortOrder: 2 },
    { categoryId: catStarters.id, name: "Calamari Fritti",        description: "Crispy squid rings, lemon aioli, marinara dip",                    price: 299, isVeg: false, sortOrder: 3 },
    { categoryId: catStarters.id, name: "Caprese Salad",          description: "Buffalo mozzarella, heirloom tomatoes, basil pesto",               price: 249, isVeg: true,  sortOrder: 4 },
    { categoryId: catStarters.id, name: "Garlic Bread Supreme",   description: "Loaded with cheese, herbs, and roasted garlic butter",             price: 159, isVeg: true,  sortOrder: 5 },
    // Desserts
    { categoryId: catDesserts.id, name: "Tiramisu Classico",      description: "Mascarpone cream, espresso-soaked ladyfingers, cocoa",             price: 249, isVeg: true,  sortOrder: 1 },
    { categoryId: catDesserts.id, name: "Panna Cotta",            description: "Vanilla bean cream, mixed berry compote",                          price: 199, isVeg: true,  sortOrder: 2 },
    { categoryId: catDesserts.id, name: "Chocolate Lava Cake",    description: "Warm molten centre, vanilla gelato",                               price: 279, isVeg: true,  sortOrder: 3 },
    // Beverages
    { categoryId: catDrinks.id, name: "Cold Brew Tonic",          description: "Artisanal espresso, tonic water, citrus garnish",                  price: 149, isVeg: true,  sortOrder: 1 },
    { categoryId: catDrinks.id, name: "Fresh Lime Soda",          description: "Freshly squeezed lime, soda water, rock salt",                     price: 89,  isVeg: true,  sortOrder: 2 },
    { categoryId: catDrinks.id, name: "Mango Lassi",              description: "Alphonso mango pulp, yogurt, cardamom",                            price: 129, isVeg: true,  sortOrder: 3 },
    { categoryId: catDrinks.id, name: "Italian Soda (Berry)",     description: "Mixed berry syrup, sparkling water, fresh mint",                    price: 119, isVeg: true,  sortOrder: 4 },
    { categoryId: catDrinks.id, name: "Espresso Doppio",          description: "Double shot of rich Italian espresso",                              price: 99,  isVeg: true,  sortOrder: 5 },
  ];

  const menuItems: any[] = [];
  for (const item of luigiItems) {
    menuItems.push(await prisma.menuItem.create({
      data: { ...item, price: item.price, isAvailable: true, modifiers: item.modifiers || "[]" },
    }));
  }

  // === THE VINTAGE KITCHEN ===
  const menuVintage = await prisma.menu.create({ data: { restaurantId: r1.id, name: "Vintage Classics" } });
  const catVStarters = await prisma.menuCategory.create({ data: { menuId: menuVintage.id, name: "Starters", sortOrder: 1 } });
  const catVMain     = await prisma.menuCategory.create({ data: { menuId: menuVintage.id, name: "Main Course", sortOrder: 2 } });
  const catVDesserts = await prisma.menuCategory.create({ data: { menuId: menuVintage.id, name: "Desserts", sortOrder: 3 } });

  const vintageItems = [
    { categoryId: catVStarters.id, name: "Paneer Tikka",      description: "Tandoori marinated cottage cheese, mint chutney",   price: 249, isVeg: true,  sortOrder: 1 },
    { categoryId: catVStarters.id, name: "Chicken 65",        description: "Spicy deep-fried chicken, curry leaves",             price: 279, isVeg: false, sortOrder: 2 },
    { categoryId: catVStarters.id, name: "Dahi Puri",         description: "Crispy puri filled with yogurt, tamarind, sev",      price: 149, isVeg: true,  sortOrder: 3 },
    { categoryId: catVMain.id,     name: "Butter Chicken",    description: "Creamy tomato gravy, tandoori chicken pieces",        price: 349, isVeg: false, sortOrder: 1 },
    { categoryId: catVMain.id,     name: "Paneer Butter Masala", description: "Rich cashew-tomato gravy, soft paneer cubes",     price: 299, isVeg: true,  sortOrder: 2 },
    { categoryId: catVMain.id,     name: "Dal Makhani",       description: "Slow-cooked black lentils, butter, cream",           price: 229, isVeg: true,  sortOrder: 3 },
    { categoryId: catVMain.id,     name: "Biryani Hyderabadi", description: "Basmati rice layered with spiced chicken, saffron", price: 399, isVeg: false, sortOrder: 4 },
    { categoryId: catVDesserts.id, name: "Gulab Jamun",       description: "Soft milk dumplings in rose-cardamom syrup",          price: 129, isVeg: true,  sortOrder: 1 },
    { categoryId: catVDesserts.id, name: "Kulfi Falooda",     description: "Traditional Indian ice cream with vermicelli",        price: 169, isVeg: true,  sortOrder: 2 },
  ];

  for (const item of vintageItems) {
    menuItems.push(await prisma.menuItem.create({
      data: { ...item, price: item.price, isAvailable: true, modifiers: "[]" },
    }));
  }
  console.log(`✅ ${menuItems.length} menu items across 2 restaurants`);

  // ─── TABLE SESSIONS (8) ──────────────────────
  const sessions: any[] = [];
  const sessionConfigs = [
    { tableIdx: 1, custIdx: 0,  status: "ACTIVE" as const,           code: "45" },
    { tableIdx: 2, custIdx: 1,  status: "ACTIVE" as const,           code: "78" },
    { tableIdx: 3, custIdx: 2,  status: "BILL_REQUESTED" as const,   code: "89" },
    { tableIdx: 4, custIdx: 3,  status: "ACTIVE" as const,           code: "12" },
    { tableIdx: 5, custIdx: 4,  status: "CLOSED" as const,           code: "55" },
    { tableIdx: 6, custIdx: 5,  status: "ACTIVE" as const,           code: "33" },
    { tableIdx: 10, custIdx: 6, status: "ACTIVE" as const,           code: "99" },
    { tableIdx: 11, custIdx: 7, status: "ACTIVE" as const,           code: "42" },
  ];
  for (const sc of sessionConfigs) {
    sessions.push(await prisma.tableSession.create({
      data: { tableId: allTables[sc.tableIdx]?.id || allTables[0].id, customerId: customers[sc.custIdx].id, status: sc.status, verifyCode: sc.code },
    }));
  }

  // ─── ORDERS (25) ─────────────────────────────
  const allOrders: any[] = [];
  const daysAgo = (d: number) => { const dt = new Date(); dt.setDate(dt.getDate() - d); return dt; };

  // Active dine-in orders (linked to sessions)
  const dineInOrders = [
    { sessionId: sessions[0].id, custIdx: 0,  restId: r2.id, sub: 449,  tax: 22.45, total: 471.45, status: "PREPARING" as const, type: "DINE_IN" as const, notes: "Extra crispy pepperoni" },
    { sessionId: sessions[1].id, custIdx: 1,  restId: r2.id, sub: 448,  tax: 22.40, total: 470.40, status: "RECEIVED" as const,  type: "DINE_IN" as const },
    { sessionId: sessions[2].id, custIdx: 2,  restId: r2.id, sub: 299,  tax: 14.95, total: 313.95, status: "SERVED" as const,    type: "DINE_IN" as const },
    { sessionId: sessions[3].id, custIdx: 3,  restId: r2.id, sub: 598,  tax: 29.90, total: 627.90, status: "PREPARING" as const, type: "DINE_IN" as const },
    { sessionId: sessions[5].id, custIdx: 5,  restId: r2.id, sub: 378,  tax: 18.90, total: 396.90, status: "READY" as const,     type: "DINE_IN" as const },
  ];

  for (const o of dineInOrders) {
    allOrders.push(await prisma.order.create({ data: { sessionId: o.sessionId, customerId: customers[o.custIdx].id, restaurantId: o.restId, subtotal: o.sub, taxAmount: o.tax, totalAmount: o.total, status: o.status, type: o.type, notes: o.notes } }));
  }

  // Completed past dine-in orders (no session)
  const pastDineIn = [
    { custIdx: 0,  restId: r2.id, sub: 748,  tax: 37.40, total: 785.40, status: "SERVED" as const,    days: 1 },
    { custIdx: 1,  restId: r2.id, sub: 527,  tax: 26.35, total: 553.35, status: "SERVED" as const,    days: 3 },
    { custIdx: 2,  restId: r1.id, sub: 877,  tax: 43.85, total: 920.85, status: "SERVED" as const,    days: 5 },
    { custIdx: 4,  restId: r1.id, sub: 628,  tax: 31.40, total: 659.40, status: "SERVED" as const,    days: 7 },
    { custIdx: 6,  restId: r2.id, sub: 398,  tax: 19.90, total: 417.90, status: "SERVED" as const,    days: 10 },
    { custIdx: 8,  restId: r2.id, sub: 947,  tax: 47.35, total: 994.35, status: "SERVED" as const,    days: 14 },
    { custIdx: 10, restId: r1.id, sub: 278,  tax: 13.90, total: 291.90, status: "CANCELLED" as const, days: 2 },
  ];

  for (const o of pastDineIn) {
    allOrders.push(await prisma.order.create({ data: { customerId: customers[o.custIdx].id, restaurantId: o.restId, subtotal: o.sub, taxAmount: o.tax, totalAmount: o.total, status: o.status, type: "DINE_IN", createdAt: daysAgo(o.days) } }));
  }

  // Takeaway orders
  const takeawayOrders = [
    { custIdx: 3,  restId: r2.id, sub: 598,  tax: 29.90, total: 627.90, status: "PREPARING" as const, token: "T-001", days: 0 },
    { custIdx: 5,  restId: r2.id, sub: 348,  tax: 17.40, total: 365.40, status: "READY" as const,     token: "T-002", days: 0 },
    { custIdx: 7,  restId: r2.id, sub: 299,  tax: 14.95, total: 313.95, status: "DELIVERED" as const,  token: "T-003", days: 1 },
    { custIdx: 9,  restId: r2.id, sub: 449,  tax: 22.45, total: 471.45, status: "DELIVERED" as const,  token: "T-004", days: 2 },
    { custIdx: 11, restId: r2.id, sub: 698,  tax: 34.90, total: 732.90, status: "DELIVERED" as const,  token: "T-005", days: 4 },
    { custIdx: 13, restId: r1.id, sub: 527,  tax: 26.35, total: 553.35, status: "DELIVERED" as const,  token: "T-006", days: 6 },
    { custIdx: 15, restId: r1.id, sub: 398,  tax: 19.90, total: 417.90, status: "DELIVERED" as const,  token: "T-007", days: 8 },
    { custIdx: 17, restId: r2.id, sub: 189,  tax: 9.45,  total: 198.45, status: "CANCELLED" as const,  token: "T-008", days: 3 },
    { custIdx: 19, restId: r2.id, sub: 847,  tax: 42.35, total: 889.35, status: "DELIVERED" as const,  token: "T-009", days: 12 },
    { custIdx: 21, restId: r2.id, sub: 378,  tax: 18.90, total: 396.90, status: "PREPARING" as const,  token: "T-010", days: 0 },
    { custIdx: 23, restId: r1.id, sub: 628,  tax: 31.40, total: 659.40, status: "READY" as const,     token: "T-011", days: 0 },
    { custIdx: 14, restId: r2.id, sub: 549,  tax: 27.45, total: 576.45, status: "DELIVERED" as const,  token: "T-012", days: 15 },
    { custIdx: 16, restId: r2.id, sub: 399,  tax: 19.95, total: 418.95, status: "DELIVERED" as const,  token: "T-013", days: 20 },
  ];

  for (const o of takeawayOrders) {
    allOrders.push(await prisma.order.create({ data: { customerId: customers[o.custIdx].id, restaurantId: o.restId, subtotal: o.sub, taxAmount: o.tax, totalAmount: o.total, status: o.status, type: "TAKEAWAY", tokenNumber: o.token, createdAt: daysAgo(o.days) } }));
  }
  console.log(`✅ ${allOrders.length} orders`);

  // ─── ORDER ITEMS (50+) ───────────────────────
  // For each order, add 2-4 items from the menu
  const pickItem = (idx: number) => menuItems[idx % menuItems.length];

  const orderItemsData = [
    // Active dine-in
    { orderIdx: 0, items: [{ itemIdx: 1, qty: 1 }, { itemIdx: 11, qty: 1 }] },
    { orderIdx: 1, items: [{ itemIdx: 0, qty: 1 }, { itemIdx: 19, qty: 2 }] },
    { orderIdx: 2, items: [{ itemIdx: 0, qty: 1 }] },
    { orderIdx: 3, items: [{ itemIdx: 2, qty: 1 }, { itemIdx: 7, qty: 1 }, { itemIdx: 16, qty: 1 }] },
    { orderIdx: 4, items: [{ itemIdx: 8, qty: 1 }, { itemIdx: 20, qty: 1 }] },
    // Past dine-in
    { orderIdx: 5,  items: [{ itemIdx: 1, qty: 1 }, { itemIdx: 3, qty: 1 }, { itemIdx: 11, qty: 1 }] },
    { orderIdx: 6,  items: [{ itemIdx: 4, qty: 1 }, { itemIdx: 12, qty: 1 }] },
    { orderIdx: 7,  items: [{ itemIdx: 24, qty: 1 }, { itemIdx: 27, qty: 1 }, { itemIdx: 30, qty: 1 }] },
    { orderIdx: 8,  items: [{ itemIdx: 25, qty: 1 }, { itemIdx: 28, qty: 1 }] },
    { orderIdx: 9,  items: [{ itemIdx: 2, qty: 1 }, { itemIdx: 19, qty: 2 }] },
    { orderIdx: 10, items: [{ itemIdx: 5, qty: 1 }, { itemIdx: 9, qty: 1 }, { itemIdx: 16, qty: 2 }] },
    { orderIdx: 11, items: [{ itemIdx: 0, qty: 1 }] },
    // Takeaways
    { orderIdx: 12, items: [{ itemIdx: 1, qty: 1 }, { itemIdx: 6, qty: 1 }, { itemIdx: 20, qty: 1 }] },
    { orderIdx: 13, items: [{ itemIdx: 5, qty: 1 }, { itemIdx: 14, qty: 1 }] },
    { orderIdx: 14, items: [{ itemIdx: 0, qty: 1 }] },
    { orderIdx: 15, items: [{ itemIdx: 1, qty: 1 }] },
    { orderIdx: 16, items: [{ itemIdx: 3, qty: 1 }, { itemIdx: 10, qty: 1 }, { itemIdx: 16, qty: 1 }] },
    { orderIdx: 17, items: [{ itemIdx: 27, qty: 1 }, { itemIdx: 31, qty: 1 }] },
    { orderIdx: 18, items: [{ itemIdx: 25, qty: 1 }, { itemIdx: 28, qty: 2 }] },
    { orderIdx: 19, items: [{ itemIdx: 11, qty: 1 }] },
    { orderIdx: 20, items: [{ itemIdx: 4, qty: 1 }, { itemIdx: 8, qty: 1 }, { itemIdx: 17, qty: 1 }, { itemIdx: 22, qty: 2 }] },
    { orderIdx: 21, items: [{ itemIdx: 2, qty: 1 }, { itemIdx: 13, qty: 1 }] },
    { orderIdx: 22, items: [{ itemIdx: 26, qty: 1 }, { itemIdx: 29, qty: 1 }] },
    { orderIdx: 23, items: [{ itemIdx: 0, qty: 2 }, { itemIdx: 11, qty: 1 }] },
    { orderIdx: 24, items: [{ itemIdx: 6, qty: 1 }, { itemIdx: 15, qty: 1 }] },
  ];

  let totalOrderItems = 0;
  for (const oid of orderItemsData) {
    if (!allOrders[oid.orderIdx]) continue;
    for (const it of oid.items) {
      const mi = pickItem(it.itemIdx);
      await prisma.orderItem.create({
        data: {
          orderId: allOrders[oid.orderIdx].id,
          menuItemId: mi.id,
          name: mi.name,
          quantity: it.qty,
          unitPrice: Number(mi.price),
          totalPrice: Number(mi.price) * it.qty,
        },
      });
      totalOrderItems++;
    }
  }
  console.log(`✅ ${totalOrderItems} order items`);

  // ─── PAYMENTS (for delivered/served orders) ──
  let paymentCount = 0;
  for (const o of allOrders) {
    if (["SERVED", "DELIVERED"].includes(o.status)) {
      if (o.type === "TAKEAWAY") {
        await prisma.payment.create({ data: { orderId: o.id, amount: Number(o.totalAmount), method: paymentCount % 2 === 0 ? "UPI" : "CASH", status: "CONFIRMED", confirmedAt: new Date() } });
      }
      paymentCount++;
    }
  }
  // Session payments for completed dine-in sessions
  for (const s of sessions) {
    if (s.status === "BILL_REQUESTED" || s.status === "CLOSED") {
      await prisma.sessionPayment.create({ data: { sessionId: s.id, totalAmount: 313.95, method: "UPI", status: "CONFIRMED", confirmedAt: new Date() } });
      paymentCount++;
    }
  }
  console.log(`✅ ${paymentCount} payments`);

  // ─── QUEUE (10 entries) ──────────────────────
  const queueNames = [
    { name: "Monica Geller",   phone: "9998881234", party: 6, status: "WAITING" as const, pos: 1, notes: "Near screen" },
    { name: "Chandler Bing",   phone: "9998881235", party: 2, status: "CALLED" as const,  pos: 2 },
    { name: "Ross Geller",     phone: "9998881236", party: 4, status: "WAITING" as const, pos: 3, notes: "Birthday celebration" },
    { name: "Rachel Green",    phone: "9998881237", party: 3, status: "WAITING" as const, pos: 4 },
    { name: "Joey Tribbiani",  phone: "9998881238", party: 1, status: "SEATED" as const,  pos: 5 },
    { name: "Phoebe Buffay",   phone: "9998881239", party: 2, status: "WAITING" as const, pos: 6, notes: "Vegan options" },
    { name: "Gunther",         phone: "9998881240", party: 1, status: "LEFT" as const,     pos: 7 },
    { name: "Janice Litman",   phone: "9998881241", party: 4, status: "WAITING" as const, pos: 8 },
    { name: "Mike Hannigan",   phone: "9998881242", party: 2, status: "CALLED" as const,  pos: 9 },
    { name: "Emily Waltham",   phone: "9998881243", party: 6, status: "WAITING" as const, pos: 10, notes: "Window seat" },
  ];
  for (const q of queueNames) {
    await prisma.queue.create({
      data: {
        branchId: b1.id,
        name: q.name,
        phone: q.phone,
        partySize: q.party,
        status: q.status,
        position: q.pos,
        notes: q.notes,
      },
    });
  }
  console.log(`✅ ${queueNames.length} queue entries`);

  // ─── RESERVATIONS (12) ───────────────────────
  const resData = [
    { branchId: b1.id, custIdx: 4,  party: 4, dayOffset: 1,  time: "19:00", status: "PENDING" as const,   notes: "Window seat if available" },
    { branchId: b1.id, custIdx: 5,  party: 2, dayOffset: 1,  time: "13:30", status: "CONFIRMED" as const },
    { branchId: b1.id, custIdx: 8,  party: 6, dayOffset: 2,  time: "20:00", status: "PENDING" as const,   notes: "Anniversary dinner" },
    { branchId: b1.id, custIdx: 10, party: 3, dayOffset: 3,  time: "19:30", status: "CONFIRMED" as const },
    { branchId: b1.id, custIdx: 12, party: 2, dayOffset: 0,  time: "14:00", status: "COMPLETED" as const },
    { branchId: b2.id, custIdx: 14, party: 8, dayOffset: 4,  time: "20:30", status: "PENDING" as const,   notes: "Birthday party, need cake" },
    { branchId: b3.id, custIdx: 16, party: 4, dayOffset: 1,  time: "19:00", status: "CONFIRMED" as const },
    { branchId: b3.id, custIdx: 18, party: 2, dayOffset: 2,  time: "13:00", status: "PENDING" as const },
    { branchId: b3.id, custIdx: 20, party: 5, dayOffset: -1, time: "20:00", status: "COMPLETED" as const },
    { branchId: b3.id, custIdx: 22, party: 3, dayOffset: -2, time: "19:30", status: "CANCELLED" as const },
    { branchId: b3.id, custIdx: 24, party: 2, dayOffset: -3, time: "14:00", status: "NO_SHOW" as const },
    { branchId: b5.id, custIdx: 6,  party: 4, dayOffset: 2,  time: "19:00", status: "PENDING" as const },
  ];
  for (const r of resData) {
    const dt = new Date(); dt.setDate(dt.getDate() + r.dayOffset);
    await prisma.reservation.create({ data: { branchId: r.branchId, customerId: customers[r.custIdx].id, partySize: r.party, date: dt, timeSlot: r.time, status: r.status, notes: r.notes } });
  }
  console.log(`✅ ${resData.length} reservations`);

  // ─── LOYALTY ACCOUNTS + TRANSACTIONS (20) ────
  const loyaltyCustomers = customers.slice(0, 20);
  for (let i = 0; i < loyaltyCustomers.length; i++) {
    const pts = Math.round((Math.random() * 4000 + 500) * 100) / 100;
    const acc = await prisma.loyaltyAccount.create({ data: { customerId: loyaltyCustomers[i].id, totalPoints: pts } });

    // 2-3 transactions per account
    const txTypes: ("EARNED" | "REDEEMED" | "BONUS")[] = ["EARNED", "REDEEMED", "BONUS"];
    for (let t = 0; t < 2 + (i % 2); t++) {
      const txType = txTypes[t % txTypes.length];
      const txPoints = txType === "REDEEMED" ? -(Math.round(Math.random() * 200)) : Math.round(Math.random() * 500 + 100);
      await prisma.loyaltyTransaction.create({
        data: {
          accountId: acc.id,
          restaurantId: i % 2 === 0 ? r2.id : r1.id,
          points: txPoints,
          type: txType,
          description: txType === "EARNED" ? "Order completion reward" : txType === "REDEEMED" ? "Points used on order" : "Welcome bonus",
          createdAt: daysAgo(Math.floor(Math.random() * 30)),
        },
      });
    }
  }
  console.log(`✅ 20 loyalty accounts with transactions`);

  // ─── COMPLAINTS (15) ─────────────────────────
  const complaintsData = [
    { restId: r2.id, custIdx: 6,  text: "The Pizzeria is too noisy and the truffle fries tasted like dry cardboard. Service was slow.", rating: 2, cat: "FOOD_QUALITY" as const, urgency: "HIGH" as const, sentiment: "NEGATIVE" as const, summary: "Noisy atmosphere, dry truffle fries, and slow service.", resolved: false },
    { restId: r2.id, custIdx: 7,  text: "Waited 45 minutes for a simple Margherita. Terrible timing.", rating: 1, cat: "WAIT_TIME" as const, urgency: "CRITICAL" as const, sentiment: "NEGATIVE" as const, summary: "Critical 45-minute delay on simple Margherita order.", resolved: false },
    { restId: r2.id, custIdx: 8,  text: "The cold brew tonic was exceptionally good, but pizza toppings were messy.", rating: 3, cat: "OTHER" as const, urgency: "MEDIUM" as const, sentiment: "NEUTRAL" as const, summary: "Mixed review: great tonic, messy pizza toppings.", resolved: true },
    { restId: r2.id, custIdx: 9,  text: "Best pepperoni pizza in Ahmedabad! Will definitely come back with friends.", rating: 5, cat: "FOOD_QUALITY" as const, urgency: "LOW" as const, sentiment: "POSITIVE" as const, summary: "Excellent pepperoni pizza, customer plans to return.", resolved: false },
    { restId: r2.id, custIdx: 10, text: "The waiter was rude when I asked for extra napkins. Very disappointing.", rating: 2, cat: "STAFF_BEHAVIOR" as const, urgency: "HIGH" as const, sentiment: "NEGATIVE" as const, summary: "Rude waiter when requesting extra napkins.", resolved: false },
    { restId: r2.id, custIdx: 11, text: "Music volume in the North Wing was too high for conversation.", rating: 3, cat: "OTHER" as const, urgency: "MEDIUM" as const, sentiment: "NEGATIVE" as const, summary: "Music too loud in North Wing dining area.", resolved: false },
    { restId: r2.id, custIdx: 12, text: "Eco-friendly cutlery was requested but not included in takeaway bag.", rating: 3, cat: "ORDER_ACCURACY" as const, urgency: "LOW" as const, sentiment: "NEUTRAL" as const, summary: "Takeaway missing requested eco-friendly cutlery.", resolved: false },
    { restId: r2.id, custIdx: 13, text: "Absolutely loved the carbonara! Authentic Italian taste. 10/10!", rating: 5, cat: "FOOD_QUALITY" as const, urgency: "LOW" as const, sentiment: "POSITIVE" as const, summary: "Highly praised carbonara for authentic Italian taste.", resolved: false },
    { restId: r1.id, custIdx: 14, text: "Butter chicken was amazing but the naan was cold and stale.", rating: 3, cat: "FOOD_QUALITY" as const, urgency: "MEDIUM" as const, sentiment: "NEUTRAL" as const, summary: "Great butter chicken, but cold/stale naan.", resolved: false },
    { restId: r1.id, custIdx: 15, text: "Billing error — charged for items we didn't order. Staff fixed it eventually.", rating: 2, cat: "BILLING" as const, urgency: "HIGH" as const, sentiment: "NEGATIVE" as const, summary: "Billing error with charges for unordered items.", resolved: true },
    { restId: r1.id, custIdx: 16, text: "Washroom was dirty when we visited on Saturday evening.", rating: 1, cat: "CLEANLINESS" as const, urgency: "CRITICAL" as const, sentiment: "NEGATIVE" as const, summary: "Dirty washroom on Saturday evening visit.", resolved: false },
    { restId: r1.id, custIdx: 17, text: "The biryani was the best I've ever had. Generous portion size!", rating: 5, cat: "FOOD_QUALITY" as const, urgency: "LOW" as const, sentiment: "POSITIVE" as const, summary: "Best biryani ever, praised generous portions.", resolved: false },
    { restId: r1.id, custIdx: 18, text: "Order was missing paneer tikka even though it showed on the bill.", rating: 2, cat: "ORDER_ACCURACY" as const, urgency: "HIGH" as const, sentiment: "NEGATIVE" as const, summary: "Missing paneer tikka despite being on the bill.", resolved: false },
    { restId: r1.id, custIdx: 19, text: "Beautiful ambiance and great music selection. Perfect date night spot!", rating: 5, cat: "OTHER" as const, urgency: "LOW" as const, sentiment: "POSITIVE" as const, summary: "Praised ambiance, music, and date night atmosphere.", resolved: false },
    { restId: r1.id, custIdx: 20, text: "Service was incredibly fast. Food came within 10 minutes of ordering.", rating: 4, cat: "SERVICE" as const, urgency: "LOW" as const, sentiment: "POSITIVE" as const, summary: "Fast service, food arrived within 10 minutes.", resolved: false },
  ];
  for (const c of complaintsData) {
    await prisma.complaint.create({
      data: {
        restaurantId: c.restId, customerId: customers[c.custIdx].id, rawText: c.text,
        rating: c.rating, category: c.cat, urgency: c.urgency, sentiment: c.sentiment,
        summary: c.summary, isAnalyzed: true, isResolved: c.resolved,
        resolvedAt: c.resolved ? new Date() : undefined,
        createdAt: daysAgo(Math.floor(Math.random() * 14)),
      },
    });
  }
  console.log(`✅ ${complaintsData.length} complaints`);

  // ─── UPSELL CONFIG ───────────────────────────
  await prisma.upsellConfig.create({ data: { restaurantId: r2.id, triggerPhase: "AFTER_STARTER", promptText: "Would you like to try our signature Tiramisu?", menuItemId: menuItems[16]?.id, isActive: true } });
  await prisma.upsellConfig.create({ data: { restaurantId: r2.id, triggerPhase: "AFTER_MAIN",    promptText: "Pair your meal with our Cold Brew Tonic!", menuItemId: menuItems[19]?.id, isActive: true } });

  console.log("✅ Upsell configs created");
  console.log("\n🎉 Full Database Seeding Complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  Customers:     ${customers.length}`);
  console.log(`  Restaurants:   3`);
  console.log(`  Staff:         ${staffMembers.length}`);
  console.log(`  Branches:      5`);
  console.log(`  Tables:        ${allTables.length}`);
  console.log(`  Menu Items:    ${menuItems.length}`);
  console.log(`  Orders:        ${allOrders.length}`);
  console.log(`  Order Items:   ${totalOrderItems}`);
  console.log(`  Queue:         ${queueNames.length}`);
  console.log(`  Reservations:  ${resData.length}`);
  console.log(`  Complaints:    ${complaintsData.length}`);
  console.log(`  Loyalty Accts: 20`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
