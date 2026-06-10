import { authService } from './authService.js';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  created_at: string;
}

export interface CustomerCreateResult {
  customer: Customer;
  deduplicated: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

function getHeaders() {
  const token = authService.getCurrentToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export const customerService = {
  async getCustomers(): Promise<Customer[]> {
    const res = await fetch(`${API_BASE_URL}/customers`, {
      headers: getHeaders()
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to fetch customers');
    }

    return res.json();
  },

  async createCustomer(data: { name: string; phone: string; email?: string }): Promise<CustomerCreateResult> {
    const res = await fetch(`${API_BASE_URL}/customers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to create customer');
    }

    return res.json();
  }
};
export default customerService;
