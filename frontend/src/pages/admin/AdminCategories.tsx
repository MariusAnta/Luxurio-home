import { FormEvent, useEffect, useState } from 'react';
import { api, Category } from '../../lib/api';

export function AdminCategories() {
  const [items, setItems] = useState<(Category & { productCount?: number })[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [number, setNumber] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [slugManual, setSlugManual] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    const { data } = await api.get('/categories');
    setItems(data);
  }
  useEffect(() => { load(); }, []);

  function reset() { setName(''); setSlug(''); setNumber(''); setEditing(null); setSlugManual(false); }

  function startEdit(c: Category) {
    setEditing(c.id);
    setName(c.name);
    setSlug(c.slug);
    setNumber(c.number ?? '');
    setSlugManual(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await api.put(`/categories/${editing}`, { name, slug, number: number || null });
      } else {
        await api.post('/categories', { name, slug, number: number || null });
      }
      reset();
      load();
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this category?')) return;
    await api.delete(`/categories/${id}`);
    load();
  }

  return (
    <>
      <p style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: 12 }}>Catalog</p>
      <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 48, marginBottom: 40 }}>Categories</h1>

      <form onSubmit={save} style={{
        background: 'var(--bg2)', padding: 24,
        border: '1px solid rgba(240,237,230,0.06)',
        marginBottom: 32,
      }}>
        <p style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: editing ? 'var(--gold)' : 'var(--fg3)', marginBottom: 16 }}>
          {editing ? 'Edit Category' : 'New Category'}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr auto auto', gap: 16, alignItems: 'end' }}>
          <div className="field" style={{ margin: 0 }}>
            <label>Name</label>
            <input value={name} onChange={(e) => {
              const n = e.target.value;
              setName(n);
              if (!slugManual) setSlug(n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
            }} required />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Slug <span style={{ color: 'var(--fg3)', fontWeight: 400 }}>{!slugManual ? '(auto)' : ''}</span></label>
            <input value={slug} onChange={(e) => { setSlugManual(true); setSlug(e.target.value); }} required pattern="[a-z0-9-]+" placeholder="lowercase-with-dashes" />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Number</label>
            <input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="001" />
          </div>
          <button className="btn" type="submit" disabled={submitting}>{editing ? 'Update' : 'Add'}</button>
          {editing && <button type="button" className="btn outline" onClick={reset}>Cancel</button>}
        </div>
      </form>

      <table>
        <thead>
          <tr><th>Name</th><th>Slug</th><th>Number</th><th>Products</th><th></th></tr>
        </thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.id} style={{ background: editing === c.id ? 'rgba(184,160,112,0.04)' : undefined }}>
              <td>{c.name}</td>
              <td style={{ color: 'var(--fg3)' }}>{c.slug}</td>
              <td style={{ color: 'var(--fg3)' }}>{c.number || '—'}</td>
              <td>{c.productCount ?? 0}</td>
              <td style={{ display: 'flex', gap: 8 }}>
                <button className="btn outline" onClick={() => startEdit(c)}>Edit</button>
                <button className="btn danger" onClick={() => remove(c.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
