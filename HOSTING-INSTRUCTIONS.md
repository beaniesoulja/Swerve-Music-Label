# Hosting and service setup

## Build targets

- Vercel: `vercel.json` sets `VINEXT_TARGET=vercel vite build`; the host's Vercel environment selects the Nitro deployment preset. Verify an actual preview deployment before production.
- Cloudflare: `npm run build` produces `dist/server/index.js` and `dist/client/`. Configure runtime Neon and mail-provider secrets. `.openai/hosting.json` no longer requests D1; PostgreSQL migrations must not be applied to D1.
- Local Node smoke test: `VINEXT_TARGET=vercel npm run build`, then `PORT=4174 HOST=localhost node .output/server/index.mjs`.

Use Node.js 22.13+ and `npm ci`. Build on the deployment platform so native dependencies match its OS/architecture. No deployment has been performed as part of these fixes.

## Environment

`.env.example` lists every setting. Put production secrets in the hosting dashboard. For local development, use a git-ignored `.env.local` loaded by Vite; for CLI commands, load the required variables into the shell or use Node's `--env-file` option.

1. Set `SITE_URL` to the verified canonical HTTPS origin, without paths or credentials. Without it, preview indexing is disabled and sitemap contains no guessed URLs.
2. Publish approved privacy/terms documents and set `PRIVACY_POLICY_URL` and `TERMS_URL`. The URLs must use HTTPS. Links appear only when configured.
3. Configure real receiving mailboxes and set `CONTACT_ARTISTS_EMAIL`, `CONTACT_BOOKINGS_EMAIL`, `CONTACT_CULTURE_EMAIL`. Verify actual delivery before setting `CONTACT_EMAIL_ENABLED=true`. The 7 October audit found null MX on the former contact domain; changing website code cannot fix this.
4. Add actual Instagram/TikTok/YouTube profile URLs in the corresponding `SOCIAL_*_URL` settings.

## Newsletter activation

1. Supply a Neon PostgreSQL `DATABASE_URL` for application queries and direct `DATABASE_URL_UNPOOLED` for migrations. Use a database branch or separate database to test first.
2. Run `npm run db:migrate` against that test database. The migrations are `0000_colorful_adam_destine.sql` and `0001_careful_bloodstrike.sql`. Migration 0001 adds confirmation/suppression support and durable rate counters without deleting existing subscribers.
3. Supply a Resend `RESEND_API_KEY` and a verified sender in `NEWSLETTER_FROM_EMAIL`. No account is provisioned automatically. The adapter is in `app/lib/newsletter-service.ts` and can be replaced if another provider is preferred.
4. Generate a strong random `NEWSLETTER_TOKEN_SECRET` of at least 32 characters, keep it server-only, and keep it stable. Rotation invalidates old unsubscribe signatures, so plan continuity before rotating.
5. Ensure `SITE_URL` and an approved `PRIVACY_POLICY_URL` are set, then enable `NEWSLETTER_ENABLED=true` in the test environment.
6. Verify real email receipt, explicit confirmation, database persistence, duplicate signup, unsubscribe, and resubscription. Check outbound sender authentication and deliverability in the provider dashboard.
7. Apply the reviewed migration and settings in production, then repeat the flow with an owner-approved test address.

The API fails closed with 503 when configuration is incomplete. Public signup is not a backdoor to modify confirmed subscribers. A pending request for an unsubscribed address does not reactivate it until email confirmation. GET requests do not confirm/unsubscribe, protecting against email-link scanners.

For IP limits set `TRUSTED_CLIENT_IP_HEADER` only if the host overwrites it, for example `cf-connecting-ip` behind Cloudflare or `x-vercel-forwarded-for` behind Vercel. Do not trust arbitrary forwarded headers. Global and per-address database limits apply regardless of that setting.

Subscriber exports contain personal data and per-person unsubscribe links. Keep them private, refresh before an approved send, and synchronize suppressions with any external campaign sender. Pending/unsubscribed and unconfirmed legacy records are excluded. A full campaign dashboard and production delivery monitoring need a chosen provider workflow.

## Policies and live checks

Policy text needs the owner's business identity, contact details, retention/deletion process, and chosen providers. Do not publish invented legal text. Configure the public links after approval. Also verify the production domain, HTTPS, host-added badges, response/security headers, real devices, and backup/restore access before declaring the site launch-ready.
