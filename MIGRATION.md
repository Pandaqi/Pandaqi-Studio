# MIGRATION — V1 → V2 recovery, audit and test harness

> **Status:** plan only. Nothing here is implemented.
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

1. Library changes (`lib/pq-games`, `lib/pq-rulebook`) go to their own repos first, then get copied into `themes/pandaqi/assets/lib/` (per `ROADMAP.md`). Library defects are marked **[LIB]** with the owning repo.
2. Never weaken a test to make it pass. If a test is wrong, fix it and say why in the commit.
3. Work in the order of §8; do not start a phase before the previous exit criterion is met.
4. A missing decision here is a bug in this document: stop and ask instead of guessing.

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

Both are built per page (`js.Build` → `/<url>/bundle.js`, `css.Sass` → `/<url>/bundle.css`). **When neither file exists the partial emits nothing**, so a page can look fine and be dead — root cause of this mess (§7 R-1).

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
2. Click → `readSettingsFromHTML(container)` merged into `config._settings` → `await callback(config)`; the button is disabled for the duration and **never gets its label back** (D-15).

`generateMaterial(config)`: settings/localStorage → `_material` pickers + grid mappers → renderer → `loadResources` → `generateItems` → `generateDrawCalls` (item size from mapper; `MaterialVisualizer`) → `drawItems` (canvas per batch, `splitCanvas`, `mapper.addElement`) → `downloadPDF` (per page size: `PdfBuilder`, `convertCanvasToImage` = `canvas.toDataURL`, save).

Progress: `CustomEvent`s `feedback-progress-main` (written **into the button**) and `feedback-progress-sub` (into `div.feedback-node-sub`). Final state: sub-node text `PDF Downloaded!`. `canvas.toDataURL` is the instrumentation point for automated blank-page detection.

### 1.5 The three V1→V2 breaking changes (normative)

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
| RB-7 | Every canvas the example produced is non-blank: ink ratio ≥ 0.5 % (pixels differing from the dominant colour) or canvas ≤ 16 px. |
| RB-8 | Every `[data-rulebook-table="ID"]` contains ≥1 `.rulebook-table-entry` with non-empty heading and exactly one icon container; clicking the first entry toggles `…-folded`/`…-unfolded`. No orphans (markdown↔JS mismatch). |
| RB-9 | Every `<img>` inside the content has `naturalWidth > 0`. |
| RB-10 | If the example declares settings, `.rulebook-settings` exists with ≥1 `.rulebook-settings-input`. |
| RB-11 | *(warning only)* every `a[href^="#"]` resolves to an existing id. |

### 2.2 Generator (`type: game`/`board`, §2.5)

| ID | Requirement |
|---|---|
| MG-1 | `div.settings` exists with non-empty `h1`, 3 tool buttons and `.settings-container`; zero errors/404s during load. |
| MG-2 | Every control in `.settings-container` has a unique non-empty `id` equal to its dotted path (catches D-11). |
| MG-3 | On a freshly loaded page the Generate button (`div.settings-container > button`) is enabled and labelled `Generate!` — first run only, see D-15. |
| MG-4 | After clicking it: `.feedback-node-sub` contains `PDF Downloaded!` and the button is enabled again, within `GEN_TIMEOUT` (240 s). **Never wait for the label `Generate!`.** |
| MG-5 | ≥1 download event, filename ending `.pdf`, ≥5 000 bytes. |
| MG-6 | Zero errors/404s during generation. |
| MG-7 | ≥1 canvas captured through `toDataURL`, each with ink ratio ≥ 0.1 %. |
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
| SC-6 | `TextConfig` that renders text specifies alignment. Font descriptors (`*config*.ts`, no `size|font`) excluded. | warn |
| SC-7 | `LayoutOperation` with `pos` but no `pivot`. Shape ops and blocks containing `new ResourceShape(` excluded. | warn |
| SC-8 | Every `_resources.files[*].path` exists on disk (§2.4 resolution). | **error** |
| SC-9 | Info only: `_drawing` without `CVal`; stray `*.old`, `_index.old`, `*.v1.ts`, unimported `.ts`. | info |

SC-8 resolution: absolute path (`/x/y`) → `content/x/y`, else `static/x/y`, else `themes/pandaqi/static/x/y`; relative → `content/<base without leading slash>/<path>`. Hugo never opens these files, so nothing else catches a moved asset folder.

### 2.5 Classification (in this order)

1. `type: rules` → rulebook. If it has no examples/tables and only `/rulebook-default.js`, still run RB-1..RB-4, RB-9.
2. `type: board` → generator.
3. `type: game` and bundle contains literal `downloadPDF` → generator.
4. otherwise → digital game.

`downloadPDF` is emitted by `generateMaterial.ts` and survives minification: measured 73 of 80 game bundles, and the 7 without it are exactly the digital games. Do **not** use `Reset to Defaults` (epic-medics, slippery-slopes-trippy-touches, timely-transports and wondering-witches are digital games that call `loadSettings`) or `generateMaterial` (does not survive minification). If a page classified as generator has no `div.settings`, fail `GEN_NO_SETTINGS`.

