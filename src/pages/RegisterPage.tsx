import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { Lock, Mail, AlertCircle, Loader2, UserPlus, CheckCircle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Register User
      const regResponse = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const regData = await regResponse.json();

      if (!regResponse.ok) {
        throw new Error(regData.detail || 'Failed to register');
      }

      setSuccess(true);

      // 2. Automatically log them in
      const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        // Wait a short moment to show success state, then login
        setTimeout(() => {
          login(loginData.email, loginData.access_token);
          navigate('/generator');
        }, 1200);
      } else {
        // If auto-login fails, redirect to login page manually
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }

    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '80vh',
      padding: '1.5rem',
    }}>
      <div className="auth-card fade-in">
        <div className="glow-spot-auth" />
        <div style={{ textAlign: 'center', marginBottom: '2rem', position: 'relative' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '0.5rem' }}>Create Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Get started with TeaserAI</p>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#f87171',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            position: 'relative'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '8px',
            color: '#34d399',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            position: 'relative'
          }}>
            <CheckCircle size={18} style={{ flexShrink: 0 }} />
            <span>Registration successful! Logging you in...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="email" className="auth-label">
              Email Address
            </label>
            <div className="auth-input-wrapper">
              <Mail size={18} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }} />
              <input
                id="email"
                type="email"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="auth-input"
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="password" className="auth-label">
              Password
            </label>
            <div className="auth-input-wrapper">
              <Lock size={18} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }} />
              <input
                id="password"
                type="password"
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="auth-input"
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="confirmPassword" className="auth-label">
              Confirm Password
            </label>
            <div className="auth-input-wrapper">
              <Lock size={18} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }} />
              <input
                id="confirmPassword"
                type="password"
                required
                disabled={isLoading}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="auth-input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
            style={{
              padding: '0.85rem',
              borderRadius: '10px',
              fontWeight: 600,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginTop: '0.5rem',
              width: '100%'
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Creating Account...
              </>
            ) : (
              <>
                <UserPlus size={18} /> Sign Up
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.9rem', position: 'relative' }}>
          <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
          <Link to="/login" style={{ color: 'var(--primary-pink)', textDecoration: 'none', fontWeight: 500 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
