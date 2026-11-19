# RendererPandaqi — what changed and why

A record of every change to `RendererPandaqi` and the drawing layer around it since the massive rewrite started (2026-11-15 → 2026-11-19), what each change actually does, and the
measurements that justify it. The goal is that you can read a section, understand the mechanism,
and write the same kind of code yourself next time.

Everything here is reproducible: the commands are at the end of each benchmark section.

- Library: `assets/lib/pq-games/`
- Benchmarks: `audit/` (harnesses) and `audit-artifacts/` (raw numbers)
- Machines: one workstation, Intel HD Graphics 4600, headless Chrome 157, Bun 1.4.4

---

## 1. Timeline

| Date | Commit | Change |
| --- | --- | --- |
| 2026-11-15 | `fc72a905` | Text metrics/drawing fixes (first pass) |
| 2026-11-15 | `01cde100` | Text transforms applied twice — fixed in the renderer, proven with scene tests |
| 2026-11-15 | `1aa74920` | `LayoutOperation` split into `layout/operation/*` + builder + debug module |
| 2026-11-18 | `7467fa5e` | Canvas renderer optimization: direct groups, pooled surfaces, draw order/batching, no `willReadFrequently` |
| 2026-11-18 | `ee774001` | Pixi/Pandaqi parity fixes, all games switched to Pandaqi, Pixi removed from the barrel |
| 2026-11-19 | `883965af` | New realtime `draw/` layer, WebGPU backend hardened and made opt-in, `createRenderer()` defaults to canvas |

"Before" in the benchmarks below is not a guess: the harness imports the renderer file as it existed
at `796c539e` (the commit just before `7467fa5e`) and runs it against the same scenes.

---

## 2. Text: the transform was applied twice

**Commit:** `01cde100` (plus `fc72a905` for metrics)

**What was wrong.** The canvas renderer draws an operation into a temporary canvas, then stamps that
canvas onto its parent with `drawImage`. Before the stamp it set the transform to identity and
restored it afterwards:

```ts
const destTransform = ctx.getTransform();
ctx.setTransform(1, 0, 0, 1, 0, 0);
ctx.drawImage(ctxFinal.canvas, 0, 0);
ctx.setTransform(destTransform);
```

`ctxFinal` already contains the operation's absolute transform. `ctx` can still carry a *parent's*
transform — a nested group, or the text box an inline image sits in. Stamping while that transform
was active applied it a second time: text and images jumped by the parent's position, and a scale or
rotation compounded. The fix is the identity stamp above; the behaviour is pinned by
`audit/tests/text/text-scene.test.ts` (535 lines of scene-level assertions), so it cannot silently
come back.

**Why it matters for you.** Canvas state is *ambient*. Every helper that draws "somewhere else" must
state explicitly which transform it assumes, and nested drawing is exactly where double application
hides. When a visual bug looks like "it moved by the parent's offset", suspect a transform that was
never reset.

---

## 3. `LayoutOperation` was split up

**Commit:** `1aa74920`

**What changed.** The 500-line `layoutOperation.ts` became six focused modules:

| Module | Responsibility |
| --- | --- |
| `operation/types.ts` | the parameter object |
| `operation/sizing.ts` | how an operation derives its size (and the zero-width fallback) |
| `operation/styleOperation.ts` | fill, stroke, stroke width/align/type, alpha, composite, tint |
| `operation/transformOperation.ts` | position, rotation, scale, skew, pivot, matrix |
| `operation/layoutOperationBuilder.ts` | a small fluent builder used by tests and generators |
| `operation/operationDebug.ts` | the debug overlay, out of the hot path |

`LayoutOperation` keeps the public API and delegates.

**Why.** Three concrete reasons, not aesthetics:

1. **Allocation.** A transform-only operation no longer needs to construct fill/stroke/colour state it
   never uses. On a board with thousands of operations that is thousands of objects per draw.
2. **Testability.** The builder (`layoutOperationBuilder.ts`) made it possible to write the 495-line
   operation test suite and the 54-line perf test; before, constructing a representative operation by
   hand was verbose enough that nobody did it.
3. **Correctness boundaries.** Style and transform each have one place where defaults and validation
   live. The zero-width bug (a vertical `Line` divided by zero while sizing, producing `NaN` scale and
   an invisible shape) was fixed in `sizing.ts` by falling back to the other axis.

**Lesson.** Splitting a god object is a performance change when the object is allocated per element.
Look for "one object per draw call" before optimizing the drawing itself.

---

## 4. The canvas renderer optimizations

**Commit:** `7467fa5e` — this is where the large speed-up came from.

