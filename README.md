# Foodmart — Restaurant Experience OS

A platform connecting restaurants and customers with QR table ordering, reservations, queue management, live kitchen displays, and analytical insight dashboards.

## Directory Structure

- `apps/user-app`: Next.js 14 Web App for Customers (Port 3000)
- `apps/partner-app`: Next.js 14 Manager/Chef/Owner Dashboard (Port 8000)
- `apps/admin`: Next.js 14 Super Admin (Port 7070)
- `backend`: Hono.js HTTP & SSE Server (Port 5000)
- `prisma`: Database schema definitions, migrations, and seeds
- `packages/shared`: Shared types, validators, and generic fetch api utility
- `packages/database`: Re-export generated Prisma client

## Installation & Running

Ensure you have Node.js 18+ and npm installed.

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Generate Database Client:**
   ```bash
   npm run db:generate
   ```

3. **Start Development Server:**
   This starts the `backend` and `user-app` concurrently:
   ```bash
   npm run dev
   ```

4. **Start Partner App (manually):**
   ```bash
   npm run dev:partner
   ```

5. **Start Admin App (manually):**
   ```bash
   npm run dev:admin
   ```
