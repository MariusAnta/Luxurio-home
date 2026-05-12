import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  // Send httpOnly cookies on every request (JWT tokens are stored server-side in cookies)
  withCredentials: true,
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
  parentId?: string | null;
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
  assembled: boolean;
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

/** Price excluding 21% Lithuanian VAT (PVM). Prices in DB are incl. VAT. */
export function formatPriceExVat(p: string | number, vatRate = 0.21) {
  const n = typeof p === 'string' ? parseFloat(p) : p;
  const exVat = n / (1 + vatRate);
  return `€ ${exVat.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
