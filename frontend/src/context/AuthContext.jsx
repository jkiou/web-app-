import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  // Toast notifications utility
  const showToast = (message, type = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch current user details on start if token exists
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        if (response.ok && data.status === 'success') {
          setUser(data.data.user);
        } else {
          // Token expired or invalid
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          showToast(data.message || 'Session expired. Please log in again.', 'error');
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        // Do not reset token on net error to avoid logout on glitch, but end loading
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  // Auth Operations
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please check credentials.');
      }

      const { user: loggedUser, token: authToken } = data.data;
      localStorage.setItem('token', authToken);
      setToken(authToken);
      setUser(loggedUser);
      showToast(`Welcome back, ${loggedUser.name}!`, 'success');
      return { success: true };
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, error: err.message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed.');
      }

      const { user: registeredUser, token: authToken } = data.data;
      localStorage.setItem('token', authToken);
      setToken(authToken);
      setUser(registeredUser);
      showToast(`Account created successfully. Welcome, ${registeredUser.name}!`, 'success');
      return { success: true };
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    showToast('Logged out successfully.', 'success');
  };

  const value = {
    user,
    token,
    loading,
    toasts,
    login,
    register,
    logout,
    showToast,
    removeToast
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};
