# Task Breakdown — ANM Service Management System

**Label key:** `[FRONTEND]` `[BACKEND]` `[TEST]` `[DOCS]` `[DESIGN]`
**Status key:** ⬜ Not started | 🔄 In progress | ✅ Done

---

## SETUP — Project Initialisation

| # | Task | Label | Status |
|---|------|-------|--------|
| S-01 | Initialise server: `npm create` Node.js + Express + TypeScript, set up folder structure | `[BACKEND]` | ⬜ |
| S-02 | Create Supabase project, run schema from `docs/DB_SCHEMA.md`, enable RLS on all tables | `[BACKEND]` | ⬜ |
| S-03 | Configure Supabase RLS policies (see `docs/DB_SCHEMA.md` — policies section) | `[BACKEND]` | ⬜ |
| S-04 | Add `.env`, `.env.example`, `.gitignore` to server | `[BACKEND]` | ⬜ |
| S-05 | Set up global error-handling middleware | `[BACKEND]` | ⬜ |
| S-06 | Set up request logger middleware (morgan or custom) | `[BACKEND]` | ⬜ |
| S-07 | Initialise client: `npm create vite` React + TypeScript | `[FRONTEND]` | ⬜ |
| S-08 | Install and configure Tailwind CSS in client | `[FRONTEND]` | ⬜ |
| S-09 | Set up design tokens in `client/src/styles/tokens.css` per `docs/DESIGN_SPEC.md` | `[FRONTEND]` | ⬜ |
| S-10 | Create client folder structure: `components/ui/`, `pages/`, `hooks/`, `services/`, `context/`, `types/` | `[FRONTEND]` | ⬜ |
| S-11 | Add `.env`, `.env.example`, `.gitignore` to client | `[FRONTEND]` | ⬜ |
| S-12 | Write `docs/API_CONTRACT.md` — full request/response spec for every endpoint before writing routes | `[BACKEND]` | ⬜ |

---

## SPRINT 1 — Authentication

| # | Task | Label | Status |
|---|------|-------|--------|
| A-01 | Install Supabase client on server; create `config/supabase.ts` | `[BACKEND]` | ⬜ |
| A-02 | Build `authenticate` middleware: validates Supabase JWT from `Authorization: Bearer` header | `[BACKEND]` | ⬜ |
| A-03 | Build `requireRole(role)` middleware: checks `user.role` from staff table, returns 403 if mismatch | `[BACKEND]` | ⬜ |
| A-04 | `POST /api/v1/auth/login` — validates credentials via Supabase Auth, returns JWT + user profile | `[BACKEND]` | ⬜ |
| A-05 | `GET /api/v1/auth/me` — returns current user profile (protected route) | `[BACKEND]` | ⬜ |
| A-06 | Build `Button` primitive component with variants: primary, secondary, danger, ghost — typed props, ARIA correct | `[FRONTEND]` | ⬜ |
| A-07 | Build `Input` primitive component with label, error state, helper text — correct `<label>` association | `[FRONTEND]` | ⬜ |
| A-08 | Build `Spinner` loading component | `[FRONTEND]` | ⬜ |
| A-09 | Build `AuthContext` — stores `user`, `token`, `isLoading`; provides `login()` and `logout()` | `[FRONTEND]` | ⬜ |
| A-10 | Build `authService.ts` — `login(email, password)` calls `POST /api/v1/auth/login` | `[FRONTEND]` | ⬜ |
| A-11 | Build Login page — form with email + password, error display, calls `authService.login()` | `[FRONTEND]` | ⬜ |
| A-12 | Build `ProtectedRoute` component — redirects to `/login` if no valid token | `[FRONTEND]` | ⬜ |
| A-13 | Build `RoleRoute` component — redirects to role's home if wrong role accesses a route | `[FRONTEND]` | ⬜ |
| A-14 | Set up React Router with all routes (even if pages are empty stubs) — admin routes, mechanic routes | `[FRONTEND]` | ⬜ |
| A-15 | On successful login: admin → `/dashboard`, mechanic → `/my-jobs` | `[FRONTEND]` | ⬜ |
| A-16 | `[TEST]` Unit tests for `authenticate` middleware: valid token pass, missing token 401, expired token 401 | `[TEST]` | ⬜ |

---

## SPRINT 2 — Customers & Vehicles

