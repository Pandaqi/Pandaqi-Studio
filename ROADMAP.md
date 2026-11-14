# Roadmap / To-Do

## Important

The source for the website's libraries are in the [PQ-Games](https://github.com/Pandaqi/pq-games) and [PQ-Rulebook](https://github.com/Pandaqi/pq-rulebook) folders. Do _not_ update these libraries directly within this project. Make updates **to the libraries**---they are always the latest version. Then simply update/refresh to their latest version in `pandaqi-studio`.

@TODO (temporary): MOVE THESE FROM PANDAQI-STUDIO BACK TO PANDAQI-STUDIO-DEV:

* ALL OF pq-games and pq-rulebook, `functionality.ts`
* UPDATE BACK LAYOUTS TOO => `show-video.html`, `head.html`, `load-assets.html`, `footer-dynamic.html`, `load-assets-custom.html`, `project-buttons.html`, `support.html`


## V1 -> V2 visual review

The migration is finished; what is left is human judgement. The automated checks catch crashes, blanks,
orphans and 404s, but they cannot judge "40 px too high because of the pivot". Nothing depends on the
items below: do them when you want to, project by project.

1. `cd pandaqi-studio/audit && bun run audit --update-baselines --filter <project>` — writes
   `audit/baselines/<slug>/{page,render,example-*}.png` (480 px). One measured render per page, so the
   contact sheet stays small.
2. Look at `audit-artifacts/index.html`, which groups every page per project. Tick
   `audit/baselines/review.json` (`{"<slug>": {"status":"ok"|"broken","note":"…"}}`) to remember a verdict.
3. Fix pivot/alignment with the three V2 defaults in mind: `pivot` defaults to the centre (a V1 `pos` meant
   the top-left corner), text alignment defaults to the middle (V1 was left), and settings are read as
   `_settings.<path>.value` (or through `_drawing`/`CVal` when the value is derived from the item size).
   Then re-run that project and look again.

The project grids and the notes about individual games (the digital-only ones, Keebble Domino, That's
Amorphe, the pirates, Naivigation) live in the commit history of this file, and in the `[~~]`/`[x]` marks
that the migration's checklist ended with.

## Website / Marketing

Not essential, but might be nice.

* Get some real-world (?) IMAGES for all the boardgames lacking a media gallery now!
* New Hero image / home page design => Something that matches the colors of the website, but uses the accent colors for spice, has nature elements (like those leafs), and does NOT have text that gets in the way of the other text ...
* REMINDER: Completely ripped out PWA functionality as it was just confusing and badly implemented right now. Might move it back later.
* **Once Hugo supports "js.Build with page bundles"**, move all the game code from *assets* to *js/js_game* inside the project itself (where it belongs).
  * Example: now the Wondering Witches code is in `assets/wondering-witches/js-game/` => move it to `content/wondering-witches/assets/js/`. Also update the one `main.ts` file that references it there.
* **Experiment** with adding animations/videos to **rules** (board game mostly, but could also be done for video games.) => Use <https://motioncanvas.io/docs/> for this. It's open source, free, uses Canvas/Web, and does animation through coding and vectors.

## Game Enhancements

Not essential, but might be nice.

**Starry Skylines**. Make a *physical* version:

-   Give each element a drawing.
-   Print its properties (description, random number, etcetera) on the card.
-   Generate ~5 pages of these cards as usual.

**Keebble**. Add different sets of letter values (for Dutch, Spanish, German, ...) which you can select in the settings. This is applicable to all games. (Base game has "Scrabble Expansion", Knickknack has the values built-in, and Domino uses the values for probability of using symbol.)

**Wie is de Trol?** Less text on the page, a bit overwhelming now. Less text, more GIF explanation ( / let the game stand on its own) is a good idea in general.

