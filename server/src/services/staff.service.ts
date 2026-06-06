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
export let mockStaff: Staff[] = [
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

export async function createMechanic(
  name: string,
  email: string,
  password: string
): Promise<Staff> {
  const normalizedEmail = email.trim().toLowerCase();

  if (isMockMode) {
    const duplicate = mockStaff.find(s => s.email.toLowerCase() === normalizedEmail);
    if (duplicate) {
      const error = new Error('An account with this email already exists.') as any;
      error.status = 409;
      error.code = 'EMAIL_EXISTS';
      throw error;
    }

    const newStaff: Staff = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      role: 'mechanic',
      created_at: new Date().toISOString()
    };

    mockStaff.push(newStaff);
    return newStaff;
  }

  // Real Supabase mode
  // 1. Create user in Supabase Auth using the Admin API (requires service_role key)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: normalizedEmail,
    password: password,
    email_confirm: true
  });

  if (authError) {
    if (authError.message?.toLowerCase().includes('already registered') || authError.status === 422 || authError.status === 409) {
      const error = new Error('An account with this email already exists.') as any;
      error.status = 409;
      error.code = 'EMAIL_EXISTS';
      throw error;
    }
    throw authError;
  }

  // 2. Create profile row in local staff table
  const { data, error: dbError } = await supabase
    .from('staff')
    .insert({
      id: authData.user.id,
      name: name.trim(),
      email: normalizedEmail,
      role: 'mechanic'
    })
    .select()
    .single();

  if (dbError) {
    // Rollback: delete auth user if profile insertion failed
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw dbError;
  }

  return data as Staff;
}
