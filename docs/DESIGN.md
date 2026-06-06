## Inspiration & Aesthetic Direction

The visual identity is inspired by a **refined, botanical luxury** brand identity — elegant, minimal, and trustworthy. Think high-end stationery: clean white surfaces, a rich muted teal as the dominant brand color, soft warm neutrals for contrast, and delicate botanical line-art accents. This aesthetic communicates **professionalism and calm authority** — exactly what a well-run automotive workshop should project to its customers and staff.

**Mood:** Calm. Clean. Confident. Upscale but approachable.
**NOT:** Dark hacker dashboards, neon, gradients, or generic bootstrap blue.

---

## Color Palette

```css
:root {
  /* Primary Brand */
  --color-teal: #4a8c80; /* Main brand color — headers, nav, buttons, accents */
  --color-teal-dark: #2e6b60; /* Hover states, active elements */
  --color-teal-light: #d0e8e4; /* Tinted backgrounds, table headers, badges */

  /* Neutrals */
  --color-cream: #f5f0eb; /* Page background — warm off-white, never pure white */
  --color-warm-white: #fdfaf7; /* Card / panel surfaces */
  --color-sand: #e8ddd2; /* Borders, dividers, input outlines */
  --color-stone: #8c7b6e; /* Secondary text, placeholders, labels */

  /* Text */
  --color-ink: #1c2b2a; /* Primary text — deep dark teal-black */
  --color-ink-light: #4a5a58; /* Body text, descriptions */

  /* Semantic */
  --color-success: #5a9e75; /* Completed jobs, in-stock */
  --color-warning: #c8922a; /* Low stock, pending */
  --color-danger: #b05040; /* Overdue, errors */
  --color-info: #4a8c80; /* Same as teal — informational states */
}
```

---

## Typography

```css
/* Import in HTML <head> */
<link
  href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Jost:wght@300;400;500;600&display=swap"
  rel="stylesheet"
  > :root {
  --font-display:
    "Cormorant Garamond", Georgia, serif; /* Headings, logo, page titles */
  --font-body: "Jost", sans-serif; /* All body text, labels, buttons, data */
}
```

### Type Scale

| Role            | Font               | Size    | Weight  | Usage                                                     |
| --------------- | ------------------ | ------- | ------- | --------------------------------------------------------- |
| Page Title      | Cormorant Garamond | 2.2rem  | 500     | Dashboard headers, section names                          |
| Section Heading | Cormorant Garamond | 1.5rem  | 500     | Card titles, module labels                                |
| Subheading      | Jost               | 0.75rem | 600     | Uppercase labels, table headers (`letter-spacing: 0.1em`) |
| Body            | Jost               | 0.9rem  | 400     | Paragraphs, descriptions                                  |
| Data / Numbers  | Jost               | varies  | 300–500 | Job IDs, stock counts, prices                             |
| Button          | Jost               | 0.8rem  | 500     | All buttons (`letter-spacing: 0.05em`)                    |

> **Rule:** Section/table labels should always be `UPPERCASE` with `letter-spacing: 0.08em` in `--font-body`. This creates visual separation between headings and data.

---

## Spacing & Layout

```css
:root {
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-pill: 999px;

  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 40px;
  --space-2xl: 64px;

  --shadow-card:
    0 1px 4px rgba(28, 43, 42, 0.06), 0 4px 16px rgba(28, 43, 42, 0.04);
  --shadow-hover: 0 4px 20px rgba(74, 140, 128, 0.15);
}
```

- **Grid:** 12-column grid. Sidebar 240px fixed. Main content fluid.
- **Cards:** White (`--color-warm-white`), `--radius-lg`, `--shadow-card`. Padding `--space-lg`.
- **No harsh edges:** All containers use rounded corners. Never square cards.
- **Breathing room:** Generous padding inside cards. Never cramped data.

---

## Components

### Navigation / Sidebar

```
Background: --color-teal
Text: white (opacity 0.75 for inactive, 1.0 for active)
Active item: white background with opacity 0.15, left border 3px solid white
Logo area: --color-teal-dark, brand monogram in Cormorant Garamond
Icons: Simple line icons (Feather or Lucide), 18px, stroke 1.5
```

### Buttons

```css
/* Primary */
.btn-primary {
  background: var(--color-teal);
  color: white;
  border-radius: var(--radius-md);
  padding: 10px 20px;
  font-family: var(--font-body);
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  border: none;
  transition:
    background 0.2s,
    box-shadow 0.2s;
}
.btn-primary:hover {
  background: var(--color-teal-dark);
  box-shadow: var(--shadow-hover);
}

/* Ghost / Secondary */
.btn-ghost {
  background: transparent;
  color: var(--color-teal);
  border: 1.5px solid var(--color-teal);
  border-radius: var(--radius-md);
}
```

