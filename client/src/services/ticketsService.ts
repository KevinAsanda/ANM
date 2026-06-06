import { authService } from './authService.js';

export interface TicketRelation {
  id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  description: string;
  notes: string | null;
  labour_cost: number;
  created_at: string;
  updated_at: string;
  vehicle?: {
    id: string;
    registration_number: string;
    make: string;
    model: string;
    year: number | null;
  };
  customer?: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
  };
  mechanic?: {
    id: string;
    name: string;
    email: string;
  };
  parts_used?: Array<{
    id: string;
    part_name: string;
    qty_used: number;
    unit_cost_at_time: number;
    logged_by_name: string;
    created_at: string;
  }>;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

function getHeaders() {
  const token = authService.getCurrentToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export const ticketsService = {
  async getTickets(status?: string): Promise<TicketRelation[]> {
    const url = new URL(`${API_BASE_URL}/tickets`);
    if (status) {
      url.searchParams.append('status', status);
    }

    const res = await fetch(url.toString(), {
      headers: getHeaders()
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to fetch tickets');
    }

    return res.json();
  },

  async getMyJobs(): Promise<TicketRelation[]> {
    const res = await fetch(`${API_BASE_URL}/tickets/my-jobs`, {
      headers: getHeaders()
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to fetch your jobs');
    }

    return res.json();
  },

  async getTicket(id: string): Promise<TicketRelation> {
    const res = await fetch(`${API_BASE_URL}/tickets/${id}`, {
      headers: getHeaders()
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const error = new Error(errData.message || 'Failed to fetch ticket details') as any;
      error.status = res.status;
      error.code = errData.error || 'FETCH_FAILED';
      throw error;
    }

    return res.json();
  },

  async createTicket(data: {
    vehicle_id: string;
    staff_id: string;
    description: string;
    labour_cost?: number;
  }): Promise<TicketRelation> {
    const res = await fetch(`${API_BASE_URL}/tickets`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to create service ticket');
    }

    return res.json();
  },

  async updateTicketStatus(id: string, status: string): Promise<{ id: string; status: string; updated_at: string }> {
    const res = await fetch(`${API_BASE_URL}/tickets/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to update status');
    }

    return res.json();
  },

  async updateTicketNotes(id: string, notes: string): Promise<{ id: string; notes: string; updated_at: string }> {
    const res = await fetch(`${API_BASE_URL}/tickets/${id}/notes`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ notes })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to update notes');
    }

    return res.json();
  }
};
