import { supabase } from '../config/supabase.js';

export interface Vehicle {
  id: string;
  customer_id: string;
  registration_number: string;
  vin: string | null;
  make: string;
  model: string;
  year: number | null;
  created_at: string;
}

const isMockMode = process.env.SUPABASE_URL?.includes('mockproject.supabase.co');

// In-memory mock database for local development
export let mockVehicles: Vehicle[] = [
  {
    id: 'v7b91d90-b183-4903-8888-0f19c9d09a80',
    customer_id: 'c1f7b03b-1798-444a-a435-08103cd585e5',
    registration_number: 'ND123456',
    vin: '12345678901234567',
    make: 'Toyota',
    model: 'Hilux',
    year: 2018,
    created_at: new Date().toISOString()
  }
];

export async function listVehiclesByCustomer(customerId: string): Promise<Vehicle[]> {
  if (isMockMode) {
    return mockVehicles.filter(v => v.customer_id === customerId);
  }

  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('customer_id', customerId);

  if (error) {
    throw error;
  }

  return data as Vehicle[];
}

export async function createVehicle(
  customerId: string,
  registrationNumber: string,
  vin?: string | null,
  make?: string,
  model?: string,
  year?: number | null
): Promise<Vehicle> {
  const normalizedReg = registrationNumber.trim().toUpperCase();

  if (isMockMode) {
    const existing = mockVehicles.find(v => v.registration_number === normalizedReg);
    if (existing) {
      const error = new Error('A vehicle with this registration number already exists.') as any;
      error.status = 409;
      error.code = 'REGISTRATION_NUMBER_EXISTS';
      throw error;
    }

    const newVehicle: Vehicle = {
      id: crypto.randomUUID(),
      customer_id: customerId,
      registration_number: normalizedReg,
      vin: vin?.trim() || null,
      make: make?.trim() || 'Unknown',
      model: model?.trim() || 'Unknown',
      year: year || null,
      created_at: new Date().toISOString()
    };
    mockVehicles.push(newVehicle);
    return newVehicle;
  }

  // Check if registration number already exists
  const { data: existing, error: findError } = await supabase
    .from('vehicles')
    .select('id')
    .eq('registration_number', normalizedReg)
    .maybeSingle();

  if (findError) {
    throw findError;
  }

  if (existing) {
    const error = new Error('A vehicle with this registration number already exists.') as any;
    error.status = 409;
    error.code = 'REGISTRATION_NUMBER_EXISTS';
    throw error;
  }

  // Insert vehicle
  const { data: created, error: createError } = await supabase
    .from('vehicles')
    .insert({
      customer_id: customerId,
      registration_number: normalizedReg,
      vin: vin?.trim() || null,
      make: make?.trim() || 'Unknown',
      model: model?.trim() || 'Unknown',
      year: year || null
    })
    .select()
    .single();

  if (createError) {
    throw createError;
  }

  return created as Vehicle;
}

export async function getVehicleByRegistration(registrationNumber: string): Promise<Vehicle | null> {
  const normalizedReg = registrationNumber.trim().toUpperCase();

  if (isMockMode) {
    return mockVehicles.find(v => v.registration_number === normalizedReg) || null;
  }

  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('registration_number', normalizedReg)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as Vehicle | null;
}
