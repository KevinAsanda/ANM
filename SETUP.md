# Local Setup & Installation Guide — ANM System

This guide walks you through installing, configuring, and running the ANM Automotive Service Management System locally.

---

## Prerequisites

*   **Node.js**: `v18.x` or higher
*   **npm**: `v9.x` or higher
*   **Supabase Account**: A free Supabase project instance

---

## 1. Clone the Repository

Clone the project folder and navigate to the root directory:

```bash
git clone https://github.com/your-username/anm-system.git
cd anm-system
```

---

## 2. Environment Configurations

All three projects require `.env` configuration files. Create them from the provided example templates:

### A. Server Env (`server/.env`)
Create a `.env` file inside the `server/` directory:
```bash
cp server/.env.example server/.env
```
Fill in the following variables:
```ini
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-secret-key
SUPABASE_JWT_SECRET=your-supabase-jwt-secret-key
NODE_ENV=development
```
> [!IMPORTANT]
> Always use the **Service Role Key** (`service_role` secret) on the server, not the Anon Key. The server uses this key to bypass database Row-Level Security (RLS) for administrative tasks (e.g., seeding or creating mechanic auth accounts).

### B. Customer Portal Env (`client-customer/.env`)
Create a `.env` file inside the `client-customer/` directory:
```bash
cp client-customer/.env.example client-customer/.env
```
Fill in the following variables:
```ini
VITE_API_BASE_URL=http://localhost:3001/api/v1
```

### C. Staff Portal Env (`client-staff/.env`)
Create a `.env` file inside the `client-staff/` directory:
```bash
cp client-staff/.env.example client-staff/.env
```
Fill in the following variables:
```ini
VITE_API_BASE_URL=http://localhost:3001/api/v1
```

---

## 3. Database Schema Setup

1.  Open your **Supabase Dashboard**.
2.  Select your project and navigate to the **SQL Editor** tab.
3.  Execute all migrations located in the `docs/` folder:
    *   [docs/V2_MIGRATION.sql](file:///C:/Users/User/Desktop/My%20Learning/ANM/docs/V2_MIGRATION.sql) (Core database tables & RLS policies)
    *   [docs/V3_MIGRATION.sql](file:///C:/Users/User/Desktop/My%20Learning/ANM/docs/V3_MIGRATION.sql) (Invoices table & analytics aggregates)
    *   [docs/V4_MIGRATION.sql](file:///C:/Users/User/Desktop/My%20Learning/ANM/docs/V4_MIGRATION.sql) (Draft booking states & tracking fields)
4.  In the SQL editor, verify that the transaction function `log_ticket_part` is created to handle atomic parts logging.

---

## 4. Install Dependencies

Install packages in all three directories:

```bash
# Install server packages
cd server && npm install && cd ..

# Install customer client packages
cd client-customer && npm install && cd ..

# Install staff client packages
cd client-staff && npm install && cd ..
```

---

## 5. Seed the Database

Run the seed script inside the `server/` directory to create testing profiles and populates mock data:

```bash
cd server
npm run seed
```

This creates the following default login credentials:
*   **Admin**: `admin@anm.co.za` (Password: `adminPassword123`)
*   **Mechanic 1**: `mechanic@anm.co.za` (Password: `mechPassword123`)
*   **Mechanic 2**: `sanele@anm.co.za` (Password: `mechPassword123`)

---

## 6. Run the Application

Start the dev servers for all three components using separate terminal windows.

### A. Run Backend API
```bash
cd server
npm run dev
```
The API is served at `http://localhost:3001/api/v1`.

### B. Run Customer Client (Public Website)
```bash
cd client-customer
npm run dev
```
The customer app will be served at `http://localhost:5173`.

### C. Run Staff Client (Admin & Mechanic Portal)
```bash
cd client-staff
npm run dev
```
The staff app will be served at `http://localhost:5174`.

---

## 7. Testing & Linting

### Run Server Unit Tests
Ensure the server is built and runs its mock validation tests:
```bash
cd server
npm run test
```

### Run Linter
Run TypeScript checks and ESLint verification:
*   **Server**: `cd server && npm run lint`
*   **Customer Client**: `cd client-customer && npm run lint`
*   **Staff Client**: `cd client-staff && npm run lint`