Baseline counts: 92 `game`+`board` → **85 generators** + 7 digital games; 75 rulebooks.

### 2.6 Test-suite budget (deliberate)

Keep the suite lean; it may take at most an hour, never full day(s).

* Generators: **2 profiles** by default (`default`, `invert`), `--runs N` for nightly stress. No per-setting combinatorial testing.
* Rulebooks: one example click per example, one table toggle. No repeated runs.
* No retries on assertion failures. One retry only for timeouts (`RB-1`, MG-1, MG-4), reported as `flaky` with both artifact sets.
* Static checks run in seconds; the library suite in under a minute.
* Target: rulebooks ≤ 10 min, full generator suite (2 runs) ≤ 1 h, per-project filtered run ≤ 3 min.

---

## 3. Audit baseline (2026-11-11)

### 3.1 Build state with generators enabled

```
$ HUGO_PARAMS_ENABLEGAMEJS=true HUGO_PARAMS_ENABLEBOARDJS=true hugo
ERROR … TOCSS-DART … games/pirate-drawingbeard/game/main.scss: There is no module with the namespace "g".
exit code 1
```

Phase 1 of the migration is therefore a build gate, not a test question. Timings and the iteration workflow are in §4.

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
| `/librarians/game/` | game | loadGame | **BROKEN** | yes | — |
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
| `/thats-amorphe/game/` | game | loadGame | **BROKEN** | no | align:2, pivot:2 |
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
| `/wie-is-de-trol/game/` | game | custom JS | **BROKEN** | no | — |
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

**D-1 — Build blocker: SCSS leftovers.**
`games/pirate-drawingbeard/game/main.scss:54` → `font-family: g.$header-font;`; `games/keebble-games/spell/keebble-knickknack/game/main.scss:144` and `:548` → `background-image: g.$special-cells-url;`. The `g` namespace does not exist; both variables are declared locally (`$header-font` line 2, `$special-cells-url` line 18). Remove `g.`. Compiling every game `.scss` with dart-sass 1.77.6 shows these are the only two failures. With generators disabled this CSS is never compiled, which is why production builds pass.

**D-2 — `hasty-accusations` still uses the V1 generator.**
`games/hasty-accusations/game/main.ts` has no imports, uses globals (`ProgressBar`, `PdfBuilder`, `GridMapper`, `Visualizer`, `PageOrientation`, `PageFormat`), reads an undefined `vis` (line 84), and uses V1 settings (`CONFIG.cardSet`, `CONFIG.includeCards`, `CONFIG.includeCharacters`, `CONFIG.itemSize`, `CONFIG[type].size`, `CONFIG.debugOnlyGenerate`). Its `shared/config.ts` is already fully V2, so only the entry must be replaced (§6.5). Same file, second bug: the asset filter (`data.cardSet && key != CONFIG.cardSet`, `data.suspectsOnly && !CONFIG.includeCharacters`) reads undefined values, so suspect assets never load.

**D-3 — `librarians` generator crashes.**
`games/librarians/game/cardPicker.ts:16-20`: `_settings.packs` is a `GROUP`, so `Object.entries()` yields setting objects and `(genre as string).toLowerCase()` throws `TypeError`. Runs on every generation (`generateGenreCards` defaults true). Fix: `genre.value`.

**D-4 — `thats-amorphe` settings never read.**
`game/cardPicker.ts:67,89,97,105`: `_settings.material.wordCards` etc. without `.value` → always truthy → every card type is always generated.

**D-5 — `wie-is-de-trol` expansion flag never read.**
`game/main.ts:112`: `_settings.expansions.specialeKrachten` (missing `.value`).

**D-6 — Naivigation "visit" rulebooks never initialise.**
`games/naivigation/visit/*/rules/main.ts` (5 pages) contain no `loadRulebook(...)`. No toolbar, no sections, no tables, and the `naivigation-setup` example is never created. Compare `naivigation/wind-up-at/boot-op-stoom/rules/main.ts`.

**D-7 — `sixpack` rulebook example id mismatch.**
JS defines `turn` and `turn-reverse`; markdown asks for `turn-with-reverse` → that example never renders (no button at all). Rename one side.

**D-8 — Stray legacy rulebook page is live.**
`content/fiddlefoo/rules/_index.old/index.md` → `/fiddlefoo/rules/_index.old/`, declares an example, no JS. Delete the folder.

**D-9 — Pirates pass the wrong second argument to `MaterialVisualizer`.**
`pirate-riddlebeard/game/main.ts:14` and `pirate-drawingbeard/game/main.ts:14`: `new MaterialVisualizer(CONFIG, { resLoader, renderer })`; the signature is `(config, customItemSize: Vector2)` → `customItemSize.clone is not a function`. Both projects are drafts, so no user impact today, but they can never be published.

**D-10 — `keebble-knickknack` digital game uses an unimported global.**
`keebble-games/spell/keebble-knickknack/game/main.ts:234` calls `loadSettings(...)` with no import → `ReferenceError` on load.

