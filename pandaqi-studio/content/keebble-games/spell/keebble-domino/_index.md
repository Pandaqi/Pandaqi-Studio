---
type: "single"
gamepage: true
boardgame: true

title: "Keebble: Domino"
headerTitle: "The word game Keebble, now as a board game"
blurb: "A party game like Scrabble. A spin-off for Keebble. Played using dominoes and a special font where each letter is ... multiple letters."
blurbProject: "A 'traditional' game played with dominoes that look like different letters from different sides. Print and cut once, play however often you want."

customHeight: "small"
headerDarkened: true

color: "green"

bgColor: "#34032d"
bgColorLink: "#94d23e"

textColor: "#ecc6e5"
textColorLink: "#132001"

date: 2023-06-20

difficulty: "simple"
genres: ["abstract"]
categories: ["boardgame", "standard"]
tags: ["domino", "shared-map", "language", "spiritually-inspired"]
themes: ["colorful", "vector"]

extraCSS: true

downloadLink: "https://drive.google.com/drive/folders/14KGDtFeGMpGRltZorC6shHr3pYXGk5MQ"

multiplayermode: "competitive"
language: EN
playtime: 40
playercount: [2,3,4,5,6]
complexity: low
ages: everyone
devlog: "/blog/boardgames/keebble-domino/"

---


{{% boardgame-intro heading="" %}}

A word game like Scrabble, but played using letters that change when viewed from different directions. A domino-based entry in the [Keebble Games](/keebble-games/)

{{% /boardgame-intro %}}

{{% section-centered heading="What do I need?" %}}

Three steps.
* Read the [playful rules](rules). 
* Click the "Download" button and pick any **one** PDF with the material (4 pages)
* Download, print and cut it. Play!

**Want more?** Use the [domino generator](#material) below to generate a new PDF with completely new dominoes to play with!

{{% /section-centered %}}


{{% section-centered heading="Random Dominoes" anchor="material" html="true" %}}

<p>Input your settings. Click the button. A new page opens and generates your PDF!</p>

{{< boardgame-settings type="game" btn_label="Generate Cards" local_storage="keebbleDominoConfig" game_title="Keebble: Domino" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Removes most color to preserve ink." >}}
  {{< setting-checkbox id="setting-showLetters" text="Show letters?" remark="Adds a hint on the symbols about what letter they are from each direction." checked="checked" >}}
  {{< setting-checkbox id="setting-bigSize" text="Big Dominoes?" remark="Useful when playing with kids or those with impaired vision." >}}
  {{< boardgame-settings-section heading="Expansions" >}}
{{< setting-checkbox id="setting-expansions-specialCells" text="Supercells?" >}}
{{< setting-checkbox id="setting-expansions-wereWalls" text="Werewalls?" >}}
{{< setting-checkbox id="setting-expansions-toughLetters" text="Tough Letters?" remark="Adds symbols that are harder to read. Allows more unique letter combinations." >}}
  {{< /boardgame-settings-section >}}
{{< /boardgame-settings >}}

{{% /section-centered %}}

{{% section-centered heading="That's not a word!" %}}

Having discussions about whether something is a word? Use my [dictionary](/tools/dictionary) as your judge.

It only contains more common or popular words. Using it will solve this issue for groups endlessly debating what is a valid word!

{{% /section-centered %}}

{{< support >}}

{{% section-centered heading="Credits" %}}

Check out the main project page at [Keebble Games](/keebble-games/) for the credits and more information.

This version is a "traditional" board game. Grab your material (lots of dominoes) once and play with it forever. No blank papers or devices needed during play.

Of course, the interesting letters (that look like different letters from different angles) and domino rules make this game anything but regular!

For a detailed diary about the game, check out the [devlog](/blog/boardgames/keebble-domino).

{{% /section-centered %}}