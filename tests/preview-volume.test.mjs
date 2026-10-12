import assert from "node:assert/strict";
import test from "node:test";
import { PreviewVolume, restoredVolume } from "../app/lib/preview-volume.ts";

function fixture(readOnly = false) {
  let level = 1;
  const audio = { muted: false, get volume() { return level; }, set volume(value) { if (!readOnly) level = value; } };
  const calls = { contexts: 0, sources: 0, resumes: 0, closes: 0, disconnects: 0 };
  const gain = {
    gain: { value: 1, setValueAtTime(value) { this.value = value; } },
    connect() {}, disconnect() { calls.disconnects++; },
  };
  const context = {
    state: "suspended", currentTime: 0, destination: {},
    createGain: () => gain,
    createMediaElementSource() { calls.sources++; return { connect() {}, disconnect() { calls.disconnects++; } }; },
    async resume() { calls.resumes++; this.state = "running"; },
    async close() { calls.closes++; this.state = "closed"; },
  };
  const controller = new PreviewVolume(audio, () => { calls.contexts++; return context; });
  return { audio, calls, gain, context, controller };
}

test("native volume follows the slider and mute without creating an audio context", async () => {
  const { audio, calls, controller } = fixture();
  assert.equal(controller.sync(0.3, false), true);
  assert.equal(audio.volume, 0.3);
  await controller.activate(0.8, false);
  assert.equal(audio.volume, 0.8);
  controller.sync(0.8, true);
  assert.equal(audio.muted, true);
  controller.sync(0.8, false);
  assert.equal(audio.muted, false);
  assert.equal(calls.contexts, 0);
});

test("read-only mobile volume uses one gain graph, created only on user activation", async () => {
  const { audio, calls, gain, controller } = fixture(true);
  assert.equal(controller.sync(0.3, false), false);
  assert.equal(calls.contexts, 0);
  await controller.activate(0.3, false);
  assert.equal(audio.volume, 1);
  assert.equal(gain.gain.value, 0.3);
  await controller.activate(0.7, false);
  assert.equal(gain.gain.value, 0.7);
  assert.equal(calls.contexts, 1);
  assert.equal(calls.sources, 1);
  assert.equal(calls.resumes, 1);
  controller.sync(0.7, true);
  assert.equal(gain.gain.value, 0);
  assert.equal(audio.muted, true);
  controller.sync(0.7, false);
  assert.equal(gain.gain.value, 0.7);
  assert.equal(audio.muted, false);
});

test("zero volume is silent and the speaker button can restore the last audible level", async () => {
  for (const readOnly of [false, true]) {
    const { audio, gain, controller } = fixture(readOnly);
    await controller.activate(0.6, false);
    controller.sync(0, false);
    assert.equal(audio.muted, true);
    const restored = restoredVolume(0, 0.6);
    await controller.activate(restored, false);
    assert.equal(audio.muted, false);
    assert.equal(readOnly ? gain.gain.value : audio.volume, 0.6);
  }
  assert.equal(restoredVolume(0, 0), 0.3);
  assert.equal(restoredVolume(0.8, 0.6), 0.8);
});

test("a suspended context resumes on the next playback gesture and is cleaned up", async () => {
  const { context, calls, controller } = fixture(true);
  await controller.activate(0.3, false);
  context.state = "suspended";
  await controller.activate(0.3, false);
  assert.equal(calls.resumes, 2);
  controller.dispose();
  assert.equal(calls.disconnects, 2);
  assert.equal(calls.closes, 1);
});

test("unsupported Web Audio fails explicitly while native mute remains usable", async () => {
  const { audio } = fixture(true);
  const controller = new PreviewVolume(audio, () => { throw new Error("Unavailable"); });
  await assert.rejects(controller.activate(0.3, false), /Unavailable/);
  controller.sync(0.3, true);
  assert.equal(audio.muted, true);
});

test("volume is bounded and read-only detection works even at full volume", async () => {
  for (const readOnly of [false, true]) {
    const { controller, audio, gain } = fixture(readOnly);
    await controller.activate(2, false);
    assert.equal(readOnly ? gain.gain.value : audio.volume, 1);
    controller.sync(-1, false);
    assert.equal(audio.muted, true);
    assert.equal(readOnly ? gain.gain.value : audio.volume, 0);
  }
});
