import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserAuthProvider } from './lib/userAuth';
import { AdminAuthProvider } from './lib/adminAuth';
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { Favorites } from './pages/Favorites';
import { OurStory } from './pages/OurStory';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminAdmins } from './pages/admin/AdminAdmins';

export function App() {
  return (
    <BrowserRouter>
      <UserAuthProvider>
        <AdminAuthProvider>
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
            </Route>
          </Routes>
        </AdminAuthProvider>
      </UserAuthProvider>
    </BrowserRouter>
  );
}
