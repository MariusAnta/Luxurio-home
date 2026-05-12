import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

interface Customer {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  _count: { favorites: number };
}

export function AdminUsers() {
  const [users, setUsers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get<Customer[]>('/users')
      .then(r => setUsers(r.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    !search ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.name ?? '').toLowerCase().includes(search.toLowerCase())
  );

  function copyEmails() {
    const emails = users.map(u => u.email).join(', ');
    navigator.clipboard.writeText(emails).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <>
      <p style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: 12 }}>Accounts</p>
      <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 48, marginBottom: 40 }}>Customers</h1>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <p style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--fg3)' }}>
            {filtered.length} of {users.length} customers
          </p>
          <button
            type="button"
            onClick={copyEmails}
            disabled={users.length === 0}
            style={{
              background: copied ? 'rgba(100,180,100,0.12)' : 'var(--bg2)',
              border: '1px solid rgba(26,23,20,0.09)',
              color: copied ? '#2e7d2e' : 'var(--fg3)',
              padding: '7px 16px', fontSize: 9, letterSpacing: '0.2em',
              textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s',
              fontFamily: 'var(--sans)',
            }}
          >
            {copied ? '✓ Copied' : `Copy All Emails (${users.length})`}
          </button>
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          style={{ background: 'var(--bg2)', border: '1px solid rgba(26,23,20,0.09)', padding: '10px 16px', color: 'var(--fg)', fontSize: 13, outline: 'none', width: 280 }}
        />
      </div>

      {loading ? (
        <p style={{ color: 'var(--fg3)', fontSize: 13 }}>Loading…</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Favourites</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td style={{ color: u.name ? 'var(--fg)' : 'var(--fg3)' }}>{u.name || '—'}</td>
                  <td style={{ color: 'var(--fg3)' }}>{u._count.favorites}</td>
                  <td style={{ color: 'var(--fg3)', fontSize: 12 }}>
                    {new Date(u.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} style={{ color: 'var(--fg3)', textAlign: 'center', padding: 32 }}>No customers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
