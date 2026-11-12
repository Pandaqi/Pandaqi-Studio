# Roadmap / To-Do

## Important

The source for the website's libraries are in the [PQ-Games](https://github.com/Pandaqi/pq-games) and [PQ-Rulebook](https://github.com/Pandaqi/pq-rulebook) folders. Do _not_ update these libraries directly within this project. Make updates **to the libraries**---they are always the latest version. Then simply update/refresh to their latest version in `pandaqi-studio`.

@TODO (temporary): MOVE THESE FROM PANDAQI-STUDIO BACK TO PANDAQI-STUDIO-DEV:

* ALL OF pq-games and pq-rulebook, `functionality.ts`
* UPDATE BACK LAYOUTS TOO => `show-video.html`, `head.html`, `load-assets.html`, `footer-dynamic.html`, `load-assets-custom.html`, `project-buttons.html`, `support.html`


## V1 -> V2

At the end of 2025, Pandaqi migrated to a completely new version. Its entire codebase + structure was updated to something much cleaner. (The same treatment was applied to its pq-games and pq-rulebook libraries.)

**The migration is finished. But the website is so massive that I have not manually checked _all_ parts of _all_ projects.**

The checklist below is a list of everything left to inspect manually.

**Check the ROADMAP.md from PQ-Games / PQ-Rulebook for a checklist of exactly what changed between V1 and V2.**

### Rulebooks

For each rulebook, test **layout** and **interactive examples**.

Biggest things to watch out for.

* Update reading settings to `_settings.blabla.value` (or `_drawing` in more specific cases).
* Check pivot center (was default 0,0 before, now default center) + textAlign center (was default left before, now default center) -> this mostly results in text being in the wrong position or seemingly not displayed at all.

Games: (`~` is updated to new API (layout/examples) but no manual test, `x` is completely done)

* [~~] Bidding Blocks
* [x] Noble Flood
* [~~] Pietenpoker
* [~~] Six of Sparrows
* [~~] Feed the Beast
* [~~] Fiddlefoo
* [~~] Firecrackers
* [~~] Hold My Bear
* [x] I Bid You Not
* [~~] Kangaruse
* [~~] Keebble
* [~~] Keebble Domino
* [~~] Keebble Knickknack
* [x] Magnetmen
* [~~] Maybe Minister
* [~~] Maybe Movies
* [~~] Maybe Missions
* [~~] Mountain Miners
* [~~] Crashing Cars (2)
* [~~] Frightening Flights (2)
* [~~] Singing Sails
* [~~] Swerving Spaceships (2)
* [~~] Troublesome Trains (2)
* [~~] Pyrrameds
* [~~] Sleighwell
* Swiftsmash
  * [~~] Booksmack
  * [~~] Cookie Smasher
  * [~~] Point-a-Pile
  * [~~] Racesmack
  * [~~] Smackshapes
* Luck Legends
  * [~~] A Little White Die
  * [~~] Champions of Chance
  * [~~] Deceptidice
  * [~~] Lucky Lions
* Outnumbered
  * [~~] Nine Lives
  * [~~] Nine Lives Math Meows
  * [~~] Nine Lives Tricksy Kittens
  * [~~] Sixpack (2)
* Throneless
  * [~~] Kaizerseat
  * [~~] Kingseat
  * [~~] Queenseat
  * [~~] Smallseat
* [~~] Creature Quellector
* [~~] Waterfall Games (both)

Custom Issues:

* FIDDLEFOO: The interactive examples uses the old/wrong rules, doesn't it?
* NAIVIGATION: Needs the most work with its custom rulebook examples and stuff.


### One Paper Games / Game Board Generators

List all games that have one, check, cross off.

### Games

Get **games** completely functional again. Test them all + improve visuals as needed.

Games completely turned off because they REQUIRE the digital component to be working: **Keebble, That's Amorphe, Pirate Games, Wie is de Trol, Timely Transports, Wondering Witches, Starry Skylines, Slippery Slopes: Trippy Touches**

Use `hideGame`, `hideBoard`, and `hideRules` frontmatter if needed to temporarily disable something per-project.

Custom Notes:

* FIX: HASTY ACCUSATIONS doesn't even use the `MaterialGenerator` system yet => need to switch to it still!
* FIX: THE OLDEST GAMES DON'T ACTUALLY USE `CVal`. They do use `vis.get("key")`, but manually multiply with what they need. Think of games like: Firecrackers, Hold my Bear, Magnetmen, Sleighwell, Nine Lives + Sixpack. Migrate all legacy games to new system.

### Advanced Fixes

This is all **finetuning** and **refactoring** that's optional / future stuff.

* FIX Square Ogre + Round Ogre have "invalid id" for youtube player?? WHYYY?
* FIX Tools should load the general TOOL css, not just/necessarily the WEBSITE one! => FUCK THAT, create PQ-GAMEBUDDY and just host _that_.
* WEBSHOP -> also add sneakpeeks for Legends of Luck, Easter Eggventures, Domino Diaries?
* For TYPE-CHECKING/COMPLETENESS, we'd really want a `custom` field in `_settings` and put all our custom settings in there ... But that would create a LOT of boilerplate and rewriting. => I "patched" this for now by just allowing `[name: string]: any` in that field
* Actual styling/design for reviews
* Think about changing **game** subfolder to **material** for board games. Then we can keep **game** for actual games. (And if needed, we can keep **tool** for extra optional tools.) => Probably a good idea. Just means even more work ...

UGLY GAMES:

* **Keebble Domino** => Conversion for material generation was really rough, it's probably broken in many spots.
* **That's Amorphe** => Same. Needed full conversion from very old/bad code, as this was the very first game where I even _tried_ to generate material on the fly. Probably broken in many small ways.
* **The Pirate Games (Riddlebeard/Drawingbeard)** => they use completely custom code so it's a mess and I didn't update it properly/enough, I assume.
* **The Photomone Games** are a fucking mess too. Just ensure Rulebook + Board Generation works, everything else can be removed/disabled/forgotten.
* **The Naivigation games (visit/big 5)** will probably be broken in many places too. I can't check how everything worked and connected again just from code; need to see it when the transformation is done.
  * Check if Naivigation rulebook examples still work ... because they're coded in a special way and it confuses me now


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

