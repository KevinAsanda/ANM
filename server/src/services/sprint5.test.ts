import test from 'node:test';
import assert from 'node:assert';
import { logPartOnTicket, getTicketParts, getTicketDetails, mockTicketParts } from './ticket.service.js';
import { listInventory } from './inventory.service.js';

// Setup environment for testing mock mode
process.env.SUPABASE_URL = 'https://mockproject.supabase.co';

test('Sprint 5 - Parts Logging Service: log part, decrement inventory, validation, authorization', async () => {
  // Clear any existing mock ticket parts
  mockTicketParts.length = 0;

  const ticketId = 't1b07384-d113-49c3-a558-8b9a103c8099'; // assigned to mechanic 'f5f7b03b-1798-444a-a435-08103cd58522' (Asanda Cele)
  const assignedMechanicId = 'f5f7b03b-1798-444a-a435-08103cd58522';
  const otherMechanicId = 'd3b07384-d113-49c3-a558-8b9a103c802f'; // dummy other mechanic ID
  const adminId = 'd3b07384-d113-49c3-a558-8b9a103c801e'; // Mpume Zulu
  const partId = 'i001'; // Oil Filter, has 15 in stock (seed)

  // Fetch initial inventory quantity of part i001
  const initialInventory = await listInventory();
  const oilFilter = initialInventory.find(i => i.id === partId);
  assert.ok(oilFilter);
  const initialStock = oilFilter.qty_in_stock;

  // 1. Log part: Happy path (assigned mechanic logs 2 oil filters)
  const log1 = await logPartOnTicket(ticketId, partId, 2, assignedMechanicId, 'mechanic');
  assert.strictEqual(log1.ticket_id, ticketId);
  assert.strictEqual(log1.inventory_id, partId);
  assert.strictEqual(log1.qty_used, 2);
  assert.strictEqual(log1.logged_by, assignedMechanicId);
  assert.strictEqual(log1.unit_cost_at_time, 45.00); // Oil filter cost is 45.00

  // Verify stock decremented
  const inventoryAfterLog1 = await listInventory();
  const oilFilterAfter1 = inventoryAfterLog1.find(i => i.id === partId);
  assert.strictEqual(oilFilterAfter1!.qty_in_stock, initialStock - 2);

  // 2. Log part: Happy path (admin logs 1 oil filter)
  const log2 = await logPartOnTicket(ticketId, partId, 1, adminId, 'admin');
  assert.strictEqual(log2.qty_used, 1);
  assert.strictEqual(log2.logged_by, adminId);

  // Verify stock decremented again
  const inventoryAfterLog2 = await listInventory();
  const oilFilterAfter2 = inventoryAfterLog2.find(i => i.id === partId);
  assert.strictEqual(oilFilterAfter2!.qty_in_stock, initialStock - 3);

  // 3. Log part: Authorization check (unassigned mechanic tries to log part)
  await assert.rejects(
    async () => {
      await logPartOnTicket(ticketId, partId, 1, otherMechanicId, 'mechanic');
    },
    (err: any) => {
      assert.strictEqual(err.status, 403);
      assert.strictEqual(err.code, 'FORBIDDEN');
      assert.match(err.message, /permission/);
      return true;
    }
  );

  // 4. Log part: Insufficient stock error (try to log 100 oil filters)
  await assert.rejects(
    async () => {
      await logPartOnTicket(ticketId, partId, 100, adminId, 'admin');
    },
    (err: any) => {
      assert.strictEqual(err.status, 400);
      assert.strictEqual(err.code, 'INSUFFICIENT_STOCK');
      assert.match(err.message, /Insufficient stock/);
      return true;
    }
  );

  // 5. Get logged parts
  const partsList = await getTicketParts(ticketId, assignedMechanicId, 'mechanic');
  assert.strictEqual(partsList.length, 2);
  assert.strictEqual(partsList[0].part_name, 'Oil Filter');
  assert.strictEqual(partsList[0].qty_used, 2);
  assert.strictEqual(partsList[0].logged_by_name, 'Asanda Cele');

  const adminPartsList = await getTicketParts(ticketId, adminId, 'admin');
  assert.strictEqual(adminPartsList.length, 2);

  // Unassigned mechanic trying to get parts should fail
  await assert.rejects(
    async () => {
      await getTicketParts(ticketId, otherMechanicId, 'mechanic');
    },
    (err: any) => {
      assert.strictEqual(err.status, 403);
      assert.strictEqual(err.code, 'FORBIDDEN');
      return true;
    }
  );

  // 6. Get ticket details should now include parts_used
  const ticketDetails = await getTicketDetails(ticketId);
  assert.ok(ticketDetails.parts_used);
  assert.strictEqual(ticketDetails.parts_used.length, 2);
  assert.strictEqual(ticketDetails.parts_used[0].part_name, 'Oil Filter');
});
