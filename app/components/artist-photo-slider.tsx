"use client";

import { useEffect, useState } from "react";

const slides = [
  { src: "/artist/beanie-soulja/primary-studio.jpg", width: 1400, height: 1400, alt: "Beanie Soulja in a dark studio portrait", label: "Official portrait", note: "Press / artist profile" },
  { src: "/artist/beanie-soulja/studio-full-body.jpg", width: 1120, height: 1400, alt: "Beanie Soulja in a dark full-body studio portrait", label: "Studio series", note: "Campaign / booking" },
  { src: "/artist/beanie-soulja/culture-event.jpg", width: 1400, height: 933, alt: "Beanie Soulja at a cultural event", label: "In the room", note: "Culture / community" },
  { src: "/artist/beanie-soulja/travel-pyramid.jpg", width: 1397, height: 1400, alt: "Beanie Soulja visiting the pyramids in Egypt", label: "Across borders", note: "World culture" },
];

export default function ArtistPhotoSlider() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(true);
  const [interacting, setInteracting] = useState(false);

  useEffect(() => {
    if (paused || interacting) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionChange = () => { if (motion.matches) setPaused(true); };
    const timer = window.setInterval(() => {
      if (!document.hidden && !motion.matches) setActive((current) => (current + 1) % slides.length);
    }, 6500);
    motion.addEventListener("change", onMotionChange);
    return () => { window.clearInterval(timer); motion.removeEventListener("change", onMotionChange); };
  }, [paused, interacting]);

  const select = (index: number) => { setPaused(true); setActive(index); };
  const move = (direction: number) => select((active + direction + slides.length) % slides.length);
  const slide = slides[active];

  return (
    <div className="artist-slider" role="region" aria-roledescription="carousel" aria-label="Beanie Soulja official artist photography"
      onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setInteracting(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false); }}>
      <div className="artist-slide-frame">
          <figure className="artist-slide is-active" key={slide.src}>
            <picture>
              <source type="image/webp" srcSet={[480, 900, 1200].filter((width, index, widths) => index === 0 || widths[index - 1] < slide.width).map((width) => `${slide.src.replace(".jpg", `-${width}.webp`)} ${Math.min(width, slide.width)}w`).join(", ")} sizes="(max-width: 1000px) 90vw, 48vw" />
              <img src={slide.src} alt={slide.alt} loading="lazy" decoding="async" width={slide.width} height={slide.height} style={{ objectPosition: active === 1 ? "center 32%" : "center 38%" }} />
            </picture>
            <figcaption><strong>{slide.label}</strong><span>{slide.note}</span></figcaption>
          </figure>
        <span className="artist-endorsement">BEANIE SOULJA · A SWERVE MUSIC ARTIST</span>
        <div className="slider-controls">
          <button type="button" onClick={() => move(-1)} aria-label="Show previous Beanie Soulja image">←</button>
          <span aria-live={paused ? "polite" : "off"}>{String(active + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span>
          <button type="button" onClick={() => move(1)} aria-label="Show next Beanie Soulja image">→</button>
        </div>
      </div>
      <div className="slider-dots" aria-label="Choose artist image">
        {slides.map((slide, index) => (
          <button type="button" className={index === active ? "is-active" : ""} onClick={() => select(index)} aria-label={`Show ${slide.label} image`} aria-current={index === active ? "true" : undefined} key={slide.src} />
        ))}
      </div>
      <button type="button" className="slideshow-toggle" onClick={() => setPaused((value) => !value)} aria-pressed={!paused}>
        {paused ? "Play slideshow" : "Pause slideshow"}
      </button>
    </div>
  );
}
