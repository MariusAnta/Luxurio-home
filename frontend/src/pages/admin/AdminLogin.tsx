import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../lib/adminAuth';

export function AdminLogin() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr('');
    try {
      await login(email, password);
      navigate('/admin');
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'Login failed');
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div className="modal" style={{ position: 'static' }}>
        <p style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: 12 }}>The Atelier</p>
        <h2>Admin Sign In</h2>
        <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--fg2)', marginBottom: 32, marginTop: 8 }}>
          Manage the Luxurio collection.
        </p>
        <form onSubmit={onSubmit}>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {err && <p style={{ color: '#c97070', fontSize: 12, marginBottom: 16 }}>{err}</p>}
          <button className="btn" type="submit" style={{ width: '100%' }}>Sign In</button>
        </form>
      </div>
    </div>
  );
}
