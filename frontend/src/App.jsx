import React from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';

// Route Guard for authenticated users
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <div className="spinner-wrapper"><div className="spinner"></div></div>;
  return token ? children : <Navigate to="/login" replace />;
};

// Route Guard for administrative access
const AdminRoute = ({ children }) => {
  const { token, user, loading } = useAuth();
  if (loading) return <div className="spinner-wrapper"><div className="spinner"></div></div>;
  if (!token) return <Navigate to="/login" replace />;
  return user?.role === 'ADMIN' ? children : <Navigate to="/dashboard" replace />;
};

// Route Guard for guests (login/register)
const GuestRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <div className="spinner-wrapper"><div className="spinner"></div></div>;
  return !token ? children : <Navigate to="/dashboard" replace />;
};

export default function App() {
  const { user, token, logout, toasts, removeToast } = useAuth();
  const location = useLocation();

  return (
    <div className="app-container">
      {/* Premium Navbar */}
      <nav className="navbar">
        <Link to="/" className="nav-brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#cyanPurpleGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(-10deg)' }}>
            <defs>
              <linearGradient id="cyanPurpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--primary)" />
                <stop offset="100%" stopColor="var(--secondary)" />
              </linearGradient>
            </defs>
            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
            <path d="M2 17l10 5 10-5"></path>
            <path d="M2 12l10 5 10-5"></path>
          </svg>
          NexusFlow
        </Link>

        <div className="nav-links">
          {token ? (
            <>
              <Link 
                to="/dashboard" 
                className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
              >
                My Tasks
              </Link>
              {user?.role === 'ADMIN' && (
                <Link 
                  to="/admin" 
                  className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
                >
                  Admin Panel
                </Link>
              )}
              <div className="profile-pill">
                <div className="avatar-circle">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span style={{ fontWeight: '600' }}>{user?.name}</span>
              </div>
              <button 
                className="btn btn-secondary" 
                onClick={logout} 
                style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              {location.pathname !== '/login' && (
                <Link to="/login" className="nav-link">Sign In</Link>
              )}
              {location.pathname !== '/register' && (
                <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}>
                  Get Started
                </Link>
              )}
            </>
          )}
        </div>
      </nav>

      {/* Main Pages Content */}
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          
          {/* Default Redirections */}
          <Route path="/" element={token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
          <Route path="*" element={token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
        </Routes>
      </main>

      {/* Global Realtime API responses notifier */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <div style={{ fontSize: '1.2rem' }}>
              {toast.type === 'success' ? '✨' : '⚠️'}
            </div>
            <div className="toast-message">{toast.message}</div>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}
