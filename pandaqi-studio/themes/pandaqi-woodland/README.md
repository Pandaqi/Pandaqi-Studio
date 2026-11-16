# Pandaqi Woodland

A second, independent theme for Pandaqi Games: the same content, URLs, taxonomies,
navigation, generators and pages as `themes/pandaqi`, dressed as a cosy woodland
playroom — painted paper, wobbly cut-out buttons, leafy corners and a proper
search page.

It is the theme the project config selects (`theme = "pandaqi-woodland"`). The
previous theme is still in `themes/pandaqi` and can be built at any time with
`hugo --theme pandaqi`.

```bash
# from pandaqi-studio/
hugo --gc --minify                             # builds with the selected theme
bun ../misc/serve-static.ts public 4321        # then open http://localhost:4321
```

A full cold build writes ~1008 pages and ~732 processed images. Warm rebuilds
take roughly 25 s.

## What the theme covers

Every template the old theme renders, restyled without changing the contract:

| Page | Template | Notes |
| --- | --- | --- |
| Home | `layouts/home.html` | Hero painting, branches, latest project, catalogue |
| Project | `layouts/project/list.html` | Masked banner, action panel, metadata, gallery rail, prose |
| Category, tag, any term | `taxonomy.html`, `term.html` | Same cards, toolbar, pagination |
| Search | `layouts/search/list.html` | New page, see below |
| Rulebooks, generic pages | `single.html` | Prose with leaf heading markers |
| Board / video game helpers, tools | `board/`, `game/`, `tool/` | Untouched markup, inherited styling |
| 404 | `404.html` | Panda, discovery links, signpost |

The old theme's generators, shortcodes, embedded games, downloads, galleries and
rulebook rendering are reused as they are; this theme replaces the shell, the
card/gallery presentation and the decorations.

## Decorations

All decoration comes from the supplied `pandaqi-ui-assets` set, placed by context
instead of a fixed background layer:

| Asset | Where | Size |
| --- | --- | --- |
| `corner-branch-left/right` | On the header, flush against the page's top-left and top-right corners | 5.6–6.4 rem |
| `sprig-right`, `sprig-two-leaves`, `tiny-sprig` | In front of headings (h1–h2, h3, h4+), section heads and the homepage divider | 2.15, 1.3, 2.6 rem |
| `meeple-purple`, `meeple-yellow` | Page-head scatter, homepage hero, project artwork, footer band | 1.7–3 rem |
| `mushroom`, `acorn`, `cards` | Page-head scatter, homepage hero, project artwork, footer band | 1.7–3.1 rem |
| `flower-cream`, `flower-purple`, `flower-yellow` | Page-head scatter and footer band | 1.7–3.4 rem |
| `footer-garden-left/right` | Footer bottom corners, in their own band | 19 vw |
| `panda-icon` | 404 only | 6–8.5 rem |
| `signpost` | 404 discovery link | 2.8 rem |
| `dice` | Search “no results” empty state | 7.5 rem |

The small props (meeples, mushroom, acorn, cards, flowers) are placed by
`_partials/woodland/scatter.html`. Every page head (sections, taxonomy indexes,
terms, search) and every project page picks its own pair or single prop from a
seed derived from the page URL, so a page always shows the same little tableau
while the site as a whole shows all of them. The footer carries a fixed row of
five props in the empty band above the gardens, and the homepage has a meeple
and a mushroom sitting on the edge of the painted clearing.

Sparkles are the one drawn element: `_partials/woodland/spark.html` renders the
sprite's star, which slowly fades and turns (`pq-twinkle`, 6.5 s, staggered
per instance). It appears beside the hero eyebrow, beside each section heading
and at the end of every page title — the same mark in the same motion, not an
assortment of stickers. Under `prefers-reduced-motion` it is static.

Rules the layer follows:

- Decorative images are `aria-hidden`, empty-`alt`, `pointer-events: none`, and
  never placed over a control. Narrow screens shrink or hide the large corner
  pieces (branches ≤ 72 rem, gardens ≤ 64 rem, 404 art scales down); wide screens
  let the branches bleed off the outer edge.
- Everything is switched off together with `params.woodland.decor = false` —
  including the sparks and the emphasis strokes, through
  `_partials/woodland/decor-image.html` and the `isset` checks inside `spark.html`
  and `emphasis.html`.
- PNGs are never scaled up in the browser: `_partials/woodland/ui.html` runs each
  one through Hugo's image pipeline to a webp at its delivered width, so the whole
  decorative layer stays small instead of shipping the multi-megabyte source set.
- The corner branches and gardens are clean cut-outs on transparency, so they sit
  on the light and the dark header and footer without a pale patch behind them.

The shared banner, button, divider and emphasis shapes live in
`static/theme/woodland/*.svg` and are used as CSS masks or inline SVG, so they
follow the theme tokens in both colour modes and stay crisp:

- `banner-mask.svg` cuts the painted homepage hero out of its sheet; game banners
  themselves run full-bleed and land in the page through a neutral colour fade.
- `button-cutout-01…06.svg` are the six button silhouettes behind the label
  (`::before`), tinted with `--pq-btn-*` tokens per variant.
- The wobbly section transition and the yellow emphasis strokes are drawn inline,
  so they follow `--pq-sparkle` and the current colour mode.

## Search and filters

`/search/` is a real page built by this theme (`content/search/_index.md` is the
one content file it adds; its sitemap entry is disabled because the page is a
tool, not content).

- Hugo inlines a JSON index of every project — title, URL, blurb, categories,
  genres, platform, player count, playtime, difficulty, thumb, date. No second
  request, no third-party service.
