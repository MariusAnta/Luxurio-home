import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { api, User } from './api';

interface UserAuthCtx {
  user: User | null;
  loading: boolean;
  favorites: Set<string>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  toggleFavorite: (productId: string) => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

const Ctx = createContext<UserAuthCtx | null>(null);

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const refreshFavorites = useCallback(async () => {
    try {
      const { data } = await api.get<string[]>('/favorites/ids');
      setFavorites(new Set(data));
    } catch {
      setFavorites(new Set());
    }
  }, []);

  useEffect(() => {
    // Cookie is sent automatically; 401 means not logged in
    api.get('/auth/me')
      .then(async (r) => {
        setUser(r.data.user);
        await refreshFavorites();
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refreshFavorites]);

  async function login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data.user);
    await refreshFavorites();
  }
  async function register(email: string, password: string, name?: string) {
    const { data } = await api.post('/auth/register', { email, password, name });
    setUser(data.user);
    await refreshFavorites();
  }
  function logout() {
    api.post('/auth/logout').catch(() => {});
    setUser(null);
    setFavorites(new Set());
  }

  async function toggleFavorite(productId: string) {
    if (!user) throw new Error('Login required');
    const isFav = favorites.has(productId);
    const next = new Set(favorites);
    if (isFav) {
      next.delete(productId);
      setFavorites(next);
      await api.delete(`/favorites/${productId}`);
    } else {
      next.add(productId);
      setFavorites(next);
      await api.post(`/favorites/${productId}`);
    }
  }

  return (
    <Ctx.Provider value={{ user, loading, favorites, login, register, logout, toggleFavorite, refreshFavorites }}>
      {children}
    </Ctx.Provider>
  );
}

export function useUserAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useUserAuth must be inside UserAuthProvider');
  return c;
}
