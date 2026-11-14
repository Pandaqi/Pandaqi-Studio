# LIB-AUDIT — pq-games / pq-rulebook

Proposals found while working through `MIGRATION.md` phases 5–7. Everything here is a **structural or
behaviour-changing** change, so it is written down instead of done. Small fixes (clearer errors, crash
guards, hot-path allocation, the `replaceAll` translation bug) were made in place and are *not* listed.

Each item says what is wrong, where, what the change would be, and what it costs to verify.

---

## A. pq-games

### A-1. `_settings` loses its declarations after the first generation

`readSettingsFromHTML()` returns `{group: {key: {value}}}`, and `loadSettings` then does
`Object.assign(config._settings, settings)` (a *shallow* assign, at the group level). Every group object in
`_settings` is replaced by one that only has `{key: {value}}`: `type`, `label`, `remark`, `values`,
`default`, `min`, `max`, `step` and `folded` are all gone.

Consequences: the settings UI can only ever be built once (a second `convertSettingsToHTML` would render
everything as checkboxes with keys for labels), "Reset to Defaults" works from the DOM rather than from the
config, and any code that inspects `_settings.<path>.type` after a run sees `undefined`.

**Change:** `readSettingsFromHTML` writes values into the existing tree (`mergeObjects(config._settings,
obj, false)`-style, or a dedicated `applySettingsValues(config, values)` that only assigns `.value`), and
`loadSettings` uses that. `mergeObjects(..., overwrite=false)` already does exactly this.
**Cost:** one function, plus a generator run per touched project. This is the single biggest latent break in
the settings API.

### A-2. `_material[key].picker` is an untyped requirement

`generateMaterial` calls `value.picker()` for every `_material` entry. A material without one is a config
error, but the type (`MaterialConfig.picker?: Function`) allows it. It now throws a named error instead of
`value.picker is not a function` (done), and the shared Naivigation `pawns` preset was the last real
offender (removed).

**Change:** make `picker` required in `MaterialConfig`, give it the real signature
(`(config: GameConfig) => any[] | Promise<any[]>`), and let the type checker catch it (needs R-6/R-7 in
`MIGRATION.md`; this is the concrete first consumer of the `defineConfig` generic).

### A-3. One PDF builder per page size — except it never happens

`downloadPDF` keeps `pdfBuilders = new Map()` keyed by `mapper.getPageSize()`, i.e. by **object identity**.
Every mapper owns its own `Vector2`, so two materials with the same page size always produce two separate
PDFs, and `fileName` comes from whichever material created the builder.

Either the comment is right (share a builder per *size*) or the code is (one PDF per material). Not both.
**Change:** decide, then either key the map on `${pageSize.x}x${pageSize.y}` (and take the filename from
`_game.fileName` so it does not depend on iteration order) or delete the map and build one PDF per material
deliberately. **Cost:** visible in the downloaded output, so it needs one generation per touched project.

### A-4. `getSetting` returns `false` when `_settings` is missing

```ts
if(!config._settings) { return false; }
```
`false` is a *value*: `getSetting("x.y", config) ?? fallback` keeps `false`, and `undefined`-checking
callers never fire. Nothing in `lib/` calls it yet, but every project does.
**Change:** return `undefined`, type it `getSetting<T = any>(path: string, config: GameConfig): T | undefined`,
and add `getDefaultSetting(key, config)` next to it so the `_settings.defaults.itemSize.value` chains have
one safe accessor (`MIGRATION.md` §1.5c). **Cost:** mechanical; audit flags the difference immediately.

### A-5. Default-setting reads assume the setting was rendered

`createGridMapperFromConfig` reads `_settings.defaults.itemSize.value`, `.pageSize.value`, `.pageSides.value`;
`generateMaterial` reads `.splitDims.value` (now guarded for `resources`). `getDefaultSettings()` only emits
a setting when its option list has more than one entry, and `noDefaultSettings: true` skips them all — so a
config that pins a single `possiblePageSizes` entry crashes with `Cannot read properties of undefined`.
No project does that today, which is why it has never been seen.
**Change:** fall back to the constants (`ItemSize.REGULAR`, `PageSize.A4`, `PageSides.SINGLE`, `"1x1"`) in
one helper instead of three call sites. **Cost:** small; verify with a one-page test config.

### A-6. `Configurator` is an object, not a map

`itemsCalculated: Record<string, any>` is keyed by the joined `_drawing` path. A path named `constructor`,
`toString` or `__proto__` resolves to an inherited property instead of `undefined`, and `set()` on
`__proto__` writes to the prototype. Also `calculate()` does `path.slice()` per key and
`collectRequiredInputs()` allocates two arrays per `CVal` (one `.some()`, done).
**Change:** `Map<string, any>` (or `Object.create(null)`), and push/pop the path array instead of cloning it.
**Cost:** contained in one class; a full generator run on two projects is enough.

### A-7. `MaterialVisualizer` accepts a missing resource loader

`this.resLoader = config._game.resLoader;` — when the config was not prepared through
`getMaterialDataForRulebook`/`loadResources`, this is `undefined` and the failure surfaces later as
`Cannot read properties of undefined (reading 'getResource')` while drawing a random card.
**Change:** warn once in the constructor (throwing would break the legitimate
"config only, no rendering" path that `rulebook-default` and debug tooling use).
**Cost:** none.

