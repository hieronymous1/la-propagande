# LA PROPAGANDE — old-web interaction pass

> Superseded by the user’s visual correction on 2026-10-23. The dedicated collage, masthead, toys and badge wall were rejected and removed. Preserve the existing LP setting and scatter found graphics through it. See `../../reports/reference-study-2026-10-23/notes.md`.

2026-10-23 · Research and code review; proposals, not implemented changes. Updated following the user's request to go substantially heavier and give the site real personality. The revised direction below supersedes the earlier restrained first-pass recommendation.

## Revised direction — THE INTERNET IS STILL ON FIRE

A pirate clothing distro's personal homepage circa 2001. Someone in Beirut has been updating it at 3am: flyers taped over windows, anarchy GIFs, a CRT that won't behave, links to things they care about, and a badge you can steal for your own site. The brand's actual images, slogans, city connection, and archive give it a point of view. Move from tidy status panels toward a deliberately vandalised interface.

Primary vibe becomes maximal-Y2K with cyber-terminal structure. The user's explicit request for a heavier treatment overrides the previous one-small-accent and two-motif limits. Several small animations can coexist in a contained home collage; let one dominate while others are slow/intermittent. Still honour reduced motion and effects-off.

### The home composition

- **Masthead:** the existing distressed wordmark, flame GIF underneath, a small waving anarchy flag, and a crooked `PARIS ↔ BEIRUT / WORLDWIDE INTERFERENCE` sticker. Give it a recognisable silhouette at first glance.
- **Left:** large store/blog/contact commands inside the terminal. Rough paper scraps and stickers cross a few panel seams; use real photography and campaign art rather than filling everything with generic operating-system labels.
- **Right:** `OPEN TABS` — a pinned, irregular collection of a flyer, the archive disk, tiny CRT, and a hand-lettered note. This replaces some simulated telemetry, keeping the useful archive and latest-post links.
- **Bottom:** a dense badge wall, barbed-wire rule, real visitor counter, `STEAL THIS BUTTON`, and a named selection of external cultural links. This is a destination with character, not an empty footer.
- **Mobile:** preserve the masthead collage and objects in an authored vertical order. Stickers stay inside their containers, with two overlapping seams at most per cluster. Essential navigation remains early and obvious.

### Signature interactions

| Object | Personality / actual response |
| --- | --- |
| **The watching eye** | Use the brand's existing eye/head artwork as the recurring character. On desktop its pupil chooses one of eight directions toward the pointer; an occasional blink. Click/tap closes it and reveals `I SAW NOTHING.` Click again wakes it. With effects off, it stays still and still toggles. No new unrelated cartoon mascot. |
| **The forbidden floppy** | A disk labelled `DO NOT OPEN` has `Open the archive` as its accessible name/description. It wobbles on hover/focus and opens the real archive immediately on activation. A brief `YOU WERE WARNED.` caption adds attitude without a permission puzzle. |
| **The vandalised sticker wall** | 8–12 deliberately composed stickers mixing found anarchy/fire/punk graphics and original LP slogans. Lift one corner on hover/focus, press flat on click. A few are links, a few toggle an alternate slogan; interactive ones have clear targets. Desktop can rearrange 3 designated loose stickers in a bounded board; click-to-move/touch controls and reset are required. |
| **STEAL THIS BUTTON** | An original 88×31 LP badge opens a tiny old-browser-style panel with a download link and copyable embed snippet. Copy changes to `PROPAGANDA COPIED` only on success. Let visitors actually carry the site's identity elsewhere. |
| **The broken television** | Clicking `CHANGE CHANNEL` advances the real photography feed with a short horizontal tear. `PAUSE`, `PREV`, and `NEXT` stay accessible. A brief `WRONG CHANNEL` card can be an optional interstitial, never a forced wait before content. |
| **The complaint department** | Contact appears as `COMPLAINTS / LOVE LETTERS / CONSPIRACIES` beside an animated envelope. Keep `Contact us` visible. Successful inquiry gets a wonky `RECEIVED IN BEIRUT` stamp only if that routing is true; otherwise `TRANSMISSION RECEIVED`. |
| **The random rabbit hole** | `TAKE ME SOMEWHERE WEIRD` selects an available archive record. Show its title and host in a small preview with `OPEN FILE`; avoid surprising users with an automatic external navigation. |
| **The desktop scrawl** | Handwritten-style scraps carry existing brand lines: `ANGER IS A GIFT`, `READ 1984!`, `ARE YOU BRAINWASHED YET?`. Clicking one flips between two designed faces or uncovers a real flyer behind it. No random motivational filler. |
| **The red button** | Optional extras-only `DO NOT PRESS` briefly stamps `YOU PRESSED IT.` across its own panel and releases a handful of pixel stars/skulls within that panel. Repeatable, bounded, cancellable, and motion-free when requested. Never obscures the page or triggers sound. |

