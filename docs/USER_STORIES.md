# User Stories — ANM Service Management System

## Users

| Role | Description |
|------|-------------|
| **Admin** | The workshop owner or manager (Mpume / Musa). Full system access. |
| **Mechanic** | A workshop technician. Sees only their assigned jobs. |

---

## MVP Stories

---

### AUTH-01 — Secure Login

> As an **admin** or **mechanic**, I want to log in with my email and password
> so that only authorised staff can access the system.

**Acceptance Criteria:**
- ✅ Login screen accepts email and password
- ✅ Successful login redirects admin to the Admin Dashboard
- ✅ Successful login redirects mechanic to My Jobs
- ✅ Invalid credentials show inline error: "Invalid email or password"
- ✅ Empty email or password shows field-level validation error
- ✅ Auth token is stored; user stays logged in on page refresh
- ✅ Navigating to any protected route while logged out redirects to Login
- ✅ Navigating to an admin-only route as a mechanic redirects to My Jobs

---

### AUTH-02 — Log Out

> As any user, I want to log out so that my session is cleared and the next
> person cannot access my data.

**Acceptance Criteria:**
- ✅ Logout button is accessible from every screen via the navigation bar
- ✅ Clicking logout clears the session and redirects to the Login screen
- ✅ After logout, pressing the browser back button does not reveal protected content

---

### TICKET-01 — Create Service Ticket

> As an **admin**, I want to create a new service ticket when a customer brings
> in a vehicle, so that all job details are captured digitally from the start.

**Acceptance Criteria:**
- ✅ Admin can enter: customer name, customer phone, vehicle registration, make, model, year, and job description
- ✅ Admin can assign the ticket to a mechanic from a dropdown of active mechanics
- ✅ Submitting with any required field empty shows field-level error messages
- ✅ Valid submission creates the ticket with status "Pending" and redirects to the Ticket Detail page
- ✅ The created ticket appears in the Tickets List immediately
- ✅ If the customer already exists (matched by phone number), their record is reused — not duplicated

---

### TICKET-02 — View All Tickets

> As an **admin**, I want to see all service tickets in a list so that I have
> an overview of all active and completed jobs.

**Acceptance Criteria:**
- ✅ Tickets list shows: customer name, vehicle registration, assigned mechanic, status, and date created
- ✅ Tickets are sorted newest first by default
- ✅ Admin can filter by status: All / Pending / In Progress / Completed / Cancelled
- ✅ Empty state is shown when no tickets exist: "No service tickets yet — create your first one"
- ✅ Loading skeleton is shown while data is fetching
- ✅ Error state shown if fetch fails: "Failed to load tickets. Try again"

---

### TICKET-03 — View Ticket Detail

> As an **admin**, I want to view the full details of a service ticket so that
> I can see the job description, status history, and parts used.

**Acceptance Criteria:**
- ✅ Ticket detail shows: customer name + phone, vehicle details, assigned mechanic, status, job description, notes, and list of parts used
- ✅ Admin can update the ticket status from this screen
- ✅ Admin can add notes to the ticket
- ✅ Parts used section shows: part name, quantity, and cost

---

### TICKET-04 — Update Ticket Status (Admin)

> As an **admin**, I want to update the status of any service ticket so that
> the system reflects where each job is in the workflow.

**Acceptance Criteria:**
- ✅ Status can be changed to: Pending → In Progress → Completed → Cancelled
- ✅ Status change is saved immediately and reflected in the Tickets List
- ✅ Status badge colour updates: Pending (amber), In Progress (blue), Completed (green), Cancelled (grey)

---

### TICKET-05 — Mechanic Views Assigned Jobs

> As a **mechanic**, I want to see only the service tickets assigned to me
> so that I know exactly what I am working on today.

**Acceptance Criteria:**
- ✅ My Jobs screen shows only tickets where the logged-in mechanic is the assigned staff member
- ✅ Each card shows: vehicle registration, make/model, status, and job description snippet
- ✅ Mechanic cannot see tickets assigned to other mechanics
- ✅ Empty state shown when no jobs are assigned: "No jobs assigned to you yet"

---

### TICKET-06 — Mechanic Updates Job Status

> As a **mechanic**, I want to update the status of my assigned ticket
> so that management knows the job's progress without needing to ask me.

**Acceptance Criteria:**
- ✅ Mechanic can change status from Pending → In Progress, and from In Progress → Completed
- ✅ Mechanic cannot change status to Cancelled (admin only)
- ✅ Status update is reflected immediately in the ticket list

---

### PARTS-01 — Log Parts Used on a Job

