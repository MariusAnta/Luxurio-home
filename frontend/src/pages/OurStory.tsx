import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useReveal } from '../components/primitives';
import { Seo } from '../components/Seo';
import { api } from '../lib/api';

interface AtelierContent {
  heroEyebrow?: string; heroTitle1?: string; heroTitleArt?: string;
  heroTitle2?: string; heroBody?: string;
  manifestoQuote?: string; manifestoAttr?: string;
  workshopEyebrow?: string; workshopTitle1?: string; workshopTitleArt?: string;
  workshopBody?: string; ctaTitle?: string;
}
interface ContentImages { atelierHeroImg?: string; atelierWorkshopImg?: string; }

const ATELIER_DEFAULTS: Required<AtelierContent> = {
  heroEyebrow: 'Est. 2012 · Milan',
  heroTitle1: 'The', heroTitleArt: 'Atelier', heroTitle2: 'Story.',
  heroBody: 'Luxurio began as a conversation between two architects who were tired of furniture that looked good in a catalogue and fell apart in a decade. We set out to make pieces worth keeping — worth inheriting.',
  manifestoQuote: '"We are not interested in trends. We are interested in the kind of object that becomes invisible in the best possible sense — something so at home in a room that no one can imagine the room without it."',
  manifestoAttr: '— Marco Ferretti & Elise Vander, Co-founders',
  workshopEyebrow: 'The workshops',
  workshopTitle1: 'Made by hand,', workshopTitleArt: 'in Europe.',
  workshopBody: 'We work with twelve independent workshops across Italy, Portugal, and Denmark. Each one is family-owned, each one has been producing at the highest level for at least two generations. We visit every partner every year — not to audit, but to learn.',
  ctaTitle: 'Explore the pieces.',
};

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

  const [a, setA] = useState<Required<AtelierContent>>(ATELIER_DEFAULTS);
  const [imgs, setImgs] = useState<ContentImages>({
    atelierHeroImg: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=1200',
    atelierWorkshopImg: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200',
  });

  useEffect(() => {
    api.get<{ value: Record<string, unknown> | null }>('/settings/content').then(({ data }) => {
      if (!data.value) return;
      if (data.value.atelier) setA(v => ({ ...v, ...(data.value!.atelier as AtelierContent) }));
      if (data.value.images) setImgs(v => ({ ...v, ...(data.value!.images as ContentImages) }));
    }).catch(() => {});
  }, []);

  return (
    <div className="our-story-wrap">
      <Seo
        title="Our Story"
        description="Luxurio Home was founded in Milan in 2012 by two architects who believed furniture should outlast fashion. Discover our story, values, and the workshops behind every piece."
        canonical="/our-story"
        breadcrumbs={[{ name: 'Our Story', path: '/our-story' }]}
      />

      {/* ── Hero ── */}
      <section className="our-story-hero">
        <div className="os-hero-text">
          <p className="t-eyebrow reveal">{a.heroEyebrow}</p>
          <h1 className="os-hero-title reveal">
            {a.heroTitle1}<br /><em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>{a.heroTitleArt}</em><br />{a.heroTitle2}
          </h1>
          <p className="os-hero-body t-prose reveal">{a.heroBody}</p>
        </div>
        <div className="our-story-hero-img">
          <img
            src={imgs.atelierHeroImg || 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=1200'}
            alt="Luxurio atelier interior"
            className="cover-abs"
          />
          <div className="os-hero-overlay" />
        </div>
      </section>

      {/* ── Manifesto ── */}
      <section className="our-story-section our-story-section-center">
        <div className="reveal os-manifesto-inner">
          <div className="os-manifesto-rule" />
          <p className="os-manifesto-quote">{a.manifestoQuote}</p>
          <p className="os-manifesto-attr">{a.manifestoAttr}</p>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="our-story-section os-section-alt">
        <div className="reveal os-section-head">
          <p className="t-eyebrow t-eyebrow--mb">What we believe</p>
          <h2 className="os-section-h2">Our principles.</h2>
        </div>
        <div className="our-story-2col os-values-2col">
          {VALUES.map((v, i) => (
            <div key={i} className="reveal">
              <div className="os-value-rule" />
              <h3 className="os-value-h3">{v.title}</h3>
              <p className="t-prose">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="our-story-section">
        <div className="reveal os-section-head">
          <p className="t-eyebrow t-eyebrow--mb">Fourteen years</p>
          <h2 className="os-section-h2">A brief history.</h2>
        </div>
        <div className="os-timeline">
          {TIMELINE.map((item, i) => (
            <div key={i} className="reveal os-timeline-item">
              <p className="os-timeline-year">{item.year}</p>
              <p className="t-prose">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Workshops ── */}
      <section className="our-story-section os-section-alt">
        <div className="reveal our-story-2col os-workshops-2col">
          <div>
            <p className="t-eyebrow t-eyebrow--mb">{a.workshopEyebrow}</p>
            <h2 className="os-workshop-h2">
              {a.workshopTitle1}<br /><em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>{a.workshopTitleArt}</em>
            </h2>
            <p className="t-prose os-workshop-body">{a.workshopBody}</p>
          </div>
          <div className="os-workshop-img">
            <img
              src={imgs.atelierWorkshopImg || 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200'}
              alt="Craftsman at work"
              className="cover-abs"
            />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="our-story-section our-story-section-center">
        <div className="reveal">
          <p className="os-cta-eyebrow">The collection</p>
          <h2 className="os-cta-h2">{a.ctaTitle}</h2>
          <Link to="/shop"><button className="btn btn-cta">Shop All Pieces</button></Link>
        </div>
      </section>

    </div>
  );
}
