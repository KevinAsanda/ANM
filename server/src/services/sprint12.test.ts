import test from 'node:test';
import assert from 'node:assert';

// Setup environment for testing mock mode BEFORE importing services
process.env.SUPABASE_URL = 'https://mockproject.supabase.co';

const { clockIn, clockOut, getClockStatus, getPayrollSummary, approveTimesheet, mockTimesheets } = await import('./payroll.service.js');
const { mockStaff } = await import('./staff.service.js');

test('Sprint 12 - Payroll Service: clock-in, clock-out, double clock-in protection, summary, and approvals', async () => {
  // Setup a mock mechanic in mockStaff
  const mechanicId = 'test-mechanic-uuid-123';
  const adminId = 'test-admin-uuid-456';

  // Ensure mechanic exists in mock staff
  mockStaff.push({
    id: mechanicId,
    name: 'Asanda Cele',
    email: 'mechanic@anm.co.za',
    role: 'mechanic',
    created_at: new Date().toISOString(),
    hourly_rate: 100.00 // ZAR 100/hr
  } as any);

  // Clear mockTimesheets
  mockTimesheets.length = 0;

  // 1. Verify initially not clocked in
  const initialStatus = await getClockStatus(mechanicId);
  assert.strictEqual(initialStatus, null);

  // 2. Clock In (Happy path)
  const timesheet = await clockIn(mechanicId);
  assert.strictEqual(timesheet.staff_id, mechanicId);
  assert.strictEqual(timesheet.clock_out, null);
  assert.strictEqual(timesheet.hourly_rate, 100.00);
  assert.strictEqual(timesheet.status, 'submitted');
  assert.ok(timesheet.clock_in);

  // 3. Double Clock In protection (should throw error)
  await assert.rejects(
    async () => {
      await clockIn(mechanicId);
    },
    (err: any) => {
      assert.strictEqual(err.status, 400);
      assert.match(err.message, /already clocked in/i);
      return true;
    }
  );

  // 4. Verify getClockStatus returns the active session
  const statusAfterClockIn = await getClockStatus(mechanicId);
  assert.ok(statusAfterClockIn);
  assert.strictEqual(statusAfterClockIn.id, timesheet.id);

  // 5. Try approving active session (should fail)
  await assert.rejects(
    async () => {
      await approveTimesheet(timesheet.id, adminId);
    },
    (err: any) => {
      assert.strictEqual(err.status, 400);
      assert.match(err.message, /cannot approve an active/i);
      return true;
    }
  );

  // 6. Clock Out (Happy path)
  // To simulate elapsed time, we manually shift the clock_in back by 2 hours in the mock database
  const activeRecord = mockTimesheets.find(t => t.id === timesheet.id);
  if (activeRecord) {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    activeRecord.clock_in = twoHoursAgo;
  }

  const finishedTimesheet = await clockOut(mechanicId);
  assert.ok(finishedTimesheet.clock_out);
  // Should be ~2.00 hours
  assert.ok(finishedTimesheet.hours_worked !== null);
  assert.ok(finishedTimesheet.hours_worked >= 1.9 && finishedTimesheet.hours_worked <= 2.1);
  // ZAR 100 * 2 hours = ZAR 200
  assert.ok(finishedTimesheet.total_pay !== null);
  assert.ok(finishedTimesheet.total_pay >= 190 && finishedTimesheet.total_pay <= 210);

  // 7. Verify current status is now null
  const statusAfterClockOut = await getClockStatus(mechanicId);
  assert.strictEqual(statusAfterClockOut, null);

  // 8. Try clocking out again when no active session exists (should fail)
  await assert.rejects(
    async () => {
      await clockOut(mechanicId);
    },
    (err: any) => {
      assert.strictEqual(err.status, 400);
      assert.match(err.message, /no active clock-in/i);
      return true;
    }
  );

  // 9. Get Payroll Summary
  const summary = await getPayrollSummary(mechanicId);
  assert.strictEqual(summary.length, 1);
  assert.strictEqual(summary[0].id, timesheet.id);

  // 10. Approve Timesheet (Happy path)
  const approved = await approveTimesheet(timesheet.id, adminId);
  assert.strictEqual(approved.status, 'approved');
  assert.strictEqual(approved.approved_by, adminId);
  assert.ok(approved.approved_at);

  // Clean up mockStaff and mockTimesheets
  mockStaff.pop();
  mockTimesheets.length = 0;
});
