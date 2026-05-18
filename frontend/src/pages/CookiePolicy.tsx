import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export function CookiePolicy() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <main className="page-main" style={{ maxWidth: 820, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 400, letterSpacing: '0.02em', marginBottom: 'var(--sp-4)', color: 'var(--fg)' }}>
        Cookie Policy
      </h1>
      <p style={{ fontSize: 'var(--text-xs)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: 'var(--sp-10)' }}>
        Last updated: May 2026
      </p>

      <Section title="1. What Are Cookies?">
        Cookies are small text files placed on your device when you visit a website. They are widely used to make websites work
        efficiently, to remember your preferences, and to provide information to website owners. Cookies cannot execute programs
        or deliver viruses to your computer.
      </Section>

      <Section title="2. How We Use Cookies">
        We use cookies to:
        <ul style={listStyle}>
          <li>Keep you signed in to your account during a browsing session.</li>
          <li>Remember items in your favourites list.</li>
          <li>Remember your cookie consent choice so we don't ask again.</li>
          <li>Understand how visitors use our website (analytics), with your consent.</li>
          <li>Show you relevant content and offers (marketing), with your consent.</li>
        </ul>
      </Section>

      <Section title="3. Types of Cookies We Use">
        <table style={tableStyle}>
          <thead>
            <tr>
              {['Category', 'Purpose', 'Duration', 'Required?'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['Essential', 'Authentication token (keeps you logged in), consent preference', 'Session / 7 days', 'Yes'],
              ['Functional', 'Favourites list, language preference, theme preference', 'Local storage', 'Yes'],
              ['Analytics', 'Google Analytics — page views, session duration, traffic sources', '2 years', 'No (consent required)'],
              ['Marketing', 'Advertising personalisation and conversion tracking', '90 days', 'No (consent required)'],
            ].map(([cat, purpose, dur, req]) => (
              <tr key={cat as string}>
                <td style={tdStyle}><strong>{cat}</strong></td>
                <td style={tdStyle}>{purpose}</td>
                <td style={tdStyle}>{dur}</td>
                <td style={tdStyle}>{req}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="4. Managing Your Consent">
        When you first visit our website, a cookie banner asks for your consent for non-essential cookies. You can:
        <ul style={listStyle}>
          <li>Accept all cookies.</li>
          <li>Accept essential cookies only.</li>
          <li>Choose individual categories via the "Manage" option.</li>
        </ul>
        You can change your preferences at any time by clearing your browser cookies and revisiting the site — the banner will
        reappear. You can also manage cookies directly in your browser settings (see section 6 below).
      </Section>

      <Section title="5. Third-Party Cookies">
        Some cookies on our website are set by third-party services we use:
        <ul style={listStyle}>
          <li><strong>Google Analytics</strong> — usage analytics. See Google's{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={linkStyle}>Privacy Policy</a>.
          </li>
          <li><strong>Stripe</strong> — payment processing. Strictly necessary for checkout. See Stripe's{' '}
            <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" style={linkStyle}>Privacy Policy</a>.
          </li>
        </ul>
        We do not control these third-party cookies. Please review their respective policies for more information.
      </Section>

      <Section title="6. Browser Cookie Controls">
        All major browsers allow you to control cookies through their settings:
        <ul style={listStyle}>
          <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" style={linkStyle}>Google Chrome</a></li>
          <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" style={linkStyle}>Mozilla Firefox</a></li>
          <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471" target="_blank" rel="noopener noreferrer" style={linkStyle}>Apple Safari</a></li>
          <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge" target="_blank" rel="noopener noreferrer" style={linkStyle}>Microsoft Edge</a></li>
        </ul>
        Note that blocking all cookies may affect the functionality of our website.
      </Section>

      <Section title="7. Changes to This Policy">
        We may update this Cookie Policy from time to time. Any changes will be reflected by the date at the top of this page.
        We will notify you of significant changes through the cookie consent banner.
      </Section>

      <Section title="8. Contact">
        If you have questions about our use of cookies, please contact us at{' '}
        <a href="mailto:info@luxuriohome.com" style={linkStyle}>info@luxuriohome.com</a>. For broader privacy questions, see
        our <Link to="/privacy" style={linkStyle}>Privacy Policy</Link>.
      </Section>
    </main>
  );
}

const linkStyle: React.CSSProperties = { color: 'var(--gold)', borderBottom: '1px solid var(--gold2)' };
const listStyle: React.CSSProperties = { margin: 'var(--sp-4) 0 0 var(--sp-6)', lineHeight: 2, color: 'var(--fg2)', fontSize: 'var(--text-body)' };
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', marginTop: 'var(--sp-4)', fontSize: 'var(--text-body)' };
const thStyle: React.CSSProperties = { textAlign: 'left', padding: 'var(--sp-3) var(--sp-4)', fontSize: 'var(--text-xs)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg3)', borderBottom: 'var(--border-mid)' };
const tdStyle: React.CSSProperties = { padding: 'var(--sp-3) var(--sp-4)', color: 'var(--fg2)', borderBottom: 'var(--border-subtle)', verticalAlign: 'top', lineHeight: 1.7 };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 'var(--sp-9)' }}>
      <h2 style={{
        fontFamily: 'var(--serif)', fontSize: 'var(--text-body)', fontWeight: 400,
        letterSpacing: '0.05em', color: 'var(--fg)', marginBottom: 'var(--sp-3)',
        paddingBottom: 'var(--sp-3)', borderBottom: 'var(--border-subtle)',
      }}>
        {title}
      </h2>
      <p style={{ fontSize: 'var(--text-body)', lineHeight: 1.85, color: 'var(--fg2)' }}>
        {children}
      </p>
    </div>
  );
}
