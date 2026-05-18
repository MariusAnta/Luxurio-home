import React, { useEffect, useRef, useState } from 'react';
import { api } from '../../lib/api';

/* ── Types ── */
interface ContentShape {
  hero: {
    season: string;
    titleLine1: string;
    titleArt: string;
    titleLine2: string;
    titleLine3: string;
    tagline: string;
    established: string;
  };
  editorial: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    titleAccent: string;
    body: string;
  };
  newArrivals: {
    eyebrow: string;
    title: string;
  };
  services: {
    eyebrow: string;
    titleLine1: string;
    titleAccent: string;
    body: string;
    step1: string;
    step2: string;
    step3: string;
    step4: string;
  };
  newsletter: {
    eyebrow: string;
    title: string;
    body: string;
  };
  footer: {
    tagline: string;
  };
  atelier: {
    heroEyebrow: string;
    heroTitle1: string;
    heroTitleArt: string;
    heroTitle2: string;
    heroBody: string;
    manifestoQuote: string;
    manifestoAttr: string;
    workshopEyebrow: string;
    workshopTitle1: string;
    workshopTitleArt: string;
    workshopBody: string;
    ctaTitle: string;
  };
  images: {
    heroImg: string;
    servicesImg: string;
    atelierHeroImg: string;
    atelierWorkshopImg: string;
  };
}

const DEFAULTS: ContentShape = {
  hero: {
    season: 'S/S 2026 — Collection N° 001',
    titleLine1: 'The',
    titleArt: 'Art',
    titleLine2: 'of',
    titleLine3: 'Stillness.',
    tagline: 'Furniture conceived for spaces that refuse to shout. Handmade in Italy. Built to last decades.',
    established: 'Est. 2012 · Milan',
  },
  editorial: {
    eyebrow: 'The Luxurio Atelier',
    titleLine1: 'Every Object',
    titleLine2: 'Begins as a',
    titleAccent: 'Conversation.',
    body: 'We collaborate with Europe\'s most thoughtful designers to bring you furnishings built for decades. Each piece made to order, in small batches, with materials chosen for their integrity.',
  },
  newArrivals: {
    eyebrow: 'Just Arrived',
    title: 'New This Season',
  },
  services: {
    eyebrow: 'Bespoke Service',
    titleLine1: 'Private Interiors',
    titleAccent: 'Consultation',
    body: 'Our in-house design team composes rooms of lasting significance — from a single statement piece to a complete interior.',
    step1: 'Site visit & mood board',
    step2: 'Curated selection',
    step3: 'Commission management',
    step4: 'Installation & styling',
  },
  newsletter: {
    eyebrow: 'Stay in Touch',
    title: 'The Luxurio Letter',
    body: 'New arrivals, atelier stories, and private events — once a month.',
  },
  footer: {
    tagline: 'Fine furnishings for spaces of lasting significance. Handcrafted in Europe since 2012.',
  },
  atelier: {
    heroEyebrow: 'Est. 2012 · Milan',
    heroTitle1: 'The',
    heroTitleArt: 'Atelier',
    heroTitle2: 'Story.',
    heroBody: 'Luxurio began as a conversation between two architects who were tired of furniture that looked good in a catalogue and fell apart in a decade. We set out to make pieces worth keeping — worth inheriting.',
    manifestoQuote: '"We are not interested in trends. We are interested in the kind of object that becomes invisible in the best possible sense — something so at home in a room that no one can imagine the room without it."',
    manifestoAttr: '— Marco Ferretti & Elise Vander, Co-founders',
    workshopEyebrow: 'The workshops',
    workshopTitle1: 'Made by hand,',
    workshopTitleArt: 'in Europe.',
    workshopBody: 'We work with twelve independent workshops across Italy, Portugal, and Denmark. Each one is family-owned, each one has been producing at the highest level for at least two generations. We visit every partner every year — not to audit, but to learn.',
    ctaTitle: 'Explore the pieces.',
  },
  images: {
    heroImg: '',
    servicesImg: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
    atelierHeroImg: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=1200',
    atelierWorkshopImg: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200',
  },
};

