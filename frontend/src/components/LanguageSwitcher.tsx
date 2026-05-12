import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../i18n';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const current = SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language.split('-')[0]) || SUPPORTED_LANGUAGES[0];

  function openDropdown() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }
  function scheduleClose() {
    closeTimer.current = setTimeout(() => setOpen(false), 200);
  }

  function pick(code: string) {
    i18n.changeLanguage(code);
    setOpen(false);
  }

  return (
    <div style={{ position: 'relative' }} onMouseEnter={openDropdown} onMouseLeave={scheduleClose}>
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
          onMouseEnter={openDropdown}
          onMouseLeave={scheduleClose}
          style={{
            position: 'absolute',
            top: 'calc(100% + 12px)',
            right: 0,
            background: 'rgba(250,249,247,0.97)',
            border: '1px solid rgba(26,23,20,0.08)',
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
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(26,23,20,0.04)')}
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
