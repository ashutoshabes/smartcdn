import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('smartcdn_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success) {
      localStorage.setItem('smartcdn_token', res.token);
      localStorage.setItem('smartcdn_user', JSON.stringify(res.user));
      setUser(res.user);
    }
    return res;
  };

  const register = async (name, email, password) => {
    return api.register({ name, email, password });
  };

  const logout = () => {
    localStorage.removeItem('smartcdn_token');
    localStorage.removeItem('smartcdn_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}