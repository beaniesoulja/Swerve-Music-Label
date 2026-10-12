# Homepage fact check and restrained redesign

Checked 12 October 2026. This is a focused editorial check, not a complete artist biography or event investigation. Changes are local and have not been published.

## Verified corrections

- **TKL** credits Beanie Soulja featuring Easyscope. Apple Music lists it as a 2026 release. Added Easyscope and used the evergreen label “Featured release.” [Artist catalogue](https://music.apple.com/us/artist/beanie-soulja/1547405349)
- **FOWOSERE** is credited to DREAMSVIEWNG featuring Dapson Ahmir and Beanie Soulja, released 7 June 2024. Corrected the credit and release link. [Release page](https://music.apple.com/ng/album/fowosere-feat-dapson-ahmir-beanie-soulja-single/1749770814)
- **NSG** retains 2023: the specific release page gives 24 November 2023, although the artist summary displayed a conflicting 2021 label. The specific release metadata takes precedence here. [Release page](https://music.apple.com/us/album/nsg-feat-odumodublvck-single/1716482811)
- The artist catalogue supports the displayed years and collaborators for THE MOTTO, Capsize, Burst Down and PSYCHO. The seven files on this site are described as selected 30-second previews, not a complete discography. Removed unverified full-song durations.

## Awaiting owner confirmation

The quick check did not corroborate the original church-choir/influences biography, event organizer and sponsor details, performer list, unattributed quotation, or the ₦5 million gaming-prize claim. These are omitted from the revised homepage, not declared false. Previous copy remains recoverable in Git.

The event name and OhOhBeeHive/Akure venue are retained as supplied archive metadata, not independently verified facts. Please provide an approved biography and an event announcement or organizer source before restoring detailed claims.

Contact addresses, booking availability, newsletter credentials and policy configuration remain owner setup requirements. Existing readiness gates are preserved; the page does not pretend these services are available.

## Design changes

Kept the purple/cream identity, existing artwork, artist photographs, all seven previews and the 186-image event archive. Simplified the hero, typography, spacing, navigation and contact sections; replaced the music coverflow with a flat selectable track list; removed the ticker and repeated promotional sections. React guidance informed the native-button controls and preservation of player preferences when switching tracks.

## Validation performed

- TypeScript check passed.
- Eight unit tests and six production-render tests passed.
- Production Worker build passed, including checks for 226 static assets.
- Git whitespace check passed.
- Browser checks covered 320px and 390px mobile layouts, desktop layout, mobile menu opening and resize cleanup, track selection and muted audio playback, and gallery opening and Escape dismissal.
- No production deployment, GitHub push, real email delivery or production database write was performed. These checks do not certify live launch readiness.
