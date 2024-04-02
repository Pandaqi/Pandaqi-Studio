---
type: "single"
gamepage: true
boardgame: true

title: "That's Amorphe"
headerTitle: "A party game about what's halfway between a moon and an eye"
blurb: "A party game about imagining what happens if one thing morphed into another---or guessing what other players mean with their inventions."

customHeight: "small"
color: "red"

bgColor: "#ffe4e0"
bgColorLink: "#ff6b6b"

textColor: "#1a0202"
textColorLink: "#590808"

googleFonts: "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,700;1,400&family=Ribeye&display=swap"

date: 2023-02-27

categories: ["boardgame"]
tags: ["hybrid", "traditional"]

extraCSS: true

downloadLink: "https://drive.google.com/drive/folders/1H1gLrHUsju_tnXbKoJYrsGP1sHRNG-6_"

multiplayermode: "cooperative"
language: EN
genre: ["party", "social", "word", "association", "guessing"]
playtime: 45
playercount: [2,3,4,5,6,7,8]
complexity: low
ages: everyone
devlog: "/blog/boardgames/thats-amorphe/"

---

{{% boardgame-intro heading="" %}}

What happens when you morph a cat halfway into a house? And what if you do it _a little bit_? A party game about inventing things and then asking others to guess what on earth you meant.

{{% /boardgame-intro %}}

<!-- Introduction + explanation text -->
{{% section-centered heading="What's the idea?" %}}

Draw two **word cards**. Place them open on the table: these are the start and end of your _scale_.

Then you draw a **secret** morph card. It tells you how much the _first word_ morphs into the _second word_.

It's up to you to _invent_ something that fits the description! 

What's halfway a bike and a house? What's 80% between a cow and a car? What's _mostly_ like a laptop, but also a _little bit_ like a banana?

The other players must answer these questions. You score points only if they guess (close to) the correct morph number!

{{% /section-centered %}}

{{% section-centered heading="What do I need?" %}}

Four simple steps.

* Click the "Download" button to find the Rules and Material.
* Pick any **one** PDF with "word cards" (4 pages)---print it.
* Download the PDF with "morph cards" (1 page)---print it.
* Read the rules (2 pages) and have fun!

**Want more?** This website can generate [random word cards](#word_cards) for you! You know, if you've played the game fifty times and want some variation.

{{% /section-centered %}}

{{% section-centered heading="Word Cards" html="true" anchor="word_cards" %}}

<p>Input your desired settings. The page will generate a PDF file with random word cards.</p>
<p>Print them, cut them, play with them!</p>
<p>When in doubt, just leave the options at their default settings.</p>

  {{< boardgame-settings type="game" btn_label="Generate Cards" local_storage="thatsAmorpheConfig" >}}
    {{< setting-hidden id="setting-gameTitle" text="That's Amorphe" >}}
    {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?"  remark="Turns the material mostly white / grayscale to conserve ink." >}}
    {{< setting-enum id="setting-wordComplexity" text="Word Complexity?" values="Core,Easy,Medium,Hard,Hardcore" valaskey="true" remark="How hard should the words be?" def="Easy" >}}
    {{< setting-checkbox id="setting-addActions" text="Add Actions?" remark="Allows the cards to be used with the Actions expansion." checked="checked" >}}
    {{< setting-checkbox id="setting-varyWordCount" text="Vary number of words?" remark="Will make the game harder, as cards have fewer options." >}}
    {{< setting-checkbox id="setting-includeGeography" text="Include geography?" remark="Adds cities, countries and continents." >}}
    {{< setting-checkbox id="setting-includeNames" text="Include names?" remark="Adds proper names of famous people, brands, events, etcetera." >}}
    {{< setting-checkbox id="setting-useAllCategories" text="Use all categories?" remark="Overwrite the options below to include <em>everything</em>." >}}
    <h3>Categories</h3>
    {{< setting-checkbox-multiple id="setting-categories" values="anatomy,animals,business,clothes,colors,digital,food,general,holidays,items,military,music,nature,occupations,people,places,science,shapes,sports,time,travel,vehicles" valuesChecked="animals,food,items,places,vehicles" >}}
  {{< /boardgame-settings >}}

{{% /section-centered %}}

{{% section-centered heading="Taking too long?" %}}

Coming up with a great morph is _hard_. People might take too long on their turn, while they keep thinking and can't make a decision.

To solve that, use my [timer](/tools/timer/). A length of 1-2 minutes (at most!) should be great.

{{% /section-centered %}}

{{< support >}}

{{% section-centered heading="Credits" %}}
          
Fonts? [Ribeye](https://fonts.google.com/specimen/Ribeye) for headings. [Lora](https://fonts.google.com/specimen/Lora) for the rest. Both are freely available on Google Fonts.

The inspiration for this game came from popular party games such as Wavelength.

Want to know how I developed this game? Check out the [devlog](/blog/boardgames/thats-amorphe/).

{{% /section-centered %}}