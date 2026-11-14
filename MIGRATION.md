# MIGRATION — V1 → V2 recovery, audit and test harness

> **Status:** what is left is §3.4 (remaining defects), §3.7 (what the audit found) and §8 (phases). Library changes are made in place in `lib/pq-games` and `lib/pq-rulebook`.
> **Companion to:** `ROADMAP.md` (human checklist). This file is the engineering plan: what is broken, what "working" means, how to test it, in what order, and how to make the build fast enough to work with.
> **Scope:** `pandaqi-studio/` only. `pandaqi-studio-dev/` is out of scope.

---

## 0. How to use this document

Read §1 and §2 first; everything later refers to them.

| Section | You get |
|---|---|
| §1 | Verified facts: pages, bundles, rulebooks, generators, the three V1→V2 default changes. |
| §2 | The contract: numbered, testable requirements — the definition of "working". |
| §3 | Audit baseline: every page, its state, all confirmed defects. |
| §4 | **Build speed** — measured numbers and the iteration workflow (read this before touching a game). |
| §5 | Harness implementation spec. |
| §6 | Repair recipes. |
| §7 | Recommendations to stop this recurring. |
| §8 | Phase plan with exit criteria. |
| §9 | Appendices (failure codes, out of scope, glossary). |

**Rules for the implementer**

1. Library changes (`lib/pq-games`, `lib/pq-rulebook`) are fine, in place. `ROADMAP.md` states they go to their own repos first, but that is slow and not practical for this migration work. Copy the updates to the other repos yourself afterwards. Library defects are marked **[LIB]** with the owning repo.
2. Never weaken a test to make it pass. If a test is wrong, fix it and say why in the commit.
3. Work in the order of §8; do not start a phase before the previous exit criterion is met.
4. A missing decision here is a bug in this document: stop and ask instead of guessing.
5. **This document only describes what is still open.** When a defect, recipe, recommendation or phase is finished, delete it in the same commit. No "done", "implemented" or "we already did this" sections stay behind.

**Machine rules (they exist because two of these checks crashed a computer twice)**

1. **Never run two heavy things at once.** A build, an audit and `bun run perf` all take `audit-artifacts/.audit.lock` and refuse to start while another holds it (exit 4). Do not delete the lock to force it.
2. **Never edit templates, layouts, assets or content while Hugo is building**, and never leave a `hugo server` running outside the deliberate dev workflow. Hugo reads the files, then renders; an edit in between gives half-old output and errors that are not in your code.
3. **Leave the expensive checks for the very end** of a session — full build, audit, `bun run perf`. While working, use the one-project dev server (§4.1) and a filtered audit; never start a full sweep between edits.
4. **Dev/audit builds use `audit/lean.toml`** (`--config config.toml,audit/lean.toml`). It leaves out `static/blog/` and `static/tutorials/` (separate subdomains, 2 761 of the 2 811 static files), which is the difference between a 5 s and a 120 s build and between 1 MB and 149 MB of output.

---

## 1. Ground truth (verified against the code)

### 1.1 Folder map

```
pandaqi-studio/                     ← Hugo project (git root is one level up)
  config.toml                       ← site params: enableGameJS / enableBoardJS / enableRulesJS
  content/<project>/**              ← pages + per-project assets, side by side
  themes/pandaqi/layouts/           ← game|board|rules|tool single/list + _partials
    _partials/func/load-assets.html ← the page↔code mapping (1.2)
  themes/pandaqi/assets/
    lib/pq-games/                   ← material generation framework
    lib/pq-rulebook/                ← interactive rulebook framework
    lib/functionality.ts            ← site-wide JS
    lib/rulebook-default.ts         ← fallback rulebook
    games/<...>/                    ← per-page / per-project code
```

### 1.2 How a page finds its JavaScript

`_partials/func/load-assets.html` runs in the footer of `game`, `board`, `rules`, `tool` layouts:

```
$url = .RelPermalink                                  "/chiptales/bet/noble-flood/game/"
JS : assets/games/<url>.ts   else assets/games/<url>main.ts
CSS: assets/games/<url>.scss else assets/games/<url>main.scss
if no JS and url contains "/rules/" → include /rulebook-default.js
```

Both are built per page (`js.Build` → `/<url>/bundle.js`, `css.Sass` → `/<url>/bundle.css`). The two shared libraries are **not** part of a page bundle: they are built once into `/lib/vendor/pq-games.js` and `/lib/vendor/pq-rulebook.js`, and `lib/pq-games` / `lib/pq-rulebook` are `js.Build` shims that read those globals, so a page bundle is ~20 KB instead of ~480 KB. A `game`/`board` page with no entry file now **fails the build** (`errorf`); a `rules` page that falls back to the default rulebook while containing `rules-example` shortcodes gets a `warnf`.

Gating: `game/single.html` needs `enableGameJS`, `board/single.html` needs `enableBoardJS`, `rules/list.html` needs `enableRulesJS` (true), `tool/single.html` always. Current config has both generator flags `false`: generator pages still exist by URL but ship **no JavaScript**. That is the "hidden generators" state.

Override without editing `config.toml` (verified):

```bash
HUGO_PARAMS_ENABLEGAMEJS=true HUGO_PARAMS_ENABLEBOARDJS=true hugo
```

### 1.3 `loadRulebook` (pq-rulebook)

Waits for `window.load`, then:

1. Renders innerHTML of `#rulebook-content` (the `<article id="rulebook-content">` from `rules/list.html`) through `marked`.
2. Inserts `.rulebook-toolbar` before the article: `Print (Browser)`, `Print (Advanced)`, `Fold All`, `Unfold All`, `Dark Mode` (plus `Upload` when assets are enabled).
3. `params.tables[id]` → appends `.rulebook-table-entry` (icon + heading + desc) into every `[data-rulebook-table="id"]`.
4. `params.examples[id]` → adds `.rulebook-example`, `.rulebook-example-ui` (`button.rulebook-example-button`, `button.rulebook-example-button-close`), optional `.rulebook-settings`, `.rulebook-example-content`.
5. Rebuilds the article into `.rulebook-section` > `header.rulebook-section-header` (+ hierarchy, icon, arrow) + `.rulebook-section-content`. Hidden synthetic root section (`h1 "Rulebook"`, `hideHeader`, `forbidFolding` → `data-nofold="true"`).
6. Wires examples, tables, image overlay, anchors; injects CSS into `<head>`.

Testing consequences: ids that don't match JS fail **silently**; a throwing example callback becomes an **unhandled promise rejection**, not `window.onerror`; everything is client-side DOM, so a browser is mandatory.

### 1.4 `loadGame` + `generateMaterial` (pq-games)

`loadGame(config)` → `loadSettings(config, defaultGameCallback)`:

1. `div.settings` > `h1`, `div.settings-tools` (`Reset to Defaults`, `Fold All Groups`, `Unfold All Groups`), and the settings container (`.settings-container`) holding all controls + the `Generate!` button + `div.feedback-node-sub`.
2. Click → `readSettingsFromHTML(container)` merged into `config._settings` → `await callback(config)`; the button is disabled for the duration and is restored (label + enabled) in a `finally`, so a throwing callback leaves it usable and still surfaces the error.

`generateMaterial(config)`: settings/localStorage → `_material` pickers + grid mappers → renderer → `loadResources` → `generateItems` → `generateDrawCalls` (item size from mapper; `MaterialVisualizer`) → `drawItems` (canvas per batch, `splitCanvas`, `mapper.addElement`) → `downloadPDF` (per page size: `PdfBuilder`, `convertCanvasToImage` = `canvas.toDataURL`, save).

Progress: `CustomEvent`s `feedback-progress-main` (written **into the button**) and `feedback-progress-sub` (into `div.feedback-node-sub`). Final state: sub-node text `PDF Downloaded!`. `canvas.toDataURL` is the instrumentation point for automated blank-page detection.

### 1.5 The three V1→V2 breaking changes (normative)

