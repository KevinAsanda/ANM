import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Input } from '../components/ui/Input.js';
import { Button } from '../components/ui/Button.js';
import anmLogo from '../assets/anm-logo.svg';

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
    <div className="min-h-screen flex flex-col md:flex-row bg-background font-sans relative overflow-hidden">
      {/* Background ambient glows (for glass portal feel) */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-light/30 rounded-full blur-3xl pointer-events-none -mr-48 -mt-48 z-0" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl pointer-events-none -ml-48 -mb-48 z-0" />

      {/* Left Panel - Brand Accent (Teal) */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary via-primary-hover to-[#2a5c54] items-center justify-center text-text-inverse p-12 flex-col select-none border-r border-slate-900/10 relative z-10 overflow-hidden">
        {/* Glow behind logo */}
        <div className="absolute w-[350px] h-[350px] bg-white/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col items-center justify-center text-center max-w-md animate-fade-in relative z-20">
          <div className="w-32 h-32 bg-white/95 backdrop-blur-md p-4 rounded-3xl shadow-xl flex items-center justify-center mb-8 border border-white/20 transition-transform duration-500 hover:scale-105">
            <img src={anmLogo} alt="ANM Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="font-display text-4xl font-medium tracking-[0.15em] text-text-inverse mb-2">ANM AUTOMOTIVE</h1>
          <p className="font-sans text-[10px] font-bold tracking-[0.25em] text-white/80 uppercase">Service Management Portal</p>
          
          {/* Subtle line motif detail */}
          <div className="w-16 h-[1px] bg-white/20 my-6" />
          <p className="text-xs text-white/60 font-light tracking-wide max-w-xs">
            Refined mechanical diagnostics and paperless operations in Marianheights.
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form (Cream) */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 animate-fade-in relative z-10">
        <div className="w-full max-w-[400px]">
          {/* Mobile Brand Title */}
          <div className="md:hidden text-center mb-8 flex flex-col items-center">
            <div className="w-20 h-20 bg-white/95 p-2 rounded-2xl shadow-md flex items-center justify-center mb-3 border border-border">
              <img src={anmLogo} alt="ANM Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="font-display text-2xl font-medium text-text tracking-widest">ANM AUTOMOTIVE</h1>
            <p className="font-sans text-[9px] font-bold text-text-muted uppercase tracking-widest mt-1">Service Management Portal</p>
          </div>

          {/* Form Box - Styled as a Frosted Glass Card */}
          <div className="bg-surface/70 backdrop-blur-lg p-8 rounded-2xl border border-white/40 shadow-xl relative overflow-hidden">
            {/* Glossy sheen overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none" />
            
            <div className="hidden md:block mb-8 relative z-10">
              <h2 className="font-display text-2xl font-medium text-text mb-1">Sign In</h2>
              <p className="font-sans text-xs text-text-muted">Enter credentials to access the workspace.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10" noValidate>
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
                <div className="p-3 rounded bg-error-bg/85 backdrop-blur-xs border border-error text-error text-xs font-semibold" role="alert">
                  {loginError}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2 shadow-sm hover:shadow-md transition-all duration-300"
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
