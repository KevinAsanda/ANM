-- ----------------------------------------------------
-- ANM Automotive Service Management System Demo Seed Data
-- ----------------------------------------------------

-- IMPORTANT: Supabase Auth users must be created via the Authentication dashboard first.
-- Once created, copy the generated User UUIDs and replace the placeholders below
-- before running this INSERT script.

-- 1. SEED STAFF (Profiles mapped to Auth users)
-- Replace the UUID placeholders below with your actual Supabase Auth User UUIDs:
-- Admin UUID: 'd3b07384-d113-49c3-a558-8b9a103c801e'
-- Mechanic 1 UUID: 'f5f7b03b-1798-444a-a435-08103cd58522'
-- Mechanic 2 UUID: 'e3b07384-d113-49c3-a558-8b9a103c802f'

INSERT INTO staff (id, name, email, role) VALUES
  ('d3b07384-d113-49c3-a558-8b9a103c801e', 'Mpume Zulu', 'admin@anm.co.za', 'admin'),
  ('f5f7b03b-1798-444a-a435-08103cd58522', 'Asanda Cele', 'mechanic@anm.co.za', 'mechanic'),
  ('e3b07384-d113-49c3-a558-8b9a103c802f', 'Sanele Dlamini', 'sanele@anm.co.za', 'mechanic')
ON CONFLICT (id) DO NOTHING;

-- 2. SEED CUSTOMERS
INSERT INTO customers (id, name, phone, email) VALUES
  ('c1f7b03b-1798-444a-a435-08103cd585e5', 'Sipho Khumalo', '0821234567', 'sipho@gmail.com'),
  ('c2f7b03b-1798-444a-a435-08103cd585e6', 'Zama Mkhize', '0839876543', 'zama@gmail.com'),
  ('c3f7b03b-1798-444a-a435-08103cd585e7', 'Kevin Naidoo', '0845551234', 'kevin@yahoo.com')
ON CONFLICT (id) DO NOTHING;

-- 3. SEED VEHICLES
INSERT INTO vehicles (id, customer_id, registration_number, vin, make, model, year) VALUES
  ('v7b91d90-b183-4903-8888-0f19c9d09a80', 'c1f7b03b-1798-444a-a435-08103cd585e5', 'ND123456', 'VIN12345678901234', 'Toyota', 'Hilux', 2018),
  ('v7b91d90-b183-4903-8888-0f19c9d09a81', 'c1f7b03b-1798-444a-a435-08103cd585e5', 'ND654321', 'VIN12345678901235', 'Volkswagen', 'Polo', 2017),
  ('v7b91d90-b183-4903-8888-0f19c9d09a82', 'c2f7b03b-1798-444a-a435-08103cd585e6', 'NP987654', 'VIN12345678901236', 'Ford', 'Ranger', 2019),
  ('v7b91d90-b183-4903-8888-0f19c9d09a83', 'c2f7b03b-1798-444a-a435-08103cd585e6', 'NU456123', 'VIN12345678901237', 'Hyundai', 'i20', 2015),
  ('v7b91d90-b183-4903-8888-0f19c9d09a84', 'c3f7b03b-1798-444a-a435-08103cd585e7', 'NUR789012', 'VIN12345678901238', 'Toyota', 'Corolla', 2016)
ON CONFLICT (id) DO NOTHING;

-- 4. SEED SERVICE TICKETS
INSERT INTO service_tickets (id, vehicle_id, staff_id, created_by, status, description, notes, labour_cost, created_at, updated_at) VALUES
  ('t1b07384-d113-49c3-a558-8b9a103c8090', 'v7b91d90-b183-4903-8888-0f19c9d09a80', 'f5f7b03b-1798-444a-a435-08103cd58522', 'd3b07384-d113-49c3-a558-8b9a103c801e', 'pending', 'Front brake pads worn out and squealing. Replace pads.', 'Customer reports squealing noise when braking.', 350.00, now() - INTERVAL '2 hours', now() - INTERVAL '2 hours'),
  ('t1b07384-d113-49c3-a558-8b9a103c8091', 'v7b91d90-b183-4903-8888-0f19c9d09a81', 'e3b07384-d113-49c3-a558-8b9a103c802f', 'd3b07384-d113-49c3-a558-8b9a103c801e', 'in_progress', 'Polo oil service. Replace engine oil, oil filter, and spark plugs.', 'Check for minor engine oil leak reported by owner.', 450.00, now() - INTERVAL '4 hours', now() - INTERVAL '1 hour'),
  ('t1b07384-d113-49c3-a558-8b9a103c8092', 'v7b91d90-b183-4903-8888-0f19c9d09a82', 'f5f7b03b-1798-444a-a435-08103cd58522', 'd3b07384-d113-49c3-a558-8b9a103c801e', 'completed', 'Timing belt replacement on Ranger. Perform critical checks.', 'Engine belt replaced, checked tensions.', 950.00, now() - INTERVAL '1 day', now() - INTERVAL '18 hours'),
  ('t1b07384-d113-49c3-a558-8b9a103c8093', 'v7b91d90-b183-4903-8888-0f19c9d09a83', 'e3b07384-d113-49c3-a558-8b9a103c802f', 'd3b07384-d113-49c3-a558-8b9a103c801e', 'completed', 'Wiper blades replacement and general windscreen wash.', 'Cleaned windscreen, fitted new blades.', 100.00, now() - INTERVAL '3 hours', now() - INTERVAL '2.5 hours'),
  ('t1b07384-d113-49c3-a558-8b9a103c8094', 'v7b91d90-b183-4903-8888-0f19c9d09a84', 'f5f7b03b-1798-444a-a435-08103cd58522', 'd3b07384-d113-49c3-a558-8b9a103c801e', 'cancelled', 'Clutch replacement request. Owner changed mind.', 'Ticket cancelled by admin as client requested quotes only.', 0.00, now() - INTERVAL '2 days', now() - INTERVAL '1.5 days'),
  ('t1b07384-d113-49c3-a558-8b9a103c8095', 'v7b91d90-b183-4903-8888-0f19c9d09a80', 'e3b07384-d113-49c3-a558-8b9a103c802f', 'd3b07384-d113-49c3-a558-8b9a103c801e', 'pending', 'Wheel alignment check and minor steering adjustment.', 'Owner complains of slight left-side drift on highway.', 250.00, now() - INTERVAL '30 minutes', now() - INTERVAL '30 minutes'),
  ('t1b07384-d113-49c3-a558-8b9a103c8096', 'v7b91d90-b183-4903-8888-0f19c9d09a82', 'f5f7b03b-1798-444a-a435-08103cd58522', 'd3b07384-d113-49c3-a558-8b9a103c801e', 'in_progress', 'Minor service on Ford Ranger. Oil change and fluid topups.', 'Top up coolant, washer fluids.', 300.00, now() - INTERVAL '1.5 hours', now() - INTERVAL '1 hour'),
  ('t1b07384-d113-49c3-a558-8b9a103c8097', 'v7b91d90-b183-4903-8888-0f19c9d09a81', 'e3b07384-d113-49c3-a558-8b9a103c802f', 'd3b07384-d113-49c3-a558-8b9a103c801e', 'completed', 'Engine diagnostics for check-engine light. Diagnose spark plug fault.', 'Scanned codes, found cylinder 3 misfire. Replaced spark plugs.', 400.00, now() - INTERVAL '5 hours', now() - INTERVAL '3 hours')
