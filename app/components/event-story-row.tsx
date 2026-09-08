"use client";

import { useEffect, useRef, useState } from "react";
import CoverflowGallery from "./coverflow-gallery";

const PHOTO_COUNT = 186;
const LOCATION = "OhOhBeeHive · Akure, Ondo State";
const LABELS = ["On the Red Carpet", "Center Stage", "Crowd Energy", "In the Mix", "Live n Loud", "The Performance", "Backstage Moments"];

const photos = Array.from({ length: PHOTO_COUNT }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return {
    src: `/culture/live-n-loud/${n}.jpg`,
    alt: `Live n Loud Edition of Sterling Chilling, photo ${i + 1}`,
    label: LABELS[i % LABELS.length],
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
        <div className="magazine">
          <p className="magazine-kicker">Event Report · Swerve Music Presents</p>
          <p className="magazine-byline">Akure, Ondo State — OhOhBeeHive</p>

          <p className="magazine-lead">
            <span className="magazine-highlight">OOB Records &amp; Swerve Music</span> brought electrifying entertainment to Akure, Ondo State, with the premiere of the
            Live n Loud Edition of Sterling Chilling at OhOhBeeHive. The event gathered music fans and entertainment
            lovers for a night of fine taste, distinguished company, and unforgettable energy.
          </p>

          <p>
            The stage came alive with performances from <strong className="magazine-artist">Easyscope</strong>,{" "}
            <strong className="magazine-artist">Kabex</strong>, <strong className="magazine-artist">Hvnter</strong>,{" "}
            <strong className="magazine-artist">Oria</strong>, <strong className="magazine-artist">BEEJAY</strong>, and{" "}
            <strong className="magazine-artist">AY Smush</strong>. Each artist brought their own flavour to the night,
            keeping the crowd engaged and the atmosphere buzzing.
          </p>

          <blockquote className="magazine-pullquote">
            &ldquo;From the performances to the audience&apos;s infectious enthusiasm, the energy was unmatched.&rdquo;
          </blockquote>

          <div className="magazine-gallery">
            <CoverflowGallery photos={photos} />
          </div>

          <p>
            Gaming also took the spotlight as Kabex and Dante faced off in an exciting FC26 showdown. Kabex emerged
            victorious, claiming the ₦5 million prize and adding another memorable moment to the celebration. With
            music, gaming, and great company sharing the spotlight, Sterling Chilling&apos;s Live n Loud Edition
            delivered a night to remember.
          </p>

          <p className="magazine-credit">Photography: Swerve Music &amp; OhOhBeeHive · {photos.length} frames from the night</p>
        </div>
      </div>
    </article>
  );
}
