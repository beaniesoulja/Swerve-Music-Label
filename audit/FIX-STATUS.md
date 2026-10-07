# Audit fixes and verification

7 October 2026. Local changes only; no deployment, DNS change, production migration, account provisioning, real email, or campaign send was performed. The original audit is retained as the pre-fix baseline.

## What changed

| Audit item | Implemented result | Remaining dependency |
| --- | --- | --- |
| 1. Contact delivery | Removed undeliverable hard-coded mail links; verified addresses are configurable behind an explicit activation setting. Clear unavailable state until then. | Owner must configure mailboxes/DNS and verify receipt. |
| 2. Newsletter configuration | Corrected Neon/PostgreSQL documentation and migration commands, removed obsolete D1 binding, added configuration gate and deliberate 503 response. | Supply database settings and apply migrations to a test branch, then production. |
| 3. Newsletter lifecycle | Added Resend adapter, double opt-in, hashed expiring single-use confirmation tokens, signed/versioned unsubscribe links, suppression-safe resubscription, shared database rate limits, and private CSV export. GET links do not mutate subscriptions. | Verified provider/sender and approved end-to-end delivery test. Campaign authoring/sending workflow is not included. |
| 4. Policies | Footer and signup support configured approved HTTPS policy links. Signup remains disabled without a privacy URL. | Owner-approved privacy and terms content must be published. No legal text was invented. |
| 5. Dependencies | Updated framework/runtime/build packages and compatible transitive dependencies; production dependency audit reports zero advisories. | Seven build/lint package entries remain tied to the upstream braces advisory described below. |
| 6. Mobile menu | Crossing the 701px desktop breakpoint closes the menu and releases body scroll locking; Escape returns focus; closed panel is inert. | Post-change browser interaction check pending. |
| 7. Sticky header | Changed the main overflow container to `clip`, preserving sticky positioning; added anchor scroll offsets. | Post-change visual check pending. |
| 8. Collapsed gallery | Collapsed event subtree is inert, preventing hidden controls from receiving keyboard focus. | Post-change keyboard check pending. |
| 9. Photo viewer | Native modal dialog, keyboard opener, Escape, modal focus containment, and return to the opener/current photo after navigation. | Post-change browser and screen-reader check pending. |
| 10. Mute persistence | Catalogue owns mute state alongside volume, preserving both when the player remounts for another track. | Post-change playback check pending. |
| 11. Malformed payloads | Invalid JSON/shapes return 400; unsupported types 415; bounded oversized JSON bodies 413. | None for the reproduced API bug. |
| 12. Dead stories/socials | Removed unfinished story rows and inactive social labels; real configured social links render. | Supply approved stories/profile URLs if wanted. |
| 13. Carousel | Starts paused; explicit play/pause; pauses progression on interaction, hidden tabs and reduced-motion preference; larger touch targets. | Post-change interaction/visual checks pending. |
| 14. Progressive rendering | Content is visible without hydration. Reveal animation is opt-in after initialization, with reduced-motion overrides. | Actual JS-disabled browser check pending. |
| 15. Test coverage | Replaced starter tests; repaired type coverage and Worker types; excluded obsolete D1 examples; added real PostgreSQL migration/lifecycle tests and built-Worker HTTP tests. npm lockfile is authoritative. | CI wiring/deployed release verification remains host-specific. |
| 16. SEO/sharing | Canonical, Open Graph/Twitter metadata, organization/artist JSON-LD, robots and sitemap. Unconfigured previews are noindex/disallowed. | Confirm and configure canonical production domain. |
| 17. Media/assets | Single lazy artist image, responsive WebP variants, preserved source originals, archived unused public assets and old pnpm files; old audio URLs redirect to v3. | Field performance/Core Web Vitals and real mobile network measurement remain unverified. |
| 18. Copy | Removed internal “supplied masters” wording and unsupported weekly promise; event images use neutral numbering; corrected documentation counts. | Owner may provide individual editorial captions later. |
| 19. Error recovery | Newsletter field-specific feedback/focus, duplicate-submit guard and timeout; visible audio loading/failure states. | Post-change browser network-failure checks pending. |

## Verified locally

- TypeScript: passes.
- ESLint: passes with zero errors and zero warnings.
- Eight unit/integration tests using isolated PGlite PostgreSQL and stubbed email transport: pass. Both committed SQL migrations execute; confirmation, invalid/expired/single-use tokens, duplicate-name protection, unsubscribe, resubscription/version rotation, legacy records, failed delivery and durable rate counters are covered.
- Six tests against the actual production Worker in local workerd: pass. Covers safe unconfigured homepage, malformed/unavailable API, discovery routes, confirmation form, 404, every public asset, legacy audio redirects, and configured metadata/form/contact/policy/social rendering with synthetic settings.
- All 226 current public files return HTTP 200 to HEAD requests in the Worker test.
- Default Cloudflare build: passes.
- Alternate Nitro/Node build: passes. Its local smoke test returned homepage/discovery 200, missing-page 404 and malformed signup 400. This is not a deployed Vercel verification. The temporary port-4174 server was stopped.
- Development preview at http://localhost:4173/ returns HTTP 200 and remains running.
- `git diff --check`: passes.
- Responsive artist assets: the five 480px WebP files total 111,246 bytes versus 2,025,255 bytes for the five original JPEGs, approximately 94.5% less. This is an asset comparison, not a measured whole-page speed gain. Larger variants are available for larger screens; originals remain intact.

React guidance informed controlled media state, stable carousel callbacks, progressive rendering and lazy media. Neon/PostgreSQL guidance informed retaining the existing driver, using PostgreSQL migrations, isolated database testing and direct migration connection configuration.

## Remaining dependency advisory

The full `npm audit` result is 7 high, 0 moderate, 0 low and 0 critical flagged package entries, down from 30 total in the original audit. `npm audit --omit=dev` reports zero. The seven entries share one underlying advisory: [braces deeply nested-pattern stack exhaustion](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), through fast-glob/micromatch and framework/linter build dependencies. The current published braces version remains affected. The proposed force-fixes downgrade major framework/lint versions, so they were not applied. No visitor exploit was demonstrated; package classification alone does not prove runtime unreachability. Keep untrusted glob patterns out of build inputs and reassess when a compatible upstream fix is available.

Build output still includes upstream vinext module-registration/dynamic-import warnings and an incomplete route-classification notice. They did not fail either build or the Worker HTTP tests.

## Verification limits and owner handoff

The browser tabs became stuck on stale “site can't be reached” error pages during the server restart. Browser automation could not safely reopen them; the owner was asked to reopen the HTTP preview. Consequently, the new interaction/layout changes are implemented and source/type/lint checked, but final live-browser, keyboard, screenshot and responsive confirmation of those changes is **not complete**. The original audit's browser results must not be presented as post-fix results.

No production database or email provider was touched. Real deliverability, physical devices, cross-browser/screen-reader compatibility, field performance, domain/DNS, host badges/security headers, and production backup/restore remain unverified. This is not launch certification.

See [OWNER-SETUP.md](OWNER-SETUP.md) for inputs that need the owner and [HOSTING-INSTRUCTIONS.md](../HOSTING-INSTRUCTIONS.md) for activation steps. Archived files can be recovered from `archive/`; no original artist photograph or event-gallery image was deleted.
