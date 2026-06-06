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
    <div className="min-h-screen flex flex-col md:flex-row bg-background font-sans">
      {/* Left Panel - Brand Accent (Teal) */}
      <div className="hidden md:flex md:w-1/2 bg-primary items-center justify-center text-text-inverse p-12 flex-col select-none border-r border-slate-900/10">
        <div className="flex flex-col items-center justify-center text-center max-w-md animate-fade-in">
          <div className="w-28 h-28 rounded-full border border-text-inverse/35 flex items-center justify-center mb-6">
            <span className="font-display text-6xl font-medium tracking-tight text-text-inverse">A</span>
          </div>
          <h1 className="font-display text-4xl font-medium tracking-widest text-text-inverse mb-1">ANM AUTOMOTIVE</h1>
          <p className="font-sans text-[10px] font-bold tracking-widest text-text-inverse/70 uppercase">Service Management Portal</p>
        </div>
      </div>

      {/* Right Panel - Login Form (Cream) */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 animate-fade-in">
        <div className="w-full max-w-[400px]">
          {/* Mobile Brand Title */}
          <div className="md:hidden text-center mb-8 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border border-primary/30 flex items-center justify-center mb-3">
              <span className="font-display text-3xl font-medium text-primary">A</span>
            </div>
            <h1 className="font-display text-2xl font-medium text-text tracking-widest">ANM AUTOMOTIVE</h1>
            <p className="font-sans text-[9px] font-bold text-text-muted uppercase tracking-widest mt-1">Service Management Portal</p>
          </div>

          {/* Form Box */}
          <div className="bg-surface p-8 rounded-xl border border-border shadow-sm">
            <div className="hidden md:block mb-8">
              <h2 className="font-display text-2xl font-medium text-text mb-1">Sign In</h2>
              <p className="font-sans text-xs text-text-muted">Enter credentials to access the workspace.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={emailError}
                placeholder="staff@anm.co.za"
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
                <div className="p-3 rounded bg-error-bg border border-error text-error text-xs font-semibold" role="alert">
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
      </div>
    </div>
  );
};

export default Login;
