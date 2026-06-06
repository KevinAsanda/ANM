# Frontend Implementation Notes

This document captures key technical decisions, architectural patterns, and design spec mappings implemented during the ANM Service Management System frontend redesign.

---

## 1. Design System & Theme Integration

- **CSS Variables for Custom Tokens**: We defined visual design tokens in [tokens.css](file:///C:/Users/User/Desktop/My%20Learning/ANM/client/src/styles/tokens.css) (such as `--color-primary` for the botanical teal, warm creams, whites, and sand borders) and integrated them directly into [tailwind.config.js](file:///C:/Users/User/Desktop/My%20Learning/ANM/client/tailwind.config.js) under theme colors and font families.
- **Tailwind Version Constraints**: When mapping variables, Tailwind CSS v3 does not support opacity modifiers on CSS-variable-based colors within `@apply` directives (e.g. `@apply border-border/80` throws errors). We resolved this by declaring hover border color transitions in vanilla CSS within [index.css](file:///C:/Users/User/Desktop/My%20Learning/ANM/client/src/index.css), keeping the code clean and compile-safe.
- **Typography Standards**:
  - `font-display` maps to `Cormorant Garamond` (display headings, page titles, and monologue logo).
  - `font-sans` maps to `Jost` (body copy, form labels, numbers, buttons, and badges).
  - Section headers, detail page labels, and badge titles are styled with Jost semibold `uppercase tracking-wider` layout to establish visual separation.

---

## 2. Page Redesigns & Layouts

- **Admin Dashboard**: Refactored the dashboard grid layout into a 2-column division (66% left for recent tickets Table, 33% right for active Low Stock Alerts). Styled KPI cards with modern left-border teal animation triggers on hover.
- **Service Tickets & My Jobs**:
  - Refactored assigned mechanic job card views to display customer information (previously missing) and added a direct visual CTA button ("View & Update Status") to enhance usability for mechanics.
  - Removed all billing and financial metrics from the mechanic view, adhering strictly to role-based privileges.
- **Ticket Details**: Overhauled the page into a 2-column layout. The left column displays Customer/Vehicle specs, Work descriptions, admin diagnostic notes, and logged parts. The right column holds Status Control dropdowns and billing assignments.
- **Login Split-Screen**: Redesigned the screen to display a gorgeous botanical teal panel on the left with a thin-border circular "A" monogram logo, and a cozy warm-white login container on the right.

---

## 3. Accessibility (a11y) & Interactive Polish

- **Form Labels**: Labels inside `Input`, `Select`, and `Textarea` primitives were updated to uppercase small styling with proper unique `htmlFor` properties mapped to element IDs for keyboard screen-readers.
- **Focus Rings**: Standardized visible, outline-free rings with `ring-2 ring-primary ring-offset-2` to support keyboard navigability.
- **Micro-Animations**: Appended `animate-fade-in` and `animate-slide-in` class transitions to all page content wrappers and drawer menus to make UI state changes feel fluid and professional.
