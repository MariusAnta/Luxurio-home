import { FormEvent, useEffect, useRef, useState } from 'react';
import { api, Category, Product, formatPrice, formatPriceExVat } from '../../lib/api';

interface FormState {
  name: string;
  slug: string;
  designer: string;
  description: string;
  price: number;
  discountPrice: number | '';
  stock: number;
  featured: boolean;
  published: boolean;
  assembled: boolean;
  material: string;
  color: string;
  dimensions: string;
  modelUrl: string;
  categoryId: string;
  imageUrls: string[]; // first image is the main
}

const empty: FormState = {
  name: '', slug: '', designer: '', description: '',
  price: 0, discountPrice: '', stock: 0,
  featured: false, published: true, assembled: false,
  material: '', color: '', dimensions: '', modelUrl: '',
  categoryId: '', imageUrls: [''],
};

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<FormState>({ ...empty });
  const [editing, setEditing] = useState<string | null>(null);
  const [slugManual, setSlugManual] = useState(false);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');
  const [uploading, setUploading] = useState<Record<number, boolean>>({});
  const [uploadingModel, setUploadingModel] = useState(false);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const dragIdx = useRef<number | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const modelInputRef = useRef<HTMLInputElement | null>(null);

  async function load() {
    const [p, c] = await Promise.all([
      api.get<Product[]>('/products/admin/all'),
      api.get<Category[]>('/categories'),
    ]);
    setProducts(p.data);
    setCategories(c.data);
  }
  useEffect(() => { load(); }, []);

  function reset() { setForm({ ...empty, imageUrls: [''] }); setEditing(null); setErr(''); setSlugManual(false); }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr('');
    const cleanUrls = form.imageUrls.map((u) => u.trim()).filter(Boolean);
    if (cleanUrls.length === 0) {
      setErr('Add at least one image URL.');
      return;
    }
    const payload: any = {
      name: form.name,
      slug: form.slug,
      designer: form.designer || null,
      description: form.description,
      price: Number(form.price),
      discountPrice: form.discountPrice === '' ? null : Number(form.discountPrice),
      stock: Number(form.stock),
      featured: form.featured,
      published: form.published,
      assembled: form.assembled,
      material: form.material || null,
      color: form.color || null,
      dimensions: form.dimensions || null,
      modelUrl: form.modelUrl || null,
      categoryId: form.categoryId || null,
      images: cleanUrls.map((url, i) => ({ url, order: i })),
    };
    setSubmitting(true);
    try {
      if (editing) await api.put(`/products/${editing}`, payload);
      else await api.post('/products', payload);
      reset();
      load();
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  }

  function edit(p: Product) {
    setEditing(p.id);
    setSlugManual(true);
    setErr('');
    setForm({
      name: p.name, slug: p.slug, designer: p.designer || '',
      description: p.description,
      price: Number(p.price),
      discountPrice: p.discountPrice ? Number(p.discountPrice) : '',
      stock: p.stock,
      featured: p.featured, published: p.published, assembled: p.assembled ?? false,
      material: p.material || '', color: p.color || '', dimensions: p.dimensions || '',
      modelUrl: p.modelUrl || '',
      categoryId: p.category?.id || '',
      imageUrls: p.images.length ? p.images.map((i) => i.url) : [''],
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function remove(id: string) {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    load();
  }

  function setImg(i: number, value: string) {
    const next = [...form.imageUrls];
    next[i] = value;
    setForm({ ...form, imageUrls: next });
  }
  function addImg() { setForm({ ...form, imageUrls: [...form.imageUrls, ''] }); }
  function removeImg(i: number) {
    if (form.imageUrls.length === 1) return;
    setForm({ ...form, imageUrls: form.imageUrls.filter((_, idx) => idx !== i) });
  }
  function onDragStart(i: number) { dragIdx.current = i; }
  function onDragEnter(i: number) { setDragOver(i); }
  function onDragEnd() { dragIdx.current = null; setDragOver(null); }
  function onDrop(i: number) {
    const from = dragIdx.current;
    if (from === null || from === i) return;
    const next = [...form.imageUrls];
    const [moved] = next.splice(from, 1);
    next.splice(i, 0, moved);
    setForm({ ...form, imageUrls: next });
    dragIdx.current = null;
    setDragOver(null);
  }

  async function uploadFile(i: number, file: File) {
    setUploading(u => ({ ...u, [i]: true }));
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post<{ url: string }>('/uploads/image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImg(i, res.data.url);
    } catch {
      setErr('Image upload failed. Check file type/size (max 10 MB).');
    } finally {
      setUploading(u => ({ ...u, [i]: false }));
    }
  }

  async function quickToggle(id: string, field: 'published' | 'featured', current: boolean) {
    await api.put(`/products/${id}`, { [field]: !current });
    load();
  }

  return (
    <>
      <p style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: 12 }}>Catalog</p>
      <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 48, marginBottom: 40 }}>Products</h1>

      <form onSubmit={onSubmit} style={{
        background: 'var(--bg2)', border: '1px solid rgba(26,23,20,0.07)',
        padding: 32, marginBottom: 48,
      }}>
        <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 24, marginBottom: 24 }}>
          {editing ? 'Edit Product' : 'New Product'}
        </h2>
        <div className="admin-form-2col">
          <div className="field"><label>Name</label><input value={form.name} onChange={(e) => {
            const n = e.target.value;
            setForm(f => ({ ...f, name: n, ...(!slugManual ? { slug: n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') } : {}) }));
          }} required /></div>
          <div className="field"><label>Slug <span style={{ color: 'var(--fg3)', fontWeight: 400 }}>{!slugManual ? '(auto)' : ''}</span></label><input value={form.slug} onChange={(e) => { setSlugManual(true); setForm({ ...form, slug: e.target.value }); }} required pattern="[a-z0-9]+(-[a-z0-9]+)*" /></div>
          <div className="field"><label>Designer</label><input value={form.designer} onChange={(e) => setForm({ ...form, designer: e.target.value })} placeholder="Optional" /></div>
          <div className="field">
            <label>Category</label>
            <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">— none —</option>
              {(() => {
                const roots = categories.filter((c) => !c.parentId);
                const kids = (id: string) => categories.filter((c) => c.parentId === id);
                return roots.map((parent) => {
                  const children = kids(parent.id);
                  return children.length > 0 ? (
                    <optgroup key={parent.id} label={parent.name}>
                      {children.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </optgroup>
                  ) : (
                    <option key={parent.id} value={parent.id}>{parent.name}</option>
                  );
                });
              })()}
            </select>
          </div>
          <div className="field"><label>Price (€)</label><input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required /></div>
          <div className="field"><label>Discount Price (€)</label><input type="number" step="0.01" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value === '' ? '' : Number(e.target.value) })} placeholder="Optional — leave blank for no discount" /></div>
          <div className="field"><label>Stock</label><input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} /></div>
          <div className="field"><label>Material</label><input value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} /></div>
          <div className="field"><label>Color</label><input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} /></div>
          <div className="field"><label>Dimensions</label><input value={form.dimensions} onChange={(e) => setForm({ ...form, dimensions: e.target.value })} /></div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>3D Model <span style={{ color: 'var(--fg3)', fontWeight: 400 }}>(.glb — optional)</span></label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                style={{ flex: 1 }}
                value={form.modelUrl}
                onChange={(e) => setForm({ ...form, modelUrl: e.target.value })}
                placeholder="Paste URL or upload a .glb file →"
              />
              <button
                type="button"
                style={{ whiteSpace: 'nowrap', opacity: uploadingModel ? 0.5 : 1 }}
                disabled={uploadingModel}
                onClick={() => modelInputRef.current?.click()}
              >
                {uploadingModel ? 'Uploading…' : '↑ Upload .glb'}
              </button>
              <input
                ref={modelInputRef}
                type="file"
                accept=".glb,.gltf"
                style={{ display: 'none' }}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploadingModel(true);
                  try {
                    const fd = new FormData();
                    fd.append('file', file);
                    const res = await api.post<{ url: string }>('/uploads/model', fd);
                    setForm(f => ({ ...f, modelUrl: res.data.url }));
                  } catch {
                    alert('Model upload failed.');
                  } finally {
                    setUploadingModel(false);
                    e.target.value = '';
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className="field">
          <label>Description</label>
          <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>

        <div style={{ marginTop: 8, marginBottom: 24 }}>
          <p style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: 12 }}>
            Images <span style={{ color: 'var(--gold)' }}>(first one is the main)</span>
          </p>
          {form.imageUrls.map((url, i) => (
            <div
              key={i}
              draggable
              onDragStart={() => onDragStart(i)}
              onDragEnter={() => onDragEnter(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(i)}
              onDragEnd={onDragEnd}
              style={{
                display: 'grid',
                gridTemplateColumns: '20px 64px 1fr auto',
                gap: 8, marginBottom: 8, alignItems: 'center',
                opacity: dragIdx.current === i ? 0.4 : 1,
                outline: dragOver === i ? '1px solid var(--gold)' : 'none',
                transition: 'outline 0.1s',
              }}
            >
              {/* Drag handle */}
              <div style={{ cursor: 'grab', color: 'var(--fg3)', fontSize: 16, textAlign: 'center', userSelect: 'none', lineHeight: 1 }}>
                ⠿
              </div>
              {/* Thumbnail preview */}
              <div style={{
                width: 64, height: 64, background: 'var(--bg)',
                border: '1px solid rgba(26,23,20,0.09)',
                position: 'relative', overflow: 'hidden',
              }}>
                {url ? <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                {uploading[i] && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--fg3)' }}>...</div>
                )}
                {i === 0 && <span style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: 'var(--gold)', color: 'var(--bg)',
                  fontSize: 8, letterSpacing: '0.15em', textAlign: 'center', padding: '2px 0',
                }}>MAIN</span>}
              </div>
              {/* URL input or file pick */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <input value={url} onChange={(e) => setImg(i, e.target.value)} placeholder="Paste URL or upload file below"
                  style={{ background: 'var(--bg)', border: '1px solid rgba(26,23,20,0.09)', padding: '10px 14px', color: 'var(--fg)', fontSize: 13, outline: 'none' }} />
                <input
                  type="file" accept="image/jpeg,image/png,image/webp,image/avif"
                  ref={(el) => { fileInputRefs.current[i] = el; }}
                  style={{ display: 'none' }}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(i, f); }}
                />
                <button type="button" className="btn outline"
                  style={{ padding: '5px 10px', fontSize: 11 }}
                  onClick={() => fileInputRefs.current[i]?.click()}
                  disabled={uploading[i]}
                >
                  {uploading[i] ? 'Uploading…' : '↑ Upload file'}
                </button>
              </div>
              <button type="button" onClick={() => removeImg(i)} disabled={form.imageUrls.length === 1} className="btn outline" style={{ padding: '10px 12px', alignSelf: 'start', marginTop: 1 }}>×</button>
            </div>
          ))}
          <button type="button" className="btn outline" onClick={addImg} style={{ marginTop: 8 }}>+ Add Image</button>
        </div>

        <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--fg2)' }}>
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
            Featured
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--fg2)' }}>
            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
            Published
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--fg2)' }}>
            <input type="checkbox" checked={form.assembled} onChange={(e) => setForm({ ...form, assembled: e.target.checked })} />
            Assembled
          </label>
        </div>

        {err && <p style={{ color: '#b05050', fontSize: 12, marginBottom: 16 }}>{err}</p>}

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn" type="submit" disabled={submitting}>{editing ? 'Update' : 'Create'}</button>
          {editing && <button type="button" className="btn outline" onClick={reset}>Cancel</button>}
        </div>
      </form>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <p style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--fg3)' }}>
          {products.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.designer?.toLowerCase().includes(search.toLowerCase())).length} of {products.length} products
        </p>
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or designer…"
          style={{ background: 'var(--bg2)', border: '1px solid rgba(26,23,20,0.09)', padding: '10px 16px', color: 'var(--fg)', fontSize: 13, outline: 'none', width: 280 }}
        />
      </div>

      <div className="table-wrap">
      <table>
        <thead>
          <tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {products.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.designer?.toLowerCase().includes(search.toLowerCase())).map((p) => (
            <tr key={p.id}>
              <td style={{ width: 56 }}>
                {p.images[0] && <img src={p.images[0].url} alt="" style={{ width: 48, height: 48, objectFit: 'cover' }} />}
              </td>
              <td>
                {p.name}
                {p.designer && <div style={{ color: 'var(--fg3)', fontSize: 11 }}>{p.designer}</div>}
              </td>
              <td style={{ color: 'var(--fg3)' }}>{p.category?.name || '—'}</td>
              <td>
                {p.discountPrice && Number(p.discountPrice) < Number(p.price) ? (
                  <>
                    <div style={{ color: 'var(--gold)' }}>{formatPrice(p.discountPrice)}</div>
                    <div style={{ color: 'var(--fg3)', textDecoration: 'line-through', fontSize: 11 }}>{formatPrice(p.price)}</div>
                  </>
                ) : formatPrice(p.price)}
                <div style={{ color: 'var(--fg3)', fontSize: 10, marginTop: 2 }}>
                  {formatPriceExVat(p.discountPrice && Number(p.discountPrice) < Number(p.price) ? p.discountPrice : p.price)} excl. PVM
                </div>
              </td>
              <td>{p.stock}</td>
              <td>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button onClick={() => quickToggle(p.id, 'published', p.published)} title="Click to toggle" style={{
                    padding: '4px 10px', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase',
                    border: 'none', cursor: 'pointer', borderRadius: 2,
                    background: p.published ? 'rgba(100,180,100,0.12)' : 'rgba(240,237,230,0.06)',
                    color: p.published ? '#7ec87e' : 'var(--fg3)',
                  }}>{p.published ? '● Live' : '○ Draft'}</button>
                  <button onClick={() => quickToggle(p.id, 'featured', p.featured)} title="Click to toggle" style={{
                    padding: '4px 10px', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase',
                    border: 'none', cursor: 'pointer', borderRadius: 2,
                    background: p.featured ? 'rgba(184,160,112,0.12)' : 'rgba(240,237,230,0.06)',
                    color: p.featured ? 'var(--gold)' : 'var(--fg3)',
                  }}>{p.featured ? '★ Featured' : '☆'}</button>
                  {(p as any).modelUrl && <span style={{ padding: '4px 8px', fontSize: 9, letterSpacing: '0.12em', background: 'rgba(110,130,220,0.12)', color: '#8899ee', borderRadius: 2 }}>3D</span>}
                </div>
              </td>
              <td style={{ display: 'flex', gap: 8 }}>
                <button className="btn outline" onClick={() => edit(p)}>Edit</button>
                <button className="btn danger" onClick={() => remove(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </>
  );
}
