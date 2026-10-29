# Old-web personality pass — implemented

> Superseded by the user’s visual correction on 2026-10-23. The dedicated collage, masthead, toys and badge wall were rejected and removed. Preserve the existing LP setting and scatter found graphics through it. See `../../reports/reference-study-2026-10-23/notes.md`.

The user approved the heavier direction and explicitly requested implementation. Local work only; no deployment or commit.

## What changed

- Flaming pirate masthead, waving anarchy flag and original city postmark.
- Sticker collage made from the brand's head artwork, paper scraps, slogans and a custom-jacket surplus tag. Three stickers support bounded mouse dragging or click/keyboard/touch repositioning, with a reset.
- The brand eye follows the pointer in eight directions, blinks, and closes/wakes on activation.
- Forbidden floppy opens the archive through its existing terminal entry path.
- Real photography controls in a crooked CRT frame: previous, next and persistent pause.
- Flip note, contact-envelope sticker, red-button toy and random archive preview with an explicit external-file link.
- Original downloadable 88×31 LP badge, embed code, truthful clipboard success/failure feedback and native modal focus handling.
- Native pixel arrow, hand and inspection cursors, plus draggable-sticker grab feedback.
- Home/footer badge walls and actual links to Nekoweb, GifCities and Internet Archive.
- Contact correspondence header and stamped successful inquiry/contribution states. Captured the form element before async submission so resetting does not dereference React's cleared currentTarget.
- Persistent effects preference with live reduced-motion handling. Found GIFs swap to first-frame PNGs; ambient video pauses and receives a still alternative; the canvas manifesto becomes static artwork/text. Shared CSS also stops pre-existing ticker/blink/travel effects.
- Archive restoration hover work cancels when the pointer leaves; restored media gets a stamp. Locked-file dialog now uses native modal focus containment and Escape behaviour.
- Existing directory/session panels moved to the left column for a more balanced desktop composition. Product counts remain real data; removed the simulated scrolling log panel in favour of the sticker wall.

## Files and assets

New components: `components/home/PirateObjects.tsx`, `components/system/EffectsProvider.tsx`, `components/system/RetroDialog.tsx`.

Primary integrations: `components/home/LandingOS.tsx`, `components/layout/GlobalShell.tsx`, `components/layout/Footer.tsx`, `components/home/ManifestoBroadcast.tsx`, `app/globals.css`, archive/contact/custom inquiry components.

Found graphics are local in `public/images/old-web/`, with first-frame PNG alternatives and provenance in `SOURCES.md`. Original cursor SVGs are in `public/cursors/`. No extra animation library was installed. The 21st catalog search returned HTTP 401; project primitives and the supplied references were used. The local 21st review ran and matching palette literals in the new styles were changed to existing tokens; paper/hardware accents remain intentional.

## Validation

- ESLint and TypeScript checks pass.
- Backend suite: 22 passed.
- Browser suite: 36 cases covered. Initial run: 29 passed; seven affected checks passed on focused rerun after tightening ambiguous logo/menu selectors and updating the existing home strapline assertion. Four new cases cover effects persistence/live reduced motion, clipboard/download/dialog focus, touch controls and archive entry.
- Production build passes; final build repeated after the last external-link addition.
- Browser screenshots inspected at desktop and 390px; overflow checks covered 320, 375, 390, 414, 768, 1024 and 1440px.
- Existing localhost visitor-counter request returns 403 from its origin guard; no fabricated count is rendered and that API was not changed.

No unrelated pre-existing working-tree changes were reverted. Deployment still requires the product's existing review/client approval process.
