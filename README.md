# ANM Automotive Service Management System (V2)

A web-based workshop operations platform designed to digitise paper-based job cards, inventory tracking, parts logging, and invoicing for **ANM Workshop** in Marianheights, Pinetown, South Africa. 

This repository is architected with **two independent frontends** and a **centralized Node.js API** to allow separate customer-facing and staff-facing deployments.

---

## 🔗 Live Demos & Services

*   **Customer Booking & Tracking Portal**: [https://anm-customer-portal.onrender.com](https://anm-customer-portal.onrender.com)
*   **Internal Staff & Admin Portal**: [https://anm-staff-portal.onrender.com](https://anm-staff-portal.onrender.com)
*   **Backend REST API Server**: [https://anm-backend-api.onrender.com](https://anm-backend-api.onrender.com)
*   **Database (Supabase)**: Live PostgreSQL Instance with Row-Level Security (RLS) and custom triggers.

---

## 📋 Project Overview

### The Problem
ANM is a real-world automotive repair workshop that operates entirely on manual paper-based processes. Paper job cards are easily lost, inventory counts are prone to discrepancies, and tracking which parts were allocated to which vehicle becomes a tedious administrative task. Additionally, mechanics lack visibility over their specific queue of tasks.

### The Solution
This web-based Service Management System digitises ANM's workflow. It provides:
1.  **Customers** with a premium landing page to search repair statuses via unique tokens, request booking slots through a wizard, and review print-friendly invoices with EFT payment details.
2.  **Admins** with a comprehensive dashboard to log customers/vehicles, review and approve booking requests, assign service tickets to staff, edit stock levels, view low-stock warnings, and create mechanic accounts.
3.  **Mechanics** with a targeted mobile-responsive jobs page to view their assigned repairs, update repair stages, and log parts used directly from their smartphones.

This project serves as a university portfolio submission for ISYS300 (Mangosuthu University of Technology, IT Diploma).

---

## ✨ Features

*   🔀 **Architectural Separation**: Customer and Staff portals are split into separate applications, optimizing bundle sizes and isolating security domains.
*   🔐 **Dual-Role RBAC (Role-Based Access Control)**: Enforces strict views and permissions for `admin` and `mechanic` roles.
*   🚗 **Customer & Vehicle Cataloging**: Registers customer contact records and links vehicles without duplicating client profiles.
*   📋 **Digital Job Cards (Tickets)**: Tracks repair states (`draft`, `pending`, `in_progress`, `completed`, `cancelled`) with auto-updated timestamps.
*   📦 **Smart Inventory Tracking**: Automatic alerts highlight parts at or below the reorder warning level (5 units).
*   ⚙️ **Atomic Parts Logging**: Mechanics log inventory items directly to tickets. The database automatically decrements quantity on hand via database transactions and halts updates if stock is insufficient.
*   💳 **Invoicing & Settle States**: Automatic invoice generation upon repair completion. Admins track paid/unpaid states and payment methods (card, cash, EFT).
*   📊 **Financial Reports & Analytics**: Renders KPI summaries and pure SVG-based charts (Monthly Earnings bar charts, Revenue Split donut charts) without external library bloat.
*   ⏱️ **Payroll & Shift Tracking**: Mechanics clock-in/out to log shift hours. The system automatically computes decimal hours and earnings based on hourly rates. Admins oversee stats and approve timesheet logs.
*   📷 **Remote Barcode Scanner**: Links a smartphone as a remote barcode scanner by scanning a QR code. Runs a browser scanning interface with simulated/wedge triggers and real-time transmission back to active desktop screens (filtering inventory or auto-selecting parts).

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
├── client-customer/     ← Public Site (Landing, Booking, Track, Invoices)
├── client-staff/        ← Internal Staff Portal (Login, Dashboard, Inventory, Staff, Invoices, Analytics)
├── server/              ← Node.js + Express API server
│   └── src/
│       ├── controllers/ ← Request handlers & body validations (Zod schemas)
│       ├── middleware/  ← Route interceptors (JWT validation, permissions check)
│       └── services/    ← Business logic & database interaction services
├── docs/                ← Architecture, DB Schemas, and QA Test Plans
└── render.yaml          ← Render Blueprint for one-click deployment
```

---

## 🚀 Getting Started & Local Setup

Getting the project up and running locally takes under 5 minutes.

1.  **Environment Variables**: Configure client-customer, client-staff, and server `.env` files using their `.env.example` templates.
2.  **Database Schema**: Execute SQL schemas in the Supabase SQL editor.
3.  **Database Seeding**: Run `npm run seed` inside the `server/` directory to automatically register testing staff accounts and populate diagnostic records.
4.  **Launch Application**: Start dev servers in all three folders.

For detailed, step-by-step setup guides, refer to [SETUP.md](file:///C:/Users/User/Desktop/My%20Learning/ANM/SETUP.md). For an in-depth breakdown of the system architecture, security mechanisms, database schema, IoT barcode scanner, and Google Gemini AI integrations, refer to the [SYSTEM_DOCUMENTATION.md](file:///C:/Users/User/Desktop/My%20Learning/ANM/docs/SYSTEM_DOCUMENTATION.md) file.

---

## 🧪 Testing

Run backend unit tests verifying authentication, validations, database constraints, invoicing, and approvals:

```bash
cd server
npm run test
```

Run ESLint formatting verification:

```bash
# In client-customer/
npm run lint

# In client-staff/
npm run lint

# In server/
npm run lint
```

---

## 📈 What I Learned

1.  **Codebase Splitting & Bundle Optimization**: Learned how to physically split a unified Single-Page App (SPA) into two distinct directories. This reduced the public customer bundle by 30% (from 335 kB to 236 kB) by removing heavy admin elements, improving mobile performance.
2.  **Render Production Build Caveats**: Understood that setting `NODE_ENV=production` on Render skips devDependencies during `npm install`. Resolved this by configuring `npm install --include=dev` to ensure the TypeScript compiler and global `@types/node` packages are loaded at build time.
3.  **React Router Redirection Parameter Bugs**: Discovered that React Router's `<Navigate to="/track/:token" />` does not automatically interpolate parameters. Fixed this by mounting pages directly to both short (`/track/:token`) and legacy nested paths.
4.  **Pure SVG Charting**: Designed custom, lightweight SVG chart components (bar and donut) to keep the client bundles extremely light without the overhead of heavy external charting libraries.

---

## 🔮 Future Improvements

- [ ] **Twilio WhatsApp API Key Integration**: Transition the mock WhatsApp service to a live Twilio instance to send real SMS/WhatsApp messages.
- [ ] **Offline Mode Syncing**: Enable Service Workers to store log entries locally when mobile data connectivity in the workshop drops, syncing with Supabase once reconnected.
- [ ] **SMS Service Reminders**: Send periodic SMS reminders to customers 12 months after their last repair job card.

---

## 📄 License

MIT