### Personality rules

Use humour and culture in the objects, not an endless stream of fake diagnostics. Let the site have a few memorable repeated lines, authored placements, and discoverable responses. Intentionally mismatched found GIFs can retain their original colour; red/cream/black holds the composition together. Keep stock, price, size, availability, navigation, and form outcomes precise.

Motion vocabulary: fluttering flags, two-frame blinks, pixel sparks, paper-corner lifts, hard channel cuts, pressed bevels, and rubber-stamp impacts. Keep most responses within 100–240ms; decorations may loop slowly. Avoid identical hover lifts across every component. Each object should behave according to what it is.

### Heavier implementation sequence

1. Build the home masthead/collage, 8–12-sticker wall, badge download/embed panel, contextual cursor kit, and global effects control together. This establishes a visibly different identity immediately.
2. Add the watching eye, forbidden floppy, CRT channel controls, and archive restoration stamps. Fix the archive timer and keyboard dialog issues in the same pass.
3. Extend the visual language into contact receipts and footer link collections. Add sticker rearrangement and the red-button toy only after touch, keyboard, effects-off, and reset behaviours work.

The ambition is a homepage visitors can describe from memory: **the flaming LP logo, the suspicious disk, the eye that watches you, and the badge they stole.**

## Visual Direction

Push the existing cyber-terminal into a punk personal-web node: a machine maintained by people with opinions, collections, badges, and a sense of humour. Keep the black/red broadcast shell; bring in rough pixel graphics, crooked sticker clusters, and little objects with their own responses. The primary vibe is cyber-terminal with retro-widget accents. Use maximal-Y2K density in small authored clusters rather than rebuilding the entire interface.

Three possible approaches:

1. **Punk webzine inside the terminal — recommended.** Badge clusters, anarchy/flame accents, pixel cursors, mail and archive interactions. Closest to the existing brand and the requested references.
2. **Surplus-machine interface.** Radar, dog tags, serial labels, stamped receipts. Cohesive with the clothing, but less expressive of personal-web culture.
3. **Full desktop playground.** Draggable windows, sticker placement, collectible files, media controls. Stronger spectacle, but much larger interaction and mobile scope. Keep this for a later exploration.

## Typography Stack

Use the existing roles in app/globals.css: Dirty War for large commands, Army Rust for titles, Retro Computer for tiny interface labels, VHS Gothic for reading. Sticker artwork can have its own lettering, but do not add another site-wide font. Preserve actual running-code typography rather than reverting to the older two-font project brief.

## Layout Grammar

Retain the current console, archive index, transmission queue, and directory panels. Add one compact badge/sticker cluster near the home console and a matching cluster in the footer; the home currently omits the footer, so it needs its own placement. Keep artwork attached to panel edges, not floating over reading or shopping controls.

Desktop: layered but bounded clusters with slight fixed rotations. Tablet: place the cluster in the panel flow. Mobile: compact horizontal badge rail or a two-row wrap; no draggable clutter or pointer-dependent features. Keep 44px interactive hit areas even when artwork is 24–32px tall. Native 88×31 badge artwork can sit inside a larger button/link target.

## Motif Plan

Two systems: (1) sticker/badge graphics, (2) contextual pixel pointers. Keep one prominent animated decorative object in a viewport. Pause or quiet nearby existing ticker/REC/signal effects where necessary. This is a direction for new work, not a claim that the current site meets that budget.

