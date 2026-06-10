import { authService } from './authService.js';

export interface InventoryItem {
  id: string;
  part_name: string;
  part_number: string | null;
  qty_in_stock: number;
  reorder_level: number;
  unit_cost: number | null;
  created_at: string;
  updated_at: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

function getHeaders() {
  const token = authService.getCurrentToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export const inventoryService = {
  async getInventory(lowStock?: boolean): Promise<InventoryItem[]> {
    const url = new URL(`${API_BASE_URL}/inventory`);
    if (lowStock) {
      url.searchParams.append('low_stock', 'true');
    }

    const res = await fetch(url.toString(), {
      headers: getHeaders()
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to fetch inventory');
    }

    return res.json();
  },

  async addPart(data: {
    part_name: string;
    part_number?: string;
    qty_in_stock: number;
    reorder_level: number;
    unit_cost?: number | null;
  }): Promise<InventoryItem> {
    const res = await fetch(`${API_BASE_URL}/inventory`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to add part to inventory');
    }

    return res.json();
  },

  async updatePart(
    id: string,
    data: {
      part_name?: string;
      qty_in_stock?: number;
      reorder_level?: number;
      unit_cost?: number | null;
    }
  ): Promise<InventoryItem> {
    const res = await fetch(`${API_BASE_URL}/inventory/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to update part');
    }

    return res.json();
  }
};
export default inventoryService;
