import test from 'node:test';
import assert from 'node:assert';
// Setup environment for testing mock mode
process.env.SUPABASE_URL = 'https://mockproject.supabase.co';

const { getDashboardStats, getRecentTickets, getLowStockItems } = await import('./dashboard.service.js');
const { mockTickets } = await import('./ticket.service.js');
const { mockInventory } = await import('./inventory.service.js');

test('Sprint 6 - Dashboard Service: stats calculations, recent tickets, low-stock items', async () => {
  // 1. Fetch current mock stats
  const stats = await getDashboardStats();
  
  // Verify basic structure and data types
  assert.strictEqual(typeof stats.active_jobs, 'number');
  assert.strictEqual(typeof stats.completed_today, 'number');
  assert.strictEqual(typeof stats.total_mechanics, 'number');
  assert.strictEqual(typeof stats.low_stock_count, 'number');

  // Verify initial counts based on seeded mock data
  const expectedActive = mockTickets.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
  assert.strictEqual(stats.active_jobs, expectedActive);

  const expectedLowStock = mockInventory.filter(i => i.qty_in_stock <= i.reorder_level).length;
  assert.strictEqual(stats.low_stock_count, expectedLowStock);

  // 2. Add a ticket dynamically to mock database and verify stats update
  const originalActiveCount = stats.active_jobs;
  mockTickets.push({
    id: 't-dashboard-test',
    vehicle_id: 'v7b91d90-b183-4903-8888-0f19c9d09a80',
    staff_id: 'f5f7b03b-1798-444a-a435-08103cd58522',
    created_by: 'd3b07384-d113-49c3-a558-8b9a103c801e',
    status: 'in_progress',
    description: 'Dashboard test ticket',
    notes: null,
    labour_cost: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  const updatedStats = await getDashboardStats();
  assert.strictEqual(updatedStats.active_jobs, originalActiveCount + 1);

  // Clean up
  mockTickets.pop();

  // 3. Test getRecentTickets: verify returns up to 5 tickets, sorted desc
  const recent = await getRecentTickets();
  assert.ok(recent.length <= 5);
  for (let i = 0; i < recent.length - 1; i++) {
    const dateA = new Date(recent[i].created_at).getTime();
    const dateB = new Date(recent[i + 1].created_at).getTime();
    assert.ok(dateA >= dateB, 'Recent tickets should be sorted in descending order of creation date');
  }

  // 4. Test getLowStockItems
  const lowStock = await getLowStockItems();
  assert.strictEqual(lowStock.length, expectedLowStock);
  for (const item of lowStock) {
    assert.ok(item.qty_in_stock <= item.reorder_level, 'Returned item must be at or below reorder level');
  }
});
