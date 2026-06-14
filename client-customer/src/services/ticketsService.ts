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
  ai_diagnostics?: any;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

export const ticketsService = {
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
    aiDiagnostics?: {
      suggested_category: string;
      estimated_duration_hours: number;
      reasoning: string;
    } | null;
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

  async classifyBookingSymptoms(symptoms: string): Promise<{ suggested_category: string; estimated_duration_hours: number; reasoning: string }> {
    const res = await fetch(`${API_BASE_URL}/tickets/public/booking/ai-classify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ symptoms })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to classify symptoms');
    }

    return res.json();
  }
};
