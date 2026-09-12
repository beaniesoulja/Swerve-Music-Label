"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from "react";
import { useCoverflow } from "./use-coverflow";

export type CoverflowPhoto = {
  src: string;
  alt: string;
  label: string;
  location: string;
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 1.6;

export default function CoverflowGallery({ photos }: { photos: CoverflowPhoto[] }) {
  const { active, goTo, next, prev, stageHandlers, cardStyle } = useCoverflow(photos.length);
  const showDots = photos.length <= 12;
  const current = photos[active];

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panDrag = useRef<{ startX: number; startY: number; originX: number; originY: number; pointerId: number | null }>({
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    pointerId: null,
  });

  const [resetKey, setResetKey] = useState({ active, lightboxOpen });
  if (resetKey.active !== active || resetKey.lightboxOpen !== lightboxOpen) {
    setResetKey({ active, lightboxOpen });
    setZoom(MIN_ZOOM);
    setPan({ x: 0, y: 0 });
  }

  useEffect(() => {
    if (!lightboxOpen) return;
    document.body.classList.add("scroll-locked");
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxOpen(false);
      else if (event.key === "ArrowRight") next();
      else if (event.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("scroll-locked");
      window.removeEventListener("keydown", onKey);
    };
  }, [lightboxOpen, next, prev]);

  const toggleZoom = () => {
    if (zoom > MIN_ZOOM) {
      setZoom(MIN_ZOOM);
      setPan({ x: 0, y: 0 });
    } else {
      setZoom(ZOOM_STEP);
    }
  };

  const onWheelZoom = (event: ReactWheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    setZoom((current) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, current - event.deltaY * 0.0025)));
  };

  const onPanPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (zoom <= MIN_ZOOM) return;
    panDrag.current = { startX: event.clientX, startY: event.clientY, originX: pan.x, originY: pan.y, pointerId: event.pointerId };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPanPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (panDrag.current.pointerId === null) return;
    const dx = event.clientX - panDrag.current.startX;
    const dy = event.clientY - panDrag.current.startY;
    setPan({ x: panDrag.current.originX + dx, y: panDrag.current.originY + dy });
  };

  const endPan = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (panDrag.current.pointerId === null) return;
    try {
      event.currentTarget.releasePointerCapture(panDrag.current.pointerId);
    } catch {
      // pointer already released
    }
    panDrag.current.pointerId = null;
  };

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
              onClick={() => (offset === 0 ? setLightboxOpen(true) : goTo(index))}
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

      {lightboxOpen && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${current.label} photo viewer`}>
          <button type="button" className="lightbox-close" onClick={() => setLightboxOpen(false)} aria-label="Close photo viewer">✕</button>
          <button type="button" className="lightbox-nav lightbox-prev" onClick={prev} aria-label="Previous photo">←</button>

          <div
            className="lightbox-frame"
            onWheel={onWheelZoom}
            onPointerDown={onPanPointerDown}
            onPointerMove={onPanPointerMove}
            onPointerUp={endPan}
            onPointerCancel={endPan}
          >
            <button
              type="button"
              className="lightbox-image-toggle"
              onClick={toggleZoom}
              aria-label={zoom > MIN_ZOOM ? "Reset zoom" : "Zoom in"}
            >
              <img
                src={current.src}
                alt={current.alt}
                draggable={false}
                className={zoom > MIN_ZOOM ? "is-zoomed" : ""}
                style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
              />
            </button>
          </div>

          <button type="button" className="lightbox-nav lightbox-next" onClick={next} aria-label="Next photo">→</button>
          <div className="lightbox-footer">
            <span>{current.label} · {current.location}</span>
            <span>{String(active + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")} · {zoom > MIN_ZOOM ? "click to reset" : "click or scroll to zoom"}</span>
          </div>
        </div>
      )}
    </div>
  );
}
