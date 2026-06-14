import test from 'node:test';
import assert from 'node:assert';

// Setup environment for testing mock mode BEFORE importing services
process.env.SUPABASE_URL = 'https://mockproject.supabase.co';

const { 
  generateTicketDiagnostics, 
  updateTicketDiagnosticsChecklist, 
  getTicketDetails, 
  mockTickets 
} = await import('./ticket.service.js');

test('Sprint 15 - AI-Powered Repair Diagnostics & Interactive Checklist', async () => {
  // Find a mock ticket to test with, or add one if empty
  const ticketId = 't001'; // Default mock ticket id in seed
  
  // Ensure the mock ticket exists and reset any diagnostics
  let mockTicket = mockTickets.find(t => t.id === ticketId);
  if (!mockTicket) {
    mockTicket = {
      id: ticketId,
      vehicle_id: 'v001',
      staff_id: 'm001',
      created_by: 'a001',
      status: 'pending',
      description: 'Vehicle squeals when applying brakes at low speed.',
      notes: null,
      labour_cost: 250.00,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockTickets.push(mockTicket);
  }
  delete mockTicket.ai_diagnostics;

  // 1. Test generateTicketDiagnostics
  const diagnostics = await generateTicketDiagnostics(ticketId);

  // Assertions on schema structure
  assert.ok(diagnostics, 'Diagnostics object should exist');
  assert.ok(Array.isArray(diagnostics.causes), 'causes should be an array');
  assert.ok(Array.isArray(diagnostics.checklist), 'checklist should be an array');
  assert.ok(Array.isArray(diagnostics.suggested_parts), 'suggested_parts should be an array');

  assert.ok(diagnostics.causes.length > 0, 'Should return at least one cause');
  assert.ok(diagnostics.checklist.length > 0, 'Should return at least one checklist step');
  
  // Verify checklist items schema
  const firstItem = diagnostics.checklist[0];
  assert.ok(firstItem.id, 'Checklist item should have an id');
  assert.ok(firstItem.text, 'Checklist item should have text');
  assert.strictEqual(firstItem.checked, false, 'Checklist item should be unchecked by default');

  // 2. Test updateTicketDiagnosticsChecklist
  // Check the first item
  const updatedChecklist = [...diagnostics.checklist];
  updatedChecklist[0] = { ...updatedChecklist[0], checked: true };

  const updatedDiagnostics = await updateTicketDiagnosticsChecklist(ticketId, updatedChecklist);
  
  // Verify that it updated
  assert.strictEqual(updatedDiagnostics.checklist[0].checked, true, 'Checklist item state should update to checked');
  
  // 3. Test persistence on fetch
  const refetchedTicket = await getTicketDetails(ticketId);
  assert.ok(refetchedTicket.ai_diagnostics, 'Refetched ticket should contain ai_diagnostics');
  assert.strictEqual(refetchedTicket.ai_diagnostics.checklist[0].checked, true, 'Checked state should persist on ticket details reload');

  console.log('[Test] Sprint 15 Diagnostics assertions passed successfully.');
});