### 4.1 Groups draw directly unless they must composite

An operation group used to *always* get a full-size temporary canvas, draw its children there, then
stamp the whole canvas onto the parent. On a 3507×2480 page that surface is ~35 MB, and every group
paid for one.

```ts
canDrawGroupDirectly(op) {
    return !op.hasEffects()
        && !op.hasMask()
        && !op.hasClip()
        && !op.hasTint()
        && op.alpha >= 1
        && op.composite === "source-over"
        && !op.isDebugEnabled();
}
```

If none of those apply, the group is only a transform: its children can paint straight onto the
parent context, which skips both the surface and the full-canvas stamp. Groups that genuinely
composite (fade a whole group, apply a shadow to it, mask it) still take the temporary path.

### 4.2 Temporary canvases are pooled

```ts
const ctxTemp = needsTemporaryCanvas
    ? this.acquireTempContext(ctx.canvas.width, ctx.canvas.height)
    : ctx;
```

`acquireTempContext` keeps up to three surfaces per exact size (`MAX_POOLED_SURFACES = 3`, the normal
nesting depth). A reused surface is not a fresh one, so it is reset field by field — transform,
`globalAlpha`, `globalCompositeOperation`, `filter`, shadow, line dash — and cleared before use. The
surface is released only *after* the stamp, because it still holds the pixels until then.

### 4.3 `willReadFrequently` is no longer the default

`createContext()` used to pass `willReadFrequently: true` for every 2D context. That flag tells Chrome
"expect `getImageData`", and Chrome responds by moving the whole surface to the CPU — including the
large temporary canvases the renderer composites through. It is now `false` unless a caller asks for
it. Reading pixels is the exception (thumbnails, PDF encoding), not the rule.

### 4.4 State snapshots only where they are needed

`getCanvasContextState(ctx)` allocates a snapshot of the context. It is only required for **inline**
operations, which draw in the middle of another operation and must leave the context as they found
it:

```ts
const oldState = op.inline ? getCanvasContextState(ctx) : null;
```

Every other operation is the last user of that context, and the next operation sets what it needs.

### 4.5 Rectangles instead of `Path2D` for image boxes

An image's fill/stroke box is always a rectangle. The common paths now use `fillRect`/`strokeRect`;
only an `INSIDE` stroke needs a real path (it clips). That removes a `Path2D` allocation per image.

### 4.6 Draw order and optional style batching

`getDrawOrder()` delegates to `layout/resources/drawOrder.ts`:

- a group may supply its own `order` hook;
- `depth` sorting happens only when some child actually uses a non-zero depth (the previous
  allocation-free fast path is preserved);
- a group can opt into `batch`, which groups children by draw style (kind, fill, stroke, width, type,
  alignment, alpha, composite, tint, effect count) so the canvas keeps one fill/stroke state instead
  of switching per element.

Batching **reorders** elements, so it is opt-in and only correct for groups whose children do not
overlap. That trade-off is the whole point: state changes are expensive, but so is drawing in the
wrong order.

### 4.7 One thing that was deliberately *not* done

An earlier attempt skipped writing canvas properties that already looked like defaults. It was
reverted, because a pooled surface (or a parent context an inline operation drew on) can still carry
the previous element's filter, alpha or shadow. Writing the state unconditionally is the correct
default; the optimization belongs in the pool reset, not in the hot path.

---

## 5. The WebGPU backend

**Commit:** `7467fa5e` introduced it; `883965af` hardened it and made it opt-in.

**How it works.** It is a *texture-cached display list*. Each element is rasterized once into its own
small canvas (text at its text box, an image at its size, a shape at its bounding box), then
composited as a quad on the GPU in draw order with the element's full transform. Elements that share
a source texture cost one draw call and no rasterization.

Anything the GPU path cannot reproduce exactly — effects, masks, clips, tint, strokes, a group that
composites as a unit — is rasterized by the canvas renderer and composited as a single quad, so the
output stays correct.

**What was fixed after the first version:**

- one uniform buffer for all elements instead of one buffer per quad, with 256-byte aligned slots and
  doubling growth (`acquireUniformBuffer`);
- `MAX_GPU_PIXELS = 6_000_000`: above ~6 MP the canvas renderer is faster and far lighter on GPU
  memory (A4 at 300 DPI is ~8.7 MP), so a single print page never takes the GPU path;
- opt-in only: `createRenderer({ force: "webgpu" })` or `new RendererPandaqiWebGPU()`; a missing
  adapter falls back per draw instead of producing a blank page.

