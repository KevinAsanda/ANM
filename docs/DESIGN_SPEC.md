# Design Spec — ANM Service Management System

## Design Principles

1. **Clarity over cleverness** — mechanics and the owner need to act fast, not admire design
2. **Status at a glance** — colour-coded status badges must be readable across the room
3. **Minimal learning curve** — the users have never used a web app for work before
4. **Mobile-accessible** — the owner checks the dashboard on their phone

---

## Color Tokens

Define these as CSS custom properties in `client/src/styles/tokens.css`:

```css
:root {
  /* Brand */
  --color-primary:        #1D4ED8;   /* buttons, links, focus rings */
  --color-primary-hover:  #1E40AF;   /* hover state */
  --color-primary-light:  #DBEAFE;   /* selected row highlight, subtle bg */

  /* Surfaces */
  --color-surface:        #FFFFFF;   /* cards, modals, panels */
  --color-background:     #F1F5F9;   /* page background */
  --color-border:         #E2E8F0;   /* table borders, card borders */
  --color-border-focus:   #3B82F6;   /* input focus ring */

  /* Text */
  --color-text:           #0F172A;   /* headings, body — high contrast */
  --color-text-muted:     #475569;   /* labels, hints, placeholder */
  --color-text-inverse:   #FFFFFF;   /* text on dark backgrounds */

  /* Semantic */
  --color-error:          #DC2626;   /* errors, destructive actions */
  --color-error-bg:       #FEE2E2;   /* error alert backgrounds */
  --color-success:        #16A34A;   /* success states */
  --color-success-bg:     #DCFCE7;
  --color-warning:        #D97706;   /* warnings, low stock */
  --color-warning-bg:     #FEF3C7;

  /* Status badges (ticket statuses) */
  --status-pending-bg:    #FEF3C7;
  --status-pending-text:  #92400E;
  --status-inprogress-bg: #DBEAFE;
  --status-inprogress-text: #1E40AF;
  --status-completed-bg:  #DCFCE7;
  --status-completed-text: #14532D;
  --status-cancelled-bg:  #F1F5F9;
  --status-cancelled-text: #475569;
}
```

---

## Typography

Use `Inter` (import from Google Fonts) with system fallback:

```css
font-family: 'Inter', system-ui, -apple-system, sans-serif;
```

| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `text-3xl` / H1 | 30px | 700 | Page titles |
| `text-2xl` / H2 | 24px | 600 | Section headings |
| `text-lg` / H3 | 18px | 600 | Card headings, modal titles |
| `text-base` / Body | 16px | 400 | Body copy, form labels |
| `text-sm` / Small | 14px | 400 | Helper text, table cells |
| `text-xs` / Label | 12px | 500 | Uppercase badge labels, metadata |

Line height: `1.6` for body text.

---

## Spacing Scale

Use Tailwind's default spacing scale only — no arbitrary values:

`4px (1) · 8px (2) · 12px (3) · 16px (4) · 24px (6) · 32px (8) · 48px (12) · 64px (16)`

---

## Layout

- **Page max-width:** `1280px`, centred with `mx-auto`
- **Content padding:** `px-4` mobile, `px-8` desktop
- **Sidebar width:** 240px (desktop only — collapses to top navbar on mobile)
- **Card padding:** `p-6`
- **Form field gap:** `gap-4` between fields

---

## Breakpoints

| Name | Width | Behaviour |
|------|-------|-----------|
| Mobile | 375px | Single-column; sidebar hidden; tables scroll horizontally |
| Tablet | 768px | Sidebar shows; 2-column grids |
| Desktop | 1280px | Full layout; 3-4 column grids |

---

## Screen Specifications

### Login Screen

```
Layout: Centred card (max-w: 400px) on --color-background
  [Logo / "ANM Workshop" heading]
  [Email input]
  [Password input]
  [Login button — full width, primary]
  [Error message area — shows inline above button on failure]

States:
  Default    → form blank, button enabled
  Loading    → button disabled, shows spinner + "Logging in..."
  Error      → error message shown in red above button, fields re-enabled
  Success    → redirect (no visible state)
```

