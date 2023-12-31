---
type: "single"
draft: false
gamepage: true
boardgame: true

title: "That's Amorphe: Pictures"
headerTitle: "That's Amorphe: Pictures | A spin-off for That's Amorphe played using drawings"
blurb: "A party game about changing someone else's drawing into a different thing, then asking others to guess how much you changed it."

headerThumb: "thats_amorphe_pictures_header"

customHeight: "small"
color: "turqoise"

bgColor: "#eafeff"
bgColorLink: "#1b5458"

textColor: "#021e20"
textColorLink: "#eafeff"

googleFonts: "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,700;1,400&family=Ribeye&display=swap"

date: 2023-03-10

categories: ["boardgame"]
tags: ["traditional"]

extraCSS: true

downloadLink: "https://drive.google.com/drive/folders/1ovrsGP6oso--ii20P5tOfOsdDVRWzz0r"

multiplayermode: "cooperative"
language: EN
genre: ["party", "social", "drawing", "association", "guessing"]
playtime: 75
playercount: [2,3,4,5,6,7,8,9,10]
complexity: low
ages: everyone
---


{{% boardgame-intro heading="" img="thats_amorphe_pictures_header" %}}

You receive a drawing of a cat. You have to change it into a farmer with just three lines. Others need to guess what on earth you did. A spin-off of [That's Amorphe](https://pandaqi.com/thats-amorphe).

{{% /boardgame-intro %}}

{{% section-centered heading="What's the idea?" %}}
Each round, you're teamed up (randomly) in pairs. You draw a word from your card, then give it to your teammate.

They must _change_ your drawing to a different word (from their card). But only by _some secret amount_! 

How do you change a dog into a house _by a little bit_? How do you turn a fireman into a teddy bear _by a lot_?

You score points only if the other players guess your secret number!
{{% /section-centered %}}

{{% section-centered heading="What do I need?" %}}

Three simple steps.

* Click the "Download" button to find the Rules and Material.
* Pick any **one** PDF with "word cards" (4 pages)---print it.
* Read the rules (2 pages) and have fun!

**Competitive?** The game can be played cooperatively _and_ competitively. For the second mode, however, you need one extra page of material (see "vote tokens").

**Want more?** This website can generate [new word cards](#word_cards) for you!

{{% /section-centered %}}

{{% section-centered heading="Word Cards" html="true" anchor="word_cards" %}}

<p>Input your desired settings. The page will generate a PDF file with random word cards.</p>
<p>Print them, cut them, play with them!</p>
<p>When in doubt, just leave the options at their default settings.</p>

  {{< boardgame-settings type="game" btn_label="Generate Cards" local_storage="thatsAmorphePicturesConfig" >}}
    {{< setting-hidden id="setting-gameTitle" text="That's Amorphe: Pictures" >}}
    {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?"  remark="Turns the material mostly white / grayscale to conserve ink." >}}
    {{< setting-enum id="setting-wordComplexity" text="Word Complexity?" values="Core,Easy,Medium,Hard,Hardcore" valaskey="true" remark="How hard should the words be?" def="Easy" >}}
    {{< setting-checkbox id="setting-addActions" text="Add Actions?" remark="Allows the cards to be used with the Actions expansion." checked="checked" >}}
    {{< setting-checkbox id="setting-includeGeography" text="Include geography?" remark="Adds cities, countries and continents." >}}
    {{< setting-checkbox id="setting-includeNames" text="Include names?" remark="Adds proper names of famous people, brands, events, etcetera." >}}
    {{< setting-checkbox id="setting-useAllCategories" text="Use all categories?" remark="Overwrite the options below to include <em>everything</em>." >}}
    <h3>Categories</h3>
    {{< setting-checkbox-multiple id="setting-categories" values="anatomy,animals,business,clothes,colors,digital,food,general,holidays,items,military,music,nature,occupations,people,places,science,shapes,sports,time,travel,vehicles" valuesChecked="animals,food,items,places,vehicles" >}}
  {{< /boardgame-settings >}}

{{% /section-centered %}}

{{% section-centered heading="Timer" %}}

It's highly recommended to put a (strict) timer on the drawing rounds. Players might say they don't want that: they are wrong 😉 It makes the game quicker, more fun, and prevents any "cheats" players will come up with (like making very detailed drawings).

You can use anything! Or use my simple [timer](/tools/timer/) page.

{{% /section-centered %}}

{{< support >}}

{{% section-centered heading="Credits" %}}

This game is a spin-off of [That's Amorphe](https://pandaqi.com/thats-amorphe). Visit that page for more information! 

The two games are very similar. In fact, you can reuse material if you want. But this version is slightly simpler, more immediate, and more accessible. (Most people can draw _somewhat_, while they might struggle to find words.) You might view it as a "sequel".

Want to know how I developed this game? Check out the [devlog](https://pandaqi.com/blog/boardgames/thats-amorphe-pictures/).

{{% /section-centered %}}