---
type: "single"
draft: false
gamepage: true
boardgame: true

title: "Keebble"
headerTitle: "Keebble | It's scrabble, but better."
blurb: "A party game like scrabble, played using only a blank piece of paper. It's free, and it's faster."

fullHeaderImg: "keebble_header"
headerImg: "keebble_header"

headerThumb: "favicon"

customHeight: "small"
headerDarkened: true

color: "purple"

bgColor: "#c0e1ff"
bgColorLink: "#7c2b6b"

textColor: "#01201c"
textColorLink: "#eeb9e3"

googleFonts: ""

date: 2023-02-16

categories: ["boardgame"]
tags: ["one_paper_game", "opg"]

extraCSS: true
extraJS: true

downloadLink: "https://drive.google.com/drive/folders/1JeaAyDSFrnu_j8FeDztXyKyhUlNMPoKe"

multiplayermode: "competitive"
language: EN
genre: ["party", "interactive", "word", "opg"]
playtime: 20
playercount: [2,3,4,5,6]
complexity: low
ages: everyone

---


{{% boardgame-intro heading="" img="keebble_header" url="https://drive.google.com/drive/folders/1JeaAyDSFrnu_j8FeDztXyKyhUlNMPoKe" %}}

A word game that can be played with a blank piece of paper and a pen. Like Scrabble, but it doesn't take three hours and a big board.

{{% /boardgame-intro %}}

{{% section-centered heading="What do I need?" %}}

Three steps.
* Read the [playful rules](rules). 
* Grab some pens or pencils.
* Grab a blank piece of paper and fold it in half six times. (Or any other number, depending on how long you want the game to last.)

You can start completely blank. Or you can use the generator below to get a nice random _starting setup_!

{{% /section-centered %}}

{{% section-centered heading="Board" html="true" anchor="board" %}}

<p>Input your desired settings and click "generate".</p>

  {{< boardgame-settings type="board" local_storage="keebbleConfig" >}}
    {{< setting-hidden id="setting-gameTitle" text="Keebble" >}}
    {{< setting-playercount def="4" min="2" max="6" >}}
    {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly white / grayscale to conserve ink." >}}
    {{< setting-checkbox id="setting-forPrinting" text="For Printing?" remark="If you want to print this PDF and directly play on that." >}}
    {{< setting-enum id="setting-boardSize" text="Board Size?" values="Small,Medium,Large" valaskey="true" def="Medium" >}}
    {{< setting-checkbox id="setting-addWalls" text="Add walls?" checked="checked" remark="Walls are useful on small boards to allow more words." >}}
    <h3>Expansions</h3>
    {{< setting-checkbox id="setting-expansions-specialCells" text="Supercells?" >}}
    {{< setting-checkbox id="setting-expansions-cellDance" text="Celldance?" >}}
    {{< setting-checkbox id="setting-expansions-scrabbleScoring" text="Scrabble Scoring?" >}}
    {{< setting-checkbox id="setting-expansions-tinyBackpacks" text="Tiny Backpacks?" >}}
  {{< /boardgame-settings >}}

<p style="font-size:0.66em; opacity: 0.66;">Not working? Don't worry! At the "Download" link, you can also find PDFs with valid boards for all situations. Check the "Premade" folder.</p> 

{{% /section-centered %}}

{{% section-centered heading="That's not a word!" %}}

Having discussions about whether something is a word? Use my [dictionary](/tools/dictionary) as your judge.

It only contains more common or popular words. Using it will solve this issue for groups endlessly debating what is a valid word!

{{% /section-centered %}}

{{< support >}}

{{% section-centered heading="Credits" %}}

Fonts? "Arbetus Slab" for both heading and body.

This game was obviously inspired by Scrabble. Most people know and enjoy the game. But I saw some things to improve: it can take too long, you need to carry a big box, there's no variation to the board. 

I sought to improve those things. The result is "Keebble": free to play, highly portable, with simultaneous turns and more variation. Want more details? Check out the [devlog](https://pandaqi.com/blog/boardgames/keebble).

{{% /section-centered %}}