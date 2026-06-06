# Local Setup & Installation Guide — ANM System

This guide walk you through installing, configuring, and running the ANM Automotive Service Management System locally.

---

## Prerequisites

- **Node.js**: `v18.x` or higher
- **npm**: `v9.x` or higher
- **Supabase Account**: A free Supabase project instance

---

## 1. Clone the Repository

Clone the project folder and navigate to the root directory:

```bash
git clone https://github.com/your-username/anm-system.git
cd anm-system
```

---

## 2. Environment Configurations

Both the client and server projects require `.env` configuration files.

### Server Env (`server/.env`)

Create a `.env` file inside the `server/` directory:

```bash
cp server/.env.example server/.env
```

Open `server/.env` and supply the following variables:

```ini
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-secret-key
SUPABASE_JWT_SECRET=your-supabase-jwt-secret-key
NODE_ENV=development
```

> [!IMPORTANT]
> Always use the **Service Role Key** (`service_role` secret) on the server, not the Anon Key. The server uses this key to perform administrative tasks (e.g., auto-registering mechanic auth accounts). Keep this secret secure and never commit `.env` files.

### Client Env (`client/.env`)

Create a `.env` file inside the `client/` directory:

```bash
cp client/.env.example client/.env
```

Open `client/.env` and supply the following variables:

```ini
VITE_API_BASE_URL=http://localhost:3001/api/v1
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-public-key
```

---

## 3. Database Schema Setup

1. Open your **Supabase Dashboard**.
2. Select your project and navigate to the **SQL Editor** tab.
3. Copy the full SQL content from [docs/DB_SCHEMA.md](file:///C:/Users/User/Desktop/My%20Learning/ANM/docs/DB_SCHEMA.md#L144-L317) and paste it into the editor query window.
4. Click **Run** to generate tables, indices, helper functions, and Row-Level Security (RLS) policies.
5. In the same editor, copy and run the transaction function definition from [docs/DB_SCHEMA.md#L350-L406](file:///C:/Users/User/Desktop/My%20Learning/ANM/docs/DB_SCHEMA.md#L350-L406).

---

## 4. Install Dependencies

You must run `npm install` in both the client and server subdirectories:

### Install Server Packages

```bash
cd server
npm install
cd ..
```

### Install Client Packages

```bash
cd client
npm install
cd ..
```

---

## 5. Seed the Database

ANM includes a programmatic seeding script that automatically creates 3 staff authentication profiles (Admin, Mechanic 1, Mechanic 2) and populates the database with realistic South African workshop data:

```bash
cd server
npm run seed
```

This creates the following default login credentials:
- **Admin**: `admin@anm.co.za` (Password: `adminPassword123`)
- **Mechanic 1**: `mechanic@anm.co.za` (Password: `mechPassword123`)
- **Mechanic 2**: `sanele@anm.co.za` (Password: `mechPassword123`)

---

## 6. Run the Application

Start the dev servers for both components. It is recommended to use two separate terminal windows.

### Run Backend API

```bash
cd server
npm run dev
```
The API is served at `http://localhost:3001/api/v1`.

### Run Frontend Client

```bash
cd client
npm run dev
```
The React app will be served at `http://localhost:5173`. Open this URL in your browser.

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

- **Server**: `cd server && npm run lint`
- **Client**: `cd client && npm run lint`
