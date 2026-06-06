import { supabase } from '../config/supabase.js';

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'mechanic';
  created_at: string;
}

const isMockMode = process.env.SUPABASE_URL?.includes('mockproject.supabase.co');

// In-memory mock database for local development
let mockStaff: Staff[] = [
  {
    id: 'd3b07384-d113-49c3-a558-8b9a103c801e',
    name: 'Mpume Zulu',
    email: 'admin@anm.co.za',
    role: 'admin',
    created_at: new Date().toISOString()
  },
  {
    id: 'f5f7b03b-1798-444a-a435-08103cd58522',
    name: 'Asanda Cele',
    email: 'mechanic@anm.co.za',
    role: 'mechanic',
    created_at: new Date().toISOString()
  }
];

export async function listStaff(): Promise<Staff[]> {
  if (isMockMode) {
    return mockStaff;
  }

  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    throw error;
  }

  return data as Staff[];
}

export async function createStaffRecord(
  id: string,
  name: string,
  email: string,
  role: 'admin' | 'mechanic'
): Promise<Staff> {
  const newStaff: Staff = {
    id,
    name,
    email,
    role,
    created_at: new Date().toISOString()
  };

  if (isMockMode) {
    mockStaff.push(newStaff);
    return newStaff;
  }

  const { data, error } = await supabase
    .from('staff')
    .insert({ id, name, email, role })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Staff;
}
