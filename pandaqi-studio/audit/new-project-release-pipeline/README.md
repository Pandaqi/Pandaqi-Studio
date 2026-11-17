# New project release pipeline

One command that takes a game from "content folder exists" to "page is final, audited and has a
gallery":

```bash
cd pandaqi-studio/audit
bun run release <project>
```

or from the pipeline's own folder:

```bash
cd pandaqi-studio/audit/new-project-release-pipeline
bun run release <project>
```

`<project>` is the folder under `content/`. Games that live inside a collection work the same way:
`chiptales/bet/noble-flood`, `easter-eggventures/play/bunny-bidding`,
`naivigation/visit/crashing-cars`. A collection page itself (`chiptales`, `naivigation`) is a project
too; releasing it covers its own page, rulebook and screenshots, and leaves every game inside it to
its own release.

It works the same for a brand new game and for one that has been on the site for years: nothing is
overwritten, missing pieces are added, and a piece that does not exist (no rulebook, no generator) is
reported as a warning instead of failing the run.

Everything the run produces ends up in `audit-artifacts/release/<project>/`:

```
report.md            one page: what ran, what changed, what needs you
report.json          the same, machine-readable
review/packet.md     every section of text, with the id an edit must target
review/findings.md   the automated notes on their own
review/edits.example.json
```

## What it does

| # | stage | what happens |
| --- | --- | --- |
| 1 | `inspect` | Finds the page, the rulebook markdown, the game code and the generator. Warns clearly when there is no rulebook or no generator. |
| 2 | `text` | Applies only objective text fixes (doubled words, stray spaces around punctuation), reports everything that needs judgement, and writes the review packet for the agent pass. A `--edits` file is checked by the meaning guard before a single character is written. |
| 3 | `code` | `bun check` (types), `bun lint` (lint, when the installed Bun has it) and `bun fmt` (formatting, new files only) — Bun's built-ins, nothing installed. A Bun without `bun lint` reports that sub-check as `unavailable` instead of pulling in a package. |
| 4 | `audit` | Runs the existing audit harness: the site is built **filtered to this one project** (a Hugo segment) and its rulebook/generator pages are opened in Chrome and interacted with. |
| 5 | `media` | The generator's PDFs are already saved by the audit; the PDF page previews it captured become small WebP files in `content/<project>/assets/screenshots/` and are appended to the `media` list in `_index.md`. |
| 6 | `finalize` | `date` set when missing (or when it is in the future), `draft: true` removed, required fields checked, every `media` entry resolved to a real file, the filtered build's page checked for existence. |

Exit code `0` means released (warnings allowed); `2` means something blocking, named in the report.

## The text review, and why it is two steps

Text has two kinds of problem and they must not be handled the same way.

**Objective mistakes** — a doubled word, `facup` for `faceup`, a space before a comma — have one
correct answer and cannot change what a rule means, so the pipeline just fixes them and lists every
fix in the report.

**Judgement** — is this sentence ambiguous, is this rule incomplete, is this opener boring — is the
author's call. For the rulebook it is worse than that: a rewrite that "reads better" but shifts the
meaning is the single worst outcome of an automated pass. So that half is never executed by a script.
The command writes `review/packet.md` and the agent (or you) reviews it, using:

- `prompts/rulebook-review.md` — mistakes, ambiguity, gaps, redundancy, inconsistency. Never a rule
  change; game-design ideas go to `designSuggestions`.
- `prompts/marketing-review.md` — tighter, more interesting page copy; concrete hooks over filler.

The answers go into an edits file, which is applied in the same pipeline:

```bash
bun run release <project> --edits review/edits.json
```

Every edit passes the **meaning guard** first (`src/lib/guard.ts`). It refuses an edit that changes:

- a number (cards, points, players, timing),
- a link, image, `src=`/`id=` argument or shortcode (the rulebook markup is wired to code),
- a heading in a rulebook,
- so much of the wording that the section is no longer the same text.

Refused edits are reported with the reason and are **not** written. Design and marketing
suggestions in the edits file are only appended to the report.

## Marketing material

