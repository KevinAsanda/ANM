import test from 'node:test';
import assert from 'node:assert';

// Setup environment for testing mock mode BEFORE importing services
process.env.SUPABASE_URL = 'https://mockproject.supabase.co';

const { getInventoryForecast } = await import('./inventory.service.js');
const { mockTicketParts } = await import('./ticket.service.js');

test('Sprint 14 - AI-Powered Predictive Inventory Demand & Smart Reordering', async () => {
  // Clear any existing mock ticket parts
  mockTicketParts.length = 0;

  // Add mock ticket parts consumption to test demand estimation
  // i003 is 'Brake Pads (Front)', current stock is 4, reorder is 5
  // i005 is 'Engine Oil 5W-30 (5L)', current stock is 3, reorder is 5
  mockTicketParts.push(
    {
      id: 'tp001',
      ticket_id: 't001',
      inventory_id: 'i003',
      qty_used: 2,
      unit_cost_at_time: 350.00,
      logged_by: 'm001',
      created_at: new Date().toISOString()
    },
    {
      id: 'tp002',
      ticket_id: 't002',
      inventory_id: 'i003',
      qty_used: 1,
      unit_cost_at_time: 350.00,
      logged_by: 'm001',
      created_at: new Date().toISOString()
    },
    {
      id: 'tp003',
      ticket_id: 't001',
      inventory_id: 'i005',
      qty_used: 4,
      unit_cost_at_time: 210.00,
      logged_by: 'm001',
      created_at: new Date().toISOString()
    }
  );

  // Trigger forecasting
  const forecast = await getInventoryForecast();

  // Assertions
  assert.ok(Array.isArray(forecast), 'Forecast must return an array');
  assert.ok(forecast.length > 0, 'Forecast array should not be empty');

  // Verify schema properties of first recommendation
  const rec = forecast[0];
  assert.ok(rec.inventory_id, 'Recommendation must have inventory_id');
  assert.ok(rec.part_name, 'Recommendation must have part_name');
  assert.strictEqual(typeof rec.current_stock, 'number', 'current_stock must be a number');
  assert.strictEqual(typeof rec.projected_demand, 'number', 'projected_demand must be a number');
  assert.strictEqual(typeof rec.suggested_order_qty, 'number', 'suggested_order_qty must be a number');
  assert.strictEqual(typeof rec.estimated_cost, 'number', 'estimated_cost must be a number');
  assert.strictEqual(typeof rec.reasoning, 'string', 'reasoning must be a string');

  // Specific check for i003 (Brake Pads - Front) which is below reorder level (4 <= 5)
  const brakePadsRec = forecast.find(r => r.inventory_id === 'i003');
  assert.ok(brakePadsRec, 'Should find recommendation for Brake Pads (Front)');
  assert.ok(brakePadsRec.suggested_order_qty > 0, 'Brake pads suggested order quantity should be positive');
  assert.ok(brakePadsRec.reasoning && brakePadsRec.reasoning.length > 5, 'Reasoning should be a descriptive explanation');

  console.log('[Test] Sprint 14 Forecast assertions passed successfully.');
});
