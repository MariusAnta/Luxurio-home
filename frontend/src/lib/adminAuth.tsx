import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, Admin } from './api';

interface AdminAuthCtx {
  admin: Admin | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AdminAuthCtx | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cookie is sent automatically; 401 means not logged in
    api.get('/auth/admin/me')
      .then((r) => setAdmin(r.data.admin))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const { data } = await api.post('/auth/admin/login', { email, password });
    setAdmin(data.admin);
  }
  function logout() {
    api.post('/auth/admin/logout').catch(() => {});
    setAdmin(null);
  }

  return <Ctx.Provider value={{ admin, loading, login, logout }}>{children}</Ctx.Provider>;
}

export function useAdminAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAdminAuth must be inside AdminAuthProvider');
  return c;
}
