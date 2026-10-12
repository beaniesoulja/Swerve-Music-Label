/** Keep native playback on desktop; use gain for browsers with read-only volume. */
export class PreviewVolume {
  private context?: AudioContext;
  private source?: MediaElementAudioSourceNode;
  private gain?: GainNode;
  private nativeVolume?: boolean;

  constructor(
    private audio: HTMLAudioElement,
    private createContext: () => AudioContext = () => new AudioContext(),
  ) {}

  sync(volume: number, muted: boolean) {
    const level = Math.max(0, Math.min(1, volume));
    this.audio.muted = muted || level === 0;
    if (this.gain && this.context) {
      this.gain.gain.setValueAtTime(muted ? 0 : level, this.context.currentTime);
      return true;
    }
    if (this.nativeVolume === undefined) {
      // Probe below full volume, since reading 1 does not prove the setter works.
      try {
        this.audio.volume = 0.5;
        this.nativeVolume = Math.abs(this.audio.volume - 0.5) < 0.01;
      } catch { this.nativeVolume = false; }
    }
    if (this.nativeVolume) this.audio.volume = level;
    return this.nativeVolume;
  }

  async activate(volume: number, muted: boolean) {
    if (!this.sync(volume, muted)) {
      // Called only from a user gesture, so mobile audio can be unlocked.
      const context = this.createContext();
      try {
        const gain = context.createGain();
        gain.gain.value = muted ? 0 : Math.max(0, Math.min(1, volume));
        gain.connect(context.destination);
        const source = context.createMediaElementSource(this.audio);
        source.connect(gain);
        this.context = context;
        this.gain = gain;
        this.source = source;
      } catch (error) {
        void context.close().catch(() => {});
        throw error;
      }
    }
    if (this.context && this.context.state !== "running") await this.context.resume();
  }

  dispose() {
    this.source?.disconnect();
    this.gain?.disconnect();
    if (this.context) void this.context.close().catch(() => {});
  }
}

export function restoredVolume(volume: number, lastAudible: number) {
  return volume > 0 ? volume : lastAudible > 0 ? lastAudible : 0.3;
}
