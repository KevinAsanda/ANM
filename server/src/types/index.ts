import { Request } from 'express';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'mechanic';
  created_at: string;
}

export interface AuthenticatedRequest extends Request {
  user?: UserProfile;
}
