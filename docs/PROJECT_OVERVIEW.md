# ANM Automotive Service Management System

## What It Is

A web-based management system built for **ANM**, a small car repair workshop
in Marianheights, Pinetown, South Africa. The system replaces the workshop's
entirely paper-based operations with a centralised digital platform. It handles
live service ticket tracking (digital job cards), real-time inventory management
with barcode integration, role-based staff access, and a management dashboard
for oversight and reporting.

## Why I Built It

ANM currently records every customer visit on handwritten job cards, tracks car
parts in physical logbooks, and communicates job progress verbally between
mechanics and management. This causes lost records, inventory stockouts, double
bookings, and prevents the owner from seeing the business's performance in
real time.

This system solves those problems by digitising the core workflow — from the
moment a customer's car arrives to the moment it leaves — giving mechanics a
clear digital task list and giving management accurate, live data to make
decisions from.

## Tech Stack

| Layer | Technology | Why I Chose It |
|-------|-----------|----------------|
| Frontend | React 18 + TypeScript | Industry standard; typed components are cleaner portfolio code |
| Styling | Tailwind CSS | Design tokens map directly to the spec; fast iteration |
| Backend | Node.js 18 + Express + TypeScript | Matches academic Phase 2 specification |
| Database | Supabase (PostgreSQL) | Free tier; built-in Auth + RLS enforces role-based security |
| Auth | Supabase Auth (JWT) | JWT + Row-Level Security = proper security architecture |
| Deployment | Vercel (FE) + Render (BE) + Supabase | All free tier; deployable without a credit card |

## Core MVP Features

1. **Authentication** — Secure login with role enforcement (admin vs mechanic)
2. **Digital Job Cards** — Create, assign, and track service tickets through status stages
3. **Inventory Management** — Live stock levels; auto-deducted when parts are logged on a job
4. **Parts Logging** — Mechanics log parts used; inventory updates instantly
5. **Management Dashboard** — Live stats: active jobs, completed jobs, mechanic workload, low stock alerts
6. **Staff Management** — Owner creates and manages mechanic accounts

## V2 Features (Sprint 13 Completed)

- [✅] Invoicing System — generate final billing details (labor, parts, VAT)
- [✅] Automated WhatsApp notifications to customers and admin on job completion (mocked via Twilio service)
- [✅] Financial Reporting & Dashboard — visualize monthly revenues, parts margins, and technician performance
- [✅] Customer-facing online booking portal & tracking wizard (V2 Split Frontend)
- [✅] Payroll calculation & shift time tracking from clock-in/out logs (Sprint 12)
- [✅] Remote phone-to-system barcode scanner IoT integration (Sprint 13)
- [ ] SMS reminders for vehicle service due dates

## What I Learned

*(Update this section as the project progresses)*

1. How to implement JWT authentication with Supabase and enforce role-based access at the database level using Row-Level Security policies
2. How to design a normalised relational schema using a bridge table (ticket_parts) to resolve a many-to-many relationship
3. How to structure a Node.js + Express API with service-layer separation so business logic is testable independent of HTTP
4. How to use React context and protected routes to manage authentication state across a multi-role application
5. How to connect real-world business pain points to specific technical solutions at a system design level
6. How to physically split a single React application into two optimized web projects (Customer and Staff) to reduce bundle sizes (down to ~230-280 kB) and isolate security contexts.
7. How to build a fully automated payroll time-tracking module that computes hours worked and shifts payouts while securing access limits via RBAC and RLS.
8. How to implement a remote IoT barcode scanning system linking a mobile browser (camera-scanner) to active desktop sessions in real-time.

## What I Would Do Differently

If I were to rebuild this project, I would implement a full end-to-end integration test suite using Cypress or Playwright to automate frontend testing. I would also introduce an ORM like Prisma or Kysely for typing backend database queries instead of raw Supabase requests, which would provide compile-time verification for schemas. Finally, I would design the service tickets status updates to push updates via Supabase Realtime so that admins immediately see state changes made by mechanics without manual refreshes.

## Live Demo

- **Customer Booking & Tracking Portal**: [https://anm-customer-portal.onrender.com](https://anm-customer-portal.onrender.com)
- **Internal Staff & Admin Portal**: [https://anm-staff-portal.onrender.com](https://anm-staff-portal.onrender.com)
- **Backend REST API**: [https://anm-backend-api.onrender.com](https://anm-backend-api.onrender.com)
- **Database (Supabase)**: Live instance configured, migrated, and seeded

## Repository

- **GitHub Repository**: [KevinAsanda/ANM](https://github.com/KevinAsanda/ANM)

## Status

✅ Sprint 13 (Remote Phone-to-System Barcode Scanner Integration) completed

