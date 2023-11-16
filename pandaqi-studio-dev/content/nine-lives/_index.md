---
type: "single"
gamepage: true
boardgame: true

title: "Nine Lives"
headerTitle: "Nine Lives | Don't be the first cat to run out of lives!"
blurb: "As we all know, cats start with nine lives. And as we all know, playing the wrong cards makes you lose a life ... unless you're willing to bet on it."

extraCSS: true
downloadLink: "https://drive.google.com/drive/folders/1WkqwCiMo_ggHSkjPDfKS1fSDENgWjzoh"

fullHeaderImg: "nine_lives_header"
headerImg: "nine_lives_header"

headerThumb: "nine_lives_favicon"

customHeight: "small"
headerDarkened: true

color: "white"

bgColor: "#161616"
bgColorLink: "#3e1a87"

textColor: "#f7f7f7"
textColorLink: "#dfccff"

googleFonts: ""

date: 2023-01-01 # 2024-07-25?

categories: ["boardgame"]
tags: ["traditional", "animals", "abilities", "kids", "no-text"]

multiplayermode: "competitive"
language: EN
genre: ["card", "party"]
playtime: 30
playercount: [2,3,4,5]
complexity: low
ages: everyone

---

<div class="bg-cats"></div>

{{% boardgame-intro heading="" class="no-shadow" %}}

A simple and fast card game about losing your nine lives less quickly than all the other players.

{{% /boardgame-intro %}}

{{% section-centered heading="What do I need?" %}}

Three simple steps.
* Read the short [playful rules](rules).
* Download the base game PDF. (Download > Files > Base Game.)
* Print, cut, play!

**Want more?** You can also [generate your own material](#material) right on this website!

{{% /section-centered %}}

{{% section-centered heading="Material" anchor="material" html="true" %}}

<p>Pick your desired settings and click the button! When in doubt, just use the defaults for your first games.</p>

{{< boardgame-settings type="game" local_storage="nineLivesConfig" btn_label="Generate Material" >}}
	{{< setting-hidden id="setting-gameTitle" text="Nine Lives" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly grayscale." >}}
  {{< setting-checkbox id="setting-includeLifeCards" text="Generate Life Cards?" checked="checked" >}}
  {{< setting-checkbox id="setting-includeCatCards" text="Generate Cat Cards?" checked="checked" >}}
  {{< setting-checkbox id="setting-limitedPowers" text="Limited Powers?" checked="checked" remark="Only includes a handful of unique powers, to make playing your first game even easier." >}}
  {{< setting-enum id="setting-cardSize" text="Card Size?" values="small,regular,huge" valaskey="true" def="regular" >}}
{{< /boardgame-settings >}}

<p class="settings-remark"><strong>Not working? Or unsure what to do?</strong> The "Download" button above has PDFs I already made for you! Pick any one of those.</p>

{{% /section-centered %}}

{{% section-centered heading="Credits" anchor="credits" %}}

The fonts used are **Puss in Boots** (headings, fancy text) and **Catcafe** (body text, readable). Both freely available online. Parts of the illustrations were generated with AI. Everything else is mine.

This game has two spin-offs!

* [Nine Lives: Math Meows](https://pandaqi.com/nine-lives-math-meows): the same game that you love, but now with more depth. It's a little more mathematical and requires players to read English text (on the Life Cards).
* [Nine Lives: Tricksy Kittens](https://pandaqi.com/nine-lives-tricksy-kittens): also the same core mechanic, but now as a trick-taking game.

This idea started right after writing down (and completing) some other ideas for card games based around numbers and animals. Somehow, while exercising, my brain made a connection between the two: "what if you played a cat with nine lives, and losing a trick made you lose a life?"

(Yes, the original idea was the one with tricks, and then the one with numbers. What is now the "base game" is actually the third idea, once I realized how to simplify the game even further. That's not special: that's how it always goes. Making something teaches you how to make it simpler next time.)

This snowballed into three ideas with the same core, but different directions. All of them were immediately simple and fun enough that I found it worthwhile to create them all, basically back-to-back.

Do you have a favorite version of Nine Lives? Let me know which one and why!

For more information, as always, read my [detailed developer diary on Pandaqi Blog](https://pandaqi.com/blog/boardgames/nine-lives).

{{% /section-centered %}}