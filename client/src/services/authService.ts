export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'mechanic';
  created_at: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const error = new Error(errorData.message || 'Login failed') as any;
      error.status = res.status;
      error.code = errorData.error || 'LOGIN_FAILED';
      throw error;
    }

    const data: LoginResponse = await res.json();
    
    // Save token and user in local storage
    localStorage.setItem('anm_token', data.token);
    localStorage.setItem('anm_user', JSON.stringify(data.user));

    return data;
  },

  logout(): void {
    localStorage.removeItem('anm_token');
    localStorage.removeItem('anm_user');
  },

  getCurrentToken(): string | null {
    return localStorage.getItem('anm_token');
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('anm_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  async getMe(token: string): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const error = new Error(errorData.message || 'Session verification failed') as any;
      error.status = res.status;
      error.code = errorData.error || 'SESSION_VERIFICATION_FAILED';
      throw error;
    }

    const data = await res.json();
    return data.user;
  }
};
