import { authService } from './authService.js';

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
  staff_name?: string;
  staff_email?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

function getHeaders() {
  const token = authService.getCurrentToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export const payrollService = {
  // 1. Clock In
  async clockIn(): Promise<Timesheet> {
    const res = await fetch(`${API_BASE_URL}/payroll/clock-in`, {
      method: 'POST',
      headers: getHeaders()
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to clock in');
    }

    return res.json();
  },

  // 2. Clock Out
  async clockOut(): Promise<Timesheet> {
    const res = await fetch(`${API_BASE_URL}/payroll/clock-out`, {
      method: 'POST',
      headers: getHeaders()
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to clock out');
    }

    return res.json();
  },

  // 3. Get Clock Status
  async getClockStatus(): Promise<Timesheet | null> {
    const res = await fetch(`${API_BASE_URL}/payroll/status`, {
      headers: getHeaders()
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to retrieve clock-in status');
    }

    return res.json();
  },

  // 4. Get Payroll logs
  async getPayrollSummary(staffId?: string): Promise<Timesheet[]> {
    const url = staffId
      ? `${API_BASE_URL}/payroll/summary?staff_id=${staffId}`
      : `${API_BASE_URL}/payroll/summary`;

    const res = await fetch(url, {
      headers: getHeaders()
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to fetch payroll summary logs');
    }

    return res.json();
  },

  // 5. Approve Timesheet log
  async approveTimesheet(timesheetId: string): Promise<Timesheet> {
    const res = await fetch(`${API_BASE_URL}/payroll/${timesheetId}/approve`, {
      method: 'PATCH',
      headers: getHeaders()
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to approve timesheet record');
    }

    return res.json();
  }
};

export default payrollService;
