---
type: "single"
gamepage: true
boardgame: true

title: "Nine Lives: Math Meows"
headerTitle: "Nine Lives: Math Meows | Don't be the first cat to run out of lives!"
blurb: "As we all know, all cats start with nine lives. And as we all know, being unable to play a valid card makes you lose a life. Don't lose all of them before anyone else!"

extraCSS: true
downloadLink: "https://drive.google.com/drive/folders/1kKuH20FTKx5pm4qy_dqdNgt79iDSJwYp"

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
tags: ["traditional", "animals", "numbers", "abilities"]

multiplayermode: "competitive"
language: EN
genre: ["card", "party"]
playtime: 40
playercount: [2,3,4,5,6]
complexity: low
ages: everyone

---

<div class="bg-cats"></div>

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
  {{< setting-checkbox id="setting-includeNumberCards" text="Generate Number Cards?" checked="checked" >}}
  {{< setting-enum id="setting-cardSize" text="Card Size?" values="small,regular,huge" valaskey="true" def="regular" >}}
{{< /boardgame-settings >}}

<p class="settings-remark"><strong>Not working? Or unsure what to do?</strong> The "Download" button above has PDFs I already made for you! Pick any one of those.</p>

{{% /section-centered %}}

{{% section-centered heading="Credits" anchor="credits" %}}

As expected, this game is a spin-off for the original [Nine Lives](https://pandaqi.com/nine-lives).

Interestingly, though, this game was actually the original idea! As I developed it, I noticed it had a bit too many numbers for some people's taste, and realized ways to simplify the game. That's how "Nine Lives" came to life. Eventually, I selected _that_ game as the "original" because of its simplicity and playability for families with young kids.

The fonts used are **Puss in Boots** (headings, fancy text) and **Catcafe** (body text, readable). Both freely available online. Parts of the illustrations were generated with AI. Everything else is mine.

For more information, as always, read my [detailed developer diary on Pandaqi Blog](https://pandaqi.com/blog/boardgames/nine-lives-math-meows).

{{% /section-centered %}}