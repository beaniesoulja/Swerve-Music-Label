"use client";

import { useCallback, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";

const DRAG_THRESHOLD = 50;

export function useCoverflow(count: number) {
  const [active, setActive] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef<{ startX: number; pointerId: number | null }>({
    startX: 0,
    pointerId: null,
  });

  const goTo = useCallback((index: number) => setActive(((index % count) + count) % count), [count]);
  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    dragState.current = { startX: event.clientX, pointerId: event.pointerId };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (dragState.current.pointerId === null) return;
    setDragX(event.clientX - dragState.current.startX);
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (dragState.current.pointerId === null) return;
    try {
      event.currentTarget.releasePointerCapture(dragState.current.pointerId);
    } catch {
      // pointer already released
    }
    dragState.current.pointerId = null;
    setIsDragging(false);
    if (dragX <= -DRAG_THRESHOLD) next();
    else if (dragX >= DRAG_THRESHOLD) prev();
    setDragX(0);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") { event.preventDefault(); next(); }
    else if (event.key === "ArrowLeft") { event.preventDefault(); prev(); }
    else if (event.key === "Home") { event.preventDefault(); goTo(0); }
    else if (event.key === "End") { event.preventDefault(); goTo(count - 1); }
  };

  const cardStyle = (index: number, options?: { maxVisibleOffset?: number; spacing?: number }): CSSProperties | undefined => {
    const maxVisibleOffset = options?.maxVisibleOffset ?? 4;
    const spacing = options?.spacing ?? 128;
    const offset = index - active;
    const abs = Math.abs(offset);
    if (abs > maxVisibleOffset) return undefined;
    const dragInfluence = isDragging ? dragX * 0.7 : 0;
    const translateX = offset * spacing + dragInfluence;
    const rotateY = Math.max(-46, Math.min(46, -offset * 34));
    const translateZ = -abs * 130;
    const scale = offset === 0 ? 1 : Math.max(0.62, 1 - abs * 0.14);
    const opacity = Math.max(1 - abs * 0.22, 0);
    return {
      transform: `translate(-50%, -50%) translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
      zIndex: 50 - abs,
      opacity,
      transition: isDragging ? "none" : undefined,
    };
  };

  return {
    active,
    goTo,
    next,
    prev,
    stageHandlers: { onKeyDown, onPointerDown, onPointerMove, onPointerUp: endDrag, onPointerCancel: endDrag },
    cardStyle,
  };
}