**Why keep it out of the default path.** A document is one huge page with thousands of elements,
each needing a texture and a bind group. The GPU wins on many small quads (realtime), not on one
8.7 MP raster. That is why the default is canvas and the realtime layer prefers the GPU batch.

---

## 6. `createRenderer()` now means "canvas"

**Commit:** `883965af`

```ts
export const createRenderer = (params: CreateRendererParams = {}) : Renderer =>
{
    if(params.force !== "webgpu") { return new RendererPandaqi(); }
    return new RendererPandaqiWebGPU({ device: params.device });
};
```

The document pipeline (cards, boards, rulebooks, PDFs) stays on the path that every game page already
uses and that the audit has verified. Every document call site (`generateMaterial`,
`materialVisualizer`, `resourceLoader`, `layoutOperation`, the two pirate game entries) passes
`force: "canvas"` explicitly, so the intent is visible where it matters. GPU is opt-in for documents
and the default only in `draw/spriteRenderer.ts`.

---

## 7. The realtime drawing layer (`draw/`)

**Commit:** `883965af`

The document renderer is a *display list of operations*: correct, effect-heavy, and not designed to be
walked sixty times per second. The realtime layer is a separate, dependency-free path:

| File | Job |
| --- | --- |
| `draw/matrix.ts` | 2×3 matrices, no allocation per entity |
| `draw/entity.ts` | plain-object entity with optional slices (types only, emits no JS) |
| `draw/canvasDrawer.ts` | runs a list of components per entity, per-depth scratch matrices |
| `draw/cache.ts` | remembers the last canvas state, writes a property only when it changes |
| `draw/components/*` | transform, effects, sprite, shape, text, container |
| `draw/presets.ts` | `SPRITE_PRESET`, `SHAPE_PRESET`, `TEXT_PRESET`, `FULL_PRESET` |
| `draw/spriteRenderer.ts` | GPU-first facade with a canvas fallback |
| `draw/webgpu/spriteBatch.ts` | instanced quad batch |

**Design decisions worth copying:**

- **Components are registered, not switched.** A game that only draws sprites registers
  `[transform, effects, sprite]`; text, shapes, filters and the container recursion are never called
  and never linked.
- **The entity is a plain object.** No class hierarchy, no per-frame allocation, and the same object
  can be handed to the document pipeline if a game needs both.
- **Scratch state is per depth.** `worldMatrices[depth]` / `localMatrices[depth]` are allocated once
  and reused; a child never overwrites its parent's matrix.
- **The state cache is per context and must be invalidated.** If something else paints on the canvas,
  call `drawer.invalidate()`.
- **Spritesheet frames are source rectangles.** No cut-out canvases, so a frame costs the same as a
  whole image.

`draw/spriteRenderer.ts` is the one place the GPU is the default:

```ts
const batch = await WebGPUSpriteBatch.create(canvas, options);
if(batch) { return createGPURenderer(canvas, batch); }
// otherwise the canvas drawer, with `error` explaining why
```

Both backends share one interface (`drawAll`, `resize`, `invalidate`, `destroy`, `backend`,
`error`), so a game branches only when it wants to.

`setup.ts` holds the only side effects (`structuredClone` fallback, the `PQ_GAMES` marker) and is
imported by the barrel, not by `draw/`. That is what lets a bundler drop everything a realtime game
does not import.

**Bundle sizes** (`bun run tree-shake`, minified browser IIFE):

| entry | size |
| --- | --- |
| whole barrel `lib/pq-games` | 229.0 KiB |
| `lib/pq-games/draw` (all presets) | 14.2 KiB |
| drawer + transform + sprite | 2.1 KiB |
| one sprite component | 0.6 KiB |
| `WebGPUSpriteBatch` alone | 9.6 KiB |
| geometry only | 3.5 KiB |

---

## 8. Parity work and the switch to Pandaqi

**Commit:** `ee774001`

Before switching every game, the two renderers were compared pixel by pixel on the same board
(`bun run renderer-compare`): **3.10% of pixels differ, mean absolute difference 1.03/255**, no global
offset. A synthetic scene (rects stroked middle/outside/inside, a translucent thin line, text, a
nested group) is pixel-identical on the scanline, which proves stroke width, alignment, scaling and
group transforms match. What remains is edge antialiasing.

Two real bugs surfaced during that comparison, both in the Pixi renderer:

- strokes took their colour from `ColorLike.toNumber()`, which is RGB only, so `#00000044` came out
  opaque; the style now also gets `ColorLike.getAlpha()`;
- a shape with a zero-width bounding box (a vertical `Line`) divided by zero while being sized,
  producing `NaN`

