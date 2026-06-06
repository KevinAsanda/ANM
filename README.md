# ANM Automotive Service Management System

A web-based workshop operations platform designed to digitise paper-based job cards, inventory tracking, and parts logging for **ANM Workshop** in Marianheights, Pinetown, South Africa.

![ANM System Dashboard Mockup](file:///C:/Users/User/Desktop/My%20Learning/ANM/docs/screenshots/dashboard_mockup.png)

---

## 🔗 Live Demo & Services

- **Frontend Client (Vercel)**: *Ready for deployment*
- **Backend API Server (Render)**: *Ready for deployment*
- **Database (Supabase)**: Live PostgreSQL Instance Configured

---

## 📋 Project Overview

### The Problem
ANM is a real-world automotive repair workshop that operates entirely on manual paper-based processes. Paper job cards are easily lost, inventory counts are prone to discrepancies, and tracking which parts were allocated to which vehicle becomes a tedious administrative task. Additionally, mechanics lack visibility over their specific queue of tasks.

### The Solution
This web-based Service Management System digitises ANM's workflow. It provides:
1. **Admins** with a comprehensive dashboard to log customers/vehicles, assign service tickets to staff, edit stock levels, view low-stock warnings, and create mechanic accounts.
2. **Mechanics** with a targeted mobile-responsive jobs page to view their assigned repairs, update repair stages, and log parts used directly from their smartphones.

This project serves as a university portfolio submission for ISYS300 (Mangosuthu University of Technology, IT Diploma).

---

## ✨ Features

- 🔐 **Dual-Role RBAC (Role-Based Access Control)**: Enforces strict views and permissions for `admin` and `mechanic` roles.
- 🚗 **Customer & Vehicle Cataloging**: Registers customer contact records and links vehicles without duplicating client profiles.
- 📋 **Digital Job Cards (Tickets)**: Tracks repair states (`pending`, `in_progress`, `completed`, `cancelled`) with auto-updated timestamps and assignments.
- 📦 **Smart Inventory Tracking**: Automatic alerts highlight parts at or below the reorder warning level (5 units).
- ⚙️ **Atomic Parts Logging**: Mechanics log inventory items directly to tickets. The database automatically decrements quantity on hand and halts updates if stock is insufficient.
- 📊 **Metrics Dashboard**: Computes active repairs, completed jobs, mechanic workload distribution, and stock reorder warnings in real time.

---

## 🛠 Tech Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | React 18 + TypeScript + Vite | Scalable component structure, state management, and speedy hot-reloading. |
| **Styling** | Tailwind CSS | Utility-first, responsive grids, and design token adherence. |
| **Backend** | Node.js + Express + TypeScript | Lightweight RESTful middleware routing and end-to-end type safety. |
| **Database** | Supabase (PostgreSQL) | Native authentication, Row-Level Security (RLS) enforcement, and server-side RPC. |
| **Testing** | Node Test Runner + Assertions | Integrated testing suite for mock/live validation without external test bloat. |

---

## 📁 Project Structure

```
anm-system/
├── client/              ← React 18 frontend code (Vite)
│   └── src/
│       ├── components/  ← UI primitives (Modal, Button, Table) & Layout structures
│       ├── context/     ← Global state & session management (AuthContext)
│       └── pages/       ← Route-specific views (Dashboard, Tickets, MyJobs, Staff)
├── server/              ← Express API server
│   └── src/
│       ├── controllers/ ← Request controllers & body validations (Zod schemas)
│       ├── middleware/  ← Route interceptors (JWT validation, permissions check)
│       └── services/    ← Business logic & database interaction services
└── docs/                ← Architecture, DB Schemas, and QA Test Plans
```

---

## 🚀 Getting Started & Local Setup

Getting the project up and running locally takes under 5 minutes.

1. **Environment Variables**: Configure client and server `.env` files using their `.env.example` templates.
2. **Database Schema**: Execute SQL schemas in the Supabase SQL editor.
3. **Database Seeding**: Run `npm run seed` inside the `server/` directory to automatically register testing staff accounts and populate diagnostic records.
4. **Launch Application**: Start both the client and server development servers.

For detailed, step-by-step setup guides, refer to [SETUP.md](file:///C:/Users/User/Desktop/My%20Learning/ANM/SETUP.md).

---

## 🧪 Testing

Run backend unit tests verifying authentication, validations, and database constraints:

```bash
cd server
npm run test
```

Run ESLint formatting verification:

```bash
# In client/
npm run lint

# In server/
npm run lint
```

---

## 📈 What I Learned

1. **Server-Side RPC for Transaction Safety**: Learned to implement PostgreSQL functions to process compound inventory writes. Wrapping updates in `SELECT ... FOR UPDATE` locks and transactional checks prevents race conditions where double clicks or concurrent mechanics could force inventory quantities to negative numbers.
2. **Row-Level Security (RLS) Enforcement**: Configured Postgres policies to restrict data queries at the database layer. This ensures a mechanic's API client cannot read customer tables or tickets assigned to peers, even if they manipulate route IDs.
3. **Type-Safe API Contracts**: Built end-to-end safety mapping TypeScript interfaces between the REST API contract and client-side fetches.
4. **Dynamic ESM Testing Environments**: Discovered that static ESM imports load `.env` variables before test assertions can override them. Solved this by utilizing dynamic `await import()` wrappers inside the test runner scripts.

---

## 🔮 Future Improvements

- [ ] **WhatsApp Notification Integration**: Send automated SMS/WhatsApp repair updates and invoice copies to clients.
- [ ] **Offline Mode Syncing**: Enable Service Workers to store log entries locally when mobile data connectivity in the workshop drops, syncing with Supabase once reconnected.
- [ ] **Barcode Scanning API**: Scan barcodes via smartphone camera to log parts to tickets instantly.
- [ ] **Detailed Financial Analytics**: Generate reports showing monthly labor income vs parts costs.