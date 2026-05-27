import React, { useEffect, useRef, useState } from 'react';
import { api } from '../../lib/api';
import { PageContent as ContentShape, CONTENT_DEFAULTS as DEFAULTS, mergeDeep } from '../../lib/usePageContent';
import { useToast } from '../../lib/toast';

/* ── Editable inline text ── */
const EditableText = React.memo(function EditableText({
  initialValue, onCommit, tag = 'span', className, style, multiline = false,
}: {
  initialValue: string; onCommit: (v: string) => void;
  tag?: string; className?: string; style?: React.CSSProperties; multiline?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const isEditingRef = useRef(false);

  useEffect(() => {
    if (ref.current && !isEditingRef.current) ref.current.textContent = initialValue;
  }, [initialValue]);

  const Tag = tag as keyof JSX.IntrinsicElements;
  return (
    // @ts-ignore
    <Tag ref={ref} contentEditable suppressContentEditableWarning className={className}
      data-editable="true"
      style={{ ...style, outline: 'none', cursor: 'text', caretColor: 'var(--gold)' }}
      onFocus={() => { isEditingRef.current = true; }}
      onBlur={(e) => {
        isEditingRef.current = false;
        onCommit((e.currentTarget as HTMLElement).textContent?.trim() || '');
      }}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (!multiline && e.key === 'Enter') { e.preventDefault(); (e.target as HTMLElement).blur(); }
        if (e.key === 'Escape') { (e.target as HTMLElement).blur(); }
      }}
    />
  );
});

