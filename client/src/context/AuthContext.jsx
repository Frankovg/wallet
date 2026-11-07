import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, setUnauthorizedHandler } from '../api/client.js';

const AuthContext = createContext(null);
const STORAGE_KEY = 'wallet.token';

function readToken() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(readToken);

  const saveToken = useCallback((value) => {
    try {
      if (value) localStorage.setItem(STORAGE_KEY, value);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable: the session lives in memory only */
    }
    setToken(value);
  }, []);

  const logout = useCallback(() => saveToken(null), [saveToken]);

  // Expired or invalid token → back to login.
  useEffect(() => setUnauthorizedHandler(logout), [logout]);

  const login = useCallback(
    async (credentials) => {
      const data = await api('/auth/login', { method: 'POST', body: credentials });
      saveToken(data.token);
    },
    [saveToken]
  );

  const register = useCallback(
    async (payload) => {
      const data = await api('/auth/register', { method: 'POST', body: payload });
      saveToken(data.token);
    },
    [saveToken]
  );

  const value = useMemo(() => ({ token, login, register, logout }), [token, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
