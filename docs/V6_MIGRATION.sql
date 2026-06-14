-- ============================================================================
-- Sprint 15 Migration: AI Diagnostics Support for Service Tickets
-- Execute this script in your Supabase SQL Editor.
-- ============================================================================

-- 1. Add ai_diagnostics JSONB column to service_tickets table
ALTER TABLE service_tickets ADD COLUMN IF NOT EXISTS ai_diagnostics JSONB;

-- 2. Document the column structure:
-- ai_diagnostics: {
--   causes: string[],
--   checklist: { id: string, text: string, checked: boolean }[],
--   suggested_parts: { inventory_id: string, part_name: string, suggested_qty: number, reasoning: string }[]
-- }