### Status Badges

```css
/* Pill-shaped, no harsh colors */
.badge {
  font-family: var(--font-body);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: var(--radius-pill);
}

.badge-complete {
  background: #d4ede0;
  color: #2e6b4a;
}
.badge-inprogress {
  background: var(--color-teal-light);
  color: var(--color-teal-dark);
}
.badge-pending {
  background: #f5e8cc;
  color: #7a5a1a;
}
.badge-overdue {
  background: #f0ddd9;
  color: #8a3020;
}
```

### Data Tables

```css
table {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--font-body);
}

thead th {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-stone);
  padding: 12px 16px;
  border-bottom: 1.5px solid var(--color-sand);
  text-align: left;
}

tbody tr {
  border-bottom: 1px solid var(--color-sand);
  transition: background 0.15s;
}

tbody tr:hover {
  background: var(--color-teal-light);
  opacity: 0.6;
}

tbody td {
  padding: 14px 16px;
  font-size: 0.88rem;
  color: var(--color-ink-light);
}
```

### Input Fields

```css
input,
select,
textarea {
  background: var(--color-warm-white);
  border: 1.5px solid var(--color-sand);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  font-family: var(--font-body);
  font-size: 0.88rem;
  color: var(--color-ink);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

input:focus {
  outline: none;
  border-color: var(--color-teal);
  box-shadow: 0 0 0 3px rgba(74, 140, 128, 0.12);
}

label {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-stone);
  margin-bottom: 6px;
  display: block;
}
```

### Stat Cards (Dashboard KPIs)

```
Layout: 4-column grid on desktop, 2 on tablet, 1 on mobile
Structure:
  - Small uppercase label (e.g. "JOBS TODAY")
  - Large number in Cormorant Garamond, --color-teal
  - Subtle trend indicator below
  - Left border 3px solid --color-teal on hover
```

---

## Decorative Elements

The Florence brand uses **botanical line art** — ginkgo leaf motifs. For ANM, use a **subtle mechanical/wrench motif** in the same refined line-art style.

- Sidebar logo area: circular badge with "A" monogram, thin ring border, botanical/gear detail
- Empty state illustrations: thin-stroke line art only, `--color-sand` colored
- Section dividers: single 1px line in `--color-sand`, never heavy rules
- Page backgrounds: `--color-cream`, never pure white or dark

---

## Page-Specific Notes

### Login Page

- Full-page split layout: left half `--color-teal` with ANM logo centered, right half `--color-cream` with login form
- Logo: Large "A" in Cormorant Garamond inside a thin circle
- Tagline: Small uppercase body font, white, below logo

### Admin Dashboard

- Top KPI row: 4 stat cards (Jobs Today, Active Repairs, Low Stock Items, Revenue This Week)
- Below: 2-column layout — Job Table (left, 60%) + Quick Inventory Panel (right, 40%)
- Header: Page title in Cormorant Garamond + date stamp right-aligned

### Mechanic Dashboard

- Simpler layout — focus on MY JOBS list
- Each job card shows: Vehicle, Customer name, Status badge, and a large "UPDATE STATUS" button
- No financial data visible (role-based)

### Inventory Page

- Table with search bar and barcode scan button prominent at top
- Low stock rows highlighted with `--color-warning` left border
- "Reorder" button visible only for low-stock items

---

## Do Not Do

- ❌ No purple, blue, or dark-mode gradients
- ❌ No Inter, Roboto, or Arial fonts
- ❌ No full-black (#000000) backgrounds or text
- ❌ No Bootstrap default components
- ❌ No icon-heavy cluttered sidebars
- ❌ No colored backgrounds on every card — keep cards white/warm-white
- ❌ No harsh drop shadows — keep shadows subtle and warm
- ❌ No ALL-CAPS page titles — only labels and subheadings use uppercase

---

## Example Prompt Templates for Gemini CLI

Copy these exactly when building each page:

```
@DESIGN.md Build the Admin Dashboard page using only the colors, fonts, spacing, and component styles defined in this design guide. Use HTML, CSS, and vanilla JS. The page should include: a sidebar nav with ANM logo, 4 KPI stat cards, a service ticket table with status badges, and an inventory alert panel.
```

```
@DESIGN.md Build the Login page split-layout as described in the Page-Specific Notes section. Left: teal panel with logo. Right: login form with email and password fields, a primary button, and role selector dropdown.
```

```
@DESIGN.md Build the Mechanic Job Dashboard. Show only jobs assigned to the logged-in mechanic. Each job is a card showing vehicle info, customer name, status badge, and an update-status button. Use the card styles and badge colors from this guide. Fetch from /api/tickets?mechanic_id=:id
```
