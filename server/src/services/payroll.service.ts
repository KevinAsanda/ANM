import { supabase } from '../config/supabase.js';
import { mockStaff } from './staff.service.js';

export interface Timesheet {
  id: string;
  staff_id: string;
  clock_in: string;
  clock_out: string | null;
  hours_worked: number | null;
  hourly_rate: number;
  total_pay: number | null;
  status: 'submitted' | 'approved' | 'paid';
  approved_by: string | null;
  approved_at: string | null;
  // Join fields for frontend
  staff_name?: string;
  staff_email?: string;
}

const isMockMode = process.env.SUPABASE_URL?.includes('mockproject.supabase.co');

// In-memory mock database for timesheets
export let mockTimesheets: Timesheet[] = [];

// Helper to calculate hours worked between two dates rounded to 2 decimals
function calculateHours(start: string, end: string): number {
  const diffMs = new Date(end).getTime() - new Date(start).getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return Math.max(0, Math.round(diffHours * 100) / 100);
}

// 1. Clock In
export async function clockIn(staffId: string): Promise<Timesheet> {
  if (isMockMode) {
    // Check if already clocked in
    const active = mockTimesheets.find(t => t.staff_id === staffId && t.clock_out === null);
    if (active) {
      const error = new Error('You are already clocked in.') as any;
      error.status = 400;
      throw error;
    }

    // Get staff profile for hourly rate
    const staff = mockStaff.find(s => s.id === staffId) as any;
    const rate = staff?.hourly_rate ?? 85.00;

    const record: Timesheet = {
      id: crypto.randomUUID(),
      staff_id: staffId,
      clock_in: new Date().toISOString(),
      clock_out: null,
      hours_worked: null,
      hourly_rate: rate,
      total_pay: null,
      status: 'submitted',
      approved_by: null,
      approved_at: null,
      staff_name: staff?.name || 'Unknown Mechanic',
      staff_email: staff?.email || ''
    };

    mockTimesheets.push(record);
    return record;
  }

  // Real Supabase mode
  // Check active session
  const { data: active, error: activeError } = await supabase
    .from('timesheets')
    .select('id')
    .eq('staff_id', staffId)
    .is('clock_out', null)
    .maybeSingle();

  if (activeError) throw activeError;
  if (active) {
    const error = new Error('You are already clocked in.') as any;
    error.status = 400;
    throw error;
  }

  // Get staff hourly rate
  const { data: staff, error: staffError } = await supabase
    .from('staff')
    .select('hourly_rate')
    .eq('id', staffId)
    .single();

  if (staffError) throw staffError;
  const rate = staff?.hourly_rate ?? 85.00;

  const { data, error } = await supabase
    .from('timesheets')
    .insert({
      staff_id: staffId,
      clock_in: new Date().toISOString(),
      hourly_rate: rate,
      status: 'submitted'
    })
    .select()
    .single();

  if (error) throw error;
  return data as Timesheet;
}

// 2. Clock Out
export async function clockOut(staffId: string): Promise<Timesheet> {
  const nowStr = new Date().toISOString();

  if (isMockMode) {
    const activeIndex = mockTimesheets.findIndex(t => t.staff_id === staffId && t.clock_out === null);
    if (activeIndex === -1) {
      const error = new Error('No active clock-in session found.') as any;
      error.status = 400;
      throw error;
    }

    const active = mockTimesheets[activeIndex];
    const hours = calculateHours(active.clock_in, nowStr);
    const pay = Math.round(hours * active.hourly_rate * 100) / 100;

    const updated: Timesheet = {
      ...active,
      clock_out: nowStr,
      hours_worked: hours,
      total_pay: pay
    };

    mockTimesheets[activeIndex] = updated;
    return updated;
  }

  // Real Supabase mode
  // Get active session
  const { data: active, error: activeError } = await supabase
    .from('timesheets')
    .select('*')
    .eq('staff_id', staffId)
    .is('clock_out', null)
    .maybeSingle();

  if (activeError) throw activeError;
  if (!active) {
    const error = new Error('No active clock-in session found.') as any;
    error.status = 400;
    throw error;
  }

  const hours = calculateHours(active.clock_in, nowStr);
  const pay = Math.round(hours * active.hourly_rate * 100) / 100;

  const { data, error } = await supabase
    .from('timesheets')
    .update({
      clock_out: nowStr,
      hours_worked: hours,
      total_pay: pay
    })
    .eq('id', active.id)
    .select()
    .single();

  if (error) throw error;
  return data as Timesheet;
}

// 3. Get Current Clock-In Status
export async function getClockStatus(staffId: string): Promise<Timesheet | null> {
  if (isMockMode) {
    const active = mockTimesheets.find(t => t.staff_id === staffId && t.clock_out === null);
    return active || null;
  }

  const { data, error } = await supabase
    .from('timesheets')
    .select('*')
    .eq('staff_id', staffId)
    .is('clock_out', null)
    .maybeSingle();

  if (error) throw error;
  return data as Timesheet | null;
}

// 4. Get Payroll Summary logs
export async function getPayrollSummary(staffId?: string): Promise<Timesheet[]> {
  if (isMockMode) {
    if (staffId) {
      return mockTimesheets.filter(t => t.staff_id === staffId);
    }
    return mockTimesheets;
  }

  // Real Supabase mode
  let query = supabase
    .from('timesheets')
    .select(`
      *,
      staff:staff_id (name, email)
    `)
    .order('clock_in', { ascending: false });

  if (staffId) {
    query = query.eq('staff_id', staffId);
  }

  const { data, error } = await query;
  if (error) throw error;

  // Flatten the staff relation fields for easier usage
  return (data || []).map((t: any) => ({
    ...t,
    staff_name: t.staff?.name || 'Unknown Staff',
    staff_email: t.staff?.email || ''
  })) as Timesheet[];
}

// 5. Approve Timesheet log
export async function approveTimesheet(timesheetId: string, adminId: string): Promise<Timesheet> {
  const nowStr = new Date().toISOString();

  if (isMockMode) {
    const index = mockTimesheets.findIndex(t => t.id === timesheetId);
    if (index === -1) {
      const error = new Error('Timesheet not found.') as any;
      error.status = 404;
      throw error;
    }

    const record = mockTimesheets[index];
    if (record.clock_out === null) {
      const error = new Error('Cannot approve an active clock-in session.') as any;
      error.status = 400;
      throw error;
    }

    const updated: Timesheet = {
      ...record,
      status: 'approved',
      approved_by: adminId,
      approved_at: nowStr
    };

    mockTimesheets[index] = updated;
    return updated;
  }

  // Real Supabase mode
  // Fetch record to check clock_out is set
  const { data: record, error: fetchError } = await supabase
    .from('timesheets')
    .select('clock_out')
    .eq('id', timesheetId)
    .single();

  if (fetchError) throw fetchError;
  if (!record.clock_out) {
    const error = new Error('Cannot approve an active clock-in session.') as any;
    error.status = 400;
    throw error;
  }

  const { data, error } = await supabase
    .from('timesheets')
    .update({
      status: 'approved',
      approved_by: adminId,
      approved_at: nowStr
    })
    .eq('id', timesheetId)
    .select()
    .single();

  if (error) throw error;
  return data as Timesheet;
}
