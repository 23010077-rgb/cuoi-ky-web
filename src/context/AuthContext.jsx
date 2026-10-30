import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import http from '../api/http';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Chỉ giữ thông tin hiển thị trong bộ nhớ (state), không ghi ra localStorage.
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { data } = await http.get('/auth/me');
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (email, password) => {
    const { data } = await http.post('/auth/login', { email, password });
    setUser(data.user);
    return data.user;
  };

  const register = (payload) => http.post('/auth/register', payload);

  const logout = async () => {
    try {
      await http.post('/auth/logout');
    } finally {
      setUser(null);
    }
  };

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
