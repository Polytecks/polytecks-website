/* global React */
const { Fragment } = React;

// Hex logo mark — matches site visual DNA without copying logo asset.
window.PolyMark = function PolyMark({ size = 28 }) {
  return (
    <svg className="poly-mark" width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <polygon points="16,2 28,9 28,23 16,30 4,23 4,9" stroke="#a8b0f3" strokeWidth="1.5" fill="rgba(74,84,192,0.12)" />
      <polygon points="16,9 22,12.5 22,19.5 16,23 10,19.5 10,12.5" stroke="#6a74dc" strokeWidth="1" fill="none" />
    </svg>
  );
};

window.TopNav = function TopNav() {
  return (
    <header className="topnav">
      <div className="topnav-inner">
        <a href="#" className="topnav-logo">
          <PolyMark />
          <span className="topnav-logo-text">Poly<em>tecks</em></span>
        </a>
        <ul className="topnav-links">
          <li><a className="topnav-link" href="#">About Us</a></li>
          <li><a className="topnav-link" href="#">Technology</a></li>
          <li><a className="topnav-link" href="#">Devices</a></li>
          <li><a className="topnav-link active" href="#">Press</a></li>
          <li><a className="topnav-link" href="#">Careers</a></li>
          <li><a className="topnav-link" href="#">Contact</a></li>
        </ul>
      </div>
    </header>
  );
};

window.Footer = function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <a href="#" className="topnav-logo" style={{ alignSelf: "flex-start" }}>
          <PolyMark size={24} />
          <span className="topnav-logo-text">Poly<em>tecks</em></span>
        </a>
        <div>
          <h4 className="footer-col-label">Explore</h4>
          <ul className="footer-links">
            <li><a className="footer-link" href="#">Technology</a></li>
            <li><a className="footer-link" href="#">Devices</a></li>
            <li><a className="footer-link" href="#">Press</a></li>
          </ul>
        </div>
        <div>
          <h4 className="footer-col-label">Company</h4>
          <ul className="footer-links">
            <li><a className="footer-link" href="#">About Us</a></li>
            <li><a className="footer-link" href="#">Team</a></li>
            <li><a className="footer-link" href="#">Careers</a></li>
          </ul>
        </div>
        <div>
          <h4 className="footer-col-label">Connect</h4>
          <ul className="footer-links">
            <li><a className="footer-link" href="#">Contact</a></li>
            <li><a className="footer-link" href="#">LinkedIn</a></li>
            <li><a className="footer-link" href="#">Email</a></li>
            <li><a className="footer-link" href="#">X</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Polytecks Ltd · Cambridge, UK</span>
        <div className="footer-legal">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </div>
      </div>
    </footer>
  );
};

window.PressContact = function PressContact() {
  return (
    <section className="press-contact">
      <div className="press-contact-inner">
        <div className="press-contact-eyebrow">
          <span className="section-eyebrow">Press Enquiries</span>
        </div>
        <div className="press-contact-grid">
          <div>
            <h3>Working on a story? <em>Get in touch.</em></h3>
          </div>
          <div className="press-contact-actions">
            <a className="contact-email" href="mailto:contact@polytecks.com">contact@polytecks.com</a>
          </div>
        </div>
      </div>
    </section>
  );
};

// Featured carousel — used by ALL three prototypes per user direction.
// Realistic placeholder imagery via diagonal-stripe panels with monospace labels.
window.FeaturedCarousel = function FeaturedCarousel({ items, theme }) {
  const [idx, setIdx] = React.useState(0);
  const featured = items.filter(i => i.featured);
  const visible = 2; // show 2 at a time on desktop
  const max = Math.max(0, featured.length - visible);
  const clamp = (n) => Math.max(0, Math.min(max, n));

  const isLight = theme === "light";

  return (
    <div className={`fc ${isLight ? "fc-light" : ""}`}>
      <div className="fc-eyebrow-wrap">
        <span className="section-eyebrow">Featured</span>
      </div>
      <div className="fc-head">
        <div className="fc-nav" style={{ marginLeft: "auto" }}>
          <button
            className="fc-btn"
            aria-label="Previous"
            onClick={() => setIdx(i => clamp(i - 1))}
            disabled={idx === 0}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2 L4 7 L9 12" stroke="currentColor" strokeWidth="1.5" fill="none" /></svg>
          </button>
          <button
            className="fc-btn"
            aria-label="Next"
            onClick={() => setIdx(i => clamp(i + 1))}
            disabled={idx >= max}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2 L10 7 L5 12" stroke="currentColor" strokeWidth="1.5" fill="none" /></svg>
          </button>
        </div>
      </div>
      <div className="fc-viewport">
        <div className="fc-track" style={{ transform: `translateX(calc(-${idx} * (50% + 12px)))` }}>
          {featured.map((item) => (
            <a key={item.id} className="fc-card" href={item.href}>
              <div className="img-ph fc-img" data-label={`IMAGE · ${item.outlet.toUpperCase()}`} />
              <div className="fc-meta">
                <span className="fc-outlet">{item.outlet}</span>
                <span className="fc-dot">·</span>
                <span className="fc-date">{item.date}</span>
                {item.fabricated ? <span className="fc-fab">FABRICATED</span> : null}
              </div>
              <h3 className="fc-title">{item.title}</h3>
              <span className="fc-read">Read article <span className="fc-arrow">→</span></span>
            </a>
          ))}
        </div>
      </div>
      <div className="fc-progress">
        {featured.map((_, i) => (
          <span key={i} className={`fc-tick ${i >= idx && i < idx + visible ? "on" : ""}`} />
        ))}
      </div>
    </div>
  );
};
