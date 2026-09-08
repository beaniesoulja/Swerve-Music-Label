"use client";

import { useCoverflow } from "./use-coverflow";

export type CoverflowPhoto = {
  src: string;
  alt: string;
  label: string;
  location: string;
};

export default function CoverflowGallery({ photos }: { photos: CoverflowPhoto[] }) {
  const { active, goTo, next, prev, stageHandlers, cardStyle } = useCoverflow(photos.length);
  const showDots = photos.length <= 12;
  const current = photos[active];

  return (
    <div className="coverflow" aria-roledescription="carousel" aria-label="Live n Loud Edition photo carousel">
      <div className="coverflow-topline">
        <span>FRAME {String(active + 1).padStart(2, "0")}</span>
        <span>{String(active + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}</span>
      </div>

      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- custom carousel widget follows the ARIA carousel pattern (focusable region + arrow-key navigation) */}
      <div className="coverflow-stage" tabIndex={0} {...stageHandlers}>
        {photos.map((photo, index) => {
          const style = cardStyle(index);
          if (!style) return null;
          const offset = index - active;
          return (
            <button
              type="button"
              key={photo.src}
              className={`coverflow-card${offset === 0 ? " is-active" : ""}`}
              style={style}
              onClick={() => (offset === 0 ? undefined : goTo(index))}
              tabIndex={-1}
              aria-hidden={offset !== 0}
              aria-current={offset === 0}
            >
              <img src={photo.src} alt={photo.alt} loading="lazy" draggable={false} />
            </button>
          );
        })}
      </div>

      <div className="coverflow-caption">
        <strong>{current.label}</strong>
        <span>{current.location}</span>
      </div>

      <div className="coverflow-controls">
        <button type="button" onClick={prev} aria-label="Previous photo">←</button>
        {showDots ? (
          <div className="coverflow-dots">
            {photos.map((photo, index) => (
              <button
                type="button"
                key={photo.src}
                className={index === active ? "is-active" : ""}
                aria-label={`Go to photo ${index + 1}`}
                onClick={() => goTo(index)}
              />
            ))}
          </div>
        ) : (
          <div className="coverflow-progress">
            <div style={{ width: `${((active + 1) / photos.length) * 100}%` }} />
          </div>
        )}
        <button type="button" onClick={next} aria-label="Next photo">→</button>
      </div>
    </div>
  );
}
