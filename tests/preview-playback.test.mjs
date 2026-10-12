import assert from "node:assert/strict";
import test from "node:test";
import { previewSeek, previewFade, nextPreview } from "../app/lib/preview-playback.ts";

test("seeking and ten-second skips stay within the actual preview duration", () => {
  assert.equal(previewSeek(15, 30), 15);
  assert.equal(previewSeek(15 + 10, 30), 25);
  assert.equal(previewSeek(15 - 10, 30), 5);
  assert.equal(previewSeek(5 - 10, 30), 0);
  assert.equal(previewSeek(25 + 10, 29.7), 29.7);
  assert.equal(previewSeek(10, NaN), 0);
});

test("preview fades over its final 1.5 seconds and seeking back restores full gain", () => {
  assert.equal(previewFade(15, 30), 1);
  assert.equal(previewFade(28.5, 30), 1);
  assert.equal(previewFade(29.25, 30), 0.5);
  assert.equal(previewFade(30, 30), 0);
  assert.equal(previewFade(31, 30), 0);
  assert.equal(previewFade(0, NaN), 1);
  assert.equal(previewFade(5, 30), 1);
});

test("automatic progression plays the remaining list once and never wraps", () => {
  const played = [];
  for (let index = 0; index !== null; index = nextPreview(index, 7)) played.push(index);
  assert.deepEqual(played, [0, 1, 2, 3, 4, 5, 6]);
  assert.equal(nextPreview(6, 7), null);
  assert.equal(nextPreview(0, 1), null);
});
