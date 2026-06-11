# Test Plan & Execution Report — ANM Service Management System

This document maps the acceptance criteria from [USER_STORIES.md](file:///C:/Users/User/Desktop/My%20Learning/ANM/docs/USER_STORIES.md) to explicit test cases, indicating their verification status.

---

## 1. Functional Test Cases (Acceptance Criteria)

### Authentication

| Test ID | Description | Acceptance Criteria Mapped | Status | Notes |
| :--- | :--- | :--- | :---: | :--- |
| **TC-AUTH-01** | Secure login redirects Admin to `/dashboard` | AUTH-01 (1, 2) | ✅ PASS | Verified admin redirect to Admin Dashboard. |
| **TC-AUTH-02** | Secure login redirects Mechanic to `/my-jobs` | AUTH-01 (1, 3) | ✅ PASS | Verified mechanic redirect to My Jobs. |
| **TC-AUTH-03** | Invalid email/password shows inline error message | AUTH-01 (4) | ✅ PASS | Shows "Invalid email or password" toast. |
| **TC-AUTH-04** | Empty login inputs show validation errors | AUTH-01 (5) | ✅ PASS | Front-end input validation triggers before fetch. |
| **TC-AUTH-05** | Token stored; session survives page refresh | AUTH-01 (6) | ✅ PASS | Session restored from `localStorage` on mount. |
| **TC-AUTH-06** | Accessing protected page while logged out redirects to `/login` | AUTH-01 (7) | ✅ PASS | Handled by `<ProtectedRoute>` component. |
| **TC-AUTH-07** | Mechanic trying to access Admin pages is redirected | AUTH-01 (8) | ✅ PASS | Handled by `<RoleRoute>` component (routes to `/my-jobs`). |
| **TC-AUTH-08** | Logging out clears storage & session, redirects to `/login` | AUTH-02 (1, 2) | ✅ PASS | Clears tokens and redirects. |
| **TC-AUTH-09** | Pressing browser Back button after logout does not reveal data | AUTH-02 (3) | ✅ PASS | Redirect logic prevents rendering cached state. |

### Customers & Vehicles

| Test ID | Description | Acceptance Criteria Mapped | Status | Notes |
| :--- | :--- | :--- | :---: | :--- |
| **TC-CUST-01** | Admin lists all customers | Sprint 2 (C-01) | ✅ PASS | Admin can search/list customers. |
| **TC-CUST-02** | Admin creates customer; deduplication by phone number | TICKET-01 (6), Sprint 2 (C-02) | ✅ PASS | Reuse customer record if phone already registered. |
| **TC-VEH-01** | Admin links new vehicle to customer | Sprint 2 (C-04) | ✅ PASS | Successfully links vehicle via customer_id. |

### Service Tickets

| Test ID | Description | Acceptance Criteria Mapped | Status | Notes |
| :--- | :--- | :--- | :---: | :--- |
| **TC-TICK-01** | Create service ticket (links customer, vehicle, mechanic) | TICKET-01 (1, 2, 4) | ✅ PASS | Redirects to Detail page with "Pending" status. |
| **TC-TICK-02** | Prevent ticket submission with empty fields | TICKET-01 (3) | ✅ PASS | Correct `<label>` errors highlighted in form. |
| **TC-TICK-03** | View tickets list with columns, sorting (newest first) | TICKET-02 (1, 2) | ✅ PASS | Order default: created_at DESC. |
| **TC-TICK-04** | Filter tickets list by status (Pending/In Progress, etc.) | TICKET-02 (3) | ✅ PASS | Reactive tab filtering on tickets view. |
| **TC-TICK-05** | Empty tickets list shows empty state CTA | TICKET-02 (4) | ✅ PASS | Renders `<EmptyState>` component. |
| **TC-TICK-06** | Ticket detail page displays complete job profile | TICKET-03 (1, 4) | ✅ PASS | Displays details + parts list. |
| **TC-TICK-07** | Admin updates ticket status and adds notes | TICKET-03 (2, 3), TICKET-04 | ✅ PASS | Notes save and status changes update immediately. |
| **TC-TICK-08** | Mechanic sees only assigned jobs in My Jobs list | TICKET-05 (1, 2, 3) | ✅ PASS | RLS and API enforce scoped access. |
| **TC-TICK-09** | Mechanic updates job: Pending -> In Progress -> Completed | TICKET-06 (1) | ✅ PASS | Transitions successfully. |
| **TC-TICK-10** | Mechanic is blocked from cancelling tickets | TICKET-06 (2) | ✅ PASS | No "Cancel" option in UI; backend blocks 403. |

### Inventory & Parts Logging

| Test ID | Description | Acceptance Criteria Mapped | Status | Notes |
| :--- | :--- | :--- | :---: | :--- |
| **TC-INV-01** | View inventory table with Low Stock warning highlights | INVENTORY-01 (1, 2) | ✅ PASS | Highlights items at or below reorder level (<= 5). |
| **TC-INV-02** | Admin adds new part; rejects duplicate part_number | INVENTORY-02 (1, 3, 4) | ✅ PASS | API rejects duplicate with 409 Conflict. |
| **TC-INV-03** | Admin updates part quantity | INVENTORY-03 (1, 2, 3) | ✅ PASS | Stock updates immediately; rejects negative values. |
| **TC-PART-01** | Log parts used; auto-decrements inventory stock | PARTS-01 (1, 2) | ✅ PASS | Handled atomically in DB transaction function. |
| **TC-PART-02** | Reject part logging when requested quantity > stock | PARTS-01 (3) | ✅ PASS | Renders "Insufficient stock" validation error in UI. |
| **TC-PART-03** | Part log appears in ticket detail parts-used list | PARTS-01 (4) | ✅ PASS | Dynamic update on list. |

### Dashboard & Staff

| Test ID | Description | Acceptance Criteria Mapped | Status | Notes |
| :--- | :--- | :---: | :---: | :--- |
| **TC-DASH-01** | Dashboard stats match live summary stats | DASHBOARD-01 (1, 4) | ✅ PASS | Calculates active/completed jobs, mechanics count, and low stock count. |
| **TC-DASH-02** | Dashboard displays 5 recent tickets & low stock alerts | DASHBOARD-01 (2, 3) | ✅ PASS | Fits in layout, redirects to details. |
| **TC-STAFF-01** | Admin lists staff with roles differentiated | STAFF-01 (1, 2) | ✅ PASS | Renders staff list. |
| **TC-STAFF-02** | Admin registers mechanic via Supabase Auth Admin | STAFF-02 (1, 2, 3, 4) | ✅ PASS | Creates Auth user + Staff record; blocks duplicate emails. |

---

## 2. Non-Functional & Quality Gates

### Security Spot Checks

| Test ID | Description | Expected Behaviour | Status | Notes |
| :--- | :--- | :--- | :---: | :--- |
| **TC-SEC-01** | Cross-Site Scripting (XSS) payload sanitisation | User inputs `<script>alert('XSS')</script>`. Renders as plain text, not executed. | ✅ PASS | Checked on description inputs. React auto-escapes string content. |
| **TC-SEC-02** | Row-Level Security (RLS) enforcement | Mechanic makes API request to fetch another mechanic's tickets or admin pages. | ✅ PASS | Supabase RLS returns empty data or error. Middleware returns 403. |
| **TC-SEC-03** | Session integrity & credentials safety | No passwords stored in localStorage or logged to console. | ✅ PASS | Inspected storage; only token and user profile objects are cached. |

### Mobile Responsiveness & Accessibility

| Test ID | Description | Expected Behaviour | Status | Notes |
| :--- | :--- | :--- | :---: | :--- |
| **TC-RESP-01** | Mobile Layout (375px) | Navigation collapses to mobile menu; grids wrap; table scrolls horizontally. | ✅ PASS | Clean presentation on iPhone dimensions. |
| **TC-RESP-02** | Tablet Layout (768px) | Layout adapts, Sidebar/Navbar is accessible; content margins adjusted. | ✅ PASS | Good visual rendering on iPad sizes. |
| **TC-RESP-03** | Desktop Layout (1280px+) | Full layout with grid structures, sidebars, and full stats. | ✅ PASS | Optimized layout for high resolutions. |
| **TC-ACC-01** | Web Accessibility (A11y) | Semantic HTML elements, labels associated with fields, correct heading tree. | ✅ PASS | Run through checklist criteria. Renders correctly. |

---

## 3. V2 Features Test Cases

### Invoicing & Notifications (Sprint 9)

| Test ID | Description | Expected Behaviour | Status | Notes |
| :--- | :--- | :--- | :---: | :--- |
| **TC-INV-V2-01** | Auto-create invoice on completion | Ticket status updated to `completed` automatically generates an unpaid invoice. | ✅ PASS | Verified via status hooks. |
| **TC-INV-V2-02** | Settle Invoice | Admin updates invoice status to `paid` and selects Card/EFT. | ✅ PASS | Verified admin invoice panel update. |
| **TC-INV-V2-03** | Public Invoice Retrieve | Customer accesses `/invoices/:token` to view billing details. | ✅ PASS | Displays clean, print-friendly layout. |

### Financial Reports & Analytics (Sprint 10)

| Test ID | Description | Expected Behaviour | Status | Notes |
| :--- | :--- | :--- | :---: | :--- |
| **TC-FIN-V2-01** | KPI Cards | Gross Revenue, Labor Fees, Parts Billed, and VAT are calculated correctly. | ✅ PASS | Matches backend views. |
| **TC-FIN-V2-02** | Pure SVG Charts | Earnings Trend bar chart and Revenue Split donut chart render correctly. | ✅ PASS | Lightweight charts load without external libraries. |
| **TC-FIN-V2-03** | Staff Performance Table | Mechanic completed ticket count, labor fees, and parts logged are displayed. | ✅ PASS | Lists ranks clearly. |

### Customer Booking & Tracking Portal (Sprint 11)

| Test ID | Description | Expected Behaviour | Status | Notes |
| :--- | :--- | :--- | :---: | :--- |
| **TC-PORT-V2-01** | Public Landing Page | Loads home page with services, testimonials, FAQs, and contact info. | ✅ PASS | Cormorant/Jost typography renders correctly. |
| **TC-PORT-V2-02** | Booking Request Wizard | Customers fill form to request date/time slots. | ✅ PASS | Multi-step wizard validation succeeds. |
| **TC-PORT-V2-03** | Progress Tracker Page | Visual Repair Stepper updates dynamically based on status changes. | ✅ PASS | Checked progress timeline stepper. |
| **TC-PORT-V2-04** | Booking Approval | Admin review panel assigns mechanic and sets labor cost. | ✅ PASS | Approving moves ticket to pending status. |

### Architectural Separation & Deployments

| Test ID | Description | Expected Behaviour | Status | Notes |
| :--- | :--- | :--- | :---: | :--- |
| **TC-ARCH-V2-01** | client-customer build | Independent bundle containing only customer pages, zero admin dashboards. | ✅ PASS | Compiles cleanly down to 236 kB. |
| **TC-ARCH-V2-02** | client-staff build | Independent bundle containing admin/mechanic portal, base URL redirects to login. | ✅ PASS | Compiles cleanly down to 279 kB. |

---

## 4. Automated Unit Test Summary

Backend unit test suite runs with 13 core tests. All test execution results:
- **Auth Middleware**: 4 tests PASS.
- **Sprint 2 (Customers & Vehicles)**: 2 tests PASS.
- **Sprint 3 (Service Tickets)**: 1 test PASS.
- **Sprint 4 (Inventory)**: 1 test PASS.
- **Sprint 5 (Parts Logging)**: 1 test PASS.
- **Sprint 6 (Dashboard Stats)**: 1 test PASS.
- **Sprint 7 (Staff Creation)**: 1 test PASS.
- **Sprint 10 (Financial Analytics)**: 1 test PASS.
- **Sprint 11 (Customer Portal & Approvals)**: 1 test PASS.

Total: **13/13 tests passing**.
