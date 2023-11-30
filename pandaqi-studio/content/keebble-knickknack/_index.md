---
type: "single"
draft: false
gamepage: true
boardgame: true

title: "Keebble: Knickknack"
headerTitle: "Keebble: Knickknack | A hybrid version of the word game Keebble"
blurb: "A party game like Scrabble. A spin-off for Keebble. Played using an empty paper and one phone with internet."

fullHeaderImg: "keebble_knickknack_header"
headerImg: "keebble_knickknack_header"

headerThumb: "favicon"

customHeight: "small"
headerDarkened: true

color: "blue"

bgColor: "#e5ffc1"
bgColorLink: "#00223f"

textColor: "#001e00"
textColorLink: "#a6cff6"

googleFonts: ""

date: 2023-05-20

categories: ["boardgame"]
tags: ["hybrid"]

extraCSS: true
extraJSBoard: true
extraJSBoardInclude: true

downloadLink: "https://drive.google.com/drive/folders/1_hK2ICc9T95hSLAGNO4mvBFmqpvrq_15"

multiplayermode: "competitive"
language: EN
genre: ["party", "interactive", "word"]
playtime: 60
playercount: [2,3,4,5]
complexity: low
ages: everyone

---


{{% boardgame-intro heading="" img="keebble_knickknack_header" %}}

A word game like Scrabble, but faster, simpler and more exciting. A hybrid spin-off of [Keebble](https://pandaqi.com/keebble).

{{% /boardgame-intro %}}

{{% section-centered heading="What do I need?" %}}

Three steps.
* Read the [playful rules](rules). 
* Grab some pens and a blank piece of paper.
* Open the [game interface](#game) on any device.

You can start completely blank. Or you can use the [board generator](#board) below to get a nice random _starting setup_!

{{% /section-centered %}}

{{% section-centered heading="Board" html="true" anchor="board" %}}

<p>Input your desired settings and click "generate".</p>

  {{< boardgame-settings type="board" local_storage="keebbleKnickKnackConfig" >}}
    {{< setting-hidden id="setting-gameTitle" text="Keebble: Knickknack" >}}
    {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly white / grayscale to conserve ink." >}}
    {{< setting-checkbox id="setting-forPrinting" text="For Printing?" remark="If you want to print this PDF and directly play on that." >}}
    {{< setting-checkbox id="setting-addWalls" text="Add walls?" checked="checked" remark="Walls are useful on small boards to allow more words." >}}
    {{< setting-checkbox id="setting-expansions-specialCells" text="Add Supercells?" remark="When playing with the special cells expansion." >}}
  {{< /boardgame-settings >}}

<p style="font-size:0.66em; opacity: 0.66;">Not working? Don't worry! At the "Download" link, you can also find PDFs I already generated for you.</p> 

{{% /section-centered %}}

{{% section-centered heading="Game" anchor="game" html="true" %}}

<p>Input your settings, click the button. A new page opens with the game interface!</p>

{{< boardgame-settings type="game" local_storage="keebbleKnickKnackConfig" >}}
	{{< setting-hidden id="setting-gameTitle" text="Keebble: Knick Knack" >}}
  {{< setting-checkbox id="setting-expansions-specialCells" text="Supercells?" >}}
  {{< setting-checkbox id="setting-expansions-ominousOptions" text="Ominous Options?" >}}
  {{< setting-checkbox id="setting-expansions-poignantPowerups" text="Poignant Powerups?" >}}
  {{< setting-checkbox id="setting-expansions-beefyBackpacks" text="Beefy Backpacks?" >}}
{{< /boardgame-settings >}}

{{% /section-centered %}}

{{% section-centered heading="That's not a word!" %}}

Having discussions about whether something is a word? Use my [dictionary](/tools/dictionary) as your judge.

It only contains more common or popular words. Using it will solve this issue for groups endlessly debating what is a valid word!

{{% /section-centered %}}

{{< support >}}

{{% section-centered heading="Credits" %}}

Check out the original version ([Keebble](https://pandaqi.com/keebble)) for the credits and more information.

This version simplifies many things, at the cost of requiring one device while playing. Why? Because now the device does the heavy lifting for you. It tracks score, it tracks letters, it tracks when the game ends, etcetera.

For a detailed diary about the game, check out the [devlog](https://pandaqi.com/blog/boardgames/keebble-knickknack).

{{% /section-centered %}}