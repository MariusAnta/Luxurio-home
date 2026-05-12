import { FormEvent, useEffect, useState } from 'react';
import { api } from '../../lib/api';

const DEFAULT_ITEMS = [
  'White-Glove Delivery',
  'Bespoke Commissions',
  'Milan · New York · London',
  '30-Day Returns',
  'Handcrafted in Italy',
];

export function AdminSettings() {
  const [items, setItems] = useState<string[]>(DEFAULT_ITEMS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get<{ value: string[] | null }>('/settings/marquee')
      .then((r) => { if (r.data.value?.length) setItems(r.data.value); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function update(i: number, val: string) {
    setItems((prev) => prev.map((v, idx) => idx === i ? val : v));
  }

  function addItem() { setItems((prev) => [...prev, '']); }

  function removeItem(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const clean = items.map((s) => s.trim()).filter(Boolean);
    if (!clean.length) { setErr('At least one item required.'); return; }
    setErr(''); setSaving(true); setSaved(false);
    try {
      await api.put('/settings/marquee', { value: clean });
      setItems(clean);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setErr('Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <p style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: 12 }}>Site</p>
      <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 48, marginBottom: 40 }}>Settings</h1>

      <div style={{ maxWidth: 620 }}>
        <p style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: 20 }}>
          Scrolling Banner
        </p>
        <p style={{ fontSize: 12, color: 'var(--fg3)', marginBottom: 24, lineHeight: 1.6 }}>
          These texts scroll across the banner below the hero on the homepage. Edit, reorder, add or remove items.
        </p>

        {loading ? (
          <p style={{ color: 'var(--fg3)' }}>Loading…</p>
        ) : (
          <form onSubmit={onSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {items.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input
                    value={item}
                    onChange={(e) => update(i, e.target.value)}
                    placeholder={`Item ${i + 1}`}
                    style={{
                      flex: 1,
                      background: 'var(--bg2)',
                      border: '1px solid rgba(26,23,20,0.12)',
                      color: 'var(--fg)',
                      padding: '10px 14px',
                      fontSize: 'var(--text-body)',
                      outline: 'none',
                      fontFamily: 'var(--sans)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    disabled={items.length <= 1}
                    style={{
                      background: 'none', border: '1px solid rgba(26,23,20,0.12)',
                      color: 'var(--fg3)', cursor: 'pointer', padding: '6px 12px',
                      fontSize: 14, lineHeight: 1,
                    }}
                    aria-label="Remove item"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addItem}
              style={{
                background: 'none', border: '1px dashed rgba(26,23,20,0.18)',
                color: 'var(--fg3)', cursor: 'pointer', padding: '8px 20px',
                fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
                marginBottom: 24, width: '100%',
              }}
            >
              + Add Item
            </button>

            {err && <p style={{ color: '#b05050', fontSize: 12, marginBottom: 12 }}>{err}</p>}
            {saved && <p style={{ color: '#2e7d2e', fontSize: 12, marginBottom: 12 }}>Saved.</p>}

            <button className="btn" type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        )}
      </div>
    </>
  );
}
