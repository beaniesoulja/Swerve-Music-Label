"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import IosMusicPlayer, { type MusicPlayerHandle } from "./ios-music-player";
import { nextPreview } from "../lib/preview-playback";

export type CatalogueTrack = {
  title: string;
  credit: string;
  year: string;
  cover: string;
  audio: string;
  apple: string;
  spotify: string;
};

export default function CatalogueCoverflow({ tracks }: { tracks: CatalogueTrack[] }) {
  const playerRef = useRef<MusicPlayerHandle>(null);
  const [active, setActive] = useState(0);
  const [volume, setVolume] = useState(0.3);
  const [muted, setMuted] = useState(false);
  const current = tracks[active];
  const selectTrack = (index: number) => {
    // Commit the selected audio before play(), keeping playback in the user gesture.
    flushSync(() => setActive(index));
    void playerRef.current?.play();
  };
  const move = (direction: number) => selectTrack((active + direction + tracks.length) % tracks.length);
  const playNext = () => {
    const next = nextPreview(active, tracks.length);
    if (next !== null) selectTrack(next);
  };

  return (
    <div className="release-browser" role="region" aria-label="Selected music previews">
      <div className="release-preview" id="selected-release">
        <span className="sr-only" aria-live="polite">{current.title} — {current.credit}</span>
        <IosMusicPlayer ref={playerRef} src={current.audio} title={current.title} artist={current.credit}
          cover={current.cover} showVolume volume={volume} onVolumeChange={setVolume} muted={muted} onMutedChange={setMuted} onComplete={playNext} />
      </div>
      <div className="release-selection">
        <div className="release-list-heading"><span>{tracks.length} tracks · 30-second previews</span><span>Listen & save</span></div>
        <ol className="release-list" aria-label="Choose a track">
          {tracks.map((track, index) => (
            <li key={track.title} className={active === index ? "is-selected" : undefined}>
              <button type="button" onClick={() => selectTrack(index)} aria-pressed={active === index} aria-controls="selected-release" aria-label={`Select ${track.title}`}>
                <span className="release-number">{String(index + 1).padStart(2, "0")}</span>
                <span className="release-list-title"><strong>{track.title}</strong><span>{track.credit} · {track.year}</span></span>
              </button>
              <div className="track-platforms" role="group" aria-label={`Listen and save ${track.title}`}>
                <a href={track.apple} target="_blank" rel="noopener noreferrer" title="Open in Apple Music to save" aria-label={`Open ${track.title} in Apple Music to save (opens in a new tab)`}>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20 2 8 4.5v12.1a4.3 4.3 0 0 0-2-.1c-1.9.4-3.2 1.9-2.9 3.4.3 1.5 2.1 2.3 4 1.9 1.8-.4 3-1.7 2.9-3.1V9l8-1.7v7.3a4.3 4.3 0 0 0-2-.1c-1.9.4-3.2 1.9-2.9 3.4.3 1.5 2.1 2.3 4 1.9 1.8-.4 3-1.7 2.9-3.1V2Z" /></svg>
                </a>
                <a href={track.spotify} target="_blank" rel="noopener noreferrer" title="Open in Spotify to save" aria-label={`Open ${track.title} in Spotify to save (opens in a new tab)`}>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="currentColor" /><path d="M6.7 9c3.4-1 7.4-.7 10.5 1M7.3 12.1c2.9-.8 6.3-.5 9 1M8 15c2.4-.6 5-.4 7.3.8" fill="none" stroke="var(--cream)" strokeWidth="1.6" strokeLinecap="round" /></svg>
                </a>
              </div>
            </li>
          ))}
        </ol>
        <div className="release-navigation"><button type="button" onClick={() => move(-1)} aria-label="Previous track">← Previous</button><button type="button" onClick={() => move(1)} aria-label="Next track">Next →</button></div>
      </div>
    </div>
  );
}
