import { NavLink, Outlet, Navigate, Link } from 'react-router-dom';
import { useAdminAuth } from '../lib/adminAuth';

export function AdminLayout() {
  const { admin, loading, logout } = useAdminAuth();
  if (loading) return <main style={{ padding: 80, color: 'var(--fg3)' }}>Loading…</main>;
  if (!admin) return <Navigate to="/admin/login" replace />;

  return (
    <>
      <nav style={{
        height: 64, padding: '0 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(240,237,230,0.06)',
        background: 'var(--bg2)',
      }}>
        <Link to="/" style={{ fontFamily: 'var(--serif)', fontSize: 16, letterSpacing: '0.4em' }}>
          LUXURIO <span style={{ color: 'var(--gold)' }}>· ATELIER</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <span style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fg3)' }}>
            {admin.email} · {admin.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
          </span>
          <a onClick={logout} style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fg3)', cursor: 'pointer' }}>
            Logout
          </a>
        </div>
      </nav>
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <NavLink to="/admin" end>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" style={{ marginRight: 10, opacity: 0.7, flexShrink: 0 }}><rect x="0" y="0" width="7" height="7" rx="1"/><rect x="9" y="0" width="7" height="7" rx="1"/><rect x="0" y="9" width="7" height="7" rx="1"/><rect x="9" y="9" width="7" height="7" rx="1"/></svg>
            Dashboard
          </NavLink>
          <NavLink to="/admin/products">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginRight: 10, opacity: 0.7, flexShrink: 0 }}><rect x="1" y="1" width="14" height="14" rx="1"/><line x1="1" y1="5" x2="15" y2="5"/><line x1="5" y1="1" x2="5" y2="5"/></svg>
            Products
          </NavLink>
          <NavLink to="/admin/categories">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginRight: 10, opacity: 0.7, flexShrink: 0 }}><path d="M1 4h5l2-3h7v11H1z"/></svg>
            Categories
          </NavLink>
          {admin.role === 'SUPER_ADMIN' && (
            <NavLink to="/admin/admins">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginRight: 10, opacity: 0.7, flexShrink: 0 }}><circle cx="8" cy="5" r="3"/><path d="M2 14c0-3 2.7-5 6-5s6 2 6 5"/></svg>
              Admins
            </NavLink>
          )}
        </aside>
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </>
  );
}