**D-11 — [LIB pq-games] Multi-select settings are never read.**
`settings/nodes.ts`: `convertSettingToHTML` renders `MULTI` as `div.settings-input-multi` (that div gets `id = path`) containing checkboxes that carry `dataset.value` but **no `id`**; `readSettingsFromHTML` queries `"input,select"` only, so the dead branch `elem.classList.contains("settings-input-multi")` never runs and every checkbox writes to `obj[""]`. Net effect: **every `SettingType.MULTI` control in every generator is inert** (firecrackers packs, hold-my-bear animals, thats-amorphe categories, …). Nothing errors.

**D-12 — [LIB pq-games] Seeding is inert.**
`_settings.defaults.seed` is generated and shown, but `generateMaterial` never uses it; games call `Math.random()`. `seedRandom()` exists and is used by only a few boards. No reproducible generations, no stable screenshot tests.

**D-13 — [LIB] Silent failures.**
`ResourceLoader` sets `img.src` and `FontFace` with no `onerror`; `MaterialVisualizer.get("typo")` returns `undefined`; `load-assets.html` emits nothing when no bundle exists. This is how "looks fine, is broken" pages were produced.

**D-14 — Dead shortcode.**
`layouts/_shortcodes/rules/rules-table.html` + `rules-table-entry.html` emit `.rules-table`/`.rules-table-entry`, but the library targets `.rulebook-table`/`.rulebook-table-entry`. Zero usages. Delete both.

**D-15 — [LIB pq-games] The Generate button label is never restored.**
`sendProgressPhaseSignal` writes the phase into the button itself (`FeedbackNode.nodeMain` *is* the button), so after a run the label stays `Done!`; the click handler restores only `btn.disabled`. Fix: set `btn.innerHTML = "Generate!"` after `await callback(config)` inside `try/finally` (an error currently leaves the button disabled *and* labelled with the failing phase). Until fixed, never use the label as a completion signal (MG-4).

**D-16 — [LIB pq-rulebook] `InteractiveExample` can pass `undefined` where a node is required.**
`examples/interactiveExample.ts:120`: `if(this.node.innerHTML.trim().length <= 0) { createExampleHTMLForNode(params, params.node); }` — `params.node` is `undefined` when the node was found by `querySelector`, and the helper calls `node.appendChild(...)` → `TypeError`. Only for empty programmatic nodes (markdown always emits text, so no live page hits it today; the §6.7 refactor would). Fix: pass `this.node`, return early when absent.

### 3.5 Non-canonical but working (separate branch)

