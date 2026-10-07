# Owner setup still needed

The code fixes are local. No site, database migration, DNS change, or email campaign was published.

1. **Contact email:** choose/configure the receiving mail service and three working addresses. The old `swervemusic.com` DNS advertised no email service. After receipt is verified, set the contact variables in `.env.example` and enable the links.
2. **Canonical domain:** confirm the exact production HTTPS URL and connect it to the host. Set `SITE_URL`; this enables the correct canonical URL, sitemap, sharing URLs, and indexing.
3. **Newsletter accounts:** provide the Neon test/production connection configuration, a verified sending domain/address, and provider credentials. The adapter is prepared for Resend; another provider can be substituted. Secrets belong in the host environment, not chat or source control.
4. **Policies:** provide approved privacy and terms documents, business identity, privacy contact, retention/deletion process, and confirmed providers. Add their HTTPS URLs after publication. Signup stays off until a privacy policy is configured.
5. **Social links:** provide the real Instagram, TikTok, and YouTube profiles. Unconfigured names no longer appear as dead links.
6. **Editorial content:** supply completed Sound, Movement, and City stories if those sections should return. The unsupported weekly-release claim has been removed.
7. **Campaign workflow:** choose how newsletters will be composed/sent and how the sender will honor current unsubscribes. A private subscriber-export command is available; stale exports must not be reused. No campaigns have been sent.
8. **Final launch verification:** approve a real test address and verify signup/confirmation/unsubscribe email receipt, live domain, actual mobile devices, hosting badge setting, and backup/restore access.

See `HOSTING-INSTRUCTIONS.md` for the exact sequence. The interface shows a temporary-unavailability message for contact/signup until configured. These are intentional setup gates, not completed live integrations.
