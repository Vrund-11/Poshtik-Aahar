# Technical Specification
## Restaurant Experience OS — MVP
**Version:** 1.1
**Last Updated:** June 2026
**Target:** 10k users, 20 restaurants, 50 partners

---

## 1. Architecture Overview

```
Customer Browser / Partner Browser
↓
Next.js Frontend (customer + dashboard — two apps)
↓
Hono.js API Server
↓
PostgreSQL (Supabase — free tier, direct connection)
Redis (self-hosted locally in dev, same server in prod later)
Cloudflare R2 (image storage — free)
```

Simple. No CDN. No reverse proxy. No load balancer.
Not needed at 10k users.

---

## 2. Monorepo Structure

**Tool:** Turborepo

```
restaurant-os/
├── apps/
│   ├── customer/              # Next.js 14 — customer web app
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── (home)/
│   │   │   │   └── page.tsx   # Restaurant discovery
│   │   │   ├── restaurant/
│   │   │   │   └── [id]/
│   │   │   ├── table/
│   │   │   │   └── [sessionId]/
│   │   │   ├── takeaway/
│   │   │   ├── orders/
│   │   │   └── profile/
│   │   └── package.json
│   │
│   ├── dashboard/             # Next.js 14 — partner dashboard
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   └── login/
│   │   │   ├── admin/
│   │   │   │   ├── restaurants/
│   │   │   │   └── analytics/
│   │   │   ├── owner/
│   │   │   │   ├── setup/
│   │   │   │   ├── menu/
│   │   │   │   ├── staff/
│   │   │   │   ├── analytics/
│   │   │   │   └── complaints/
│   │   │   ├── manager/
│   │   │   │   ├── floor/
│   │   │   │   ├── orders/
│   │   │   │   ├── queue/
│   │   │   │   ├── reservations/
│   │   │   │   └── takeaway/
│   │   │   └── kitchen/
│   │   │       └── display/
│   │   └── package.json
│   │
│   └── server/                # Hono.js — API + SSE
│       ├── src/
│       │   ├── routes/
│       │   │   ├── auth.ts
│       │   │   ├── restaurants.ts
│       │   │   ├── menus.ts
│       │   │   ├── tables.ts
│       │   │   ├── orders.ts
│       │   │   ├── queue.ts
│       │   │   ├── reservations.ts
│       │   │   ├── takeaway.ts
│       │   │   ├── loyalty.ts
│       │   │   ├── complaints.ts
│       │   │   └── admin.ts
│       │   ├── sse/
│       │   │   ├── manager.ts
│       │   │   └── connections.ts
│       │   ├── middleware/
│       │   │   ├── auth.ts
│       │   │   └── error.ts
│       │   ├── jobs/
│       │   │   └── analyzeComplaint.ts
│       │   └── index.ts
│       └── package.json
│
├── packages/
│   ├── database/              # Prisma schema + generated client
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── index.ts
│   │
│   ├── types/                 # Shared TypeScript interfaces
│   │   └── index.ts
│   │
│   ├── validators/            # Shared Zod schemas
│   │   └── index.ts
│   │
│   └── utils/
│       ├── api.ts             # Fetch wrapper
│       ├── jwt.ts
│       └── constants.ts
│
├── turbo.json
├── package.json
└── .env.example
```

---

## 3. Why Hono.js and Not Plain Node.js / Express

This is a fair question. Here is a concrete example.

**Plain Node.js (http module)**
```javascript
const http = require('http')

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/orders') {
    let body = ''
    req.on('data', chunk => body += chunk)
    req.on('end', () => {
      const data = JSON.parse(body)
      // handle manually
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ success: true }))
    })
  }
  // Every route needs manual if/else
  // Every method needs manual parsing
  // Error handling is manual
  // Middleware is manual
})
```

**Express.js**
```javascript
const express = require('express')
const app = express()
app.use(express.json())

app.post('/api/orders', (req, res) => {
  const data = req.body
  res.json({ success: true })
})
// Better but: no TypeScript built in, larger bundle,
// slower than Hono, callbacks not async/await native
```

