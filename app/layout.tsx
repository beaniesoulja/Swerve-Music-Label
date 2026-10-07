import type { Metadata } from "next";
import "./globals.css";
import { siteUrl } from "./site-config";

export function generateMetadata(): Metadata { const url = siteUrl(); return {
  title: "Swerve Music · Art. Music. Culture.",
  description: "An Afrobeats-rooted independent artist label promoting music, culture, showcases and live bookings.",
  ...(url ? { metadataBase: url, alternates: { canonical: url.href } } : { robots: { index: false, follow: false } }),
  openGraph: { title: "Swerve Music · Art. Music. Culture.", description: "An Afrobeats-rooted independent artist label promoting music, culture, showcases and live bookings.", type: "website", siteName: "Swerve Music", images: [{ url: "/swerve-music-lockup-purple.png", alt: "Swerve Music" }], ...(url ? { url: url.href } : {}) },
  twitter: { card: "summary", title: "Swerve Music · Art. Music. Culture.", images: ["/favicon-192.png"] },
  icons: {
    icon: [
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon-48.png",
    apple: "/apple-touch-icon.png",
  },
}; }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
