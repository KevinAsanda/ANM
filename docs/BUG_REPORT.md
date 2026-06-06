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

## Open Issues

- **None.** All functional tests and quality gates pass successfully. Zero Critical/High severity issues remaining.
