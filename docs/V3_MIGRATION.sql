-- ============================================================================
-- Sprint 10 Migration: Analytics & Reporting Views
-- Execute this script in your Supabase SQL Editor.
-- ============================================================================

-- 1. Create monthly_financial_summary View
CREATE OR REPLACE VIEW monthly_financial_summary AS
SELECT
  date_trunc('month', created_at)::date AS summary_month,
  COALESCE(SUM(labour_cost), 0.00) AS total_labour,
  COALESCE(SUM(parts_cost), 0.00) AS total_parts,
  COALESCE(SUM(tax_amount), 0.00) AS total_vat,
  COALESCE(SUM(total_amount), 0.00) AS total_gross
FROM invoices
WHERE status = 'paid'
GROUP BY 1
ORDER BY 1 DESC;

-- 2. Create staff_performance_summary View
CREATE OR REPLACE VIEW staff_performance_summary AS
SELECT
  s.id AS staff_id,
  s.name AS staff_name,
  s.email AS staff_email,
  COUNT(st.id) AS completed_tickets_count,
  COALESCE(SUM(st.labour_cost), 0.00) AS total_labour_generated,
  COALESCE(SUM(i.parts_cost), 0.00) AS total_parts_billed
FROM staff s
LEFT JOIN service_tickets st ON st.staff_id = s.id AND st.status = 'completed'
LEFT JOIN invoices i ON i.ticket_id = st.id AND i.status = 'paid'
WHERE s.role = 'mechanic'
GROUP BY s.id, s.name, s.email;

-- 3. Security configurations
-- Views in Supabase are readable by public by default if in the public schema.
-- We revoke read permissions from standard public roles to protect financial records.
REVOKE ALL ON monthly_financial_summary FROM public, anon, authenticated;
REVOKE ALL ON staff_performance_summary FROM public, anon, authenticated;