/* ── Helpers ── */
function deepMerge(base: ContentShape, overrides: Partial<ContentShape>): ContentShape {
  const result = JSON.parse(JSON.stringify(base)) as ContentShape;
  for (const section of Object.keys(overrides) as Array<keyof ContentShape>) {
    if (overrides[section] && typeof overrides[section] === 'object') {
      Object.assign(result[section], overrides[section]);
    }
  }
  return result;
}

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
function ImageSlot({ imgKey, url, onUploaded, label, aspect = '16/9' }: {
  imgKey: string; url: string; onUploaded: (key: string, newUrl: string) => void;
  label: string; aspect?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setErr('');
    try {
      const form = new FormData();
      form.append('file', file);
      const { data } = await api.post<{ url: string }>('/uploads/image', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Delete old image if it was uploaded to our server (not an external URL)
      if (url && url.includes('/uploads/')) {
        await api.delete('/uploads/file', { data: { url } }).catch(() => {});
      }
      // Auto-save to DB immediately — merge only the images key
      const res = await api.get<{ value: Partial<ContentShape> | null }>('/settings/content');
      const current = (res.data.value ?? {}) as Record<string, unknown>;
      const imgs = (current.images ?? {}) as Record<string, string>;
      await api.put('/settings/content', { value: { ...current, images: { ...imgs, [imgKey]: data.url } } });
      onUploaded(imgKey, data.url);
    } catch {
      setErr('Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: aspect, overflow: 'hidden', background: 'var(--bg3)' }}>
      {url
        ? <img src={url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg3)' }}>No image — hover to upload</span>
          </div>
      }
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 8,
        background: 'rgba(0,0,0,0.55)', opacity: 0, transition: 'opacity 0.2s',
      }}
        onMouseEnter={ev => { ev.currentTarget.style.opacity = '1'; }}
        onMouseLeave={ev => { ev.currentTarget.style.opacity = '0'; }}>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{
            background: 'var(--fg)', color: 'var(--bg)', border: 'none', cursor: uploading ? 'not-allowed' : 'pointer',
            padding: '8px 20px', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase',
            fontFamily: 'var(--sans)', opacity: uploading ? 0.6 : 1,
          }}
        >
          {uploading ? 'Uploading…' : '⬆ Change image'}
        </button>
        {err && <span style={{ fontSize: 10, color: '#f06060' }}>{err}</span>}
      </div>
      <span style={{
        position: 'absolute', bottom: 8, left: 8, fontSize: 9, letterSpacing: '0.18em',
        textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)',
        background: 'rgba(0,0,0,0.5)', padding: '3px 8px', pointerEvents: 'none',
      }}>
        {label}
      </span>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
    </div>
  );
}

