import { FormEvent, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { api, Admin } from '../../lib/api';
import { useAdminAuth } from '../../lib/adminAuth';

export function AdminAdmins() {
  const { admin: me } = useAdminAuth();
  const [items, setItems] = useState<Admin[]>([]);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role] = useState<'ADMIN'>('ADMIN');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  if (me && me.role !== 'SUPER_ADMIN') return <Navigate to="/admin" replace />;

  async function load() {
    const { data } = await api.get<Admin[]>('/admins');
    setItems(data);
  }
  useEffect(() => { load(); }, []);

  async function add(e: FormEvent) {
    e.preventDefault();
    setErr('');
    setSubmitting(true);
    try {
      await api.post('/admins', { email, name: name || undefined, password, role });
      setEmail(''); setName(''); setPassword('');
      load();
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'Could not create admin');
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this admin account? This cannot be undone.')) return;
    try {
      await api.delete(`/admins/${id}`);
      load();
    } catch (e: any) {
      alert(e?.response?.data?.error || 'Delete failed');
    }
  }

  return (
    <>
      <p style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>Super Admin Only</p>
      <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 48, marginBottom: 40 }}>Admin Accounts</h1>

      <form onSubmit={add} style={{
        background: 'var(--bg2)', border: '1px solid rgba(26,23,20,0.07)',
        padding: 24, marginBottom: 32,
      }}>
        <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 22, marginBottom: 20 }}>Register New Admin</h2>
        <div className="admin-form-2col">
          <div className="field"><label>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div className="field"><label>Name</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Optional" /></div>
          <div className="field"><label>Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} /></div>
        </div>
        {err && <p style={{ color: '#b05050', fontSize: 12, marginBottom: 12 }}>{err}</p>}
        <button className="btn" type="submit" disabled={submitting}>Create Admin</button>
      </form>

      <div className="table-wrap">
      <table>
        <thead>
          <tr><th>Email</th><th>Name</th><th>Role</th><th>Created</th><th></th></tr>
        </thead>
        <tbody>
          {items.map((a) => (
            <tr key={a.id}>
              <td>{a.email}</td>
              <td style={{ color: 'var(--fg3)' }}>{a.name || '—'}</td>
              <td>
                <span style={{
                  fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: a.role === 'SUPER_ADMIN' ? 'var(--gold)' : 'var(--fg3)',
                }}>
                  {a.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                </span>
              </td>
              <td style={{ color: 'var(--fg3)', fontSize: 12 }}>
                {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ''}
              </td>
              <td>
                {a.id === me?.id ? (
                  <span style={{ color: 'var(--fg3)', fontSize: 11 }}>(you)</span>
                ) : (
                  <button className="btn danger" onClick={() => remove(a.id)}>Delete</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </>
  );
}
