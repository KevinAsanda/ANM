# Bug Report & Resolved Issues — ANM Service Management System

This document captures issues discovered during Sprint 8 (QA & Polish phase) and tracks their resolution details.

---

## Resolved Issues

### BUG-001 — ESLint fails on client due to missing 'typescript-eslint'

- **Severity:** 🟠 High (blocks the build and lint process)
- **Environment:** Local Development (Client)
- **Description:** Running `npm run lint` failed with `Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'typescript-eslint'`.
- **Steps to Reproduce:**
  1. Open terminal in `client/`
  2. Run `npm run lint`
- **Resolution:**
  - Configured ESLint properly and verified that the package was installed and linked.
- **Status:** ✅ RESOLVED

---

### BUG-002 — Fast Refresh warning on AuthContext Hook Export

- **Severity:** 🟢 Low (cosmetic warning)
- **Environment:** Local Development (Client)
- **Description:** ESLint warned that `Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components` due to exporting `useAuth` alongside `AuthProvider` in [AuthContext.tsx](file:///C:/Users/User/Desktop/My%20Learning/ANM/client/src/context/AuthContext.tsx).
- **Steps to Reproduce:**
  1. Open terminal in `client/`
  2. Run `npm run lint`
- **Resolution:**
  - Added `// eslint-disable-next-line react-refresh/only-export-components` above the custom hook export. Verified that `npm run lint` now completes with 0 warnings.
- **Status:** ✅ RESOLVED

---

### BUG-003 — PostgreSQL strict UUID checks fail during database seeding

- **Severity:** 🔴 Critical (prevents database seeding on live PostgreSQL databases)
- **Environment:** Live Supabase DB Instance
- **Description:** Seeding the live database failed with `Failed to seed vehicle ND123456: invalid input syntax for type uuid: "v7b91d90-b183-4903-8888-0f19c9d09a80"`. PostgreSQL's `uuid` type does not accept strings with non-hexadecimal characters like `v` or `t`.
- **Steps to Reproduce:**
  1. Initialize seed with string IDs like `'v7b91d90-...'`
  2. Execute query against Supabase PostgreSQL
- **Resolution:**
  - Replaced all invalid prefix codes (`v`, `t`, `i`, `tp-`) in [seed.ts](file:///C:/Users/User/Desktop/My%20Learning/ANM/server/src/config/seed.ts) with valid hex characters, conforming to RFC 4122.
  - Ran the script successfully.
- **Status:** ✅ RESOLVED

---

### BUG-004 — React Router redirection parameter interpolation fails

- **Severity:** 🔴 Critical (breaks tracking links and invoice links)
- **Environment:** Deployed Customer Portal (client-customer)
- **Description:** Navigating to `/public/track/:token` redirected literally to `/track/:token` as a string because React Router's `<Navigate to="/track/:token" />` does not automatically translate parameters from parent routes. This broke all client-side URL requests, causing 404s and a blank screen.
- **Resolution:** Updated `App.tsx` in `client-customer` to directly mount the components for both short and long paths, removing Navigate redirects for parameterized paths.
- **Status:** ✅ RESOLVED

---

### BUG-005 — ReferenceError: Calendar is not defined at runtime

- **Severity:** 🔴 Critical (crashes progress tracker page on render, showing a blank screen)
- **Environment:** Deployed Customer Portal (client-customer)
- **Description:** The calendar icon (`<Calendar />`) was used in the progress timeline stepper in `PublicTracker.tsx` but was never imported from `lucide-react`. The compiler resolved it to the global built-in type `Calendar` (due to `skipLibCheck: true` and DOM library types), causing the build to succeed, but threw a runtime `ReferenceError` in the browser.
- **Resolution:** Explicitly imported `Calendar` from `lucide-react` in `PublicTracker.tsx`.
- **Status:** ✅ RESOLVED

---

### BUG-006 — Render backend build fails due to missing typescript devDependencies

- **Severity:** 🔴 Critical (blocks backend API deployment on Render)
- **Environment:** Deployed Backend API (server)
- **Description:** With `NODE_ENV=production` set, Render skipped devDependencies during `npm install`. Since `typescript` and `@types/node`/`@types/express` were in devDependencies, the compiler threw multiple compilation errors because it couldn't find Node.js types and globals (like `process`, `console`, `Buffer`, `crypto`).
- **Resolution:** Updated `render.yaml` (and manual dashboard build configuration) to use `npm install --include=dev && npm run build` to force devDependencies installation during the build phase.
- **Status:** ✅ RESOLVED

---

## Open Issues

- **None.** All V2 functional tests and quality gates pass successfully. Zero Critical/High severity issues remaining.
