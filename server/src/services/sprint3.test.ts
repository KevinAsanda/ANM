import test from 'node:test';
import assert from 'node:assert';
// Setup environment for testing mock mode
process.env.SUPABASE_URL = 'https://mockproject.supabase.co';

const {
  listTickets,
  listMechanicTickets,
  createTicket,
  getTicketDetails,
  updateTicketStatus,
  updateTicketNotes
} = await import('./ticket.service.js');

test('Sprint 3 - Ticket Service: list, create, detail, status/notes update', async () => {
  const mechanicId = 'f5f7b03b-1798-444a-a435-08103cd58522'; // Asanda Cele
  const adminId = 'd3b07384-d113-49c3-a558-8b9a103c801e'; // Mpume Zulu
  const vehicleId = 'v7b91d90-b183-4903-8888-0f19c9d09a80'; // Toyota Hilux

  // 1. List initial tickets
  const initial = await listTickets();
  assert.strictEqual(initial.length >= 1, true);

  // 2. Create a new ticket
  const ticket = await createTicket(vehicleId, mechanicId, adminId, 'Change air filters and wipers', 150.00);
  assert.strictEqual(ticket.status, 'pending');
  assert.strictEqual(ticket.description, 'Change air filters and wipers');
  assert.strictEqual(ticket.labour_cost, 150.00);

  // 3. Get ticket details
  const details = await getTicketDetails(ticket.id);
  assert.strictEqual(details.id, ticket.id);
  assert.strictEqual(details.vehicle?.registration_number, 'ND123456');
  assert.strictEqual(details.customer?.name, 'Sipho Khumalo');

  // 4. List mechanic's tickets
  const mechanicJobs = await listMechanicTickets(mechanicId);
  const found = mechanicJobs.some(t => t.id === ticket.id);
  assert.strictEqual(found, true);

  // 5. Update status: Pending -> In Progress (mechanic role)
  const updated = await updateTicketStatus(ticket.id, 'in_progress', 'mechanic', mechanicId);
  assert.strictEqual(updated.status, 'in_progress');

  // 6. Update status: try to cancel as a mechanic (should fail with 403)
  await assert.rejects(
    async () => {
      await updateTicketStatus(ticket.id, 'cancelled', 'mechanic', mechanicId);
    },
    (err: any) => {
      assert.strictEqual(err.status, 403);
      assert.strictEqual(err.code, 'FORBIDDEN');
      return true;
    }
  );

  // 7. Update status: cancel as admin (should succeed)
  const cancelled = await updateTicketStatus(ticket.id, 'cancelled', 'admin');
  assert.strictEqual(cancelled.status, 'cancelled');

  // 8. Update notes as admin
  const notesUpdated = await updateTicketNotes(ticket.id, 'Customer requested premium wipers.');
  assert.strictEqual(notesUpdated.notes, 'Customer requested premium wipers.');
});
