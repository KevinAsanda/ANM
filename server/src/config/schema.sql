-- ==========================================
-- ANM AUTOMOTIVE SERVICE MANAGEMENT SYSTEM
-- Database Schema & RLS Policies (Supabase / PostgreSQL)
-- ==========================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------
-- 1. Table Definitions
-- ------------------------------------------

-- customers
CREATE TABLE customers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        varchar(100) NOT NULL,
  phone       varchar(20)  UNIQUE NOT NULL,
  email       varchar(100) UNIQUE,
  created_at  timestamptz  DEFAULT now()
);
CREATE INDEX ON customers(phone);

-- vehicles
CREATE TABLE vehicles (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id          uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  registration_number  varchar(20) UNIQUE NOT NULL,
  vin                  varchar(17),
  make                 varchar(50) NOT NULL,
  model                varchar(50) NOT NULL,
  year                 smallint CHECK (year BETWEEN 1900 AND 2100),
  created_at           timestamptz DEFAULT now()
);
CREATE INDEX ON vehicles(registration_number);
CREATE INDEX ON vehicles(customer_id);

-- staff (extends auth.users)
CREATE TABLE staff (
  id          uuid PRIMARY KEY,  -- matches auth.users.id
  name        varchar(100) NOT NULL,
  email       varchar(100) UNIQUE NOT NULL,
  role        text NOT NULL CHECK (role IN ('admin', 'mechanic')),
  created_at  timestamptz DEFAULT now()
);

-- Updated_at trigger function (reusable)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- service_tickets
CREATE TABLE service_tickets (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id   uuid NOT NULL REFERENCES vehicles(id),
  staff_id     uuid NOT NULL REFERENCES staff(id),
  created_by   uuid NOT NULL REFERENCES staff(id),
  status       text NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','in_progress','completed','cancelled')),
  description  text NOT NULL,
  notes        text,
  labour_cost  numeric(10,2) DEFAULT 0.00,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);
CREATE INDEX ON service_tickets(staff_id);
CREATE INDEX ON service_tickets(status);
CREATE INDEX ON service_tickets(created_at DESC);
CREATE TRIGGER trg_tickets_updated_at
  BEFORE UPDATE ON service_tickets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- inventory
CREATE TABLE inventory (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  part_name     varchar(100) NOT NULL,
  part_number   varchar(50)  UNIQUE,
  qty_in_stock  integer NOT NULL DEFAULT 0 CHECK (qty_in_stock >= 0),
  reorder_level integer NOT NULL DEFAULT 5 CHECK (reorder_level >= 0),
  unit_cost     numeric(10,2),
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);
CREATE INDEX ON inventory(qty_in_stock);
CREATE TRIGGER trg_inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ticket_parts
CREATE TABLE ticket_parts (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id         uuid NOT NULL REFERENCES service_tickets(id) ON DELETE CASCADE,
  inventory_id      uuid NOT NULL REFERENCES inventory(id),
  qty_used          integer NOT NULL DEFAULT 1 CHECK (qty_used >= 1),
  unit_cost_at_time numeric(10,2),
  logged_by         uuid NOT NULL REFERENCES staff(id),
  created_at        timestamptz DEFAULT now()
);
CREATE INDEX ON ticket_parts(ticket_id);

-- ------------------------------------------
-- 2. Row-Level Security (RLS) Configuration
-- ------------------------------------------

ALTER TABLE customers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff           ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory       ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_parts    ENABLE ROW LEVEL SECURITY;

-- Helper function — get current user's role from their staff record
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS text AS $$
  SELECT role FROM staff WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Transaction function — log a part on a ticket and decrement stock atomically
CREATE OR REPLACE FUNCTION log_ticket_part(
  p_ticket_id UUID,
  p_inventory_id UUID,
  p_qty_used INTEGER,
  p_logged_by UUID
)
RETURNS TABLE (
  id UUID,
  ticket_id UUID,
  inventory_id UUID,
  qty_used INTEGER,
  unit_cost_at_time NUMERIC(10,2),
  logged_by UUID,
  created_at TIMESTAMPTZ
) AS $$
DECLARE
  v_qty_in_stock INTEGER;
  v_unit_cost NUMERIC(10,2);
  v_new_id UUID;
  v_created_at TIMESTAMPTZ;