**Hono.js (what we use)**
```typescript
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const app = new Hono()

app.post(
  '/api/orders',
  zValidator('json', z.object({
    sessionId: z.string(),
    items: z.array(z.object({
      menuItemId: z.string(),
      quantity: z.number().min(1)
    }))
  })),
  async (c) => {
    const { sessionId, items } = c.req.valid('json')
    // Already validated, already typed
    // async/await native
    // TypeScript from day one
    const order = await createOrder({ sessionId, items })
    return c.json({ success: true, order })
  }
)
```

**Why Hono specifically over Express:**
```
TypeScript native         → No @types packages needed
Zod validation built in   → One line input validation
4x faster than Express    → Benchmark proven
Smaller bundle            → Faster cold start
Same pattern as Next.js   → Easier to context switch
Web standard Request/Response → Portable, future proof
SSE support built in      → No extra library
```

At 10k users none of this matters for raw performance.
But it matters for developer experience and speed of building.
You write less code to do the same thing.

---

## 4. Process Manager — Why PM2

When you run `node server.js` and close your terminal, the server dies.
When your server crashes due to an error, it stays down.
PM2 solves both problems.

```bash
# Without PM2
node src/index.js
# Server dies when terminal closes
# Server stays dead when it crashes

# With PM2
pm2 start src/index.js --name api
# Server runs in background forever
# Auto-restarts on crash
# Starts automatically on server reboot
```

```
PM2 gives you:
→ Background process management
→ Auto-restart on crash
→ Startup on server boot
→ Log management (pm2 logs)
→ Basic CPU/memory monitoring (pm2 monit)
→ Zero-downtime restarts (pm2 reload)
→ All free
```

Not needed in local development.
Needed when you deploy to a server.
Mentioned here for completeness — ignore for now.

---

## 5. Tech Stack (Development Phase)

### Frontend
```
Framework:      Next.js 14 App Router
Styling:        Tailwind CSS
Components:     Stitch (as decided)
State:          Zustand (client), React Query (server)
HTTP:           Native fetch with wrapper
Validation:     Zod (shared from packages/validators)
```

### Backend
```
Framework:      Hono.js
Runtime:        Node.js 20 LTS
Language:       TypeScript
Validation:     Zod via @hono/zod-validator
```

### Database
```
Engine:         PostgreSQL 15
Host:           Supabase (free tier — direct DB connection only)
ORM:            Prisma
Connection:     Direct DATABASE_URL string
                No connection pooling in development
```

### Cache
```
Engine:         Redis 7
Host:           Local in development (brew install redis / apt install redis)
Client:         ioredis
Use in MVP:     Session verification codes, menu cache
```

### Real-time
```
Protocol:       SSE (Server-Sent Events)
Handled by:     Hono.js built-in SSE support
Two streams:
  table:{sessionId}           → customer order updates
  restaurant:{restaurantId}   → manager + kitchen
```

### Image Storage
```
Provider:       Cloudflare R2
Free tier:      10GB storage, zero egress fees forever
Max per owner:  5 images total
Formats:        JPEG, PNG, WebP only
Max size:       2MB per image
Client:         AWS SDK v3 (@aws-sdk/client-s3) — R2 is S3 compatible
URL:            Public R2 URL served directly
                No transformation needed at MVP scale
Fallback:       If no image, show initials-based placeholder (CSS only)
```

**Why R2 and not Supabase Storage:**
```
Supabase Storage free: 1GB, egress costs money
Cloudflare R2 free:    10GB, zero egress forever

At 20 restaurants × 5 images max = 100 images
Average 500KB each = 50MB total
Fits in R2 free forever
```

**Image upload flow:**
```
Owner selects image on dashboard
↓
Frontend sends to API (multipart/form-data)
↓
API validates: type check, size check, magic bytes check
↓
API uploads to R2 with UUID filename
↓
API saves R2 public URL to DB (imageUrl field)
↓
Frontend receives URL and displays immediately
↓
All future requests load directly from R2 URL
No API involved in serving images
```

### Auth
```
Customer:       Name + Phone + Email + Password
Staff:          Email + Password

Password:       bcrypt + salt (bcrypt handles salt automatically)
                + pepper (app-level secret added before hashing)
                rounds: 12

Pepper usage:
  const peppered = password + process.env.AUTH_PEPPER
  const hash = await bcrypt.hash(peppered, 12)

JWT:
  Access token:   15 min, stored in memory (React state/Zustand)
  Refresh token:  30 days, httpOnly cookie
  Algorithm:      HS256
  Secrets:        Two separate secrets (access + refresh)

Password reset (Owner only):
  Owner clicks Forgot Password
  Enters email
  API generates reset token (crypto.randomBytes(32))
  Stores hashed token in DB with 5 min expiry
  Sends email via Resend with reset link
  Link: https://partner.domain.com/reset-password?token=xxx
  On submit: verify token, check expiry, update password, delete token

No OTP. No SMS. Email only for password reset.
```

