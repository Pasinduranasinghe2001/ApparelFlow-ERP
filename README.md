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

## 🚀 Cloud Deployment (Vercel + Neon)

The application is engineered to deploy seamlessly to **Vercel** with **Neon Serverless PostgreSQL**:

1. **Push repository to GitHub**:
   Ensure all commits are pushed to your GitHub repository:
   ```bash
   git push origin main
   ```
2. **Import to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com) and click **"Add New Project"**.
   - Import your GitHub repository (`ApparelFlow-ERP`).
   - Framework preset: **Next.js**.
3. **Configure Environment Variables in Vercel**:
   Add the following variables under **Project Settings > Environment Variables**:
   - `DATABASE_URL`: Your pooled Neon connection string (e.g., `postgresql://user:pass@ep-xyz-pooler.us-east-2.aws.neon.tech/apparelflow?sslmode=require&connect_timeout=30&pool_timeout=30`)
   - `NEXTAUTH_SECRET`: A generated secret string (or 32-byte hex/base64)
   - `NEXTAUTH_URL`: Your public Vercel production URL (e.g., `https://apparelflow-erp.vercel.app`)
   - `AUTH_SECRET`: Same value as `NEXTAUTH_SECRET`
4. **Deploy**:
   - Click **Deploy**. Vercel will build and deploy the Next.js App Router application.
5. **Verify Database Seed (if new database)**:
   - Run `npx prisma db seed` locally pointed at your Neon DB, or trigger it via a postinstall step to ensure demo accounts and recipes are ready for evaluation.

---

## 🔒 Security & Server-Side Guarantees

- **Server-Side RBAC**: Every API route and Server Action verifies `session.user.role` from server-side JWT session.
- **Server Hard Stop (HTTP 422)**: Rejects batch approval with HTTP 422 if any single component has a shortage or missing count.
- **Query Isolation**: Sewing Queue queries strictly enforce `WHERE status IN ('VERIFIED', 'SEWING_IN_PROGRESS')` at the database level.
- **Tamper Protection**: Verifier identity and audit timestamps are derived from the authenticated server session, never trusted from client request bodies.
- **Immutable Audit Trail**: Verification decisions permanently record verifier attribution, timestamps, mandatory rejection notes, and calculated fabric wastage percentages.

---

## 📄 AI Engineering Protocol Report

See [AI_OPTIMIZATION_REPORT.md](./AI_OPTIMIZATION_REPORT.md) for candid documentation of AI tools utilized, buggy AI code identified and remediated, and architectural hardening decisions.

---

*Built for Webtezza (Pvt) Ltd Software Engineering Intern Assessment*
