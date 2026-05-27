import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../i18n';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current =
    SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language.split('-')[0]) ||
    SUPPORTED_LANGUAGES[0];

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  function pick(code: string) {
    i18n.changeLanguage(code);
    setOpen(false);
  }

  return (
    <div ref={ref} className="lang-switcher">
      <button
        type="button"
        className="lang-switcher-btn"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {current.short}
        <svg
          className={`lang-switcher-chevron${open ? ' open' : ''}`}
          width="8"
          height="5"
          viewBox="0 0 8 5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          aria-hidden="true"
        >
          <polyline points="1,1 4,4 7,1" />
        </svg>
      </button>

      {open && (
        <div className="lang-switcher-dropdown" role="listbox">
          {SUPPORTED_LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              role="option"
              aria-selected={l.code === current.code}
              className={`lang-switcher-option${l.code === current.code ? ' active' : ''}`}
              onClick={() => pick(l.code)}
            >
              <span className="lang-switcher-option-short">{l.short}</span>
              <span className="lang-switcher-option-label">{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
