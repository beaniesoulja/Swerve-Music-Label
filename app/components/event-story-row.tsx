"use client";

import { useEffect, useRef, useState } from "react";
import CoverflowGallery from "./coverflow-gallery";

const PHOTO_COUNT = 186;
const LOCATION = "OhOhBeeHive · Akure, Ondo State";

const photos = Array.from({ length: PHOTO_COUNT }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return {
    src: `/culture/live-n-loud/${n}.jpg`,
    alt: `Live n Loud Edition of Sterling Chilling, photo ${i + 1}`,
    label: `Live n Loud · Photo ${i + 1}`,
    location: LOCATION,
  };
});

export default function EventStoryRow() {
  const [open, setOpen] = useState(false);
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

  return (
    <article className="story-list-item event-story" data-reveal>
      <button type="button" className="event-story-toggle" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="event-story-panel">
        <span className="story-marker" aria-hidden="true">01</span>
        <span className="story-tag">Photo archive</span>
        <h3>Sterling Chilling · Live n Loud</h3>
        <span className={`event-story-arrow${open ? " is-open" : ""}`}>+</span>
      </button>

      <div
        id="event-story-panel"
        className={`event-story-panel${open ? " is-open" : ""}`}
        style={{ maxHeight: panelHeight }}
        aria-hidden={!open}
        inert={!open}
        ref={panelRef}
      >
        <div className="magazine">
          <p className="magazine-kicker">Live n Loud · Photo archive</p>
          <p className="magazine-byline">Akure, Ondo State · OhOhBeeHive</p>

          <div className="magazine-gallery">
            <CoverflowGallery photos={photos} />
          </div>

          <p className="magazine-credit">{photos.length} photographs in this archive</p>
        </div>
      </div>
    </article>
  );
}
