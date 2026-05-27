import { useEffect, useState } from 'react';
import { api, Product } from '../../lib/api';

const MAX = 4;

export function AdminNewSeason() {
  const [all, setAll] = useState<Product[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [q, setQ] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/products/admin/all').then(r => setAll(r.data));
    api.get('/settings/new_season').then(r => {
      if (Array.isArray(r.data.value)) setSelected(r.data.value);
    }).catch(() => {});
  }, []);

  const toggle = (id: string) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= MAX) return prev;
      return [...prev, id];
    });
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    await api.put('/settings/new_season', { value: selected });
    setSaving(false);
    setSaved(true);
  };

  const filtered = all.filter(p =>
    p.name.toLowerCase().includes(q.toLowerCase()) ||
    (p.category?.name ?? '').toLowerCase().includes(q.toLowerCase())
  );

  const selectedProducts = selected.map(id => all.find(p => p.id === id)).filter(Boolean) as Product[];

  return (
    <main style={{ padding: 32, maxWidth: 900 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 26, marginBottom: 4 }}>New This Season</h1>
          <p style={{ fontSize: 12, color: 'var(--fg3)', letterSpacing: '0.06em' }}>
            Pick up to {MAX} products to feature in the "New This Season" homepage section.
          </p>
        </div>
        <button
          className="btn"
          onClick={save}
          disabled={saving}
          style={{ minWidth: 100 }}
        >
          {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save'}
        </button>
      </div>

      {/* Selected preview */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: 12 }}>
          Selected ({selected.length} / {MAX})
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {Array.from({ length: MAX }).map((_, i) => {
            const p = selectedProducts[i];
            return (
              <div
                key={i}
                style={{
                  border: '1px solid rgba(240,237,230,0.15)',
                  borderRadius: 4,
                  overflow: 'hidden',
                  background: 'var(--bg2)',
                  minHeight: 110,
                  position: 'relative',
                }}
              >
                {p ? (
                  <>
                    {p.images[0] && (
                      <img
                        src={p.images[0].url}
                        alt={p.name}
                        style={{ width: '100%', height: 70, objectFit: 'cover', display: 'block' }}
                      />
                    )}
                    <div style={{ padding: '6px 8px' }}>
                      <p style={{ fontSize: 11, fontWeight: 500, margin: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{p.name}</p>
                    </div>
                    <button
                      onClick={() => toggle(p.id)}
                      title="Remove"
                      style={{
                        position: 'absolute', top: 4, right: 4,
                        width: 20, height: 20, borderRadius: '50%',
                        background: 'rgba(0,0,0,0.5)', border: 'none',
                        color: '#fff', fontSize: 12, cursor: 'pointer',
                        display: 'grid', placeItems: 'center',
                      }}
                    >×</button>
                  </>
                ) : (
                  <div style={{ display: 'grid', placeItems: 'center', height: 110, color: 'var(--fg3)', fontSize: 11, letterSpacing: '0.1em' }}>
                    Empty
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <input
        type="search"
        placeholder="Search products…"
        value={q}
        onChange={e => setQ(e.target.value)}
        style={{
          width: '100%', padding: '10px 14px', marginBottom: 16,
          background: 'var(--bg2)', border: '1px solid rgba(240,237,230,0.1)',
          borderRadius: 4, color: 'var(--fg)', fontSize: 13,
          boxSizing: 'border-box',
        }}
      />

      {/* Product list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {filtered.map(p => {
          const isSelected = selected.includes(p.id);
          const disabled = !isSelected && selected.length >= MAX;
          return (
            <div
              key={p.id}
              onClick={() => !disabled && toggle(p.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '10px 14px',
                background: isSelected ? 'rgba(193,159,103,0.1)' : 'var(--bg2)',
                border: `1px solid ${isSelected ? 'rgba(193,159,103,0.4)' : 'rgba(240,237,230,0.07)'}`,
                borderRadius: 4,
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.45 : 1,
                transition: 'background 0.15s, border-color 0.15s',
              }}
            >
              {p.images[0] ? (
                <img src={p.images[0].url} alt={p.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 2, flexShrink: 0 }} />
              ) : (
                <div style={{ width: 44, height: 44, background: 'rgba(240,237,230,0.08)', borderRadius: 2, flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{p.name}</p>
                <p style={{ margin: 0, fontSize: 11, color: 'var(--fg3)', marginTop: 2 }}>
                  {p.category?.name ?? '—'} · €{p.price}
                  {!p.published && <span style={{ color: 'var(--gold)', marginLeft: 6 }}>Draft</span>}
                </p>
              </div>
              <div style={{
                width: 18, height: 18, borderRadius: '50%',
                border: `1.5px solid ${isSelected ? 'var(--gold)' : 'rgba(240,237,230,0.25)'}`,
                background: isSelected ? 'var(--gold)' : 'transparent',
                display: 'grid', placeItems: 'center', flexShrink: 0, transition: 'all 0.15s',
              }}>
                {isSelected && <svg width="8" height="8" viewBox="0 0 8 8"><polyline points="1,4 3,6 7,2" fill="none" stroke="var(--bg)" strokeWidth="1.5"/></svg>}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
