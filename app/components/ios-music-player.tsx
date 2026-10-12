"use client";

import { useEffect, useId, useImperativeHandle, useRef, useState } from "react";
import type { CSSProperties, Ref } from "react";
import { PreviewVolume, restoredVolume } from "../lib/preview-volume";
import { previewFade, previewSeek } from "../lib/preview-playback";

export type MusicPlayerHandle = { play: () => Promise<void> };

type IosMusicPlayerProps = {
  ref?: Ref<MusicPlayerHandle>;
  src: string;
  title: string;
  artist: string;
  cover: string;
  variant?: "featured" | "compact";
  showVolume?: boolean;
  volume?: number;
  onVolumeChange?: (value: number) => void;
  muted?: boolean;
  onMutedChange?: (value: boolean) => void;
  onComplete?: () => void;
};

const DEFAULT_VOLUME = 0.3;

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function BackTenIcon() {
  return (
    <svg viewBox="0 0 28 28" aria-hidden="true">
      <path d="M8.4 7.7A9.2 9.2 0 1 1 5 14.8" />
      <path d="M4.9 6v6h6" />
      <text x="10.3" y="18.2">10</text>
    </svg>
  );
}

function ForwardTenIcon() {
  return (
    <svg viewBox="0 0 28 28" aria-hidden="true">
      <path d="M19.6 7.7a9.2 9.2 0 1 0 3.4 7.1" />
      <path d="M23.1 6v6h-6" />
      <text x="8.4" y="18.2">10</text>
    </svg>
  );
}

function PlayIcon({ playing }: { playing: boolean }) {
  return playing ? (
    <svg viewBox="0 0 28 28" aria-hidden="true"><path className="solid-icon" d="M7 5h5v18H7zM16 5h5v18h-5z" /></svg>
  ) : (
    <svg viewBox="0 0 28 28" aria-hidden="true"><path className="solid-icon" d="M8 4.8v18.4L23 14z" /></svg>
  );
}

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 28 28" aria-hidden="true">
      <path className="solid-icon" d="M4 11h5l6-5v16l-6-5H4z" />
      {!muted && <><path d="M18 10c1.2 1.1 1.8 2.4 1.8 4S19.2 16.9 18 18" /><path d="M21 7.5c2 1.8 3 4 3 6.5s-1 4.7-3 6.5" /></>}
      {muted && <><path d="m19 11 6 6" /><path d="m25 11-6 6" /></>}
    </svg>
  );
}