/* ── Main component ── */
export function AdminContent() {
  const [content, setContent] = useState<ContentShape>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const savedTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    api.get<{ value: Partial<ContentShape> | null }>('/settings/content')
      .then(({ data }) => { if (data.value) setContent(deepMerge(DEFAULTS, data.value)); })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => { Object.values(savedTimers.current).forEach(clearTimeout); };
  }, []);

  function set<S extends keyof ContentShape>(section: S, key: keyof ContentShape[S], val: string) {
    setContent(prev => ({ ...prev, [section]: { ...prev[section], [key]: val } }));
  }

  function onImageUploaded(imgKey: string, newUrl: string) {
    setContent(prev => ({ ...prev, images: { ...prev.images, [imgKey]: newUrl } }));
  }

  async function saveSection(section: keyof ContentShape) {
    setSaving(p => ({ ...p, [section]: true }));
    setErrors(p => ({ ...p, [section]: '' }));
    try {
      const res = await api.get<{ value: Partial<ContentShape> | null }>('/settings/content');
      const current = res.data.value ?? {};
      await api.put('/settings/content', { value: { ...current, [section]: content[section] } });
      setSaved(p => ({ ...p, [section]: true }));
      if (savedTimers.current[section]) clearTimeout(savedTimers.current[section]);
      savedTimers.current[section] = setTimeout(() => setSaved(p => ({ ...p, [section]: false })), 2500);
    } catch {
      setErrors(p => ({ ...p, [section]: 'Failed to save.' }));
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
          {(['hero','editorial','newArrivals','services','newsletter','atelier','footer'] as const).map(s => (
            <a key={s} href={`#acms-${s}`} style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', padding: '4px 8px' }}
              onMouseEnter={ev => { ev.currentTarget.style.color = 'rgba(255,255,255,0.9)'; }}
              onMouseLeave={ev => { ev.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}>
              {s === 'newArrivals' ? 'Arrivals' : s.charAt(0).toUpperCase() + s.slice(1)}
            </a>
          ))}
        </div>
      </div>

      {/* ── Hero ── */}
      <SectionWrap label="Hero" id="acms-hero" bg="var(--bg)" {...sp('hero')}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 520 }}>
          <div style={{ padding: 'var(--sp-13) var(--sp-10) var(--sp-11)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: '1px solid rgba(26,23,20,0.06)' }}>
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
                style={{ display: 'block', fontFamily: 'var(--serif)', fontSize: 14, lineHeight: 1.85, color: 'var(--fg2)', marginBottom: 'var(--sp-7)', maxWidth: 400 }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--fg3)' }}>Explore Collections →</span>
                <EditableText tag="span" initialValue={content.hero.established} onCommit={commit('hero', 'established')}
                  style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg3)' }} />
              </div>
            </div>
          </div>
          <div style={{ background: 'var(--bg2)', minHeight: 520 }}>
            <ImageSlot imgKey="heroImg" url={content.images.heroImg} onUploaded={onImageUploaded}
              label="Hero image" aspect="3/4" />
          </div>
        </div>
      </SectionWrap>

      {/* ── Editorial ── */}
      <SectionWrap label="Editorial" id="acms-editorial" bg="var(--bg2)" {...sp('editorial')}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: 'var(--sp-14) var(--sp-10)', gap: 'var(--sp-12)' }}>
          <div>
            <EditableText tag="p" className="t-eyebrow" initialValue={content.editorial.eyebrow}
              onCommit={commit('editorial', 'eyebrow')} style={{ display: 'block', marginBottom: 'var(--sp-7)' }} />
            <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 'clamp(36px,3.5vw,64px)', lineHeight: 0.92, letterSpacing: '-0.01em', marginBottom: 'var(--sp-8)' }}>
              <EditableText initialValue={content.editorial.titleLine1} onCommit={commit('editorial', 'titleLine1')} /><br />
              <EditableText initialValue={content.editorial.titleLine2} onCommit={commit('editorial', 'titleLine2')} /><br />
              <EditableText initialValue={content.editorial.titleAccent} onCommit={commit('editorial', 'titleAccent')} style={{ color: 'var(--gold)', fontStyle: 'italic' }} />
            </h2>
            <EditableText tag="p" initialValue={content.editorial.body} onCommit={commit('editorial', 'body')} multiline
              style={{ display: 'block', fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.85, color: 'var(--fg2)', maxWidth: 460 }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {['photo-1616486338812-3dadae4b4ace','photo-1600607687939-ce8a6c25118c','photo-1631679706909-1844bbd07221','photo-1618221195710-dd6b41faaea6'].map((id, i) => (
              <img key={i} src={`https://images.unsplash.com/${id}?w=400`} alt="" style={{ width: '100%', aspectRatio: '1/1.3', objectFit: 'cover', display: 'block' }} />
            ))}
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

      {/* ── Services ── */}
      <SectionWrap label="Services" id="acms-services" bg="var(--bg2)" {...sp('services')}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: 'var(--sp-14) var(--sp-10)', gap: 'var(--sp-12)' }}>
          <div style={{ minHeight: 480 }}>
            <ImageSlot imgKey="servicesImg" url={content.images.servicesImg} onUploaded={onImageUploaded}
              label="Services image" aspect="4/5" />
          </div>
          <div>
            <EditableText tag="p" className="t-eyebrow" initialValue={content.services.eyebrow}
              onCommit={commit('services', 'eyebrow')} style={{ display: 'block', marginBottom: 'var(--sp-5)' }} />
            <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 'clamp(32px,3.5vw,56px)', lineHeight: 0.92, marginBottom: 'var(--sp-7)' }}>
              <EditableText initialValue={content.services.titleLine1} onCommit={commit('services', 'titleLine1')} /><br />
              <EditableText initialValue={content.services.titleAccent} onCommit={commit('services', 'titleAccent')} style={{ fontStyle: 'italic', color: 'var(--gold)' }} />
            </h2>
            <EditableText tag="p" initialValue={content.services.body} onCommit={commit('services', 'body')} multiline
              style={{ display: 'block', fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.85, color: 'var(--fg2)', marginBottom: 'var(--sp-8)' }} />
            {(['step1','step2','step3','step4'] as const).map(sk => (
              <div key={sk} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', borderTop: '1px solid rgba(26,23,20,0.06)' }}>
                <div style={{ width: 40, height: 1, background: 'var(--gold2)', flexShrink: 0 }} />
                <EditableText tag="span" initialValue={content.services[sk]} onCommit={commit('services', sk)}
                  style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fg2)' }} />
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

      {/* ── Atelier (Our Story) ── */}
      <SectionWrap label="Atelier / Our Story" id="acms-atelier" bg="var(--bg)" {...sp('atelier')}>
        {/* Hero row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 480 }}>
          <div style={{ padding: 'var(--sp-13) var(--sp-10)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <EditableText tag="p" className="t-eyebrow" initialValue={content.atelier.heroEyebrow}
              onCommit={commit('atelier', 'heroEyebrow')} style={{ display: 'block', marginBottom: 'var(--sp-7)' }} />
            <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 'clamp(36px,4vw,72px)', lineHeight: 0.9, marginBottom: 'var(--sp-7)' }}>
              <EditableText initialValue={content.atelier.heroTitle1} onCommit={commit('atelier', 'heroTitle1')} /><br />
              <EditableText initialValue={content.atelier.heroTitleArt} onCommit={commit('atelier', 'heroTitleArt')} style={{ color: 'var(--gold)', fontStyle: 'italic' }} /><br />
              <EditableText initialValue={content.atelier.heroTitle2} onCommit={commit('atelier', 'heroTitle2')} />
            </h2>
            <EditableText tag="p" initialValue={content.atelier.heroBody} onCommit={commit('atelier', 'heroBody')} multiline
              style={{ display: 'block', fontFamily: 'var(--serif)', fontSize: 15, lineHeight: 1.85, color: 'var(--fg2)', maxWidth: 440 }} />
          </div>
          <ImageSlot imgKey="atelierHeroImg" url={content.images.atelierHeroImg} onUploaded={onImageUploaded}
            label="Atelier hero image" aspect="auto" />
        </div>
        {/* Manifesto */}
        <div style={{ padding: 'var(--sp-14) var(--sp-10)', background: 'var(--bg2)', textAlign: 'center', borderTop: '1px solid var(--border-dim)' }}>
          <div style={{ width: 48, height: 1, background: 'var(--gold2)', margin: '0 auto var(--sp-7)' }} />
          <EditableText tag="p" initialValue={content.atelier.manifestoQuote} onCommit={commit('atelier', 'manifestoQuote')} multiline
            style={{ display: 'block', fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 'clamp(16px,2vw,24px)', lineHeight: 1.6, color: 'var(--fg)', maxWidth: 760, margin: '0 auto var(--sp-5)' }} />
          <EditableText tag="p" initialValue={content.atelier.manifestoAttr} onCommit={commit('atelier', 'manifestoAttr')}
            style={{ display: 'block', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg3)' }} />
        </div>
        {/* Workshop row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid var(--border-dim)' }}>
          <ImageSlot imgKey="atelierWorkshopImg" url={content.images.atelierWorkshopImg} onUploaded={onImageUploaded}
            label="Workshop image" aspect="4/3" />
          <div style={{ padding: 'var(--sp-13) var(--sp-10)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <EditableText tag="p" className="t-eyebrow" initialValue={content.atelier.workshopEyebrow}
              onCommit={commit('atelier', 'workshopEyebrow')} style={{ display: 'block', marginBottom: 'var(--sp-5)' }} />
            <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 'clamp(28px,3vw,52px)', lineHeight: 0.92, marginBottom: 'var(--sp-7)' }}>
              <EditableText initialValue={content.atelier.workshopTitle1} onCommit={commit('atelier', 'workshopTitle1')} /><br />
              <EditableText initialValue={content.atelier.workshopTitleArt} onCommit={commit('atelier', 'workshopTitleArt')} style={{ fontStyle: 'italic', color: 'var(--gold)' }} />
            </h2>
            <EditableText tag="p" initialValue={content.atelier.workshopBody} onCommit={commit('atelier', 'workshopBody')} multiline
              style={{ display: 'block', fontFamily: 'var(--serif)', fontSize: 15, lineHeight: 1.85, color: 'var(--fg2)' }} />
          </div>
        </div>
        {/* CTA */}
        <div style={{ padding: 'var(--sp-10)', textAlign: 'center', borderTop: '1px solid var(--border-dim)' }}>
          <EditableText tag="h3" initialValue={content.atelier.ctaTitle} onCommit={commit('atelier', 'ctaTitle')}
            style={{ display: 'block', fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 'clamp(24px,2.5vw,40px)', marginBottom: 'var(--sp-6)' }} />
          <span style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--fg3)', border: '1px solid var(--border-dim)', padding: '10px 24px', pointerEvents: 'none' }}>Shop All Pieces</span>
        </div>
      </SectionWrap>

      {/* ── Footer Tagline ── */}
      <SectionWrap label="Footer Tagline" id="acms-footer" bg="#0c0b0a" {...sp('footer')}>
        <div style={{ padding: 'var(--sp-10) var(--sp-10) var(--sp-8)', textAlign: 'center' }}>
          <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(240,237,230,0.35)', marginBottom: 16 }}>LUXURIO HOME</p>
          <EditableText tag="p" initialValue={content.footer.tagline} onCommit={commit('footer', 'tagline')} multiline
            style={{ display: 'block', fontFamily: 'var(--serif)', fontSize: 13, lineHeight: 1.8, color: 'rgba(240,237,230,0.4)', maxWidth: 480, margin: '0 auto' }} />
          <p style={{ fontSize: 9, marginTop: 24, color: 'rgba(240,237,230,0.15)', letterSpacing: '0.15em' }}>© Luxurio Home 2026 — Milan</p>
        </div>
      </SectionWrap>

      <div style={{ height: 60, background: 'var(--bg)' }} />
    </div>
  );
}

