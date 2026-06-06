import { Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../config/supabase.js';
import { AuthenticatedRequest } from '../types/index.js';

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

const isMockMode = process.env.SUPABASE_URL?.includes('mockproject.supabase.co');

export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Authorization header with Bearer token is missing.'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Token is missing.'
      });
    }

    if (isMockMode) {
      if (token === 'mock-jwt-token-admin-12345') {
        req.user = {
          id: 'd3b07384-d113-49c3-a558-8b9a103c801e',
          name: 'Mpume Zulu',
          email: 'admin@anm.co.za',
          role: 'admin',
          created_at: new Date().toISOString()
        };
        return next();
      } else if (token === 'mock-jwt-token-mechanic-12345') {
        req.user = {
          id: 'f5f7b03b-1798-444a-a435-08103cd58522',
          name: 'Asanda Cele',
          email: 'mechanic@anm.co.za',
          role: 'mechanic',
          created_at: new Date().toISOString()
        };
        return next();
      } else {
        return res.status(401).json({
          error: 'UNAUTHORIZED',
          message: 'Mock token is invalid.'
        });
      }
    }

    // Real Supabase Auth to verify JWT using dedicated authClient to prevent session pollution
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Token is invalid or expired.'
      });
    }

    // Retrieve the user profile from the staff table
    const { data: staffMember, error: staffError } = await supabase
      .from('staff')
      .select('*')
      .eq('id', user.id)
      .single();

    if (staffError || !staffMember) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'User profile not found in staff records.'
      });
    }

    // Attach user profile to the request object
    req.user = {
      id: staffMember.id,
      name: staffMember.name,
      email: staffMember.email,
      role: staffMember.role as 'admin' | 'mechanic',
      created_at: staffMember.created_at
    };

    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(allowedRole: 'admin' | 'mechanic') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Authentication required.'
      });
    }

    if (req.user.role !== allowedRole) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: `Forbidden: ${allowedRole} access required.`
      });
    }

    next();
  };
}
