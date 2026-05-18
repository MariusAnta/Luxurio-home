import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export function PrivacyPolicy() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <main className="page-main" style={{ maxWidth: 820, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 400, letterSpacing: '0.02em', marginBottom: 'var(--sp-4)', color: 'var(--fg)' }}>
        Privacy Policy
      </h1>
      <p style={{ fontSize: 'var(--text-xs)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: 'var(--sp-10)' }}>
        Last updated: May 2026
      </p>

      <Section title="1. Who We Are">
        Luxurio Home ("we", "us", "our") is the data controller responsible for your personal data. We are a luxury furniture
        retailer operating at <a href="https://luxuriohome.com" style={linkStyle}>luxuriohome.com</a>. For any privacy-related
        enquiries, contact us at{' '}
        <a href="mailto:info@luxuriohome.com" style={linkStyle}>info@luxuriohome.com</a>.
      </Section>

      <Section title="2. What Data We Collect">
        We may collect and process the following personal data:
        <ul style={listStyle}>
          <li><strong>Identity data</strong> — name, username or similar identifier.</li>
          <li><strong>Contact data</strong> — email address, telephone number, delivery and billing address.</li>
          <li><strong>Transaction data</strong> — details of products you have purchased and payments made.</li>
          <li><strong>Technical data</strong> — IP address, browser type and version, time zone, operating system.</li>
          <li><strong>Usage data</strong> — information about how you use our website and services.</li>
          <li><strong>Marketing preferences</strong> — your preferences in receiving marketing communications from us.</li>
        </ul>
      </Section>

      <Section title="3. How We Collect Your Data">
        We collect data through:
        <ul style={listStyle}>
          <li>Direct interactions — when you register an account, place an order, or contact us.</li>
          <li>Automated technologies — cookies and similar tracking technologies as you browse our website (see our{' '}
            <Link to="/cookies" style={linkStyle}>Cookie Policy</Link>).
          </li>
          <li>Third parties — payment processors, delivery partners, and analytics providers.</li>
        </ul>
      </Section>

      <Section title="4. How We Use Your Data">
        We use your personal data to:
        <ul style={listStyle}>
          <li>Process and deliver your orders, including managing payments and returns.</li>
          <li>Manage your account and provide customer support.</li>
          <li>Send you order confirmations and service-related communications.</li>
          <li>Send you marketing communications where you have given consent or we have a legitimate interest.</li>
          <li>Improve our website, products, and services through analytics.</li>
          <li>Comply with legal and regulatory obligations.</li>
        </ul>
      </Section>

      <Section title="5. Legal Basis for Processing">
        We process your data under the following lawful bases:
        <ul style={listStyle}>
          <li><strong>Contract</strong> — to fulfil your order and manage your account.</li>
          <li><strong>Legitimate interests</strong> — to improve our services and prevent fraud.</li>
          <li><strong>Consent</strong> — for marketing emails and non-essential cookies, which you may withdraw at any time.</li>
          <li><strong>Legal obligation</strong> — to comply with applicable laws and regulations.</li>
        </ul>
      </Section>

      <Section title="6. Data Sharing">
        We do not sell your personal data. We may share it with:
        <ul style={listStyle}>
          <li>Payment processors (e.g. Stripe) to handle transactions securely.</li>
          <li>Delivery and logistics partners to fulfil your orders.</li>
          <li>Analytics providers (e.g. Google Analytics) to help us understand website usage — only with your consent.</li>
          <li>Legal authorities where required by law.</li>
        </ul>
        All third parties are contractually required to handle your data securely and in accordance with applicable law.
      </Section>

      <Section title="7. Data Retention">
        We retain your personal data only for as long as necessary to fulfil the purposes for which it was collected. Order and
        transaction records are kept for 7 years to comply with tax and accounting obligations. Account data is deleted upon
        request, subject to any overriding legal obligation.
      </Section>

      <Section title="8. Your Rights">
        Under the GDPR you have the right to:
        <ul style={listStyle}>
          <li><strong>Access</strong> — request a copy of your personal data.</li>
          <li><strong>Rectification</strong> — ask us to correct inaccurate data.</li>
          <li><strong>Erasure</strong> — request deletion of your data ("right to be forgotten").</li>
          <li><strong>Restriction</strong> — ask us to limit processing of your data.</li>
          <li><strong>Portability</strong> — receive your data in a structured, machine-readable format.</li>
          <li><strong>Objection</strong> — object to processing based on legitimate interests or for direct marketing.</li>
          <li><strong>Withdraw consent</strong> — at any time where processing is based on consent.</li>
        </ul>
        To exercise any of these rights, contact us at{' '}
        <a href="mailto:info@luxuriohome.com" style={linkStyle}>info@luxuriohome.com</a>. We will respond within 30 days.
      </Section>

      <Section title="9. Security">
        We implement appropriate technical and organisational measures to protect your personal data against unauthorised access,
        alteration, disclosure, or destruction. All data transmissions are encrypted using HTTPS/TLS.
      </Section>

      <Section title="10. Cookies">
        We use cookies and similar technologies on our website. For full details, please read our{' '}
        <Link to="/cookies" style={linkStyle}>Cookie Policy</Link>.
      </Section>

      <Section title="11. Changes to This Policy">
        We may update this Privacy Policy from time to time. The date at the top of this page reflects the most recent revision.
        Continued use of our website after changes constitutes acceptance of the updated policy.
      </Section>

      <Section title="12. Contact & Complaints">
        For privacy enquiries, contact us at{' '}
        <a href="mailto:info@luxuriohome.com" style={linkStyle}>info@luxuriohome.com</a> or call{' '}
        <a href="tel:+37061370777" style={linkStyle}>+370 613 70777</a>. If you are unhappy with our response, you have the right
        to lodge a complaint with the State Data Protection Inspectorate of Lithuania (ada.lt).
      </Section>
    </main>
  );
}

const linkStyle: React.CSSProperties = { color: 'var(--gold)', borderBottom: '1px solid var(--gold2)' };
const listStyle: React.CSSProperties = { margin: 'var(--sp-4) 0 0 var(--sp-6)', lineHeight: 2, color: 'var(--fg2)' };

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
