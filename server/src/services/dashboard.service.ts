import { supabase } from '../config/supabase.js';
import { mockTickets } from './ticket.service.js';
import { mockInventory } from './inventory.service.js';
import { mockStaff } from './staff.service.js';

const isMockMode = process.env.SUPABASE_URL?.includes('mockproject.supabase.co');

export interface DashboardStats {
  active_jobs: number;
  completed_today: number;
  total_mechanics: number;
  low_stock_count: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  if (isMockMode) {
    const active_jobs = mockTickets.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
    
    const todayStr = new Date().toDateString();
    const completed_today = mockTickets.filter(
      t => t.status === 'completed' && new Date(t.updated_at).toDateString() === todayStr
    ).length;
    
    const total_mechanics = mockStaff.filter(s => s.role === 'mechanic').length;
    const low_stock_count = mockInventory.filter(i => i.qty_in_stock <= i.reorder_level).length;

    return {
      active_jobs,
      completed_today,
      total_mechanics,
      low_stock_count
    };
  }

  // Real Supabase mode
  // 1. Active jobs count
  const { count: activeCount, error: activeError } = await supabase
    .from('service_tickets')
    .select('*', { count: 'exact', head: true })
    .in('status', ['pending', 'in_progress']);

  if (activeError) throw activeError;

  // 2. Completed today count
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const { count: completedCount, error: completedError } = await supabase
    .from('service_tickets')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')
    .gte('updated_at', todayStart.toISOString());

  if (completedError) throw completedError;

  // 3. Mechanics count
  const { count: mechanicsCount, error: staffError } = await supabase
    .from('staff')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'mechanic');

  if (staffError) throw staffError;

  // 4. Low stock items count
  const { data: inventory, error: invError } = await supabase
    .from('inventory')
    .select('qty_in_stock, reorder_level');

  if (invError) throw invError;
  const lowStockCount = (inventory || []).filter(
    item => Number(item.qty_in_stock) <= Number(item.reorder_level)
  ).length;

  return {
    active_jobs: activeCount || 0,
    completed_today: completedCount || 0,
    total_mechanics: mechanicsCount || 0,
    low_stock_count: lowStockCount
  };
}

export async function getRecentTickets(): Promise<any[]> {
  if (isMockMode) {
    // Sort mock tickets descending by created_at, limit to 5
    const sorted = [...mockTickets]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
    return sorted;
  }

  // Real Supabase mode
  const { data, error } = await supabase
    .from('service_tickets')
    .select(`
      *,
      vehicle:vehicles(id, registration_number, make, model, year, customer:customers(id, name, phone, email)),
      mechanic:staff!service_tickets_staff_id_fkey(id, name, email)
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) throw error;

  return data.map((t: any) => ({
    id: t.id,
    vehicle_id: t.vehicle_id,
    staff_id: t.staff_id,
    created_by: t.created_by,
    status: t.status,
    description: t.description,
    notes: t.notes,
    labour_cost: Number(t.labour_cost),
    created_at: t.created_at,
    updated_at: t.updated_at,
    vehicle: t.vehicle ? {
      id: t.vehicle.id,
      registration_number: t.vehicle.registration_number,
      make: t.vehicle.make,
      model: t.vehicle.model,
      year: t.vehicle.year
    } : undefined,
    customer: t.vehicle?.customer ? {
      id: t.vehicle.customer.id,
      name: t.vehicle.customer.name,
      phone: t.vehicle.customer.phone,
      email: t.vehicle.customer.email
    } : undefined,
    mechanic: t.mechanic ? {
      id: t.mechanic.id,
      name: t.mechanic.name,
      email: t.mechanic.email
    } : undefined
  }));
}

export async function getLowStockItems(): Promise<any[]> {
  if (isMockMode) {
    return mockInventory.filter(i => i.qty_in_stock <= i.reorder_level);
  }

  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .order('part_name', { ascending: true });

  if (error) throw error;

  return (data || [])
    .map((item: any) => ({
      id: item.id,
      part_name: item.part_name,
      part_number: item.part_number,
      qty_in_stock: Number(item.qty_in_stock),
      reorder_level: Number(item.reorder_level),
      unit_cost: item.unit_cost ? Number(item.unit_cost) : null,
      created_at: item.created_at,
      updated_at: item.updated_at
    }))
    .filter((item: any) => item.qty_in_stock <= item.reorder_level);
}
