import test from 'node:test';
import assert from 'node:assert';
import { createOrGetCustomer, listCustomers } from './customer.service.js';
import { createVehicle, listVehiclesByCustomer } from './vehicle.service.js';

// Setup environment for testing mock mode
process.env.SUPABASE_URL = 'https://mockproject.supabase.co';

test('Sprint 2 - Customer Service: list and create', async () => {
  // 1. List initial customers
  const initial = await listCustomers();
  assert.strictEqual(initial.length >= 2, true);

  // 2. Create a new unique customer
  const uniquePhone = `084${Math.floor(1000000 + Math.random() * 9000000)}`;
  const { customer, deduplicated } = await createOrGetCustomer('Joe Soap', uniquePhone, 'joe@soap.com');
  
  assert.strictEqual(deduplicated, false);
  assert.strictEqual(customer.name, 'Joe Soap');
  assert.strictEqual(customer.phone, uniquePhone);

  // 3. Try creating the same customer again (deduplication)
  const result = await createOrGetCustomer('Joe Soap Updated', uniquePhone, 'joe.soap@other.com');
  assert.strictEqual(result.deduplicated, true);
  assert.strictEqual(result.customer.id, customer.id);
  assert.strictEqual(result.customer.name, 'Joe Soap'); // should reuse original record
});

test('Sprint 2 - Vehicle Service: list, create and duplicate check', async () => {
  const customerId = 'c1f7b03b-1798-444a-a435-08103cd585e5'; // Sipho

  // 1. List vehicles for Sipho
  const SiphoVehicles = await listVehiclesByCustomer(customerId);
  assert.strictEqual(SiphoVehicles.length >= 1, true);
  assert.strictEqual(SiphoVehicles[0].registration_number, 'ND123456');

  // 2. Add a new vehicle for Sipho
  const newReg = `N${Math.floor(100000 + Math.random() * 900000)}`;
  const vehicle = await createVehicle(customerId, newReg, '1234567890123', 'Toyota', 'Corolla', 2020);

  assert.strictEqual(vehicle.customer_id, customerId);
  assert.strictEqual(vehicle.registration_number, newReg);
  assert.strictEqual(vehicle.make, 'Toyota');
  assert.strictEqual(vehicle.model, 'Corolla');
  assert.strictEqual(vehicle.year, 2020);

  // 3. Try to add a vehicle with a duplicate registration number (should throw 409)
  await assert.rejects(
    async () => {
      await createVehicle(customerId, newReg, 'some-vin', 'Ford', 'Ranger', 2022);
    },
    (err: any) => {
      assert.strictEqual(err.status, 409);
      assert.strictEqual(err.code, 'REGISTRATION_NUMBER_EXISTS');
      return true;
    }
  );
});
