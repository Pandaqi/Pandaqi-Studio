# Roadmap / To-Do

## Important

The source for the website's libraries are in the [PQ-Games](https://github.com/Pandaqi/pq-games) and [PQ-Rulebook](https://github.com/Pandaqi/pq-rulebook) folders. 

* Do _not_ update these libraries directly within this project. 
* Make updates **to the libraries**---they are always the latest version. 
* Then simply update/refresh to their latest version in `pandaqi-studio`.

The `pandaqi-studio-dev` folder is never up-to-date or canonical. It's a loose playground with half-finished projects and it should never be treated as the true source of libraries, coding style, folder structure, or anything else.

## V1 -> V2 visual review

The migration is finished, except for manual review by a human (me!). Automated checks catch a lot, except if the final product is actually what I intended.

1. `cd pandaqi-studio/audit && bun run audit --update-baselines --filter <project>` — writes
   `audit/baselines/<slug>/{page,render,example-*}.png` (480 px). One measured render per page, so the
   contact sheet stays small.
2. Look at `audit-artifacts/index.html`, which groups every page per project. Tick
   `audit/baselines/review.json` (`{"<slug>": {"status":"ok"|"broken","note":"…"}}`) to remember a verdict.
3. Fix pivot/alignment with the three V2 defaults in mind: `pivot` defaults to the centre (a V1 `pos` meant
   the top-left corner), text alignment defaults to the middle (V1 was left), and settings are read as
   `_settings.<path>.value` (or through `_drawing`/`CVal` when the value is derived from the item size).
   Then re-run that project and look again.

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






## [x] MIGRATION CLEANUP

This website migrated to a new default voor pivots after commit `fc8deb9e`. LayoutOperations used to default to top-left (with no pivot set), but now they default to center. Not all legacy projects were updated, unfortunately.

So, do a sweep across all projects (that use LayoutOperation), and:

* Check for any instances that used to have NO pivot before this commit/migration, and still don't.
  * They are wrong now: they should set `pivot: Vector2.TOP_LEFT`
* Check for any instances that used to have `pivot: Vector2.CENTER` before this commit/migration, and still do.
  * They can be optimized now: remove the pivot so it falls back to the new default.

Once done, check the cheap typecheck/static check, but do NOT run any other audits or sweeps. This is partial work; defer actually running anything until I allow it.


## [x] TEXT SYSTEM CLEANUP:

Check the custom text capabilities of `RendererPandaqi` in the `pq-games` library.

* Write some tests (in a sub folder in `pandaqi-audit` that I can easily copy to the original pq-games library) to check if every part of the text system WORKS and DOES WHAT IT SHOULD. (Horizontal alignment, vertical alignment, justification, automatically calculating dimensions of text box when not given, etcetera)
* Fix anything that does not work. Add any features you think are useful.
* Optimize the system to be as fast as possible; the current drawing system loses a lot of time placing text
* Do NOT break the outward API that games use to create TextConfigs/ResourceTexts and such, because all those games should stay functional.

Run the tests until all are green, and you are certain the text system is robust and functions as it should. Do NOT run any actual audits or build the website. It's too expensive and this work is PURELY focused on the framework, not the games that use it.


## [x] MIGRATION CLEANUP:

This website migrated to a new default voor text layout after commit `fc8deb9e`. `TextConfig`s used to default to top-left anchoring (if nothing set), but now they default to centering text. Unfortunately, not everything was properly migrated yet. So,

* Find any text in games that used to have no special alignment set (it fell back to defaults), and still doesn't.
  * They are wrong now. They should do `.alignTopLeft()` (or set alignHorizontal, alignVertical properties when creating config) to get back to how they were.
* Find any text that used to center-align itself explicitly, and still does.
  * They can be optimized now: just remove that step, the default is center aligning!

One crucial part here is to check if the new center-aligning default is actually a 1-to-1 copy of the old one, and whether the new text defaults don't subtly change behavior that might cause many games to break. 

