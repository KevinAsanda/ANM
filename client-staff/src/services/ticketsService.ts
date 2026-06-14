import { authService } from './authService.js';

export interface TicketRelation {
  id: string;
  status: 'draft' | 'pending' | 'in_progress' | 'completed' | 'cancelled';
  description: string;
  notes: string | null;
  labour_cost: number;
  preferred_date?: string | null;
  preferred_time?: 'morning' | 'afternoon' | null;
  tracking_token?: string;
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
  } | null;
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
  },

  async logPart(ticketId: string, data: { inventory_id: string; qty_used: number }): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/tickets/${ticketId}/parts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to log part on ticket');
    }

    return res.json();
  },

  async getTicketParts(ticketId: string): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/tickets/${ticketId}/parts`, {
      headers: getHeaders()
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to fetch ticket parts');
    }

    return res.json();
  },

  async createBookingRequest(data: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string | null;
    registrationNumber: string;
    make: string;
    model: string;
    year?: number | null;
    description: string;
    preferredDate: string;
    preferredTime: 'morning' | 'afternoon';
  }): Promise<{ message: string; ticketId: string; trackingToken: string; trackingUrl: string }> {
    const res = await fetch(`${API_BASE_URL}/tickets/public/booking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to submit booking request');
    }

    return res.json();
  },

  async getTrackingDetails(trackingToken: string): Promise<{ ticket: TicketRelation; invoice: any | null }> {
    const res = await fetch(`${API_BASE_URL}/tickets/public/track/${trackingToken}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to fetch tracking details');
    }

    return res.json();
  },

  async approveBooking(
    id: string,
    data: { staffId: string; labourCost: number }
  ): Promise<{ message: string; ticket: TicketRelation }> {
    const res = await fetch(`${API_BASE_URL}/tickets/${id}/approve`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to approve booking request');
    }

    return res.json();
  },

  async sendTrackingEmail(id: string): Promise<{ success: boolean; message: string; recipient: string }> {
    const res = await fetch(`${API_BASE_URL}/tickets/${id}/send-tracking-email`, {
      method: 'POST',
      headers: getHeaders()
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to send tracking email');
    }

    return res.json();
  },

  async getAIDiagnostics(ticketId: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/tickets/${ticketId}/ai-diagnostics`, {
      method: 'POST',
      headers: getHeaders()
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to generate AI diagnostics');
    }

    return res.json();
  },

  async updateAIChecklist(ticketId: string, checklist: any[]): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/tickets/${ticketId}/ai-diagnostics/checklist`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ checklist })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to update diagnostic checklist');
    }

    return res.json();
  }
};
