import { FormEvent, useEffect, useRef, useState } from 'react';
import { api, Category } from '../../lib/api';
import { useToast } from '../../lib/toast';

type CatRow = Category & { productCount?: number };

export function AdminCategories() {
  const toast = useToast();
  const [items, setItems] = useState<CatRow[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [slugManual, setSlugManual] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragId = useRef<string | null>(null);

  async function load() {
    const { data } = await api.get('/categories');
    setItems(data);
  }
  useEffect(() => { load(); }, []);

  function reset() { setName(''); setSlug(''); setParentId(''); setEditing(null); setSlugManual(false); }

  function startEdit(c: CatRow) {
    setEditing(c.id);
    setName(c.name);
    setSlug(c.slug);
    setParentId(c.parentId || '');
    setSlugManual(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { name, slug, parentId: parentId || null };
      if (editing) {
        await api.put(`/categories/${editing}`, payload);
        toast.success(`Category “${name}” updated`);
      } else {
        await api.post('/categories', payload);
        toast.success(`Category “${name}” created`);
      }
      reset();
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Could not save category');
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id: string, name: string) {
    const hasKids = items.some((c) => c.parentId === id);
    const msg = hasKids
      ? `"${name}" has subcategories. Deleting it will remove the parent grouping but keep the subcategories as top-level. Delete anyway?`
      : `Delete "${name}"?`;
    if (!confirm(msg)) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success(`Deleted “${name}”`);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Delete failed');
    }
  }

  const roots = items.filter((c) => !c.parentId);
  const childrenOf = (id: string) => items.filter((c) => c.parentId === id);
  // Only top-level categories can be selected as parent (prevents 3+ levels)
  const availableParents = items.filter((c) => !c.parentId && c.id !== editing);

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  function toggleExpand(id: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function onDragStart(id: string) { dragId.current = id; }
  function onDragEnd() { dragId.current = null; setDragOverId(null); }

  async function onDrop(targetId: string) {
    const from = dragId.current;
    if (!from || from === targetId) { setDragOverId(null); return; }
    const rootIds = roots.map((r) => r.id);
    const fromIdx = rootIds.indexOf(from);
    const toIdx = rootIds.indexOf(targetId);
    if (fromIdx === -1 || toIdx === -1) { setDragOverId(null); return; }
    const next = [...rootIds];
    next.splice(fromIdx, 1);
    next.splice(toIdx, 0, from);
    // Optimistic reorder in UI
    const idToItem = Object.fromEntries(items.map((c) => [c.id, c]));
    const reordered = [
      ...next.map((id) => idToItem[id]),
      ...items.filter((c) => c.parentId),
    ];
    setItems(reordered);
    setDragOverId(null);
    try {
      await api.post('/categories/reorder', { ids: next });
      toast.success('Order saved');
    } catch {
      toast.error('Failed to save order');
      load();
    }
  }

  return (
    <>
      <p style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: 12 }}>Catalog</p>
      <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 48, marginBottom: 40 }}>Categories</h1>

      <form onSubmit={save} style={{
        background: 'var(--bg2)', padding: 24,
        border: '1px solid rgba(26,23,20,0.07)',
        marginBottom: 32,
      }}>
        <p style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: editing ? 'var(--gold)' : 'var(--fg3)', marginBottom: 16 }}>
          {editing ? 'Edit Category' : 'New Category'}
        </p>
        <div className="cat-form-grid">
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
            <input value={slug} onChange={(e) => { setSlugManual(true); setSlug(e.target.value); }} required pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="lowercase-with-dashes" />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Parent <span style={{ color: 'var(--fg3)', fontWeight: 400 }}>(optional)</span></label>
            <select value={parentId} onChange={(e) => setParentId(e.target.value)}>
              <option value="">— none (top-level) —</option>
              {availableParents.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <button className="btn" type="submit" disabled={submitting}>{editing ? 'Update' : 'Add'}</button>
          {editing && <button type="button" className="btn outline" onClick={reset}>Cancel</button>}
        </div>
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th style={{ width: 28 }}></th><th>Name</th><th>Slug</th><th>Products</th><th></th></tr>
          </thead>
          <tbody>
            {roots.map((root) => {
              const kids = childrenOf(root.id);
              const totalProducts = (root.productCount ?? 0) + kids.reduce((s, k) => s + (k.productCount ?? 0), 0);
              return [
                <tr
                  key={root.id}
                  draggable
                  onDragStart={() => onDragStart(root.id)}
                  onDragEnd={onDragEnd}
                  onDragOver={(e) => { e.preventDefault(); setDragOverId(root.id); }}
                  onDrop={() => onDrop(root.id)}
                  style={{
                    background: editing === root.id ? 'rgba(184,160,112,0.04)' : undefined,
                    outline: dragOverId === root.id && dragId.current !== root.id ? '2px solid var(--gold)' : undefined,
                  }}
                >
                  <td style={{ cursor: 'grab', color: 'var(--fg3)', fontSize: 16, textAlign: 'center', userSelect: 'none' }} title="Drag to reorder">⠿</td>
                  <td style={{ fontWeight: 500 }}>
                    {kids.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => toggleExpand(root.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', fontWeight: 500, fontFamily: 'inherit', fontSize: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        <span style={{ fontSize: 10, transition: 'transform 0.15s', display: 'inline-block', transform: expanded.has(root.id) ? 'rotate(90deg)' : 'none' }}>▶</span>
                        {root.name}
                        <span style={{ fontSize: 10, color: 'var(--fg3)', fontWeight: 400 }}>({kids.length})</span>
                      </button>
                    ) : root.name}
                  </td>
                  <td style={{ color: 'var(--fg3)' }}>{root.slug}</td>
                  <td>{totalProducts}</td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    <button className="btn outline" onClick={() => startEdit(root)}>Edit</button>
                    <button className="btn danger" onClick={() => remove(root.id, root.name)}>Delete</button>
                  </td>
                </tr>,
                ...(expanded.has(root.id) ? kids.map((kid) => (
                  <tr key={kid.id} style={{ background: editing === kid.id ? 'rgba(184,160,112,0.04)' : undefined }}>
                    <td></td>
                    <td style={{ paddingLeft: 28, color: 'var(--fg2)' }}>└ {kid.name}</td>
                    <td style={{ color: 'var(--fg3)' }}>{kid.slug}</td>
                    <td>{kid.productCount ?? 0}</td>
                    <td style={{ display: 'flex', gap: 8 }}>
                      <button className="btn outline" onClick={() => startEdit(kid)}>Edit</button>
                      <button className="btn danger" onClick={() => remove(kid.id, kid.name)}>Delete</button>
                    </td>
                  </tr>
                )) : []),
              ];
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
