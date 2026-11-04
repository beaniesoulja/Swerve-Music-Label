# Owner setup still needed

Status reviewed 4 November 2026. The website is live on Cloudflare, connected to GitHub main. Cloudflare email routing for `swervemusic.org` is configured; the owner confirmed receipt. No production database migration or email campaign was performed during this audit.

1. **Contact email completed:** all three enquiry categories default to the verified public address `hello@swervemusic.org`. The private forwarding destination is not embedded in the website. Optional per-category overrides remain supported; `CONTACT_EMAIL_ENABLED=false` disables the links. Sending replies as the domain address is not configured by inbound forwarding.
2. **Canonical domain completed:** `https://www.swervemusic.org` is live; the apex redirects to www. Preserve `SITE_URL` during deployment.
3. **Newsletter accounts:** provide the Neon test/production connection configuration, a verified sending domain/address, and provider credentials. The adapter is prepared for Resend; another provider can be substituted. Secrets belong in the host environment, not chat or source control.
4. **Policies:** provide approved privacy and terms documents, business identity, privacy contact, retention/deletion process, and confirmed providers. Add their HTTPS URLs after publication. Signup stays off until a privacy policy is configured.
5. **Social links:** Instagram is configured as `swervemusicltd`. Supply TikTok or YouTube only if those links should be added. Unconfigured names do not appear as dead links.
6. **Editorial content:** supply completed Sound, Movement, and City stories if those sections should return. The unsupported weekly-release claim has been removed.
7. **Campaign workflow:** choose how newsletters will be composed/sent and how the sender will honor current unsubscribes. A private subscriber-export command is available; stale exports must not be reused. No campaigns have been sent.
8. **Remaining service verification:** after newsletter setup, approve a real test address and verify signup/confirmation/unsubscribe email receipt. Physical iPhone Safari testing and production database backup/restore remain owner checks.

See `HOSTING-INSTRUCTIONS.md` for the hosting sequence. Contact links are now enabled by default. Newsletter signup remains gated until its separate provider and policy configuration is complete.