/* ── Section wrapper ── */
function SectionWrap({ label, id, saving, saved, error, onSave, children, bg }: {
  label: string; id: string; saving: boolean; saved: boolean; error: string;
  onSave: () => void; children: React.ReactNode; bg?: string;
}) {
  return (
    <div id={id} style={{ position: 'relative', background: bg, borderBottom: '1px solid rgba(139,109,26,0.12)' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 20px', background: 'rgba(139,109,26,0.06)',
        borderBottom: '1px solid rgba(139,109,26,0.15)',
      }}>
        <span style={{ fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--gold)', fontFamily: 'var(--sans)' }}>
          ✎ {label}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {error && <span style={{ fontSize: 11, color: '#c04040' }}>{error}</span>}
          {saved && <span style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Saved ✓</span>}
          <button onClick={onSave} disabled={saving} style={{
            background: saving ? 'var(--fg3)' : 'var(--fg)', color: 'var(--bg)', border: 'none',
            cursor: saving ? 'not-allowed' : 'pointer', padding: '6px 18px',
            fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: 'var(--sans)',
          }}>
            {saving ? 'Saving…' : 'Save section'}
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}

/* ── Image upload slot ── */
/* ── Hero gallery — upload / manage hero images ── */
function HeroGallery({ images, onChange }: { images: string[]; onChange: (imgs: string[]) => void }) {
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const { data } = await api.post<{ url: string }>('/uploads/image', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newImages = [...images, data.url];
      const res = await api.get<{ value: Partial<ContentShape> | null }>('/settings/content');
      const current = (res.data.value ?? {}) as Record<string, unknown>;
      const imgs = (current.images ?? {}) as Record<string, unknown>;
      await api.put('/settings/content', { value: { ...current, images: { ...imgs, heroImages: newImages } } });
      onChange(newImages);
      toast.success('Hero image added');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function removeImage(url: string) {
    const newImages = images.filter((u) => u !== url);
    try {
      const res = await api.get<{ value: Partial<ContentShape> | null }>('/settings/content');
      const current = (res.data.value ?? {}) as Record<string, unknown>;
      const imgs = (current.images ?? {}) as Record<string, unknown>;
      await api.put('/settings/content', { value: { ...current, images: { ...imgs, heroImages: newImages } } });
      if (url.includes('/uploads/')) {
        await api.delete('/uploads/file', { data: { url } }).catch(() => {});
      }
      onChange(newImages);
      toast.success('Image removed');
    } catch {
      toast.error('Could not remove image');
    }
  }

  return (
    <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(139,109,26,0.1)', background: 'rgba(139,109,26,0.03)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--gold)' }}>
            Hero images
          </span>
          <span style={{
            fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '2px 8px',
            border: '1px solid', borderColor: images.length > 0 ? 'rgba(60,160,80,0.4)' : 'rgba(139,109,26,0.2)',
            color: images.length > 0 ? 'rgba(60,160,80,0.8)' : 'var(--fg3)',
          }}>
            {images.length > 0 ? `${images.length} custom image${images.length !== 1 ? 's' : ''}` : 'using products as fallback'}
          </span>
        </div>
        <span style={{ fontSize: 10, color: 'var(--fg3)', fontStyle: 'italic' }}>
          {images.length === 0 ? 'No custom images — hero rotates through published products' : 'Drag to reorder coming soon'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {images.map((url, i) => (
          <div key={url} style={{ flexShrink: 0, position: 'relative' }}>
            <div style={{
              width: 100, height: 100, overflow: 'hidden',
              border: '1px solid rgba(139,109,26,0.2)', background: 'var(--bg2)',
            }}>
              <img src={url} alt={`Hero ${i + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
              {/* Slide number */}
              <span style={{
                position: 'absolute', top: 4, left: 4, fontSize: 8, letterSpacing: '0.1em',
                background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '2px 5px', pointerEvents: 'none',
              }}>{i + 1}</span>
              {/* Delete overlay */}
              <button
                onClick={() => removeImage(url)}
                title="Remove"
                style={{
                  position: 'absolute', inset: 0, width: '100%', height: '100%',
                  background: 'rgba(0,0,0,0)', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, color: '#fff', opacity: 0, transition: 'opacity 0.15s, background 0.15s',
                }}
                onMouseEnter={ev => { ev.currentTarget.style.opacity = '1'; ev.currentTarget.style.background = 'rgba(160,40,40,0.7)'; }}
                onMouseLeave={ev => { ev.currentTarget.style.opacity = '0'; ev.currentTarget.style.background = 'rgba(0,0,0,0)'; }}
              >✕</button>
            </div>
          </div>
        ))}

        {/* Add button */}
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{
            width: 100, height: 100, flexShrink: 0,
            border: '1px dashed rgba(139,109,26,0.35)', background: 'transparent',
            cursor: uploading ? 'not-allowed' : 'pointer', color: 'var(--gold)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 4, opacity: uploading ? 0.5 : 1, transition: 'border-color 0.15s, background 0.15s',
          }}
          onMouseEnter={ev => { if (!uploading) { ev.currentTarget.style.borderColor = 'var(--gold)'; ev.currentTarget.style.background = 'rgba(139,109,26,0.06)'; } }}
          onMouseLeave={ev => { ev.currentTarget.style.borderColor = 'rgba(139,109,26,0.35)'; ev.currentTarget.style.background = 'transparent'; }}
        >
          <span style={{ fontSize: uploading ? 11 : 22, lineHeight: 1 }}>{uploading ? 'Uploading…' : '+'}</span>
          {!uploading && <span style={{ fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Add image</span>}
        </button>
      </div>

      <input ref={inputRef} type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
    </div>
  );
}

/* ── Main component ── */
export function AdminContent() {
  const toast = useToast();
  const [content, setContent] = useState<ContentShape>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const savedTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    api.get<{ value: Partial<ContentShape> | null }>('/settings/content')
      .then(({ data }) => { if (data.value) setContent(mergeDeep(DEFAULTS, data.value as Record<string, unknown>)); })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => { Object.values(savedTimers.current).forEach(clearTimeout); };
  }, []);

  function set<S extends keyof ContentShape>(section: S, key: keyof ContentShape[S], val: string) {
    setContent(prev => ({ ...prev, [section]: { ...prev[section], [key]: val } }));
  }

  async function saveSection(section: keyof ContentShape) {
    setSaving(p => ({ ...p, [section]: true }));
    setErrors(p => ({ ...p, [section]: '' }));
    try {
      const res = await api.get<{ value: Partial<ContentShape> | null }>('/settings/content');
      const current = res.data.value ?? {};
      await api.put('/settings/content', { value: { ...current, [section]: content[section] } });
      setSaved(p => ({ ...p, [section]: true }));
      toast.success(`${String(section)} section saved`);
      if (savedTimers.current[section]) clearTimeout(savedTimers.current[section]);
      savedTimers.current[section] = setTimeout(() => setSaved(p => ({ ...p, [section]: false })), 2500);
    } catch {
      setErrors(p => ({ ...p, [section]: 'Failed to save.' }));
      toast.error(`Could not save ${String(section)} section`);
    } finally {
      setSaving(p => ({ ...p, [section]: false }));
    }
  }

  if (loading) return <p style={{ color: 'var(--fg3)', fontSize: 13, padding: 40 }}>Loading…</p>;

  const sp = (section: keyof ContentShape) => ({
    saving: !!saving[section], saved: !!saved[section],
    error: errors[section] ?? '', onSave: () => saveSection(section),
  });

  const commit = <S extends keyof ContentShape>(section: S, key: keyof ContentShape[S]) =>
    (v: string) => set(section, key, v);

  const sections: Array<{ id: keyof ContentShape; label: string }> = [
    { id: 'hero', label: 'Hero' },
    { id: 'collections', label: 'Collections' },
    { id: 'shop', label: 'Shop' },
    { id: 'newArrivals', label: 'Arrivals' },
    { id: 'newsletter', label: 'Newsletter' },
    { id: 'trade', label: 'Trade' },
    { id: 'footer', label: 'Footer' },
  ];

  return (
    <div style={{ margin: 'calc(-1 * var(--sp-9))' }}>

      {/* Sticky top bar */}
      <div style={{
        position: 'sticky', top: 'var(--nav-h)', zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 24px', background: 'var(--fg)', color: 'var(--bg)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.5 }}>Page Content</span>
          <span style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', border: '1px solid var(--gold)', padding: '3px 10px' }}>
            ✎ Click any text to edit
          </span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {sections.map(s => (
            <a key={s.id} href={`#acms-${s.id}`} style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', padding: '4px 8px' }}
              onMouseEnter={ev => { ev.currentTarget.style.color = 'rgba(255,255,255,0.9)'; }}
              onMouseLeave={ev => { ev.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}>
              {s.label}
            </a>
          ))}
        </div>
      </div>

      {/* ── Hero ── */}
      <SectionWrap label="Hero" id="acms-hero" bg="var(--bg)" {...sp('hero')}>
        <div style={{ padding: 'var(--sp-5) var(--sp-10) var(--sp-4)', borderBottom: '1px solid rgba(26,23,20,0.06)' }}>
          <p style={{ fontSize: 10, color: 'var(--fg3)', margin: 0 }}>
            Background rotates through your <strong style={{ color: 'var(--fg2)' }}>published products</strong> with images. Add products in the Products page to control what appears here.
          </p>
        </div>
        <HeroGallery
          images={content.images.heroImages ?? []}
          onChange={(imgs) => setContent(prev => ({ ...prev, images: { ...prev.images, heroImages: imgs } }))}
        />
        <div style={{ padding: 'var(--sp-13) var(--sp-10) var(--sp-11)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <EditableText tag="p" className="t-eyebrow" initialValue={content.hero.season}
                onCommit={commit('hero', 'season')} style={{ display: 'block', marginBottom: 'var(--sp-9)' }} />
              <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 'clamp(48px,5vw,88px)', lineHeight: 0.88, letterSpacing: '-0.02em', marginBottom: 'var(--sp-8)' }}>
                <EditableText initialValue={content.hero.titleLine1} onCommit={commit('hero', 'titleLine1')} /><br />
                <EditableText initialValue={content.hero.titleArt} onCommit={commit('hero', 'titleArt')} style={{ color: 'var(--gold)', fontStyle: 'italic' }} /><br />
                <EditableText initialValue={content.hero.titleLine2} onCommit={commit('hero', 'titleLine2')} /><br />
                <EditableText initialValue={content.hero.titleLine3} onCommit={commit('hero', 'titleLine3')} />
              </h1>
            </div>
            <div>
              <div style={{ width: 40, height: 1, background: 'var(--gold2)', marginBottom: 'var(--sp-5)' }} />
              <EditableText tag="p" initialValue={content.hero.tagline} onCommit={commit('hero', 'tagline')} multiline
                style={{ display: 'block', fontFamily: 'var(--serif)', fontSize: 14, lineHeight: 1.85, color: 'var(--fg2)', marginBottom: 'var(--sp-7)', maxWidth: 600 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
                <span style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--fg3)' }}>Explore Collections →</span>
                <EditableText tag="span" initialValue={content.hero.established} onCommit={commit('hero', 'established')}
                  style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg3)' }} />
              </div>
            </div>
          </div>
      </SectionWrap>

      {/* ── Collections ── */}
      <SectionWrap label="Collections" id="acms-collections" bg="var(--bg)" {...sp('collections')}>
        <div style={{ padding: 'var(--sp-10) var(--sp-10)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 'var(--sp-8)' }}>
            <div>
              <EditableText tag="p" className="t-eyebrow" initialValue={content.collections.eyebrow}
                onCommit={commit('collections', 'eyebrow')} style={{ display: 'block', marginBottom: 'var(--sp-3)' }} />
              <EditableText tag="h2" initialValue={content.collections.title} onCommit={commit('collections', 'title')}
                style={{ display: 'block', fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 'clamp(24px,3vw,42px)' }} />
            </div>
            <EditableText tag="span" initialValue={content.collections.viewAll} onCommit={commit('collections', 'viewAll')}
              style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--fg3)' }} />
          </div>
          <p style={{ fontSize: 11, color: 'var(--fg3)', fontStyle: 'italic' }}>
            Category cards are pulled automatically from your categories. Manage categories and their cover images in the Categories page.
          </p>
        </div>
      </SectionWrap>

      {/* ── Shop ── */}
      <SectionWrap label="Shop Page" id="acms-shop" bg="var(--bg)" {...sp('shop')}>
        <div style={{ padding: 'var(--sp-10) var(--sp-10)' }}>
          <p style={{ fontSize: 11, color: 'var(--fg3)', fontStyle: 'italic', marginBottom: 'var(--sp-6)' }}>
            These texts appear at the top of the /shop page when no category filter is active.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-8)' }}>
            <div>
              <label style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--fg3)', display: 'block', marginBottom: 8 }}>Eyebrow</label>
              <EditableText tag="p" className="t-eyebrow" initialValue={content.shop.eyebrow}
                onCommit={commit('shop', 'eyebrow')} style={{ display: 'block' }} />
            </div>
            <div>
              <label style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--fg3)', display: 'block', marginBottom: 8 }}>Title (default, no filter)</label>
              <EditableText tag="p" initialValue={content.shop.title} onCommit={commit('shop', 'title')}
                style={{ display: 'block', fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 'clamp(22px,2.5vw,38px)' }} />
            </div>
          </div>
        </div>
      </SectionWrap>

      {/* ── New Arrivals ── */}
      <SectionWrap label="New Arrivals" id="acms-newArrivals" bg="var(--bg)" {...sp('newArrivals')}>
        <div style={{ padding: 'var(--sp-14) var(--sp-10)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 'var(--sp-9)' }}>
            <div>
              <EditableText tag="p" className="t-eyebrow" initialValue={content.newArrivals.eyebrow}
                onCommit={commit('newArrivals', 'eyebrow')} style={{ display: 'block', marginBottom: 'var(--sp-4)' }} />
              <EditableText tag="h2" initialValue={content.newArrivals.title} onCommit={commit('newArrivals', 'title')}
                style={{ display: 'block', fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 'clamp(28px,3vw,48px)' }} />
            </div>
            <span style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--fg3)' }}>View All →</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ background: 'var(--bg2)', aspectRatio: '3/4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg3)' }}>Product {i}</span>
              </div>
            ))}
          </div>
        </div>
      </SectionWrap>

      {/* ── Newsletter ── */}
      <SectionWrap label="Newsletter" id="acms-newsletter" bg="#1a1714" {...sp('newsletter')}>
        <div style={{ padding: 'var(--sp-14) var(--sp-10)', textAlign: 'center' }}>
          <EditableText tag="p" initialValue={content.newsletter.eyebrow} onCommit={commit('newsletter', 'eyebrow')}
            style={{ display: 'block', fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(250,249,247,0.4)', marginBottom: 'var(--sp-5)' }} />
          <EditableText tag="h2" initialValue={content.newsletter.title} onCommit={commit('newsletter', 'title')}
            style={{ display: 'block', fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 'clamp(28px,3vw,52px)', color: '#faf9f7', marginBottom: 'var(--sp-5)' }} />
          <EditableText tag="p" initialValue={content.newsletter.body} onCommit={commit('newsletter', 'body')} multiline
            style={{ display: 'block', fontFamily: 'var(--serif)', fontSize: 16, color: 'rgba(250,249,247,0.6)', marginBottom: 'var(--sp-9)', maxWidth: 440, marginLeft: 'auto', marginRight: 'auto' }} />
          <div style={{ display: 'flex', maxWidth: 440, margin: '0 auto', opacity: 0.45, pointerEvents: 'none' }}>
            <input readOnly placeholder="your@email.com" style={{ flex: 1, background: 'transparent', border: '1px solid rgba(250,249,247,0.3)', color: '#faf9f7', padding: '14px 20px', fontSize: 12, fontFamily: 'var(--sans)', outline: 'none' }} />
            <button style={{ background: '#faf9f7', color: '#1a1714', border: 'none', padding: '14px 28px', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'var(--sans)' }}>Subscribe</button>
          </div>
        </div>
      </SectionWrap>

      {/* ── Trade ── */}
      <SectionWrap label="Trade / Partner" id="acms-trade" bg="#f0ece4" {...sp('trade')}>
        <div style={{ padding: 'var(--sp-14) var(--sp-10)', textAlign: 'center', color: '#0c0b0a' }}>
          <EditableText tag="p" initialValue={content.trade.eyebrow} onCommit={commit('trade', 'eyebrow')}
            style={{ display: 'block', fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(12,11,10,0.45)', marginBottom: 'var(--sp-5)' }} />
          <EditableText tag="h2" initialValue={content.trade.title} onCommit={commit('trade', 'title')}
            style={{ display: 'block', fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 'clamp(32px,4vw,56px)', color: '#0c0b0a', marginBottom: 'var(--sp-6)' }} />
          <EditableText tag="p" initialValue={content.trade.body} onCommit={commit('trade', 'body')} multiline
            style={{ display: 'block', fontFamily: 'var(--serif)', fontSize: 15, lineHeight: 1.85, color: 'rgba(12,11,10,0.6)', maxWidth: 540, margin: '0 auto var(--sp-8)' }} />
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <EditableText tag="span" initialValue={content.trade.ctaLabel} onCommit={commit('trade', 'ctaLabel')}
              style={{ display: 'inline-block', background: '#0c0b0a', color: '#f0ece4', padding: '14px 36px', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: 'var(--sans)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(12,11,10,0.45)' }}>Sends to:</span>
              <EditableText tag="span" initialValue={content.trade.ctaEmail} onCommit={commit('trade', 'ctaEmail')}
                style={{ fontSize: 11, color: 'rgba(12,11,10,0.7)' }} />
            </div>
          </div>
        </div>
      </SectionWrap>

      {/* ── Footer ── */}
      <SectionWrap label="Footer" id="acms-footer" bg="#f0ece4" {...sp('footer')}>
        <div style={{ padding: 'var(--sp-12) var(--sp-10)', color: '#1a1714' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-10)', marginBottom: 'var(--sp-10)' }}>
            <div>
              <label style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(26,23,20,0.45)', display: 'block', marginBottom: 8 }}>Newsletter label</label>
              <EditableText tag="p" initialValue={content.footer.newsletterLabel} onCommit={commit('footer', 'newsletterLabel')}
                style={{ display: 'block', fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(26,23,20,0.7)', borderBottom: '1px solid rgba(26,23,20,0.2)', paddingBottom: 8 }} />
            </div>
            <div>
              <label style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(26,23,20,0.45)', display: 'block', marginBottom: 8 }}>Tagline (optional)</label>
              <EditableText tag="p" initialValue={content.footer.tagline} onCommit={commit('footer', 'tagline')} multiline
                style={{ display: 'block', fontFamily: 'var(--serif)', fontSize: 13, lineHeight: 1.7, color: 'rgba(26,23,20,0.7)' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--sp-10)', borderTop: '1px solid rgba(26,23,20,0.15)', paddingTop: 'var(--sp-8)' }}>
            <div>
              <label style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(26,23,20,0.45)', display: 'block', marginBottom: 8 }}>Contact — address line 1</label>
              <EditableText tag="p" initialValue={content.footer.contactAddressLine1} onCommit={commit('footer', 'contactAddressLine1')}
                style={{ display: 'block', fontSize: 13, marginBottom: 16 }} />
              <label style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(26,23,20,0.45)', display: 'block', marginBottom: 8 }}>Contact — address line 2</label>
              <EditableText tag="p" initialValue={content.footer.contactAddressLine2} onCommit={commit('footer', 'contactAddressLine2')}
                style={{ display: 'block', fontSize: 13, marginBottom: 16 }} />
              <label style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(26,23,20,0.45)', display: 'block', marginBottom: 8 }}>Contact email</label>
              <EditableText tag="p" initialValue={content.footer.contactEmail} onCommit={commit('footer', 'contactEmail')}
                style={{ display: 'block', fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(26,23,20,0.45)', display: 'block', marginBottom: 8 }}>Copyright (use <code>{'{year}'}</code> for current year)</label>
              <EditableText tag="p" initialValue={content.footer.copyText} onCommit={commit('footer', 'copyText')}
                style={{ display: 'block', fontSize: 13, marginBottom: 16 }} />
              <label style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(26,23,20,0.45)', display: 'block', marginBottom: 8 }}>Locale label (right side)</label>
              <EditableText tag="p" initialValue={content.footer.localeLabel} onCommit={commit('footer', 'localeLabel')}
                style={{ display: 'block', fontSize: 13 }} />
            </div>
          </div>
        </div>
      </SectionWrap>

      <div style={{ height: 60, background: 'var(--bg)' }} />
    </div>
  );
}
