# ANM Automotive Service Management System
> Gemini CLI — Project Instructions

## What This Project Is

A web-based **Automotive Service Management System** for **ANM**, a real small car
repair workshop in Marianheights, Pinetown, South Africa. ANM currently runs
entirely on paper — this system digitises their core operations.

This is both a **university project** (IS3 / ISYS300 — Diploma in IT, Mangosuthu
University of Technology) and a **portfolio project**. Every file in this repo
will be read by lecturers and hiring engineers. Build accordingly.

---

## Workflow — Role Files

Follow the student portfolio workflow defined in the role files at the project root.
The phases run in this order:

```
01_PRODUCT_MANAGER.md    ✅ COMPLETE — docs already written
02_UX_DESIGNER.md        ✅ COMPLETE — docs already written
03_FRONTEND_DEVELOPER.md ← Active: build the React UI
04_BACKEND_DEVELOPER.md  ← Active (parallel): build the API
05_QA_ENGINEER.md        — After dev complete
06_TECHNICAL_WRITER.md   — After QA sign-off
07_PORTFOLIO_REVIEWER.md — Final before submission
```

**PM and UX phases are pre-completed.** All planning documents exist in `docs/`.
Read `docs/TASKS.md` and start development immediately.

---

## Tech Stack (Locked)

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React 18 + TypeScript + Vite | Industry standard, portfolio-friendly |
| Styling | Tailwind CSS | Rapid, consistent, no custom CSS debt |
| Backend | Node.js 18 + Express + TypeScript | Matches Phase 2 academic spec |
| Database | Supabase (PostgreSQL) | Free tier, built-in auth, RLS, realtime |
| Auth | Supabase Auth + JWT | Phase 2 security architecture requirement |
| Deployment | Vercel (FE) + Render (BE) + Supabase (DB) | All free tier, easy CI/CD |

---

## Project Structure

```
anm-system/
├── client/              ← React 18 + TS + Tailwind (Vite)
│   └── src/
│       ├── components/  ← ui/ primitives + feature components
│       ├── pages/       ← one file per screen/route
│       ├── hooks/       ← custom React hooks
│       ├── services/    ← API call functions (never fetch inline)
│       ├── context/     ← AuthContext, global state
│       ├── utils/       ← pure helpers
│       └── types/       ← shared TypeScript interfaces
├── server/              ← Node.js + Express + TS
│   └── src/
│       ├── routes/
│       ├── controllers/
│       ├── services/
│       ├── middleware/
│       ├── models/
│       └── config/
├── docs/                ← all planning artifacts (read before coding)
├── GEMINI.md            ← this file
├── README.md            ← Technical Writer writes this LAST
└── SETUP.md             ← Technical Writer writes this LAST
```

---

## Critical Business Rules

1. **Two roles only:** `admin` and `mechanic`
2. **Admins** — full access: create tickets, manage staff, manage inventory, view dashboard
3. **Mechanics** — limited: see only their assigned tickets, update status, log parts used
4. **Inventory auto-decrements** when a mechanic logs a part against a ticket
5. **Low stock alert** fires when `qty_in_stock <= reorder_level` (default: 5 units)
6. **Supabase Row-Level Security (RLS)** enforces access at database level — not just frontend
7. **Supabase API keys** live in `.env` only — never exposed to the frontend

---

## Git Conventions

Use conventional commits throughout — every commit:

```
feat(auth): add login form with email + password
feat(tickets): implement status update PATCH endpoint
fix(inventory): correct stock deduction logic on part log
test(auth): add unit tests for JWT verification middleware
docs(readme): add architecture overview
```

Types: `feat`, `fix`, `docs`, `test`, `refactor`, `style`, `chore`

---

## Environment Variables

**Server `.env`:**
```
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret
NODE_ENV=development
```

**Client `.env`:**
```
VITE_API_BASE_URL=http://localhost:3001/api/v1
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Both `.env` files go in `.gitignore`. Commit `.env.example` with placeholder values.

---

## API Base URL

All endpoints: `/api/v1/...`

---

## Current Task

> Read `docs/TASKS.md` → pick up your role's tasks → build.
> Read `docs/DB_SCHEMA.md` before touching Supabase.
> Read `docs/DESIGN_SPEC.md` before writing a single component.
