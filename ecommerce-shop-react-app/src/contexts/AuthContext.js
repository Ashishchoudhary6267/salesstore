import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const { success, error: showError } = useToast();

  // Check if user is logged in on app start - only run once
  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      if (token && isMounted) {
        try {
          const response = await fetch('http://localhost:5000/api/auth/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok && isMounted) {
            const data = await response.json();
            setUser(data.user);
          } else if (isMounted) {
            // Token is invalid, remove it
            localStorage.removeItem('token');
            setToken(null);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          if (isMounted) {
            localStorage.removeItem('token');
            setToken(null);
          }
        }
      }
      if (isMounted) {
        setLoading(false);
      }
    };

    checkAuth();
    
    return () => {
      isMounted = false;
    };
  }, []); // Remove token dependency to prevent re-runs

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        success('Login successful!');
        return { success: true };
      } else {
        showError(data.message || 'Login failed');
        return { success: false, message: data.message };
      }
    } catch (error) {
      showError('Network error. Please try again.');
      return { success: false, message: 'Network error' };
    }
  };

  const register = async (firstName, lastName, email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        success('Registration successful! Welcome!');
        return { success: true };
      } else {
        showError(data.message || 'Registration failed');
        return { success: false, message: data.message };
      }
    } catch (error) {
      showError('Network error. Please try again.');
      return { success: false, message: 'Network error' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    success('Logged out successfully');
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        success('Profile updated successfully!');
        return { success: true };
      } else {
        showError(data.message || 'Failed to update profile');
        return { success: false, message: data.message };
      }
    } catch (error) {
      showError('Network error. Please try again.');
      return { success: false, message: 'Network error' };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
