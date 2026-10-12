export function previewSeek(value: number, duration: number) {
  if (!Number.isFinite(value) || !Number.isFinite(duration) || duration <= 0) return 0;
  return Math.max(0, Math.min(value, duration));
}

/** Fade only the final 1.5 seconds; the user's volume setting stays unchanged. */
export function previewFade(time: number, duration: number) {
  if (!Number.isFinite(duration) || duration <= 0) return 1;
  return Math.max(0, Math.min(1, (duration - time) / 1.5));
}

export function nextPreview(index: number, count: number) {
  return index + 1 < count ? index + 1 : null;
}
