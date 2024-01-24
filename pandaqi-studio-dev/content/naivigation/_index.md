---
type: "single"
gamepage: true
boardgame: true

title: "Naivigation"
headerTitle: "Naivigation | A universe of simple party board games about driving one vehicle together."
blurb: "A universe of simple party board games about driving one vehicle together, at the same time, without crashing too much."

extraCSS: true
downloadLink: ""

headerImg: "naivigation_header"
headerThumb: "naivigation_favicon"

customHeight: "small"
headerDarkened: true

color: "brown"

bgColor: "#230e00"
bgColorLink: "#2d2d2d"

textColor: "#fff0e8"
textColorLink: "#e0e0e0"

googleFonts: ""

date: 2023-01-01 # 2024-12-26

categories: ["boardgame"]
tags: ["creative", "guessing", "word"]

multiplayermode: "cooperative"
language: EN
genre: ["card", "party", "social"]
playtime: 30
playercount: [2,3,4,5,6,7,8]
complexity: low
ages: everyone

---

{{% boardgame-intro heading="" %}}

Naivigation is a universe of simple party board games about driving one vehicle together, at the same time, without crashing ... too often.

{{% /boardgame-intro %}}

{{% section-centered heading="What's this?" %}}

This is the **overview page** of the Naivigation project, or the "master project" if you will. 

It links to all the other games and explains the general idea. All games share the same core mechanic, but using a different vehicle that requires new fun ideas and gameplay. You're playing within a minute and you'll never stop.

This page also contains material to download that you can _reuse in all games_, which saves printing costs and effort. Most of this material is only for variants and expansions, except for the **Core Set**. 

In other words, want to try it? We recommend ...
* Click "Download" and get yourself the Core Set.
* Do the same for [Naivigation: Swerving Spaceships](/naivigation/visit/swerving-spaceships/), and read its short rulebook.
* Print, cut, have fun!

You can also [read the shared rules](rules), though they are repeated within the rulebook of each specific game. (On their own, they're not a full game!)

You can also [generate your own material](#material) right on this website. (If the PDFs at the "Download" button don't suit your needs, or you're just curious!)

{{% /section-centered %}}

{{% section-centered heading="Journey through the Universe" %}}

@TODO: Turn this into nice images/banners instead of text.

Below is a list of all major games, roughly sorted by difficulty.

* Swerving Spaceships (Space)
* Frightening Flights (Airplane)
* Singing Sails (Ship)
* Crashing Cars (Car)
* Troublesome Trains (Train)

Below is a list of smaller and more unique spin-offs, roughly sorted by difficulty.

* Suspicious Submarines (Submarine)
* ??

{{% /section-centered %}}

{{% section-centered heading="Material" anchor="material" html="true" %}}

<p>Pick your desired settings and click the button! The settings already selected are the "core set" mentioned in the introduction.</p>

{{< boardgame-settings type="game" local_storage="naivigationConfig" btn_label="Generate Material" >}}
	{{< setting-hidden id="setting-gameTitle" text="Naivigation" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly grayscale." >}}
  {{< setting-enum id="setting-itemSize" text="Card Size?" values="small,regular,large" valaskey="true" def="regular" >}}
  {{< setting-checkbox id="setting-includeInstructionTokens" text="Include Instruction Tokens?" checked="checked" >}}
  {{< setting-checkbox id="setting-includeVehicleCards" text="Include Vehicle Cards?" checked="checked" >}}
  {{< setting-checkbox id="setting-includeHealthCards" text="Include Health Cards?" checked="checked" >}}
  {{< setting-checkbox id="setting-includeActionCards" text="Include Action Cards?" >}}
  {{< setting-checkbox id="setting-includeTimeDeck" text="Include Time Deck?" >}}
  {{< setting-checkbox id="setting-includeGPSCards" text="Include GPS Cards?" >}}
  {{< setting-checkbox id="setting-includeFuelDeck" text="Include Fuel Deck?" >}}
{{< /boardgame-settings >}}

<p class="settings-remark"><strong>Not working? Or unsure what to do?</strong> The "Download" button above has PDFs I already made for you! Pick any one of those.</p>

<p class="settings-remark">The optional expansions are roughly in the recommended order for trying them out. Especially the Action Cards are recommended to include as soon as possible.</p>

{{% /section-centered %}}

{{% section-centered heading="Credits" anchor="credits" %}}

The fonts used are **Boblox Classic** (headings, decorative text) and **Averia Serif Libre** (body, longer paragraphs). Both are freely available online. Some generative AI was used for backgrounds, everything else is entirely mine.

This game was just a simple idea I wanted to quickly create. A party game where you had to communicate words using rudimentary cave drawings? Sounded like it could work, so I didn't linger and just made it. 

(It originated as a possible party game to play on the computer, where everyone connected using their phone. I might still make that, with the same name and graphics, at some later date. Because I recently figured out how I can create and provide such play-with-your-phone games for free!) 

The key word here is simplicity. Anybody can play this game within 30 seconds. It's a great quick party game that combines language and visual creativity, which makes it a good fit for just about any group. At the same time, there isn't any more depth or strategy underneath it all.

You also might wonder "aren't some of these cave drawings a little too modern?" Well, while writing and researching my Saga of Life stories (about human history and origins of life), I repeatedly realized that just because they could not _write_ doesn't mean they didn't have clothes, tools, games, etcetera. We might have invented the knitting needle before any other tool. Dice, and what could possibly be betting chips, have been found on very old archeological sites. 

Their understanding of the world, their _spoken_ language, might have been on par with ours. Because why wouldn't it be? The prehistoric times lasted waaay longer than our modern times. They actually lived in nature and had to use and understand it every day. Science even shows they were healthier and more creative than modern day humans in some respects.

For more information, as always, read my [detailed developer diary on Pandaqi Blog](https://pandaqi.com/blog/boardgames/naivigation/).

{{% /section-centered %}}