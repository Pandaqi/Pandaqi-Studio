---
type: "single"
gamepage: true
boardgame: true

title: "Slippery Slopes"
headerTitle: "A party game about communicating words by grading them on funky scales."
blurb: "A party game about conveying words by grading them on funky scales. How do you communicate PIZZA when you only have hot-cold, heavy-light and dry-wet?"

customHeight: "small"
headerDarkened: true

color: "red"

bgColor: "#014556"
bgColorLink: "#601a87"

textColor: "#e6faff"
textColorLink: "#edccff"

date: 2024-04-25

difficulty: "no-brainer"
genres: ["party"]
categories: ["boardgame", "standard"]
tags: ["social", "guessing", "sorting", "language", "creative", "limited-communication"]
themes: ["retro", "colorful"]

extraCSS: true

downloadLink: "https://drive.google.com/drive/folders/1Ewuqw4wDfazKhfhsoZx-QLfkhGGiiJqM"

multiplayermode: "cooperative"
language: EN
playtime: 20
playercount: [2,3,4,5,6,7,8,9,10]
ages: everyone
devlog: "/blog/boardgames/slippery-slopes/"

---

{{% boardgame-intro heading="" class="no-shadow" %}}

A party game about communicating words by grading them on funky scales.

{{% /boardgame-intro %}}

{{% section-centered heading="What do I need?" %}}

Three simple steps.
* Read the short [playful rules](rules).
* Download any (single) PDF. (Download > Files > Starter Pack.)
* Print it, cut it, play!

**Want more?** You can also [generate your own material](#material) right on this website! Or check the other file bundles at the download folder.

{{% /section-centered %}}

{{% section-centered heading="Material" anchor="material" html="true" %}}

<p>Input your settings, click the button. A new page opens that generates a nice PDF for you!</p>

{{< boardgame-settings type="game" local_storage="slipperySlopesConfig" btn_label="Generate Material" game_title="Slippery Slopes" defaults="true" >}}
  {{< setting-checkbox id="setting-generateSliders" text="Generate Sliders?" checked="checked" >}}
  {{< setting-checkbox id="setting-generateWords" text="Generate Words?" checked="checked" >}}

  {{< boardgame-settings-section heading="Word Settings" >}}
    {{< setting-enum id="setting-wordComplexity" text="Word Complexity?" values="Core,Easy,Medium" valaskey="true" remark="How hard should the words be?" def="Core" >}}
    {{< setting-checkbox id="setting-includeNamesAndGeography" text="Include names?" remark="Adds geography and proper names of people, brands, ..." >}}
  {{< /boardgame-settings-section >}}

  {{< boardgame-settings-section heading="Expansions" >}}
    {{< setting-checkbox id="setting-expansions-glidyGifts" text="Glidy Gifts?" remark="Adds actions to help make guessing easier." checked="checked" >}}
    {{< setting-checkbox id="setting-expansions-crasheryCliffs" text="Crashery Cliffs?" remark="Slight rule changes and more slider types." >}}
  {{< /boardgame-settings-section >}}
{{< /boardgame-settings >}}

{{% /section-centered %}}

{{% section-centered heading="Using your Phone" %}}

By default, this game is completely offline: just download the material once, print it, and play.

It is highly recommended, however, to add a timer to rounds. You can use any timer or app, including my own [Pandaqi Timer](https://pandaqi.com/tools/timer) page.

{{% /section-centered %}}

{{< support >}}

{{% section-centered heading="Credits" %}}

The fonts used are **Frauces** (soft variation) for text and **Super Funtime** for headers. Everything else is mine.

This game is a sort of spiritual successor to my [That's Amorphe](https://pandaqi.com/thats-amorphe) games. I came up with the idea just as I was finishing the spin-off ([That's Amorphe Pictures](https://pandaqi.com/thats-amorphe-pictures)), but I had already committed to another project so I couldn't make it back then. 

Additionally, I ran into some problems I didn't know how to solve yet. Any creative idea starts out way more complicated and messy than the final product---simplifying and streamlining (game) ideas is perhaps the most important skill one can have.

This game takes the same idea of "communicate secret words/concepts in a vague and fun way", but puts a more precise and focused spin on it this time. The rules are even shorter and players who need a bit more certainty (instead of relying on creativity and inspiration) can find it in this game.

A simple, fast party game for any group!

For more details, as always, read the [devlog](/blog/boardgames/slippery-slopes).

**UPDATE!** This game now also has a completely _digital_ version. Playable with just one smartphone, rules explained as you go, still the same fun core mechanic. Try it at: [Slippery Slopes: Trippy Touches](https://pandaqi.com/slippery-slopes-trippy-touches/).

{{% /section-centered %}}