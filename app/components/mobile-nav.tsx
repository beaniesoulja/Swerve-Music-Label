"use client";

import { useEffect, useState } from "react";

const links = [
  { href: "#artists", label: "Artist" },
  { href: "#music", label: "Music" },
  { href: "#culture", label: "Culture" },
  { href: "#live", label: "Live" },
  { href: "#newsletter", label: "Newsletter" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("mobile-nav-open", open);
    return () => document.body.classList.remove("mobile-nav-open");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="mobile-nav">
      <button
        type="button"
        className="mobile-nav-toggle"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((current) => !current)}
      >
        <span /><span /><span />
      </button>
      <div id="mobile-nav-panel" className={`mobile-nav-panel${open ? " is-open" : ""}`} aria-hidden={!open}>
        <nav aria-label="Mobile navigation">
          {links.map((link) => (
            <a href={link.href} key={link.href} onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
              {link.label}
            </a>
          ))}
        </nav>
        <a className="mobile-nav-cta" href="#contact" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
          Work with us <span>↗</span>
        </a>
      </div>
    </div>
  );
}
