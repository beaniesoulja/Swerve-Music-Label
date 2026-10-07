import NewsletterSignup from "./components/newsletter-signup";
import ArtistPhotoSlider from "./components/artist-photo-slider";
import IosMusicPlayer from "./components/ios-music-player";
import ScrollReveal from "./components/scroll-reveal";
import HeaderScrollWatcher from "./components/header-scroll-watcher";
import TiltCard from "./components/tilt-card";
import MarqueeTicker from "./components/marquee-ticker";
import MobileNav from "./components/mobile-nav";
import EventStoryRow from "./components/event-story-row";
import CatalogueCoverflow from "./components/catalogue-coverflow";
import { approvedPolicyUrl, contactEmail, siteUrl, socialLinks } from "./site-config";
import { newsletterReady } from "./lib/newsletter-config";

const appleArtist = "https://music.apple.com/us/artist/beanie-soulja/1547405349";
const spotifyArtist = "https://open.spotify.com/artist/5kHeG9h2dDcpwthkGOBQ5D?si=_81GgrGIRrawneV3YdnKyw";
export const dynamic = "force-dynamic";

const focusAreas = [
  ["01", "Music", "Release strategy, artist storytelling and songs built to travel."],
  ["02", "Live", "Showcases, festival placements and booking support for independent talent."],
  ["03", "Culture", "Afrobeats at the center, open to art, dance, fashion and global exchange."],
];

const catalogue = [
  {
    title: "TKL",
    credit: "Beanie Soulja",
    year: "Latest",
    duration: "2:08",
    cover: "/covers/tkl.jpg",
    audio: "/audio/tkl-preview.mp3",
    apple: appleArtist,
  },
  {
    title: "THE MOTTO",
    credit: "Beanie Soulja",
    year: "2025",
    duration: "3:26",
    cover: "/covers/the-motto.jpg",
    audio: "/audio/the-motto-preview.mp3",
    apple: "https://music.apple.com/us/album/the-motto-single/1797075090",
  },
  {
    title: "Capsize",
    credit: "Beanie Soulja feat. Beckyhits & Simple Kay",
    year: "2024",
    duration: "2:27",
    cover: "/covers/capsize.jpg",
    audio: "/audio/capsize-preview.mp3",
    apple: "https://music.apple.com/us/album/capsize-feat-beckyhits-simple-kay-single/1779838076",
  },
  {
    title: "Burst Down",
    credit: "Beanie Soulja feat. David Meli",
    year: "2024",
    duration: "3:03",
    cover: "/covers/burst-down.jpg",
    audio: "/audio/burst-down-preview-v3.mp3",
    apple: "https://music.apple.com/us/album/burst-down-feat-david-meli-single/1759177422",
  },
  {
    title: "FOWOSERE",
    credit: "Dapson Ahmir + Beanie Soulja",
    year: "2024",
    duration: "2:30",
    cover: "/covers/fowosere.jpg",
    audio: "/audio/fowosere-preview.mp3",
    apple: appleArtist,
  },
  {
    title: "PSYCHO",
    credit: "Beanie Soulja",
    year: "2024",
    duration: "3:02",
    cover: "/covers/psycho.jpg",
    audio: "/audio/psycho-preview.mp3",
    apple: "https://music.apple.com/us/album/psycho-single/1745161367",
  },
  {
    title: "NSG",
    credit: "Beanie Soulja feat. ODUMODUBLVCK",
    year: "2023",
    duration: "2:00",
    cover: "/covers/nsg.jpg",
    audio: "/audio/nsg-preview.mp3",
    apple: "https://music.apple.com/us/album/nsg-feat-odumodublvck-single/1716482811",
  },
];