### Email (Password Reset Only)
```
Provider:       Resend
Free tier:      3,000 emails/month
Use:            ONLY for owner password reset link
                Nothing else in MVP
```

### AI (Complaints)
```
Provider:       Google Gemini API (gemini-pro)
Free tier:      1 million tokens/day
Trigger:        After complaint saved to DB
Execution:      Async background — never blocks the response
```

---

## 6. API Design

**Style:** REST throughout MVP
tRPC adds complexity for a two-person team learning the stack.
Plain REST with Zod validation is faster to build and debug.

```
All routes prefixed: /api/v1/

Auth routes:
POST   /api/v1/auth/customer/register
POST   /api/v1/auth/customer/login
POST   /api/v1/auth/customer/logout
POST   /api/v1/auth/customer/refresh
POST   /api/v1/auth/staff/login
POST   /api/v1/auth/staff/logout
POST   /api/v1/auth/staff/refresh
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password

Restaurant routes (public):
GET    /api/v1/restaurants               # Discovery list
GET    /api/v1/restaurants/:id           # Restaurant detail
GET    /api/v1/restaurants/:id/menu      # Menu (cached)

Table session:
POST   /api/v1/sessions/initiate         # QR scan, generate codes
POST   /api/v1/sessions/verify           # Customer picks code
GET    /api/v1/sessions/:id              # Session details

Orders:
POST   /api/v1/orders                    # Place order
GET    /api/v1/orders/:id                # Order details
PATCH  /api/v1/orders/:id/status         # Chef updates status

Takeaway:
POST   /api/v1/takeaway                  # Place takeaway order
PATCH  /api/v1/takeaway/:id/accept       # Manager accepts
PATCH  /api/v1/takeaway/:id/paid         # Manager marks paid

Queue:
GET    /api/v1/queue/:branchId           # Get queue list
POST   /api/v1/queue/:branchId           # Add to queue
PATCH  /api/v1/queue/:id/call            # Mark as called
PATCH  /api/v1/queue/:id/seat            # Mark as seated
DELETE /api/v1/queue/:id                 # Remove from queue

Reservations:
POST   /api/v1/reservations              # Customer creates
GET    /api/v1/reservations/:branchId    # Manager views
PATCH  /api/v1/reservations/:id/status  # Manager updates

Billing:
POST   /api/v1/sessions/:id/request-bill
POST   /api/v1/sessions/:id/paid         # Customer claims paid
POST   /api/v1/sessions/:id/confirm-payment # Manager confirms

Complaints:
POST   /api/v1/complaints                # Submit complaint

SSE endpoints:
GET    /sse/table/:sessionId             # Customer stream
GET    /sse/restaurant/:restaurantId     # Staff stream

Owner/Admin (protected):
CRUD   /api/v1/owner/menu
CRUD   /api/v1/owner/staff
CRUD   /api/v1/owner/tables
GET    /api/v1/owner/analytics
GET    /api/v1/owner/complaints

CRUD   /api/v1/admin/restaurants
GET    /api/v1/admin/analytics
```

---

## 7. SSE Architecture

### Connection Manager (in-memory)
```typescript
// src/sse/connections.ts

const connections = new Map<string, Set<SSEStreamingApi>>()

export const addConnection = (key: string, stream: SSEStreamingApi) => {
  if (!connections.has(key)) connections.set(key, new Set())
  connections.get(key)!.add(stream)
}

export const removeConnection = (key: string, stream: SSEStreamingApi) => {
  connections.get(key)?.delete(stream)
}

export const publish = (key: string, event: string, data: unknown) => {
  const clients = connections.get(key)
  if (!clients || clients.size === 0) return
  const payload = JSON.stringify(data)
  clients.forEach(stream => {
    stream.writeSSE({ event, data: payload })
  })
}
```

