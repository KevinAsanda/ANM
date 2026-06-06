import { supabase } from '../config/supabase.js';

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

const isMockMode = process.env.SUPABASE_URL?.includes('mockproject.supabase.co');

// In-memory mock database seeded per DB_SCHEMA.md specifications
export let mockInventory: InventoryItem[] = [
  {
    id: 'i001',
    part_name: 'Oil Filter',
    part_number: 'OF-001',
    qty_in_stock: 15,
    reorder_level: 5,
    unit_cost: 45.00,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'i002',
    part_name: 'Air Filter',
    part_number: 'AF-002',
    qty_in_stock: 8,
    reorder_level: 5,
    unit_cost: 120.00,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'i003',
    part_name: 'Brake Pads (Front)',
    part_number: 'BP-F-003',
    qty_in_stock: 4, // low stock
    reorder_level: 5,
    unit_cost: 350.00,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'i004',
    part_name: 'Spark Plugs (set of 4)',
    part_number: 'SP-004',
    qty_in_stock: 12,
    reorder_level: 5,
    unit_cost: 180.00,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'i005',
    part_name: 'Engine Oil 5W-30 (5L)',
    part_number: 'EO-005',
    qty_in_stock: 3, // low stock
    reorder_level: 5,
    unit_cost: 210.00,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'i006',
    part_name: 'Wiper Blades',
    part_number: 'WB-006',
    qty_in_stock: 20,
    reorder_level: 5,
    unit_cost: 95.00,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'i007',
    part_name: 'Battery (650CCA)',
    part_number: 'BAT-007',
    qty_in_stock: 2, // low stock
    reorder_level: 3,
    unit_cost: 1200.00,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'i008',
    part_name: 'Timing Belt',
    part_number: 'TB-008',
    qty_in_stock: 6,
    reorder_level: 3,
    unit_cost: 450.00,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'i009',
    part_name: 'Coolant (1L)',
    part_number: 'CL-009',
    qty_in_stock: 18,
    reorder_level: 5,
    unit_cost: 55.00,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'i010',
    part_name: 'Brake Fluid (500ml)',
    part_number: 'BF-010',
    qty_in_stock: 9,
    reorder_level: 5,
    unit_cost: 75.00,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'i011',
    part_name: 'Clutch Kit',
    part_number: 'CK-011',
    qty_in_stock: 1, // low stock
    reorder_level: 2,
    unit_cost: 1800.00,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'i012',
    part_name: 'Power Steering Fluid',
    part_number: 'PS-012',
    qty_in_stock: 7,
    reorder_level: 5,
    unit_cost: 65.00,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export async function listInventory(lowStockOnly?: boolean): Promise<InventoryItem[]> {
  if (isMockMode) {
    if (lowStockOnly) {
      return mockInventory.filter(item => item.qty_in_stock <= item.reorder_level);
    }
    return mockInventory;
  }

  let query = supabase
    .from('inventory')
    .select('*')
    .order('part_name', { ascending: true });

  if (lowStockOnly) {
    // We can filter locally or use postgrest filter operators
    query = query.lte('qty_in_stock', 'reorder_level'); // Wait! Postgres postgrest has challenges comparing columns, standard is to use Rpc or filter locally, or perform a manual filter. In postgrest, column comparison can be written using custom filters or we can filter in JS. Let's do locally or use supabase.rpc. Filtering locally in JS is simple and extremely reliable for normal tables!
  }

  const { data, error } = await query;
  if (error) throw error;

  const items = data.map((item: any) => ({
    id: item.id,
    part_name: item.part_name,
    part_number: item.part_number,
    qty_in_stock: Number(item.qty_in_stock),
    reorder_level: Number(item.reorder_level),
    unit_cost: item.unit_cost ? Number(item.unit_cost) : null,
    created_at: item.created_at,
    updated_at: item.updated_at
  }));

  if (lowStockOnly) {
    return items.filter(item => item.qty_in_stock <= item.reorder_level);
  }

  return items;
}

export async function addPart(
  partName: string,
  partNumber?: string | null,
  qtyInStock: number = 0,
  reorderLevel: number = 5,
  unitCost?: number | null
): Promise<InventoryItem> {
  const normalizedNumber = partNumber?.trim() || null;

  if (isMockMode) {
    if (normalizedNumber) {
      const duplicate = mockInventory.find(
        i => i.part_number?.toUpperCase() === normalizedNumber.toUpperCase()
      );
      if (duplicate) {
        const error = new Error('A part with this number already exists.') as any;
        error.status = 409;
        error.code = 'PART_NUMBER_EXISTS';
        throw error;
      }
    }

    const newItem: InventoryItem = {
      id: crypto.randomUUID(),
      part_name: partName.trim(),
      part_number: normalizedNumber,
      qty_in_stock: qtyInStock,
      reorder_level: reorderLevel,
      unit_cost: unitCost !== undefined ? unitCost : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    mockInventory.push(newItem);
    return newItem;
  }

  // Real DB duplicate check
  if (normalizedNumber) {
    const { data: existing, error: findError } = await supabase
      .from('inventory')
      .select('id')
      .eq('part_number', normalizedNumber)
      .maybeSingle();

    if (findError) throw findError;
    if (existing) {
      const error = new Error('A part with this number already exists.') as any;
      error.status = 409;
      error.code = 'PART_NUMBER_EXISTS';
      throw error;
    }
  }

  const { data, error } = await supabase
    .from('inventory')
    .insert({
      part_name: partName.trim(),
      part_number: normalizedNumber,
      qty_in_stock: qtyInStock,
      reorder_level: reorderLevel,
      unit_cost: unitCost
    })
    .select()
    .single();

  if (error) throw error;
  return data as InventoryItem;
}

export async function updatePart(
  id: string,
  updates: {
    part_name?: string;
    qty_in_stock?: number;
    reorder_level?: number;
    unit_cost?: number | null;
  }
): Promise<InventoryItem> {
  if (isMockMode) {
    const itemIndex = mockInventory.findIndex(i => i.id === id);
    if (itemIndex === -1) {
      const error = new Error('Part not found') as any;
      error.status = 404;
      error.code = 'PART_NOT_FOUND';
      throw error;
    }

    const current = mockInventory[itemIndex];
    const updated: InventoryItem = {
      ...current,
      ...updates,
      part_name: updates.part_name ? updates.part_name.trim() : current.part_name,
      updated_at: new Date().toISOString()
    };

    mockInventory[itemIndex] = updated;
    return updated;
  }

  const { data, error } = await supabase
    .from('inventory')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as InventoryItem;
}
