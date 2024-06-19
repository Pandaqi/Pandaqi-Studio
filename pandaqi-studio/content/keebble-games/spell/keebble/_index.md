---
type: "gamepage"
boardgame: true

title: "Keebble"
headerTitle: "It's scrabble, but better"
blurb: "A party game like scrabble, played using only a blank piece of paper. It's free, and it's faster."
blurbShort: "A word game that can be played with a blank piece of paper and a pen. Like Scrabble, but it doesn't take three hours and a big board."

blurbProject: "The original! A One Paper Game, only needs an empty paper and some pens, plays quickly and simply."
weightProject: 10

color: "purple"

date: 2023-02-16

difficulty: "kids-can-play"
genres: ["abstract"]
categories: ["boardgame", "one-paper-game"]
tags: ["grid", "shared-map", "language", "spiritually-inspired"]
themes: []

extraJSBoardInclude: true

downloadLink: "https://drive.google.com/drive/folders/1JeaAyDSFrnu_j8FeDztXyKyhUlNMPoKe"

multiplayermode: "competitive"
language: EN
playtime: 20
playercount: [2,3,4,5,6]
ages: everyone
devlog: "/blog/boardgames/keebble/"

---

{{% boardgame-intro /%}}

{{% section-centered heading="What do I need?" %}}

Three steps.
* Read the [playful rules](rules). 
* Grab some pens or pencils.
* Grab a blank piece of paper and fold it in half six times. (Or any other number, depending on how long you want the game to last.)

You can start completely blank. Or you can use the generator below to get a nice random _starting setup_!

{{% /section-centered %}}

{{% boardgame-settings-container type="board" %}}

{{< boardgame-settings type="board" local_storage="keebbleConfig" game_title="Keebble" defaults="true" >}}
  {{< setting-playercount def="4" min="2" max="6" >}}
  {{< setting-checkbox id="setting-forPrinting" text="For Printing?" remark="If you want to print this PDF and directly play on that." >}}
  {{< setting-enum id="setting-boardSize" text="Board Size?" values="Small,Medium,Large" valaskey="true" def="Medium" >}}
  {{< setting-checkbox id="setting-addWalls" text="Add walls?" checked="checked" remark="Walls are useful on small boards to allow more words." >}}
  {{< boardgame-settings-section heading="Expansions" >}}
    {{< setting-checkbox id="setting-expansions-specialCells" text="Supercells?" >}}
    {{< setting-checkbox id="setting-expansions-cellDance" text="Celldance?" >}}
    {{< setting-checkbox id="setting-expansions-scrabbleScoring" text="Scrabble Scoring?" >}}
    {{< setting-checkbox id="setting-expansions-tinyBackpacks" text="Tiny Backpacks?" >}}
  {{< /boardgame-settings-section >}}
{{< /boardgame-settings >}}

{{% /boardgame-settings-container %}}

{{% section-centered heading="That's not a word!" %}}

Having discussions about whether something is a word? Use my [dictionary](/tools/dictionary) as your judge.

It only contains more common or popular words. Using it will solve this issue for groups endlessly debating what is a valid word!

{{% /section-centered %}}

{{< support >}}

{{% section-centered heading="Credits" %}}

Check out the main project page at [Keebble Games](/keebble-games/) for the credits and more information.

This was the very first Keebble game. The original, if you want. In fact, this only turned into a _project_ (with multiple games) later.

This is no replacement for Scrabble, of course not. But it's close in theme and feel, while only requiring a single empty paper (or a printed one with random setup, if you want) and playing much faster. Travel Scrabble, perhaps. 

Trying to develop such a unique experience taught me a lot about game design _and_ gave me the ideas for the other versions, which have deeper gameplay and are more "traditional" games.

{{% /section-centered %}}