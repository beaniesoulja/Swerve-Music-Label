# Swerve Music Label Website

A responsive Swerve Music label site featuring sole current artist Beanie Soulja, seven 30-second catalogue previews, official Apple Music and Spotify profile links, booking/artist calls to action and an operational newsletter signup. Subscriber names, email addresses, consent time, source and status are stored in the Cloudflare D1 `newsletter_subscribers` table. Duplicate emails safely refresh the subscriber name, status and consent time.

## Artist audio and imagery

- Preview audio: `public/audio/` — 30-second, 128 kbps MP3 excerpts encoded from the seven user-supplied masters.
- Release artwork: `public/covers/` — art extracted from the supplied masters.
- FOWOSERE uses the corrected public artwork reading `SWERVE MUSIC`; the original embedded source is preserved in folder 14 of the master brand package.
- Full masters stay outside the public website directory. Full listening is routed to the official streaming profiles.
- Artist imagery: `public/artist/beanie-soulja/` — optimized derivatives of the user-supplied studio, interview, culture and travel images. All source originals remain in folder 14 of the master package.
- Artist photography is presented as a seven-image, one-at-a-time carousel with manual controls and timed progression.
- Catalogue order is TKL, THE MOTTO, Capsize, Burst Down, FOWOSERE, PSYCHO and NSG.
- Burst Down uses `burst-down-preview-v3.mp3`, freshly encoded from the replacement master supplied on 12 August 2026 so browsers cannot reuse the earlier catalogue audio.

## Newsletter database

- Schema: `db/schema.ts`
- Generated migrations: `drizzle/`
- API endpoint: `POST /api/newsletter`
- D1 binding: `DB`
- Required fields: name, valid email address and explicit newsletter consent

Generate a new migration after any future schema edit with `pnpm db:generate`. The Sites deployment workflow provisions the D1 database and applies the generated migration.

## Site runtime

A clean full-stack starter running on
[vinext](https://github.com/cloudflare/vinext), with optional Cloudflare D1 and
Drizzle support.

## Prerequisites

- Node.js `>=22.13.0`

## Quick Start

```bash
npm install
npm run dev
npm run build
```

This starter does not use `wrangler.jsonc`.

## Included Shape

- edit site code under `app/`
- `vite.config.ts` simulates declared bindings for local development
- `db/schema.ts` starts intentionally empty
- `examples/d1/` contains an optional D1 example surface
- `drizzle.config.ts` supports local migration generation when needed

## Useful Commands

- `npm run dev`: start local development
- `npm run build`: verify the vinext build output
- `npm test`: build the starter and verify its rendered loading skeleton
- `npm run db:generate`: generate Drizzle migrations after schema changes

## Learn More

- [vinext Documentation](https://github.com/cloudflare/vinext)
- [Drizzle D1 Guide](https://orm.drizzle.team/docs/get-started/d1-new)
