import { Component, lazy, Suspense, useEffect, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { UserAuthProvider } from './lib/userAuth';
import { AdminAuthProvider } from './lib/adminAuth';
import { ToastProvider, BindGlobalToast } from './lib/toast';
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

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
const Terms        = lazy(() => import('./pages/TermsAndConditions').then(m => ({ default: m.TermsAndConditions })));
const Privacy      = lazy(() => import('./pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const Cookies      = lazy(() => import('./pages/CookiePolicy').then(m => ({ default: m.CookiePolicy })));
const OurStory     = lazy(() => import('./pages/OurStory').then(m => ({ default: m.OurStory })));

// Admin bundle — never shipped to public users
const AdminLogin      = lazy(() => import('./pages/admin/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminDashboard  = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminProducts   = lazy(() => import('./pages/admin/AdminProducts').then(m => ({ default: m.AdminProducts })));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories').then(m => ({ default: m.AdminCategories })));
const AdminAdmins     = lazy(() => import('./pages/admin/AdminAdmins').then(m => ({ default: m.AdminAdmins })));
const AdminUsers      = lazy(() => import('./pages/admin/AdminUsers').then(m => ({ default: m.AdminUsers })));
const AdminContent    = lazy(() => import('./pages/admin/AdminContent').then(m => ({ default: m.AdminContent })));
const AdminBgRemove   = lazy(() => import('./pages/admin/AdminBgRemove').then(m => ({ default: m.AdminBgRemove })));
const AdminNewSeason  = lazy(() => import('./pages/admin/AdminNewSeason').then(m => ({ default: m.AdminNewSeason })));

export function App() {
  return (
    <HelmetProvider>
    <BrowserRouter>
      <ScrollToTop />
      <UserAuthProvider>
        <AdminAuthProvider>
          <ToastProvider>
            <BindGlobalToast />
          <ErrorBoundary>
          <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route index element={<Home />} />
              <Route path="shop" element={<Shop />} />
              <Route path="product/:slug" element={<ProductDetail />} />
              <Route path="favorites" element={<Favorites />} />
              <Route path="terms" element={<Terms />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="cookies" element={<Cookies />} />
              <Route path="our-story" element={<OurStory />} />
            </Route>

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="admins" element={<AdminAdmins />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="content" element={<AdminContent />} />
              <Route path="bg-remove" element={<AdminBgRemove />} />
              <Route path="new-season" element={<AdminNewSeason />} />
            </Route>
          </Routes>
          </Suspense>
          </ErrorBoundary>
          </ToastProvider>
        </AdminAuthProvider>
      </UserAuthProvider>
    </BrowserRouter>
    </HelmetProvider>
  );
}
