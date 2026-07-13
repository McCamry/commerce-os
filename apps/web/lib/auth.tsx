'use client';

import * as React from 'react';
import {
  api,
  decodeToken,
  getToken,
  isExpired,
  setToken,
  type JwtClaims,
} from '@/lib/api';

interface LoginResponse {
  accessToken: string;
  user: { id: string; username: string; displayName: string };
}

interface AuthState {
  claims: JwtClaims | null;
  orgId: string | null;
  username: string | null;
  ready: boolean;
  login: (
    username: string,
    password: string,
    organizationCode: string,
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = React.createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [claims, setClaims] = React.useState<JwtClaims | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const token = getToken();
    const decoded = token ? decodeToken(token) : null;
    if (decoded && !isExpired(decoded)) {
      setClaims(decoded);
    } else {
      setToken(null);
    }
    setReady(true);
  }, []);

  const login = React.useCallback(
    async (username: string, password: string, organizationCode: string) => {
      const res = await api.post<LoginResponse>('/auth/login', {
        username,
        password,
        organizationCode,
      });
      setToken(res.accessToken);
      setClaims(decodeToken(res.accessToken));
    },
    [],
  );

  const logout = React.useCallback(() => {
    setToken(null);
    setClaims(null);
  }, []);

  const value: AuthState = {
    claims,
    orgId: claims?.orgId ?? null,
    username: claims?.username ?? null,
    ready,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
