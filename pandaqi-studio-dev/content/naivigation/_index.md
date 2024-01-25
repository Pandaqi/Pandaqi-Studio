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

It links to all the other games and explains the general idea. All games share the **same core**, but use a **different vehicle** that changes _everything_. You're playing within a minute and you'll never stop.

This page therefore contains downloadable material to _reuse in all games_. Only the **Core Set** is required. 

In other words, want to try it? We recommend ...
* Click "Download" and get yourself the Core Set.
* Do the same for [Naivigation: Swerving Spaceships](/naivigation/visit/swerving-spaceships/), and read its short rulebook.
* Print, cut, have fun!

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

You can also [read the shared rules](rules), though they are repeated within the rulebook of each specific game. (On their own, they're not a full game!)

You can also [generate your own material](#material) right on this website. (If the PDFs at the "Download" button don't suit your needs, or you're just curious!)

{{% /section-centered %}}

{{% section-centered heading="Material" anchor="material" html="true" %}}

<p>Pick your desired settings and click the button!</p>

{{< boardgame-settings type="game" local_storage="naivigationConfig" btn_label="Generate Material" >}}
	{{< setting-hidden id="setting-gameTitle" text="Naivigation" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly grayscale." >}}
  {{< setting-enum id="setting-itemSize" text="Card Size?" values="small,regular,large" valaskey="true" def="regular" >}}

  <h3>Core Set</h3>
  {{< setting-checkbox id="setting-includeInstructionTokens" text="Include Instruction Tokens?" checked="checked" >}}
  {{< setting-checkbox id="setting-includeVehicleCards" text="Include Vehicle Cards?" checked="checked" >}}
  {{< setting-checkbox id="setting-includeHealthCards" text="Include Health Cards?" checked="checked" >}}

  <h3>Expansions</h3>
  {{< setting-checkbox id="setting-includeActionCards" text="Include Action Cards?" >}}
  {{< setting-checkbox id="setting-includeTimeDeck" text="Include Time Deck?" >}}
  {{< setting-checkbox id="setting-includeGPSCards" text="Include GPS Cards?" >}}
  {{< setting-checkbox id="setting-includeFuelDeck" text="Include Fuel Deck?" >}}
{{< /boardgame-settings >}}

<p class="settings-remark"><strong>Not working? Or unsure what to do?</strong> The "Download" button above has PDFs I already made for you! Pick any one of those.</p>

<p class="settings-remark">The optional expansions are roughly in the recommended order for trying them out. Especially the Action Cards are recommended to include as soon as possible.</p>

{{% /section-centered %}}

{{% section-centered heading="Credits" anchor="credits" %}}

The fonts used are **Ambery Gardens** (headings, decorative text) and **K2D** (body, longer paragraphs). Both are freely available online. Some generative AI was used for complex illustrations, everything else is entirely mine.

This project started a long time ago, when I had the well-known experience of "multiple people sit in a car shouting directions, but nobody really knows where to go next".

_Hey,_ I thought, _that could be a game!_

I made the first version of Naivigation a few months later. A cooperative game about driving a car from start to finish, without much communication. The core concept was _really fun_, but the way I executed it---with my limited game dev experience---was suboptimal to say the least.

So I came back years later, read back my notes, scrapped all the terrible stuff, and made Naivigation the game it was supposed to be. Even simpler rules, much _better_ rules (more fun, challenging, balanced), prettier material, and all the good stuff that comes from my modern game website (such as playful rules).

Now the world can enjoy the final result :)

I honestly think these are my masterpiece so far. The games aren't extremely "deep" or "ground-breaking" or "innovative", surely not. But the amount of _fun_ and _(diverse) challenge_ you get out of extremely simple rules and material is unmatched. 

I mostly make games for families and casual groups. These games are cooperative, mostly textless, simple, fast, intuitive, thematic, cheap to print/cut yourself, varied, anything I'd want games to be.

For more information, as always, read my [detailed developer diary on Pandaqi Blog](https://pandaqi.com/blog/boardgames/naivigation/).

{{% /section-centered %}}