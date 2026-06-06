import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Input } from '../components/ui/Input.js';
import { Button } from '../components/ui/Button.js';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already logged in, redirect immediately based on role
  React.useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/my-jobs', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setEmailError('');
    setPasswordError('');

    // Client-side validation
    let hasError = false;
    if (!email) {
      setEmailError('Email is required');
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Invalid email format');
      hasError = true;
    }

    if (!password) {
      setPasswordError('Password is required');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      hasError = true;
    }

    if (hasError) return;

    setIsSubmitting(true);
    try {
      await login(email, password);
      // Success: AuthContext will update 'user', triggering the useEffect redirect.
      const from = (location.state as any)?.from?.pathname;
      // We will let the useEffect handle redirect, or do it here as a fallback
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'INVALID_CREDENTIALS') {
        setLoginError('Invalid email or password.');
      } else {
        setLoginError(err.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-[400px] bg-surface p-8 rounded-lg shadow-md border border-border">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text mb-2 tracking-tight">ANM Workshop</h1>
          <p className="text-text-muted text-sm font-medium">Service Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
            placeholder="mechanic@anm.co.za"
            disabled={isSubmitting}
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={passwordError}
            placeholder="••••••••"
            disabled={isSubmitting}
            required
          />

          {loginError && (
            <div className="p-3 rounded bg-error-bg border border-error text-error text-sm font-medium" role="alert">
              {loginError}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            loading={isSubmitting}
          >
            Log In
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