export default function IosMusicPlayer({
  ref,
  src,
  title,
  artist,
  cover,
  variant = "compact",
  showVolume,
  volume: controlledVolume,
  onVolumeChange,
  muted: controlledMuted,
  onMutedChange,
  onComplete,
}: IosMusicPlayerProps) {
  const shouldShowVolume = showVolume ?? variant === "featured";
  const audioRef = useRef<HTMLAudioElement>(null);
  const volumeController = useRef<PreviewVolume | null>(null);
  const lastAudibleVolume = useRef(controlledVolume || DEFAULT_VOLUME);
  const continuePlayback = useRef(false);
  const playerId = useId();
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [internalVolume, setInternalVolume] = useState(controlledVolume ?? DEFAULT_VOLUME);
  const [internalMuted, setInternalMuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [volumeNotice, setVolumeNotice] = useState("");
  const muted = controlledMuted ?? internalMuted;
  const setMuted = (value: boolean) => { setInternalMuted(value); onMutedChange?.(value); };
  const volume = controlledVolume ?? internalVolume;
  const silent = muted || volume === 0;

  const getVolumeController = () => {
    if (!volumeController.current && audioRef.current) volumeController.current = new PreviewVolume(audioRef.current);
    return volumeController.current;
  };

  const playbackVolume = (level: number) => {
    const audio = audioRef.current;
    return level * (audio ? previewFade(audio.currentTime, audio.duration) : 1);
  };

  useEffect(() => {
    getVolumeController()?.sync(playbackVolume(volume), muted);
    if (volume > 0) lastAudibleVolume.current = volume;
  }, [volume, muted]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      getVolumeController()?.sync(playbackVolume(volume), muted);
    }, 50);
    return () => window.clearInterval(timer);
  }, [playing, volume, muted]);

  useEffect(() => () => {
    volumeController.current?.dispose();
    volumeController.current = null;
  }, []);

  const activateVolume = () => getVolumeController()?.activate(playbackVolume(volume), muted).then(
    () => setVolumeNotice(""),
    () => setVolumeNotice("Use your device volume buttons to adjust the sound in this browser."),
  );

  useEffect(() => {
    const pauseForAnotherPlayer = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      if (customEvent.detail !== playerId && audioRef.current) {
        continuePlayback.current = false;
        audioRef.current.pause();
      }
    };
    window.addEventListener("swerve-audio-play", pauseForAnotherPlayer);
    return () => window.removeEventListener("swerve-audio-play", pauseForAnotherPlayer);
  }, [playerId]);

  const play = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      setError("");
      setLoading(true);
      window.dispatchEvent(new CustomEvent("swerve-audio-play", { detail: playerId }));
      try {
        if (audio.error) audio.load();
        if (audio.ended || (Number.isFinite(audio.duration) && audio.currentTime >= audio.duration)) {
          audio.currentTime = 0;
          setCurrentTime(0);
        }
        // Do not await before play(): both APIs need the original user gesture.
        void activateVolume();
        await audio.play();
      } catch (cause) {
        if (!audio.isConnected || (cause instanceof DOMException && cause.name === "AbortError")) return;
        setPlaying(false);
        setError("This preview could not play. Check your connection and try again.");
      } finally {
        if (audio.isConnected) setLoading(false);
      }
    }
  };

  useImperativeHandle(ref, () => ({ play }));

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (audio && !audio.paused) {
      continuePlayback.current = false;
      audio.pause();
    }
    else void play();
  };

  const seek = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!Number.isFinite(audio.duration)) return;
    const position = previewSeek(value, audio.duration);
    audio.currentTime = position;
    setCurrentTime(position);
    getVolumeController()?.sync(playbackVolume(volume), muted);
  };

  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    seek(audio.currentTime + seconds);
  };

  const changeVolume = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const level = Math.max(0, Math.min(1, value));
    getVolumeController()?.sync(playbackVolume(level), false);
    void getVolumeController()?.activate(playbackVolume(level), false).then(
      () => setVolumeNotice(""),
      () => setVolumeNotice("Use your device volume buttons to adjust the sound in this browser."),
    );
    setMuted(false);
    if (level > 0) lastAudibleVolume.current = level;
    setInternalVolume(level);
    onVolumeChange?.(level);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (silent) changeVolume(restoredVolume(volume, lastAudibleVolume.current));
    else {
      getVolumeController()?.sync(volume, true);
      setMuted(true);
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumeProgress = silent ? 0 : volume * 100;

  return (
    <div className={`ios-player ios-player-${variant}`}>
      {/* Music-only preview; controls and track title provide the accessible context. */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio
        ref={audioRef}
        src={src}
        muted={silent}
        preload="metadata"
        onEmptied={() => { setCurrentTime(0); setDuration(30); setPlaying(false); setError(""); }}
        onLoadedMetadata={(event) => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 30)}
        onTimeUpdate={(event) => { setCurrentTime(event.currentTarget.currentTime); getVolumeController()?.sync(playbackVolume(volume), muted); }}
        onPlay={() => { continuePlayback.current = true; setPlaying(true); setError(""); }}
        onPlaying={() => setLoading(false)}
        onWaiting={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
        onError={() => { setLoading(false); setPlaying(false); setError("This preview is unavailable. Try again or listen on a streaming service."); }}
        onPause={(event) => { if (!event.currentTarget.ended) continuePlayback.current = false; setPlaying(false); }}
        onEnded={(event) => {
          const advance = continuePlayback.current;
          continuePlayback.current = false;
          setPlaying(false);
          setCurrentTime(event.currentTarget.currentTime);
          if (advance) onComplete?.();
        }}
      />

      {variant === "featured" && (
        <div className="ios-player-topline">
          <span>{title.toUpperCase()} PREVIEW</span>
          <div aria-hidden="true"><i /><i /><i /><i /></div>
        </div>
      )}

      <div className="ios-player-track">
        {variant === "featured" && <img src={cover} alt={`${title} cover artwork`} />}
        <div>
          <strong>{title}</strong>
          <span>{artist}</span>
        </div>
        {variant === "compact" && <span className="ios-preview-label">{title.toUpperCase()} PREVIEW</span>}
      </div>

      <div className="ios-progress-wrap">
        <input
          className="ios-range ios-progress"
          type="range"
          min="0"
          max={duration || 30}
          step="0.01"
          value={currentTime}
          aria-label={`Seek through ${title}`}
          aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
          onChange={(event) => seek(Number(event.target.value))}
          style={{ "--range-progress": `${progress}%` } as CSSProperties}
        />
        <div className="ios-time"><span>{formatTime(currentTime)}</span><span>-{formatTime(Math.max(duration - currentTime, 0))}</span></div>
      </div>

      <div className="ios-controls">
        <button type="button" className="ios-skip" onClick={() => skip(-10)} aria-label={`Go back 10 seconds in ${title}`}><BackTenIcon /></button>
        <button type="button" className="ios-play" onClick={togglePlayback} aria-busy={loading} aria-label={`${playing ? "Pause" : "Play"} ${title}`}><PlayIcon playing={playing} /></button>
        <button type="button" className="ios-skip" onClick={() => skip(10)} aria-label={`Go forward 10 seconds in ${title}`}><ForwardTenIcon /></button>
      </div>

      <p className="audio-status" role="status" aria-live="polite">{error || (loading ? "Loading preview…" : "")}</p>

      {shouldShowVolume && (
        <div className="ios-volume">
          <button type="button" onClick={toggleMute} aria-label={silent ? "Unmute preview" : "Mute preview"} aria-pressed={silent}><SpeakerIcon muted={silent} /></button>
          <input
            className="ios-range"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={muted ? 0 : volume}
            aria-label="Preview volume"
            aria-valuetext={`${Math.round(volumeProgress)}%`}
            onChange={(event) => changeVolume(Number(event.target.value))}
            style={{ "--range-progress": `${volumeProgress}%` } as CSSProperties}
          />
        </div>
      )}
      {volumeNotice && <p className="audio-status" role="status">{volumeNotice}</p>}
    </div>
  );
}
