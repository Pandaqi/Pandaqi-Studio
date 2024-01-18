---
type: "single"
gamepage: true
boardgame: true

title: "Mammoth Messages"
headerTitle: "Mammoth Messages | Communicate words using only barebones cave drawings."
blurb: "Give message. They guess. Only cave drawings. Nothing else. More guess is more good. Party game. Hum."

extraCSS: true
downloadLink: "https://drive.google.com/drive/folders/1lFWm9gEBEFxKMeDMy_fucT5xcDac4KsC" # already updated! 

fullHeaderImg: "mammoth_messages_header"
headerImg: "mammoth_messages_header"

headerThumb: "mammoth_messages_favicon"

customHeight: "small"
headerDarkened: true

color: "brown"

bgColor: "#003401"
bgColorLink: "#ff1f1f"

textColor: "#f2ffef"
textColorLink: "#ffe9e9"

googleFonts: ""

date: 2023-01-01 # 2024-12-26

categories: ["boardgame"]
tags: ["creative", "guessing", "word"]

multiplayermode: "competitive"
language: EN
genre: ["card", "party", "social"]
playtime: 30
playercount: [2,3,4,5,6,7,8]
complexity: low
ages: everyone

---

{{% boardgame-intro heading="" %}}

Give message. They guess. Only cave drawings. Nothing else. More guess is more good. Party game. Hum.

{{% /boardgame-intro %}}

{{% section-centered heading="What do I need?" %}}

Three simple steps.
* Read the ultra-short [playful rules](rules).
* Download the base game PDF. (Download > Files > Base Pack.)
* Print, cut, play!

**Want more?** You can also [generate your own material](#material) right on this website!

{{% /section-centered %}}

{{% section-centered heading="Material" anchor="material" html="true" %}}

<p>Pick your desired settings and click the button! When in doubt, just use the defaults for your first games.</p>

{{< boardgame-settings type="game" local_storage="mammothMessagesConfig" btn_label="Generate Material" >}}
	{{< setting-hidden id="setting-gameTitle" text="Mammoth Messages" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly grayscale." >}}
  {{< setting-enum id="setting-itemSize" text="Card Size?" values="small,regular,large" valaskey="true" def="regular" >}}
  {{< setting-checkbox id="setting-includeCards" text="Include Word Cards?" checked="checked" >}}
  {{< setting-checkbox id="setting-includeDrawings" text="Include Cave Drawings?" checked="checked" >}}
  {{< setting-checkbox id="setting-includeTokens" text="Include Tokens?" checked="checked" remark="If you already have these, or plan on using something else, you can disable this." >}}
{{< /boardgame-settings >}}

<p class="settings-remark"><strong>Not working? Or unsure what to do?</strong> The "Download" button above has PDFs I already made for you! Pick any one of those.</p>

{{% /section-centered %}}

{{% section-centered heading="Credits" anchor="credits" %}}

The fonts used are **Boblox Classic** (headings, decorative text) and **Averia Serif Libre** (body, longer paragraphs). Both are freely available online. Some generative AI was used for backgrounds, everything else is entirely mine.

This game was just a simple idea I wanted to quickly create. A party game where you had to communicate words using rudimentary cave drawings? Sounded like it could work, so I didn't linger and just made it. 

(It originated as a possible party game to play on the computer, where everyone connected using their phone. I might still make that, with the same name and graphics, at some later date. Because I recently figured out how I can create and provide such play-with-your-phone games for free!) 

The key word here is simplicity. Anybody can play this game within 30 seconds. It's a great quick party game that combines language and visual creativity, which makes it a good fit for just about any group. At the same time, there isn't any more depth or strategy underneath it all.

For more information, as always, read my [detailed developer diary on Pandaqi Blog](https://pandaqi.com/blog/boardgames/mammoth-messages/).

{{% /section-centered %}}