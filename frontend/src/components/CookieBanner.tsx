import { useState } from 'react';
import { useConsent } from '../lib/consent';

/**
 * GDPR / ePrivacy cookie consent banner.
 *
 * Shows a bottom bar on first visit.
 * - "Accept All"      → analytics + marketing enabled
 * - "Essential Only"  → only strictly-necessary cookies
 * - "Manage"          → expands an inline panel with per-category toggles
 *
 * Disappears once the user has made a choice.
 * Re-renders are batched — no flash on pages that load slowly.
 */
export function CookieBanner() {
  const { consent, acceptAll, acceptEssential } = useConsent();
  const [expanded, setExpanded] = useState(false);
  const [analyticsOn, setAnalyticsOn] = useState(false);
  const [marketingOn, setMarketingOn] = useState(false);

  // Already decided — render nothing
  if (consent !== null) return null;

  function saveCustom() {
    if (analyticsOn || marketingOn) {
      // Partially accepted — write manually via acceptAll/acceptEssential pathways
      // We import writeStored indirectly through the hook, so call the right one
      if (analyticsOn && marketingOn) {
        acceptAll();
      } else {
        // Partial: use acceptEssential then we'd need a mid-tier save.
        // For simplicity, treat partial as essential-only for marketing, analytics-only for analytics.
        // Expose a saveCustom path via a small inline write.
        try {
          localStorage.setItem(
            'lux_consent',
            JSON.stringify({ necessary: true, analytics: analyticsOn, marketing: marketingOn }),
          );
          // Force re-render by calling acceptEssential then patching — simplest: trigger storage event
          window.dispatchEvent(new StorageEvent('storage', { key: 'lux_consent' }));
        } catch { /* noop */ }
      }
    } else {
      acceptEssential();
    }
  }

  return (
    <div className="cb-backdrop" role="dialog" aria-modal="true" aria-label="Cookie preferences">
      <div className="cb-bar">
        {/* ── Collapsed view ── */}
        {!expanded && (
          <div className="cb-row">
            <div className="cb-text">
              <p className="cb-title">We value your privacy.</p>
              <p className="cb-body">
                We use essential cookies to keep you signed in. With your consent we also use analytics
                cookies to understand how visitors use the site — no personal data is sold or shared.{' '}
                <a className="cb-link" href="/legal/privacy" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </a>
              </p>
            </div>
            <div className="cb-actions">
              <button className="cb-btn cb-btn--ghost" onClick={() => setExpanded(true)}>
                Manage
              </button>
              <button className="cb-btn cb-btn--outline" onClick={acceptEssential}>
                Essential Only
              </button>
              <button className="cb-btn cb-btn--primary" onClick={acceptAll}>
                Accept All
              </button>
            </div>
          </div>
        )}

        {/* ── Expanded manage view ── */}
        {expanded && (
          <div className="cb-manage">
            <p className="cb-title">Manage preferences</p>

            <div className="cb-category">
              <div className="cb-category-head">
                <span className="cb-category-name">Strictly Necessary</span>
                <span className="cb-badge">Always on</span>
              </div>
              <p className="cb-category-desc">
                Authentication session cookies required for login and checkout. Cannot be disabled.
              </p>
            </div>

            <div className="cb-category">
              <div className="cb-category-head">
                <span className="cb-category-name">Analytics</span>
                <label className="cb-toggle" aria-label="Toggle analytics cookies">
                  <input
                    type="checkbox"
                    checked={analyticsOn}
                    onChange={(e) => setAnalyticsOn(e.target.checked)}
                  />
                  <span className="cb-toggle-track" />
                </label>
              </div>
              <p className="cb-category-desc">
                Helps us understand which pages are visited most and how users navigate the site.
                No personally identifiable data is stored.
              </p>
            </div>

            <div className="cb-category">
              <div className="cb-category-head">
                <span className="cb-category-name">Marketing</span>
                <label className="cb-toggle" aria-label="Toggle marketing cookies">
                  <input
                    type="checkbox"
                    checked={marketingOn}
                    onChange={(e) => setMarketingOn(e.target.checked)}
                  />
                  <span className="cb-toggle-track" />
                </label>
              </div>
              <p className="cb-category-desc">
                Used to deliver relevant ads and measure campaign performance across third-party
                platforms such as Meta. We do not currently run paid campaigns.
              </p>
            </div>

            <div className="cb-manage-actions">
              <button className="cb-btn cb-btn--ghost" onClick={() => setExpanded(false)}>
                ← Back
              </button>
              <button className="cb-btn cb-btn--primary" onClick={saveCustom}>
                Save preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