> As a **mechanic**, I want to log which parts I used on a job so that
> inventory is automatically updated.

**Acceptance Criteria:**
- ✅ On the Ticket Detail screen, mechanic can select a part from inventory and enter the quantity used
- ✅ Submitting a part log deducts the quantity from the inventory record immediately
- ✅ If quantity requested exceeds available stock, error shown: "Insufficient stock. Only [n] units available"
- ✅ Part log appears in the "Parts Used" list on the ticket
- ✅ Admin can also log parts from the Ticket Detail screen

---

### INVENTORY-01 — View Inventory

> As an **admin**, I want to see the full list of parts in stock so that I
> know what is available and what needs to be reordered.

**Acceptance Criteria:**
- ✅ Inventory table shows: part name, part number, quantity in stock, reorder level, unit cost
- ✅ Parts at or below the reorder level are highlighted with a warning badge ("Low Stock")
- ✅ Loading and error states handled
- ✅ Empty state shown if no parts are recorded

---

### INVENTORY-02 — Add New Part to Inventory

> As an **admin**, I want to add a new spare part to the inventory system
> so that mechanics can log it against job cards.

**Acceptance Criteria:**
- ✅ Admin can enter: part name (required), part number (optional), quantity in stock (required, ≥ 0), reorder level (required, ≥ 1), unit cost (optional)
- ✅ Submitting with missing required fields shows field-level validation errors
- ✅ Successful submission adds the part to the inventory list
- ✅ Duplicate part numbers are rejected with: "A part with this number already exists"

---

### INVENTORY-03 — Update Stock Level

> As an **admin**, I want to update the stock quantity of a part when new
> stock arrives so that the inventory reflects accurate numbers.

**Acceptance Criteria:**
- ✅ Admin can edit the quantity of any part in the inventory
- ✅ Change is saved immediately and reflected in the table
- ✅ Quantity cannot be set below 0 (validation error shown)

---

### DASHBOARD-01 — Admin Overview Dashboard

> As an **admin**, I want to see a summary dashboard when I log in so that
> I can quickly understand the state of the workshop.

**Acceptance Criteria:**
- ✅ Dashboard shows: total active jobs, jobs completed today, total mechanics on staff, count of low-stock parts
- ✅ Recent tickets list (last 5) with status badges
- ✅ Low-stock alerts section listing parts below reorder level
- ✅ All figures are accurate and pull from live data

---

### STAFF-01 — View Staff List

> As an **admin**, I want to see all staff accounts so that I know who is
> registered in the system and their roles.

**Acceptance Criteria:**
- ✅ Staff list shows: name, email, role, and date added
- ✅ Admin and mechanic roles are visually differentiated

---

### STAFF-02 — Add New Mechanic Account

> As an **admin**, I want to create a login account for a new mechanic
> so that they can access the system with their own credentials.

**Acceptance Criteria:**
- ✅ Admin provides: full name, email address, temporary password
- ✅ Account is created with role: "mechanic"
- ✅ New mechanic appears in the staff list and in the ticket-assignment dropdown
- ✅ Duplicate email addresses are rejected: "An account with this email already exists"

---

## Sprint 9 — Invoicing & WhatsApp (V2)

### INV-01 — Create & View Invoices (Admin)
> As an **admin**, I want to generate an invoice for a service ticket so that I can capture the final billing details (labor, parts, and VAT) and track payment status.

**Acceptance Criteria:**
- [✅] Admin can generate an invoice for any service ticket.
- [✅] System automatically calculates:
  - `parts_cost` by summing all `qty_used * unit_cost_at_time` from `ticket_parts`.
  - `tax_amount` as 15% VAT of the subtotal (labor + parts).
  - `total_amount` as the sum of labor, parts, and VAT.
- [✅] Invoice numbers are sequential and formatted as `INV-YYYYMM-XXXX`.
- [✅] Admin can view a list of all invoices with status filters (`unpaid`, `paid`, `void`).
- [✅] Admin can manually toggle invoice status to `paid` and record the payment method (`cash`, `card`, `eft`).

---

### INV-02 — Automated WhatsApp Notifications
> As the **workshop system**, I want to automatically send a WhatsApp message to the customer and the admin when a job is marked completed, including invoice totals and a link to view details.

**Acceptance Criteria:**
- [✅] Marking a ticket status as `completed` automatically generates an `invoice` record if one does not exist.
- [✅] System triggers WhatsApp notifications to:
  - **Customer**: "Hi [Name], your vehicle [Make Model] is ready for collection! Total Invoice: R[Total]. View details here: [Public Link]"
  - **Admin**: "Admin alert: Job [Registration] completed. Invoice [No] generated. Total: R[Total]. Link: [Public Link]"
