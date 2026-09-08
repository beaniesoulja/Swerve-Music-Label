"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { CSSProperties } from "react";

type IosMusicPlayerProps = {
  src: string;
  title: string;
  artist: string;
  cover: string;
  variant?: "featured" | "compact";
  showVolume?: boolean;
  volume?: number;
  onVolumeChange?: (value: number) => void;
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
  src,
  title,
  artist,
  cover,
  variant = "compact",
  showVolume,
  volume: controlledVolume,
  onVolumeChange,
}: IosMusicPlayerProps) {
  const shouldShowVolume = showVolume ?? variant === "featured";
  const audioRef = useRef<HTMLAudioElement>(null);
  const playerId = useId();
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [internalVolume, setInternalVolume] = useState(controlledVolume ?? DEFAULT_VOLUME);
  const [muted, setMuted] = useState(false);
  const volume = controlledVolume ?? internalVolume;

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    const pauseForAnotherPlayer = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      if (customEvent.detail !== playerId && audioRef.current) {
        audioRef.current.pause();
      }
    };
    window.addEventListener("swerve-audio-play", pauseForAnotherPlayer);
    return () => window.removeEventListener("swerve-audio-play", pauseForAnotherPlayer);
  }, [playerId]);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      window.dispatchEvent(new CustomEvent("swerve-audio-play", { detail: playerId }));
      try {
        await audio.play();
      } catch {
        setPlaying(false);
      }
    } else {
      audio.pause();
    }
  };

  const seek = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setCurrentTime(value);
  };

  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    seek(Math.min(Math.max(audio.currentTime + seconds, 0), duration));
  };

  const changeVolume = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = value;
    audio.muted = false;
    setMuted(false);
    setInternalVolume(value);
    onVolumeChange?.(value);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setMuted(audio.muted);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumeProgress = muted ? 0 : volume * 100;

  return (
    <div className={`ios-player ios-player-${variant}`}>
      {/* Music-only preview; controls and track title provide the accessible context. */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 30)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setCurrentTime(0); }}
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
          onChange={(event) => seek(Number(event.target.value))}
          style={{ "--range-progress": `${progress}%` } as CSSProperties}
        />
        <div className="ios-time"><span>{formatTime(currentTime)}</span><span>-{formatTime(Math.max(duration - currentTime, 0))}</span></div>
      </div>

      <div className="ios-controls">
        <button type="button" className="ios-skip" onClick={() => skip(-10)} aria-label={`Go back 10 seconds in ${title}`}><BackTenIcon /></button>
        <button type="button" className="ios-play" onClick={togglePlayback} aria-label={`${playing ? "Pause" : "Play"} ${title}`}><PlayIcon playing={playing} /></button>
        <button type="button" className="ios-skip" onClick={() => skip(10)} aria-label={`Go forward 10 seconds in ${title}`}><ForwardTenIcon /></button>
      </div>

      {shouldShowVolume && (
        <div className="ios-volume">
          <button type="button" onClick={toggleMute} aria-label={muted ? "Unmute preview" : "Mute preview"}><SpeakerIcon muted={muted} /></button>
          <input
            className="ios-range"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={muted ? 0 : volume}
            aria-label="Preview volume"
            onChange={(event) => changeVolume(Number(event.target.value))}
            style={{ "--range-progress": `${volumeProgress}%` } as CSSProperties}
          />
        </div>
      )}
    </div>
  );
}
