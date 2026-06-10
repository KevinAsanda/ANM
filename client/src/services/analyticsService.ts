import { authService } from './authService.js';

export interface FinancialStatsSummary {
  gross_revenue: number;
  labor_revenue: number;
  parts_revenue: number;
  vat_collected: number;
  total_paid_invoices: number;
}

export interface MonthlyTrendItem {
  month: string;
  labor: number;
  parts: number;
  total: number;
}

export interface TechnicianPerformanceItem {
  id: string;
  name: string;
  tickets_completed: number;
  labor_revenue: number;
  parts_value: number;
}

export interface FinancialAnalyticsReport {
  summary: FinancialStatsSummary;
  monthly_trends: MonthlyTrendItem[];
  technicians: TechnicianPerformanceItem[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

function getHeaders() {
  const token = authService.getCurrentToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export const analyticsService = {
  async getFinancials(range: '30_days' | '90_days' | 'year_to_date' = '30_days'): Promise<FinancialAnalyticsReport> {
    const res = await fetch(`${API_BASE_URL}/analytics/financials?range=${range}`, {
      headers: getHeaders()
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to fetch financial reports');
    }

    return res.json();
  }
};

export default analyticsService;
