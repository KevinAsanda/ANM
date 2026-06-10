import test from 'node:test';
import assert from 'node:assert';

// Set environment to mock mode
process.env.SUPABASE_URL = 'https://mockproject.supabase.co';

const { getFinancialAnalytics } = await import('./analytics.service.js');
const { createInvoice, resetMockInvoices } = await import('./invoice.service.js');
const { mockTickets, mockTicketParts } = await import('./ticket.service.js');
const { mockStaff } = await import('./staff.service.js');

test('Sprint 10 - Analytics Service: KPI sums, range checks, and staff rank summaries', async () => {
  resetMockInvoices();
  mockTicketParts.splice(0, mockTicketParts.length);

  // 1. Prepare Mock Tickets & Staff
  const mechId = 'f5f7b03b-1798-444a-a435-08103cd58522'; // Asanda Cele
  
  // Set up completed tickets
  const ticket1Id = 't1b07384-d113-49c3-a558-8b9a103c8099';
  const ticket1 = mockTickets.find(t => t.id === ticket1Id);
  assert.ok(ticket1);
  ticket1.status = 'completed';
  ticket1.labour_cost = 500.00;
  ticket1.staff_id = mechId;

  // Add parts on ticket 1
  mockTicketParts.push({
    id: 'tp-1',
    ticket_id: ticket1Id,
    inventory_id: 'inv-part-1',
    qty_used: 1,
    unit_cost_at_time: 200.00,
    logged_by: mechId
  });

  // Create invoice and set to paid
  const invoice1 = await createInvoice(ticket1Id);
  invoice1.status = 'paid';
  invoice1.created_at = new Date().toISOString(); // falls in YTD and 30 days

  // Add a second historical invoice (older than 30 days, e.g. 45 days ago)
  const ticket2Id = 't2-mock-ticket';
  const oldDate = new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString();
  
  mockTickets.push({
    id: ticket2Id,
    vehicle_id: 'v7b91d90-b183-4903-8888-0f19c9d09a80',
    staff_id: mechId,
    created_by: 'admin-1',
    status: 'completed',
    description: 'Old job',
    notes: '',
    labour_cost: 300.00,
    created_at: oldDate,
    updated_at: oldDate
  });

  const invoice2 = await createInvoice(ticket2Id);
  invoice2.status = 'paid';
  invoice2.created_at = oldDate; // falls in 90 days / YTD but not 30 days

  // 2. Query Financials for 30 days (Should only include invoice 1)
  const report30 = await getFinancialAnalytics('30_days');
  assert.strictEqual(report30.summary.total_paid_invoices, 1);
  assert.strictEqual(report30.summary.labor_revenue, 500.00);
  assert.strictEqual(report30.summary.parts_revenue, 200.00);
  assert.strictEqual(report30.summary.vat_collected, 105.00); // (500 + 200) * 15% = 105
  assert.strictEqual(report30.summary.gross_revenue, 805.00);

  // 3. Query Financials for 90 days (Should include both invoices)
  const report90 = await getFinancialAnalytics('90_days');
  assert.strictEqual(report90.summary.total_paid_invoices, 2);
  assert.strictEqual(report90.summary.labor_revenue, 800.00); // 500 + 300
  assert.strictEqual(report90.summary.parts_revenue, 200.00); // 200 + 0
  assert.strictEqual(report90.summary.gross_revenue, 1150.00); // (800 + 200) * 1.15 = 1150

  // 4. Verify Monthly Trends grouping
  assert.ok(report90.monthly_trends.length >= 1);
  const currentMonthStr = new Date().toISOString().substring(0, 7);
  const currentMonthTrend = report90.monthly_trends.find(t => t.month === currentMonthStr);
  assert.ok(currentMonthTrend);
  assert.strictEqual(currentMonthTrend.labor, 500.00);

  // 5. Verify Technician Rankings
  const techStats = report90.technicians.find(t => t.id === mechId);
  assert.ok(techStats);
  assert.strictEqual(techStats.tickets_completed, 2);
  assert.strictEqual(techStats.labor_revenue, 800.00); // 500 + 300
  assert.strictEqual(techStats.parts_value, 200.00); // 200 on paid invoices

  // Clean up mock array changes
  mockTicketParts.splice(0, mockTicketParts.length);
  const ticket2Index = mockTickets.findIndex(t => t.id === ticket2Id);
  if (ticket2Index !== -1) mockTickets.splice(ticket2Index, 1);
  resetMockInvoices();
});
