# Swerve Music website

Swerve Music's artist website with Beanie Soulja, seven 30-second previews, a five-photo artist slider, and the 186-image Live n Loud event gallery.

## Local development

Use Node.js 22.13+ and npm. `package-lock.json` is the authoritative lockfile.

```sh
npm ci
npm run dev -- --port 4173
```

The site works without secrets. Contact links and newsletter signup show an unavailable message until their services are configured. Do not put secrets in public environment variables.

## Verification

```sh
npm test
VINEXT_TARGET=vercel npm run build
```

`npm test` runs TypeScript, ESLint, in-memory PostgreSQL newsletter tests, a Cloudflare build, and production-render/API checks. Tests use synthetic data and a stub email transport; they do not contact a live database or send email. Run tests in a shell without real newsletter environment variables.

## Database and newsletter

The current database is **Neon PostgreSQL**, using Drizzle and `@neondatabase/serverless`. There is no newsletter D1 binding. Configuration is listed in `.env.example` and [HOSTING-INSTRUCTIONS.md](HOSTING-INSTRUCTIONS.md).

```sh
npm run db:generate
npm run db:migrate
```

Generate migrations after schema changes. Apply migrations to an isolated test database first, using `DATABASE_URL_UNPOOLED`. The repository's tests also execute the committed SQL migrations using PGlite.

Signup requires confirmation by email before activating a subscription. Links expire after 24 hours and are single use. Visiting the confirmation/unsubscribe page does not mutate data; the visitor must submit its form. Confirmed subscriber names cannot be overwritten through public signup. Unsubscribe remains available when new signup is disabled.

The email adapter uses the Resend HTTP API. No account or API key is bundled. Shared PostgreSQL counters limit attempts to 3 per email/hour and 200 globally/hour; an explicitly configured trusted proxy header adds a 20 per IP/hour limit. Stored rate keys are HMACs. Configure host-level request protection too.

`npm run newsletter:export` prints a CSV of confirmed, currently subscribed addresses with personalized unsubscribe URLs. It is an operator-only command and contains personal data. Store its output securely. Refresh immediately before an approved campaign and ensure the sender respects current suppressions; do not reuse stale exports. A campaign dashboard/send automation is not included. Legacy rows without confirmed consent are excluded until the person confirms again.

## Media and content

- The current Burst Down audio is `public/audio/burst-down-preview-v3.mp3`. Old preview paths redirect to it.
- Full music masters are not public assets.
- Artist photography loads one selected image at a time; the slideshow starts paused and supports user-controlled playback.
- Responsive WebP artist images preserve the originals and can be regenerated with `npm run images:optimize`.
- The event gallery lazily renders only nearby images and uses a native modal for zoom.
- Unused public assets and old pnpm configuration were preserved in `archive/`.
- Unfinished story rows, non-clickable social names, and the unverified weekly-release promise were removed. Only configured real social links appear.

See [audit/OWNER-SETUP.md](audit/OWNER-SETUP.md) for remaining owner inputs and [audit/FIX-STATUS.md](audit/FIX-STATUS.md) for verification results.
