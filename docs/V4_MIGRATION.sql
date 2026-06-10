-- ============================================================================
-- Sprint 11 Migration: Booking Portal & Tracking Support
-- Execute this script in your Supabase SQL Editor.
-- ============================================================================

-- 1. Modify status check constraint on service_tickets
ALTER TABLE service_tickets DROP CONSTRAINT IF EXISTS service_tickets_status_check;
ALTER TABLE service_tickets ADD CONSTRAINT service_tickets_status_check 
  CHECK (status IN ('draft', 'pending', 'in_progress', 'completed', 'cancelled'));

-- 2. Make staff_id and created_by nullable on service_tickets to support customer bookings
ALTER TABLE service_tickets ALTER COLUMN staff_id DROP NOT NULL;
ALTER TABLE service_tickets ALTER COLUMN created_by DROP NOT NULL;

-- 3. Add preferred date, time, and secure tracking token
ALTER TABLE service_tickets ADD COLUMN IF NOT EXISTS preferred_date DATE;
ALTER TABLE service_tickets ADD COLUMN IF NOT EXISTS preferred_time VARCHAR(20) CHECK (preferred_time IN ('morning', 'afternoon'));
ALTER TABLE service_tickets ADD COLUMN IF NOT EXISTS tracking_token UUID NOT NULL DEFAULT gen_random_uuid();

-- 4. Create unique index on tracking_token for fast customer queries
CREATE UNIQUE INDEX IF NOT EXISTS service_tickets_tracking_token_idx ON service_tickets(tracking_token);
