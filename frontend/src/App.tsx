import { Component, lazy, Suspense, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { UserAuthProvider } from './lib/userAuth';
import { AdminAuthProvider } from './lib/adminAuth';
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16, textAlign: 'center' }}>
          <p style={{ color: 'var(--fg2)', letterSpacing: '0.05em' }}>Something went wrong loading this page.</p>
          <button className="btn" onClick={() => this.setState({ error: null })}>Retry</button>
        </main>
      );
    }
    return this.props.children;
  }
}

// Eagerly-loaded: tiny wrappers, always needed on first paint
// Lazy-loaded: page bundles split by route
const Home         = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Shop         = lazy(() => import('./pages/Shop').then(m => ({ default: m.Shop })));
const ProductDetail= lazy(() => import('./pages/ProductDetail').then(m => ({ default: m.ProductDetail })));
const Favorites    = lazy(() => import('./pages/Favorites').then(m => ({ default: m.Favorites })));
const OurStory     = lazy(() => import('./pages/OurStory').then(m => ({ default: m.OurStory })));

// Admin bundle — never shipped to public users
const AdminLogin      = lazy(() => import('./pages/admin/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminDashboard  = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminProducts   = lazy(() => import('./pages/admin/AdminProducts').then(m => ({ default: m.AdminProducts })));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories').then(m => ({ default: m.AdminCategories })));
const AdminAdmins     = lazy(() => import('./pages/admin/AdminAdmins').then(m => ({ default: m.AdminAdmins })));
const AdminUsers      = lazy(() => import('./pages/admin/AdminUsers').then(m => ({ default: m.AdminUsers })));
const AdminSettings   = lazy(() => import('./pages/admin/AdminSettings').then(m => ({ default: m.AdminSettings })));

export function App() {
  return (
    <HelmetProvider>
    <BrowserRouter>
      <UserAuthProvider>
        <AdminAuthProvider>
          <ErrorBoundary>
          <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route index element={<Home />} />
              <Route path="shop" element={<Shop />} />
              <Route path="product/:slug" element={<ProductDetail />} />
              <Route path="favorites" element={<Favorites />} />
              <Route path="our-story" element={<OurStory />} />
            </Route>

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="admins" element={<AdminAdmins />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Routes>
          </Suspense>
          </ErrorBoundary>
        </AdminAuthProvider>
      </UserAuthProvider>
    </BrowserRouter>
    </HelmetProvider>
  );
}
