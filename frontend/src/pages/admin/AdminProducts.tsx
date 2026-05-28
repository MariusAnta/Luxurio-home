import { FormEvent, useEffect, useRef, useState } from 'react';
import { api, Category, Product, formatPrice, formatPriceExVat, resolveUrl } from '../../lib/api';
import { BgRemoveModal } from '../../components/BgRemoveModal';
import { useToast } from '../../lib/toast';

interface FormState {
  name: string;
  slug: string;
  designer: string;
  description: string;
  price: number;
  discountPrice: number | '';
  stock: number | '';
  featured: boolean;
  published: boolean;
  assembled: boolean;
  material: { name: string; desc: string }[];
  color: string[];
  dimensionEntries: { name: string; value: string }[];
  modelUrl: string;
  categoryId: string;
  imageUrls: string[]; // first image is the main
}

const empty: FormState = {
  name: '', slug: '', designer: '', description: '',
  price: 0, discountPrice: '', stock: '',
  featured: false, published: true, assembled: false,
  material: [], color: [], dimensionEntries: [], modelUrl: '',
  categoryId: '', imageUrls: [''],
};

export function AdminProducts() {
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<FormState>({ ...empty });
  const [editing, setEditing] = useState<string | null>(null);
  const [slugManual, setSlugManual] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [catDropOpen, setCatDropOpen] = useState(false);
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDiscount, setBulkDiscount] = useState('');
  const [bulkApplying, setBulkApplying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');
  const [uploading, setUploading] = useState<Record<number, boolean>>({});
  const [uploadingModel, setUploadingModel] = useState(false);
  const [uploadingMulti, setUploadingMulti] = useState(false);
  const [bgRemove, setBgRemove] = useState<{ idx: number; source: File | string } | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [formTab, setFormTab] = useState<'basic' | 'pricing' | 'media' | 'details'>('basic');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'category' | 'status'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const dragIdx = useRef<number | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const modelInputRef = useRef<HTMLInputElement | null>(null);
  const multiUploadRef = useRef<HTMLInputElement | null>(null);

  async function load() {
    const [p, c] = await Promise.all([
      api.get<Product[]>('/products/admin/all'),
      api.get<Category[]>('/categories'),
    ]);
    setProducts(p.data);
    setCategories(c.data);
  }
  useEffect(() => { load(); }, []);

  function reset() { setForm({ ...empty, imageUrls: [''] }); setEditing(null); setErr(''); setSlugManual(false); setFormTab('basic'); }

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
      stock: form.stock === '' ? 0 : Number(form.stock),
      featured: form.featured,
      published: form.published,
      assembled: form.assembled,
      color: form.color.length ? form.color.join(',') : null,
      material: form.material.length ? JSON.stringify(form.material) : null,
      dimensions: form.dimensionEntries.filter(e => e.name || e.value).length
        ? JSON.stringify(form.dimensionEntries.filter(e => e.name || e.value))
        : null,
      modelUrl: form.modelUrl || null,
      categoryId: form.categoryId || null,
      images: cleanUrls.map((url, i) => ({ url, order: i })),
    };
    setSubmitting(true);
    try {
      if (editing) {
        await api.put(`/products/${editing}`, payload);
        toast.success(`“${form.name}” updated`);
      } else {
        await api.post('/products', payload);
        toast.success(`“${form.name}” created`);
      }
      reset();
      load();
    } catch (e: any) {
      const msg = e?.response?.data?.error || 'Save failed';
      setErr(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  function edit(p: Product) {
    setEditing(p.id);
    setSlugManual(true);
    setErr('');
    setFormTab('basic');
    setForm({
      name: p.name, slug: p.slug, designer: p.designer || '',
      description: p.description,
      price: Number(p.price),
      discountPrice: p.discountPrice ? Number(p.discountPrice) : '',
      stock: p.stock,
      featured: p.featured, published: p.published, assembled: p.assembled ?? false,
      material: (() => {
        if (!p.material) return [];
        try {
          const parsed = JSON.parse(p.material);
          return Array.isArray(parsed) ? parsed : [{ name: '', desc: p.material }];
        } catch { return [{ name: '', desc: p.material }]; }
      })(),
      color: p.color ? p.color.split(',').map((s) => s.trim()).filter(Boolean) : [],
      ...(() => {
        if (!p.dimensions) return { dimensionEntries: [] };
        try {
          const parsed = JSON.parse(p.dimensions);
          return Array.isArray(parsed) ? { dimensionEntries: parsed } : { dimensionEntries: [{ name: 'Overall', value: p.dimensions }] };
        } catch { return { dimensionEntries: [{ name: 'Overall', value: p.dimensions }] }; }
      })(),
      modelUrl: p.modelUrl || '',
      categoryId: p.category?.id || '',
      imageUrls: p.images.length ? p.images.map((i) => i.url) : [''],
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function remove(id: string) {
    const target = products.find(p => p.id === id);
    if (!confirm(`Delete “${target?.name ?? 'this product'}”?`)) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success(`Deleted “${target?.name ?? 'product'}”`);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Delete failed');
    }
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
      toast.success('Image uploaded');
    } catch {
      setErr('Image upload failed. Check file type/size (max 10 MB).');
      toast.error('Image upload failed');
    } finally {
      setUploading(u => ({ ...u, [i]: false }));
    }
  }

  async function uploadMultipleFiles(files: FileList) {
    if (files.length === 0) return;
    setUploadingMulti(true);
    try {
      const results = await Promise.allSettled(
        Array.from(files).map(async (file) => {
          const fd = new FormData();
          fd.append('file', file);
          const res = await api.post<{ url: string }>('/uploads/image', fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          return res.data.url;
        })
      );
      const urls = results
        .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
        .map((r) => r.value);
      const failed = results.filter((r) => r.status === 'rejected').length;
      setForm((f) => {
        const prev = f.imageUrls.filter(Boolean);
        return { ...f, imageUrls: [...prev, ...urls, ''] };
      });
      if (urls.length) toast.success(`${urls.length} image${urls.length > 1 ? 's' : ''} uploaded`);
      if (failed) toast.error(`${failed} upload${failed > 1 ? 's' : ''} failed`);
    } catch {
      toast.error('Multi-upload failed');
    } finally {
      setUploadingMulti(false);
      if (multiUploadRef.current) multiUploadRef.current.value = '';
    }
  }

  async function quickToggle(id: string, field: 'published' | 'featured', current: boolean) {
    await api.put(`/products/${id}`, { [field]: !current });
    load();
  }

  async function applyBulkDiscount(ids: string[], discountPercent: number | null) {
    setBulkApplying(true);
    try {
      await api.post('/products/bulk-discount', { ids, discountPercent });
      toast.success(discountPercent === null
        ? `Discount removed from ${ids.length} product${ids.length > 1 ? 's' : ''}`
        : `Applied ${discountPercent}% off to ${ids.length} product${ids.length > 1 ? 's' : ''}`);
      setSelected(new Set());
      setBulkDiscount('');
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Bulk update failed');
    } finally {
      setBulkApplying(false);
    }
  }

  const matchesCategory = (p: Product) => {
    if (!categoryFilter) return true;
    if (p.category?.id === categoryFilter) return true;
    // also match if selected category is a parent of the product's category
    const productCat = categories.find(c => c.id === p.category?.id);
    return productCat?.parentId === categoryFilter;
  };

  const filtered = products.filter(p =>
    (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.designer?.toLowerCase().includes(search.toLowerCase())) &&
    matchesCategory(p)
  );

  // ── Sort + paginate ──
  const sorted = [...filtered].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    switch (sortBy) {
      case 'name':     return a.name.localeCompare(b.name) * dir;
      case 'category': return (a.category?.name || '').localeCompare(b.category?.name || '') * dir;
      case 'price': {
        const pa = a.discountPrice && Number(a.discountPrice) < Number(a.price) ? Number(a.discountPrice) : Number(a.price);
        const pb = b.discountPrice && Number(b.discountPrice) < Number(b.price) ? Number(b.discountPrice) : Number(b.price);
        return (pa - pb) * dir;
      }
      case 'stock':  return (a.stock - b.stock) * dir;
      case 'status': return ((a.published ? 1 : 0) - (b.published ? 1 : 0)) * dir;
      default: return 0;
    }
  });
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function toggleSort(col: typeof sortBy) {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
    setPage(1);
  }
  const sortArrow = (col: typeof sortBy) => sortBy === col ? (sortDir === 'asc' ? '▲' : '▼') : '↕';

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

        <div className="admin-tabs" role="tablist">
          {([
            { id: 'basic', label: 'Basic' },
            { id: 'pricing', label: 'Pricing' },
            { id: 'media', label: 'Media' },
            { id: 'details', label: 'Details' },
          ] as const).map(t => (
            <button key={t.id} type="button" role="tab"
              aria-selected={formTab === t.id}
              className={`admin-tab${formTab === t.id ? ' active' : ''}`}
              onClick={() => setFormTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {formTab === 'basic' && (
        <div className="admin-form-2col">
          <div className="field"><label>Name</label><input value={form.name} onChange={(e) => {
            const n = e.target.value;
            setForm(f => ({ ...f, name: n, ...(!slugManual ? { slug: n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') } : {}) }));
          }} required /></div>
          <div className="field"><label>Slug <span style={{ color: 'var(--fg3)', fontWeight: 400 }}>{!slugManual ? '(auto)' : ''}</span></label><input value={form.slug} onChange={(e) => { setSlugManual(true); setForm({ ...form, slug: e.target.value }); }} required pattern="[a-z0-9]+(-[a-z0-9]+)*" /></div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
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
        </div>
        )}

        {formTab === 'pricing' && (
        <div className="admin-form-2col">
          <div className="field">
            <label>Price (€)</label>
            <input type="number" step="0.01" value={form.price === 0 ? '' : form.price} onChange={(e) => setForm({ ...form, price: e.target.value === '' ? 0 : Number(e.target.value) })} required />
            {form.price > 0 && <div style={{ fontSize: 11, color: 'var(--fg3)', marginTop: 4 }}>{formatPriceExVat(form.price)} excl. PVM</div>}
          </div>
          <div className="field">
            <label>Discount Price (€)</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="number" step="0.01" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value === '' ? '' : Number(e.target.value) })} placeholder="Fixed price" style={{ flex: 1 }} />
              <span style={{ color: 'var(--fg3)', fontSize: 12 }}>or</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <input type="number" min="1" max="99" step="1" placeholder="%" disabled={form.price <= 0}
                  onChange={(e) => {
                    const pct = Number(e.target.value);
                    if (pct > 0 && pct < 100 && form.price > 0)
                      setForm(f => ({ ...f, discountPrice: Math.round(f.price * (1 - pct / 100) * 100) / 100 }));
                  }}
                  style={{ width: 64 }} />
                <span style={{ fontSize: 13, color: 'var(--fg2)' }}>% off</span>
              </div>
            </div>
            {form.discountPrice !== '' && Number(form.discountPrice) > 0 && (
              <div style={{ fontSize: 11, color: 'var(--fg3)', marginTop: 4 }}>
                {formatPriceExVat(form.discountPrice)} excl. PVM
                {form.price > 0 && Number(form.discountPrice) < form.price && (
                  <span style={{ color: 'var(--gold)', marginLeft: 8 }}>
                    −{Math.round((1 - Number(form.discountPrice) / form.price) * 100)}%
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="field"><label>Stock</label>
            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value === '' ? '' : Math.max(0, Number(e.target.value)) })}
              style={{ width: '100%' }}
              placeholder="Enter stock"
              required
            />
          </div>
          <div className="field" style={{ gridColumn: '1 / -1', flexDirection: 'row', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--fg2)', textTransform: 'none', letterSpacing: 0 }}>
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
              Published <span style={{ color: 'var(--fg3)', fontSize: 11 }}>(visible on shop)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--fg2)', textTransform: 'none', letterSpacing: 0 }}>
              <input type="checkbox" checked={form.assembled} onChange={(e) => setForm({ ...form, assembled: e.target.checked })} />
              Assembled
            </label>
          </div>
        </div>
        )}

        {formTab === 'details' && (
        <div className="admin-form-2col">
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>Materials <span style={{ color: 'var(--fg3)', fontWeight: 400, fontSize: 11 }}>(shown as structured MATERIALS section on product page)</span></label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
              {form.material.map((entry, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 8, alignItems: 'start', padding: '12px', background: 'var(--bg)', border: '1px solid rgba(26,23,20,0.09)' }}>
                  <div className="field" style={{ margin: 0 }}>
                    <label style={{ fontSize: 10 }}>Name <span style={{ color: 'var(--fg3)' }}>(e.g. Inner Frame / Feet)</span></label>
                    <input
                      value={entry.name}
                      onChange={(e) => {
                        const next = [...form.material];
                        next[i] = { ...next[i], name: e.target.value };
                        setForm({ ...form, material: next });
                      }}
                      placeholder="e.g. Seat / Back Padding"
                    />
                  </div>
                  <div className="field" style={{ margin: 0 }}>
                    <label style={{ fontSize: 10 }}>Description</label>
                    <textarea
                      rows={3}
                      value={entry.desc}
                      onChange={(e) => {
                        const next = [...form.material];
                        next[i] = { ...next[i], desc: e.target.value };
                        setForm({ ...form, material: next });
                      }}
                      placeholder="Describe this component..."
                    />
                  </div>
                  <button
                    type="button"
                    className="btn outline"
                    style={{ padding: '8px 12px', marginTop: 22 }}
                    onClick={() => setForm({ ...form, material: form.material.filter((_, idx) => idx !== i) })}
                  >×</button>
                </div>
              ))}
              <button
                type="button"
                className="btn outline"
                style={{ alignSelf: 'flex-start' }}
                onClick={() => setForm({ ...form, material: [...form.material, { name: '', desc: '' }] })}
              >+ Add material entry</button>
            </div>
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>Colors <span style={{ color: 'var(--fg3)', fontWeight: 400, fontSize: 11 }}>(select all that apply)</span></label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', marginTop: 6 }}>
              {['Black','White','Grey','Beige','Brown','Cream','Navy','Blue','Green','Red','Pink','Yellow','Orange','Gold','Silver','Walnut','Oak','Marble'].map((c) => (
                <label key={c} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--fg2)', cursor: 'pointer', textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>
                  <input
                    type="checkbox"
                    checked={form.color.includes(c)}
                    onChange={(e) => setForm({ ...form, color: e.target.checked ? [...form.color, c] : form.color.filter((x) => x !== c) })}
                  />
                  {c}
                </label>
              ))}
            </div>
            {form.color.length > 0 && (
              <div style={{ marginTop: 8, fontSize: 11, color: 'var(--fg3)' }}>
                Selected: {form.color.join(', ')}
              </div>
            )}
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>Dimensions <span style={{ color: 'var(--fg3)', fontWeight: 400, fontSize: 11 }}>(optional — add as many entries as needed)</span></label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
              {form.dimensionEntries.map((entry, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '160px 1fr auto', gap: 8, alignItems: 'center' }}>
                  <input
                    value={entry.name}
                    onChange={(e) => {
                      const next = [...form.dimensionEntries];
                      next[i] = { ...next[i], name: e.target.value };
                      setForm({ ...form, dimensionEntries: next });
                    }}
                    placeholder="e.g. Overall, Seat height"
                  />
                  <input
                    value={entry.value}
                    onChange={(e) => {
                      const next = [...form.dimensionEntries];
                      next[i] = { ...next[i], value: e.target.value };
                      setForm({ ...form, dimensionEntries: next });
                    }}
                    placeholder="e.g. W 200 × H 90 × D 45 cm"
                  />
                  <button
                    type="button"
                    className="btn outline"
                    style={{ padding: '8px 12px' }}
                    onClick={() => setForm({ ...form, dimensionEntries: form.dimensionEntries.filter((_, idx) => idx !== i) })}
                  >×</button>
                </div>
              ))}
              <button
                type="button"
                className="btn outline"
                style={{ alignSelf: 'flex-start', marginTop: 2 }}
                onClick={() => setForm({ ...form, dimensionEntries: [...form.dimensionEntries, { name: '', value: '' }] })}
              >+ Add dimension</button>
            </div>
          </div>
        </div>
        )}

        {formTab === 'media' && (
        <div>
          <div className="field">
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
                    toast.success('3D model uploaded');
                  } catch {
                    toast.error('Model upload failed');
                  } finally {
                    setUploadingModel(false);
                    e.target.value = '';
                  }
                }}
              />
            </div>
          </div>
        </div>
        )}

        {formTab === 'media' && (
        <div style={{ marginTop: 8, marginBottom: 24 }}>
          <p style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: 12 }}>
            Images <span style={{ color: 'var(--gold)' }}>(first one is the main — drag ⠿ to reorder)</span>
          </p>
          <div style={{ marginBottom: 16 }}>
            <input
              ref={multiUploadRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => { if (e.target.files?.length) uploadMultipleFiles(e.target.files); }}
            />
            <button
              type="button"
              className="btn"
              disabled={uploadingMulti}
              onClick={() => multiUploadRef.current?.click()}
              style={{ fontSize: 12 }}
            >
              {uploadingMulti ? 'Uploading…' : '↑ Upload multiple images'}
            </button>
            <span style={{ fontSize: 11, color: 'var(--fg3)', marginLeft: 10 }}>Select up to 10 files at once</span>
          </div>
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
                {url ? <img src={resolveUrl(url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
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
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="button" className="btn outline"
                    style={{ padding: '5px 10px', fontSize: 11, flex: 1 }}
                    onClick={() => fileInputRefs.current[i]?.click()}
                    disabled={uploading[i]}
                  >
                    {uploading[i] ? 'Uploading…' : '↑ Upload file'}
                  </button>
                  <button type="button" className="btn outline"
                    title="Remove background (AI, runs in browser)"
                    style={{ padding: '5px 10px', fontSize: 11, whiteSpace: 'nowrap', color: 'var(--gold)', borderColor: 'var(--gold)' }}
                    disabled={!url || uploading[i]}
                    onClick={() => setBgRemove({ idx: i, source: url })}
                  >
                    ✂ Remove BG
                  </button>
                </div>
              </div>
              <button type="button" onClick={() => removeImg(i)} disabled={form.imageUrls.length === 1} className="btn outline" style={{ padding: '10px 12px', alignSelf: 'start', marginTop: 1 }}>×</button>
            </div>
          ))}
          <button type="button" className="btn outline" onClick={addImg} style={{ marginTop: 8 }}>+ Add Image</button>
        </div>
        )}

        {err && <p style={{ color: '#b05050', fontSize: 12, marginBottom: 16, marginTop: 16 }}>{err}</p>}

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn" type="submit" disabled={submitting}>{editing ? 'Update' : 'Create'}</button>
          {editing && <button type="button" className="btn outline" onClick={reset}>Cancel</button>}
        </div>
      </form>

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" onClick={() => setCatDropOpen(o => !o)} style={{
            background: catDropOpen ? 'rgba(26,23,20,0.06)' : 'var(--bg2)',
            border: '1px solid rgba(26,23,20,0.09)', padding: '8px 14px',
            color: 'var(--fg)', fontSize: 12, cursor: 'pointer', letterSpacing: '0.08em',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            ☰ Categories {categoryFilter && <span style={{ color: 'var(--gold)', fontSize: 10 }}>●</span>}
          </button>
          {categoryFilter && (
            <button type="button" onClick={() => setCategoryFilter('')} style={{
              background: 'none', border: 'none', color: 'var(--fg3)', fontSize: 11, cursor: 'pointer',
            }}>
              {categories.find(c => c.id === categoryFilter)?.name} ✕
            </button>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <p style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--fg3)' }}>
            {filtered.length} of {products.length} products
          </p>
          <input
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or designer…"
            style={{ background: 'var(--bg2)', border: '1px solid rgba(26,23,20,0.09)', padding: '10px 16px', color: 'var(--fg)', fontSize: 13, outline: 'none', width: 260 }}
          />
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', marginBottom: 8, background: 'rgba(184,160,112,0.08)', border: '1px solid rgba(184,160,112,0.2)' }}>
          <span style={{ fontSize: 12, color: 'var(--fg2)' }}>{selected.size} product{selected.size > 1 ? 's' : ''} selected</span>
          <span style={{ color: 'var(--fg3)', fontSize: 12 }}>— Discount %:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <input
              type="number" min="1" max="99" step="1" value={bulkDiscount}
              onChange={(e) => setBulkDiscount(e.target.value)}
              placeholder="e.g. 20"
              style={{ background: 'var(--bg2)', border: '1px solid rgba(26,23,20,0.09)', padding: '6px 12px', color: 'var(--fg)', fontSize: 13, outline: 'none', width: 90 }}
            />
            <span style={{ fontSize: 13, color: 'var(--fg2)' }}>%</span>
          </div>
          <button onClick={() => applyBulkDiscount([...selected], Number(bulkDiscount))} disabled={bulkApplying || bulkDiscount === ''} className="btn" style={{ padding: '6px 14px', fontSize: 12 }}>
            Apply
          </button>
          <button onClick={() => applyBulkDiscount([...selected], null)} disabled={bulkApplying} className="btn outline" style={{ padding: '6px 14px', fontSize: 12 }}>
            Remove discount
          </button>
          <button onClick={() => setSelected(new Set())} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--fg3)', cursor: 'pointer', fontSize: 12 }}>✕ Clear selection</button>
        </div>
      )}

      {/* Category panel + table side by side */}
      <div style={{ display: 'flex', gap: 0, alignItems: 'flex-start' }}>
        {catDropOpen && (() => {
          const parents = categories.filter(c => !c.parentId);
          const kids = (pid: string) => categories.filter(c => c.parentId === pid);
          return (
            <div style={{
              width: 200, flexShrink: 0, background: 'var(--bg2)',
              border: '1px solid rgba(26,23,20,0.09)', borderRight: 'none', alignSelf: 'stretch',
            }}>
              <div style={{ padding: '10px 14px', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg3)', borderBottom: '1px solid rgba(26,23,20,0.06)' }}>
                Filter by category
              </div>
              <div onClick={() => setCategoryFilter('')} style={{
                padding: '10px 14px', fontSize: 13, cursor: 'pointer',
                color: !categoryFilter ? 'var(--fg)' : 'var(--fg2)',
                background: !categoryFilter ? 'rgba(26,23,20,0.04)' : 'transparent',
                borderBottom: '1px solid rgba(26,23,20,0.04)',
              }}>All</div>
              {parents.map(parent => {
                const children = kids(parent.id);
                const expanded = expandedParents.has(parent.id);
                return (
                  <div key={parent.id} style={{ borderBottom: '1px solid rgba(26,23,20,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div onClick={() => setCategoryFilter(parent.id)} style={{
                        flex: 1, padding: '10px 14px', fontSize: 13, cursor: 'pointer',
                        color: categoryFilter === parent.id ? 'var(--fg)' : 'var(--fg2)',
                        background: categoryFilter === parent.id ? 'rgba(26,23,20,0.04)' : 'transparent',
                        fontWeight: categoryFilter === parent.id ? 500 : 400,
                      }}>{parent.name}</div>
                      {children.length > 0 && (
                        <div onClick={() => setExpandedParents(s => { const n = new Set(s); expanded ? n.delete(parent.id) : n.add(parent.id); return n; })} style={{
                          padding: '10px 10px', cursor: 'pointer', fontSize: 9, color: 'var(--fg3)',
                        }}>{expanded ? '▲' : '▼'}</div>
                      )}
                    </div>
                    {expanded && children.map(kid => (
                      <div key={kid.id} onClick={() => setCategoryFilter(kid.id)} style={{
                        padding: '8px 14px 8px 26px', fontSize: 12, cursor: 'pointer',
                        color: categoryFilter === kid.id ? 'var(--fg)' : 'var(--fg3)',
                        background: categoryFilter === kid.id ? 'rgba(26,23,20,0.04)' : 'rgba(26,23,20,0.01)',
                        borderTop: '1px solid rgba(26,23,20,0.03)',
                      }}>{kid.name}</div>
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })()}

      <div className="table-wrap" style={{ flex: 1 }}>
      <table>
        <thead>
          <tr>
            <th style={{ width: 36 }}>
              <input type="checkbox"
                checked={paginated.length > 0 && paginated.every(p => selected.has(p.id))}
                onChange={(e) => setSelected(s => {
                  const n = new Set(s);
                  paginated.forEach(p => { e.target.checked ? n.add(p.id) : n.delete(p.id); });
                  return n;
                })}
              />
            </th>
            <th></th>
            <th className={`sortable${sortBy === 'name' ? ' sorted' : ''}`} onClick={() => toggleSort('name')}>
              Name <span className="sort-arrow">{sortArrow('name')}</span>
            </th>
            <th className={`sortable${sortBy === 'category' ? ' sorted' : ''}`} onClick={() => toggleSort('category')}>
              Category <span className="sort-arrow">{sortArrow('category')}</span>
            </th>
            <th className={`sortable${sortBy === 'price' ? ' sorted' : ''}`} onClick={() => toggleSort('price')}>
              Price <span className="sort-arrow">{sortArrow('price')}</span>
            </th>
            <th className={`sortable${sortBy === 'stock' ? ' sorted' : ''}`} onClick={() => toggleSort('stock')}>
              Stock <span className="sort-arrow">{sortArrow('stock')}</span>
            </th>
            <th className={`sortable${sortBy === 'status' ? ' sorted' : ''}`} onClick={() => toggleSort('status')}>
              Status <span className="sort-arrow">{sortArrow('status')}</span>
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {paginated.map((p) => (
            <tr key={p.id} style={{ background: selected.has(p.id) ? 'rgba(184,160,112,0.05)' : undefined }}>
              <td style={{ width: 36 }}>
                <input type="checkbox" checked={selected.has(p.id)}
                  onChange={(e) => setSelected(s => { const n = new Set(s); e.target.checked ? n.add(p.id) : n.delete(p.id); return n; })}
                />
              </td>
              <td style={{ width: 56 }}>
                {p.images[0] && <img src={resolveUrl(p.images[0].url)} alt="" style={{ width: 48, height: 48, objectFit: 'cover' }} />}
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
                  }}>{p.published ? '● In Stock' : '○ Out of Stock'}</button>
                  {(p as any).modelUrl && <span style={{ padding: '4px 8px', fontSize: 9, letterSpacing: '0.12em', background: 'rgba(110,130,220,0.12)', color: '#8899ee', borderRadius: 2 }}>3D</span>}
                </div>
              </td>
              <td style={{ display: 'flex', gap: 8 }}>
                <button className="btn outline" onClick={() => edit(p)}>Edit</button>
                <button className="btn danger" onClick={() => remove(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {paginated.length === 0 && (
            <tr><td colSpan={8} style={{ color: 'var(--fg3)', textAlign: 'center', padding: 32 }}>
              {filtered.length === 0 ? 'No products match your filters.' : 'No products on this page.'}
            </td></tr>
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
      </div>{/* end side-by-side flex */}
      {bgRemove && (
        <BgRemoveModal
          source={bgRemove.source}
          onClose={() => setBgRemove(null)}
          onApply={async (blob) => {
            setBgRemove(null);
            const idx = bgRemove.idx;
            setUploading(u => ({ ...u, [idx]: true }));
            try {
              const fd = new FormData();
              fd.append('file', new File([blob], 'product-nobg.png', { type: 'image/png' }));
              const res = await api.post<{ url: string }>('/uploads/image', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
              });
              setImg(idx, res.data.url);
            } catch {
              setErr('Upload of processed image failed.');
            } finally {
              setUploading(u => ({ ...u, [idx]: false }));
            }
          }}
        />
      )}
    </>
  );
}
