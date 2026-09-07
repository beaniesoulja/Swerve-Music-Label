const ITEMS = ["Afrobeats", "Independent Label", "Lagos to the World", "New Music Weekly", "Artist-First", "Culture in Motion"];

export default function MarqueeTicker() {
  const track = (
    <div className="marquee-track">
      {ITEMS.map((item) => (
        <span key={item}>
          {item} <i aria-hidden="true">◆</i>
        </span>
      ))}
    </div>
  );

  return (
    <div className="marquee" aria-hidden="true">
      {track}
      {track}
    </div>
  );
}
