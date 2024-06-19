---
type: "gamepage"
boardgame: true

title: "Pirate Riddlebeard"
headerTitle: "Be the first to find the secret location of the treasure!"
blurb: "A One Paper Game for 1-6 pirates about discovering all the secret hints leading to the treasure."


color: "purple"



date: 2022-06-02

difficulty: "simple"
genres: ["puzzle"]
categories: ["boardgame", "hybrid-game", "one-paper-game"]
tags: ["deduction", "turn-based", "logic"]
themes: ["pirate"]
downloadLink: "https://drive.google.com/drive/folders/1GXtqwg9tsK57zDzmiumtdtlgn3NeAHuF"

multiplayermode: "competitive"
language: EN
playtime: 45
playercount: [1,2,3,4,5,6]
ages: everyone
devlog: "/blog/boardgames/the-pirate-games/devlog-pirate-riddlebeard/"

---


{{% boardgame-intro /%}}

<!-- Introduction + explanation text -->
{{% section-centered heading="What's the idea?" %}}

Pirate Riddlebeard hid a treasure in one square of the map. He left behind a set of unique hints leading to it.

But each player only receives part of that list! Figure out what the other pirates know, without giving away your own information.

Find the treasure before the others!

{{% /section-centered %}}

{{% section-centered heading="What do I need?" %}}

Three steps.
* Read the rules. (Click the "Download" button. Base game is two pages.)
* Grab some pens and papers.
* Start the [game](#game) on your phone and play!

**Phone?** You only need a device (and internet) at the start to generate a new game. Once setup is done, you can put it away.

**Offline version?** Also available in the rulebook.

{{% /section-centered %}}

{{% boardgame-settings-container type="game" %}}

{{< boardgame-settings type="game" local_storage="pirateRiddlebeardData" game_title="Pirate Riddlebeard" >}}
  {{< setting-seed >}}
  {{< setting-playercount min="1" max="6" def="4" >}}
  {{< setting-checkbox id="setting-premadeGame" text="Create PDF?" remark="Downloads a PDF with a board and hint cards for offline play." >}}
  
  {{< boardgame-settings-section heading="Map" >}}
    {{< setting-checkbox id="setting-allTerrains" text="More Terrains?" remark="Increases number of terrains to six." >}}
    {{< setting-checkbox id="setting-includeStones" text="Stones?" remark="Adds stones to the map ( + hints about them)." >}}
    {{< setting-checkbox id="setting-includeRoads" text="Roads?" remark="Adds roads to the map ( + hints about them)." >}}
    {{< setting-checkbox id="setting-includeLandmarks" text="Landmarks?" remark="Adds landmarks to the map ( + hints about them)." >}}
    {{< setting-checkbox id="setting-isColored" text="Colored?" remark="Creates a colored and bigger board." >}}
  {{< /boardgame-settings-section >}}

  {{< boardgame-settings-section heading="Bonus Rules" >}}
    {{< setting-checkbox id="setting-multiHint" text="Multi Hints?" remark="Players can receive multiple hints" >}}
    {{< setting-checkbox id="setting-advancedHints" text="Advanced Hints?" remark="Adds many types of hints that are really hard to figure out." >}}
    {{< setting-checkbox id="setting-expansions-liarsCouncil" text="Liar's Council?" >}}
    {{< setting-checkbox id="setting-expansions-theLostRiddles" text="The Lost Riddles?" >}}
    {{< setting-checkbox id="setting-expansions-tinyTreasures" text="Tiny Treasures?" >}}
    {{< setting-checkbox id="setting-expansions-gamblerOfMyWord" text="Gambler of my Word?" >}}
  {{< /boardgame-settings-section >}}
{{< /boardgame-settings >}}

{{% /boardgame-settings-container %}}

{{< support >}}

{{% section-centered heading="Credits" %}}

**Fonts?** _Chelsea Market_ for headings, _Charis SIL_ for text, freely available on Google Fonts.

**Website (boards and game)?** The _Phaser 3_ library for programming, free and open source.

**Is this magic!?** Nah, sorry, it's an algorithm. It generates a map and hints that, when combined, point to precisely one location. Most of the work actually went into balancing and finetuning: making the maps pretty and easy to look at, ensuring hints are equally valuable, removing easy guesses, etcetera.

Want to know how I made that? I've written articles!
- [How to create logic deduction (board)games](/blog/tutorials/deduction-boardgames-part-1-passive)
- [(Devlog) Pirate Riddlebeard](/blog/boardgames/the-pirate-games/devlog-pirate-riddlebeard)

{{% /section-centered %}}