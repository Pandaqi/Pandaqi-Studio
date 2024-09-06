---
type: "gamepage"
boardgame: true

title: "Fiddlefoo"
headerTitle: "Get rid of your cards without allowing others to throw their music at you."
blurb: "Get rid of your cards without allowing others to throw their music at you."

downloadLink: "https://drive.google.com/drive/folders/1fRQWyYs7Vi9pX8ArL0zFN87Q-b7G3eIf"

color: "yellow"

date: 2025-01-12

difficulty: "kids-can-play"
categories: ["boardgame", "card-game"]
genre: ["family", "abstract"]
tags: ["shared-map", "grid", "turn-based", "score-and-reset", "numbers"]
themes: ["colorful", "music"]

multiplayermode: ["competitive", "cooperative"]
language: EN
playtime: 30
playercount: [2,3,4,5,6]
ages: everyone
devlog: "/blog/boardgames/fiddlefoo/"

---

{{% boardgame-intro /%}}

{{% boardgame-instructions /%}}

{{% boardgame-settings-container type="material" %}}

{{< boardgame-settings type="game" local_storage="fiddlefooConfig" btn_label="Generate Material" game_title="Fiddlefoo" defaults="true">}}
  {{< boardgame-settings-section heading="Sets" >}}
    {{< setting-checkbox id="setting-sets-base" text="Base?" checked="checked" >}}
    {{< setting-checkbox id="setting-sets-expansion" text="Expansion?" >}}
  {{< /boardgame-settings-section >}}
{{< /boardgame-settings >}}

{{% /boardgame-settings-container %}}

{{% section-centered heading="Credits" anchor="credits" %}}

The fonts used are **Andada** (body text) and **Casanova** (heading). Everything else (idea, code, assets, rules, etcetera) is mine.

This game is pretty directly inspired by _Cabanga!_ After playing it, I immediately knew the core idea was solid and good. ("Play a card matching a card of the same color. This creates a range between those numbers; other players may throw away cards within that interval!") 

But I also thought it might be interesting to take the core idea in a slightly different direction. Add a bit more depth, reduce a bit of randomness, allow more player counts. After writing down my first idea and testing some paper prototypes, I found this new approach: play the cards to a shared _map_ and provide a _secondary_ way to gain/lose cards (reusing the music notes already on the cards).

All of that combined into the game Fiddlefoo! A simple and quick game that is surely distinct from its inspiration, in exactly the ways I was looking for.

{{% /section-centered %}}