After that, every game's config dropped its explicit `renderer` line, `generateMaterial` builds the
canvas renderer, and `renderers/index.ts` stopped exporting Pixi:

```ts
// Not exported any more: every game uses the canvas renderer, so Pixi should never end up in a
// page bundle. Import "./pixi/rendererPixi" directly if a harness or test really needs it.
```

**Lesson.** "Parity" is a testable claim, not a feeling. A pixel diff plus a synthetic scene caught
two bugs that screenshots by eye would have missed, and it made the switch a one-line config change
instead of a risk.

---

## 9. Benchmarks

### 9.1 Method

`audit/src/renderer-games-bench.ts` drives the real `board` generator of each game in headless Chrome
with the same seed, settings and resources. Three renderers run on the same scene:

- `pixi` — `RendererPixi`, what every game shipped with before the switch;
- `legacy` — `RendererPandaqi` at commit `796c539e`, before the optimization pass;
- `pandaqi` — the current canvas renderer.

Each draw is split into **total** (`item.draw()`: generate + rasterize), **render**
(`MaterialVisualizer.finishDraw`: build the tree and rasterize) and **layout** (the difference:
generation and operation layout, identical in every row). A 1×1 readback forces the raster to finish
before the timer stops, so a GPU-backed renderer cannot look faster than it is. Three draws per
round, two rounds, one discarded warm-up, order alternated per round.

All boards are one A4 page at 300 DPI: **3507×2480 px**.

### 9.2 Before and after, five games

| game | renderer | total (median) | render step | vs legacy (render) |
| --- | --- | --- | --- | --- |
| One Pizza The Puzzle | Pixi | 174 ms | 166 ms | — |
| | legacy | 195 ms | 187 ms | — |
| | **Pandaqi** | **87 ms** | **81 ms** | **2.31× faster** |
| Magnetmen | Pixi | 243 ms | 241 ms | — |
| | legacy | 75 ms | 70 ms | — |
| | **Pandaqi** | **52 ms** | **50 ms** | **1.40× faster** |
| Unstable Universe | Pixi | 207 ms | 184 ms | — |
| | legacy | 264 ms | 239 ms | — |
| | **Pandaqi** | **134 ms** | **113 ms** | **2.12× faster** |
| Kangaruse | Pixi | 219 ms | 195 ms | — |
| | legacy | 451 ms | 426 ms | — |
| | **Pandaqi** | **357 ms** | **333 ms** | **1.28× faster** |
| Timely Transports | Pixi | 428 ms | 198 ms | — |
| | legacy | 964 ms | 737 ms | — |
| | **Pandaqi** | **670 ms** | **460 ms** | **1.60× faster** |

Ink coverage was identical between renderers on four of the five boards (86.6%, 83.7%, 95.7%,
99.6%), and 35.9% vs 36.3% on Unstable Universe (antialiasing on a sparse board). The generators are
deterministic, so both renderers drew the same scene.

**How to read it.** The render step is the renderer-only number; generation is the same code in every
row and is why `total` moves less than `render`. The optimization pass made the renderer
**1.3×–2.3× faster** than its own previous version on every game measured.

### 9.3 Where Pixi still wins

Honesty matters more than the headline:

| game | Pixi render | Pandaqi render | result |
| --- | --- | --- | --- |
| Kangaruse | 195 ms | 333 ms | Pixi 1.7× faster |
| Timely Transports | 198 ms | 460 ms | Pixi 2.3× faster |

Both are path- and fill-heavy boards: Kangaruse is 95.7% ink with long river lines, Timely
Transports is 99.6% ink (nearly the whole page painted). Pixi rasterizes the same scene in one WebGL
pass; the canvas renderer issues thousands of individual `fill`/`stroke` calls and state changes.

These are the next optimization targets, in order:

1. **Batch strokes into one `Path2D`** for a group of same-style lines (timely transports draws its
   entire route network as separate strokes).
2. **Reduce state churn further** — the batching hook exists but games do not opt in yet; enabling it
   on non-overlapping groups is a config change, not a renderer change.
3. **Revisit the GPU for large fills only** — a texture of the background plus quads for the rest,
   rather than per-element textures.

The full per-draw data is in `audit-artifacts/renderer-games-bench/results.json`; the generated table
is `audit/renderer-games-benchmark.md`.

### 9.4 Realtime frames

`bun run frame-bench` draws rotating entities on a 1280×720 canvas for 2 s per mode and counts frames
the browser actually presented. Display ceiling on this machine: **57 FPS**.

