# Swerve Music Website — Hosting Package

This ZIP contains the complete Swerve Music website source and a verified production build. It includes Beanie Soulja imagery, seven catalogue previews, the customized iOS-style song players, the corrected Burst Down replacement audio, the newsletter API, database schema and SQL migration.

## Runtime requirements

- Node.js 22.13 or newer
- A host capable of running a persistent Node.js service or Cloudflare Workers
- Install command: `npm ci`
- Build command: `npm run build`
- Start command: `npm start -- --hostname 0.0.0.0 --port $PORT`

If the host does not provide a `PORT` variable, use port `3000`.

## Local launch

1. Extract this ZIP.
2. Open Terminal inside the extracted folder.
3. Run `npm ci`.
4. Run `npm run dev`.
5. Open `http://localhost:3000`.

## Newsletter database

The newsletter form requires a Cloudflare D1-compatible binding named `DB`. The database definition is in `db/schema.ts`, and the migration is in `drizzle/0000_newsletter_subscribers.sql`.

If a hosting provider cannot supply a D1-compatible database, the website and music catalogue still render, but newsletter signups will not be stored until the provider connects the API route to another SQL database.

## Cloudflare deployment

The existing configuration is Cloudflare-compatible. Give the provider this entire package and specify:

- D1 binding: `DB`
- Migration directory: `drizzle/`
- Production entrypoint after build: `dist/server/index.js`
- Static assets: `dist/client/`

## Important

- No ChatGPT authentication is implemented in the website source.
- Authentication seen on a previous hosted URL was imposed by that hosting platform, not by this application.
- The full website is not intentionally deployed by this package; deployment happens only when a hosting provider runs it.
- The included song files are 30-second promotional previews. Full masters are excluded from this hosting ZIP.
