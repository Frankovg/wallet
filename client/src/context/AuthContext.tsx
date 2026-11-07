import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api, setUnauthorizedHandler } from '../api/client';
import type { AuthResponse } from '../types';

// Type aliases (not interfaces) so they satisfy Record<string, string> in AuthForm.
export type Credentials = { email: string; password: string };
export type RegisterPayload = Credentials & { name: string };

interface AuthContextValue {
  token: string | null;
  login: (credentials: Credentials) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = 'wallet.token';

function readToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(readToken);

  const saveToken = useCallback((value: string | null) => {
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
    async (credentials: Credentials) => {
      const data = await api<AuthResponse>('/auth/login', { method: 'POST', body: credentials });
      saveToken(data.token);
    },
    [saveToken]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const data = await api<AuthResponse>('/auth/register', { method: 'POST', body: payload });
      saveToken(data.token);
    },
    [saveToken]
  );

  const value = useMemo(() => ({ token, login, register, logout }), [token, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
