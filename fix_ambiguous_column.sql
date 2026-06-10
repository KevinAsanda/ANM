-- ====================================================================
-- FIX: Ambiguous Column Reference in log_ticket_part RPC & RLS Policies
-- ====================================================================

-- 1. Recreate the transaction function with conflict resolution rules
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
#variable_conflict use_column
DECLARE
  v_qty_in_stock INTEGER;
  v_unit_cost NUMERIC(10,2);
  v_new_id UUID;
  v_created_at TIMESTAMPTZ;
BEGIN
  -- Select stock and unit cost with locking (FOR UPDATE) to prevent race conditions
  SELECT qty_in_stock, unit_cost INTO v_qty_in_stock, v_unit_cost
  FROM inventory
  WHERE inventory.id = p_inventory_id
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
  WHERE inventory.id = p_inventory_id;

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

-- 2. Drop and recreate the RLS policies with fully qualified column references
DROP POLICY IF EXISTS "ticket_parts: mechanic insert own ticket" ON ticket_parts;
CREATE POLICY "ticket_parts: mechanic insert own ticket" ON ticket_parts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM service_tickets
      WHERE service_tickets.id = ticket_parts.ticket_id AND service_tickets.staff_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "ticket_parts: mechanic read own ticket" ON ticket_parts;
CREATE POLICY "ticket_parts: mechanic read own ticket" ON ticket_parts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM service_tickets
      WHERE service_tickets.id = ticket_parts.ticket_id AND service_tickets.staff_id = auth.uid()
    )
  );
