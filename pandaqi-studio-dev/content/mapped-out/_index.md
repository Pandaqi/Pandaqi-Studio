---
type: "gamepage"
boardgame: true

title: "Mapped Out"
headerTitle: "Design the treasure map to make the most of the random route you were given at the start."
blurb: "Design the treasure map to make the most of the random route you were given at the start."

color: "orange"

downloadLink: "https://drive.google.com/drive/folders/1_jKU6uzGmq2h1d1IVBt3R_kadOrny3vB"

date: 2026-01-26

difficulty: "no-brainer"
genres: ["family", "thematic"]
categories: ["boardgame", "tile-game"]
tags: ["bias", "domino", "shared-map", "matching", "area-control", "ownership", "textless", "turn-based", "high-score"]
themes: ["cartoon", "animals", "nature", "textured", "prehistoric", "history"]

multiplayermode: ["cooperative", "competitive"]
language: EN
playtime: 20
playercount: [2,3,4,5]
ages: everyone
devlog: "/blog/boardgames/mapped-out/"

---

{{% boardgame-intro /%}}

{{% boardgame-instructions /%}}

{{% boardgame-settings-container type="material" %}}

{{< boardgame-settings type="game" local_storage="mappedOutConfig" btn_label="Generate Material" game_title="Mapped Out" defaults="true">}}
  {{< boardgame-settings-section heading="Sets" >}}
    {{< setting-checkbox id="setting-sets-base" text="Base?" checked="checked" >}}
    {{< setting-checkbox id="setting-sets-landsUnknown" text="Lands Unknown?" >}}
    {{< setting-checkbox id="setting-sets-unclearInstructions" text="Unclear Instructions?" >}}
  {{< /boardgame-settings-section >}}
{{< /boardgame-settings >}}

{{% /boardgame-settings-container %}}

{{% section-centered heading="Credits" anchor="credits" %}}

The fonts used are **Vanilla Whale** (headings) and **Source Serif (4)** (body text). Everything else is mine.

This idea was hard to "finalize". It started with a very simple one-liner idea: "Let's turn the typical board game with a map _on its head!_"

Instead of having a pawn on a map and trying to walk the optimal route ... you start with a fixed route (set of directions on cards) and must design the _map_ to get the most out of your route.

Very unique, very promising, but ... how do you make this into a game? How do you give players a fixed route they can't change (too much), without making players just feel powerless or their route unfair? And how do you reward players for "walking a good route through the map", without having very complicated scoring rules?

After several iterations, I figured out the simplest system possible to accomplish all this. As usual, the solution was to kill several birds with one stone: when you _add_ a tile to the map on your turn, that same tile also shows an _action_ to get to know more about your route. Players need to constantly balance building a map that gives them loads of points, with actions that will actually reveal their secret route they're supposed to walk at the end.

It took a few tries, but finally the ideas came together and we get this nice little game as a result!

Also, a lot of my original ideas were decisively moved to _expansions_, to really keep the base game small, textless, and kid friendly. If you think the base game is a bit too simplistic or straightforward, be sure to try out the expansions.

{{% /section-centered %}}