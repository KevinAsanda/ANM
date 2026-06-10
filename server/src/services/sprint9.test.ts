import test from 'node:test';
import assert from 'node:assert';

// Set environment to run in mock mode
process.env.SUPABASE_URL = 'https://mockproject.supabase.co';

const { 
  createInvoice, 
  listInvoices, 
  getInvoiceDetails, 
  getInvoiceByToken, 
  updateInvoiceStatus,
  resetMockInvoices
} = await import('./invoice.service.js');

const {
  updateTicketStatus,
  mockTickets,
  mockTicketParts
} = await import('./ticket.service.js');

test('Sprint 9 - Invoicing Service: calculations, token queries, payment states, and ticket hooks', async () => {
  resetMockInvoices();

  // 1. Prepare mock data
  const ticketId = 't1b07384-d113-49c3-a558-8b9a103c8099';
  const ticket = mockTickets.find(t => t.id === ticketId);
  assert.ok(ticket);
  
  // Set labor cost
  ticket!.labour_cost = 200.00;

  // Add mock parts on this ticket
  mockTicketParts.push(
    {
      id: 'tp-mock-1',
      ticket_id: ticketId,
      inventory_id: 'part-1',
      qty_used: 2,
      unit_cost_at_time: 150.00, // 300.00 total parts cost
      logged_by: 'mech-1'
    },
    {
      id: 'tp-mock-2',
      ticket_id: ticketId,
      inventory_id: 'part-2',
      qty_used: 1,
      unit_cost_at_time: 100.00, // 100.00 total parts cost
      logged_by: 'mech-1'
    }
  );

  // 2. Generate Invoice (Happy Path)
  const invoice = await createInvoice(ticketId);
  assert.ok(invoice.id);
  assert.strictEqual(invoice.ticket_id, ticketId);
  assert.strictEqual(invoice.labour_cost, 200.00);
  assert.strictEqual(invoice.parts_cost, 400.00); // 300 + 100
  assert.strictEqual(invoice.tax_amount, 90.00); // (200 + 400) * 15% = 90
  assert.strictEqual(invoice.total_amount, 690.00); // 600 + 90
  assert.strictEqual(invoice.status, 'unpaid');
  assert.strictEqual(invoice.payment_method, null);
  assert.ok(invoice.invoice_no.startsWith('INV-'));
  assert.ok(invoice.secure_token);

  // 3. Retrieve Invoice Details by ID
  const retrieved = await getInvoiceDetails(invoice.id);
  assert.strictEqual(retrieved.id, invoice.id);
  assert.strictEqual(retrieved.total_amount, 690.00);

  // 4. Public Customer Query by Secure Token
  const publicRetrieved = await getInvoiceByToken(invoice.secure_token);
  assert.strictEqual(publicRetrieved.id, invoice.id);
  assert.strictEqual(publicRetrieved.total_amount, 690.00);

  // 5. Querying with Invalid ID or Token should throw
  await assert.rejects(
    async () => {
      await getInvoiceDetails('invalid-id');
    },
    (err: any) => {
      assert.strictEqual(err.status, 404);
      assert.strictEqual(err.code, 'INVOICE_NOT_FOUND');
      return true;
    }
  );

  await assert.rejects(
    async () => {
      await getInvoiceByToken('invalid-token');
    },
    (err: any) => {
      assert.strictEqual(err.status, 404);
      assert.strictEqual(err.code, 'INVOICE_NOT_FOUND');
      return true;
    }
  );

  // 6. Update Invoice Payment Status
  const updatedInvoice = await updateInvoiceStatus(invoice.id, 'paid', 'eft');
  assert.strictEqual(updatedInvoice.status, 'paid');
  assert.strictEqual(updatedInvoice.payment_method, 'eft');

  // 7. Verify Auto-Generation when Ticket is marked Completed
  const otherTicketId = 't2b07384-d113-49c3-a558-8b9a103c8099';
  const otherTicket = mockTickets.find(t => t.id === otherTicketId);
  if (!otherTicket) {
    // Inject a quick mock ticket if not present
    mockTickets.push({
      id: otherTicketId,
      vehicle_id: 'v7b91d90-b183-4903-8888-0f19c9d09a80',
      staff_id: 'mech-1',
      created_by: 'admin-1',
      status: 'pending',
      description: 'Minor checks',
      notes: '',
      labour_cost: 100.00,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  // Update status to completed
  await updateTicketStatus(otherTicketId, 'completed', 'admin');

  // Assert that an invoice was automatically created for this ticket
  const allInvoices = await listInvoices();
  const autoInvoice = allInvoices.find(inv => inv.ticket_id === otherTicketId);
  assert.ok(autoInvoice, 'Invoice should be auto-created on ticket completion');
  assert.strictEqual(autoInvoice!.status, 'unpaid');
  assert.strictEqual(autoInvoice!.labour_cost, 100.00);

  // Clean up mock array updates
  mockTicketParts.splice(0, mockTicketParts.length); // Clear parts
});