The material generator is already driven by the audit stage, which saves every PDF it produces under
`audit-artifacts/artifacts/`. The `--render` flag asks the harness for four page previews spread
across each PDF (one more than the gallery needs), and those previews are the screenshots:

1. each preview (JPEG, 1280 px) is downscaled to ≤1100 px and encoded as WebP at quality 0.72
   through Chrome's canvas — no image library, no new dependency;
2. files land in `content/<project>/assets/screenshots/<project>-page-001.webp` and are never
   overwritten (numbering continues from what is there);
3. the paths are appended to `media:` in the project's `_index.md` in the page-relative form the
   theme expects (`assets/screenshots/<name>`, extension optional).

The gallery is topped up to at least **four** images, which is enough for the grid to read as a
gallery rather than a preview. A project that already has four or more keeps its gallery;
`--force-media` adds four fresh ones anyway. If a run produces fewer pages than the gallery needs (a
two-page PDF), it adds what exists and says so. `--min-media` raises the target; it cannot lower it
below four.

Which pages are picked is not fixed: each PDF's opening page (the cover) is skipped when there is
enough behind it, the remaining pages are chosen at random, and the materials take turns so one deck
cannot fill the gallery. Two releases of the same game therefore do not ship the same screenshots.
The audit renders up to four pages per PDF (`--pdf-max-pages 4`) so a single-material game can still
fill the gallery.

## Flags

```
--dry-run              do every check, write nothing (the audit still runs)
--skip <stages>        comma list: text, code, audit, media, finalize
--no-fix               report text mistakes, do not apply the safe ones
--no-format            skip the formatter (type check and lint still run)
--min-media <n>        gallery target (default 4; values below 4 are raised to 4)
--force-media          add four screenshots even when the gallery is full
--set-date             set the date to today even when the page has one
--keep-draft           never remove `draft: true`
--edits <file>         apply a review JSON from the agent pass
--pdf-full             generate marketing PDFs at production quality (slower)
```

## Harness flags it passes

The audit stage drives `audit/src/main.ts`, which has no help text of its own, so here is what the
pipeline asks of it:

| flag | why |
| --- | --- |
| `--filter <project>/` | queue only this project's pages. The trailing slash matters: the harness matches it as a substring, so `waterfall` would also queue `/waterfall-raging-rapids/`. |
| `--segment <project>` | build the site with only this project rendered. |
| `--segment-include <path>` | **new, repeatable.** Render one more page alongside the segment. The pipeline adds every ancestor collection page that owns an `assets/` folder, so a nested game can load the files it borrows from it — e.g. `naivigation` for `naivigation/visit/crashing-cars`, whose fonts live in `content/naivigation/assets/fonts/`. Without it those requests 404 in the filtered build. Adding it does not widen the audit: the manifest filter still queues only this project's pages. |
| `--segment-exclude <path>` + `--filter-exclude <path>` | **new, repeatable.** The games inside a collection. Hugo's segment `excludes` take precedence over `includes`, so `/naivigation/` builds its own page, rulebook and game page while `naivigation/visit/**` and the rest are left out; the manifest exclude then keeps them out of the audit queue too, so they are neither audited nor reported as `NOT_BUILT`. Releasing `naivigation` went from 16 audited pages to 2. |
| `--render --pdf-max-pages 4 --renders-per-pdf 4 --renders-total 12` | keep page previews of each generated PDF, four pages per PDF, for the marketing gallery. |
| `--runs 1` | one pass; the audit is a release gate here, not a sweep. |
| `--pdf-full` | only with the pipeline's `--pdf-full`: production-quality PDFs instead of the two-page previews. |

## Requirements

- **Bun** — the pipeline itself has no dependencies, and uses `playwright-core` from
  `audit/node_modules` (it lives inside `audit`, so resolution just works).
- `bun check` needs Bun **1.4.3+**; `bun fmt` needs **1.4.4+**. On an older Bun the stage reports
  `unavailable` with the reason and the run continues.
