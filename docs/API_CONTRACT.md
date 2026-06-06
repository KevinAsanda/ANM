# API Contract — ANM Service Management System

All endpoints are prefixed with `/api/v1`.

---

## Authentication Endpoints

### POST /api/v1/auth/login
* **Auth:** None
* **Description:** Authenticate user credentials and return a session token + user profile.
* **Request Body:**
```json
{
  "email": "user@example.com", // required, valid email string
  "password": "password123"    // required, min 6 characters
}
```
* **Response 200 (Success):**
```json
{
  "token": "eyJhbGciOi...",
  "user": {
    "id": "d3b07384-d113-49c3-a558-8b9a103c801e",
    "name": "Mpume Zulu",
    "email": "mpume@anm.co.za",
    "role": "admin",
    "created_at": "2026-06-06T15:00:00Z"
  }
}
```
* **Response 400 (Bad Request):**
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Email and password are required."
}
```
* **Response 401 (Unauthorized):**
```json
{
  "error": "INVALID_CREDENTIALS",
  "message": "Invalid email or password."
}
```

### GET /api/v1/auth/me
* **Auth:** Required (Bearer Token)
* **Description:** Retrieve the logged-in user's profile information.
* **Request Headers:**
  * `Authorization: Bearer <JWT>`
* **Response 200 (Success):**
```json
{
  "user": {
    "id": "d3b07384-d113-49c3-a558-8b9a103c801e",
    "name": "Mpume Zulu",
    "email": "mpume@anm.co.za",
    "role": "admin",
    "created_at": "2026-06-06T15:00:00Z"
  }
}
```
* **Response 401 (Unauthorized):**
```json
{
  "error": "UNAUTHORIZED",
  "message": "Token missing or invalid."
}
```

---

## Customer & Vehicle Endpoints

### GET /api/v1/customers
* **Auth:** Required (Admin only)
* **Description:** Fetch list of all customers.
* **Response 200 (Success):**
```json
[
  {
    "id": "c1f7b03b-1798-444a-a435-08103cd585e5",
    "name": "Sipho Khumalo",
    "phone": "0821234567",
    "email": "sipho@gmail.com",
    "created_at": "2026-06-06T15:10:00Z"
  }
]
```

### POST /api/v1/customers
* **Auth:** Required (Admin only)
* **Description:** Create a new customer. Automatically deduplicates using the phone number (returns existing customer if phone number exists).
* **Request Body:**
```json
{
  "name": "Sipho Khumalo",     // required, 2-100 characters
  "phone": "0821234567",       // required, 10-20 characters
  "email": "sipho@gmail.com"   // optional, valid email format or empty string
}
```
* **Response 201 (Created) or 200 (OK on Duplicate):**
```json
{
  "customer": {
    "id": "c1f7b03b-1798-444a-a435-08103cd585e5",
    "name": "Sipho Khumalo",
    "phone": "0821234567",
    "email": "sipho@gmail.com",
    "created_at": "2026-06-06T15:10:00Z"
  },
  "deduplicated": true // true if existing customer was returned
}
```

### GET /api/v1/customers/:id/vehicles
* **Auth:** Required (Admin only)
* **Description:** Retrieve all vehicles associated with a customer ID.
* **Response 200 (Success):**
```json
[
  {
    "id": "v7b91d90-b183-4903-8888-0f19c9d09a80",
    "customer_id": "c1f7b03b-1798-444a-a435-08103cd585e5",
    "registration_number": "ND123456",
    "vin": "12345678901234567",
    "make": "Toyota",
    "model": "Hilux",
    "year": 2018,
    "created_at": "2026-06-06T15:12:00Z"
  }
]
```

### POST /api/v1/vehicles
* **Auth:** Required (Admin only)
* **Description:** Add a vehicle linked to a customer.
* **Request Body:**
```json
{
  "customer_id": "c1f7b03b-1798-444a-a435-08103cd585e5", // required, valid UUID
  "registration_number": "ND123456",                      // required, unique, 2-20 characters
  "vin": "12345678901234567",                             // optional, max 17 characters
  "make": "Toyota",                                       // required, 1-50 characters
  "model": "Hilux",                                       // required, 1-50 characters
  "year": 2018                                            // optional, 1900-2100
}
```
* **Response 201 (Created):**
```json
{
  "id": "v7b91d90-b183-4903-8888-0f19c9d09a80",
  "customer_id": "c1f7b03b-1798-444a-a435-08103cd585e5",
  "registration_number": "ND123456",
  "vin": "12345678901234567",
  "make": "Toyota",
  "model": "Hilux",
  "year": 2018,
  "created_at": "2026-06-06T15:12:00Z"
}
```
* **Response 409 (Conflict):**
```json
{
  "error": "REGISTRATION_NUMBER_EXISTS",
  "message": "A vehicle with this registration number already exists."
}
```

---

## Service Ticket Endpoints

### GET /api/v1/tickets
* **Auth:** Required (Admin only)
* **Description:** Get all service tickets. Supports filtering by status.
* **Query Parameters:**
  * `status`: `pending` | `in_progress` | `completed` | `cancelled` (optional)
* **Response 200 (Success):**
```json
[
  {
    "id": "t1b07384-d113-49c3-a558-8b9a103c8099",
    "status": "pending",
    "description": "Oil change and basic maintenance check",
    "created_at": "2026-06-06T15:15:00Z",
    "updated_at": "2026-06-06T15:15:00Z",
    "vehicle": {
      "registration_number": "ND123456",
      "make": "Toyota",
      "model": "Hilux"
    },
    "customer": {
      "name": "Sipho Khumalo"
    },
    "mechanic": {
      "name": "Asanda Cele"
    }
  }
]
```

### GET /api/v1/tickets/my-jobs
* **Auth:** Required (Mechanic only)
* **Description:** Retrieve active and assigned tickets for the requesting mechanic.
* **Response 200 (Success):**
```json
[
  {
    "id": "t1b07384-d113-49c3-a558-8b9a103c8099",
    "status": "in_progress",
    "description": "Oil change and basic maintenance check",
    "created_at": "2026-06-06T15:15:00Z",
    "vehicle": {
      "registration_number": "ND123456",
      "make": "Toyota",
      "model": "Hilux"
    }
  }
]
```

### POST /api/v1/tickets
* **Auth:** Required (Admin only)
* **Description:** Create a new service ticket.
* **Request Body:**
```json
{
  "vehicle_id": "v7b91d90-b183-4903-8888-0f19c9d09a80", // required, valid UUID
  "staff_id": "f5f7b03b-1798-444a-a435-08103cd58522",   // required, mechanic staff ID
  "description": "Oil change and basic maintenance check", // required
  "labour_cost": 450.00                                  // optional, default 0.00
}
```
* **Response 201 (Created):**
```json
{
  "id": "t1b07384-d113-49c3-a558-8b9a103c8099",
  "vehicle_id": "v7b91d90-b183-4903-8888-0f19c9d09a80",
  "staff_id": "f5f7b03b-1798-444a-a435-08103cd58522",
  "created_by": "d3b07384-d113-49c3-a558-8b9a103c801e",
  "status": "pending",
  "description": "Oil change and basic maintenance check",
  "notes": null,
  "labour_cost": 450.00,
  "created_at": "2026-06-06T15:15:00Z",
  "updated_at": "2026-06-06T15:15:00Z"
}
```

### GET /api/v1/tickets/:id
* **Auth:** Required (Admin or Assigned Mechanic only)
* **Description:** Retrieve details of a specific ticket, including customer, vehicle, and parts used.
* **Response 200 (Success):**
```json
{
  "id": "t1b07384-d113-49c3-a558-8b9a103c8099",
  "status": "in_progress",
  "description": "Oil change and basic maintenance check",
  "notes": "Checked brake pads as well, they look fine.",
  "labour_cost": 450.00,
  "created_at": "2026-06-06T15:15:00Z",
  "updated_at": "2026-06-06T15:20:00Z",
  "vehicle": {
    "id": "v7b91d90-b183-4903-8888-0f19c9d09a80",
    "registration_number": "ND123456",
    "make": "Toyota",
    "model": "Hilux",
    "year": 2018
  },
  "customer": {
    "id": "c1f7b03b-1798-444a-a435-08103cd585e5",
    "name": "Sipho Khumalo",
    "phone": "0821234567",
    "email": "sipho@gmail.com"
  },
  "mechanic": {
    "id": "f5f7b03b-1798-444a-a435-08103cd58522",
    "name": "Asanda Cele",
    "email": "asanda@anm.co.za"
  },
  "parts_used": [
    {
      "id": "tp-2b07384-d113-49c3-a558-8b9a103c8055",
      "part_name": "Oil Filter",
      "qty_used": 1,
      "unit_cost_at_time": 45.00,
      "logged_by_name": "Asanda Cele",
      "created_at": "2026-06-06T15:18:00Z"
    }
  ]
}
```
* **Response 403 (Forbidden):**
```json
{
  "error": "FORBIDDEN",
  "message": "You do not have permission to view this ticket."
}
```

### PATCH /api/v1/tickets/:id/status
* **Auth:** Required (Admin or Assigned Mechanic only)
* **Description:** Update status of the service ticket. Enforces that mechanics cannot cancel tickets, and can only update their own assigned tickets.
* **Request Body:**
```json
{
  "status": "in_progress" // required, pending | in_progress | completed | cancelled (cancelled is admin-only)
}
```
* **Response 200 (Success):**
```json
{
  "id": "t1b07384-d113-49c3-a558-8b9a103c8099",
  "status": "in_progress",
  "updated_at": "2026-06-06T15:22:00Z"
}
```

### PATCH /api/v1/tickets/:id/notes
* **Auth:** Required (Admin only)
* **Description:** Admin updates/appends general notes on the ticket.
* **Request Body:**
```json
{
  "notes": "Checked brake pads as well, they look fine." // required
}
```
* **Response 200 (Success):**
```json
{
  "id": "t1b07384-d113-49c3-a558-8b9a103c8099",
  "notes": "Checked brake pads as well, they look fine.",
  "updated_at": "2026-06-06T15:22:00Z"
}
```

---

## Inventory Endpoints

### GET /api/v1/inventory
* **Auth:** Required (Admin or Mechanic)
* **Description:** Retrieve list of parts. Admin sees everything, mechanics can read parts for logging purposes.
* **Query Parameters:**
  * `low_stock`: `true` (optional, filters parts where qty_in_stock <= reorder_level)
* **Response 200 (Success):**
```json
[
  {
    "id": "i9b91d90-b183-4903-8888-0f19c9d09a11",
    "part_name": "Oil Filter",
    "part_number": "OF-001",
    "qty_in_stock": 15,
    "reorder_level": 5,
    "unit_cost": 45.00,
    "is_low_stock": false
  }
]
```

### POST /api/v1/inventory
* **Auth:** Required (Admin only)
* **Description:** Add a new spare part to inventory.
* **Request Body:**
```json
{
  "part_name": "Oil Filter", // required, 1-100 characters
  "part_number": "OF-001",   // optional, unique string
  "qty_in_stock": 15,        // required, integer >= 0
  "reorder_level": 5,        // required, integer >= 1, default 5
  "unit_cost": 45.00         // optional, number >= 0
}
```
* **Response 201 (Created):**
```json
{
  "id": "i9b91d90-b183-4903-8888-0f19c9d09a11",
  "part_name": "Oil Filter",
  "part_number": "OF-001",
  "qty_in_stock": 15,
  "reorder_level": 5,
  "unit_cost": 45.00,
  "created_at": "2026-06-06T15:00:00Z",
  "updated_at": "2026-06-06T15:00:00Z"
}
```
* **Response 409 (Conflict):**
```json
{
  "error": "PART_NUMBER_EXISTS",
  "message": "A part with this number already exists."
}
```

### PATCH /api/v1/inventory/:id
* **Auth:** Required (Admin only)
* **Description:** Update stock quantity, reorder level, or cost of a part.
* **Request Body:**
```json
{
  "part_name": "Oil Filter Updated", // optional
  "qty_in_stock": 20,                // optional, integer >= 0
  "reorder_level": 5,                // optional, integer >= 1
  "unit_cost": 50.00                 // optional, number >= 0
}
```
* **Response 200 (Success):**
```json
{
  "id": "i9b91d90-b183-4903-8888-0f19c9d09a11",
  "part_name": "Oil Filter Updated",
  "part_number": "OF-001",
  "qty_in_stock": 20,
  "reorder_level": 5,
  "unit_cost": 50.00,
  "updated_at": "2026-06-06T15:30:00Z"
}
```

---

## Parts Logging Endpoints

### POST /api/v1/tickets/:id/parts
* **Auth:** Required (Admin or Assigned Mechanic only)
* **Description:** Log a part used on a service ticket. Automatically decrements from inventory in a SQL database transaction. Returns error if stock is insufficient.
* **Request Body:**
```json
{
  "inventory_id": "i9b91d90-b183-4903-8888-0f19c9d09a11", // required, valid UUID
  "qty_used": 2                                           // required, integer >= 1
}
```
* **Response 201 (Created):**
```json
{
  "id": "tp-2b07384-d113-49c3-a558-8b9a103c8055",
  "ticket_id": "t1b07384-d113-49c3-a558-8b9a103c8099",
  "inventory_id": "i9b91d90-b183-4903-8888-0f19c9d09a11",
  "qty_used": 2,
  "unit_cost_at_time": 45.00,
  "logged_by": "f5f7b03b-1798-444a-a435-08103cd58522",
  "created_at": "2026-06-06T15:35:00Z"
}
```
* **Response 400 (Bad Request / Insufficient Stock):**
```json
{
  "error": "INSUFFICIENT_STOCK",
  "message": "Insufficient stock. Only 1 units available."
}
```

### GET /api/v1/tickets/:id/parts
* **Auth:** Required (Admin or Assigned Mechanic only)
* **Description:** Retrieve parts logged on a specific ticket.
* **Response 200 (Success):**
```json
[
  {
    "id": "tp-2b07384-d113-49c3-a558-8b9a103c8055",
    "part_name": "Oil Filter",
    "qty_used": 2,
    "unit_cost_at_time": 45.00,
    "logged_by_name": "Asanda Cele",
    "created_at": "2026-06-06T15:35:00Z"
  }
]
```

---

## Dashboard Endpoints

### GET /api/v1/dashboard/stats
* **Auth:** Required (Admin only)
* **Description:** Fetch summary statistics for the admin dashboard.
* **Response 200 (Success):**
```json
{
  "active_jobs": 8,
  "completed_today": 3,
  "total_mechanics": 2,
  "low_stock_count": 4
}
```

### GET /api/v1/dashboard/recent-tickets
* **Auth:** Required (Admin only)
* **Description:** Fetch the 5 most recently created tickets.
* **Response 200 (Success):**
```json
[
  {
    "id": "t1b07384-d113-49c3-a558-8b9a103c8099",
    "status": "pending",
    "description": "Oil change and basic maintenance check",
    "created_at": "2026-06-06T15:15:00Z",
    "vehicle": {
      "registration_number": "ND123456",
      "make": "Toyota",
      "model": "Hilux"
    },
    "customer": {
      "name": "Sipho Khumalo"
    }
  }
]
```

### GET /api/v1/dashboard/low-stock
* **Auth:** Required (Admin only)
* **Description:** Retrieve list of inventory items that are currently at or below their reorder levels.
* **Response 200 (Success):**
```json
[
  {
    "id": "i9b91d90-b183-4903-8888-0f19c9d09cb8",
    "part_name": "Brake Pads (Front)",
    "part_number": "BP-F-003",
    "qty_in_stock": 4,
    "reorder_level": 5,
    "unit_cost": 350.00
  }
]
```

---

## Staff Management Endpoints

### GET /api/v1/staff
* **Auth:** Required (Admin only)
* **Description:** Retrieve list of all staff profiles.
* **Response 200 (Success):**
```json
[
  {
    "id": "d3b07384-d113-49c3-a558-8b9a103c801e",
    "name": "Mpume Zulu",
    "email": "mpume@anm.co.za",
    "role": "admin",
    "created_at": "2026-06-06T15:00:00Z"
  },
  {
    "id": "f5f7b03b-1798-444a-a435-08103cd58522",
    "name": "Asanda Cele",
    "email": "asanda@anm.co.za",
    "role": "mechanic",
    "created_at": "2026-06-06T15:05:00Z"
  }
]
```

### POST /api/v1/staff
* **Auth:** Required (Admin only)
* **Description:** Add a new mechanic user account. Under the hood, this calls the Supabase Admin Auth API to create a credentials record and inserts a row into the local `staff` profile table.
* **Request Body:**
```json
{
  "name": "Thabo Cele",             // required, 2-100 characters
  "email": "thabo@anm.co.za",       // required, unique email
  "password": "temporaryPassword12" // required, min 8 characters
}
```
* **Response 201 (Created):**
```json
{
  "id": "8f8b8cf4-2c06-4b82-96cb-849c95d9a86a",
  "name": "Thabo Cele",
  "email": "thabo@anm.co.za",
  "role": "mechanic",
  "created_at": "2026-06-06T15:40:00Z"
}
```
* **Response 409 (Conflict):**
```json
{
  "error": "EMAIL_EXISTS",
  "message": "An account with this email already exists."
}
```
