---
type: "single"
gamepage: true
boardgame: true

title: "Slippery Slopes"
headerTitle: "Slippery Slopes | A party game about communicating words by grading them on funky scales."
blurb: "A party game about conveying words by grading them on funky scales. How do you communicate PIZZA when you only have hot-cold, heavy-light and dry-wet?"

fullHeaderImg: "creature_quellector_header"
headerImg: "creature_quellector_header"

headerThumb: "favicon"

customHeight: "large"
headerDarkened: true

color: "red"

bgColor: "#014556"
bgColorLink: "#601a87"

textColor: "#e6faff"
textColorLink: "#edccff"

googleFonts: ""

date: 2023-01-01 # 2024-04-25

categories: ["boardgame"]
tags: ["traditional", "party", "quick", "creativity", "group", "language"]

extraCSS: true

downloadLink: "https://drive.google.com/drive/folders/1Ewuqw4wDfazKhfhsoZx-QLfkhGGiiJqM"

multiplayermode: "cooperative"
language: EN
genre: ["card", "party", "language", "communication"]
playtime: 20
playercount: [2,3,4,5,6,7,8,9,10]
complexity: low
ages: everyone

---

{{% boardgame-intro heading="" img="creature_quellector_header" class="no-shadow" %}}

A party game about communicating words by grading them on funky scales.

{{% /boardgame-intro %}}

{{% section-centered heading="What do I need?" %}}

Three simple steps.
* Read the short [playful rules](rules).
* Download any one material PDF (using the "Download" button above).
* Print it, cut it, play!

**Want more?** You can also [generate your own material](#material) right on this website!

{{% /section-centered %}}

{{% section-centered heading="Material" anchor="material" html="true" %}}

<p>Input your settings, click the button. A new page opens that generates a nice PDF for you!</p>

{{< boardgame-settings type="game" local_storage="slipperySlopesConfig" btn_label="Generate Material" >}}
	{{< setting-hidden id="setting-gameTitle" text="Slippery Slopes" >}}
  {{< setting-checkbox id="setting-asGame" text="Start Game Instead?" remark="Starts the game interface to supply random words instead." >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material grayscale." >}}
  {{< setting-enum id="setting-cardSize" text="Card Size?" values="small,regular,huge" valaskey="true" def="regular" >}}
  {{< setting-checkbox id="setting-generateSliders" text="Generate Sliders?" checked="checked" >}}
  {{< setting-checkbox id="setting-generateWords" text="Generate Words?" checked="checked" >}}
  <h3>Word Settings</h3>
  {{< setting-enum id="setting-wordComplexity" text="Word Complexity?" values="Core,Easy,Medium" valaskey="true" remark="How hard should the words be?" def="Core" >}}
  {{< setting-checkbox id="setting-includeNamesAndGeography" text="Include names?" remark="Adds geography and proper names of people, brands, ..." >}}
  <h3>Expansions</h3>
  {{< setting-checkbox id="setting-glidyGifts" text="Glidy Gifts?" remark="Adds actions to help make guessing easier." checked="checked" >}}
  {{< setting-checkbox id="setting-crasheryCliffs" text="Crashery Cliffs?" remark="Slight rule changes and more slider types." >}}
{{< /boardgame-settings >}}

{{% /section-centered %}}

{{% section-centered heading="Using your Phone" %}}

By default, this game is completely offline: just download the material once, print it, and play.

But there are two parts that can be done online, if you so desire.

* Use my [timer](https://pandaqi.com/tools/timer) tool for the timer.
* Check the setting "Start Game" in the [settings](#material) above, then click start. Now you don't need printed word cards---the phone will supply random words!

{{% /section-centered %}}

{{< support >}}

{{% section-centered heading="Credits" %}}

The fonts used are **Frauces** (soft variation) for text and **Super Funtime** for headers. Everything else is mine.

This game is a sort of spiritual successor to my [That's Amorphe](https://pandaqi.com/thats-amorphe) games. I came up with the idea just as I was finishing the spin-off ([That's Amorphe Pictures](https://pandaqi.com/thats-amorphe-pictures)), but I had already committed to another project so I couldn't make it back then. 

Additionally, I ran into some problems I didn't know how to solve yet. Any creative idea starts out way more complicated and messy than the final product---simplifying and streamlining (game) ideas is perhaps the most important skill one can have.

This game takes the same idea of "communicate secret words/concepts in a vague and fun way", but puts a more precise and focused spin on it this time. The rules are even shorter and players who need a bit more certainty (instead of relying on creativity and inspiration) can find it in this game.

A simple, fast party game for any group!

For more details, as always, read the [devlog](https://pandaqi.com/blog/boardgames/slippery-slopes).

{{% /section-centered %}}