# Peak Fiction v2 — "The Field Journal"

The site is two brothers' illustrated reading journal: warm paper, ink linework,
confident editorial type, and one accent colour per tier. It should feel hand-made and
personal, like a well-kept Moleskine, not like a SaaS dashboard or a neon arcade.

## Principles
1. **Paper and ink first.** Backgrounds are paper tones; almost everything else is ink.
   Colour is reserved for meaning (tiers, the two brothers), never decoration.
2. **Editorial hierarchy.** Big Fraunces headlines, generous whitespace, clear reading
   width (~68ch for prose). One idea per section.
3. **Hand-drawn accents, used sparingly.** Caveat "margin notes", dashed ink trails,
   hatching, stamps. At most one or two per screen.
4. **Posters are the colour.** Cover art carries the visual energy; the chrome stays quiet.
5. **Clear over clever.** Labels say what things are ("All stories", not "The Vault").
6. **Every page works on a phone** (≥360px) and respects `prefers-reduced-motion`.

## Tokens (all in `styles/tokens.css`; never hard-code hex values in components)
- Paper: `--paper` (page), `--paper-2` (raised/cards), `--paper-3` (sunken/inputs), `--rule` (hairlines)
- Ink: `--ink` (text), `--ink-2` (secondary), `--ink-3` (muted/meta)
- Tiers: `--tier-peak`, `--tier-s`, `--tier-a`, `--tier-b`, `--tier-c`, `--tier-d`, `--tier-e`, `--tier-f`,
  `--tier-pending`. Each also has a `-wash` variant (≈10% tint) for backgrounds.
- People: `--pratyush` (blue ink), `--kanav` (orange ink), plus `-wash` variants.
- Type: `--font-display` (Fraunces), `--font-body` (Instrument Sans), `--font-hand` (Caveat).
- Scale: `--step--1` … `--step-5` (fluid type), spacing `--space-1` (4px) … `--space-10` (128px).
- Radius: `--radius-sm` 4px (posters), `--radius` 8px (cards), `--radius-lg` 14px (panels), `--radius-pill`.
- Shadows: `--shadow-1` (resting card), `--shadow-2` (hover/raised), `--shadow-poster`.
- Motion: `--ease-out`, `--dur-1` 150ms, `--dur-2` 300ms, `--dur-3` 600ms.

## Type
- Display headings: Fraunces, weight 500–650, `font-variation-settings: "SOFT" 50, "opsz" 144`
  at large sizes, tight tracking (-0.02em). Italic Fraunces for emphasis words.
- Body/UI: Instrument Sans 400/500/600. Numbers use `font-variant-numeric: tabular-nums`.
- Eyebrow/labels: Instrument Sans 600, uppercase, `letter-spacing: 0.08em`, `--step--1`, `--ink-3`.
- Handwritten notes: Caveat 500, `--step-1`, slight rotation (-1.5deg to 2deg), ink colour or a person colour.

## Shared components (`src/v2/components/`), reuse these, don't re-invent them
- `TierBadge` — ink stamp with the tier letter. Props: `rank` (raw string), `size` ('sm'|'md'|'lg').
- `RatingPair` — both brothers' badges with initials. Props: `story`, `size`, `layout` ('row'|'stack').
- `PosterCard` — poster + title + meta + RatingPair; links to the story page. Props: `story`, `size`, `showMeta`.
- `Poster` — the image with local→remote→title-card fallback (re-exported from `src/components/Poster.jsx`).
- `PageHeader` — eyebrow, title, optional lede and margin note. Props: `eyebrow`, `title`, `lede`, `note`.
- `MarginNote` — Caveat annotation. Props: `children`, `who` ('pratyush'|'kanav'|undefined), `rotate`.
- `ContactForm` — "message me" form (Web3Forms or email fallback). Props: `storyName`, `prompt`.
- `Link` — internal hash link. Props: `to` (e.g. `/stories`, `/story/<slug>`), `className`, `children`.

## Data (`src/v2/lib/`)
- `stories`, `topStories` come from `src/lib/data.js` (already normalised: `slug`, `medium[]`,
  `genre[]`, `hoursNum`, `rankingPratyush`, `rankingKanav`, `commentsPratyush`, `commentsKanav`,
  `favoriteCharacters`, `poster`, `imageUrl`, `length`; top stories also have `rank`).
- Tier helpers: `src/lib/tiers.js` (`parseRank`, `tierKey`, `tierScore`, `tierLabel`, `TIER_KEYS`, ...).
- v2 helpers: `src/v2/lib/storyMath.js` (`bestScore`, `bestTier`, `averageScore`, `disagreement`,
  `bothRated`) and `src/v2/lib/tierMeta.js` (tier names, one-line descriptions, CSS var names).

## Routes (hash-based, see `src/v2/App.jsx`)
`#/` About · `#/peak` the top-25 mountain · `#/stories` all stories · `#/charts` the numbers ·
`#/story/<slug>` a single story. Old `#/stories/<slug>` links redirect to `#/story/<slug>`.

## Don'ts
- No glassmorphism, neon glows, gradient text, or emoji as icons (lucide-react icons are fine).
- No `zoom`, no `!important`, no inline hex colours.
- Don't import anything from the old design's CSS (`src/index.css`, `src/mountain.css`, `src/about.css`).
- Don't edit files outside your assigned page unless told to; ask the lead instead.
