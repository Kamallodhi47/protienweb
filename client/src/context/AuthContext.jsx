import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('protein_token') || null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    if (token) {
      authAPI
        .getMe()
        .then((res) => {
          if (res.success) setUser(res.user);
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await authAPI.login({ email, password });
      if (res.success) {
        localStorage.setItem('protein_token', res.token);
        setToken(res.token);
        setUser(res.user);
        addToast(`Welcome back, ${res.user.name}!`, 'success');
        return res;
      }
    } catch (err) {
      addToast(err.message || 'Login failed.', 'error');
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const res = await authAPI.register(userData);
      if (res.success) {
        localStorage.setItem('protein_token', res.token);
        setToken(res.token);
        setUser(res.user);
        addToast('Account created successfully!', 'success');
        return res;
      }
    } catch (err) {
      addToast(err.message || 'Registration failed.', 'error');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('protein_token');
    setToken(null);
    setUser(null);
    addToast('Logged out successfully.', 'info');
  };

  const updateProfileState = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfileState,
        isAdmin: user?.role === 'ADMIN',
        isCustomer: user?.role === 'CUSTOMER'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
