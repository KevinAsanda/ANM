-- ============================================================================
-- Sprint 9 Migration: Invoices Table, Index, and RLS Policies
-- Execute this script in your Supabase SQL Editor.
-- ============================================================================

-- 1. Create Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id       uuid NOT NULL REFERENCES service_tickets(id) ON DELETE CASCADE UNIQUE,
  invoice_no      varchar(30) UNIQUE NOT NULL,
  labour_cost     numeric(10,2) NOT NULL DEFAULT 0.00 CHECK (labour_cost >= 0.00),
  parts_cost      numeric(10,2) NOT NULL DEFAULT 0.00 CHECK (parts_cost >= 0.00),
  tax_amount      numeric(10,2) NOT NULL DEFAULT 0.00 CHECK (tax_amount >= 0.00), -- 15% VAT (South Africa)
  total_amount    numeric(10,2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0.00),
  status          varchar(20) NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid', 'void')),
  payment_method  varchar(20) CHECK (payment_method IN ('cash', 'card', 'eft')),
  secure_token    uuid NOT NULL DEFAULT gen_random_uuid(), -- secure link token for customers
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- 2. Create index on secure token for public lookups
CREATE INDEX IF NOT EXISTS invoices_secure_token_idx ON invoices(secure_token);
CREATE INDEX IF NOT EXISTS invoices_ticket_id_idx ON invoices(ticket_id);
CREATE INDEX IF NOT EXISTS invoices_status_idx ON invoices(status);

-- 3. Add updated_at trigger
CREATE TRIGGER trg_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 4. Enable Row-Level Security (RLS)
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Only Admin can view/modify invoices directly via the Supabase client
-- Note: Public lookup by customers is routed through the Express API server
-- which bypasses RLS using the service role key to selectively fetch invoices by secure_token.

DROP POLICY IF EXISTS "invoices: admin all" ON invoices;
CREATE POLICY "invoices: admin all" ON invoices
  FOR ALL USING (current_user_role() = 'admin');
