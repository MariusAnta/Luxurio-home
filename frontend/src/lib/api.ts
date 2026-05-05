import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
});

api.interceptors.request.use((config) => {
  const url = config.url ?? '';
  // Admin routes must use the admin JWT; all other routes use the user JWT.
  const isAdminRoute = url.startsWith('/admin') || url.startsWith('/auth/admin') || url.includes('/admin/');
  const token = isAdminRoute
    ? localStorage.getItem('luxurio_admin_token')
    : localStorage.getItem('luxurio_user_token') ?? localStorage.getItem('luxurio_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface ProductImage {
  id: string;
  url: string;
  alt?: string | null;
  order: number;
}
export interface Category {
  id: string;
  name: string;
  slug: string;
  number?: string | null;
  productCount?: number;
  coverImage?: string | null;
}
export interface Product {
  id: string;
  name: string;
  slug: string;
  designer?: string | null;
  description: string;
  price: string;
  discountPrice?: string | null;
  stock: number;
  featured: boolean;
  published: boolean;
  material?: string | null;
  color?: string | null;
  dimensions?: string | null;
  weightKg?: number | null;
  modelUrl?: string | null;
  category?: Category | null;
  images: ProductImage[];
}
export interface Admin {
  id: string;
  email: string;
  name?: string | null;
  role: 'SUPER_ADMIN' | 'ADMIN';
  createdAt?: string;
}
export interface User {
  id: string;
  email: string;
  name?: string | null;
}

export function formatPrice(p: string | number) {
  const n = typeof p === 'string' ? parseFloat(p) : p;
  return `€ ${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
