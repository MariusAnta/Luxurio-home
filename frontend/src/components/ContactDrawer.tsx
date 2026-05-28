interface ContactDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function ContactDrawer({ open, onClose }: ContactDrawerProps) {
  if (!open) return null;

  return (
    <div className="contact-drawer-backdrop" onClick={onClose}>
      <div className="contact-drawer contact-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">x</button>
        <h2>Client Service</h2>
        <div className="contact-modal-list">
          <a
            href="https://wa.me/37061370777"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-modal-item"
            aria-label="Contact us on WhatsApp"
          >
            <span className="contact-modal-value">WhatsApp</span>
            <span className="contact-modal-label" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5A9.5 9.5 0 0 1 7.2 19.9L3 21l1.1-4.1A9.5 9.5 0 1 1 21 11.5z" />
                <path d="M8.6 9.2c.2-.4.4-.4.6-.4h.5c.2 0 .4 0 .5.4.2.5.6 1.6.7 1.7.1.1.1.3 0 .5-.1.2-.2.3-.3.4-.1.1-.2.2-.3.3-.1.1-.2.2-.1.4.1.2.5.9 1.1 1.4.7.7 1.4.9 1.6 1 .2.1.3.1.5-.1.1-.2.6-.7.8-.9.2-.2.3-.2.5-.1.2.1 1.3.6 1.5.7.2.1.4.2.4.3 0 .1 0 .8-.2 1-.2.2-.9.8-2.2.8-1.3 0-2.4-.6-3.3-1.5-.9-.9-1.7-2.1-1.8-3.5 0-1.3.6-2 1-2.3z" />
              </svg>
            </span>
          </a>
          <a href="mailto:info@luxuriohome.com" className="contact-modal-item" aria-label="Contact us by email">
            <span className="contact-modal-value">Send us an e-mail</span>
            <span className="contact-modal-label" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 7l9 6 9-6" />
              </svg>
            </span>
          </a>
          <a
            href="https://instagram.com/luxuriohome"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-modal-item"
            aria-label="Contact us on Instagram"
          >
            <span className="contact-modal-value">Instagram</span>
            <span className="contact-modal-label" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
                <circle cx="12" cy="12" r="4.5" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </span>
          </a>
        </div>
        <p className="contact-modal-footnote">
          You can contact Client Service via WhatsApp, by e-mail at info@luxuriohome.com,
          or through Instagram at @luxuriohome.
        </p>
      </div>
    </div>
  );
}
