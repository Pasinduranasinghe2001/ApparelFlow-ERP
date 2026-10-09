# ApparelFlow ERP — Cutting Operations & Gatekeeper Verification Terminal

[![Live Cloud Deployment](https://img.shields.io/badge/Vercel-Deployed-success?style=for-the-badge&logo=vercel)](https://apparel-flow-erp-pearl.vercel.app)
[![Tests Passing](https://img.shields.io/badge/Vitest-18%2F18%20Passed-brightgreen?style=for-the-badge&logo=vitest)](https://github.com/Pasinduranasinghe2001/ApparelFlow-ERP)
[![Next.js 16](https://img.shields.io/badge/Next.js-16%20App%20Router-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon%20Serverless-blue?style=for-the-badge&logo=postgresql)](https://neon.tech)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20Mode-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)

> **Company:** Webtezza (Pvt) Ltd  
> **Position:** Software Engineering Intern (Full-Stack / React / Next.js)  
> **Assessment Type:** Practical Engineering Challenge — ApparelFlow ERP Execution System  
> **Focus Module:** Production Batch Verification & Sewing Queue Gate (Full-Stack RBAC)  
> **Live Production URL:** [https://apparel-flow-erp-pearl.vercel.app](https://apparel-flow-erp-pearl.vercel.app)  
> **GitHub Repository:** [https://github.com/Pasinduranasinghe2001/ApparelFlow-ERP](https://github.com/Pasinduranasinghe2001/ApparelFlow-ERP)

---

## 📑 Table of Contents
1. [Executive Summary & Problem Statement](#-executive-summary--problem-statement)
2. [Critical System Boundary (Server-Side Hard Stop)](#-critical-system-boundary-server-side-hard-stop)
3. [Operational Personas & RBAC Credentials](#-operational-personas--rbac-credentials)
4. [Manufacturing State Machine & Closed-Loop Re-Cut Flow](#-manufacturing-state-machine--closed-loop-re-cut-flow)
5. [Core Functional Specifications](#-core-functional-specifications)
6. [Traffic Light Verification Matrix](#-traffic-light-verification-matrix)
7. [Relational Database Schema](#-relational-database-schema)
8. [Server-Side Tamper Protection & Security Rules](#-server-side-tamper-protection--security-rules)
9. [Automated Test Suite (18 Tests)](#-automated-test-suite-18-tests)
10. [Local Development & Cloud Deployment](#-local-development--cloud-deployment)
11. [Evaluator 5-Minute Technical Audit Checklist](#-evaluator-5-minute-technical-audit-checklist)
12. [AI Usage & Engineering Judgment Protocol](#-ai-usage--engineering-judgment-protocol)

---

## 🏭 Executive Summary & Problem Statement

In commercial apparel manufacturing, the **Cutting Department** is the single most critical quality checkpoint. Bulk fabric rolls are spread, cut, and bundled before being handed over to an assembly floor where over 100 high-speed sewing machine operators assemble garments.

If cut bundles contain fabric defects, component shortages, or count mismatches, and those bundles reach the sewing floor:
- The entire assembly line grinds to a halt.
- Incomplete garments pile up at work-in-progress stations.
- Expensive fabric rolls are wasted, causing massive financial penalties.
- International shipping deadlines are missed.

**ApparelFlow ERP** mandates a non-bypassable checkpoint: **The Cutting Operations & Gatekeeper Verification Terminal**. Zero unverified, mismatched, or shortage batches may ever enter the Sewing Queue.

---

## 🛑 Critical System Boundary (Server-Side Hard Stop)

> **CRITICAL BOUNDARY:** A cutting batch can **NEVER** proceed to sewing assembly without explicit component-by-component verification and digital sign-off by an authorized Cutting Verifier. If even a single component has a shortage (`RED`), backend validation **rejects** the approval with **HTTP 422 Unprocessable Entity** and physically prevents the batch from entering the Sewing Queue.

Security is not client-side: disabled buttons and hidden UI elements are backed by strict server-side validation, database query isolation, and role verification.

---

## 👥 Operational Personas & RBAC Credentials

The application enforces real authentication and role boundaries across three factory roles. Quick 1-click login buttons are provided on the login page for evaluator testing:

| Persona | Role Key | Demo Email | Password | Factory Responsibilities & Security Restrictions |
|---|---|---|---|---|
| 👔 **Cutting Supervisor** | `cutting_supervisor` | `supervisor@apparelflow.com` | `demo1234` | **Allowed:** Creates cutting orders from recipes, sets batch quantities, logs fabric yards, tracks floor cutting, and re-cuts/resubmits rejected batches.<br>**Restriction:** Cannot verify batches (separation of duties). Cannot access the Sewing Queue. |
| 🔍 **Cutting Verifier** | `cutting_verifier` | `verifier@apparelflow.com` | `demo1234` | **Allowed:** Isolated QC terminal. Counts physical parts per recipe, triggers traffic lights, approves compliant batches, or rejects defective/short batches with mandatory reason notes.<br>**Restriction:** Cannot create cutting orders or edit recipes. Cannot access Sewing Queue. |
| 🧵 **Sewing Supervisor** | `sewing_supervisor` | `sewing@apparelflow.com` | `demo1234` | **Allowed:** Receives verified batches on assembly floor, reviews verifier audit attribution, and initiates assembly.<br>**Restriction:** Strictly blocked by database-level query isolation from seeing unverified, pending, or rejected cutting orders. |

---

## 🔄 Manufacturing State Machine & Closed-Loop Re-Cut Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     MANUFACTURING FINITE STATE PIPELINE                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   [1. CUTTING_IN_PROGRESS]                                                      │
│        Supervisor prepares order & spreads fabric                               │
│                   │                                                             │
│                   ▼  (Supervisor dispatches via "Send to QC")                   │
│   [2. PENDING_VERIFICATION]                                                     │
│        Bundles physically arrive at Verification Terminal                       │
│                   │                                                             │
│                   ▼  (Verifier physical piece count)                            │
│        ┌──────────┴──────────┐                                                  │
│        │                     │                                                  │
│  (Shortage / Defect)    (Exact or Surplus)                                      │
│        ▼                     ▼                                                  │
│   [REJECTED]            [3. VERIFIED]                                           │
│  Mandatory Note logged       │ Permanent verifier attribution                   │
│        │                     │ Timestamp & Fabric Wastage % written             │
│        ▼                     ▼                                                  │
│  Supervisor Re-Cut      [4. SEWING_QUEUE]                                       │
│  & Resubmit to QC            Assembly Line Released                             │
│  (Logs extra fabric)         "Start Sewing Assembly"                            │
│        │                     ▼                                                  │
│        └───────────────►[SEWING_IN_PROGRESS]                                    │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Closed-Loop Re-Cut Implementation:
When QC rejects a batch, the ERP returns the order to the Cutting Supervisor with the verifier's mandatory audit reason. The Cutting Supervisor can inspect the reason (e.g. *"Collar panel shortage: 45 cut vs 50 expected"*), cut replacement parts, record any additional fabric yards consumed, and click **"Re-Cut & Resubmit to QC"**. The system resets verification count items and transitions the batch back to `PENDING_VERIFICATION` for re-inspection.

---

## 📦 Core Functional Specifications

### 1. Pre-Seeded Industrial Production Recipes (Bill of Materials)
Seeded with **10 real garment production specifications** with complete component breakdowns:
- **Casual Blouse** (`REC-BL01`): 1.8 yds/pc | 5.0% Wastage Cap | 5 Components (Front Body, Back Body, Sleeves, Collar & Stand, Sleeve Cuffs)
- **Crop Top** (`REC-CT02`): 1.1 yds/pc | 8.0% Wastage Cap | 5 Components (Front Chest, Back Support, Neck Binding, Hem Elastic, Side Straps)
- **Denim Trucker Jacket** (`REC-DJ03`): 2.6 yds/pc | 6.0% Wastage Cap | 6 Components
- **Classic Polo Shirt** (`REC-PT04`): 1.4 yds/pc | 4.5% Wastage Cap | 6 Components
- **Fleece Hooded Sweatshirt** (`REC-HD05`): 2.2 yds/pc | 5.5% Wastage Cap | 6 Components
- **Tailored Chino Trousers** (`REC-TR06`): 1.9 yds/pc | 5.0% Wastage Cap | 6 Components
- **Summer Sundress** (`REC-SD07`): 2.0 yds/pc | 6.0% Wastage Cap | 6 Components
- **Athletic Jogger Pants** (`REC-JP08`): 1.7 yds/pc | 4.0% Wastage Cap | 5 Components
- **Formal Dress Shirt** (`REC-FS09`): 2.0 yds/pc | 4.5% Wastage Cap | 7 Components
- **Kids School Uniform Shirt** (`REC-KU10`): 1.2 yds/pc | 7.0% Wastage Cap | 5 Components

### 2. Multiplier Engine & Order Creation
The Cutting Supervisor selects a recipe and enters target batch quantity (e.g. 50 units), Fabric Roll ID, and actual fabric used (yards). The multiplier engine dynamically derives expected cut pieces for every single component:
$$\text{Expected Component Count} = \text{Target Batch Quantity} \times \text{Pieces Per Garment}$$

### 3. Sewing Queue Handoff & Fabric Wastage Analytics
When an order transitions to `VERIFIED`, the backend automatically computes fabric variance against standard consumption:
$$\text{Fabric Wastage \%} = \left[ \frac{\text{Actual Fabric Used} - \text{Expected Fabric}}{\text{Expected Fabric}} \right] \times 100$$
Where $\text{Expected Fabric} = \text{Target Quantity} \times \text{Recipe Standard Fabric Yards}$.  
This value is written to the immutable audit trail and displayed on the Sewing Queue with warning badges if it breaches the recipe's wastage cap.

---

## 🚦 Traffic Light Verification Matrix

| Status Flag | Condition Formula | Industrial Meaning | System Action Rule |
|---|---|---|---|
| 🟢 **GREEN (MATCH)** | `Actual == Expected` | Exact component match | Satisfies verification requirement; batch may proceed. |
| 🟡 **YELLOW (EXCESS)** | `Actual > Expected` | Surplus cut pieces | Surplus flagged for safety margin / returns; batch may proceed. |
| 🔴 **RED (SHORTAGE)** | `Actual < Expected` | **DEFECT SHORTAGE** | Garment assembly impossible. **Approve action strictly blocked** on UI & API. |

---

## 🗃️ Relational Database Schema

Engineered with PostgreSQL and Prisma ORM:

```
┌──────────────┐          ┌───────────────────┐          ┌───────────────────────┐
│    users     │          │      recipes      │          │   recipe_components   │
├──────────────┤          ├───────────────────┤          ├───────────────────────┤
│ id (PK)      │          │ id (PK)           │1       * │ id (PK)               │
│ email (UQ)   │          │ recipe_code (UQ)  ├──────────┤ recipe_id (FK)        │
│ password_hash│          │ name              │          │ component_name        │
│ role         │          │ category          │          │ pieces_per_garment    │
│ full_name    │          │ std_fabric_yards  │          │ image_url             │
│ created_at   │          │ wastage_cap       │          └───────────────────────┘
└──────┬───────┘          └─────────┬─────────┘
       │ 1                          │ 1
       │                            │
       │ *                          │ *
┌──────┴────────────────────────────┴─────────┐
│               cutting_orders                │
├─────────────────────────────────────────────┤
│ id (PK)                                     │
│ order_no (UQ)                               │
│ recipe_id (FK) ─────────────────────────────┘
│ target_qty                                  │
│ fabric_roll_id                              │
│ actual_fabric_yds                           │
│ status (CUTTING_IN_PROGRESS | PENDING | ..) │
│ created_by (FK)                             │
│ created_at / updated_at                     │
└──────────────┬──────────────────────────────┘
               │ 1
       ┌───────┴────────────────────────┐
       │ *                              │ *
┌──────┴──────────────────────┐  ┌──────┴─────────────────────────┐
│     verification_items      │  │       verification_logs        │
├─────────────────────────────┤  ├────────────────────────────────┤
│ id (PK)                     │  │ id (PK)                        │
│ order_id (FK)               │  │ order_id (FK)                  │
│ component_id (FK)           │  │ verifier_id (FK -> users)      │
│ expected_qty                │  │ decision (APPROVED / REJECTED) │
│ actual_qty                  │  │ rejection_note                 │
│ status (GREEN / YELLOW / RED)│  │ wastage_pct                    │
└─────────────────────────────┘  │ timestamp                      │
                                 └────────────────────────────────┘
```

---

## 🔒 Server-Side Tamper Protection & Security Rules

1. **Server-Side RBAC (HTTP 403 Forbidden):**  
   If a user with role `cutting_supervisor` sends a direct POST request to `/api/verification/:orderId`, the server validates the authenticated session role and rejects it with `403 Forbidden`.
2. **Server-Side Hard Stop (HTTP 422 Unprocessable Entity):**  
   If an approval request is received for an order where any component is `RED` or uncounted, the backend rejects it with `422 Unprocessable Entity` and rolls back state.
3. **Database-Level Query Isolation:**  
   The Sewing Queue endpoint (`/api/sewing/queue`) and dashboard page strictly execute:  
   `prisma.cuttingOrder.findMany({ where: { status: { in: ['VERIFIED', 'SEWING_IN_PROGRESS'] } } })`.  
   Manipulating URL query parameters cannot leak unverified or rejected orders.
4. **Authenticated Context:**  
   Verifier identity and audit timestamps are derived from verified server sessions—never trusted from client bodies.
5. **Mandatory Rejection Notes:**  
   Rejections without a non-empty reason note fail server-side validation with `422`.

---

## 🧪 Automated Test Suite (18 Tests)

The test suite covers core domain rules, security guards, fabric analytics, and re-cut state transitions:

```bash
npm test
```

### Verified Test Cases:
- **Test 1:** An order with all GREEN components can be approved by an authenticated Verifier.
- **Test 1b:** An order with surplus (YELLOW) components can also be approved.
- **Test 2:** An order containing at least one RED (shortage) component blocks approval and returns HTTP 422.
- **Test 2b:** An uncounted item (missing count) blocks approval with HTTP 422.
- **Test 3:** Rejecting an order without a reason note is rejected by backend validation (HTTP 422).
- **Test 4:** Non-verifier roles receive 403 Forbidden when attempting verification approval.
- **Test 5:** Unapproved orders never appear in the Sewing Queue database query (Query Isolation).
- **Traffic Light Matrix:** Tests exact match (GREEN), surplus (YELLOW), shortage (RED), and zero count (RED).
- **Multiplier Engine:** Tests expected component calculation across varied batch quantities.
- **Fabric Wastage Analytics:** Tests standard vs actual consumption percentage calculation.
- **Re-Cut Closed-Loop State:** Tests supervisor re-cut transition (`REJECTED` → `PENDING_VERIFICATION`), authorization guards (403 for non-supervisors), and status validity (400 for non-rejected orders).

---

## 💻 Local Development & Cloud Deployment

### 1. Prerequisites
- Node.js 20+
- PostgreSQL database (or free Neon serverless database)

### 2. Setup
```bash
# Clone the repository
git clone https://github.com/Pasinduranasinghe2001/ApparelFlow-ERP.git
cd ApparelFlow-ERP

# Install dependencies
npm install

# Configure environment variables (.env)
cp .env.example .env
```

Ensure your `.env` contains:
```env
DATABASE_URL="postgresql://user:password@ep-xyz.us-east-2.aws.neon.tech/apparelflow?sslmode=require&connect_timeout=30&pool_timeout=30"
NEXTAUTH_SECRET="your-32-character-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="your-32-character-secret-key-here"
```

### 3. Database Migration & Seeding
```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed 10 production recipes & 3 demo user roles
npx prisma db seed
```

### 4. Run Application
```bash
npm run dev
# Open http://localhost:3000
```

---

## ⏱️ Evaluator 5-Minute Technical Audit Checklist

Webtezza technical evaluators can test the system in 5 minutes:

1. **Contrast & Theme Audit:**  
   Click the **Theme Toggle** (top-right corner) to test Dark Mode and High-Contrast Light Mode. Confirm all input fields, text labels, and dropdown menus render with high contrast and zero invisible text.
2. **RBAC Isolation Audit:**  
   Log in as Verifier (`verifier@apparelflow.com` / `demo1234`). Confirm the "+ New Cutting Order" button is hidden. Log in as Sewing Supervisor (`sewing@apparelflow.com`). Confirm only verified orders are visible.
3. **Shortage Hard Stop Audit:**  
   As Verifier, open an order pending verification. Enter a count lower than expected on any component (e.g. 45 instead of 50). Confirm the traffic light turns 🔴 **RED**, the "Approve Batch" button becomes disabled, and direct API submission returns **HTTP 422**.
4. **Rejection & Re-Cut Closed-Loop Audit:**  
   Enter a rejection note (e.g. *"Collar shortage: 45 cut vs 50 expected"*) and click **"Reject Batch"**. Log out and sign in as Cutting Supervisor (`supervisor@apparelflow.com`). Observe the order flagged as `REJECTED (NEEDS RE-CUT)`. Click **"Re-Cut & Fix"**, log additional fabric used, and click **"Confirm Re-Cut & Send to QC"**. Verify the batch reappears in the Verifier QC Terminal.
5. **Sewing Handoff & Persistence Audit:**  
   In Verifier Terminal, enter matching counts (all 🟢 **GREEN**) and click **"Approve & Release to Sewing"**. Switch to Sewing Supervisor. Confirm the batch appears with verifier attribution and fabric wastage percentage. Refresh the browser; confirm all records persist in PostgreSQL.

---

## 🤖 AI Usage & Engineering Judgment Protocol

In compliance with assessment Section 12, the project includes a comprehensive **[AI_OPTIMIZATION_REPORT.md](./AI_OPTIMIZATION_REPORT.md)** documenting:
1. AI tools used (Google Antigravity, Claude 3.7 Sonnet, Gemini 3.8 Flash) and task scoping.
2. Specific flawed/broken AI code detected (Next.js 16 cache protocol conflicts, NextAuth v5 middleware recursive spin, Neon PostgreSQL pool exhaustion, and client-only validation bypasses).
3. Human refactoring and architectural hardening implemented.
4. Defensive state machine safeguards preventing illegal status overrides.

---

*Engineered with precision for Webtezza (Pvt) Ltd — Software Engineering Intern Practical Assessment.*
