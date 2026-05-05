import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useReveal } from '../components/primitives';

const TIMELINE = [
  { year: '2012', text: 'Founded in Milan by two architects who believed furniture should outlast fashion. First atelier opens on Via della Spiga.' },
  { year: '2015', text: "First international commission — a private residence in London's Notting Hill. The Margaux lounge chair wins the Salone del Mobile Rising Talent award." },
  { year: '2018', text: 'Expansion into textiles and lighting. New York showroom opens in the West Village. Partnerships with ten independent European workshops established.' },
  { year: '2021', text: 'Sustainability charter adopted. All upholstery fabrics sourced from certified mills. Carbon-neutral shipping programme launched across Europe.' },
  { year: '2024', text: 'Online atelier opens, bringing made-to-order furniture to a global audience without compromising craft or material integrity.' },
  { year: '2026', text: 'The S/S 2026 collection — our largest to date — marks fourteen years of stillness over noise.' },
];

const VALUES = [
  {
    title: 'Craft over speed',
    body: 'Every piece is made to order in small batches by family-run workshops in Italy, Portugal, and Denmark. We never hold stock we didn\'t intend to make.',
  },
  {
    title: 'Materials with memory',
    body: 'We source oak, walnut, linen, and leather from suppliers we have visited personally. We choose materials that improve with age, not ones that hide it.',
  },
  {
    title: 'Design with restraint',
    body: 'We collaborate only with designers who understand that the best furniture disappears into a room — present, but never loud.',
  },
  {
    title: 'Transparency',
    body: 'Our pricing reflects the true cost of craft. We publish the names of every workshop and designer we work with. Nothing is anonymous.',
  },
];

export function OurStory() {
  useReveal();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={{ paddingTop: 72, background: 'var(--bg)', color: 'var(--fg)' }}>

      {/* ── Hero ── */}
      <section style={{ minHeight: '70vh', display: 'grid', gridTemplateColumns: '1fr 1fr', position: 'relative', borderBottom: '1px solid rgba(240,237,230,0.06)' }}>
        <div style={{ padding: '100px 72px 80px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <p className="reveal" style={{ fontSize: 9, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: 24 }}>
            Est. 2012 · Milan
          </p>
          <h1 className="reveal" style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 'clamp(56px, 6vw, 100px)', lineHeight: 0.92, letterSpacing: '-0.02em', marginBottom: 40 }}>
            The<br /><em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Atelier</em><br />Story.
          </h1>
          <p className="reveal" style={{ fontFamily: 'var(--serif)', fontSize: 18, lineHeight: 1.85, color: 'var(--fg2)', maxWidth: 420 }}>
            Luxurio began as a conversation between two architects who were tired of furniture that looked good in a catalogue and fell apart in a decade. We set out to make pieces worth keeping — worth inheriting.
          </p>
        </div>
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <img
            src="https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=1200"
            alt="Luxurio atelier interior"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,9,8,0.4), transparent)' }} />
        </div>
      </section>

      {/* ── Manifesto ── */}
      <section style={{ padding: '120px 56px', textAlign: 'center', borderBottom: '1px solid rgba(240,237,230,0.06)' }}>
        <div className="reveal" style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ width: 40, height: 1, background: 'var(--gold2)', margin: '0 auto 48px' }} />
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(22px, 2.8vw, 36px)', lineHeight: 1.55, color: 'var(--fg2)', letterSpacing: '0.01em' }}>
            "We are not interested in trends. We are interested in the kind of object that becomes invisible in the best possible sense — something so at home in a room that no one can imagine the room without it."
          </p>
          <p style={{ fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--fg3)', marginTop: 32 }}>
            — Marco Ferretti & Elise Vander, Co-founders
          </p>
        </div>
      </section>

      {/* ── Values ── */}
      <section style={{ padding: '120px 56px', background: 'var(--bg2)', borderBottom: '1px solid rgba(240,237,230,0.06)' }}>
        <div className="reveal" style={{ marginBottom: 72 }}>
          <p style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: 16 }}>What we believe</p>
          <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 'clamp(36px, 4vw, 64px)', letterSpacing: '-0.01em' }}>
            Our principles.
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '48px 80px' }}>
          {VALUES.map((v, i) => (
            <div key={i} className="reveal">
              <div style={{ width: 32, height: 1, background: 'var(--gold2)', marginBottom: 24 }} />
              <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 26, marginBottom: 16 }}>{v.title}</h3>
              <p style={{ fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.85, color: 'var(--fg2)' }}>{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Timeline ── */}
      <section style={{ padding: '120px 56px', borderBottom: '1px solid rgba(240,237,230,0.06)' }}>
        <div className="reveal" style={{ marginBottom: 72 }}>
          <p style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: 16 }}>Fourteen years</p>
          <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 'clamp(36px, 4vw, 64px)', letterSpacing: '-0.01em' }}>
            A brief history.
          </h2>
        </div>
        <div style={{ maxWidth: 720 }}>
          {TIMELINE.map((item, i) => (
            <div key={i} className="reveal" style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 40, marginBottom: 48, paddingBottom: 48, borderBottom: i < TIMELINE.length - 1 ? '1px solid rgba(240,237,230,0.06)' : 'none' }}>
              <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 22, color: 'var(--gold)', paddingTop: 3 }}>{item.year}</p>
              <p style={{ fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.85, color: 'var(--fg2)' }}>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Workshops ── */}
      <section style={{ padding: '120px 56px', background: 'var(--bg2)', borderBottom: '1px solid rgba(240,237,230,0.06)' }}>
        <div className="reveal" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: 16 }}>The workshops</p>
            <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 'clamp(32px, 3.5vw, 56px)', lineHeight: 1.05, marginBottom: 28 }}>
              Made by hand,<br /><em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>in Europe.</em>
            </h2>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.85, color: 'var(--fg2)', maxWidth: 440 }}>
              We work with twelve independent workshops across Italy, Portugal, and Denmark. Each one is family-owned, each one has been producing at the highest level for at least two generations. We visit every partner every year — not to audit, but to learn.
            </p>
          </div>
          <div style={{ position: 'relative', paddingBottom: '70%' }}>
            <img
              src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200"
              alt="Craftsman at work"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '120px 56px', textAlign: 'center' }}>
        <div className="reveal">
          <p style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: 20 }}>The collection</p>
          <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 'clamp(32px, 4vw, 64px)', letterSpacing: '-0.01em', marginBottom: 40 }}>
            Explore the pieces.
          </h2>
          <Link to="/shop">
            <button className="btn" style={{ padding: '18px 48px', fontSize: 10, letterSpacing: '0.2em' }}>
              Shop All Pieces
            </button>
          </Link>
        </div>
      </section>

    </div>
  );
}
