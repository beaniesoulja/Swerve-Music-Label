# Website audit — 4 November 2026

Scope: current application source, deployed www site, Cloudflare build configuration, dependency lockfile, desktop and 390px browser interactions. This is a targeted code and functional audit, not a guarantee that every possible defect has been found.

## Confirmed issues and changes

| Issue | Evidence | Fix |
| --- | --- | --- |
| Preview seeking fails in production | Live Range request returned full 200; Chrome reported seekable `[0,0]`; slider and +10 returned to zero | Route only audio through the Worker, return exact 206 byte ranges, 416 for unsatisfiable ranges, and advertise seeking on 200/304/HEAD |
| Missing application security headers | Live homepage lacked framing and MIME-sniffing protections | Add CSP framing/base/object restrictions, X-Frame-Options, nosniff, referrer and unused-device permission controls; retain no-referrer on newsletter actions |
| Mobile keyboard leaves menu open | Tab past Work with us focused the hero while menu stayed expanded and body scrolling stayed locked | Close menu when keyboard focus leaves it |
| Spotify tracking metadata exposed in links | Seven catalogue links contained OpenAI UTM and request IDs | Keep canonical track URLs with the same track IDs |
| Vulnerable development dependencies | npm reported 19 findings, including two high-severity package entries | Patch Undici to 7.30.1, fast-uri to 3.1.9 and Zod to 4.6.7 without install scripts |
| Setup documents out of date | Docs described an undeployed site, missing inbox/domain/Instagram and five artist photos | Correct the handoff to the live configuration and four-photo slider |

## Verification

- Baseline: TypeScript, lint, 17 unit tests and seven rendered tests passed. The initial sandbox run needed a rerun with local-runtime permissions; it was not an application failure.
- Regression tests first demonstrated the audio and security-header defects against the old build.
- Expanded integration checks cover all seven audio files, exact range bytes, suffix/open-ended ranges, HEAD, unsatisfiable ranges, validators, cached revalidation, unsupported range fallback, security headers, public assets, metadata, 404s and unavailable-service behavior.
- Existing newsletter tests use isolated PGlite PostgreSQL and stub email. No real subscriber data or email sends are involved.
- Final full suite: TypeScript, ESLint, 17 unit tests, 17 integration tests and Cloudflare production build passed. A deliberate 206-to-200 mutation was caught by the range assertion.
- Built-site browser: TKL seekable range is `[0,30]`; forward skip reaches 10 seconds, reverse skip and slider work; tabbing out of the mobile menu closes it and restores scrolling. No horizontal overflow or broken loaded images at 390px/1440px; no console errors observed.
- Live browser baseline: automatic progression reached the next track; final NSG ended and stopped. Gallery open, next, zoom, Escape and return focus worked. No browser console errors were observed in those flows.

## Remaining limitations

Follow-up: the compatible TypeScript lint dependency was patched, reducing the toolchain report to 12 moderate entries; see [dependency evidence](DEPENDENCY-FOLLOWUP-2026-11-04.md). Newsletter database setup is complete, while sender authentication, runtime credentials, an approved policy and delivery testing remain pending. The figures below describe the initial audit release.

- Newsletter is intentionally disabled until Neon, authenticated outbound email, approved privacy policy and a real delivery test are supplied. Inbound enquiry forwarding does not provide outbound sending; DMARC currently rejects unauthenticated domain mail.
- Production dependencies: zero npm advisories. Full toolchain: 13 moderate entries, all tracing to the minimatch glob-amplification advisory in development lint dependencies. No high or critical findings remain. Older consumers require minimatch's callable v3 API; blindly forcing v11 or accepting npm's ESLint downgrade would break tooling. This code does not accept visitor-supplied glob patterns. Recheck when upstream compatible releases are available.
- CSP deliberately does not constrain scripts/styles yet; full nonce-based script enforcement needs framework and Cloudflare challenge compatibility validation.
- No physical iPhone/Safari, screen-reader, load/penetration test, field Core Web Vitals, real newsletter delivery or production backup restoration was performed.
- Preview range handling buffers only the seven small local clips (about 0.5 MB each). Move full-length/larger media to range-capable object storage rather than expanding this workaround. Audio requests now invoke the Worker and count toward its request allowance; other assets remain direct.
- Existing framework build notices about route classification and bundle splitting are non-fatal.

## Release and rollback

Publish the reviewed commit to the existing GitHub main branch, then verify Cloudflare marks that commit Ready at 100% traffic. Verify both domains, production headers and audio seeking after deployment. Previous production version `5a8fdde4` corresponds to commit `9098ee01ca4d3029bd125a97adac8e1b3244ce57`; use Cloudflare deployment rollback if the release regresses. No database migration is part of this release.

References: [Cloudflare static asset range limitation](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/), [static versus Worker headers](https://developers.cloudflare.com/workers/static-assets/headers/), [remaining development advisory](https://github.com/advisories/GHSA-g3hv-75wg-m249).
