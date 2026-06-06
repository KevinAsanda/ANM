import test from 'node:test';
import assert from 'node:assert';

// Setup environment for testing mock mode BEFORE importing services
process.env.SUPABASE_URL = 'https://mockproject.supabase.co';

const { createMechanic, listStaff, mockStaff } = await import('./staff.service.js');

test('Sprint 7 - Staff Service: create mechanic, prevent duplicates, list staff', async () => {
  // Save initial count
  const initial = await listStaff();
  const initialCount = initial.length;

  const email = `test.mechanic.${Math.floor(1000 + Math.random() * 9000)}@anm.co.za`;

  // 1. Create a new mechanic (Happy path)
  const mechanic = await createMechanic('Test Mechanic', email, 'tempPassword123');
  assert.strictEqual(mechanic.name, 'Test Mechanic');
  assert.strictEqual(mechanic.email, email);
  assert.strictEqual(mechanic.role, 'mechanic');
  assert.ok(mechanic.id);

  // Verify list count increases
  const updated = await listStaff();
  assert.strictEqual(updated.length, initialCount + 1);
  assert.ok(updated.some(s => s.id === mechanic.id));

  // 2. Try creating a mechanic with a duplicate email (should throw 409)
  await assert.rejects(
    async () => {
      await createMechanic('Duplicate Mechanic', email, 'password1234');
    },
    (err: any) => {
      assert.strictEqual(err.status, 409);
      assert.strictEqual(err.code, 'EMAIL_EXISTS');
      assert.match(err.message, /exists/i);
      return true;
    }
  );

  // Clean up mock array
  const index = mockStaff.findIndex(s => s.id === mechanic.id);
  if (index !== -1) mockStaff.splice(index, 1);
});