ON CONFLICT (id) DO NOTHING;

-- 5. SEED INVENTORY (Only if not already done)
INSERT INTO inventory (id, part_name, part_number, qty_in_stock, reorder_level, unit_cost) VALUES
  ('i9b91d90-b183-4903-8888-0f19c9d09a01', 'Oil Filter', 'OF-001', 15, 5, 45.00),
  ('i9b91d90-b183-4903-8888-0f19c9d09a02', 'Air Filter', 'AF-002', 8, 5, 120.00),
  ('i9b91d90-b183-4903-8888-0f19c9d09a03', 'Brake Pads (Front)', 'BP-F-003', 4, 5, 350.00),
  ('i9b91d90-b183-4903-8888-0f19c9d09a04', 'Spark Plugs (set of 4)', 'SP-004', 12, 5, 180.00),
  ('i9b91d90-b183-4903-8888-0f19c9d09a05', 'Engine Oil 5W-30 (5L)', 'EO-005', 3, 5, 210.00),
  ('i9b91d90-b183-4903-8888-0f19c9d09a06', 'Wiper Blades', 'WB-006', 20, 5, 95.00),
  ('i9b91d90-b183-4903-8888-0f19c9d09a07', 'Battery (650CCA)', 'BAT-007', 2, 3, 1200.00),
  ('i9b91d90-b183-4903-8888-0f19c9d09a08', 'Timing Belt', 'TB-008', 6, 3, 450.00),
  ('i9b91d90-b183-4903-8888-0f19c9d09a09', 'Coolant (1L)', 'CL-009', 18, 5, 55.00),
  ('i9b91d90-b183-4903-8888-0f19c9d09a10', 'Brake Fluid (500ml)', 'BF-010', 9, 5, 75.00),
  ('i9b91d90-b183-4903-8888-0f19c9d09a11', 'Clutch Kit', 'CK-011', 1, 2, 1800.00),
  ('i9b91d90-b183-4903-8888-0f19c9d09a12', 'Power Steering Fluid', 'PS-012', 7, 5, 65.00)
ON CONFLICT (id) DO NOTHING;

-- 6. SEED LOGGED PARTS ON COMPLETED SERVICE TICKETS
INSERT INTO ticket_parts (id, ticket_id, inventory_id, qty_used, unit_cost_at_time, logged_by) VALUES
  ('tp-2b07384-d113-49c3-a558-8b9a103c8001', 't1b07384-d113-49c3-a558-8b9a103c8092', 'i9b91d90-b183-4903-8888-0f19c9d09a08', 1, 450.00, 'f5f7b03b-1798-444a-a435-08103cd58522'), -- 1 Timing Belt on Ticket 3
  ('tp-2b07384-d113-49c3-a558-8b9a103c8002', 't1b07384-d113-49c3-a558-8b9a103c8093', 'i9b91d90-b183-4903-8888-0f19c9d09a06', 2, 95.00, 'e3b07384-d113-49c3-a558-8b9a103c802f'), -- 2 Wiper Blades on Ticket 4
  ('tp-2b07384-d113-49c3-a558-8b9a103c8003', 't1b07384-d113-49c3-a558-8b9a103c8097', 'i9b91d90-b183-4903-8888-0f19c9d09a04', 1, 180.00, 'e3b07384-d113-49c3-a558-8b9a103c802f') -- 1 Spark plugs pack on Ticket 8
ON CONFLICT (id) DO NOTHING;