These multiply raw `_drawing` values manually (`vis.get("x") * vis.sizeUnit`). Converting to `CVal` is a refactor that can break working games; §6.6. List: firecrackers, hold-my-bear, sleighwell, magnetmen, the-mist, pumpkin-patrol, split-the-foody, the-game-of-dilemmas, the-game-of-happiness, mammoth-messages, meadowmight, kangaruse, the-outnumbered-series/*, waitless-games/* boards, swiftsmash-saga/tap/cookie-smasher, keebble-domino, thats-amorphe, pirates, wondering-witches, starry-skylines, timely-transports, one-pizza-the-puzzle, unstable-universe, slippery-slopes*.

### 3.6 Cross-check against `ROADMAP.md`

* `[x]` (Noble Flood, I Bid You Not, Magnetmen): Noble Flood and I Bid You Not are structurally clean; Magnetmen's flags are advisory (its shape ops legitimately omit `pivot`) and it has no confirmed defect.
* `[~~]` ("updated, untested") is unverified by definition — the harness turns it into fact.
* Fiddlefoo's "examples use wrong rules" is not detectable automatically; it is a review item on example screenshots (§5.10).
* Naivigation is worse than ROADMAP suggests (D-6); Hasty Accusations is confirmed (D-2).

---

## 4. Build speed (measured — read before touching anything)

All timings on the author's machine, Hugo 0.153.4 extended, Windows, `resources/_gen` populated unless stated.

| Command | Measured |
|---|---|
| full build, generators on, **cold** cache | **>15 min** (aborted on D-1) |
| full build, generators on, warm cache | **5 min 42 s** |
| + `--disableKinds taxonomy,term,rss,sitemap` | **3 min 55 s** |
| + generators **off** too (no game JS at all, same flags) | **3 min 48 s** |
| one project: `--renderSegments` + `--disableKinds` | **1 min 23 s** (exit 0) |
| `hugo server` + segment, edit page **markdown** | **1 s** |
| `hugo server` + segment, edit game **`main.ts`** | **45 s** |
| pages written by a full build | ~1 940 |

Two different problems, two different fixes:

1. **Full builds are dominated by page rendering, not by esbuild.** With generators *off* and taxonomy kinds disabled the build still takes 228 s versus 235 s with all game bundles — game JS costs ~7 s of a warm build. Taxonomies cost ~107 s (342 s → 235 s). The remaining ~228 s is per-page template work over ~500 pages, which is absurdly slow and must be profiled (§4.4) before anything else is tuned.
2. **Iterating on one game is dominated by that page's re-bundle: 45 s** for a `.ts` edit versus 1 s for a markdown edit. A bundle is **829 KB unminified**, of which **340 KB is the vendored `lib/pq-games/tools/pdf/jspdf.js`**, identical in all 84 generator bundles. Cached full builds hide this cost; a single-file edit exposes it.

### 4.1 The workflow (mandatory from now on)

Never run a full build while working on a game.

```bash
# 1. long-lived dev server, one project, no taxonomy noise (first build ~80 s, then incremental)
HUGO_PARAMS_ENABLEGAMEJS=true HUGO_PARAMS_ENABLEBOARDJS=true \
hugo server --port 1399 --disableKinds taxonomy,term,rss,sitemap \
  --config config.toml,audit/segment.toml --renderSegments one

# 2. audit against the running output, no rebuild at all
bun run audit --skip-build --base-url http://127.0.0.1:1399 --filter chiptales

# 3. full audit build (CI / before a commit), still segmented + lean
HUGO_PARAMS_ENABLEGAMEJS=true HUGO_PARAMS_ENABLEBOARDJS=true \
hugo -d audit-artifacts/site --disableKinds taxonomy,term,rss,sitemap
```

`audit/segment.toml` is generated per run (one file, one section):

```toml
[segments.one]
  [[segments.one.includes]]
    path = '{/chiptales/**,/chiptales}'
```

Rules:
* `--ignoreCache` is banned; `--gc` only in the nightly CI job.
* Keep `resources/_gen` between runs (it is the 3× speedup) and cache it in CI keyed on `themes/pandaqi/assets/**` + `config.toml`.
* `-e development` (which `hugo server` uses) disables minification and source maps for page bundles → cheaper esbuild.
* A markdown edit must be visible in ≤2 s, a game-code edit in ≤10 s after §4.2. If not, the workflow is broken, not the game.

### 4.2 Make game-code edits cheap (the 45 s problem)

The 45 s is esbuild re-bundling 829 KB, mostly shared. Extract the shared code once:

1. `assets/lib/vendor/pq-games-global.ts`: `import * as pq from "../pq-games/index"; (window as any).PQ_GAMES = pq;` — same for `pq-rulebook` and for `tools/pdf/jspdf.js` (`window.jspdf`).
2. In `head.html`, build each once (`js.Build` `format: "iife"`, `minify` in production, `targetPath: "/lib/vendor/pq-games.js"`) and emit the tags **before** the page bundle (deferred scripts keep document order).
3. Shim the specifiers so page code is unchanged: `js.Build`'s `shims` option maps `"lib/pq-games"` → `assets/js/shims/pq-games.js` containing `module.exports = window.PQ_GAMES;`. (If `shims` does not intercept path-resolved imports, rename the specifier to the bare `pq-games` across entries with a one-line sed and pass `externals: ["pq-games"]` plus an import map in `head.html`.)
4. Measure before/after with `bun run perf` (§4.3). Expected: page bundles drop to ≈150 KB and a `.ts` edit to a few seconds. Do jspdf first — one import, one shim, 340 KB less per page.

### 4.3 Keep it honest: `bun run perf`

Add `pandaqi-studio/audit/src/perf.ts` (script `bun run perf`) that runs, timed:

1. `hugo server` first build for one segment (`--disableKinds …`), kill it.
2. touch a page `.md`, measure until the output file's mtime changes.
3. touch a game `main.ts`, measure the same.
4. full build with `--disableKinds` (skipped with `--fast`).

Print a table and fail if a budget regresses: markdown ≤2 s, asset ≤10 s (after §4.2), full ≤150 s, segment build ≤90 s. Store results in `audit-artifacts/perf.json` so trends are visible.

### 4.4 Where the 228 s goes (profiled)

```bash
hugo -d .audit-tm --disableKinds taxonomy,term,rss,sitemap --templateMetrics --templateMetricsHints
```

Measured, generators off (so no esbuild at all):

| cumulative | calls | avg | template |
|---|---|---|---|
| 2 m 20 s | 889 | 157 ms | `_partials/content/show-image.html` |
| 2 m 16 s | 125 | 1.09 s | `_partials/navigation/project-summary.html` (calls show-image) |
| 1 m 46 s | 74 | 1.43 s | `rules/list.html` |
| 1 m 39 s | 120 | 827 ms | `project/list.html` |
| 1 m 26 s | 78 | 1.10 s | `_partials/func/load-assets.html` (nested: bundles) |
| 1 m 17 s | 8 | 9.58 s | `home.html` |
| 1 m 13 s | 9 | 8.12 s | `_partials/navigation/games-list.html` |
| 1 m 3 s | 15 | 4.23 s | `_partials/navigation/collection-list.html` |

**Conclusion: the build is an image-resizing build.** `show-image.html` runs `$img.Process "resize 500x"` **and** `"resize 250x"` for every card on every page (≈900 calls), and Hugo reports `cached count = 0` — nothing is reused. The list partials (`games-list`, `collection-list`, `project-summary`) call it for every game, so the home/list pages each take 4–10 s.

Fixes, in this order, each measured with `bun run perf`:

1. **`partialCached`** around the whole partial in `project-summary.html` / `games-list.html`: `partialCached "content/show-image.html" $ctx $src $class`. Its output depends only on the image and the class (the `srcset` URLs are site-absolute), so one image is processed once per build instead of ~900 times. Verify by diffing the generated HTML of 3 list pages before/after — it must be byte-identical apart from ordering.
2. **One variant instead of two**: drop the 250 px `Process` and let CSS shrink the 500 px image (or keep 250 px only for cards). Halves the image work immediately.
3. **`[imaging] resampleFilter = "box"`, `quality = 75`** in `config.toml`; box is the cheapest filter and the quality is invisible at card size.
4. **Stop rendering every game on list pages**: `games-list`/`collection-list` render all 92 games (and their images) on the home page and on every section list. Paginate or cap them; they are navigation aids, not the product.

Expected: full audit build well under 90 s once (1) and (2) land, since image work is ~60 % of the 228 s. Do not touch §4.2 until this is done — it is the cheaper win.

---

## 5. The harness

### 5.1 Stack and layout

```
pandaqi-studio/audit/
  package.json            bun; devDeps: playwright-core, pngjs, pixelmatch
  src/main.ts             CLI
  src/perf.ts             §4.3
  src/build.ts  serve.ts  manifest.ts  static-checks.ts  library-tests.ts
  src/pages/{rulebook,generator,digital}.ts
  src/lib/{browser,instrument,settings,assert,report,thumb}.ts
  fixtures/library-tests.ts     page module exposing window.__auditLibraries
  allowlist.json   baselines/   segment.toml (generated)
```

* `playwright-core` + system Chrome (`chromium.launch({ channel: "chrome" })`); `CHROME_PATH` for CI. No browser download.
* Bun only (`bun install`, `bun run …`); there is no Node on the author's machine.
* Repo `.gitignore`: `pandaqi-studio/audit/node_modules/`, `pandaqi-studio/audit/artifacts/`, `pandaqi-studio/audit-artifacts/`.

### 5.2 Build step

```ts
buildSite({ project?: string, lean?: boolean, dest: string, log: string })
```

Runs from `pandaqi-studio/` with `HUGO_PARAMS_ENABLEGAMEJS=true HUGO_PARAMS_ENABLEBOARDJS=true`:

```
hugo -d <dest> --disableKinds taxonomy,term,rss,sitemap --logLevel warn
   [--config config.toml,audit/segment.toml --renderSegments one]   # when --filter is a project
```

Capture stdout+stderr to `log` **and** memory, keep the exit code, print the last 40 lines on failure (`BUILD_FAILED`). `--skip-build` reuses `dest` (must contain `index.html`). **Skip the build entirely if a hash of `content/**`, `themes/pandaqi/assets/**`, `themes/pandaqi/layouts/**`, `config.toml` matches the stored hash in `dest/.audit-inputs`** — this is what makes re-running the audit free.

### 5.3 Manifest (from built HTML, never from Hugo's resolution logic)

Walk `content/**/*.md`, read `type` from frontmatter, derive the URL (`/<dir>/<basename>/`, dropping `index`/`_index`; keep a leading `_` but mark `legacyPath`). For each:

```ts
{ url, kind, scripts[], links[], examples[], tables[], bodyClass,
  hasRulebookContent, bundleText, contract, isDraftProject, sourceMd, missing? }
