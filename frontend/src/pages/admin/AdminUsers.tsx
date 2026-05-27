import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

interface Customer {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  _count: { favorites: number };
}

type SortCol = 'email' | 'name' | 'favorites' | 'joined';

export function AdminUsers() {
  const [users, setUsers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortCol>('joined');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

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

  const sorted = [...filtered].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    switch (sortBy) {
      case 'email':     return a.email.localeCompare(b.email) * dir;
      case 'name':      return (a.name || '').localeCompare(b.name || '') * dir;
      case 'favorites': return (a._count.favorites - b._count.favorites) * dir;
      case 'joined':    return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
    }
  });
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function toggleSort(col: SortCol) {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir(col === 'joined' || col === 'favorites' ? 'desc' : 'asc'); }
    setPage(1);
  }
  const arrow = (col: SortCol) => sortBy === col ? (sortDir === 'asc' ? '▲' : '▼') : '↕';

  async function deleteUser(id: string, email: string) {
    if (!confirm(`Delete account "${email}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await api.delete(`/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } finally {
      setDeleting(null);
    }
  }

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
          onChange={e => { setSearch(e.target.value); setPage(1); }}
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
                <th className={`sortable${sortBy === 'email' ? ' sorted' : ''}`} onClick={() => toggleSort('email')}>
                  Email <span className="sort-arrow">{arrow('email')}</span>
                </th>
                <th className={`sortable${sortBy === 'name' ? ' sorted' : ''}`} onClick={() => toggleSort('name')}>
                  Name <span className="sort-arrow">{arrow('name')}</span>
                </th>
                <th className={`sortable${sortBy === 'favorites' ? ' sorted' : ''}`} onClick={() => toggleSort('favorites')}>
                  Favourites <span className="sort-arrow">{arrow('favorites')}</span>
                </th>
                <th className={`sortable${sortBy === 'joined' ? ' sorted' : ''}`} onClick={() => toggleSort('joined')}>
                  Joined <span className="sort-arrow">{arrow('joined')}</span>
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(u => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td style={{ color: u.name ? 'var(--fg)' : 'var(--fg3)' }}>{u.name || '—'}</td>
                  <td style={{ color: 'var(--fg3)' }}>{u._count.favorites}</td>
                  <td style={{ color: 'var(--fg3)', fontSize: 12 }}>
                    {new Date(u.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => deleteUser(u.id, u.email)}
                      disabled={deleting === u.id}
                      style={{
                        background: 'none', border: '1px solid rgba(180,60,60,0.35)',
                        color: deleting === u.id ? 'var(--fg3)' : '#c0392b',
                        padding: '5px 12px', fontSize: 10, letterSpacing: '0.18em',
                        textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--sans)',
                      }}
                    >
                      {deleting === u.id ? '…' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={5} style={{ color: 'var(--fg3)', textAlign: 'center', padding: 32 }}>No customers found.</td></tr>
              )}
            </tbody>
          </table>
          <div className="admin-pager">
            <div>
              Showing {sorted.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, sorted.length)} of {sorted.length}
            </div>
            <div className="pager-controls">
              <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
              </select>
              <button onClick={() => setPage(1)} disabled={currentPage === 1}>«</button>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>‹</button>
              <span style={{ padding: '0 10px' }}>{currentPage} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>›</button>
              <button onClick={() => setPage(totalPages)} disabled={currentPage === totalPages}>»</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
