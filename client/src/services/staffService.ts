import { authService } from './authService.js';

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'mechanic';
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

export const staffService = {
  async getStaff(): Promise<Staff[]> {
    const res = await fetch(`${API_BASE_URL}/staff`, {
      headers: getHeaders()
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to fetch staff directory');
    }

    return res.json();
  }
};
export default staffService;