```

Regexes: `script[^>]+src="([^"]+)"`, `link[^>]+href="([^"]+)"`, `data-rulebook-example="([^"]+)"`, `data-rulebook-table="([^"]+)"`. `bundleText` = concatenated text of `/games/**` scripts (plus `/rulebook-default.js`). Contract per §2.5. Missing HTML → `NOT_BUILT`. Persist `manifest.json`.

### 5.4 Static server

`Bun.serve` on `127.0.0.1:<port>` (default 8788), root `siteDir`: `/x/y/` → `x/y/index.html`, everything else as a file, **unknown paths return a real 404** (MG-6 depends on it), `Cache-Control: no-store`, MIME from extension with a fallback map (`.js → text/javascript`, `.css → text/css`, `.webp → image/webp`, `.woff2 → font/woff2`). Use a static server, not `hugo server` (its livereload re-renders and makes timing flaky).

### 5.5 Browser + instrumentation

`openPage(ctx, url, { timeoutMs })`: launch `channel: "chrome"`, context `{ acceptDownloads: true, viewport: 1280×900 }`; attach `pageerror`, `console` (type error), `requestfailed`, `response >= 400`, `download` **before** `goto`; `addInitScript(INSTRUMENT)`; `goto(waitUntil: "load")`; `await document.fonts.ready`.

Injected script (`instrument.ts`, a string) must:

1. Capture `unhandledrejection` and `error` into `window.__audit.{rejects,errors}` — example callbacks throw asynchronously and never reach `window.onerror`.
2. Seed `Math.random` from `?auditSeed=` (mulberry32, as specified in the appendix) until the library seeds itself (D-12/R-11).
3. Wrap `HTMLCanvasElement.prototype.toDataURL`: for each canvas with size > 0, downscale to ≤480 px wide, read pixels, compute `inkRatio = 1 - dominantColourShare` (sample every 7th pixel), keep the thumbnail data URL.
4. Return `{ w, h, inkRatio, thumb }` into `window.__audit.renders`; a tainted canvas records `error: "tainted"` (→ `CANVAS_TAINTED`, means a cross-origin asset).

`AuditedPage` exposes `collect()` (pull `window.__audit`), `errors`, `downloads`, `screenshot(name)`, `elementScreenshot(sel, name)`.

### 5.6 Rulebook run

```
p = openPage(url + "?auditSeed=" + seed)
waitFor(".rulebook-toolbar", 15s)                        // else RB-1/RB-2 fail, stop
RB-3: source headings (index.html, tags stripped, whitespace collapsed, lowercased)
      each appear among .rulebook-section-header texts; root section has data-nofold
RB-4: click "Fold All" -> all .rulebook-section:not([data-nofold]) content display:none
      click "Unfold All" -> none
for id of entry.examples:                                // RB-5
  node = [data-rulebook-example="id"]
  require class rulebook-example, 1 ui, 1 button, 1 close, 1 content
for id of entry.examples:                                // RB-6/RB-7
  clear p.collect(); original = button.innerText; button.click()
  wait until button enabled && innerText == original     // EXAMPLE_TIMEOUT 90s
  require content has >=1 child element; require 0 new errors
  for render in collected: require inkRatio >= 0.005 || w <= 16
  screenshot the content
RB-8: per table id: >=1 entry, non-empty heading, 1 icon container; click toggles class
RB-9: all imgs naturalWidth > 0
RB-10: if example declares settings -> .rulebook-settings has an input
RB-11 (warn): anchors resolve
```

Budget: `EXAMPLE_TIMEOUT` per example; a page with N examples gets N × timeout.

### 5.7 Generator run

Read controls once: `.settings-container input, .settings-container select` (skip `type=file`), keeping `id`, `type`, `options`, `min`, `max`.

Profiles (deterministic, applied in order): `default` (no change), `invert` (check every unchecked checkbox, last option of every select, `max` for numbers, `"audit"` for text — or the mirror image when everything is already on, decided by a fixed rule: **if ≥50 % of checkboxes are checked, uncheck all; otherwise check all**). `--runs N` adds seeded random profiles. After applying, keep-one rule: in a group whose controls are all checkboxes, if none is checked, check the first. `splitDims` capped at `2×2` unless `--deep`.

```
apply(profile); expected = readDom()
if first profile: require button enabled && label == "Generate!"
$eval(".feedback-node-sub", el => el.textContent = "")     // stale text from the previous run
downloadPromise = waitForEvent("download", GEN_TIMEOUT)     // must exist before the click
click("div.settings-container > button")
waitForFunction: !btn.disabled && /PDF Downloaded!/.test(fb.textContent)   // never the label
download = await downloadPromise; require .pdf && >= 5000 bytes
require no new errors; renders = collect(); require >=1 && each inkRatio >= 0.001
save thumbnails; hash = sha1(thumbs)
```

Notes: if `div.settings` disappears (`_settings.meta.selfDestroy`), mark `GEN_SELF_DESTROYED` and stop after run 1. `--inert` compares hashes and lists controls whose change produced identical output (how D-11-class bugs surface) — a warning, not a failure.

### 5.8 Library contract suite (seconds, permanent guard for the three default changes)

Draft-only page `content/audit-library-tests/_index.md` (`type: audit`, `draft: true`), layout `layouts/audit/single.html` (head + content + `load-assets.html`), entry `games/audit-library-tests/main.ts` importing the libraries and exposing `window.__auditLibraries.run()`.

| ID | Assertion |
|---|---|
| LIB-1 | `new LayoutOperation().pivot` is `Vector2.CENTER`; `.pos` is `(0,0)`. |
| LIB-2 | `new TextConfig()` has `alignHorizontal === alignVertical === TextAlign.MIDDLE`. |
| LIB-3 | `new CVal(0.5,"sizeUnit").calculate([100]) === 50`; `new CVal(new Vector2(0.5),"size").calculate([new Vector2(200,100)])` is `(100,50)`. |
| LIB-4 | Round-trip one of each `SettingType` through `convertSettingsToHTML` → mutate → `readSettingsFromHTML` returns typed values: boolean, string, number, **array for MULTI**. Fails today (D-11) and is its permanent guard. |
| LIB-5 | Every rendered control has a unique non-empty `id`; groups render `.settings-group` + `data-folded`. |
| LIB-6 | `loadRulebookCallback` on a DOM fixture yields toolbar, ≥1 section, `.rulebook-example-ui`, ≥1 `.rulebook-table-entry`. |
| LIB-7 | Clicking that example restores the button label and adds content; `createExampleHTMLForNode` works with an empty target (D-16). |
| LIB-8 | `ResourceLoader` reports a failed image load (requires R-3; mark `expectedFailure` until then). |

`bun run lib` opens the page, calls `run()`, prints a table, exits 1 on failure, and is part of every phase gate.

### 5.9 Report

```
audit-artifacts/{build.log, manifest.json, report.json, report.md, perf.json, index.html}
audit-artifacts/artifacts/<slug>/<profile>/{page.png, example-<id>.png, render-<n>.png, console.json}
```

`report.json`: `{ version, generatedAt, seed, build:{exitCode,durationMs}, summary:{pages,pass,fail,skip,warnings,failuresByCode}, results:[{url,kind,contract,status,durationMs,failures:[{code,contract,message,where}],warnings,artifacts}] }`.

`report.md`: one row per page (`Page | Contract | Status | Failures | Artifacts`), plus "Needs manual pass" (digital games + `SETTINGS_INERT`), plus a checkbox list ready to paste into `ROADMAP.md`.

`index.html`: self-contained contact sheet grouped by project (page screenshot + every render thumbnail).

Exit codes: `0` pass, `1` failures, `2` build failed, `3` internal error. Flags: `--filter`, `--only-failing`, `--kind`, `--runs`, `--inert`, `--deep`, `--headed`, `--skip-build`, `--base-url`, `--update-baselines`, `--port`, `--seed`, `--workers` (default 2 — canvas work is CPU-bound), `--timeout`.

### 5.10 Baselines and human review

Automated checks catch crashes, blanks, orphans and 404s; they cannot judge "40 px too high because of the pivot". That judgement is made once per project, fast:

1. `bun run audit --update-baselines` → `audit/baselines/<slug>/{page,render-1,example-*}.png` (480 px) + `baselines/seeds.json`.
2. Review the contact sheet; tick `audit/baselines/review.json` (`{"<slug>": {"status":"ok"|"broken","note":"…"}}`). The report lists unreviewed projects.
3. After a fix, regenerate and review only diffs (`pixelmatch`, >1 % pixels flagged).
4. Commit baselines: they are the regression net for future library updates.

### 5.11 What the harness will not tell you

Whether the rules text matches the game (Fiddlefoo), whether material is balanced or beautiful, whether a digital game is playable, and whether text is *well* placed — only that it is inside its canvas and non-blank.

---

## 6. Repair recipes

### 6.1 Order

1. D-1 (build must exit 0 with generators on). 2. D-11..D-13 + R-3 in the library repos, then sync. 3. D-3, D-4, D-5 (one-line reads) — three generators fixed immediately. 4. D-6, D-7, D-8. 5. D-2, D-9, D-10. 6. Whatever the harness reports red. 7. §3.5 canonicalisation on its own branch.

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

1. `bun run static --filter <project>` → no error rows.
2. `bun run audit --filter <project> --runs 2` → all pages pass.
3. `review.json` says `ok` after a human looked at the contact sheet.
4. No unexplained `SETTINGS_INERT` warning (document intentional cosmetic controls in `allowlist.json`).
5. `ROADMAP.md` entry set to `[x]`.
6. Generate one PDF by hand in a browser and open it — the one step the harness cannot do.

---

## 7. Recommendations (ranked)

### P0 — stops this class of failure

**R-1. A missing bundle must fail the build.** In `load-assets.html`, after resolving the JS:

```go
{{ $needs_js := or (eq .Type "game") (eq .Type "board") }}
{{ if and $needs_js (not $res_js) }}{{ errorf "No JS entry for %s (looked for %s.ts and %smain.ts)" .RelPermalink ... }}{{ end }}
```

Also `warnf` when a `rules` page contains `rules-example` but falls back to `rulebook-default.js` — always a bug. This guard alone would have caught D-8 and D-13.

**R-2. [LIB] Fix `readSettingsFromHTML` (D-11)**; guard with LIB-4.

**R-3. [LIB] Fail loudly.** `MaterialVisualizer.get()` warns once per unknown path; `ResourceLoader` attaches `img.onerror` / `FontFace` rejection handlers that surface in the feedback node; the visualizer logs every `LayoutOperation` without an explicit `pivot` and every text `TextConfig` without explicit alignment under `_debug.strict`. That last log replaces SC-6/SC-7 guessing with facts.

**R-4. CI gate.** `.github/workflows/audit.yml`: (1) `hugo` with generators enabled must exit 0; (2) `bun run static` (errors only); (3) `bun run lib`; (4) `bun run perf` (budgets of §4.3); (5) `bun run audit --runs 1 --filter $CHANGED`; (6) nightly `--runs 2` full suite. Upload `audit-artifacts/` on failure. Never merge a PR that turns a green page red.

**R-5. Per-project kill switch.** Replace global `enableGameJS`/`enableBoardJS` with a data file (`data/disabled-projects.yaml`) plus the existing `hideGame`/`hideBoard`/`hideRules` frontmatter, generated from `report.json` (`--emit-disabled`). One broken game must not force every generator offline.

### P1 — make the codebase verify itself

**R-6. Type checking.** Add `themes/pandaqi/assets/tsconfig.json` (reusing the `paths` from the existing `jsconfig.json`), run `bunx tsc -p themes/pandaqi/assets --noEmit`. Expect many errors; fix by project, starting with `lib/` and the `[x]` games. `js.Build` never type-checks, which is why D-9 shipped.

**R-7. `defineConfig` generic** so `_drawing`/`_settings` keys are inferred and `vis.get("typo")` is a compile error. The structural fix for the whole "wrong settings" class; do it after R-6.

**R-8. Delete dead things**: `content/fiddlefoo/rules/_index.old/`, `content/naivigation-old/`, `layouts/_shortcodes/rules/rules-table*.html`, `hasty-accusations/shared/dict.v1.ts`, `pirate-drawingbeard/game/jszip.min.js` (bundle it instead).

**R-9. Enforce SC-8 in CI** — a moved asset folder is otherwise invisible until a blank card appears.

### P2 — speed and determinism

**R-10. Shared vendor bundles** (§4.2): the single biggest iteration win, plus smaller pages and faster first paint.

**R-11. Real seeding (D-12).** Add `tools/random/rng.ts` (`setSeed`, `rand`, `pick`) to pq-games, seed from `_settings.defaults.seed` inside `generateMaterial`, and let the harness seed it. Then generations are reproducible, user bug reports become testable, and render baselines stop flapping. Codemod `Math.random()` in batches, starting with green games.

**R-12. Library unit tests** in the pq-games / pq-rulebook repos (Vitest + jsdom), including the three defaults tests (LIB-1..LIB-3). The copy in this repo is a net, not the home.

**R-13. Cut page-render cost (the 228 s floor).** 13 taxonomies × terms × `pagerSize = 5` add ~1 400 pages and ~107 s; `--disableKinds taxonomy,term,rss,sitemap` in the audit build removes them for free. The rest is per-page template work — profile it with `hugo --templateMetrics --templateMetricsHints` (see §4.4 for the current hotspot list) and fix the top partials; render term pages only in a deploy-only segment. Target: full audit build ≤90 s.

**R-14. Pre-commit hook**: `bun run static --staged` on changed `assets/games/**` — seconds, and it prevents a 4-minute wait to discover a typo.

**R-15. Audit ergonomics**: `--filter`, `--skip-build`, `--base-url` against the dev server, `bun run audit:watch <project>` (hugo server + single-page audit on save). Note plainly: nothing notifies you when a background job finishes; wait for it in the foreground or check `perf.json`/`report.json`.

**R-16. Performance budgets in CI** (§4.3) so slowness is caught like any other regression.

---

## 8. Phase plan

| Phase | Work | Exit criterion |
|---|---|---|
| 0. Skeleton (½–1 day) | §5.2–§5.7, §5.9, `perf.ts`; no game fixes | `bun run audit --kind rules` produces reds matching D-6/D-7; `bun run perf` prints the §4 table |
| 1. Build green (2–3 h) | D-1 | `hugo` exits 0 with generators on; 167/167 pages exist; no `NOT_BUILT` |
| 2. Libraries (1 day, in their repos) | D-11..D-13, R-1, R-3, §4.2 | `bun run lib` green (LIB-1..LIB-8); `bun run static` error-free except known D-2/D-6; game `.ts` edit ≤10 s |
| 3. Mechanical fixes (2–3 days) | D-3, D-4, D-5, D-7, D-8, D-10, then full `--runs 1` and all one-liners | ≥80 % of generators and all custom rulebooks green |
| 4. Structural (1–2 weeks) | D-2 port, D-6 Naivigation, D-9 pirates, remaining reds, `--runs 2` on `[~~]` games | `--runs 2` green for every non-draft project except documented exceptions |
| 5. Visual review (1 day, batched) | contact sheet per project; fix pivot/alignment; re-baseline | `review.json` `ok` for every non-draft project |
| 6. Re-enable (1 h) | `enableBoardJS`/`enableGameJS` true (or R-5), deploy, spot-check 5 games | links visible in production; CI green; nightly audit scheduled |
| 7. Durability (ongoing) | R-4, R-6, R-7, R-11, R-13, R-16 | budgets hold for 4 weeks |

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
| `RB_BROKEN_IMAGE` | `naturalWidth == 0` | SC-8, `_resources.base` |
| `GEN_NO_SETTINGS` | settings never mounted | entry file, imports, `ReferenceError` |
| `GEN_NO_ID` | control without an id (MULTI) | D-11 |
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

`content/tools/**` and `layouts/tool/single.html`; digital-game gameplay testing; `pandaqi-studio-dev/`; the deploy pipeline (`_site_`, `htmltest.exe`, Netlify config); rewriting pq-games/pq-rulebook architecture (that belongs in their repos).

### D. Glossary

* **Bundle** — the per-page ES module Hugo builds from `assets/games/<url>/main.ts`.
* **Default rulebook** — `/rulebook-default.js`, i.e. `lib/rulebook-default.ts` with no examples/tables.
* **Generator** — a page whose bundle mounts `div.settings` via `loadSettings` and produces a PDF.
* **Profile** — a deterministic set of settings changes applied before a generation run.
* **Render** — one canvas captured through `toDataURL`, i.e. one page of material.