### Admin Dashboard

```
Layout: Sidebar (left, 240px) + main content area

Sidebar:
  [ANM Logo]
  Nav links: Dashboard | Tickets | Inventory | Staff
  [User avatar + name at bottom]
  [Logout button]

Main content:
  [Page title: "Dashboard"]
  [Stats row — 4 StatsCards: Active Jobs | Completed Today | Mechanics | Low Stock Items]
  [Two-column on desktop, stacked on mobile:]
    Left column: "Recent Tickets" — last 5 with status badges → click to detail
    Right column: "Low Stock Alerts" — parts below reorder level with amber badge

States:
  Loading  → skeleton cards for stats + recent tickets
  Error    → error message with retry
  Empty    → no jobs yet: show welcome message + "Create your first ticket" CTA
```

### Tickets List (Admin)

```
Layout: Full-width table with filter tabs above

[Page title: "Service Tickets"] [+ New Ticket button — top right]
[Filter tabs: All | Pending | In Progress | Completed | Cancelled]
[Table columns: Vehicle Reg | Customer | Assigned Mechanic | Status | Date Created | Actions]

Table row → click anywhere → navigate to Ticket Detail
Actions column → "View" link

States:
  Loading   → skeleton table rows (5 rows)
  Empty     → "No tickets yet" + "Create your first ticket" button
  Filtered empty → "No [Status] tickets"
  Error     → error banner + retry
```

### Create Ticket

```
Layout: Single-column form, max-w: 640px, centred

[Page title: "New Service Ticket"] [← Back to Tickets]

Section: "Customer"
  [Full Name* input]
  [Phone Number* input — check existing on blur, auto-fill if found]

Section: "Vehicle"
  [Registration Number* input]
  [Make* input] [Model* input] (side-by-side on desktop)
  [Year input]

Section: "Job Details"
  [Description* textarea]
  [Assign Mechanic* select dropdown — lists all mechanic accounts]

[Create Ticket button — primary, full width]

States:
  Each field: default / focused / error (red border + error message below)
  Button: default / loading (spinner) / disabled during submission
```

### Ticket Detail

```
Layout: Two-column on desktop (detail left, actions right)

Left column:
  [Back link]
  [Status badge — large]
  [Section: Customer & Vehicle — name, phone, reg, make, model, year]
  [Section: Job Description]
  [Section: Notes — editable textarea + Save button]
  [Section: Parts Used — table: part name | qty | cost | logged by]
  [Log Part form: Part select + qty + "Log Part" button]

Right column (on desktop) / below on mobile:
  [Section: Job Status — status dropdown + Update button]
  [Section: Assigned Mechanic — name]
  [Section: Dates — created at, last updated]

Mechanic view (same page, reduced):
  → No customer contact details visible
  → No notes edit
  → Status dropdown limited to: Pending → In Progress → Completed
  → Log Part form visible
```

### Inventory List

```
Layout: Full-width table

[Page title: "Inventory"] [+ Add Part button]
[Table: Part Name | Part Number | Qty in Stock | Reorder Level | Unit Cost | Status | Actions]
[Status column: shows "Low Stock" amber badge if qty ≤ reorder_level]
[Actions: Edit icon → Edit Part Modal]

States:
  Loading  → skeleton
  Empty    → "No parts in inventory yet" + "Add your first part" button
  Error    → error + retry
```

### Add / Edit Part Modal

```
[Modal title: "Add Part" / "Edit Part"]
[Part Name* input]
[Part Number input (optional)]
[Qty in Stock* number input (min: 0)]
[Reorder Level* number input (min: 1) — default: 5]
[Unit Cost (ZAR) number input]
[Cancel button (ghost)] [Save button (primary)]

States:
  Field error → red border + message
  Duplicate part number → error above save button
  Saving → button spinner
```

