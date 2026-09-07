"use client";

import { useEffect, useState } from "react";

const slides = [
  { src: "/artist/beanie-soulja/primary-studio.jpg", alt: "Beanie Soulja in a dark studio portrait", label: "Official portrait", note: "Press / artist profile" },
  { src: "/artist/beanie-soulja/studio-full-body.jpg", alt: "Beanie Soulja in a dark full-body studio portrait", label: "Studio series", note: "Campaign / booking" },
  { src: "/artist/beanie-soulja/orange-portrait.jpg", alt: "Beanie Soulja in an orange campaign portrait", label: "Campaign color", note: "Release moments" },
  { src: "/artist/beanie-soulja/black-white-portrait.jpg", alt: "Black-and-white portrait of Beanie Soulja", label: "Monochrome", note: "Editorial / press" },
  { src: "/artist/beanie-soulja/interview-microphone.jpg", alt: "Beanie Soulja speaking into a microphone", label: "In conversation", note: "Interview / live" },
  { src: "/artist/beanie-soulja/culture-event.jpg", alt: "Beanie Soulja at a cultural event", label: "In the room", note: "Culture / community" },
  { src: "/artist/beanie-soulja/travel-pyramid.jpg", alt: "Beanie Soulja visiting the pyramids in Egypt", label: "Across borders", note: "World culture" },
];

export default function ArtistPhotoSlider() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, []);

  const move = (direction: number) => setActive((current) => (current + direction + slides.length) % slides.length);

  return (
    <div className="artist-slider" aria-roledescription="carousel" aria-label="Beanie Soulja official artist photography">
      <div className="artist-slide-frame">
        {slides.map((slide, index) => (
          <figure className={`artist-slide ${index === active ? "is-active" : ""}`} key={slide.src} aria-hidden={index !== active}>
            <img src={slide.src} alt={index === active ? slide.alt : ""} />
            <figcaption><strong>{slide.label}</strong><span>{slide.note}</span></figcaption>
          </figure>
        ))}
        <span className="artist-endorsement">BEANIE SOULJA · A SWERVE MUSIC ARTIST</span>
        <div className="slider-controls">
          <button type="button" onClick={() => move(-1)} aria-label="Show previous Beanie Soulja image">←</button>
          <span>{String(active + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span>
          <button type="button" onClick={() => move(1)} aria-label="Show next Beanie Soulja image">→</button>
        </div>
      </div>
      <div className="slider-dots" aria-label="Choose artist image">
        {slides.map((slide, index) => (
          <button type="button" className={index === active ? "is-active" : ""} onClick={() => setActive(index)} aria-label={`Show ${slide.label} image`} aria-current={index === active ? "true" : undefined} key={slide.src} />
        ))}
      </div>
    </div>
  );
}
