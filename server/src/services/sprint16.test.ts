import test from 'node:test';
import assert from 'node:assert';

// Setup environment for testing mock mode BEFORE importing services
process.env.SUPABASE_URL = 'https://mockproject.supabase.co';

const { getAIBookingClassification } = await import('./ai.service.js');

test('Sprint 16 - Smart Booking Assistant & Service Categorizer', async () => {
  // 1. Test with brake symptoms
  const brakesResult = await getAIBookingClassification('My front wheels squeal and grind when braking.');
  
  assert.ok(brakesResult, 'Classification result should exist');
  assert.strictEqual(brakesResult.suggested_category, 'Brakes & Braking System', 'Should classify brake symptoms correctly');
  assert.ok(brakesResult.estimated_duration_hours > 0, 'Should return a positive duration estimate');
  assert.ok(brakesResult.reasoning, 'Should return reasoning');

  // 2. Test with oil/filter symptoms
  const oilResult = await getAIBookingClassification('Requesting an engine oil change and new air filter.');
  
  assert.ok(oilResult, 'Classification result should exist');
  assert.strictEqual(oilResult.suggested_category, 'Oil & Filter Service', 'Should classify maintenance symptoms correctly');

  // 3. Test with general/unknown symptoms
  const generalResult = await getAIBookingClassification('Odd rattling under the seat somewhere.');
  
  assert.ok(generalResult, 'Classification result should exist');
  assert.ok(generalResult.suggested_category, 'Should fallback to a general category');
  assert.ok(generalResult.estimated_duration_hours > 0, 'Should estimate duration');

  console.log('[Test] Sprint 16 Booking Assistant assertions passed successfully.');
});
