---
type: "gamepage"
boardgame: true

title: "Tossing Tiger, Rolling Dragon"
headerTitle: "Prepare the right series of kung-fu attacks to win the war, while hoping your opponent didn't roll the exact counter moves."

weightProject: 25

downloadLink: "@TODO"

color: "orange"

date: 2025-11-26

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
devlog: "/blog/boardgames/the-luck-legends/tossing-tiger-rolling-dragon/"

---

{{% boardgame-intro /%}}

{{% boardgame-instructions /%}}

{{% boardgame-settings-container type="material" %}}

{{< boardgame-settings type="game" local_storage="tossingTigerRollingDragonConfig" btn_label="Generate Material" game_title="Tossing Tiger, Rolling Dragon" defaults="true">}}
  {{< boardgame-settings-section heading="Sets" >}}
    {{< setting-checkbox id="setting-sets-base" text="Base?" checked="checked" >}}
    {{< setting-checkbox id="setting-sets-fightTogether" text="Fight Together?" remark="A tiny expansion that allows playing in teams with simultaneous wars." >}}
    {{< setting-checkbox id="setting-sets-dawndojo" text="Dawndojo?" remark="An expansion with risky cards that can upset an entire war before it even started." >}}
  {{< /boardgame-settings-section >}}
{{< /boardgame-settings >}}

{{% /boardgame-settings-container %}}

{{% section-centered heading="Credits" anchor="credits" %}}

The fonts used are **XX** (headings) and **YY** (body text). Everything else is mine.

The idea of an "auto-battler" probably came from _Challengers!_ (Though this game is a heavily modified version and barely recognizable as such.) Yes, the battle between two players (during a turn) has some parts that automatically resolve following simple rules. But you might get a lot of choices before, during, and after that makes it far from "automatic". (Both players do, in fact---both the attacker and defender.)

I combined that idea with a powerful feature of my "dice as cards system": completely custom dice. The cards in this game have no numbers or inherent "high/low" values. Instead, the cards are very diverse and have a sort of "rock, paper, scissors" relationship. A strong kick might beat certain cards ... but be completely weak against others.

After some refinement, the game became a very simple but unique experience with a silly martial arts style. This refinement mostly came down to simplifying and removing half my ideas for animals, because having more than 10 unique cards that can appear is just too much. It also doesn't work well with a "weakness" system: if there are 20 animals, how are you ever going to display the 10 animals to which something is weak on just a small card? ;)


@TODO

{{% /section-centered %}}