import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../i18n';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const current = SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language.split('-')[0]) || SUPPORTED_LANGUAGES[0];

  function pick(code: string) {
    i18n.changeLanguage(code);
    setOpen(false);
  }

  return (
    <div style={{ position: 'relative' }} onMouseLeave={() => setOpen(false)}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--fg3)',
          fontSize: 10,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        {current.short}
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 12px)',
            right: 0,
            background: 'rgba(14,13,11,0.97)',
            border: '1px solid rgba(240,237,230,0.07)',
            backdropFilter: 'blur(12px)',
            minWidth: 140,
            padding: '8px 0',
            zIndex: 200,
          }}
        >
          {SUPPORTED_LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => pick(l.code)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                background: 'transparent',
                border: 'none',
                color: l.code === current.code ? 'var(--gold)' : 'var(--fg2)',
                fontSize: 11,
                letterSpacing: '0.1em',
                padding: '10px 18px',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(240,237,230,0.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