- `assets/js/woodland/theme.ts` filters that index client-side and builds the
  facet list from the data actually present, with counts per value:
  **Category**, **Genre**, **Platform**, **Players**, **Difficulty**.
- On wide screens the facets sit in a left column beside the results, so the
  filter list can never push the matches below the fold; below 68 rem the two
  stack.
- Because those facets are long on a phone, any change raises a fixed “Show N
  results” pill that scrolls to `#pq-results`; it disappears once the results are
  on screen.
- State lives in the URL (`?q=...&difficulty=simple`), so a filtered view can be
  shared or reloaded. “Clear all filters” resets query, facets and URL.
- The count line is an `aria-live` region.
- With JavaScript off the page lists every project as plain links
  (`.pq-nojs-list`); with JavaScript on that list is hidden and the filter runs
  over the whole catalogue.
- Empty searches show the dice illustration, a sentence and a clear button rather
  than a dead end.

## Configuration

All options are optional and live under `params.woodland` in the project config.

```toml
[params.woodland]
  logo = "favicon"     # "favicon" (default) | "mark" | "panda" | "none"
  hero = "clearing"    # "clearing" | "hillside"
  decor = true         # false removes every decoration
```

- **`logo`** — the mark beside the wordmark, in header *and* footer (both use
  `_partials/woodland/logo-mark.html`). `favicon` (the default, and what the site
  ships today) is the original `/theme/favicon.png`, `mark` the panda cut from the
  mockup, `panda` the drawn SVG head, `none` the wordmark alone.
- **`hero`** — the homepage painting. `clearing` is the wide clearing, `hillside`
  the taller hillside (also used as the card fallback when a collection has no
  banner). Both ship, so switching is one line.
- **`decor`** — `false` removes branches, gardens, sprigs, sparkles, emphasis and
  the divider.

## Artwork

Two pipelines, both checked into the theme:

1. **Supplied UI assets** (`pandaqi-woodland-new-theme/references/pandaqi-ui-assets`)
   are copied into `assets/theme/woodland/ui/` and served through
   `woodland/ui.html`, which resizes to the delivered width and converts to webp.
   No PNG is shipped as-is.
2. **Painted artwork** — the two hero paintings and the panda mark — comes from
   the original mockups via `misc/cutout.ps1` (repository root):

   | File | Source region (6144×4096 sheet) | Use |
   | --- | --- | --- |
   | `art/panda-mark.png` | 208, 40, 152×128 | `logo = "mark"` |
   | `art/hero-clearing.jpg` | light sheet, 109, 188, 2070×594 | `hero = "clearing"` |
   | `art/hero-hillside.jpg` | 1488, 200, 840×552 | `hero = "hillside"`, card fallback |

   The script estimates the paper colour from the border, flood-fills inwards,
   gives the boundary a soft alpha, decontaminates the edge (`C = a·F + (1−a)·B`)
   and can erode a pixel to drop the painted rim:

   ```powershell
   powershell -File misc/cutout.ps1 -In ref.png -Out art.png `
     -X 208 -Y 40 -W 152 -H 128 -Tolerance 40 -Erode 1
   ```

Image variants stay minimal: banners at `1200` (`slice`), cards at `480`. That is
what keeps the processed-image count at ~732.

## Assets and shared code

Game code and site-wide files are **not** part of this theme. Shared `assets/` and
`static/` live at the project root; `themes/pandaqi-woodland/assets` holds this
theme's SCSS, its TypeScript entry point and the UI illustrations, and
`static/theme/woodland` its masks, sprite and painted art. The old theme's
layouts are unchanged; its game assets and static files moved to the shared
project folders so both themes build from the same source.

```
themes/pandaqi-woodland/
  assets/sass/woodland.scss        entry: tokens, base, utilities, components, layouts, organic
  assets/sass/_organic.scss        the woodland layer (14 numbered sections)
  assets/js/woodland/theme.ts      colour mode, menu, random project, sort, rail, search
  assets/theme/woodland/ui/*.png   supplied illustrations (processed to webp at build)
  layouts/                         shells, cards, navigation, search, gallery override
  static/theme/woodland/           sprite.svg, banner/button/divider masks, art/
```

The stylesheet is linked directly (`<link rel="stylesheet">`), not preloaded with
an `onload` swap: the async version flashed an unstyled page on every navigation.

## Verification

- `hugo` (theme `pandaqi-woodland`) exits 0 with no warnings: 1008 pages,
  233 paginator pages, 732 processed images, warm rebuild ~25 s.
- Old theme build: `hugo --theme pandaqi` exits 0 with 1008 pages as well.
- Rulebook example images resolve to absolute page-bundle URLs, so the same
  artwork loads at both `/rules/` and `/rules`; action buttons link to the
  trailing-slash URL (`…/rules/`, `…/game/`, `…/board/`).
- Homepage, project, category, tag, search and 404 pages rendered at 1440 px and
  390 px in light and dark.
- Config toggles tested by temporarily adding `[params.woodland]` to the project
  config: `hero = "hillside"`, `logo = "panda"` and `decor = false` all changed
  the built HTML as expected, then the config was restored.
- Search: 128 entries, 5 facet groups, 56 options, URL state, live count, the
  “Show N results” pill, and the empty state.
- Search field icon measured centred (Δ 0 px) after the screen-reader-only label
  was fixed.
- Rail previous/next no longer move on hover.
- All images on a project page load (22/22 with `naturalWidth > 0`).

Known limitations:

- `/search/` exists only in this theme; the old theme renders that URL as its
  generic list page.
- Search indexes titles, blurbs and taxonomy values, not rulebook body text.
- The painted assets are crops of mockups, sharp at the sizes used here but not
  vector.
- The `png/` set is a generated reinterpretation of the mockups, so a few crops
  differ slightly from the original illustrations.