IMPORTANT: Many pivots, text alignments, and settings were _already updated_. This migration is moreso looking for those that were missed or weren't changed yet. For example, elements that _should_ have their pivot in the top left, but now accidentally have their pivot in the center because of the new default. Be VERY reluctant to actually forcefully update the `pos`, as changing the `pivot` to what it used to be (before the migration) is actually all you need to do.

**(a) Pivot default — top-left → centre.** `LayoutOperation`: `this.pivot = params.pivot ?? Vector2.CENTER`. V1 `pos` meant top-left; in V2 the same `pos` is the centre. Symptoms: content shifted by half its size, half off-canvas, "text invisible". Fix: keep V2 and convert positions (`pos = topLeft + size/2`) — preferred when the value is a named anchor, rename the key too — or restore V1 with `pivot: Vector2.ZERO`. **Shapes are exempt**: `calculateTransformationMatrix` subtracts `0.5` for `ResourceShape`, so they are centred regardless.

**(b) Text alignment default — left → centre.** `TextConfig`: `alignHorizontal = (params.align ?? params.alignHorizontal) ?? TextAlign.MIDDLE`, likewise `alignVertical`. Either accept centring (and delete V1's manual `+0.5*size` compensation) or restore with `.alignTopLeft()`. `TextConfig`s that only describe a font face (inside `_resources.files`) are irrelevant to tooling.

**(c) Settings read — globals → `_settings.<path>.value`.**

| Need | Canonical read |
|---|---|
| User setting | `config._settings.<group>.<key>.value` (`getSetting`/`getSettingDefault` in lib code) |
| Value derived from item/page size | `vis.get("path.in._drawing")` (returns the resolved `CVal`) |
| Balance/generation constants | `CONFIG.generation.*` (plain object) |
| Rulebook tuning constants | `CONFIG.rulebook.*` (plain object) |
| Debug switches | `config._debug.*` |

Legacy (must go): `CONFIG.<setting>` at top level (`CONFIG.cardSet`, `CONFIG.itemSize`, `CONFIG.debugOnlyGenerate`), or a setting object read without `.value`. Every `_settings` leaf is `{ type, value, label?, remark?, values?, min?, max?, step? }`; groups are `{ type: SettingType.GROUP, ...leaves }`.

### 1.6 `_drawing` + `CVal`

`MaterialVisualizer` resolves `_drawing` through a `Configurator`:

```ts
new CVal(new Vector2(0.5, 0.585), "size")   // → (0.5*w, 0.585*h)
new CVal(0.075, "sizeUnit")                 // → 0.075 * min(w,h)
```

`vis.get("path")` returns the resolved value; **raw numbers and `Vector2`s pass through unchanged** (no multiplication). So raw numbers + manual `* vis.sizeUnit` in draw code is *not broken*, only non-canonical — see §6.6 before converting anything.

### 1.7 Inventory (measured)

| Type | Pages | Own bundle | Notes |
|---|---|---|---|
| `game` | 80 | 80 | 7 are digital games, not generators (§2.5) |
| `board` | 12 | 12 | Generators |
| `rules` | 75 | 51 | 23 use `/rulebook-default.js`; 1 is a stray legacy page |
| `tool` | 4 | — | Out of scope (§9) |

* 6 projects are `draft: true` on their `_index.md` (wondering-witches, pirate-riddlebeard, pirate-drawingbeard, peerful, keebble-knickknack, wie-is-de-trol). Child pages still render; drafts only hide the *index* page without `-D`. Never assume "draft = not built".
* 45 rulebooks use the `rules-example` shortcode; 16 declare `data-rulebook-table`.

---

## 2. The contract

A page passes only if every applicable requirement passes for every configured run.

### 2.1 Rulebook (`type: rules`)

| ID | Requirement |
|---|---|
| RB-1 | `article#rulebook-content` exists with ≥1 heading; the bundle ran; zero `pageerror` / `console.error` / `unhandledrejection`; no `HTTP >= 400` except allowlisted URLs. |
| RB-2 | `.rulebook-toolbar` exists and contains the five buttons above. |
| RB-3 | ≥1 `.rulebook-section`; the root section has `data-nofold="true"`; every heading text from the server-rendered article appears among `.rulebook-section-header` texts. |
| RB-4 | `Fold All` sets `display:none` on every `.rulebook-section:not([data-nofold]) .rulebook-section-content`; `Unfold All` clears it. |
| RB-5 | Every `[data-rulebook-example="ID"]` has `.rulebook-example`, one `.rulebook-example-ui`, one generate button, one close button, one `.rulebook-example-content`. **No orphans**: every declared id gets a UI (catches markdown↔JS id mismatch). |
| RB-6 | Clicking each example: within `EXAMPLE_TIMEOUT` the button is enabled again with its original label and `.rulebook-example-content` has ≥1 child element; no error recorded. |
| RB-7 | One random canvas the example produced is non-blank: ink ratio ≥ 0.5 % (pixels differing from the dominant colour) or canvas ≤ 16 px. Exactly one canvas is measured; nothing else is decoded. |
| RB-8 | Every `[data-rulebook-table="ID"]` contains ≥1 `.rulebook-table-entry` with non-empty heading and exactly one icon container; clicking the first entry toggles `…-folded`/`…-unfolded`. No orphans (markdown↔JS mismatch). |
| RB-9 | Every `<img>` inside the content has `naturalWidth > 0`. |
| RB-10 | If the example declares settings, `.rulebook-settings` exists with ≥1 `.rulebook-settings-input`. |
| RB-11 | *(warning only)* every `a[href^="#"]` resolves to an existing id. |

### 2.2 Generator (`type: game`/`board`, §2.5)

| ID | Requirement |
|---|---|
| MG-1 | `div.settings` exists with non-empty `h1`, 3 tool buttons and `.settings-container`; zero errors/404s during load. |
| MG-2 | Every control in `.settings-container` has a unique non-empty `id` equal to its dotted path; a `MULTI` group counts as one control (its path id lives on the `div.settings-input-multi`, its checkboxes are values). |
| MG-3 | On a freshly loaded page the Generate button (`div.settings-container > button`) is enabled and labelled `Generate!` — first run only; the label is restored after every later run. |
| MG-4 | After clicking it: `.feedback-node-sub` contains `PDF Downloaded!` and the button is enabled again, within `GEN_TIMEOUT` (240 s). **Never wait for the label `Generate!`.** |
| MG-5 | ≥1 download event, filename ending `.pdf`, ≥5 000 bytes. |
| MG-6 | Zero errors/404s during generation. |
| MG-7 | ≥1 canvas captured through `toDataURL`; exactly **one** of them, chosen at random, has ink ratio ≥ 0.1 %. |
| MG-8 | All configured profiles pass MG-1..MG-7. |
| MG-9 | *(warning only)* `--inert`: a profile that changed settings but produced identical renders lists those controls as possibly ignored. |

### 2.3 Digital game (not a generator)

| ID | Requirement |
|---|---|
| DG-1 | Bundle executes; zero errors/unhandled rejections; no 404s. |
| DG-2 | `document.body.innerText.length > 200`. |
| DG-3 | If the bundle contains `Reset to Defaults` (it calls `loadSettings` to configure the *digital* game): `div.settings` exists with an `h1`, ≥1 control, and an enabled primary button. Do not click. |
| DG-4 | Report the URL under "needs manual pass". No interaction testing. |

### 2.4 Static checks (source level)

Errors block; warnings/info only report.

| ID | Rule | Severity |
|---|---|---|
| SC-1 | No `_settings` chain without `.value` (skip `.defaults`, `.meta`, and `Object.keys/entries/values(_settings…)`). | warn |
| SC-2 | No legacy framework globals in game code: `new ProgressBar(`, `new PdfBuilder(`, `new GridMapper(`, `new Visualizer(`, `PageFormat`. | **error** |
| SC-3 | Every `game`/`board` entry calls `loadGame(` or `loadSettings(`. | **error** |
| SC-4 | Every `rules` entry with examples/tables calls `loadRulebook(`. Constructing `InteractiveExample` / `RandomNaivigation*Generator` does **not** count (D-6). | **error** |
| SC-5 | Every `data-rulebook-example`/`data-rulebook-table` id in markdown exists as a key in the entry's import graph, unless the graph uses a computed key pattern (`[expr + "-…"]`). | **error** |
| SC-6 | Every `_resources.files[*].path` exists on disk (§2.4 resolution). | **error** |
| SC-7 | Info only: `_drawing` without `CVal`; stray `*.old`, `_index.old`, `*.v1.ts`, unimported `.ts`. | info |

SC-6 resolution: absolute path (`/x/y`) → `content/x/y`, else `static/x/y`, else `themes/pandaqi/static/x/y`; relative → `content/<base without leading slash>/<path>`. Hugo never opens these files, so nothing else catches a moved asset folder.

Implemented in `audit/src/static.ts` (`bun run static`, `--filter <project>` to scope it), 2 s for the whole tree. `bun run audit` runs it first and stops with exit 5 on any error (`--skip-static` to bypass). A page's graph is its entry plus every module it reaches relatively or through the `games/` alias; `lib/*` is the framework and is never part of the page.

### 2.5 Classification (in this order)

1. `type: rules` → rulebook. If it has no examples/tables and only `/rulebook-default.js`, still run RB-1..RB-4, RB-9.
2. `type: board` → generator.
3. `type: game` and bundle contains literal `downloadPDF` → generator.
4. otherwise → digital game.

`downloadPDF` is emitted by `generateMaterial.ts` and survives minification: measured 73 of 80 game bundles, and the 7 without it are exactly the digital games. Do **not** use `Reset to Defaults` (epic-medics, slippery-slopes-trippy-touches, timely-transports and wondering-witches are digital games that call `loadSettings`) or `generateMaterial` (does not survive minification). If a page classified as generator has no `div.settings`, fail `GEN_NO_SETTINGS`.

What a page can *print* is not what it *is*, and `loadGame` says nothing either way: generators are built on `loadGame` too (firecrackers is a generator), and digital games print PDFs as well (the pirate games). Keep the classifier as it is — the page's scripts, vendor included, mention `downloadPDF` or they do not — and do not "fix" it by reading the entry source or by guessing from `loadGame`/`loadSettings`.

Baseline counts: 92 `game`+`board` → **85 generators** + 7 digital games; 75 rulebooks.

### 2.6 Test-suite budget (deliberate)

Keep the suite lean; it may take at most an hour, never full day(s).

* Generators: **1 profile** by default; `--runs 2` when you want the `invert` profile too. No per-setting combinatorial testing.
* One worker by default, two is the ceiling. One canvas measured per example / per generation (the instrument measures at most two, at capture time). Never all of them.
* Rulebooks: one example click per example, one table toggle. No repeated runs.
* No retries on assertion failures. One retry only for timeouts (`RB-1`, MG-1, MG-4), reported as `flaky` with both artifact sets.
* Static checks run in seconds.
* Target: rulebooks ≤ 10 min, full generator suite (2 runs) ≤ 1 h, per-project filtered run ≤ 3 min.

---

## 3. Audit baseline (2026-11-11)

### 3.1 Build state with generators enabled

The build is green:

```
$ HUGO_PARAMS_ENABLEGAMEJS=true HUGO_PARAMS_ENABLEBOARDJS=true \
    hugo -d audit-artifacts/site --cleanDestinationDir --disableKinds taxonomy,term,rss,sitemap \
    --config config.toml,audit/lean.toml
exit code 0        (294 pages, 33 static files, 166 game/board/rules content pages, zero NOT_BUILT)
```

Timings and the iteration workflow are in §4.

### 3.2 Generators table

Legend — Framework: `loadGame` = V2 generator, `custom JS` = hand-written entry (generator or digital game, §2.5), `LEGACY` = old generator code. Settings API: `ok` = only canonical reads, `check` = group iteration or a hit worth a look, `BROKEN` = confirmed defect. CVal: `yes` = `_drawing` uses `CVal`, `no` = raw numbers (non-canonical, not automatically broken). Flags = advisory static counts (align/pivot), not defects.

| Page | Kind | Framework | Settings | CVal | Flags |
|---|---|---|---|---|---|
| `/bidding-blocks/game/` | game | loadGame | ok | yes | — |
| `/captain-flip/game/` | game | loadGame | ok | yes | — |
| `/chiptales/bet/noble-flood/game/` | game | loadGame | ok | yes | pivot:1 |
| `/chiptales/bet/pietenpoker/game/` | game | loadGame | ok | yes | pivot:1 |
| `/chiptales/bet/six-of-sparrows/game/` | game | loadGame | ok | yes | — |
| `/death-by-digits/game/` | game | loadGame | ok | yes | — |
| `/easter-eggventures/play/bunny-bidding/game/` | game | loadGame | ok | yes | — |
| `/easter-eggventures/play/chicken-colorout/game/` | game | loadGame | ok | yes | — |
| `/easter-eggventures/play/egghunt-esports/game/` | game | loadGame | ok | yes | — |
| `/easter-eggventures/play/quizhide-queaster/game/` | game | loadGame | ok | yes | — |
| `/easter-eggventures/play/reggverse-riddles/game/` | game | loadGame | ok | yes | — |
| `/epic-medics/game/` | game | custom JS | ok | no | — |
| `/feed-the-beast/game/` | game | loadGame | ok | yes | pivot:6 |
| `/fiddlefoo/game/` | game | loadGame | ok | yes | pivot:1 |
| `/firecrackers/game/` | game | loadGame | ok | no | — |
| `/hasty-accusations/game/` | game | LEGACY | ok | no | pivot:3 |
| `/hold-my-bear/game/` | game | loadGame | ok | no | align:1 |
| `/i-bid-you-not/game/` | game | loadGame | ok | yes | — |
| `/kangaruse/board/` | board | loadGame | ok | no | pivot:2 |
| `/keebble-games/spell/keebble-domino/game/` | game | loadGame | ok | no | pivot:5 |
| `/keebble-games/spell/keebble-knickknack/board/` | board | loadGame | ok | no | — |
| `/keebble-games/spell/keebble-knickknack/game/` | game | custom JS | ok | no | — |
| `/keebble-games/spell/keebble/board/` | board | loadGame | ok | no | — |
| `/librarians/game/` | game | loadGame | ok | yes | — |
| `/magnetmen/board/` | board | loadGame | check | no | pivot:3 |
| `/mammoth-messages/game/` | game | loadGame | ok | no | — |
| `/mapped-out/game/` | game | loadGame | ok | yes | — |
| `/maybe-games/vote/maybe-minister/game/` | game | loadGame | ok | yes | — |
| `/maybe-games/vote/maybe-missions/game/` | game | loadGame | ok | yes | — |
| `/maybe-games/vote/maybe-movies/game/` | game | loadGame | ok | yes | — |
| `/meadowmight/game/` | game | loadGame | ok | no | — |
| `/mountain-miners/game/` | game | loadGame | ok | yes | pivot:1 |
| `/naivigation/game/` | game | loadGame | ok | yes | — |
| `/naivigation/visit/crashing-cars/game/` | game | loadGame | ok | yes | — |
| `/naivigation/visit/frightening-flights/game/` | game | loadGame | ok | yes | — |
| `/naivigation/visit/singing-sails/game/` | game | loadGame | ok | yes | pivot:2 |
| `/naivigation/visit/swerving-spaceships/game/` | game | loadGame | ok | yes | pivot:1 |
| `/naivigation/visit/troublesome-trains/game/` | game | loadGame | ok | yes | — |
| `/naivigation/wind-up-at/amerigos-dakenpad/game/` | game | loadGame | ok | yes | pivot:1 |
| `/naivigation/wind-up-at/boot-op-stoom/game/` | game | loadGame | ok | yes | — |
| `/one-pizza-the-puzzle/board/` | board | loadGame | ok | no | — |
| `/pirate-drawingbeard/game/` | game | LEGACY | ok | no | align:2, pivot:4 |
| `/pirate-riddlebeard/game/` | game | LEGACY | ok | no | align:4, pivot:4 |
| `/pumpkin-patrol/game/` | game | loadGame | ok | no | pivot:2 |
| `/pyrrameds/game/` | game | loadGame | check | yes | — |
| `/sleighwell/game/` | game | loadGame | ok | no | — |
| `/slippery-slopes-trippy-touches/game/` | game | custom JS | ok | no | pivot:5 |
| `/slippery-slopes/game/` | game | loadGame | ok | no | pivot:5 |
| `/split-the-foody/game/` | game | loadGame | ok | no | — |
| `/starry-skylines/board/` | board | loadGame | ok | no | — |
| `/starry-skylines/game/` | game | custom JS | ok | no | — |
| `/swiftsmash-saga/tap/booksmack/game/` | game | loadGame | check | yes | — |
| `/swiftsmash-saga/tap/cookie-smasher/game/` | game | loadGame | ok | no | pivot:1 |
| `/swiftsmash-saga/tap/point-a-pile/game/` | game | loadGame | check | yes | pivot:1 |
| `/swiftsmash-saga/tap/racesmack/game/` | game | loadGame | ok | yes | — |
| `/swiftsmash-saga/tap/smackshapes/game/` | game | loadGame | ok | yes | — |
| `/thats-amorphe-pictures/game/` | game | loadGame | ok | no | — |
| `/thats-amorphe/game/` | game | loadGame | ok | no | align:2, pivot:2 |
| `/the-domino-diaries/place/dinoland/game/` | game | loadGame | ok | yes | align:1, pivot:2 |
| `/the-domino-diaries/place/domino-dynasty/game/` | game | loadGame | check | yes | align:2, pivot:2 |
| `/the-domino-diaries/place/highrise-homino/game/` | game | loadGame | check | yes | align:2, pivot:3 |
| `/the-domino-diaries/place/theme-parque/game/` | game | loadGame | ok | yes | align:1, pivot:2 |
| `/the-domino-diaries/place/zoo-parque/game/` | game | loadGame | ok | yes | align:1, pivot:3 |
| `/the-game-of-dilemmas/game/` | game | loadGame | ok | no | — |
| `/the-game-of-happiness/game/` | game | loadGame | ok | no | — |
| `/the-luck-legends/roll/a-little-white-die/game/` | game | loadGame | ok | yes | — |
| `/the-luck-legends/roll/champions-of-chance/game/` | game | loadGame | ok | yes | — |
| `/the-luck-legends/roll/chaos-contract/game/` | game | loadGame | ok | yes | pivot:2 |
| `/the-luck-legends/roll/deceptidice/game/` | game | loadGame | ok | yes | pivot:3 |
| `/the-luck-legends/roll/folly-and-fortune/game/` | game | loadGame | ok | yes | — |
| `/the-luck-legends/roll/lucky-lions/game/` | game | loadGame | ok | yes | — |
| `/the-luck-legends/roll/tossing-tiger-rolling-dragon/game/` | game | loadGame | ok | yes | — |
| `/the-mist/board/` | board | loadGame | check | no | pivot:1 |
| `/the-outnumbered-series/count-to/nine-lives-math-meows/game/` | game | loadGame | ok | no | pivot:1 |
| `/the-outnumbered-series/count-to/nine-lives-tricksy-kittens/game/` | game | loadGame | ok | no | — |
| `/the-outnumbered-series/count-to/nine-lives/game/` | game | loadGame | ok | no | — |
| `/the-outnumbered-series/count-to/sixpack/game/` | game | loadGame | check | no | — |
| `/throneless-games/conquer/kaizerseat/game/` | game | loadGame | ok | yes | — |
| `/throneless-games/conquer/kingseat/game/` | game | loadGame | ok | no | — |
| `/throneless-games/conquer/queenseat/game/` | game | loadGame | ok | no | — |
| `/throneless-games/conquer/smallseat/game/` | game | loadGame | ok | no | — |
| `/timely-transports/board/` | board | loadGame | ok | no | align:1, pivot:4 |
| `/timely-transports/game/` | game | custom JS | ok | no | align:1, pivot:4 |
| `/unstable-universe/board/` | board | loadGame | ok | no | — |
| `/waitless-games/play/creature-quellector/game/` | game | loadGame | ok | no | pivot:1 |
| `/waitless-games/play/finger-food/board/` | board | loadGame | ok | no | — |
| `/waitless-games/play/foldigami/board/` | board | loadGame | ok | no | — |
| `/waterfall-raging-rapids/game/` | game | loadGame | ok | yes | pivot:1 |
| `/waterfall/game/` | game | loadGame | ok | yes | — |
| `/wie-is-de-trol/game/` | game | custom JS | ok | no | — |
| `/wondering-witches/board/` | board | loadGame | ok | no | — |
| `/wondering-witches/game/` | game | custom JS | ok | no | — |

### 3.3 Rulebooks table

| Page | JS | loadRulebook? | align / pivot |
|---|---|---|---|
| `/bidding-blocks/rules/` | custom | yes | 0 / 0 |
| `/captain-flip/rules/` | default | — | 0 / 0 |
| `/chiptales/bet/noble-flood/rules/` | custom | yes | 0 / 1 |
| `/chiptales/bet/pietenpoker/rules/` | custom | yes | 0 / 1 |
| `/chiptales/bet/six-of-sparrows/rules/` | custom | yes | 0 / 0 |
| `/death-by-digits/rules/` | default | — | 0 / 0 |
| `/easter-eggventures/play/bunny-bidding/rules/` | default | — | 0 / 0 |
| `/easter-eggventures/play/chicken-colorout/rules/` | default | — | 0 / 0 |
| `/easter-eggventures/play/egghunt-esports/rules/` | default | — | 0 / 0 |
| `/easter-eggventures/play/quizhide-queaster/rules/` | default | — | 0 / 0 |
| `/easter-eggventures/play/reggverse-riddles/rules/` | default | — | 0 / 0 |
| `/feed-the-beast/rules/` | custom | yes | 0 / 6 |
| `/fiddlefoo/rules/` | custom | yes | 0 / 1 |
| `/fiddlefoo/rules/_index.old/` | default | — | 0 / 0 |
| `/firecrackers/rules/` | custom | yes | 0 / 0 |
| `/hasty-accusations/rules/` | custom | yes | 0 / 3 |
| `/hold-my-bear/rules/` | custom | yes | 0 / 0 |
| `/i-bid-you-not/rules/` | custom | yes | 0 / 0 |
| `/kangaruse/rules/` | custom | yes | 0 / 2 |
| `/keebble-games/spell/keebble-domino/rules/` | custom | yes | 0 / 5 |
| `/keebble-games/spell/keebble-knickknack/rules/` | custom | yes | 0 / 0 |
| `/keebble-games/spell/keebble/rules/` | custom | yes | 0 / 0 |
| `/librarians/rules/` | default | — | 0 / 0 |
| `/magnetmen/rules/` | custom | yes | 0 / 5 |
| `/mammoth-messages/rules/` | default | — | 0 / 0 |
| `/mapped-out/rules/` | default | — | 0 / 0 |
| `/maybe-games/vote/maybe-minister/rules/` | custom | yes | 0 / 0 |
| `/maybe-games/vote/maybe-missions/rules/` | custom | yes | 0 / 0 |
| `/maybe-games/vote/maybe-movies/rules/` | custom | yes | 0 / 0 |
| `/meadowmight/rules/` | default | — | 0 / 0 |
| `/mountain-miners/rules/` | custom | yes | 0 / 1 |
| `/naivigation/rules/` | default | — | 0 / 0 |
| `/naivigation/visit/crashing-cars/rules/` | custom | **NO** | 0 / 0 |
| `/naivigation/visit/frightening-flights/rules/` | custom | **NO** | 0 / 0 |
| `/naivigation/visit/singing-sails/rules/` | custom | **NO** | 0 / 2 |
| `/naivigation/visit/swerving-spaceships/rules/` | custom | **NO** | 0 / 1 |
| `/naivigation/visit/troublesome-trains/rules/` | custom | **NO** | 0 / 0 |
| `/naivigation/wind-up-at/amerigos-dakenpad/rules/` | default | — | 0 / 0 |
| `/naivigation/wind-up-at/boot-op-stoom/rules/` | custom | yes | 0 / 0 |
| `/pumpkin-patrol/rules/` | default | — | 0 / 0 |
| `/pyrrameds/rules/` | custom | yes | 0 / 0 |
| `/sleighwell/rules/` | custom | yes | 0 / 0 |
| `/slippery-slopes/rules/` | custom | yes | 0 / 0 |
| `/split-the-foody/rules/` | default | — | 0 / 0 |
| `/swiftsmash-saga/tap/booksmack/rules/` | custom | yes | 0 / 0 |
| `/swiftsmash-saga/tap/cookie-smasher/rules/` | custom | yes | 0 / 1 |
| `/swiftsmash-saga/tap/point-a-pile/rules/` | custom | yes | 0 / 1 |
| `/swiftsmash-saga/tap/racesmack/rules/` | custom | yes | 0 / 0 |
| `/swiftsmash-saga/tap/smackshapes/rules/` | custom | yes | 0 / 0 |
| `/the-domino-diaries/place/dinoland/rules/` | default | — | 0 / 0 |
| `/the-domino-diaries/place/domino-dynasty/rules/` | default | — | 0 / 0 |
| `/the-domino-diaries/place/highrise-homino/rules/` | custom | yes | 2 / 3 |
| `/the-domino-diaries/place/theme-parque/rules/` | custom | yes | 1 / 2 |
| `/the-domino-diaries/place/zoo-parque/rules/` | custom | yes | 1 / 3 |
| `/the-game-of-dilemmas/rules/` | default | — | 0 / 0 |
| `/the-game-of-happiness/rules/` | default | — | 0 / 0 |
| `/the-luck-legends/roll/a-little-white-die/rules/` | custom | yes | 0 / 0 |
| `/the-luck-legends/roll/champions-of-chance/rules/` | custom | yes | 0 / 0 |
| `/the-luck-legends/roll/chaos-contract/rules/` | default | — | 0 / 0 |
| `/the-luck-legends/roll/deceptidice/rules/` | custom | yes | 0 / 3 |
| `/the-luck-legends/roll/folly-and-fortune/rules/` | default | — | 0 / 0 |
| `/the-luck-legends/roll/lucky-lions/rules/` | custom | yes | 0 / 0 |
| `/the-luck-legends/roll/tossing-tiger-rolling-dragon/rules/` | default | — | 0 / 0 |
| `/the-mist/rules/` | custom | yes | 0 / 1 |
| `/the-outnumbered-series/count-to/nine-lives-math-meows/rules/` | custom | yes | 0 / 1 |
| `/the-outnumbered-series/count-to/nine-lives-tricksy-kittens/rules/` | custom | yes | 0 / 0 |
| `/the-outnumbered-series/count-to/nine-lives/rules/` | custom | yes | 0 / 0 |
| `/the-outnumbered-series/count-to/sixpack/rules/` | custom | yes | 0 / 0 |
| `/throneless-games/conquer/kaizerseat/rules/` | custom | yes | 0 / 0 |
| `/throneless-games/conquer/kingseat/rules/` | custom | yes | 0 / 0 |
| `/throneless-games/conquer/queenseat/rules/` | custom | yes | 0 / 0 |
| `/throneless-games/conquer/smallseat/rules/` | custom | yes | 0 / 0 |
| `/waitless-games/play/creature-quellector/rules/` | custom | yes | 0 / 1 |
| `/waterfall-raging-rapids/rules/` | default | — | 0 / 0 |
| `/waterfall/rules/` | custom | yes | 0 / 2 |

### 3.4 Confirmed defects (fix in this order)

**D-2 — `hasty-accusations` still uses the V1 generator.** (`SC-2` and `SC-3` report it.)
`games/hasty-accusations/game/main.ts` has no imports, uses globals (`ProgressBar`, `PdfBuilder`, `GridMapper`, `Visualizer`, `PageOrientation`, `PageFormat`), reads an undefined `vis` (line 84), and uses V1 settings (`CONFIG.cardSet`, `CONFIG.includeCards`, `CONFIG.includeCharacters`, `CONFIG.itemSize`, `CONFIG[type].size`, `CONFIG.debugOnlyGenerate`). Its `shared/config.ts` is already fully V2, so only the entry must be replaced (§6.5). Same file, second bug: the asset filter (`data.cardSet && key != CONFIG.cardSet`, `data.suspectsOnly && !CONFIG.includeCharacters`) reads undefined values, so suspect assets never load.

**D-6 — Naivigation "visit" rulebooks never initialise.** (`SC-4` and `SC-5` report all five.)
`games/naivigation/visit/*/rules/main.ts` (5 pages) contain no `loadRulebook(...)`. No toolbar, no sections, no tables, and the `naivigation-setup` example is never created. Compare `naivigation/wind-up-at/boot-op-stoom/rules/main.ts`.

**D-9 — Pirates pass the wrong second argument to `MaterialVisualizer`.**
`pirate-riddlebeard/game/main.ts:14` and `pirate-drawingbeard/game/main.ts:14`: `new MaterialVisualizer(CONFIG, { resLoader, renderer })`; the signature is `(config, customItemSize: Vector2)` → `customItemSize.clone is not a function`. Both projects are drafts, so no user impact today, but they can never be published.

### 3.5 Non-canonical but working (separate branch)

These multiply raw `_drawing` values manually (`vis.get("x") * vis.sizeUnit`). Converting to `CVal` is a refactor that can break working games; §6.6. List: firecrackers, hold-my-bear, sleighwell, magnetmen, the-mist, pumpkin-patrol, split-the-foody, the-game-of-dilemmas, the-game-of-happiness, mammoth-messages, meadowmight, kangaruse, the-outnumbered-series/*, waitless-games/* boards, swiftsmash-saga/tap/cookie-smasher, keebble-domino, thats-amorphe, pirates, wondering-witches, starry-skylines, timely-transports, one-pizza-the-puzzle, unstable-universe, slippery-slopes*.

### 3.6 Cross-check against `ROADMAP.md`

* `[x]` (Noble Flood, I Bid You Not, Magnetmen): Noble Flood and I Bid You Not are structurally clean; Magnetmen's flags are advisory (its shape ops legitimately omit `pivot`) and it has no confirmed defect.
* `[~~]` ("updated, untested") is unverified by definition — the harness turns it into fact.
* Fiddlefoo's "examples use wrong rules" is not detectable automatically; it is an optional review item on example screenshots (§10).
* Naivigation is worse than ROADMAP suggests (D-6); Hasty Accusations is confirmed (D-2).

---

### 3.7 Measured results (first audit run, 2026-11-13)

`cd pandaqi-studio/audit && bun run audit --kind rules --workers 2` — **74 rulebooks: 52 pass, 22 fail**, 7 warnings.
Codes: `RB_EXAMPLE_EMPTY` 22, `RB_EXAMPLE_TIMEOUT` 15, `RB_EXAMPLE_LABEL` 15, `PAGE_ERROR` 13, `RB_NO_TOOLBAR` 6, `RB_SECTION_MISSING` 1, `RB_BROKEN_IMAGE` 1.

What the reds actually are:

* **D-6 confirmed** on all five `naivigation/visit/*/rules/` — no `.rulebook-toolbar` at all.
* `swiftsmash-saga/tap/smackshapes/rules/` — the bundle exists and calls `loadRulebook`, yet no toolbar appears. New; not root-caused.
* The four Throneless rulebooks (`kaizerseat`, `kingseat`, `queenseat`, `smallseat`) throw `TypeError: Cannot convert undefined or null to object` in `planLoadMultiple`: the example loads resources that do not exist yet.
* `keebble-domino/rules/` throws `TypeError: r.pos is not a function` inside the visualizer — a `pos`/pivot migration defect — and one heading (`Werewalls`) never becomes a section header.
* 15 examples exceeded `EXAMPLE_TIMEOUT` (90 s). They all declare simulators, but every `SIMULATION_ENABLED` in the tree is already `false`, so the simulator was never what cost the time: `maybe-minister`'s `generate()` runs `while(!playerReachedPointsTarget)` and plays a whole game per click. Those callbacks need a bounded example; refusing to drive simulators does not fix them.
* `the-mist/rules/` contains an `<img>` with no `src`.

First generator and digital runs:

* `/chiptales/bet/noble-flood/game/` passes MG-1..MG-7 with a 2-profile run.
* `/epic-medics/game/` requests `/games/epic-medics/game/fonts/woodcutter.woff2`, which 404s; the file exists at `/epic-medics/assets/fonts/`. Its CSS resolves the font relative to the bundle, so this only ever broke once generator CSS was compiled.

`bun run perf` (cold destination, so the numbers mean something): segment build 3.9 s (budget 90 s), markdown edit 1.4 s (2 s), game-code edit 0.5 s (10 s), full build 32.1 s (budget 150 s). Every budget green. The full build was 193.9 s before §4.2 and §4.4. Repeat cold builds of the same tree measured 32 s, 64 s and once 217 s (fresh `resources/_gen` and a cold disk), so read the budget, not the best number — warm rebuilds are 15 s.

Filtered runs of the reworked harness (1 worker, 1 profile, `audit/lean.toml`), all with the build already warm:

* `/firecrackers/game/` **pass** (61.6 s), `/firecrackers/rules/` **pass** (2.6 s) — generator whose material follows the chosen packs.
* `/hasty-accusations/rules/` **pass**; `/hasty-accusations/game/` **fail `GEN_NO_SETTINGS`** — that project is not converted yet and its entry still uses bare globals (`ReferenceError: ProgressBar is not defined`), which is the documented migration work, not a harness artefact.
* `/hold-my-bear/game/` **pass** (29.1 s), `/hold-my-bear/rules/` **pass** (2.7 s).

`report.md` now lists each failure's message under **Failure details**: a code alone does not say what to open, and for `/hasty-accusations/game/` it is what names the actual cause.

`bun run static` (2 s, §2.4): **20 errors, 0 warnings, 70 info**. The errors are exactly D-2 (6) and D-6 (14). The info is §3.5's non-`CVal` projects plus ~50 modules no entry imports (`chiptales/shared/config.ts` is a stale duplicate of the per-game configs).

That is the shape a full sweep takes — do it in one go, at the end.

## 4. Build speed (measured — read before touching anything)

All timings on the author's machine, Hugo 0.153.4 extended, Windows. `bun run perf` is the source of truth (`audit-artifacts/perf.json`); run it after touching anything in the build.

| Command | Measured |
|---|---|
| full build into a fresh directory, generators on, `audit/lean.toml` | **32–67 s** (cold disk: 217 s) |
| one project (`--renderSegments` + `--disableKinds` + lean), cold | **3.9 s** |
| `hugo server` + segment, edit page **markdown** | **1.4 s** |
| `hugo server` + segment, edit a game **`main.ts`** | **0.5 s** |
| the same full build without `lean.toml` (2 811 static files, 149 MB instead of 33) | +31 s of pure copying |
| pages written by a full build | ~1 940 |

What is left in the full build is esbuild building one bundle per page (`load-assets.html` is the biggest line in the profile) plus the per-page templates. §4.2 and §4.4 explain the two things that used to dominate it.

### 4.1 The workflow (mandatory from now on)

Never run a full build while working on a game.

```bash
# 1. long-lived dev server, one project, no taxonomy noise, no subdomain static trees
HUGO_PARAMS_ENABLEGAMEJS=true HUGO_PARAMS_ENABLEBOARDJS=true \
hugo server --port 1399 --disableKinds taxonomy,term,rss,sitemap \
  --config config.toml,audit/lean.toml,audit/segment.toml --renderSegments one

# 2. audit against the running output, no rebuild at all
bun run audit --skip-build --base-url http://127.0.0.1:1399 --filter chiptales

# 3. full audit build (before a commit), lean and with that same lock as everything else
HUGO_PARAMS_ENABLEGAMEJS=true HUGO_PARAMS_ENABLEBOARDJS=true \
hugo -d audit-artifacts/site --disableKinds taxonomy,term,rss,sitemap \
  --config config.toml,audit/lean.toml
```

`audit/segment.toml` is generated per run (one file, one section):

```toml
[segments.one]
  [[segments.one.includes]]
    path = '{/chiptales/**,/chiptales}'
```

Rules:
* `--ignoreCache` is banned. Keep `resources/_gen` between runs: it is the 3–4× speedup, and deleting it turns a 67 s build into a 5 min one.
* Never clean the audit destination between runs; writing 2 811 static files (149 MB) to a fresh directory costs 31 s by itself.
* `-e development` (which `hugo server` uses) disables minification and source maps for page bundles → cheaper esbuild.
* A markdown edit must be visible in ≤2 s, a game-code edit in ≤10 s. If not, the workflow is broken, not the game.

### 4.2 Shared libraries

`assets/lib/vendor/pq-games-global.ts` and `pq-rulebook-global.ts` are built once in `load-assets.html` into `/lib/vendor/pq-games.js` (531 KB) and `/lib/vendor/pq-rulebook.js` (69 KB), emitted **before** the page bundle (deferred scripts keep document order). `js.Build`'s `shims` option maps `lib/pq-games` / `lib/pq-rulebook` to `assets/js/shims/*.js`, i.e. `module.exports = window.PQ_GAMES` / `window.PQ_RULEBOOK`; those shim references are what the layout greps for in each built bundle, so a page needs the vendor file exactly when its output reads the global. Page code is unchanged.

A page bundle is ~21 KB instead of ~480 KB, and a `main.ts` edit lands in **0.5 s**.

Two consequences to remember:
* The vendor file is not tree-shaken (it is a namespace on `window`), so one generator page loads ~550 KB instead of ~480 KB. It is cached across the whole site, so every other page pays nothing.
* `load-assets.html` only emits a vendor a page provably needs, and it decides that from the **built** bundle: after `js.Build` it looks for the shim's `PQ_GAMES` / `PQ_RULEBOOK` reference. Reading the entry source instead missed every page that reaches a library through `shared/config.ts` and only imports local modules itself — those pages shipped with an undefined global. A rulebook that never touches pq-games still does not load it.

### 4.3 Keep it honest: `bun run perf`

Add `pandaqi-studio/audit/src/perf.ts` (script `bun run perf`) that runs, timed:

1. `hugo server` first build for one segment (`--disableKinds …`), kill it.
2. touch a page `.md`, measure until the output file's mtime changes.
3. touch a game `main.ts`, measure the same.
4. full build with `--disableKinds` (skipped with `--fast`).

Print a table and fail if a budget regresses: markdown ≤2 s, asset ≤10 s (after §4.2), full ≤150 s, segment build ≤90 s. Store results in `audit-artifacts/perf.json` so trends are visible.

### 4.4 Images and the card partial

`show-image.html` processes **one** 500 px variant (CSS shrinks it; there is no 250 px file). `project-summary.html` calls it through `partialCached` — correct only because the cache key includes the **project page's permalink**: on a cache hit `partialCached` ignores the context dict, so keying on the src alone (which is `"header"` for every game) would put one game's header on every card. `config.toml` sets `[imaging] resampleFilter = "box"`, `quality = 75`.

A full build processes ~117 images and `show-image` costs ~24 s cumulative.

The remaining page-render cost is per-page template work (`project/list.html`, `rules/list.html`, `home.html` — see the profile in §3.7 and R-13). Re-profile before touching it:

```bash
hugo -d audit-artifacts/tm --templateMetrics --templateMetricsHints
```

---

## 5. The harness

### 5.1 `pandaqi-studio/audit/`

Bun + `playwright-core` driving system Chrome (`CHROME_PATH` overrides). No browser download; there is no Node on the author's machine.

```
audit/
  package.json            scripts: audit, perf
  src/main.ts             CLI, exit codes 0/1/2/3, the flags of §5.9
  src/perf.ts             §4.3 budgets
  src/build.ts            hugo build, reuse by input hash, project segments
  src/serve.ts            static server, real 404s, no-store
  src/manifest.ts         content frontmatter + built HTML -> manifest
  src/pages/{rulebook,generator,digital}.ts
  src/lib/{browser,instrument,settings,assert,wait,report,types}.ts
  allowlist.json          http failures to ignore
```

Pipeline: build (or reuse, hashed on `content/**`, `themes/pandaqi/{assets,layouts}/**`, `config.toml`) -> manifest -> static server -> one instrumented page per URL -> the §2 checks -> `audit-artifacts/{build.log,manifest.json,report.json,report.md,perf.json,index.html}` plus a screenshot and **one** measured render per page under `audit-artifacts/artifacts/<slug>/<profile>/`.

Instrumentation: `unhandledrejection` and `error` capture, seeded `Math.random` from `?auditSeed=` (appendix B), and a wrapped `toDataURL` that only **records** each canvas. Exactly one canvas is then measured (`inkRatio` + 480 px thumb): a random page for generators, a random canvas of the example for rulebooks (falling back to the canvases currently in the DOM, so a blank render is caught even when the page never calls `toDataURL`). Reading pixels for every canvas was the most expensive thing the harness did and found nothing extra.

Simulators are not driven. The entry source is read, every `simulator: { ... }` block's `enabled` is resolved against the file's `const` declarations, and a page whose simulator cannot be shown to be off reports `SIMULATION_ENABLED` and is not clicked at all. A *disabled* simulator is configuration only, so those examples are still clicked normally — which is every one of the 25 declarations in the tree today. An example that produces no canvas is a warning, not a failure: plenty of examples are text-only by design.

One failed resource is reported once (`console.error: Failed to load resource…` and `net::ERR_ABORTED` duplicates are collapsed onto the matching HTTP status).

**Machine guard (mandatory, `src/lib/govern.ts`).** Every entry point uses it:

* `acquireLock()` writes `audit-artifacts/.audit.lock`; a second build/audit/perf refuses to start. One heavy thing at a time is not a suggestion.
* `waitForMemory()` refuses to open a page or start a build below ~1.2 GB free, waits up to two minutes for memory to come back, and reports `MEMORY_LOW` for a page it still cannot run.
* One worker and one profile are the defaults (`--workers 2`, `--runs 2` are opt-in, two workers is the ceiling), with a pause between pages so each finished page is collected first.
* Chrome runs with one renderer, no GPU, a 512 MB JS heap and a 64 MB disk cache.
* The instrument holds **no canvas references**: it measures at most two canvases while they are being captured, so a generator with dozens of full-page canvases cannot pin gigabytes.

The profiles are `default`, `invert` and `--runs N` seeded ones. Static checks (§2.4) are specified but not written yet; `--deep`/`splitDims` is unspecified and does not exist.

Usage:

```bash
cd pandaqi-studio/audit
bun run audit --kind rules --workers 2
bun run audit --filter chiptales --skip-build --base-url http://127.0.0.1:1399
bun run perf            # --fast skips the full build
```

### 5.10 Human review (optional)

Automated checks catch crashes, blanks, orphans and 404s; they cannot judge "40 px too high because of the pivot". That judgement is optional, belongs at the very end of the work (§10), and nothing gates on it.

### 5.11 What the harness will not tell you

Whether the rules text matches the game (Fiddlefoo), whether material is balanced or beautiful, whether a digital game is playable, and whether text is *well* placed — only that it is inside its canvas and non-blank.

---

## 6. Repair recipes

### 6.1 Order

1. D-6. 
2. D-2, D-9, D-16. 
3. Whatever the harness reports red. 
4. §3.5 canonicalisation on its own branch.

### 6.2 Setting read

```diff
- if(!CONFIG._settings.includeCards) { return; }
+ if(!CONFIG._settings.includeCards.value) { return; }
```

Iterating a group means reading its leaves:

```diff
- for(const [color, genre] of Object.entries(CONFIG._settings.packs))
+ for(const [color, setting] of Object.entries(CONFIG._settings.packs))
+ {
+     if(!setting || setting.type === SettingType.GROUP) { continue; }
+     const genre = setting.value;
```

In library code prefer `getSetting("a.b", config)` / `getSettingDefault("a", config)`.

### 6.3 Pivot

| Situation | Action |
|---|---|
| `pos` + `size` on image/text, V1 drew from the top-left | `pivot: Vector2.ZERO`, or convert `pos` to `topLeft + size/2` (preferred when the value is a named anchor — rename the key from `cornerTopLeft` to `center`). |
| `pos` only (a free point) | leave; a point has no extent. |
| `ResourceShape` ops | leave; shapes are centred internally. |
| Rotated image/text | convert to centre, set `pivot: Vector2.CENTER` explicitly, adjust by the visual delta in the baseline screenshots. |

Verify visually against the approved baseline.

### 6.4 Text alignment

| Situation | Action |
|---|---|
| Centred label/number | keep V2 default; delete V1 `+0.5*size` offsets. |
| Left-aligned paragraph (rules on a card) | `.alignTopLeft()`. |
| Multi-line block centred vertically | already default; remove any V1 `pos` shift that compensated. |

### 6.5 Port a V1 generator (`hasty-accusations`)

`shared/config.ts` is already V2. Replace `game/main.ts` entirely:

```ts
import { loadGame } from "lib/pq-games";
import { CONFIG } from "../shared/config";
loadGame(CONFIG);
```

Then drop the V1-only filter fields the old entry used (`cardSet`, `cardsOnly`, `suspectsOnly`) from `_resources.files` so everything loads. If conditional loading is wanted, use the supported `loadIf: ["includeCharacters"]` (reads `_settings.<path>.value`); never re-implement filtering in the entry. Confirm each `_material` entry has `picker`, `mapper` and (when the material is also drawn in the rulebook) `itemSize`, then run the harness: remaining failures will be V1 reads inside `cardPicker.ts` / `suspectPicker.ts`, listed by SC-1.

### 6.6 CVal canonicalisation (optional, last)

Only per file, only after its page is green, and re-run the audit afterwards.

| Legacy | Canonical | Note |
|---|---|---|
| `vis.get("k") * vis.sizeUnit` | `k: new CVal(x, "sizeUnit")` | scalar stays scalar |
| `vis.get("k").clone().scale(vis.sizeUnit)` | `k: new CVal(new Vector2(x,y), "sizeUnit")` | |
| `new Vector2(vis.get("x")*size.x, vis.get("y")*size.y)` | `k: new CVal(new Vector2(x,y), "size")` | one vector value; two call sites become `.x`/`.y` |
| `vis.get("k") * vis.size.y` (single axis) | **leave as-is** + `// TODO CVal: axis-specific` | no y-only unit; converting changes the value |
| already absolute (e.g. `720`) | leave raw | raw values pass through |
| `Bounds`/`Color`/arrays | unchanged unless resolution is wanted | |

Never convert a scalar to `"size"` (returns a `Vector2` and breaks arithmetic) — the most likely way to break a working game here.

### 6.7 Naivigation rulebooks

The five `visit/*/rules/main.ts` build generators that construct `new InteractiveExample({ id: "naivigation-turn" | "naivigation-setup" })` at module evaluation (`shared/randomNaivigationTurnGenerator.ts:74`, `randomNaivigationSetupGenerator.ts:114`). That runs before `window.load`, so the UI is written into the pre-rebuild node and is discarded when `loadRulebook` clones the article. Adding `loadRulebook` alone therefore shows nothing.

Required pattern — the rulebook owns registration:

```ts
let turn: RandomNaivigationTurnGenerator;
loadRulebook({
  examples: {
    "naivigation-turn":  { buttonText: "Give me an example turn!",   callback: () => (turn ??= buildTurnGenerator()).generate() },
    "naivigation-setup": { buttonText: "Give me an example setup!",  callback: () => (turn ??= buildTurnGenerator()).generateSetupExample() }
  }
});
```

Remove the constructor-time `InteractiveExample` from those shared classes (expose `generate()` / `generateSetupExample()` instead). Accept when RB-5..RB-8 are green on all five pages.

### 6.8 Example/table id mismatch

Markdown is the source of truth: rename the JS key (or the markdown id). SC-5 must then be silent.

### 6.9 Definition of done for a project

1. `bun run audit --filter <project>` → all pages pass.
2. No unexplained `SETTINGS_INERT` warning (document intentional cosmetic controls in `allowlist.json`).
3. `ROADMAP.md` entry set to `[x]`.

---

## 7. Recommendations (ranked)

### P0 — stops this class of failure

**R-4. One pre-merge gate** (`.github/workflows/audit.yml`). Nothing scheduled, no nightly job: (1) `hugo` with generators enabled must exit 0; (2) `bun run static` reports no errors; (3) `bun run audit --runs 1` on the projects the PR touches. Upload `audit-artifacts/` on failure. Never merge a PR that turns a green page red.

**R-5. Per-project kill switch.** Replace global `enableGameJS`/`enableBoardJS` with a data file (`data/disabled-projects.yaml`) plus the existing `hideGame`/`hideBoard`/`hideRules` frontmatter, generated from `report.json` (`--emit-disabled`). One broken game must not force every generator offline.

### P1 — make the codebase verify itself

**R-6. Type checking.** Add `themes/pandaqi/assets/tsconfig.json` (reusing the `paths` from the existing `jsconfig.json`), run `bunx tsc -p themes/pandaqi/assets --noEmit`. Expect many errors; fix by project, starting with `lib/` and the `[x]` games. `js.Build` never type-checks, which is why D-9 shipped.

**R-7. `defineConfig` generic** so `_drawing`/`_settings` keys are inferred and `vis.get("typo")` is a compile error. The structural fix for the whole "wrong settings" class; do it after R-6.

**R-8. Delete dead things**: `content/fiddlefoo/rules/_index.old/`, `content/naivigation-old/`, `layouts/_shortcodes/rules/rules-table*.html`, `hasty-accusations/shared/dict.v1.ts`, `pirate-drawingbeard/game/jszip.min.js` (bundle it instead).

**R-9. Enforce SC-8 in CI** — a moved asset folder is otherwise invisible until a blank card appears.

### P2 — speed and determinism

**R-11. Codemod `Math.random()`.** `tools/random/rng.ts` now seeds every generation from `_settings.defaults.seed` (it installs a seeded `Math.random`, so existing pickers are already reproducible). The remaining work is to move picks onto `rand()`/`pick()` in batches, starting with green games, so they stay seeded if the global patch is ever removed.

**R-12. Library unit tests** in the pq-games / pq-rulebook repos (Vitest + jsdom), including the three V2-default tests: centre pivot, centre text alignment, and `_settings.<path>.value` reads. The copy in this repo is a net, not the home.

**R-13. What is left of page-render cost.** Taxonomies are already excluded from the audit build and images are no longer processed per card (§4.4). The rest is per-page template work — `rules/list.html` and the navigation partials are the hotspots in the last profile. Re-profile with `hugo --templateMetrics --templateMetricsHints` before touching anything, and only fix what shows up at the top.

**R-14. Pre-commit hook**: `bun run static --filter <project>` for the projects a commit touches — 2 s, and it prevents a 4-minute wait to discover a typo.

**R-15. Audit ergonomics**: `--filter`, `--skip-build`, `--base-url` against the dev server, `bun run audit:watch <project>` (hugo server + single-page audit on save). Note plainly: nothing notifies you when a background job finishes; wait for it in the foreground or check `perf.json`/`report.json`.

---

## 8. Phase plan

| Phase | Work | Exit criterion |
|---|---|---|
| 3. Mechanical fixes | full `--runs 1` sweep and every one-liner it surfaces | ≥80 % of generators and all custom rulebooks green |
| 4. Structural (1–2 weeks) | D-2 port, D-6 Naivigation, D-9 pirates, remaining reds, `--runs 2` on `[~~]` games | `--runs 1` green for every non-draft project except documented exceptions; `--runs 2` spot-checked on whatever was touched |
| 6. Re-enable (1 h) | `enableBoardJS`/`enableGameJS` true (or R-5), deploy, spot-check 5 games | links visible in production; the pre-merge gate is green |
| 7. Durability (ongoing) | R-4, R-6, R-7, R-11, R-13 | budgets of §4.3 hold |
| 8. Optional | §10: contact sheet per project, fix pivot/alignment, re-baseline | nothing depends on it |

---

## 9. Appendices

### A. Failure codes → first thing to open

| Code | Meaning | Open first |
|---|---|---|
| `BUILD_FAILED` | Hugo/dartsass/esbuild failed | last 40 lines of `build.log` |
| `NOT_BUILT` | page missing from the build | `load-assets.html`, layout gating, drafts |
| `RB_NO_TOOLBAR` | bundle never ran | script tags → entry file → console |
| `RB_ORPHAN_EXAMPLE` / `_TABLE` | markdown id has no JS key | page markdown vs `rules/main.ts` |
| `RB_EXAMPLE_EMPTY` | callback threw or returned nothing | captured `unhandledrejection` |
| `RB_BLANK_CANVAS` | ink ratio too low | visualizer config, pivot, asset path |
| `SIMULATION_ENABLED` | a debug simulator is switched on | that page's `SIMULATION_ENABLED` constant |
| `RB_BROKEN_IMAGE` | `naturalWidth == 0` | SC-8, `_resources.base` |
| `GEN_NO_SETTINGS` | settings never mounted | entry file, imports, `ReferenceError` |
| `GEN_NO_ID` | control without an id | `settings/nodes.ts` (`convertSettingToHTML`) |
| `GEN_STALLED` | button stayed disabled | captured rejection; picker/pivot |
| `GEN_NO_DOWNLOAD` | finished without a PDF | `_debug.omitFile`, `PdfBuilder` |
| `GEN_BLANK_PAGE` | page canvas blank | mapper config, `itemSize`, empty picker |
| `SETTINGS_INERT` | setting changed, output identical | that setting's consumer |
| `HTTP_404` | asset missing | `_resources`, `content/<project>/assets` |
| `PAGE_ERROR … appendChild` | empty example node | D-16 |

### B. Seeded RNG (injected by the harness)

```js
let h = 1779033703 ^ seed.length;
for (let i = 0; i < seed.length; i++) {
  h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
  h = (h << 13) | (h >>> 19);
}
let a = h >>> 0;
Math.random = () => {
  a = (a + 0x6D2B79F5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
```

### C. Out of scope (recorded so nobody "helpfully" does it)

`content/tools/**` and `layouts/tool/single.html`; digital-game gameplay testing; `pandaqi-studio-dev/`; the deploy pipeline (`_site_`, `htmltest.exe`, Netlify config)

### D. Glossary

* **Bundle** — the per-page ES module Hugo builds from `assets/games/<url>/main.ts`. The libraries are not in it; they are `/lib/vendor/*.js`, loaded once per page.
* **Default rulebook** — `/rulebook-default.js`, i.e. `lib/rulebook-default.ts` with no examples/tables.
* **Generator** — a page whose bundle mounts `div.settings` via `loadSettings` and produces a PDF.
* **Profile** — a deterministic set of settings changes applied before a generation run.
* **Render** — one canvas captured through `toDataURL`, i.e. one page of material.

---

## 10. Optional: visual review

Nothing depends on this section. Automated checks catch crashes, blanks, orphans and 404s; they cannot judge "40 px too high because of the pivot". Do it at the very end, only if you want to:

1. `bun run audit --update-baselines --filter <project>` → `audit/baselines/<slug>/{page,render,example-*}.png` (480 px). One measured render per page (§5.1), so the contact sheet is small.
2. Look at `audit-artifacts/index.html`. Tick `audit/baselines/review.json` (`{"<slug>": {"status":"ok"|"broken","note":"…"}}`) if you want to remember the verdict. No test, phase or exit criterion reads it.
3. Fix pivot/alignment with §6.3 and §6.4, re-run that project, look again.