| # | Task | Label | Status |
|---|------|-------|--------|
| C-01 | `GET /api/v1/customers` — list all customers (admin only) | `[BACKEND]` | ⬜ |
| C-02 | `POST /api/v1/customers` — create customer; deduplication by phone number | `[BACKEND]` | ⬜ |
| C-03 | `GET /api/v1/customers/:id/vehicles` — list vehicles for a customer | `[BACKEND]` | ⬜ |
| C-04 | `POST /api/v1/vehicles` — add vehicle linked to a customer | `[BACKEND]` | ⬜ |
| C-05 | Input validation on all C-01 to C-04 endpoints (zod or express-validator) | `[BACKEND]` | ⬜ |

---

## SPRINT 3 — Service Tickets

| # | Task | Label | Status |
|---|------|-------|--------|
| T-01 | `GET /api/v1/tickets` — all tickets (admin); supports `?status=` filter | `[BACKEND]` | ⬜ |
| T-02 | `GET /api/v1/tickets/my-jobs` — tickets assigned to the requesting mechanic | `[BACKEND]` | ⬜ |
| T-03 | `POST /api/v1/tickets` — create ticket; links customer, vehicle, mechanic (admin only) | `[BACKEND]` | ⬜ |
| T-04 | `GET /api/v1/tickets/:id` — full ticket detail with parts used | `[BACKEND]` | ⬜ |
| T-05 | `PATCH /api/v1/tickets/:id/status` — update status; enforce role rules (mechanic can't cancel) | `[BACKEND]` | ⬜ |
| T-06 | `PATCH /api/v1/tickets/:id/notes` — admin adds/updates notes | `[BACKEND]` | ⬜ |
| T-07 | Input validation on all ticket endpoints | `[BACKEND]` | ⬜ |
| T-08 | Build `Badge` component — variants: pending (amber), in_progress (blue), completed (green), cancelled (grey) | `[FRONTEND]` | ⬜ |
| T-09 | Build `Card` primitive component | `[FRONTEND]` | ⬜ |
| T-10 | Build `Table` primitive component (responsive, handles empty state) | `[FRONTEND]` | ⬜ |
| T-11 | Build `EmptyState` component — icon + title + optional CTA button | `[FRONTEND]` | ⬜ |
| T-12 | Build `ticketsService.ts` — all ticket API calls | `[FRONTEND]` | ⬜ |
| T-13 | Build Tickets List page (admin) — table of all tickets, status filter tabs, loading/empty/error states | `[FRONTEND]` | ⬜ |
| T-14 | Build Create Ticket page — form with customer search/create, vehicle fields, mechanic select, description | `[FRONTEND]` | ⬜ |
| T-15 | Build `Select` primitive component (dropdown) — typed, labelled, keyboard-navigable | `[FRONTEND]` | ⬜ |
| T-16 | Build `Textarea` primitive component | `[FRONTEND]` | ⬜ |
| T-17 | Build Ticket Detail page — all ticket info, status badge, parts-used list, status update button | `[FRONTEND]` | ⬜ |
| T-18 | Build My Jobs page (mechanic) — only mechanic's assigned tickets, with status badges | `[FRONTEND]` | ⬜ |
| T-19 | `[TEST]` Curl-test all ticket endpoints against `docs/API_CONTRACT.md` | `[TEST]` | ⬜ |

---

## SPRINT 4 — Inventory

| # | Task | Label | Status |
|---|------|-------|--------|
| I-01 | `GET /api/v1/inventory` — all parts; optional `?low_stock=true` filter | `[BACKEND]` | ⬜ |
| I-02 | `POST /api/v1/inventory` — add new part; reject duplicate part_number (admin only) | `[BACKEND]` | ⬜ |
| I-03 | `PATCH /api/v1/inventory/:id` — update qty, reorder level, or cost (admin only) | `[BACKEND]` | ⬜ |
| I-04 | Input validation on all inventory endpoints | `[BACKEND]` | ⬜ |
| I-05 | Build `inventoryService.ts` | `[FRONTEND]` | ⬜ |
| I-06 | Build Inventory List page — table of parts, low-stock warning badge, edit stock button | `[FRONTEND]` | ⬜ |
| I-07 | Build `Modal` primitive component — accessible, keyboard-trappable, closes on Escape | `[FRONTEND]` | ⬜ |
| I-08 | Build Add/Edit Part form inside Modal — validates required fields | `[FRONTEND]` | ⬜ |
| I-09 | `[TEST]` Curl-test all inventory endpoints | `[TEST]` | ⬜ |

---

## SPRINT 5 — Parts Logging

| # | Task | Label | Status |
|---|------|-------|--------|
| P-01 | `POST /api/v1/tickets/:id/parts` — log part on ticket; auto-deduct from inventory; error if insufficient stock | `[BACKEND]` | ✅ |
| P-02 | `GET /api/v1/tickets/:id/parts` — list parts used on a ticket | `[BACKEND]` | ✅ |
| P-03 | Wrap inventory deduction and part-log creation in a **database transaction** | `[BACKEND]` | ✅ |
| P-04 | Input validation (part_id required, qty ≥ 1, not exceeding stock) | `[BACKEND]` | ✅ |
| P-05 | Build Log Part form on Ticket Detail page — part select dropdown + qty input | `[FRONTEND]` | ✅ |
| P-06 | Build Parts Used list on Ticket Detail page — part name, qty, cost, who logged it | `[FRONTEND]` | ✅ |
| P-07 | Show live stock remaining next to selected part in the Log Part form | `[FRONTEND]` | ✅ |
| P-08 | `[TEST]` Test: log part → confirm inventory decremented; test over-stock error | `[TEST]` | ✅ |

---

## SPRINT 6 — Dashboard

| # | Task | Label | Status |
|---|------|-------|--------|
| D-01 | `GET /api/v1/dashboard/stats` — returns: active_jobs, completed_today, total_mechanics, low_stock_count | `[BACKEND]` | ✅ |
| D-02 | `GET /api/v1/dashboard/recent-tickets` — last 5 tickets (admin) | `[BACKEND]` | ✅ |
| D-03 | `GET /api/v1/dashboard/low-stock` — parts below reorder level | `[BACKEND]` | ✅ |
| D-04 | Build `StatsCard` component — icon, label, numeric value | `[FRONTEND]` | ✅ |
| D-05 | Build Admin Dashboard page — stats row, recent tickets list, low-stock alerts | `[FRONTEND]` | ✅ |
| D-06 | Build Navbar component — logo, nav links (role-conditional), user avatar + logout | `[FRONTEND]` | ✅ |
| D-07 | Build `Toast` notification component — success, error, info variants; auto-dismiss | `[FRONTEND]` | ✅ |

---

## SPRINT 7 — Staff Management

| # | Task | Label | Status |
|---|------|-------|--------|
| ST-01 | `GET /api/v1/staff` — list all staff (admin only) | `[BACKEND]` | ⬜ |
| ST-02 | `POST /api/v1/staff` — admin creates mechanic account via Supabase Auth Admin API; sets role | `[BACKEND]` | ⬜ |
| ST-03 | Build Staff List page — table: name, email, role, date added | `[FRONTEND]` | ⬜ |
| ST-04 | Build Add Mechanic form in Modal — name, email, temp password | `[FRONTEND]` | ⬜ |

---

## SPRINT 8 — Polish & Handoff

| # | Task | Label | Status |
|---|------|-------|--------|
| PO-01 | Ensure all screens handle loading, error, empty, and success states | `[FRONTEND]` | ⬜ |
| PO-02 | Mobile responsiveness: test all screens at 375px, 768px, 1280px | `[FRONTEND]` | ⬜ |
| PO-03 | Run `npx axe-cli` — fix any Critical or Serious accessibility violations | `[FRONTEND]` | ⬜ |
| PO-04 | Run `npm run lint` — fix all warnings and errors | `[FRONTEND]` | ⬜ |
| PO-05 | Run `npm run build` — fix any build errors | `[FRONTEND]` | ⬜ |
| PO-06 | Seed Supabase with realistic demo data: 3 customers, 5 vehicles, 2 mechanics, 8 tickets across all statuses, 12 inventory items | `[BACKEND]` | ⬜ |
| PO-07 | Write at least 5 unit tests for service layer: auth, ticket creation, inventory deduction | `[TEST]` | ⬜ |
| PO-08 | Deploy frontend to Vercel | `[DOCS]` | ⬜ |
| PO-09 | Deploy backend to Render | `[DOCS]` | ⬜ |
| PO-10 | Update `docs/PROJECT_OVERVIEW.md` with live demo links | `[DOCS]` | ⬜ |

---

## V2 Features (Do Not Build Yet)

- Customer-facing booking portal
- Barcode scanner IoT integration
- WhatsApp/SMS notifications
- Payroll module
- Financial reports

---

## Portfolio Fixes (Added by Reviewer at End)

> This section is filled in by the Portfolio Reviewer role (07) after the full build.
