import { supabase } from '../config/supabase.js';
import { mockInvoices } from './invoice.service.js';
import { mockTickets } from './ticket.service.js';
import { mockStaff } from './staff.service.js';

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

const isMockMode = process.env.SUPABASE_URL?.includes('mockproject.supabase.co');

export async function getFinancialAnalytics(range: string = '30_days'): Promise<FinancialAnalyticsReport> {
  if (isMockMode) {
    return getMockFinancialAnalytics(range);
  }

  // 1. Calculate Summary KPIs
  // Filter invoices based on date range if required, but for simple MVP let's sum paid invoices
  let query = supabase
    .from('invoices')
    .select('labour_cost, parts_cost, tax_amount, total_amount')
    .eq('status', 'paid');

  const now = new Date();
  if (range === '30_days') {
    const minDate = new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString();
    query = query.gte('created_at', minDate);
  } else if (range === '90_days') {
    const minDate = new Date(now.getTime() - 90 * 24 * 3600 * 1000).toISOString();
    query = query.gte('created_at', minDate);
  } else if (range === 'year_to_date') {
    const minDate = new Date(now.getFullYear(), 0, 1).toISOString();
    query = query.gte('created_at', minDate);
  }

  const { data: invoices, error: invError } = await query;
  if (invError) throw invError;

  let gross_revenue = 0;
  let labor_revenue = 0;
  let parts_revenue = 0;
  let vat_collected = 0;

  if (invoices) {
    for (const inv of invoices) {
      gross_revenue += Number(inv.total_amount);
      labor_revenue += Number(inv.labour_cost);
      parts_revenue += Number(inv.parts_cost);
      vat_collected += Number(inv.tax_amount);
    }
  }

  const summary: FinancialStatsSummary = {
    gross_revenue,
    labor_revenue,
    parts_revenue,
    vat_collected,
    total_paid_invoices: invoices ? invoices.length : 0
  };

  // 2. Fetch Monthly Trends from view
  const { data: trends, error: trendError } = await supabase
    .from('monthly_financial_summary')
    .select('*')
    .limit(6);

  if (trendError) throw trendError;

  const monthly_trends: MonthlyTrendItem[] = (trends || []).map((t: any) => {
    // Format summary_month "YYYY-MM-DD" to "YYYY-MM"
    const monthStr = t.summary_month.substring(0, 7);
    return {
      month: monthStr,
      labor: Number(t.total_labour),
      parts: Number(t.total_parts),
      total: Number(t.total_gross)
    };
  });

  // 3. Fetch Staff Rankings from view
  const { data: techs, error: techError } = await supabase
    .from('staff_performance_summary')
    .select('*');

  if (techError) throw techError;

  const technicians: TechnicianPerformanceItem[] = (techs || []).map((t: any) => ({
    id: t.staff_id,
    name: t.staff_name,
    tickets_completed: Number(t.completed_tickets_count),
    labor_revenue: Number(t.total_labour_generated),
    parts_value: Number(t.total_parts_billed)
  }));

  return {
    summary,
    monthly_trends,
    technicians
  };
}

// In-memory mock aggregator for unit tests and local development
function getMockFinancialAnalytics(range: string): FinancialAnalyticsReport {
  const now = new Date();
  let minDate = new Date(0); // far past by default

  if (range === '30_days') {
    minDate = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
  } else if (range === '90_days') {
    minDate = new Date(now.getTime() - 90 * 24 * 3600 * 1000);
  } else if (range === 'year_to_date') {
    minDate = new Date(now.getFullYear(), 0, 1);
  }

  // Filter paid invoices
  const paidInvoices = mockInvoices.filter(inv => {
    const matchesStatus = inv.status === 'paid';
    const invoiceDate = new Date(inv.created_at);
    return matchesStatus && invoiceDate >= minDate;
  });

  let gross_revenue = 0;
  let labor_revenue = 0;
  let parts_revenue = 0;
  let vat_collected = 0;

  for (const inv of paidInvoices) {
    gross_revenue += inv.total_amount;
    labor_revenue += inv.labour_cost;
    parts_revenue += inv.parts_cost;
    vat_collected += inv.tax_amount;
  }

  const summary: FinancialStatsSummary = {
    gross_revenue,
    labor_revenue,
    parts_revenue,
    vat_collected,
    total_paid_invoices: paidInvoices.length
  };

  // Group by month
  const monthlyGroups: Record<string, { labor: number; parts: number; total: number }> = {};
  for (const inv of mockInvoices.filter(i => i.status === 'paid')) {
    const month = inv.created_at.substring(0, 7); // "YYYY-MM"
    if (!monthlyGroups[month]) {
      monthlyGroups[month] = { labor: 0, parts: 0, total: 0 };
    }
    monthlyGroups[month].labor += inv.labour_cost;
    monthlyGroups[month].parts += inv.parts_cost;
    monthlyGroups[month].total += inv.total_amount;
  }

  const monthly_trends: MonthlyTrendItem[] = Object.keys(monthlyGroups)
    .sort((a, b) => b.localeCompare(a)) // Sort newest first
    .slice(0, 6)
    .map(month => ({
      month,
      labor: monthlyGroups[month].labor,
      parts: monthlyGroups[month].parts,
      total: monthlyGroups[month].total
    }));

  // Technician statistics
  const mechanics = mockStaff.filter(s => s.role === 'mechanic');
  const technicians: TechnicianPerformanceItem[] = mechanics.map(mech => {
    // completed tickets assigned
    const completedTickets = mockTickets.filter(
      t => t.staff_id === mech.id && t.status === 'completed'
    );
    
    let labor_revenue = 0;
    let parts_value = 0;

    for (const ticket of completedTickets) {
      labor_revenue += ticket.labour_cost;
      // find paid invoice parts cost
      const invoice = mockInvoices.find(
        inv => inv.ticket_id === ticket.id && inv.status === 'paid'
      );
      if (invoice) {
        parts_value += invoice.parts_cost;
      }
    }

    return {
      id: mech.id,
      name: mech.name,
      tickets_completed: completedTickets.length,
      labor_revenue,
      parts_value
    };
  });

  return {
    summary,
    monthly_trends,
    technicians
  };
}
