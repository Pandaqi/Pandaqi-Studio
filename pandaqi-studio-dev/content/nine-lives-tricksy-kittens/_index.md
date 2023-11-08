---
type: "single"
gamepage: true
boardgame: true

title: "Nine Lives: Tricksy Kittens"
headerTitle: "Nine Lives: Tricksy Kittens | Don't be the first cat to run out of lives!"
blurb: "As we all know, all cats start with nine lives. And as we all know, losing a trick makes you lose a life ... unless you're willing to bet your life on your victory."

extraCSS: true
downloadLink: "@TODO"

fullHeaderImg: "cookie_smasher_header"
headerImg: "cookie_smasher_header"

headerThumb: "favicon"

customHeight: "small"
headerDarkened: true

color: "white"

bgColor: "#014556"
bgColorLink: "#601a87"

textColor: "#e6faff"
textColorLink: "#edccff"

googleFonts: ""

date: 2023-01-01 # 2024-07-25?

categories: ["boardgame"]
tags: ["medieval", "mosaic", "numbers", "deck"]

multiplayermode: "competitive"
language: EN
genre: ["card", "party"]
playtime: 20
playercount: [2,3,4,5,6,7,8,9,10]
complexity: low
ages: everyone

---


{{% boardgame-intro heading="" img="cookie_smasher_header" class="no-shadow" %}}

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

{{< boardgame-settings type="game" local_storage="nineLivesMathMeowsConfig" btn_label="Generate Material" >}}
	{{< setting-hidden id="setting-gameTitle" text="Nine Lives: Math Meows" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly grayscale." >}}
  {{< setting-checkbox id="setting-includeLifeCards" text="Generate Life Cards?" checked="checked" >}}
  {{< setting-checkbox id="setting-includeCatCards" text="Generate Cat Cards?" checked="checked" >}}
  {{< setting-enum id="setting-cardSize" text="Card Size?" values="small,regular,huge" valaskey="true" def="regular" >}}
{{< /boardgame-settings >}}

<p class="settings-remark"><strong>Not working? Or unsure what to do?</strong> The "Download" button above has PDFs I already made for you! Pick any one of those.</p>

{{% /section-centered %}}

{{% section-centered heading="Credits" anchor="credits" %}}

The fonts used are **Puss in Boots** (headings, fancy text) and **Catcafe** (body text, readable). Both freely available online. Parts of the illustrations were generated with AI. Everything else is mine.

This game is obviously a variant on the original game [Nine Lives](https://pandaqi.com/nine-lives).

To most gamers, the idea of trick taking is second nature. To people who have never played such a game---or rarely do so---it needs quite some explanation. That's why this version didn't become the "original", but rather a spin-off to try for those who think they'll enjoy it.

Do you have a favorite version of Nine Lives? Let me know which one and why!

For more information, as always, read my [detailed developer diary on Pandaqi Blog](https://pandaqi.com/blog/boardgames/nine-lives-tricksy-kittens).

{{% /section-centered %}}