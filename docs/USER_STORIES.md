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

## V2 Stories (Not in MVP)

- As a customer, I want to book a consultation online so that I don't need to call
- As a mechanic, I want to scan a barcode to log a part so that data entry is faster
- As an admin, I want to view a payroll summary based on hours worked
- As an admin, I want to see revenue vs parts cost per completed job