* For example, I looked at some games and their text seems positioned weirdly, suggesting something else changed too.
* The previous commit to this system happened to overhaul our text support code (though API should've stayed the same), so check that for any changes/the details of how exactly the system works now if unsure.

Once done, check the cheap typecheck/static check, but do NOT run any other audits or sweeps. This is partial work; defer actually running anything until I allow it.





## [ ] PROMPT

Code Architecture Improvement: The `LayoutOperation` class is essential to `pq-games` (drawing capabilities). But it's one big monoclass now.

* Break it down into smaller submodules (e.g. pos/rot/scale collected in one _transform_ thing). So we only initialize/create what we actually use and need, and applying/creating this operation isn't a huge single chunk of code.
* Create an alternative "function chain/builder" type of constructor => `layoutOperation.pos(xx).rot(yy).pivot(zz)` (Maybe use a LayoutOperationBuilder object as in-between to keep this functionality nicely separated.)
* IMPLEMENT the `_debug.layoutOperation` property for GameConfigs. When turned on, the LayoutOperation should be giving feedback (in logs and visual) about what it's doing, what it's calculated, where it think something should be placed, etcetera. This should help debugging a lot.
* SMALL NOTE: RendererPixi renderer does not fully/properly implement `mask`. Fix that. There might be a few more tiny edge cases with a property not (fully) supported in `RendererPixi` or `RendererPandaqi`; find them and solve them.

The public API for LayoutOperation should not be broken. (It shouldn't change except for the function chain builder _addition_.) All games using it should need no update and work just fine. This is purely an internal refactor to make it cleaner, faster, and more flexible/modular.

## [ ] PROMPT (RULEBOOKS)

A list of general improvements to the `pq-rulebook` library on this website. All changes are completely contained to that library, do not touch anything outside of it / unrelated to it.

* STYLING: Easy ways to overhaul a rulebook's style with custom styles/stylesheet (in case a user wants that) + prevent all these rulebooks from looking the same. 
  * Font size could be SMALLER IN GENERAL (in print)
  * And these rulebooks could look _slightly_ nicer and more flexible and more approachable, with minimal extra CSS cost.
* HEADER: Add the NAME OF THE GAME to the rulebooks, as now you don't have any clue!
  * ALSO: Use Paged.js (when advanced printing) to automatically put some small marker like `GameName > CurrentSection` in the page headers, to know where you are in the rulebook. Also check if page numbers are properly printed at the bottom.
* TOOLBAR: it's getting more and more buttons/content. So, instead, make it a hamburger menu or collapsible menu on smaller screens (when the buttons would start to wrap and look ugly.)
  * Extra buttons in toolbar: "fold/unfold rulebook tables" (or at least provide an alternative view where they're fully listed, nothing to click anymore)
* TOC: Add a "table of contents". 
  * On wide screens, it automatically displays next to the content (stuck to the left or right side of the screen), so you can always know where you are and click to go to a certain header.
  * On smaller screens, this would overlap the rulebook, so instead fold it into a button at the side or top to open/close the table of contents as needed.
  * ALSO add a small thin "progress bar" below the toolbar / at the top of the screen that moves as you scroll down a rulebook, tracking where you are right now.
  * Should Table of Contents show in Print too? Make that _false_ by default, but add a button/checkbox to the toolbar to make ToC show up properly at the start of rulebook when printed too.
* FIX: Rulebook tables look a bit ugly and weirdly sized still => 
  * Smaller text size by default.
  * The name of the thing should go BELOW the image (perhaps only in certain states)
  * Less generous padding/whitespace around it all.
  * Perhaps make Rulebook Table Icons _smaller_ when printing, because now they take up a loooot of space
  * **END GOAL (for this): Rulebook tables should look really nice and compact, both digitally and when printed. No ugly overflows, no taking up more space than needed, and no big layout shifts when something folds/unfolds one item of the table.**
* DEV: 
  * Expose some JS/global API for more direct access to stuff inside the rulebook after parsing. (To do custom modifications, reading of properties, debug, etc.)
  * Paged.JS support needs strong checks because it's inconsistent and broken. For example, on some pages it does nothing (seems to call print() before it finishes parsing).


**END GOAL:** A lean rulebook system (with no dependencies outside it) that is more feature complete and looks much nicer than before (while keeping a neutral look/lightweight built-in CSS styles)

Wait with checking the final results/output until you've done _all_ steps. Intermediate audits or checks will be garbage and slow you down.


## [ ] PROMPT

FIXES:

* PDF generation now defaults to a _black_ background. (Might be a _transparent_ background, actually, which shows up black in browser PDF viewer.) That's bad! Should be a white background (like paper; better for ink usage). This only happened after our changes (like directly inserting canvases into jsPDF instead of converting to images first). I really like these changes as they make the framework MUCH faster. So, find a simple way to get the background white again _without_ losing these performance gains.
* (Also, check if PDF compression is turned on again in the public build. It's turned off when auditing/developing, but should be turned on at release website, and I don't think it is right now.)
* Some generators create multiple PDFs. They currently use the same name, which leads to name collision while downloading. Make sure their names are differentiated meaningfully.
* The systems and styling work well on Windows/Chrome, but seem to be failing on (old) Safari/iPhones/apple products. Find possible causes for that and fix it.

CLEANUP PROMPT? => Sweep every remaining game under themes/pandaqi/assets/games for old-style `CONFIG._settings.*.value` and `CONFIG._drawing.*` reads that bypass getSetting/vis.get, tell me which are real leftovers versus intentional, and migrate the clear leftovers.



* PIETENPOKER: Text in all the wrong places.
* MAPPED OUT: Backgrounds (cards and tiles, everywhere) need their pivot reset to top left after default change.
* KANGARUSE: River lines (blue paths) are wrong now, possibly because some change forced lines to automatically _close_ themselves. (So every line also adds a stroke from end back to start, which is the error that seems to be happening.)
  * Assume this is a renderer/library bug introduced first.
  * If that is not the case, then just look at Kangaruse itself and what it does that might cause it.
* KANGARUSE: First rulebook image should be side view / side by side with text (using the standard HUGO shortcode for it), not above it.
* ONE PIZZA THE PUZZLE: I should provide an image of what it _should_ look like (premade) and tell AI to figure out what's going wrong in the new ones ---> And I can do that because it is SEEDED!