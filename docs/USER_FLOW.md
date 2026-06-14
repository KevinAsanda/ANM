# User Flow — ANM Service Management System

## Entry Point

All users land on the **Login Screen** first. There is no public-facing page in MVP.

---

## Admin Flow

```
[Login Screen]
  → (valid admin credentials) → [Admin Dashboard]
  → (invalid credentials) → [inline error: "Invalid email or password"]
  → (empty fields) → [field validation errors]

[Admin Dashboard]
  ├── Quick stats: active jobs / completed today / total mechanics / low stock count
  ├── Recent tickets list (last 5) → [Ticket Detail]
  ├── Low-stock alerts → [Inventory List]
  └── Navbar links → [Tickets List] [Inventory] [Staff] [Invoices List] [Financial Reports] [Logout]

[Tickets List]
  ├── Filter tabs: All | Pending | In Progress | Completed | Cancelled
  ├── Click ticket row → [Ticket Detail]
  ├── "New Ticket" button → [Create Ticket]
  └── (no tickets yet) → [Empty state: "No service tickets — create your first one"]

[Create Ticket]
  ├── Fill: customer name, phone, vehicle reg, make, model, year, description, assign mechanic
  ├── (valid submit) → [Ticket Detail] (newly created ticket)
  ├── (missing required fields) → [field-level validation errors shown inline]
  ├── (duplicate phone number) → customer info is auto-filled from existing record
  └── (submit error from server) → [inline error above button]

[Ticket Detail]
  ├── Shows: customer, vehicle, mechanic, status badge, description, notes, parts used
  ├── Status dropdown → change status → (saved) → [badge updates]
  │     └── If status set to 'completed' → [System generates Invoice] → [WhatsApp trigger]
  ├── Notes field → save → [notes updated]
  ├── "Log Part Used" → Part select + qty input → (submit) → [parts list updates, inventory deducts]
  │     └── (insufficient stock) → [inline error: "Only [n] units available"]
  ├── "View/Create Invoice" button (if not generated yet) → [Generate Invoice dialog] → [Invoice Detail]
  └── Back → [Tickets List]

[Invoices List]
  ├── Table: invoice number, ticket ref (vehicle reg), customer, total amount, status, date
  ├── Click invoice row → [Invoice Detail]
  └── Status filters: All | Unpaid | Paid | Void

[Invoice Detail]
  ├── Shows: invoice metadata, customer, vehicle, parts breakdown, labor cost, VAT, total
  ├── Print button → open browser print dialog (print-friendly CSS stylesheet)
  └── Toggle Payment button → [Toggle Payment Modal]

[Toggle Payment Modal]
  ├── Select payment method (cash, card, eft)
  └── Submit → [Invoice Detail updates status to 'paid']

[Financial Reports]
  ├── Date range selector: 30 days | 90 days | Year to Date
  ├── KPI Row: Gross Revenue, Labor Revenue, Parts Revenue, VAT Collected
  ├── Earnings trend chart (Monthly SVG bar/line chart)
  ├── Revenue split donut chart (SVG donut)
  └── Technician Performance rankings table → click mechanic → [Staff List] (scoped profile)

[Inventory List]
  ├── Table: part name, part number, qty in stock, reorder level, unit cost
  ├── Low stock rows → highlighted with amber "Low Stock" badge
  ├── "AI Smart Reorder Advisor" panel → shows suggested restock quantities
  │     └── Click "Restock" → [Restock Confirmation Modal] → (edit/confirm) → updates inventory stock
  ├── "Add Part" button → [Add Part Modal]
  ├── Edit icon → [Edit Part Modal]
  └── (no parts yet) → [Empty state]

[Restock Confirmation Modal]
  ├── Review AI-suggested quantities for each low-stock or forecasted item
  ├── Edit quantities manually to retain human decision control
  └── Submit → updates inventory database immediately

[Add Part Modal / Edit Part Modal]
  ├── (valid submit) → [Modal closes, table updates]
  ├── (missing required fields) → [field-level errors inside modal]
  ├── (duplicate part number) → [error: "A part with this number already exists"]
  └── Cancel / Escape key → [Modal closes, no change]

[Ticket Detail]
  ├── Shows: customer, vehicle, mechanic, status badge, description, notes, parts used
  ├── Status dropdown → change status → (saved) → [badge updates]
  │     └── If status set to 'completed' → [System generates Invoice] → [WhatsApp trigger]
  ├── "AI Diagnostics Assistant" card
  │     └── Click "Analyze Symptoms" → calls Gemini API → displays top causes, diagnostic checklist, and recommended parts
  │     ├── Checkbox toggles on checklist items → updates/saves status to database immediately
  │     └── Click "Add to Job" on suggested parts → opens [Log Part Used] form pre-filled, allowing mechanic manual override
  ├── Notes field → save → [notes updated]
  ├── "Log Part Used" → Part select + qty input → (submit) → [parts list updates, inventory deducts]
  │     └── (insufficient stock) → [inline error: "Only [n] units available"]
  ├── "View/Create Invoice" button (if not generated yet) → [Generate Invoice dialog] → [Invoice Detail]
  └── Back → [Tickets List]

[Staff List]
  ├── Table: name, email, role, date added
  ├── "Add Mechanic" button → [Add Mechanic Modal]
  └── (no staff besides admin) → [Empty state]

[Add Mechanic Modal]
  ├── (valid submit) → [Modal closes, staff table updates]
  ├── (duplicate email) → [error: "An account with this email already exists"]
  └── Cancel → [Modal closes]

[Any Screen] → Logout → [Login Screen]
```

