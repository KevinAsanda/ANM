import { authService } from './authService.js';
import type { TicketRelation } from './ticketsService.js';
import type { InventoryItem } from './inventoryService.js';

export interface DashboardStats {
  active_jobs: number;
  completed_today: number;
  total_mechanics: number;
  low_stock_count: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

function getHeaders() {
  const token = authService.getCurrentToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      headers: getHeaders()
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to fetch dashboard stats');
    }

    return res.json();
  },

  async getRecentTickets(): Promise<TicketRelation[]> {
    const res = await fetch(`${API_BASE_URL}/dashboard/recent-tickets`, {
      headers: getHeaders()
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to fetch recent tickets');
    }

    return res.json();
  },

  async getLowStockItems(): Promise<InventoryItem[]> {
    const res = await fetch(`${API_BASE_URL}/dashboard/low-stock`, {
      headers: getHeaders()
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to fetch low stock alerts');
    }

    return res.json();
  }
};

export default dashboardService;