### Hono SSE Route
```typescript
// src/routes/sse.ts
import { streamSSE } from 'hono/streaming'

app.get('/sse/restaurant/:restaurantId', async (c) => {
  const { restaurantId } = c.req.param()
  // Verify staff token
  const staff = await verifyStaffFromCookie(c)
  if (!staff) return c.json({ error: 'Unauthorized' }, 401)

  return streamSSE(c, async (stream) => {
    addConnection(`restaurant:${restaurantId}`, stream)
    await stream.writeSSE({ event: 'CONNECTED', data: '{}' })

    // Keep alive ping every 30 seconds
    const ping = setInterval(async () => {
      await stream.writeSSE({ event: 'PING', data: '{}' })
    }, 30000)

    stream.onAbort(() => {
      clearInterval(ping)
      removeConnection(`restaurant:${restaurantId}`, stream)
    })

    // Hold connection open
    await new Promise(() => {})
  })
})
```

---

## 8. Password Security Implementation

```typescript
import bcrypt from 'bcrypt'

const PEPPER = process.env.AUTH_PEPPER! // long random string in env
const ROUNDS = 12

export const hashPassword = async (password: string): Promise<string> => {
  // Pepper added before bcrypt (bcrypt handles salt internally)
  return bcrypt.hash(password + PEPPER, ROUNDS)
}

export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password + PEPPER, hash)
}
```

**Salt:** bcrypt generates and stores a unique salt per hash automatically.
**Pepper:** App-level secret in environment variable. Not stored in DB.
Result: Even if DB is fully leaked, passwords cannot be cracked without the pepper.

---

## 9. HTTP Fetch Wrapper

```typescript
// packages/utils/api.ts

type ApiOptions = RequestInit & {
  params?: Record<string, string>
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

const request = async <T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> => {
  const { params, ...init } = options

  let url = `${BASE_URL}${endpoint}`
  if (params) {
    url += '?' + new URLSearchParams(params).toString()
  }

  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers
    },
    credentials: 'include' // sends cookies automatically
  })

  if (res.status === 401) {
    // Try refresh
    const refreshed = await fetch(`${BASE_URL}/api/v1/auth/customer/refresh`, {
      method: 'POST',
      credentials: 'include'
    })
    if (refreshed.ok) {
      // Retry original request
      return request<T>(endpoint, options)
    }
    // Refresh failed, redirect to login
    window.location.href = '/login'
    throw new Error('Session expired')
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(error.message || 'Request failed')
  }

  return res.json()
}

export const api = {
  get: <T>(url: string, options?: ApiOptions) =>
    request<T>(url, { ...options, method: 'GET' }),

  post: <T>(url: string, body?: unknown, options?: ApiOptions) =>
    request<T>(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body)
    }),

  patch: <T>(url: string, body?: unknown, options?: ApiOptions) =>
    request<T>(url, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body)
    }),

  delete: <T>(url: string, options?: ApiOptions) =>
    request<T>(url, { ...options, method: 'DELETE' })
}
```

---

## 10. Environment Variables

```bash
# Database
DATABASE_URL="postgresql://postgres:[pass]@db.[project].supabase.co:5432/postgres"

# JWT
JWT_ACCESS_SECRET="[256-bit random]"
JWT_REFRESH_SECRET="[different 256-bit random]"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="30d"

# Security
AUTH_PEPPER="[long random string — never changes after launch]"
PASSWORD_RESET_SECRET="[256-bit random]"

# Redis
REDIS_URL="redis://localhost:6379"

# Cloudflare R2
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME="restaurant-os"
R2_PUBLIC_URL="https://pub-[hash].r2.dev"

# AI
GEMINI_API_KEY=""

# Email (password reset only)
RESEND_API_KEY=""
RESEND_FROM="noreply@yourdomain.com"

# App
NODE_ENV="development"
API_PORT=3000
CUSTOMER_APP_URL="http://localhost:3001"
DASHBOARD_URL="http://localhost:3002"
API_URL="http://localhost:3000"
```

---

## 11. What Is Out of Scope for Now

```
CDN                   → Not needed at 10k users
Reverse proxy         → Deployment concern, later
Connection pooling    → Development phase, not needed
Rate limiting         → After functional requirements done
VPS / deployment      → Separate discussion later
CI/CD pipeline        → Separate discussion later
SMS provider          → Not needed (email+pass auth)
Native mobile app     → Post-MVP
Payment gateway       → Post-MVP
Advanced analytics    → Post-MVP
```
