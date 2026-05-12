import { useEffect } from 'react';

export function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } }),
      { threshold: 0.05, rootMargin: '60px 0px 0px 0px' }
    );
    document.querySelectorAll('.reveal:not(.visible)').forEach((el) => {
      const rect = el.getBoundingClientRect();
      // Already in view — show immediately
      if (rect.top < window.innerHeight) { el.classList.add('visible'); }
      else { obs.observe(el); }
    });
    return () => obs.disconnect();
  });
}

interface PlaceholderProps {
  id: string;
  bg?: string;
  angle?: number;
  color?: string;
  label?: string;
  style?: React.CSSProperties;
}
export function Placeholder({ id, bg = '#f0ece4', angle = 25, color = 'rgba(139,109,26,0.1)', label, style = {} }: PlaceholderProps) {
  return (
    <div style={{ background: bg, position: 'relative', overflow: 'hidden', ...style }}>
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <defs>
          <pattern id={`p${id}`} width="24" height="24" patternUnits="userSpaceOnUse" patternTransform={`rotate(${angle})`}>
            <line x1="0" y1="0" x2="0" y2="24" stroke={color} strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p${id})`} />
      </svg>
      {label && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(200,175,130,0.3)' }}>
          {label}
        </div>
      )}
    </div>
  );
}

interface ImgOrPlaceholderProps {
  url?: string;
  alt?: string;
  bg?: string;
  id: string;
  label?: string;
  style?: React.CSSProperties;
  className?: string;
}
export function ImgOrPlaceholder({ url, alt, bg, id, label, style = {}, className }: ImgOrPlaceholderProps) {
  if (url) {
    return (
      <div className={className} style={{ position: 'relative', overflow: 'hidden', ...style }}>
        <img
          src={url}
          alt={alt || ''}
          loading="lazy"
          decoding="async"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
    );
  }
  return <Placeholder id={id} bg={bg} label={label} style={style} />;
}