---

## Mechanic Flow

```
[Login Screen]
  → (valid mechanic credentials) → [My Jobs]
  → (admin-only route attempted) → [redirect to My Jobs]

[My Jobs]
  ├── Cards: only tickets assigned to this mechanic
  ├── Each card shows: vehicle reg, make/model, status badge, description snippet
  ├── Click card → [Ticket Detail — Mechanic View]
  └── (no jobs assigned) → [Empty state: "No jobs assigned yet"]

[Ticket Detail — Mechanic View]
  ├── Shows: vehicle info, job description, status badge, parts used
  ├── Status dropdown → Pending → In Progress → Completed (cannot set Cancelled)
  │     └── (update) → [status badge updates] → [System generates Invoice] → [WhatsApp trigger]
  ├── "AI Diagnostics Assistant" card (same as admin, can check off items and pre-fill logged parts)
  ├── "Log Part Used" → Part select + qty + submit → [parts list updates, inventory deducts]
  │     └── (insufficient stock) → [error: "Only [n] units available"]
  └── Back → [My Jobs]
```

---

## Public Customer Flow

```
[WhatsApp Notification Link]
  → [Public Invoice View] (no login required, read-only)

[Customer Landing Page]
  ├── View services list and contact info
  ├── Search active ticket status by tracking token → [Public Ticket Tracker]
  └── Click "Request Service Booking" → [Customer Booking Portal]

[Customer Booking Portal]
  ├── Fill: Name, Phone, Registration, Make, Model, Year, Symptoms Description
  ├── Symptoms Input field → triggers AI classification on keystroke pause / submit:
  │     └── AI auto-suggests category (can be manually changed) and estimates slot duration
  ├── Select Preferred Date and AI-recommended Time Slot
  ├── Submit request → [Booking Success Screen] showing tracking token
  └── [Booking Success Screen] → click track link → [Public Ticket Tracker] (in 'draft' state)

[Public Ticket Tracker]
  ├── Displays visual progress stepper: Requested (Draft) → Scheduled (Pending) → Under Repair (In Progress) → Ready (Completed)
  ├── Displays vehicle details, technician checklist items, and logged parts used
  └── If status is Completed → displays final Invoice breakdown & banking details (EFT)
```

---

## Screen Inventory

| Screen | Route | Who Can Access |
|--------|-------|---------------|
| Login | `/login` | Public (unauthenticated) |
| Admin Dashboard | `/dashboard` | Admin only |
| Tickets List | `/tickets` | Admin only |
| Create Ticket | `/tickets/new` | Admin only |
| Ticket Detail | `/tickets/:id` | Admin + mechanic (own tickets) |
| Invoices List | `/invoices` | Admin only |
| Invoice Detail | `/invoices/:id` | Admin only |
| Public Invoice View | `/public/invoices/:token` | Public (unauthenticated) |
| Financial Reports | `/analytics` | Admin only |
| Inventory List | `/inventory` | Admin only |
| Staff List | `/staff` | Admin only |
| My Jobs | `/my-jobs` | Mechanic only |
| Customer Landing Page | `/` | Public (unauthenticated) |
| Customer Booking Portal | `/public/booking` | Public (unauthenticated) |
| Public Ticket Tracker | `/public/track/:token` | Public (unauthenticated) |

---

## Edge Cases & Error States

Every screen must handle these four states:

| State | Display |
|-------|---------|
| **Loading** | Skeleton cards or spinner — never a blank white page |
| **Error** | Error message with a "Try again" button |
| **Empty** | Illustration or icon + descriptive text + optional CTA |
| **Success** | Data populated, or toast notification on write operations |

### Specific Edge Cases

| Scenario | Expected Behaviour |
|----------|-------------------|
| User navigates directly to `/dashboard` while logged out | Redirect to `/login` |
| Mechanic navigates to `/tickets` (admin only) | Redirect to `/my-jobs` |
| Mechanic navigates to `/tickets/:id` for another mechanic's job | 403 error screen |
| Mechanic tries to set status to "Cancelled" | Dropdown option not shown |
| Log part with qty > available stock | Inline error; no inventory change |
| Network drops mid-submit | Error toast; button re-enabled; no duplicate submission |
| Admin tries to register duplicate email for new mechanic | Field-level error message |
| Auth token expires mid-session | Silent redirect to login on next API call |
| Create ticket: customer phone matches existing record | Customer fields auto-filled |
| Customer opens public invoice link with invalid token | Display "Invoice not found" empty state |
| User tries to view `/invoices` or `/analytics` while logged out | Redirect to `/login` |
| Mechanic tries to view `/analytics` | Redirect to `/my-jobs` |
