"use client";

import { useState } from "react";
import IosMusicPlayer from "./ios-music-player";
import { useCoverflow } from "./use-coverflow";

const DEFAULT_CATALOGUE_VOLUME = 0.3;

export type CatalogueTrack = {
  title: string;
  credit: string;
  year: string;
  duration: string;
  cover: string;
  audio: string;
  apple: string;
};

export default function CatalogueCoverflow({ tracks, spotifyArtist }: { tracks: CatalogueTrack[]; spotifyArtist: string }) {
  const { active, goTo, next, prev, stageHandlers, cardStyle } = useCoverflow(tracks.length);
  const [volume, setVolume] = useState(DEFAULT_CATALOGUE_VOLUME);
  const current = tracks[active];

  return (
    <div className="coverflow catalogue-coverflow" aria-roledescription="carousel" aria-label="Beanie Soulja catalogue carousel">
      <div className="coverflow-topline">
        <span>TRACK {String(active + 1).padStart(2, "0")}</span>
        <span>{String(active + 1).padStart(2, "0")} / {String(tracks.length).padStart(2, "0")}</span>
      </div>

      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- custom carousel widget follows the ARIA carousel pattern (focusable region + arrow-key navigation) */}
      <div className="coverflow-stage catalogue-stage" tabIndex={0} {...stageHandlers}>
        {tracks.map((track, index) => {
          const style = cardStyle(index, { spacing: 118 });
          if (!style) return null;
          const offset = index - active;
          return (
            <button
              type="button"
              key={track.title}
              className={`coverflow-card catalogue-card${offset === 0 ? " is-active" : ""}`}
              style={style}
              onClick={() => (offset === 0 ? undefined : goTo(index))}
              tabIndex={-1}
              aria-hidden={offset !== 0}
              aria-current={offset === 0}
            >
              <img src={track.cover} alt={`${track.title} cover artwork`} loading="lazy" draggable={false} />
            </button>
          );
        })}
      </div>

      <div className="catalogue-detail">
        <span className="catalogue-detail-meta">{current.year} · {current.duration}</span>
        <h3>{current.title}</h3>
        <p>{current.credit}</p>
        <IosMusicPlayer
          key={current.title}
          src={current.audio}
          title={current.title}
          artist={current.credit}
          cover={current.cover}
          showVolume
          volume={volume}
          onVolumeChange={setVolume}
        />
        <div className="track-links">
          <a href={current.apple} target="_blank" rel="noreferrer">Apple Music ↗</a>
          <a href={spotifyArtist} target="_blank" rel="noreferrer">Spotify ↗</a>
        </div>
      </div>

      <div className="coverflow-controls">
        <button type="button" onClick={prev} aria-label="Previous track">←</button>
        <div className="coverflow-dots">
          {tracks.map((track, index) => (
            <button
              type="button"
              key={track.title}
              className={index === active ? "is-active" : ""}
              aria-label={`Go to ${track.title}`}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
        <button type="button" onClick={next} aria-label="Next track">→</button>
      </div>
    </div>
  );
}