### A-8. `settings/nodes.ts` is four modules in one file

383 lines that (1) build controls, (2) read controls back, (3) reset them, (4) mount the panel and wire the
Generate button and feedback node. It is the file every settings bug lands in.
**Change:** `settings/html.ts` (`convertSettingsToHTML`, `convertSettingToHTML`), `settings/read.ts`
(`readSettingsFromHTML`, `resetSettings`), `settings/mount.ts` (`loadSettings`, fold/unfold). No API change:
`nodes.ts` re-exports. **Cost:** pure move; the transpile check plus one generator page proves it.

### A-9. Frequency maps are typed as complete records

`Pyrrameds`-style helpers (`generateAnimalCards(dist: Record<AnimalType, number>)`, `addAllPathsFrom(freqDist: Record<PathType, number>)`, mapped-out's `Record<CardMovement, number>`) reject the partial maps the configs actually hold, because the type says every key is required. The page-side signatures are `Partial<Record<…>>` now, which is what they always meant. The library versions deserve the same treatment, plus a `mergeWithDefaults(dict, defaults)` helper so a missing key means "the declared default" instead of `undefined` (which silently made a branch a no-op in two games this batch).

### A-10. `Renderer.applyToPixiObjectProperties` was not on the base type

`RendererPixi` has it, the base `Renderer` did not, so every place that accepts a `Renderer` (visualizers, config `_game.renderer`, `getMaterialDataForRulebook`) rejected a `RendererPixi` and the mask effect called it through an `any`. The base class now declares it. The wider point: a renderer's optional capabilities are invisible until something calls them, which is how `maskEffect` shipped a call to a method no type knew about.

### A-11. `vis.get("typo")` only errors where the config's literal type reaches the visualizer

`MaterialVisualizer<TConfig extends GameConfig>` and `DrawingPaths<T>` (in `settings/configuration.ts`) now
make `get()` take exactly the dotted paths a literal `_drawing` tree offers — `vis.get("typo")` is a compile
error, `vis.get("tokens.numPerCard")` still compiles, and a plain `GameConfig` collapses the parameter back
to `string` so nothing existing broke. What is left is adoption: a page that declares
`draw(vis: MaterialVisualizer)` gets the default `GameConfig`, so the tightening only fires in the ~13 places
that build a visualizer from a literal config. Threading `MaterialVisualizer<typeof CONFIG>` through every
project's `draw()`/picker signatures (≈1800 `vis.get` call sites) is mechanical but touches every project, so
it is an author-run batch, not a library change.

`_settings` keys stay strings for a different reason: a settings leaf is a `CVal`-like object whose
"interesting" keys are the user-facing ones, so flattening the *type* yields `input`/`val`/`getInput` and a
`${string}` tail — noise, not keys. Typed settings need a schema (a `defineSetting` that records its own
path), not a type trick.

---

## B. pq-rulebook

### B-1. `resetRulebook` wipes the document

```ts
document.body.innerHTML = "";
document.body.appendChild(node);
```
It destroys every other element on the page and every listener the framework itself attached outside
`node`. Nothing calls it today (only `loadRulebookCallback` is used), so it is dead-ish code that will bite
whoever reaches for it. **Change:** swap only the rulebook node (`node.replaceWith`) and re-run
`loadRulebookCallback` with the saved `params._rulebook`, or delete it if the re-render path is not wanted.
**Cost:** none while it stays unused.

### B-2. A throwing example is an unhandled rejection

Example callbacks are `await`ed inside `makeExamplesInteractive` without a `try`. A callback that throws
leaves the button disabled and produces an `unhandledrejection`, which is only visible to the audit harness
as a timeout (`EXAMPLE_TIMEOUT`). This is exactly how the 15 timeout failures in `MIGRATION.md` §3.7 looked.
**Change:** wrap the callback, render the message into `.rulebook-example-content` (a
`pre.rulebook-example-error`), re-enable the button, and `console.error` the original error object once. **Cost:** no API change; RB-6 then reports the real message instead of a timeout.

### B-3. `loadRulebookCallback` does six things

Parse → toolbar → shortcodes → sections → interactivity → styles, in one function, with `params._rulebook`
as the "already built" flag. **Change:** extract `buildOnce(params, node)` and `wireInteractivity(node)`, and
replace the implicit flag with an explicit `params._built` (or return a small handle). Makes `resetRulebook`
(B-1) a natural call instead of a special case. **Cost:** rulebook sweep, author-run.

### B-4. Text-only examples log as failures of nothing

Already handled as a warning by the harness, but the library has no way to say "this example draws nothing
on purpose". **Change:** `InteractiveExampleParams.draws?: boolean` (default `true`), so the audit can skip
the canvas check by declaration instead of by allowlist. **Cost:** two keebble entries gain a field.

---

## C. Cross-cutting

* **C-1. No unit tests in either library.** `MIGRATION.md` R-12 has the three V2-default tests (centre pivot,
  centre text alignment, `_settings.<path>.value`). A-1, A-3 and A-4 are all one-test changes; without tests
  they are guesses. This is worth doing before, not after, the rest of this file.
* **C-2. `_debug` is a bag of booleans read directly by library code.** A tiny `debugEnabled(config, "text")`
  helper would let the `MIGRATION.md` harness turn on `strict` uniformly (`setStrictWarnings` is currently
  only set from `generateMaterial`, never for rulebook examples).
