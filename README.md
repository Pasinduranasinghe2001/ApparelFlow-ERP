# ApparelFlow ERP — Cutting Operations & Gatekeeper Verification Terminal

> **Webtezza (Pvt) Ltd** — Software Engineering Intern Practical Assessment  
> **Full-Stack Web Application** | Next.js 16 · PostgreSQL · Prisma · Vitest

---

## 🏭 System Overview

ApparelFlow ERP is a production-grade web application implementing the **Cutting Operations & Gatekeeper Verification Terminal** for industrial garment manufacturing.

The system enforces a **non-bypassable server-side QC checkpoint**: cut fabric bundles must be verified component-by-component before they can enter the Sewing Queue.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL (Neon - serverless) |
| ORM | Prisma |
| Auth | NextAuth.js v5 (JWT) |
| Styling | Tailwind CSS |
| Testing | Vitest + Supertest |
| Deployment | Vercel |

---

## 👥 Demo Credentials (3 Roles)

| Role | Email | Password |
|------|-------|---------|
| Cutting Supervisor | supervisor@apparelflow.com | demo1234 |
| Cutting Verifier | verifier@apparelflow.com | demo1234 |
| Sewing Supervisor | sewing@apparelflow.com | demo1234 |

---

## 🔄 State Machine

```
CUTTING_IN_PROGRESS → PENDING_VERIFICATION → VERIFIED → SEWING_QUEUE
                                          ↘ REJECTED (+ mandatory reason note)
```

---

## 🗃️ Database Schema

- `users` — Authentication & RBAC roles
- `recipes` — Garment production recipes (Bill of Materials)
- `recipe_components` — Cut parts per garment
- `cutting_orders` — Production batch orders
- `verification_items` — Component counts with GREEN/YELLOW/RED status
- `verification_logs` — Immutable audit trail

---

## 🚦 Traffic Light Logic

| Status | Condition | Action |
|--------|-----------|--------|
| 🟢 GREEN | actual == expected | Batch can proceed |
| 🟡 YELLOW | actual > expected | Surplus flagged, batch can proceed |
| 🔴 RED | actual < expected | **BLOCKS approval — server hard stop** |

---

## ⚙️ Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your DATABASE_URL and NEXTAUTH_SECRET

# Run database migrations
npx prisma migrate dev

# Seed demo data
npx prisma db seed

# Start development server
npm run dev
```

---

## 🧪 Running Tests

```bash
npm test
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/login/          # Login page
│   ├── dashboard/
│   │   ├── supervisor/        # Cutting Supervisor workspace
│   │   ├── verifier/          # Cutting Verifier terminal
│   │   └── sewing/            # Sewing Supervisor queue
│   └── api/
│       ├── orders/            # Order CRUD + status transitions
│       ├── verification/      # Verification submission (server hard stop)
│       └── sewing/            # Sewing queue (VERIFIED only)
├── components/
├── lib/
│   ├── auth.ts                # NextAuth config + RBAC
│   ├── db.ts                  # Prisma client
│   └── validation.ts          # Server-side guards
prisma/
├── schema.prisma
└── seed.ts
__tests__/
AI_OPTIMIZATION_REPORT.md
```

---

## 🔒 Security

- Server-side RBAC on all API routes
- Hard stop: 422 if any RED component on approval
- JWT identity — verifier ID never trusted from client
- Sewing Queue enforces `WHERE status = 'VERIFIED'` at DB level

---

*Built for Webtezza (Pvt) Ltd Software Engineering Intern Assessment*
