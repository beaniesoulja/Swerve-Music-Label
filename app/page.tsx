import NewsletterSignup from "./components/newsletter-signup";
import ArtistPhotoSlider from "./components/artist-photo-slider";
import MobileNav from "./components/mobile-nav";
import EventStoryRow from "./components/event-story-row";
import CatalogueCoverflow from "./components/catalogue-coverflow";
import { approvedPolicyUrl, contactEmail, siteUrl, socialLinks } from "./site-config";
import { newsletterReady } from "./lib/newsletter-config";
import { appleArtist, spotifyArtist, catalogue } from "./catalogue";
import "./redesign.css";

export const dynamic = "force-dynamic";

export default function Home() {
  const contacts = [
    { kind: "artists" as const, label: "Artists", action: "Submit your music" },
    { kind: "bookings" as const, label: "Bookings", action: "Book Beanie Soulja" },
    { kind: "culture" as const, label: "Culture", action: "Pitch a collaboration" },
  ];
  const privacy = approvedPolicyUrl("privacy");
  const terms = approvedPolicyUrl("terms");
  const canonical = siteUrl();
  const bookingsAvailable = Boolean(contactEmail("bookings"));
  const enquiryEmail = contactEmail("artists");
  return (
    <main id="main-content" className="minimal-home">
      <a className="skip-link" href="#music">Skip to music</a>
      {canonical && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@graph": [
          { "@type": "Organization", name: "Swerve Music", url: canonical.href, logo: new URL("/favicon-192.png", canonical).href },
          { "@type": "Person", name: "Beanie Soulja", jobTitle: "Musician", sameAs: [appleArtist, spotifyArtist] },
        ],
      }).replace(/</g, "\\u003c") }} />}
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Swerve Music home"><img src="/swerve-music-lockup-purple.png" alt="Swerve Music" width={222} height={55} /></a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#music">Music</a><a href="#artists">Artist</a><a href="#culture">Culture</a><a href="#live">Live</a>
        </nav>
        <a className="header-cta" href="#contact">Contact</a>
        <MobileNav />
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Swerve Music · Independent artist label</p>
          <h1>Art.<br />Music.<br /><em>Culture.</em></h1>
          <p className="hero-deck">Swerve Music promotes art, music and culture. Rooted in Afrobeats, built with independent artists and open to the world.</p>
          <div className="hero-actions"><a className="button button-dark" href="#music">Hear Beanie Soulja</a><a className="text-link" href="#artists">Meet the artist</a></div>
        </div>
        <a className="hero-feature" href="#music" aria-label="Explore TKL and selected releases">
          <img src="/covers/tkl.jpg" alt="TKL cover artwork" width={600} height={600} fetchPriority="high" />
          <span className="hero-feature-caption"><span><small>Featured release · 2026</small><strong>TKL</strong><span>Beanie Soulja feat. Easyscope</span></span></span>
        </a>
      </section>

      <section className="section catalogue-section" id="music" aria-labelledby="catalogue-title" tabIndex={-1}>
        <div className="section-heading">
          <div><p className="eyebrow">01 / Music</p><h2 id="catalogue-title">Selected releases.</h2></div>
          <p className="section-intro">Seven 30-second previews.<br />Explore more on the artist&apos;s streaming profiles.</p>
        </div>
        <CatalogueCoverflow tracks={catalogue} />
      </section>

      <section className="section artists-section" id="artists">
        <div className="section-heading"><div><p className="eyebrow">02 / The artist</p><h2>Beanie Soulja.</h2></div><a className="text-link" href={appleArtist} target="_blank" rel="noreferrer">Artist profile</a></div>
        <div className="artist-feature">
          <ArtistPhotoSlider />
          <div className="artist-bio">
            <p className="eyebrow">A Swerve Music artist</p>
            <h3>Beanie Soulja</h3>
            <p>Selected releases include TKL featuring Easyscope, THE MOTTO, Capsize featuring Beckyhits &amp; Simple Kay, and Burst Down featuring David Meli.</p>
            <dl>
              <div><dt>Featured</dt><dd>TKL · 2026</dd></div>
              <div><dt>On this site</dt><dd>7 selected previews</dd></div>
              <div><dt>Explore</dt><dd>Music · artist photography · live archive</dd></div>
            </dl>
            <div className="artist-platforms" aria-label="Beanie Soulja streaming profiles"><a className="text-link" href={appleArtist} target="_blank" rel="noreferrer">Apple Music</a><a className="text-link" href={spotifyArtist} target="_blank" rel="noreferrer">Spotify</a></div>
          </div>
        </div>
      </section>

      <section className="section culture-section" id="culture">
        <div className="section-heading"><div><p className="eyebrow">03 / Culture</p><h2>Live n Loud.</h2></div><p className="section-intro">The event photo archive.</p></div>
        <div className="story-list"><EventStoryRow /></div>
      </section>

      <section className="live-section" id="live">
        <div className="live-copy"><p className="eyebrow">04 / Swerve live</p><h2>Put the music<br />in the room.</h2><p>For promoters, festivals, venues, cultural partners and curated independent-artist showcases.</p></div>
        <div className="live-enquiry"><h3>Beanie Soulja</h3><p>{bookingsAvailable ? "Shows · press · partnerships" : "Booking enquiries are temporarily unavailable."}</p><a className="text-link" href="#contact">{bookingsAvailable ? "Booking enquiry" : "Contact information"}</a></div>
      </section>

      <section className="newsletter-section" id="newsletter">
        <div className="newsletter-copy"><p className="eyebrow">Stay connected</p><h2>New music.<br />Artist stories.</h2></div>
        <div className="newsletter-panel"><NewsletterSignup available={newsletterReady()} privacyUrl={privacy} /></div>
      </section>

      <section className="contact-section" id="contact">
        <p className="eyebrow">Contact</p><h2>Have music, a stage<br />or a story to share?</h2>
        {enquiryEmail && <p className="contact-email"><a href={`mailto:${enquiryEmail}`}>Contact us</a></p>}
        <div className="contact-links">
          {contacts.map(({ kind, label, action }) => {
            const email = contactEmail(kind);
            return email ? <a href={`mailto:${email}`} key={kind}><span>{label}</span> {action}</a> :
              <div className="contact-unavailable" key={kind}><span>{label}</span><strong>{action}</strong><small>Email enquiries are temporarily unavailable.</small></div>;
          })}
        </div>
      </section>

      <footer>
        <div className="footer-brand"><img src="/swerve-music-lockup-purple.png" alt="Swerve Music" width={222} height={55} /><p>Art. Music. Culture.</p></div>
        <div className="footer-links"><div className="footer-link-group">{socialLinks().map(({ label, href }) => <a href={href} key={label} target="_blank" rel="noreferrer">{label}</a>)}{enquiryEmail && <a href={`mailto:${enquiryEmail}`}>Contact us</a>}{privacy && <a href={privacy}>Privacy</a>}{terms && <a href={terms}>Terms</a>}</div><span>© {new Date().getFullYear()} Swerve Music</span></div>
      </footer>
    </main>
  );
}
