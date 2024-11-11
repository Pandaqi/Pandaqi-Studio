---
type: "gamepage"
boardgame: true

title: "Theme Parque"
headerTitle: "Design a theme park of dominoes together that scores you the most points."
blurb: "Design a theme park of dominoes together, but with the queues and attractions that score you the most points."
blurbShort: "Design a theme park together, but with strategical queuing and ride placement. A [Domino Diaries](/the-domino-diaries/) game."

weightProject: 30

downloadLink: "https://drive.google.com/drive/folders/1bgRo7I6wblim32c6pOV8wKh_CWHedtOB"

color: "green"

date: 2025-06-26

difficulty: "kids-can-play"
genres: ["family", "thematic"]
categories: ["boardgame", "tile-game"]
tags: ["domino", "shared-map", "matching", "turn-based", "market", "ownership", "high-score", "networks"]
themes: ["cartoon", "colorful"]

multiplayermode: ["cooperative", "competitive"]
language: EN
playtime: 30
playercount: [2,3,4,5]
ages: everyone
devlog: "/blog/boardgames/the-domino-diaries/theme-parque/"

---

{{% boardgame-intro /%}}

{{% boardgame-instructions /%}}

{{% boardgame-settings-container type="material" %}}

{{< boardgame-settings type="game" local_storage="themeParqueConfig" btn_label="Generate Material" game_title="Theme Parque" defaults="true">}}
  {{< setting-checkbox id="setting-addText" text="Add Text on Tiles?" checked="checked" remark="Explains how each special tile works on the tile itself." >}}
  {{< boardgame-settings-section heading="Sets" >}}
    {{< setting-checkbox id="setting-sets-pawns" text="Pawns?" checked="checked" >}}
    {{< setting-checkbox id="setting-sets-base" text="Base?" checked="checked" >}}
    {{< setting-checkbox id="setting-sets-rollercooper" text="Rollercooper?" remark="Allows playing the game cooperatively." >}}
    {{< setting-checkbox id="setting-sets-wishneyland" text="Wishneyland Parki?" >}}
    {{< setting-checkbox id="setting-sets-unibearsal" text="Unibearsal Honeyos?" >}}
    {{< setting-checkbox id="setting-sets-rollercoasters" text="Raging Rollercoasters?" >}}
  {{< /boardgame-settings-section >}}
{{< /boardgame-settings >}}

{{% /boardgame-settings-container %}}

{{% section-centered heading="Credits" anchor="credits" %}}

The fonts used are **Wild Ride** (headings) and **Besley** (body text). Some generative image AI was used. Everything else (code, idea, rules, illustrations) is entirely mine.

This was the very first idea for this collection. (In fact, as you might expect, when it was just one idea this wasn't a "collection" yet.) A simple domino placement game where you had to strategically connect (looong) queues to your rides to score the most points. After prototyping it on tiny pieces of paper, I made one or two crucial rule changes, but was otherwise very satisfied with the first attempt.

Half a year later, I actually made it, and also started this collection because of the other game ideas I'd had in the mean time. Writing the code to randomly generate (balanced, fair, playable) material was hard enough. 

Actually creating the graphical style might have been the hardest out of all my projects so far. 

How on _earth_ do you display amusement rides at an angle/perspective that is clear and easy to read from all angles? While the majority of the game focuses on the _paths_, which are top-down view, which is the _worst_ view for the attractions themselves. A carousel, whirligig, bumper cars, they all look pretty much identical and unidentifiable when seen from perfect top-down view.

In the end, after a lot of experimentation, I decided to go for perfect _side-view_ on the rides (and decorations/shops). I drew a simplified version myself first, then asked AI to add a bit more detail to it. In a way, I hedged my bets, and was prepared to just keep the simplified art style if everything didn't work out.

In the end, I think the graphics turned into a unique blend of "simple/cartoonish" and "detailed/textured" that certainly taught me a thing or two about graphic design.

(Also, yes, the fonts I use often give insight into my incredibly professional process for finding new fonts: by _name_ :p A font called "Wild Ride" just sounded perfect for a game about rides, so I _had_ to use it. That's also why the Dino-themed domino game has a font called _Cute Dino_. I'm just lucky the fonts were great and readable too.)

{{% /section-centered %}}