BEGIN
  -- Select stock and unit cost with locking (FOR UPDATE) to prevent race conditions
  SELECT qty_in_stock, unit_cost INTO v_qty_in_stock, v_unit_cost
  FROM inventory
  WHERE id = p_inventory_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'PART_NOT_FOUND';
  END IF;

  IF v_qty_in_stock < p_qty_used THEN
    RAISE EXCEPTION 'Insufficient stock. Only % units available.', v_qty_in_stock;
  END IF;

  -- Decrement stock
  UPDATE inventory
  SET qty_in_stock = qty_in_stock - p_qty_used
  WHERE id = p_inventory_id;

  -- Insert part log
  INSERT INTO ticket_parts (ticket_id, inventory_id, qty_used, unit_cost_at_time, logged_by)
  VALUES (p_ticket_id, p_inventory_id, p_qty_used, v_unit_cost, p_logged_by)
  RETURNING ticket_parts.id, ticket_parts.created_at INTO v_new_id, v_created_at;

  RETURN QUERY SELECT 
    v_new_id,
    p_ticket_id,
    p_inventory_id,
    p_qty_used,
    v_unit_cost,
    p_logged_by,
    v_created_at;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------
-- 3. RLS Policies
-- ------------------------------------------

-- staff: everyone can read their own profile; admins see all
CREATE POLICY "staff: self-read" ON staff
  FOR SELECT USING (id = auth.uid() OR current_user_role() = 'admin');

CREATE POLICY "staff: admin insert" ON staff
  FOR INSERT WITH CHECK (current_user_role() = 'admin');

-- customers: admin only
CREATE POLICY "customers: admin all" ON customers
  FOR ALL USING (current_user_role() = 'admin');

-- vehicles: admin only
CREATE POLICY "vehicles: admin all" ON vehicles
  FOR ALL USING (current_user_role() = 'admin');

-- service_tickets: admin sees all; mechanic sees own
CREATE POLICY "tickets: admin all" ON service_tickets
  FOR ALL USING (current_user_role() = 'admin');

CREATE POLICY "tickets: mechanic own" ON service_tickets
  FOR SELECT USING (staff_id = auth.uid());

CREATE POLICY "tickets: mechanic update own" ON service_tickets
  FOR UPDATE USING (staff_id = auth.uid());

-- inventory: admin full CRUD; mechanic read-only
CREATE POLICY "inventory: admin all" ON inventory
  FOR ALL USING (current_user_role() = 'admin');

CREATE POLICY "inventory: mechanic read" ON inventory
  FOR SELECT USING (current_user_role() = 'mechanic');

-- ticket_parts: mechanic can insert/read on own ticket; admin full
CREATE POLICY "ticket_parts: admin all" ON ticket_parts
  FOR ALL USING (current_user_role() = 'admin');

CREATE POLICY "ticket_parts: mechanic insert own ticket" ON ticket_parts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM service_tickets
      WHERE id = ticket_id AND staff_id = auth.uid()
    )
  );

CREATE POLICY "ticket_parts: mechanic read own ticket" ON ticket_parts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM service_tickets
      WHERE id = ticket_id AND staff_id = auth.uid()
    )
  );

-- ------------------------------------------
-- 4. Demo Seed Data
-- ------------------------------------------

-- Inventory seed
INSERT INTO inventory (part_name, part_number, qty_in_stock, reorder_level, unit_cost) VALUES
  ('Oil Filter', 'OF-001', 15, 5, 45.00),
  ('Air Filter', 'AF-002', 8, 5, 120.00),
  ('Brake Pads (Front)', 'BP-F-003', 4, 5, 350.00),
  ('Spark Plugs (set of 4)', 'SP-004', 12, 5, 180.00),
  ('Engine Oil 5W-30 (5L)', 'EO-005', 3, 5, 210.00),
  ('Wiper Blades', 'WB-006', 20, 5, 95.00),
  ('Battery (650CCA)', 'BAT-007', 2, 3, 1200.00),
  ('Timing Belt', 'TB-008', 6, 3, 450.00),
  ('Coolant (1L)', 'CL-009', 18, 5, 55.00),
  ('Brake Fluid (500ml)', 'BF-010', 9, 5, 75.00),
  ('Clutch Kit', 'CK-011', 1, 2, 1800.00),
  ('Power Steering Fluid', 'PS-012', 7, 5, 65.00);
