# Component Checklist — ANM Service Management System

All components marked: `[NEW]` = build from scratch

We are not using a pre-built component library for the UI primitives (to demonstrate
frontend skills in the portfolio). Tailwind CSS is available for all components.

---

## UI Primitives — `client/src/components/ui/`

These are the building blocks. Make at least **Button**, **Input**, and **Modal**
genuinely excellent — well-typed props, ARIA attributes, all states covered.

| Component | Status | Notes |
|-----------|--------|-------|
| `Button.tsx` | `[NEW]` | Variants: `primary`, `secondary`, `danger`, `ghost`. Size: `sm`, `md`, `lg`. Supports `loading` prop (spinner), `disabled`, `type`. Fully typed props. |
| `Input.tsx` | `[NEW]` | Accepts `label`, `error`, `helperText`, `required`. Always renders `<label>`. Links error via `aria-describedby`. |
| `Textarea.tsx` | `[NEW]` | Same pattern as Input. `rows` prop. |
| `Select.tsx` | `[NEW]` | Accepts `label`, `options: {value, label}[]`, `error`. Keyboard navigable. |
| `Badge.tsx` | `[NEW]` | Variants: `pending`, `in_progress`, `completed`, `cancelled`, `low_stock`, `admin`, `mechanic`. Uses status colour tokens. |
| `Card.tsx` | `[NEW]` | Surface card with consistent padding and border radius. Optional `onClick` for clickable cards. |
| `Modal.tsx` | `[NEW]` | Focus trapping. Closes on `Escape`. Returns focus to trigger on close. Backdrop click closes. `title` prop. |
| `Table.tsx` | `[NEW]` | Accepts `columns` and `data` props. Handles empty state inline. Horizontal scroll on mobile. |
| `Spinner.tsx` | `[NEW]` | Small, medium, large variants. Used inside Button and as page loader. |
| `EmptyState.tsx` | `[NEW]` | Accepts `icon`, `title`, `description`, optional `action` (CTA button props). |
| `Toast.tsx` / `useToast.tsx` | `[NEW]` | Success, error, info variants. Auto-dismiss after 4s. Stacked at bottom-right. |
| `PageHeader.tsx` | `[NEW]` | Page title (H1) + optional subtitle + optional right-side action button slot. |
| `SkeletonRow.tsx` | `[NEW]` | Animated shimmer placeholder for table rows and cards while loading. |
| `ConfirmDialog.tsx` | `[NEW]` | Modal variant for destructive confirmation. Accepts `message`, `onConfirm`, `onCancel`. |

---

## Layout Components — `client/src/components/layout/`

| Component | Status | Notes |
|-----------|--------|-------|
| `Sidebar.tsx` | `[NEW]` | Desktop: 240px fixed left sidebar with nav links. Conditionally renders based on user role. |
| `Navbar.tsx` | `[NEW]` | Mobile/top nav. Shows user name + avatar, logout. Links collapse behind hamburger on small screens. |
| `AppShell.tsx` | `[NEW]` | Wraps Sidebar + Navbar + main content area. Used by all authenticated pages. |
| `AuthLayout.tsx` | `[NEW]` | Centred card layout for Login screen. No sidebar. |

---

## Auth Components — `client/src/components/auth/`

| Component | Status | Notes |
|-----------|--------|-------|
| `LoginForm.tsx` | `[NEW]` | Email + password, submit handler, error display. Calls `authService.login()`. |
| `ProtectedRoute.tsx` | `[NEW]` | Redirects to `/login` if no valid token. |
| `RoleRoute.tsx` | `[NEW]` | Redirects to role's home route if role doesn't match. Props: `allowedRole`. |

---

## Ticket Components — `client/src/components/tickets/`

| Component | Status | Notes |
|-----------|--------|-------|
| `TicketCard.tsx` | `[NEW]` | Mechanic view card: vehicle reg, make/model, status badge, description, date. Clickable. |
| `TicketRow.tsx` | `[NEW]` | Admin table row: customer, vehicle, mechanic, status badge, date, view link. |
| `TicketStatusBadge.tsx` | `[NEW]` | Badge variant mapped from status string. Wraps `Badge.tsx`. |
| `StatusUpdateForm.tsx` | `[NEW]` | Select dropdown + Update button. Enforces mechanic role can't select "Cancelled". |
| `CreateTicketForm.tsx` | `[NEW]` | Full new ticket form — customer fields, vehicle fields, mechanic select, description. |
| `CustomerSearchField.tsx` | `[NEW]` | Phone field that auto-fills customer name on blur if found in DB. |
| `PartsUsedList.tsx` | `[NEW]` | Table of parts logged on a ticket: name, qty, cost, logged by. |
| `LogPartForm.tsx` | `[NEW]` | Part select + qty + submit. Shows live stock remaining. Inline error on insufficient stock. |

---

## Inventory Components — `client/src/components/inventory/`

| Component | Status | Notes |
|-----------|--------|-------|
| `InventoryTable.tsx` | `[NEW]` | Table of all parts with low-stock badge logic. |
| `PartForm.tsx` | `[NEW]` | Add/Edit part form inside Modal. Part name, number, qty, reorder level, cost. |

---

## Dashboard Components — `client/src/components/dashboard/`

| Component | Status | Notes |
|-----------|--------|-------|
| `StatsCard.tsx` | `[NEW]` | Icon + label + numeric value. Props: `icon`, `label`, `value`, `variant`. |
| `StatsGrid.tsx` | `[NEW]` | 4-column responsive grid of StatsCards. |
| `RecentTicketsList.tsx` | `[NEW]` | Last 5 tickets as small cards with status badge. |
| `LowStockAlert.tsx` | `[NEW]` | List of parts below reorder level with warning badges. |

---

## Staff Components — `client/src/components/staff/`

| Component | Status | Notes |
|-----------|--------|-------|
| `StaffTable.tsx` | `[NEW]` | Table: name, email, role badge, date added. |
| `AddMechanicForm.tsx` | `[NEW]` | Name, email, temp password. Inside Modal. |

---

## Component Build Priority

Build in this order — each depends on the one before:

1. `Spinner` — needed by Button
2. `Button` — needed by everything
3. `Input`, `Select`, `Textarea` — needed by all forms
4. `Badge` — needed by TicketStatusBadge
5. `Card` — needed by TicketCard
6. `Modal` — needed by PartForm, AddMechanicForm
7. `EmptyState` — needed by all list pages
8. `Table` — needed by TicketRow, InventoryTable, StaffTable
9. `Toast` — needed by all write operations
10. `PageHeader` — needed by all page layouts
11. `SkeletonRow` — needed by loading states
12. Feature components in sprint order (Auth → Tickets → Inventory → Parts → Dashboard → Staff)
