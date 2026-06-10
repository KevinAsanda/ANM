import { authService } from './authService.js';

export interface Invoice {
  id: string;
  ticket_id: string;
  invoice_no: string;
  labour_cost: number;
  parts_cost: number;
  tax_amount: number;
  total_amount: number;
  status: 'unpaid' | 'paid' | 'void';
  payment_method: 'cash' | 'card' | 'eft' | null;
  secure_token: string;
  created_at: string;
  updated_at: string;
  ticket?: {
    id: string;
    description: string;
    labour_cost: number;
    created_at: string;
    notes: string | null;
    vehicle?: {
      registration_number: string;
      make: string;
      model: string;
      year: number | null;
      customer?: {
        name: string;
        phone: string;
        email: string | null;
      };
    };
    ticket_parts?: {
      id: string;
      qty_used: number;
      unit_cost_at_time: number;
      inventory: {
        part_name: string;
        part_number: string | null;
      };
    }[];
  };
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

function getHeaders() {
  const token = authService.getCurrentToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export const invoiceService = {
  async getInvoices(status?: string): Promise<Invoice[]> {
    const url = status 
      ? `${API_BASE_URL}/invoices?status=${status}` 
      : `${API_BASE_URL}/invoices`;

    const res = await fetch(url, {
      headers: getHeaders()
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to fetch invoices');
    }

    return res.json();
  },

  async getInvoice(id: string): Promise<Invoice> {
    const res = await fetch(`${API_BASE_URL}/invoices/${id}`, {
      headers: getHeaders()
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to fetch invoice details');
    }

    return res.json();
  },

  async getPublicInvoice(token: string): Promise<Invoice> {
    // Public endpoint does not require authorization header
    const res = await fetch(`${API_BASE_URL}/invoices/public/${token}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to fetch public invoice details');
    }

    return res.json();
  },

  async createInvoice(ticketId: string, customLabour?: number): Promise<Invoice> {
    const res = await fetch(`${API_BASE_URL}/invoices`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        ticket_id: ticketId,
        labour_cost: customLabour
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to generate invoice');
    }

    return res.json();
  },

  async updateInvoiceStatus(
    id: string,
    status: 'unpaid' | 'paid' | 'void',
    paymentMethod?: 'cash' | 'card' | 'eft' | null
  ): Promise<Invoice> {
    const res = await fetch(`${API_BASE_URL}/invoices/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({
        status,
        payment_method: paymentMethod
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to update invoice status');
    }

    return res.json();
  }
};

export default invoiceService;