- **`bun lint` is real and documented** (<https://bun.com/docs/lint>), but the linter was merged after
  the 1.4.4 release and is not in that stable binary: on 1.4.4, `bun --help` lists `check` and `fmt`
  only, and `bun lint` falls through to the script runner with `error: Script not found "lint"`. So on
  the current Bun the stage reports lint as `unavailable`; the stage probes for the command and uses
  it automatically on a Bun that ships it, with no code change and nothing installed.
- **Hugo 0.153.4 extended**, the version Netlify builds with.
- **Chrome**, for the audit and for the WebP encoding (set `CHROME_PATH` if it is not the default
  install).

## Notes and limits

- **Nested projects are scoped.** A folder with its own `_index.md` is a project of its own, so every
  scan (text, code, screenshots, audited pages) stops there: releasing `naivigation` never edits or
  screenshots `naivigation/visit/crashing-cars`. The audit filter also carries a trailing slash,
  because the harness matches it as a substring (`waterfall` otherwise also queues
  `/waterfall-raging-rapids/`, a different game the filtered build never renders).
- The audit build is a **segment build**: only this project's pages are rendered, so it cannot catch
  a link from this page to another project's page that you just renamed. The full static checks still
  run for this project (`SC-1..SC-8`).
- **A nested game can borrow its collection's page-bundle assets.** The naivigation games load
  `/naivigation/assets/fonts/K2D-*.woff2`, which belong to `content/naivigation/_index.md`, not to the
  game. A segment publishes only the pages it includes, so every ancestor collection page that has an
  `assets/` folder is added to the segment (`--segment-include` in the harness), and the fonts resolve
  exactly as they do on the full site. The include list is part of the build marker, so changing it
  rebuilds instead of reusing a build that lacks those files.
- A page that is blocked is **not written to at all**: `naivigation/swing-by` is a `@TODO` stub, so
  the run stops with the missing `type`/`blurb` named and reports the `date` it would have set as held
  back. Half-applying a release to a page that is not ready is harder to reason about than a no-op.
- Two things about that shared harness are handled here instead of in `audit/src`: its build cache is
  keyed on content/assets/themes but not on the segment, so the pipeline removes
  `audit-artifacts/site` whenever it was not built for this project (otherwise game B would be
  audited against game A's build, or against stale pages from an older one); and `--segment`
  rewrites the tracked `audit/segment.toml`, which the pipeline restores afterwards so a release
  leaves no unrelated diff.
- The project's page previews under `audit-artifacts/renders/<project>/` and the harness' shared
  `report.json` are cleared before each audit, so a screenshot can only come from material this run
  actually generated.
- Formatting writes **only files that are new in git**. An existing project whose code is not
  bun-fmt formatted is reported, not restyled: a release should not bury itself in unrelated churn.
- Formatted output is Prettier-compatible (4-space indentation, 120 columns), so it does not
  reproduce the repo's Allman brace style.
- The rulebook layout renders the project title as a screen-reader-only `<h1>` inside
  `#rulebook-content`, and the harness counts it as a rulebook section on every rulebook page. That
  one `RB_SECTION_MISSING` is ignored (matched by its exact hidden title, never blanket-silenced) and
  reported as a warning; every other missing section still fails the run.
- The text stage's automated notes are heuristics (long sentences, `some`/`etc.`, duplicated
  sentences, one-off words one keystroke away from a word the project uses). They are deliberately
  noisy-but-harmless: every one is a note, never an edit.
- The meaning guard protects numbers, links, shortcodes and headings. It cannot tell that
  "clockwise" became "counter-clockwise" in an otherwise identical sentence — that is why rulebook
  edits are meant to be small, and why the review is a human/agent pass rather than a rewrite.
- Formatted output: `bun fmt` is Prettier-compatible, so it uses 4-space indentation and the
  configured width, but it does not reproduce the repo's Allman brace style. It runs on the project's
  new code only, so no existing file is restyled.
## Tests

```bash
cd pandaqi-studio/audit/new-project-release-pipeline
bun test
```

`tests/` covers the parts where a mistake would be silent: frontmatter round-tripping (including
CRLF), the safe fixes, the guard (it must accept a typo fix and refuse a number change), the
screenshot selection, and the scoping of nested projects (a collection owns its own page and
rulebook, never its games').