### Staff List

```
Layout: Full-width table

[Page title: "Staff"] [+ Add Mechanic button]
[Table: Name | Email | Role | Date Added]
[Role column: "Admin" (blue badge) / "Mechanic" (grey badge)]
```

### My Jobs (Mechanic)

```
Layout: Card grid — 1 column mobile, 2 columns desktop

[Page title: "My Jobs"] [Mechanic name + logout]
[Cards showing assigned tickets:]
  [Status badge (top-right of card)]
  [Vehicle Reg — large]
  [Make & Model]
  [Description snippet — 2 lines max]
  [Created date]
  [Click card → Ticket Detail]

States:
  Loading  → skeleton cards
  Empty    → "No jobs assigned to you yet"
  Error    → error + retry
```

### Financial Reports & Analytics

```
Layout: Sidebar (left, 240px) + main content area

Main content:
  [Page title: "Financial Reports"]
  [Date Range Selector: 30 Days | 90 Days | Year to Date (tabs)]
  
  [KPI Grid - 4 Cards:]
    Gross Revenue | Labor Fees | Parts Billed | VAT Collected
  
  [Two-column Grid on Desktop, Stacked on Mobile:]
    Left column: "Monthly Earnings Trend" — SVG bar chart showing monthly billing splits
    Right column: "Revenue Split" — SVG Donut chart showing Labor vs Parts proportion
    
  [Full-width Table:]
    "Technician Performance" — rankings of mechanics by completed tickets, labor generated, and parts logged.

States:
  Loading → Shimmer KPI cards, skeleton charts (SVG placeholders), skeleton table rows
  Empty   → "No financial data available" (e.g. no paid invoices in date range)
  Error   → Error banner with retry option
```

---

## Interactive Element States

### Buttons

| State | Style |
|-------|-------|
| Default | `--color-primary` background, white text |
| Hover | `--color-primary-hover` background |
| Focus | 2px offset ring in `--color-border-focus` |
| Loading | Spinner replaces text; cursor: not-allowed |
| Disabled | 50% opacity; cursor: not-allowed |
| Danger | `--color-error` background |

### Inputs

| State | Style |
|-------|-------|
| Default | `--color-border` border (1px) |
| Focus | `--color-border-focus` border + box-shadow ring |
| Error | `--color-error` border + error message below (12px) |
| Disabled | Background `--color-background`, cursor: not-allowed |

### Form submit flow

1. User clicks submit
2. Button shows spinner; disabled; no re-submission possible
3a. Success → navigate or show success toast; re-enable
3b. Error → error message appears; button re-enabled

---

## Accessibility Requirements

- All `<img>` have `alt` text
- All inputs have associated `<label>` elements (never `placeholder` as label)
- All buttons have descriptive text (not just icons without `aria-label`)
- Modals trap focus; close on `Escape`; return focus to trigger on close
- Focus styles never removed — replace with visible custom style instead
- Colour contrast: minimum 4.5:1 for all text
- Tap targets: minimum `44×44px` on all interactive elements
- Error messages linked to inputs via `aria-describedby`
- Status badges use text, not colour alone

---

## Design Decisions (Why)

**Card layout over table for Mechanic view (My Jobs):**
The owner mentioned mechanics will use this on phones. Cards are easier to scan
and tap on small screens than dense table rows.

**Sidebar on desktop, top nav on mobile:**
The number of top-level sections (5) fits a sidebar on desktop. On mobile,
a hamburger or bottom nav tabs work better. Sidebar collapses entirely.

**Status colour logic:**
Amber = needs attention (pending). Blue = in motion (in progress). Green = done.
Grey = cancelled (neutral, not alarming). This matches mental models users already
have from traffic lights and status indicators.

**Auto-fill customer on phone match:**
ANM re-services the same customers repeatedly. Auto-filling avoids duplicate records
and speeds up ticket creation — a key pain point identified in the Phase 1 audit.
