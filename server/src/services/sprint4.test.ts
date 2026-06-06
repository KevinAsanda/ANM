import test from 'node:test';
import assert from 'node:assert';
import { listInventory, addPart, updatePart } from './inventory.service.js';

// Setup environment for testing mock mode
process.env.SUPABASE_URL = 'https://mockproject.supabase.co';

test('Sprint 4 - Inventory Service: list, add, duplicate-check, update', async () => {
  // 1. List initial inventory
  const initial = await listInventory();
  assert.strictEqual(initial.length >= 12, true); // Seed data has 12 items

  // 2. List low-stock items
  const lowStock = await listInventory(true);
  assert.strictEqual(lowStock.length > 0, true);
  // Ensure all returned items are actually at or below reorder level
  for (const item of lowStock) {
    assert.strictEqual(item.qty_in_stock <= item.reorder_level, true);
  }

  // 3. Add a new part
  const uniquePartNum = `PART-${Math.floor(1000 + Math.random() * 9000)}`;
  const item = await addPart('Spark Plugs (Set of 6)', uniquePartNum, 10, 3, 220.00);
  assert.strictEqual(item.part_name, 'Spark Plugs (Set of 6)');
  assert.strictEqual(item.part_number, uniquePartNum);
  assert.strictEqual(item.qty_in_stock, 10);
  assert.strictEqual(item.reorder_level, 3);
  assert.strictEqual(item.unit_cost, 220.00);

  // 4. Try adding duplicate part number (should throw 409)
  await assert.rejects(
    async () => {
      await addPart('Different Name', uniquePartNum, 5, 2, 100.00);
    },
    (err: any) => {
      assert.strictEqual(err.status, 409);
      assert.strictEqual(err.code, 'PART_NUMBER_EXISTS');
      return true;
    }
  );

  // 5. Update part
  const updated = await updatePart(item.id, {
    qty_in_stock: 15,
    unit_cost: 250.00
  });
  assert.strictEqual(updated.qty_in_stock, 15);
  assert.strictEqual(updated.unit_cost, 250.00);
  assert.strictEqual(updated.reorder_level, 3); // unchanged
});
