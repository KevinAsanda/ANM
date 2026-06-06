import { createClient } from '@supabase/supabase-js';
import { supabase } from '../config/supabase.js';
import { UserProfile } from '../types/index.js';

const isMockMode = process.env.SUPABASE_URL?.includes('mockproject.supabase.co');

const authClient = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function loginUser(email: string, password: string): Promise<{ token: string; user: UserProfile }> {
  if (isMockMode) {
    // Return mock session data for local development/testing
    if (email === 'admin@anm.co.za' && password === 'password') {
      return {
        token: 'mock-jwt-token-admin-12345',
        user: {
          id: 'd3b07384-d113-49c3-a558-8b9a103c801e',
          name: 'Mpume Zulu',
          email: 'admin@anm.co.za',
          role: 'admin',
          created_at: new Date().toISOString()
        }
      };
    } else if (email === 'mechanic@anm.co.za' && password === 'password') {
      return {
        token: 'mock-jwt-token-mechanic-12345',
        user: {
          id: 'f5f7b03b-1798-444a-a435-08103cd58522',
          name: 'Asanda Cele',
          email: 'mechanic@anm.co.za',
          role: 'mechanic',
          created_at: new Date().toISOString()
        }
      };
    } else {
      const error = new Error('Invalid email or password.') as any;
      error.status = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }
  }

  // Real Supabase Auth via dedicated authClient
  const { data, error } = await authClient.auth.signInWithPassword({ email, password });
  if (error || !data.session || !data.user) {
    const customError = new Error('Invalid email or password.') as any;
    customError.status = 401;
    customError.code = 'INVALID_CREDENTIALS';
    throw customError;
  }

  // Fetch role from staff table
  const { data: staffMember, error: staffError } = await supabase
    .from('staff')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (staffError || !staffMember) {
    const customError = new Error('User profile not found in staff records.') as any;
    customError.status = 401;
    customError.code = 'UNAUTHORIZED';
    throw customError;
  }

  return {
    token: data.session.access_token,
    user: {
      id: staffMember.id,
      name: staffMember.name,
      email: staffMember.email,
      role: staffMember.role as 'admin' | 'mechanic',
      created_at: staffMember.created_at
    }
  };
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  if (isMockMode) {
    if (userId === 'd3b07384-d113-49c3-a558-8b9a103c801e') {
      return {
        id: 'd3b07384-d113-49c3-a558-8b9a103c801e',
        name: 'Mpume Zulu',
        email: 'admin@anm.co.za',
        role: 'admin',
        created_at: new Date().toISOString()
      };
    } else if (userId === 'f5f7b03b-1798-444a-a435-08103cd58522') {
      return {
        id: 'f5f7b03b-1798-444a-a435-08103cd58522',
        name: 'Asanda Cele',
        email: 'mechanic@anm.co.za',
        role: 'mechanic',
        created_at: new Date().toISOString()
      };
    } else {
      const error = new Error('User profile not found.') as any;
      error.status = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }
  }

  const { data: staffMember, error } = await supabase
    .from('staff')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !staffMember) {
    const customError = new Error('User profile not found.') as any;
    customError.status = 404;
    customError.code = 'USER_NOT_FOUND';
    throw customError;
  }

  return {
    id: staffMember.id,
    name: staffMember.name,
    email: staffMember.email,
    role: staffMember.role as 'admin' | 'mechanic',
    created_at: staffMember.created_at
  };
}