- [✅] If Twilio credentials are not configured in `.env`, the system prints the WhatsApp payload to the server logs and registers a mock notification event (graceful fallback).

---

### INV-03 — Public Customer Invoice Page
> As a **customer**, I want to view my invoice details via the link sent to my phone without needing to log in, so that I can see parts, labor, and banking details for payment.

**Acceptance Criteria:**
- [✅] Clicking the public link redirects the customer to a styled, unauthenticated page `/public/invoices/:secure_token`.
- [✅] Displays ANM branding, invoice number, status, customer/vehicle metadata, detailed parts list, labor cost, VAT, total, and ANM's EFT banking details.
- [✅] The page is fully responsive for easy reading on smartphones.
- [✅] Accessing this route with an invalid or non-existent token displays a clean "Invoice not found" empty state.

---

## Sprint 10 — Financial Reports & Analytics (V2)

### ANA-01 — Financial KPI Dashboard
> As an **admin**, I want to see a summary of the workshop's financial earnings so that I can monitor monthly revenues, labor fees, and tax liabilities.

**Acceptance Criteria:**
- [✅] Admin can view gross revenue, labor split, parts sales split, and VAT collected on a dedicated analytics page.
- [✅] Earnings can be filtered by date range (30 days, 90 days, Year to Date).
- [✅] Visual charts display the monthly growth trend clearly.
- [✅] Values are calculated dynamically from settled (`paid`) invoices.

---

### ANA-02 — Technician Productivity Tracking
> As an **admin**, I want to see a breakdown of completed jobs and revenue generated by each mechanic so that I can reward high performance and manage workloads.

**Acceptance Criteria:**
- [✅] Dashboard displays a rankings list of mechanics.
- [✅] Metrics include: Tickets Completed, Labor Value Generated, and Parts logged.
- [✅] Clicking a mechanic row redirects the admin to the Staff Directory profile.

---

## Sprint 11 — Customer Booking & Tracking Portal (V2)

### PORTAL-01 — Check Availability & Request Booking
> As a **customer**, I want to visit a public booking request page, input my vehicle details, pick a preferred date/time slot, and submit my request so that the workshop can schedule my vehicle.

**Acceptance Criteria:**
- [ ] Customer can access a public booking page `/public/booking` (unauthenticated).
- [ ] Fields required: Customer Name, Customer Phone, Vehicle Registration, Make, Model, Job Description, Preferred Date, and Preferred Time Slot (Morning / Afternoon).
- [ ] Date picker restricts selection to today or future dates.
- [ ] Successful submission creates a ticket in the database with status `draft`.
- [ ] After submission, displays a success confirmation showing their tracking link: `/public/track/:secure_token`.

---

### PORTAL-02 — Manage Booking Requests (Admin)
> As an **admin**, I want to review booking requests (`draft` tickets), update/assign them, and accept them, so that I can schedule workshop capacity.

**Acceptance Criteria:**
- [ ] Admin dashboard or tickets list displays a separate count and section for "Booking Requests".
- [ ] Admin can open a `draft` ticket, verify customer info, edit details, assign a mechanic, set labor cost, and click "Accept" to transition it to `pending`.
- [ ] Admin can decline a request, marking it `cancelled`.

---

### PORTAL-03 — Public Ticket Progress Tracking
> As a **customer**, I want to track my vehicle's repair progress and parts used online using my secure token link, so that I don't have to call for updates.

**Acceptance Criteria:**
- [ ] Customer can access `/public/track/:secure_token` without authentication.
- [ ] Displays a visual vertical or horizontal progress stepper: Draft (Requested) → Pending (Scheduled) → In Progress (Under Repair) → Completed (Ready).
- [ ] Shows vehicle specs, current technician notes, and a list of parts logged on the ticket.
- [ ] Invalid or non-existent tokens show a clean "Tracking information not found" message.

---

### PORTAL-04 — Public Invoice View & Payment
> As a **customer**, I want to view my detailed invoice summary and banking details directly on my tracking page once my job is completed, so that I can pay and fetch my vehicle.

**Acceptance Criteria:**
- [ ] Once the ticket changes to `completed`, the `/public/track/:secure_token` page dynamically displays a full invoice breakdown (labor, parts, VAT, total) and ANM's EFT banking details.
- [ ] Reflects the live payment status (`unpaid` vs `paid`).
- [ ] Displays a print-friendly button for downloading the invoice PDF.

---

## V2 Stories (Future)

- As a mechanic, I want to scan a barcode to log a part so that data entry is faster
- As an admin, I want to view a payroll summary based on hours worked

