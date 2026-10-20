# Media — Bitcoin Cash Explainer Trifold

## `media/bch/` — Official Bitcoin Cash assets
Free for display in online services, retail, press, or promotional purposes (per bitcoincash.org).

Sources:
- https://bitcoincash.org/graphics/
  - `bch-logo-horizontal.svg` — BCH Logo Primary
  - `bch-logo-horizontal-wt.svg` — white text variant
  - `bch-logo-horizontal-fullwt.svg` — full-white variant
  - `bch-circle.svg` — BCH Logo Mark
  - `bch-accepted-here-gt.svg` / `-wt.svg` / `-frame.svg` — Merchant buttons
  - `Bitcoin-Cash-Logos.zip` — full official bundle
- https://bch.info/en/media
  - `bchinfo-logo-horizontal.svg`, `bchinfo-logo-horizontal-2020.svg`
  - `bchinfo-logos.zip` + orange pack
- More (not yet downloaded, all free promo use):
  - https://whybitcoincash.com/resources — B logo, Accepted Here badges, social assets, 2MB press kit
  - https://minisatoshi.cash/resources — branding / informational / fun graphics, stickers, memes

Brand colors:
- Green #0AC18E (Pantone 3395 C) — primary
- Dark #0F1820 / Grey #4D4D4D / White #FFFFFF
- Font: Ubuntu Bold / Bold Italic (Google Fonts)

## `media/characters/` — Free open-source character art (CC0, commercial OK, no attribution required)

Downloaded samples for print + web:
- `peep-10.svg` (Paper body / Awe face — danger panel, concerned but friendly), `peep-standing-5.svg`, `peep-standing-1.svg`, `peep-standing-22.svg`, `peep-sitting-1.svg`, `peep-49.svg`, `peep-73.svg`
- Removed: `peep-worried-16.svg`, `peep-89.svg` — used `body/Killer` variant, too morbid for marketing tone.
- Source: Open Peeps by Pablo Stanley — https://www.openpeeps.com/ — CC0 1.0
- Full library: Sketch / Figma / XD / Studio + flat SVG + PNG, 584k+ mix-and-match combos (hair, face, body, pose)

Recommended packs to make the trifold “come alive”:

1. **Open Peeps (CC0) — BEST FOR PRINT TRIFOLD**
   - Hand-drawn, print-friendly SVG/PNG, Blush integration: https://blush.design/collections/open-peeps
   - Use static in print, add CSS float/bob in HTML for digital “alive” feel (already wired in `trifold.html`).

2. **Humaaans (CC0, Pablo Stanley) — BEST MIX-AND-MATCH**
   - https://www.humaaans.com/ — modular people, same license as Open Peeps.

3. **Pixabots (free commercial, 2,000 animated GIF + WebP + PNG)**
   - https://pablostanley.gumroad.com/l/pixabots — bouncing pixel characters, great for web/QR landing page.
   - Open source: https://github.com/pablostanley/pixabots — npm `@pixabots/core`, CLI `npx pixabots`.

4. **Animated sprite packs (CC0, for web/interactive version — not print):**
   - Sprited 77 chibi characters, greet/idle/run WebP + PNG spritesheets + JSON: https://kndlt.itch.io/spritedx-character-sprites
   - RGS_Dev modular animated vector characters (idle/walk/jump/hit): https://rgsdev.itch.io/free-cc0-modular-animated-vector-characters-2d
   - Gobkit 8 rigged low-poly GLB (idle/attack/dead, Three.js/Unity/Godot): https://gobkit.itch.io/gobkit-free-minions
   - KayKit Adventurers (4 rigged chars, 75 anims, FBX/GLTF): https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0

5. **Lottie (for HTML animation without heavy video):**
   - https://lottiefiles.com/featured-free-animations — free JSON animations, e.g. walking on ice / safe / wallet. Embed via `<lottie-player>`.

Notes:
- Print = use Open Peeps / Humaaans SVG (crisp at 300dpi). Animation = screen-only CSS in `trifold.html` (`@media print` disables it).
- Licenses stored here: BCH = promo-use allowed, Characters = CC0. No redistribution of paid packs.
