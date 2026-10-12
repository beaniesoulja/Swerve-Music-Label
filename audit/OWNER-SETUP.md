# Owner setup still needed

The website changes remain local. Cloudflare email routing for `swervemusic.org` was configured separately; the owner confirmed receipt on 12 October 2026. No website deployment, database migration, or email campaign was performed.

1. **Contact email completed:** all three enquiry categories default to the verified public address `hello@swervemusic.org`. The private forwarding destination is not embedded in the website. Optional per-category overrides remain supported; `CONTACT_EMAIL_ENABLED=false` disables the links. Sending replies as the domain address is not configured by inbound forwarding.
2. **Canonical domain:** confirm the exact production HTTPS URL and connect it to the host. Set `SITE_URL`; this enables the correct canonical URL, sitemap, sharing URLs, and indexing.
3. **Newsletter accounts:** provide the Neon test/production connection configuration, a verified sending domain/address, and provider credentials. The adapter is prepared for Resend; another provider can be substituted. Secrets belong in the host environment, not chat or source control.
4. **Policies:** provide approved privacy and terms documents, business identity, privacy contact, retention/deletion process, and confirmed providers. Add their HTTPS URLs after publication. Signup stays off until a privacy policy is configured.
5. **Social links:** provide the real Instagram, TikTok, and YouTube profiles. Unconfigured names no longer appear as dead links.
6. **Editorial content:** supply completed Sound, Movement, and City stories if those sections should return. The unsupported weekly-release claim has been removed.
7. **Campaign workflow:** choose how newsletters will be composed/sent and how the sender will honor current unsubscribes. A private subscriber-export command is available; stale exports must not be reused. No campaigns have been sent.
8. **Final launch verification:** approve a real test address and verify signup/confirmation/unsubscribe email receipt, live domain, actual mobile devices, hosting badge setting, and backup/restore access.

See `HOSTING-INSTRUCTIONS.md` for the hosting sequence. Contact links are now enabled by default. Newsletter signup remains gated until its separate provider and policy configuration is complete.
