/**
 * Consent management — stores user choice in localStorage under 'lux_consent'.
 *
 * Categories:
 *  - necessary  : always true, httpOnly session cookies — no consent required
 *  - analytics  : GA4, Plausible, etc.
 *  - marketing  : Meta Pixel, remarketing tags
 *
 * Usage in a component or hook:
 *   const { consent, acceptAll, acceptEssential, revokeConsent } = useConsent();
 *   if (consent.analytics) { // load GA4 }
 */

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'lux_consent';

export interface ConsentPrefs {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
}

export interface ConsentState {
  /** null = not yet decided (show banner) */
  consent: ConsentPrefs | null;
  acceptAll: () => void;
  acceptEssential: () => void;
  revokeConsent: () => void;
}

function readStored(): ConsentPrefs | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentPrefs>;
    if (typeof parsed.analytics !== 'boolean') return null;
    return { necessary: true, analytics: parsed.analytics, marketing: parsed.marketing ?? false };
  } catch {
    return null;
  }
}

function writeStored(prefs: ConsentPrefs): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // storage may be unavailable (private browsing quota)
  }
}

export function useConsent(): ConsentState {
  const [consent, setConsent] = useState<ConsentPrefs | null>(readStored);

  // Sync across tabs
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) setConsent(readStored());
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const acceptAll = useCallback(() => {
    const prefs: ConsentPrefs = { necessary: true, analytics: true, marketing: true };
    writeStored(prefs);
    setConsent(prefs);
  }, []);

  const acceptEssential = useCallback(() => {
    const prefs: ConsentPrefs = { necessary: true, analytics: false, marketing: false };
    writeStored(prefs);
    setConsent(prefs);
  }, []);

  const revokeConsent = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
    setConsent(null);
  }, []);

  return { consent, acceptAll, acceptEssential, revokeConsent };
}
