import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-page animate-fade-in">
      <div className="glass-panel auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Log in to manage your tasks and systems
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="email">Email Address</label>
            <input
              className="input-field"
              type="email"
              id="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="password">Password</label>
            <input
              className="input-field"
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <button 
            className="btn btn-primary" 
            type="submit" 
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>
            Sign Up
          </Link>
        </p>

        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-dark)' }}>
          <p style={{ fontWeight: '700', marginBottom: '0.25rem', color: 'var(--text-muted)' }}>💡 Mock Accounts for Testing:</p>
          <p>• Admin: <code>admin@example.com</code> / <code>admin123</code></p>
          <p>• Regular User: <code>user@example.com</code> / <code>user123</code></p>
        </div>
      </div>
    </div>
  );
}
