"use client";

import { useEffect, useRef, useState } from "react";

const PHOTO_COUNT = 29;
const photos = Array.from({ length: PHOTO_COUNT }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return { src: `/culture/live-n-loud/${n}.jpg`, alt: `Live n Loud Edition of Sterling Chilling, photo ${i + 1}` };
});

export default function EventStoryRow() {
  const [open, setOpen] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelHeight, setPanelHeight] = useState(0);

  useEffect(() => {
    const el = panelRef.current;
    if (!open || !el) {
      setPanelHeight((current) => (current === 0 ? current : 0));
      return;
    }
    const observer = new ResizeObserver(() => {
      setPanelHeight(el.scrollHeight);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [open]);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(null);
      if (event.key === "ArrowRight") setLightbox((i) => (i === null ? i : (i + 1) % photos.length));
      if (event.key === "ArrowLeft") setLightbox((i) => (i === null ? i : (i - 1 + photos.length) % photos.length));
    };
    window.addEventListener("keydown", onKey);
    document.body.classList.add("scroll-locked");
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("scroll-locked");
    };
  }, [lightbox]);

  return (
    <article className="story-list-item event-story" data-reveal>
      <button type="button" className="event-story-toggle" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="event-story-panel">
        <span className="story-marker" aria-hidden="true">◆</span>
        <span className="story-tag">Sponsorship</span>
        <h3>Inside Sterling Chilling: Live n Loud in Akure.</h3>
        <span className={`event-story-arrow${open ? " is-open" : ""}`}>+</span>
      </button>

      <div
        id="event-story-panel"
        className={`event-story-panel${open ? " is-open" : ""}`}
        style={{ maxHeight: panelHeight }}
        aria-hidden={!open}
        ref={panelRef}
      >
        <div className="event-story-copy">
          <p>
            OOB Records &amp; Swerve Music brought electrifying entertainment to Akure, Ondo State, with the premiere of the
            Live n Loud Edition of Sterling Chilling at OhOhBeeHive. The event gathered music fans and entertainment
            lovers for a night of fine taste, distinguished company, and unforgettable energy.
          </p>
          <p>
            The stage came alive with performances from Easyscope, Kabex, Hvnter, Oria, BEEJAY, and AY Smush. Each
            artist brought their own flavour to the night, keeping the crowd engaged and the atmosphere buzzing. From
            the performances to the audience&apos;s infectious enthusiasm, the energy was unmatched.
          </p>
          <p>
            Gaming also took the spotlight as Kabex and Dante faced off in an exciting FC26 showdown. Kabex emerged
            victorious, claiming the ₦5 million prize and adding another memorable moment to the celebration. With
            music, gaming, and great company sharing the spotlight, Sterling Chilling&apos;s Live n Loud Edition
            delivered a night to remember.
          </p>
        </div>
        <div className="event-story-gallery">
          {photos.map((photo, index) => (
            <button type="button" className="event-story-thumb" key={photo.src} onClick={() => setLightbox(index)}>
              <img src={photo.src} alt={photo.alt} loading="lazy" />
            </button>
          ))}
        </div>
      </div>

      {lightbox !== null && (
        <div className="event-lightbox" role="dialog" aria-modal="true" aria-label="Live n Loud Edition photo viewer">
          <button type="button" className="event-lightbox-close" onClick={() => setLightbox(null)} aria-label="Close photo viewer">✕</button>
          <button type="button" className="event-lightbox-nav event-lightbox-prev" onClick={() => setLightbox((i) => (i === null ? i : (i - 1 + photos.length) % photos.length))} aria-label="Previous photo">←</button>
          <img src={photos[lightbox].src} alt={photos[lightbox].alt} />
          <button type="button" className="event-lightbox-nav event-lightbox-next" onClick={() => setLightbox((i) => (i === null ? i : (i + 1) % photos.length))} aria-label="Next photo">→</button>
          <span className="event-lightbox-count">{String(lightbox + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}</span>
        </div>
      )}
    </article>
  );
}
