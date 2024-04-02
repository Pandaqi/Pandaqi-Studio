---
type: "single"
gamepage: true
boardgame: true

title: "Mammoth Messages"
headerTitle: "Communicate words using only barebones cave drawings"
blurb: "Give message. They guess. Only cave drawings. Nothing else. More guess is more good. Party game. Hum."

extraCSS: true
downloadLink: "https://drive.google.com/drive/folders/1lFWm9gEBEFxKMeDMy_fucT5xcDac4KsC"

customHeight: "small"
headerDarkened: true

color: "brown"

bgColor: "#230e00"
bgColorLink: "#2d2d2d"

textColor: "#fff0e8"
textColorLink: "#e0e0e0"

googleFonts: ""

date: 2024-03-26

categories: ["boardgame"]
tags: ["creative", "guessing", "word"]

multiplayermode: "competitive"
language: EN
genre: ["card", "party", "social"]
playtime: 30
playercount: [2,3,4,5,6,7,8]
complexity: low
ages: everyone
devlog: "/blog/boardgames/mammoth-messages/"

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
  <h3>What to generate?</h3>
  {{< setting-checkbox id="setting-includeCards" text="Include Word Cards?" checked="checked" >}}
  {{< setting-checkbox id="setting-includeDrawings" text="Include Cave Drawings?" checked="checked" >}}
  {{< setting-checkbox id="setting-includeTokens" text="Include Choice Tokens?" checked="checked" remark="If you already have these, or plan on using something else, you can disable this." >}}
  <h3>Word preferences?</h3>
  {{< setting-checkbox id="setting-includeGeography" text="Include Geography?" >}}
  {{< setting-checkbox id="setting-includeNames" text="Include Names?" remark="Includes names of popular people, brands, etcetera" >}}
  {{< setting-checkbox id="setting-includeDifficultWords" text="Include Difficult Words?" remark="Raises the max difficulty of words that can appear." >}}
{{< /boardgame-settings >}}

<p class="settings-remark"><strong>Not working? Or unsure what to do?</strong> The "Download" button above has PDFs I already made for you! Pick any one of those.</p>

<p class="settings-remark">The material for this game is heavy to generate. Please use a computer (not a phone, for example) and give it a few minutes!</p>

{{% /section-centered %}}

{{< support >}}

{{% section-centered heading="Credits" anchor="credits" %}}

The fonts used are **Boblox Classic** (headings, decorative text) and **Averia Serif Libre** (body, longer paragraphs). Both are freely available online. Some generative AI was used for backgrounds, everything else is entirely mine.

This game was just a simple idea I wanted to quickly create. A party game where you had to communicate words using rudimentary cave drawings? Sounded like it could work, so I didn't linger and just made it. 

(It originated as a possible party game to play on the computer, where everyone connected using their phone. I might still make that, with the same name and graphics, at some later date. Because I recently figured out how I can create and provide such play-with-your-phone games for free!) 

The key word here is simplicity. Anybody can play this game within 30 seconds. It's a great quick party game that combines language and visual creativity, which makes it a good fit for just about any group. At the same time, there isn't any more depth or strategy underneath it all.

You also might wonder "aren't some of these cave drawings a little too modern?" Well, while writing and researching my Saga of Life stories (about human history and origins of life), I repeatedly realized that just because they could not _write_ doesn't mean they didn't have clothes, tools, games, etcetera. We might have invented the knitting needle before any other tool. Dice, and what could possibly be betting chips, have been found on very old archeological sites. 

Their understanding of the world, their _spoken_ language, might have been on par with ours. Because why wouldn't it be? The prehistoric times lasted waaay longer than our modern times. They actually lived in nature and had to use and understand it every day. Science even shows they were healthier and more creative than modern day humans in some respects.

For more information, as always, read my [detailed developer diary on Pandaqi Blog](/blog/boardgames/mammoth-messages/).

{{% /section-centered %}}