| Priority | Object / location | Trigger → response | Suggested treatment |
| --- | --- | --- | --- |
| 1 | Pointer kit, global shell | Default arrow → pixel hand on links; crosshair on inspectable media; grab only on draggable objects | Native CSS cursors, 24–32px, explicit hotspots. Fine-pointer devices only. Preserve text caret and browser fallbacks. No JS trailing cursor. |
| 1 | Home / footer badge cluster | Focus/hover → raised border and tiny caption; click → real destination or copy embed snippet | Original 88×31 badges: `PAR ↔ BEY`, `INDEPENDENT SIGNAL`, `NO ALGORITHM`, `LINK TO LP`. Copy feedback only after clipboard success. |
| 1 | Home flame accent | A small flame strip under a sticker or beside a command; activates on interaction | One compact accent, not a fire border around the viewport. Keep authentic orange/yellow as a deliberate exception to red/black. Static default, bounded animation on interaction. |
| 1 | Archive repair | Click/Enter → short segmented scan → static `FILE RESTORED` stamp | Rough red/cream stamp. Show the file immediately; let the stamp finish independently. Cancel pending hover work on leave/unmount. |
| 2 | Contact / successful inquiry | Hover/focus → envelope opens; successful submit → `RECEIVED · PAR ↔ BEY` stamp | Only show received state after actual success. No pretend delivery animation for a mailto link. |
| 2 | Console status strip | Hover/focus a route → display its destination; leave → restore default | Browser-era status-bar personality with real route information. No typewriter delay on keyboard navigation. |
| 2 | Archive “random file” | Click → choose an available archive record and open its real destination | Label `RANDOM FILE` or `SURPRISE ME`; bypass locked entries. Real link alternative and predictable back navigation. |
| 2 | Photography / manifesto | Click labelled controls → change frame, pause/play, or replay | Tiny transport controls with strong pressed states. Useful Winamp-era behaviour; no pretend audio player. |
| 3 | Sticker desk / extras panel | Choose a sticker → place it in a bounded canvas; reset → restore layout | Separate optional playground. Provide click-to-place and keyboard alternatives before adding drag. Local persistence only if wanted. |

Use sharp pressed bevels and 1–2px steps, small caption swaps, and short two/three-frame bursts. Start with 100–160ms press feedback and 160–240ms stepped reveals. Avoid adding route delays. Existing step-based movement is intentional; do not replace it with generic springs throughout the site.

## Asset search and shortlist

