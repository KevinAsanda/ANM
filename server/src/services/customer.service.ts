import { supabase } from '../config/supabase.js';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  created_at: string;
}

const isMockMode = process.env.SUPABASE_URL?.includes('mockproject.supabase.co');

// In-memory mock database for local development
let mockCustomers: Customer[] = [
  {
    id: 'c1f7b03b-1798-444a-a435-08103cd585e5',
    name: 'Sipho Khumalo',
    phone: '0821234567',
    email: 'sipho@gmail.com',
    created_at: new Date().toISOString()
  },
  {
    id: 'c2f7b03b-1798-444a-a435-08103cd585e6',
    name: 'Nomalanga Cele',
    phone: '0837654321',
    email: 'nomalanga@yahoo.com',
    created_at: new Date().toISOString()
  }
];

export async function listCustomers(): Promise<Customer[]> {
  if (isMockMode) {
    return mockCustomers;
  }

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    throw error;
  }

  return data as Customer[];
}

export async function createOrGetCustomer(
  name: string,
  phone: string,
  email?: string | null
): Promise<{ customer: Customer; deduplicated: boolean }> {
  const normalizedPhone = phone.trim();

  if (isMockMode) {
    const existing = mockCustomers.find(c => c.phone === normalizedPhone);
    if (existing) {
      return { customer: existing, deduplicated: true };
    }

    const newCustomer: Customer = {
      id: crypto.randomUUID(),
      name: name.trim(),
      phone: normalizedPhone,
      email: email?.trim() || null,
      created_at: new Date().toISOString()
    };
    mockCustomers.push(newCustomer);
    return { customer: newCustomer, deduplicated: false };
  }

  // Check if customer already exists by phone
  const { data: existing, error: findError } = await supabase
    .from('customers')
    .select('*')
    .eq('phone', normalizedPhone)
    .maybeSingle();

  if (findError) {
    throw findError;
  }

  if (existing) {
    return { customer: existing as Customer, deduplicated: true };
  }

  // Create new customer
  const { data: created, error: createError } = await supabase
    .from('customers')
    .insert({
      name: name.trim(),
      phone: normalizedPhone,
      email: email?.trim() || null
    })
    .select()
    .single();

  if (createError) {
    throw createError;
  }

  return { customer: created as Customer, deduplicated: false };
}
