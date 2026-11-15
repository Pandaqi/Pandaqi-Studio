# Text system tests (pq-games)

Tests for the text layout/drawing system: `TextConfig`, `ResourceText`, measuring
(`calculateTextMetrics`), parsing and rich-text formatting, drawing, and the performance
characteristics that matter when generating a deck.

## Running

```bash
cd pandaqi-studio/audit
bun test tests/text
```

## Copying this folder into the pq-games repository

Everything here is self-contained except for one file:

1. Copy this folder to `<pq-games>/audit/text/`.
2. Open `lib.ts` and change the `LIB` path plus the re-export paths to point at the library
   (e.g. `../../src/layout/text/index`). This is the only place that knows where pq-games lives.
3. Run `bun test audit/text` from the pq-games root.

No dependencies are needed: `fakeCanvas.ts` + `setup.ts` provide a deterministic headless canvas.
If your bunfig preloads a DOM stub, that is fine too — `setup.ts` only fills in what is missing
(`document`, `HTMLCanvasElement`, `CanvasRenderingContext2D`, `DOMMatrix`, `Path2D`).

## How the canvas works

`fakeCanvas.ts` implements just enough of the 2D context for text:

* `measureText` returns a fixed width per character (0.5 × font size, 0.25 for narrow characters
  and spaces, 1.0 for wide ones, 0.6 for uppercase), with `actualBoundingBoxAscent = 0.8 × size`
  and `actualBoundingBoxDescent = 0.2 × size`. Whitespace reports no ascent/descent, like a
  browser. So at the default size of 16 a word of four letters is exactly 32px wide.
* Every `fillText`/`strokeText` is recorded with its font, colour, baseline and its absolute
  position after whatever transform is active (`draws`), so placement can be asserted.
* `drawImage` copies the recorded draws of the source canvas, so renderer paths that draw through a
  temporary canvas (strokd text, effects) are still visible to the tests.
* `getMeasureCount()` counts real `measureText` calls, which is how the tests prove that a chunk is
  measured once and cached afterwards.

Because every number is derived from that model, a failing expectation always means the layout math
changed — never that a font happened to be missing.

## What is covered

* `text-layout.test.ts` — horizontal/vertical alignment, offsets, wrapping, explicit and blank
  lines, automatic box dimensions per axis, justification (including "not the last line of a
  paragraph"), line height, `maxLines`, overflow handling, used dimensions, `fitTextSizeToBox`,
  empty text.
* `text-format.test.ts` — `<b> <em> <size> <col> <font> <sc> <sup> <sub> <upper> <lower>`,
  `format: false`, measure/draw agreement, and that style state does not leak between draws.
* `text-draw.test.ts` — fill/stroke calls and their order, colours, canvas state restoration,
  pivot/position/scale, text-as-image (`drawTextFromResource`), inline images.
* `text-perf.test.ts` — one measurement per chunk, zero measurements on a repeat draw, no canvas per
  text box, linear (not quadratic) layout growth, and a deck-sized batch budget. Timings are printed
  with `bun test` output; the thresholds are deliberately generous so they only catch regressions.