References: [Nekoweb gallery](https://nekoweb.org/explore?page=1&sort=follows&by=name&q=), [GifCities](https://gifcities.org/). The two links after GifCities in the original request are excluded at the user's request.

Nekoweb gallery was readable through Jina Reader after the direct web fetch returned 403. GifCities was usable in the browser despite rate limiting in text fetches. Search results were inspected visually for anarchy, flames, punk, military, terminal, and barbed wire. Additional searches covered fire, radar, dog tags, and email; those latter results are exploratory, not visually approved picks. Local screenshots are in references/.

| Candidate | Direct asset | Size | Proposed use / review |
| --- | --- | --- | --- |
| Red anarchy symbol | [GIF](https://blob.gifcities.org/gifcities/4VUKQSRTKQEN27VQUOWHAV3YBMTJW4O5.gif) | 58×58 | Strong candidate for a small sticker by the console. |
| Black anarchy flag | [GIF](https://blob.gifcities.org/gifcities/A3OYAM65L3ZQWJTYQ5OFQZ6CGDLGGE7Z.gif) | 75×50 | A compact flag fits a node identity cluster. |
| Flame strip | [GIF](https://blob.gifcities.org/gifcities/4GWM5R7ZEIYA5M7TH7HPQOCFVC67JUFL.gif) | 600×82 | Crop/display within one small area; inspect timing before shipping. |
| Small isolated flame | [GIF](https://blob.gifcities.org/gifcities/OCYUQHJ6HX4W7CKTTIZWBJMANUGKUFER.gif) | 48×78 | Better small-object scale than a full-width divider. |
| Red punk lettering | [GIF](https://blob.gifcities.org/gifcities/JUR5HG5YIA3I4BAMUMWWUVUZ62QNJ4XG.gif) | 123×53 | Visually compatible lettering; secondary candidate. |
| Tiny CRT terminal | [GIF](https://blob.gifcities.org/gifcities/VF2VZB5IUKUJS5ACDMYZXO2KHWEFLIYZ.gif) | 50×39 | Suitable next to command/help; keep action clearly labelled. |
| Barbed-wire divider | [GIF](https://blob.gifcities.org/gifcities/2NRRURK6MOORB3MLOVOOSGKOMKS5EHA7.gif) | 614×40 | Candidate for archive or footer separator, not every panel. |

Each asset's archived source page can be reached from its GifCities result. Keep provenance with selected downloads. Archive availability does not establish reuse permission. These are research candidates, not production-cleared assets. For LP slogans and branding, original pixel badges are the stronger fit.

Search links:

- [fire](https://gifcities.org/search?q=fire&offset=0&page_size=20), [flames](https://gifcities.org/search?q=flames&offset=0&page_size=20), [anarchy](https://gifcities.org/search?q=anarchy&offset=0&page_size=20)
- [punk](https://gifcities.org/search?q=punk&offset=0&page_size=20), [military](https://gifcities.org/search?q=military&offset=0&page_size=20), [terminal](https://gifcities.org/search?q=terminal&offset=0&page_size=20)
- [barbed wire](https://gifcities.org/search?q=barbed%20wire&offset=0&page_size=20), [radar](https://gifcities.org/search?q=radar&offset=0&page_size=20), [email](https://gifcities.org/search?q=email&offset=0&page_size=20)

Broad military results contain many unrelated patriotic/relationship banners. Prefer narrower searches such as camouflage, surplus, radar, stencil, dogtag, radio, satellite. Filename matching is noisy; check the actual artwork rather than assuming a search hit matches its keyword.

## Existing interaction findings

Confirmed against current working files, including the user's uncommitted changes. Code findings are static analysis; browser feel and mobile behaviour were not comprehensively tested. Production home was inspected, but may differ from working changes. localhost:3000 belongs to another project and was not used for this site's validation.

| Priority | Location | Finding | Action |
| --- | --- | --- | --- |
| High | components/archive/ArchivePageClient.tsx:267 | Each mouse enter schedules a restore in 700ms without cancellation on leave. Passing over records triggers restores later. | Use cancellable per-entry work; preserve immediate activation by click/keyboard. |
| High | components/archive/ArchivePageClient.tsx:362 | Locked-file dialog mounts without focus transfer, focus containment, Escape handling, or restoring focus. | Establish keyboard continuity before adding more theatre to the dialog. |
| Medium | app/globals.css:1678; components/product/ProductDetail.tsx:261,348–350,382 | Explicit reduced-motion coverage misses swatch lift, notes movement, and mobile buy-bar travel. | Add targeted reduced-motion variants that keep selected states visible. |
| Medium | components/home/LandingOS.tsx:209 onward | Background video autoplays/loops; CSS reduced-motion rules do not pause video. | Use the poster when reduced motion is requested; provide an effects control. |
| Medium | components/home/LandingOS.tsx:63–77; app/globals.css:1278 | Feed and ticker pause on pointer hover only; no explicit user pause control. | Add an accessible effects/pause control before adding looping GIFs. |
| Low | app/globals.css:649 | Button sheen movement remains active because the reduced-motion rules target the button, not its pseudo-element. | Include the sheen in reduced-motion handling. |

The most valuable new feedback moments are archive restoration and successful contact/custom submissions. The current repair overlay simply disappears; the custom inquiry success state is a generic panel. Both can gain personality without slowing normal navigation.

## Do-Not-Cross Rules

- Keep the site's red/black, military/pixel, pirate-broadcast identity. Use found graphics selectively and original LP artwork for the badge family.
- Preserve navigation, form labels, product information, focus outlines, and mobile target sizes.
- Put playful discovery in archive/media/extras; keep shopping and contact actions direct.
- Never fabricate visitor totals, checkout progress, form success, live status, or a functioning webring.
- Use a static alternative for every animated asset. GIF playback cannot be paused with CSS animation-play-state: swap animated/static sources or use controllable short video for effects.
- Honour reduced motion initially and when it changes. An explicit effects toggle should stop new decorative loops and existing ambient motion together.
- No trails on every mouse move, full-screen flashes, mandatory boot waits, or sound without a user action.
- Load shortlisted assets locally only after selection and provenance/reuse review; reserve dimensions and lazy-load noncritical artwork.

## Recommended first implementation scope

Pixel cursor kit + original 88×31 badge cluster + one flame accent + archive restoration stamp. Include the archive timer fix and shared effects/reduced-motion handling in that scope. Follow with the envelope receipt and media transport controls. Keep draggable windows and a sticker playground for a separately scoped iteration.

Validation for implementation: desktop hover and keyboard, touch at 390px and tablet width, rapid pointer entry/exit, repeated clicks, route changes during effects, live reduced-motion changes, effects off, failed submissions, asset failure, and focus return from overlays. No implementation or test suite changes were made in this review.