export default function Home() {
  const contacts = [
    { kind: "artists" as const, label: "Artists", action: "Submit your music" },
    { kind: "bookings" as const, label: "Bookings", action: "Book Beanie Soulja" },
    { kind: "culture" as const, label: "Culture", action: "Pitch a collaboration" },
  ];
  const privacy = approvedPolicyUrl("privacy");
  const terms = approvedPolicyUrl("terms");
  const canonical = siteUrl();
  return (
    <main id="main-content">
      <a className="skip-link" href="#top">Skip to content</a>
      {canonical && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@graph": [
          { "@type": "Organization", name: "Swerve Music", url: canonical.href, logo: new URL("/favicon-192.png", canonical).href },
          { "@type": "Person", name: "Beanie Soulja", jobTitle: "Musician", sameAs: [appleArtist, spotifyArtist] },
        ],
      }).replace(/</g, "\\u003c") }} />}
      <ScrollReveal />
      <HeaderScrollWatcher />

      <header className="site-header">
        <a className="brand" href="#top" aria-label="Swerve Music home">
          <img src="/swerve-music-lockup-purple.png" alt="Swerve Music" />
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#artists"><span>Artist</span></a>
          <a href="#music"><span>Music</span></a>
          <a href="#culture"><span>Culture</span></a>
          <a href="#live"><span>Live</span></a>
          <a href="#newsletter"><span>Newsletter</span></a>
        </nav>
        <a className="header-cta" href="#contact">Work with us <span>↗</span></a>
        <MobileNav />
      </header>

      <section className="hero" id="top">
        <div className="hero-copy" data-reveal>
          <p className="eyebrow">Independent artist label · Lagos, Nigeria</p>
          <h1>We move<br />music <em>forward.</em></h1>
          <p className="hero-deck">Swerve Music promotes art, music and culture. Rooted in Afrobeats, built with independent artists and open to the world.</p>
          <div className="hero-actions">
            <a className="button button-dark" href="#music">Hear Beanie Soulja <span>↗</span></a>
            <a className="text-link" href="#contact">Submit your music <span>→</span></a>
          </div>
        </div>
        <div className="hero-visual" aria-label="Abstract record and sound-wave artwork">
          <TiltCard className="record" strength={7}>
            <div className="record-line line-one" />
            <div className="record-line line-two" />
            <img src="/swerve-music-mark-pale.png" alt="" />
          </TiltCard>
          <div className="wave" />
          <span className="hero-note">ART · MUSIC · CULTURE</span>
        </div>
      </section>

      <MarqueeTicker />

      <section className="manifesto">
        <p data-reveal>Rooted here. Heard everywhere.</p>
        <span data-reveal>We build the bridge between independent artistry and the audiences ready to move with it.</span>
      </section>

      <section className="focus-grid" aria-label="What Swerve Music does">
        {focusAreas.map(([number, title, copy], index) => (
          <article key={number} data-reveal style={{ transitionDelay: `${index * 90}ms` }}>
            <span>{number}</span>
            <h2>{title}</h2>
            <p>{copy}</p>
          </article>
        ))}
      </section>

      <section className="section artists-section" id="artists">
        <div className="section-heading artist-heading" data-reveal>
          <div>
            <p className="eyebrow">Current roster · A Swerve Music artist</p>
            <h2>Beanie<br /><em>Soulja.</em></h2>
          </div>
          <div className="artist-platforms" aria-label="Beanie Soulja streaming profiles">
            <a className="button button-dark" href={appleArtist} target="_blank" rel="noreferrer">Apple Music <span>↗</span></a>
            <a className="button button-outline" href={spotifyArtist} target="_blank" rel="noreferrer">Spotify <span>↗</span></a>
          </div>
        </div>
        <div className="artist-feature" data-reveal>
          <ArtistPhotoSlider />
          <div className="artist-bio">
            <p className="eyebrow">Afro-Beat · Nigeria</p>
            <h3>A voice shaped by rhythm, memory and movement.</h3>
            <p>Beanie Soulja grew up around the music of Fela Kuti, Bob Marley and Lucky Dube before developing his voice in church choir. His catalogue carries that foundation into a contemporary Afrobeats sound made for real stories, live rooms and listeners across borders.</p>
            <dl>
              <div><dt>Lead release</dt><dd>TKL</dd></div>
              <div><dt>Catalogue</dt><dd>7 tracks</dd></div>
              <div><dt>Available for</dt><dd>Shows · press · partnerships</dd></div>
            </dl>
          </div>
        </div>
      </section>

      <section className="latest-release" id="music">
        <div className="release-art release-cover-art" data-reveal>
          <TiltCard className="featured-cover-tilt" strength={5}>
            <img className="featured-cover" src="/covers/tkl.jpg" alt="TKL by Beanie Soulja cover artwork" />
          </TiltCard>
          <span className="release-stamp">LATEST<br />RELEASE</span>
        </div>
        <div className="release-copy" data-reveal>
          <p className="eyebrow">Lead catalogue release</p>
          <h2>TKL</h2>
          <h3>Beanie Soulja</h3>
          <p>Start with TKL, then move through the Swerve Music catalogue from newest to older releases below.</p>
          <div className="featured-audio">
            <IosMusicPlayer
              src="/audio/tkl-preview.mp3"
              title="TKL"
              artist="Beanie Soulja"
              cover="/covers/tkl.jpg"
              variant="featured"
            />
          </div>
          <div className="stream-actions">
            <a className="button button-light" href={appleArtist} target="_blank" rel="noreferrer">Apple Music profile <span>↗</span></a>
            <a className="text-link" href={spotifyArtist} target="_blank" rel="noreferrer">Spotify profile <span>↗</span></a>
          </div>
        </div>
      </section>

      <section className="section catalogue-section" aria-labelledby="catalogue-title">
        <div className="section-heading" data-reveal>
          <div>
            <p className="eyebrow">Listen now</p>
            <h2 id="catalogue-title">Beanie Soulja<br /><em>catalogue.</em></h2>
          </div>
          <p className="section-intro">Listen to seven 30-second previews. Find more on Beanie Soulja&apos;s official streaming profiles.</p>
        </div>
        <div data-reveal>
          <CatalogueCoverflow tracks={catalogue} spotifyArtist={spotifyArtist} />
        </div>
      </section>

      <section className="section culture-section" id="culture">
        <div className="section-heading" data-reveal>
          <div>
            <p className="eyebrow">Beyond the release</p>
            <h2>Culture is the context.</h2>
          </div>
          <p className="section-intro">Stories about the people, places and ideas shaping the sound, not just the moment around it.</p>
        </div>
        <div className="story-list">
          <EventStoryRow />
        </div>
      </section>

      <section className="live-section" id="live">
        <div className="live-copy" data-reveal>
          <p className="eyebrow">Swerve live</p>
          <h2>Put the<br />music in<br /><em>the room.</em></h2>
          <p>Book Beanie Soulja, partner on a showcase, or bring an Afrobeats-rooted sound to your festival and cultural programme.</p>
          <a className="button button-purple" href="#contact">Booking enquiry <span>↗</span></a>
        </div>
        <div className="show-card" data-reveal>
          <span className="show-kicker">Current roster · bookings open</span>
          <strong>BEANIE<br />SOULJA<br />LIVE</strong>
          <div><span>LAGOS · NIGERIA</span><span>WORLDWIDE ENQUIRIES</span></div>
          <p>For promoters, festivals, venues, cultural partners and curated independent-artist showcases.</p>
        </div>
      </section>

      <section className="newsletter-section" id="newsletter">
        <div className="newsletter-copy" data-reveal>
          <p className="eyebrow">Straight from the source</p>
          <h2>New music.<br />Artist stories.<br /><em>First access.</em></h2>
          <p>Join the Swerve list for thoughtful updates on Beanie Soulja, Afrobeats, cultural stories and the shows putting new music in the room.</p>
        </div>
        <div className="newsletter-panel" data-reveal>
          <span className="newsletter-number">01 / NEWSLETTER</span>
          <NewsletterSignup available={newsletterReady()} privacyUrl={privacy} />
          <p className="newsletter-note">No noise. Just releases, stories, opportunities and live moments worth knowing.</p>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <p className="eyebrow" data-reveal>Join the movement</p>
        <h2 data-reveal>Have music, a stage<br />or a story to share?</h2>
        <div className="contact-links" data-reveal>
          {contacts.map(({ kind, label, action }) => {
            const email = contactEmail(kind);
            return email ? <a href={`mailto:${email}`} key={kind}><span>{label}</span> {action} <i>↗</i></a> :
              <div className="contact-unavailable" key={kind}><span>{label}</span><strong>{action}</strong><small>Email enquiries are temporarily unavailable.</small></div>;
          })}
        </div>
      </section>

      <footer>
        <img src="/swerve-music-lockup-pale.png" alt="Swerve Music" />
        <p>Afrobeats-rooted. Independent-artist focused. Open to the world.</p>
        <div><a href={appleArtist} target="_blank" rel="noreferrer">Apple Music</a><a href={spotifyArtist} target="_blank" rel="noreferrer">Spotify</a>{socialLinks().map(({ label, href }) => <a href={href} key={label} target="_blank" rel="noreferrer">{label}</a>)}{privacy && <a href={privacy}>Privacy</a>}{terms && <a href={terms}>Terms</a>}<span>© {new Date().getFullYear()} Swerve Music</span></div>
      </footer>
    </main>
  );
}
