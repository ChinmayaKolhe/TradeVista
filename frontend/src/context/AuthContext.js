import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tv_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('tv_token');
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await authAPI.getMe();
      setUser(data.user);
      setBalance(data.user.virtualBalance);
      localStorage.setItem('tv_user', JSON.stringify(data.user));
    } catch {
      localStorage.removeItem('tv_token');
      localStorage.removeItem('tv_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('tv_token', data.token);
    localStorage.setItem('tv_user', JSON.stringify(data.user));
    setUser(data.user);
    setBalance(data.user.virtualBalance);
    return data;
  };

  const register = async (name, email, password, virtualBalance) => {
    const { data } = await authAPI.register({ name, email, password, virtualBalance });
    localStorage.setItem('tv_token', data.token);
    localStorage.setItem('tv_user', JSON.stringify(data.user));
    setUser(data.user);
    setBalance(data.user.virtualBalance);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('tv_token');
    localStorage.removeItem('tv_user');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, balance, setBalance, login, register, logout, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
