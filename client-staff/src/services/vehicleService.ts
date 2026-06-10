import { authService } from './authService.js';

export interface Vehicle {
  id: string;
  customer_id: string;
  registration_number: string;
  vin: string | null;
  make: string;
  model: string;
  year: number | null;
  created_at: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

function getHeaders() {
  const token = authService.getCurrentToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export const vehicleService = {
  async getCustomerVehicles(customerId: string): Promise<Vehicle[]> {
    const res = await fetch(`${API_BASE_URL}/customers/${customerId}/vehicles`, {
      headers: getHeaders()
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to fetch customer vehicles');
    }

    return res.json();
  },

  async createVehicle(data: {
    customer_id: string;
    registration_number: string;
    make: string;
    model: string;
    vin?: string;
    year?: number | null;
  }): Promise<Vehicle> {
    const res = await fetch(`${API_BASE_URL}/vehicles`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to register vehicle');
    }

    return res.json();
  }
};
export default vehicleService;