| entities | mode | draw ms/frame | FPS |
| --- | --- | --- | --- |
| 500 | old path: `RendererPandaqi` + `LayoutOperation` tree | 3.00 | 58 |
| 500 | new: component drawer (`FULL_PRESET`) | 1.30 | 57 |
| 500 | new: sprite-only preset | 0.90 | 58 |
| 1000 | old path | 5.90 | 56 |
| 1000 | component drawer | 2.10 | 54 |
| 1000 | sprite-only preset | 1.90 | 58 |
| 2000 | old path | 11.60 | 24 |
| 2000 | component drawer | 5.00 | 37 |
| 2000 | sprite-only preset | 4.20 | 52 |

At 2000 entities the new layer is **2.3× cheaper per frame** (5.0 ms vs 11.6 ms) and presents 37 FPS
instead of 24. Dropping text/shapes for the sprite preset gets 52 FPS at the same entity count.

WebGPU could not be measured here: `requestAdapter()` returns `null` on this machine (Intel HD 4600),
which is exactly why the canvas fallback exists.

### 9.5 One Pizza, dedicated run

`audit/renderer-benchmark.md` (regenerated by `bun run renderer-bench`) compares Pixi with Pandaqi on
the same 3507×2480 board with 4 draws × 2 rounds: **199 ms vs 138 ms** total, **191 ms vs 131 ms** in
the render step, 84.4% ink for both. It predates the multi-game harness but is kept because it isolates
one board and reports the WebGPU attempt separately.

### 9.6 Reproduce

```bash
cd pandaqi-studio/audit

bun run renderer-games-bench --reps=3 --rounds=2   # the five-game table above
bun run renderer-games-bench --games=kangaruse --reps=5
bun run renderer-bench --reps=4 --rounds=2         # One Pizza only, Pixi vs Pandaqi vs WebGPU
bun run frame-bench --repeats=3 --duration=2000    # realtime entity counts
bun run tree-shake                                 # bundle sizes
bun run renderer-compare                           # pixel diff + synthetic scene
```

`--headed` passes the real GPU to the browser; headless Chrome still reports ANGLE/D3D11 on the
actual adapter here, so the numbers are not software rasterization.

---

## 10. What to take away (and how to write this yourself next time)

1. **Measure the renderer alone.** Splitting `total` into generation + render is what made the work
   verifiable. Without it, a 25% renderer win disappears inside a 200 ms map generator.
2. **Build the "before" out of git, not memory.** The harness imports the old renderer class from a
   copy of the old file, so `legacy` and `pandaqi` are the same source with one variable changed.
3. **At print resolution, allocation is the cost.** One full-size surface on A4/300 DPI is ~35 MB;
   two per element is what made the old renderer slow. Pool them, reset them completely, and release
   them only after the last read.
4. **A shared canvas is ambient state.** Either reset everything you depend on, or snapshot and
   restore — and snapshot only where the operation is inline in someone else's draw.
5. **Know what a browser flag commits you to.** `willReadFrequently` silently moves a surface to the
   CPU. Never set a global flag "just in case".
6. **Reorder only when order does not matter.** Style batching is a real win, but it is opt-in
   because it changes which element paints on top.
7. **Prefer primitives over constructing geometry.** `fillRect`/`strokeRect` before `new Path2D()`.
8. **GPU is a trade, not an upgrade.** Many small quads: GPU. One 8.7 MP page with a texture per
   element: canvas. Guard by pixel count, not by hope.
9. **Parity is a test.** A pixel diff (3.10%, mean 1.03/255) plus a synthetic scene proved the
   renderers agreed *before* the switch, and found two Pixi bugs on the way.
10. **Keep the verified path the default.** New backends are opt-in, fall back per draw, and are
    exercised by their own harness. The document pipeline never depended on an unverified GPU path.
11. **Tree-shaking is a module property.** Side effects moved to `setup.ts`, components are separate
    files, and direct imports give a 2.1 KiB sprite drawer instead of a 229 KiB barrel.

---

## 11. Verification status

- `bun run typecheck` (assets) — exit 0.
- `bun test tests` — 281 passing; `bun test tests/draw` — 13 passing.
- Benchmarks above were run on 2026-11-19 with the current tree.
- The WebGPU renderer is **not runtime-verified on this machine**: no adapter is available. Its
  fallback path is what the harness exercises. Treat GPU numbers as unmeasured here.
- `starry-skylines` and `the-mist` are not in the five-game table: the first throws in its canvas
  path when driven outside its own page, and the second's generator loops in a headless harness.
  Both remain registered in `audit/bench/rendererGamesEntry.ts` for investigation with
  `--games=...`; neither is evidence about the renderer's speed.
