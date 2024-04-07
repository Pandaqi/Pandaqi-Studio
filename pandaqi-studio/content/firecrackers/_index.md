---
type: "single"
gamepage: true
boardgame: true

title: "Firecrackers"
headerTitle: "Build the best fireworks show without having it blow up in your face."
blurb: "A push-your-luck game about building your own deck of valuable fireworks, with the least chance of igniting the wrong one."

extraCSS: true
downloadLink: "https://drive.google.com/drive/folders/12cmopxbr8HZWw8jkXijINkCd8wdTAPQs" # already_updated!

customHeight: "small"
headerDarkened: true

color: "black"

bgColor: "#014556"
bgColorLink: "#601a87"

textColor: "#e6faff"
textColorLink: "#edccff"

date: 2024-12-12

difficulty: "kids-can-play"
genres: ["thematic", "family", "party"]
categories: ["boardgame", "card-game"]
tags: ["push-your-luck", "deck-building", "hot-potato", "numbers", "market"]
themes: ["colorful", "holiday"]

multiplayermode: "competitive"
language: EN
playtime: 60
playercount: [2,3,4,5,6,7,8,9,10]
ages: everyone
devlog: "/blog/boardgames/firecrackers/"

---

{{% boardgame-intro heading="" %}}

Build the best fireworks show without having it blow up in your face.

{{% /boardgame-intro %}}

{{% section-centered heading="What do I need?" %}}

Three simple steps.
* Read the short [playful rules](rules).
* Download the base game PDF. (Download > Files > Base Set.)
* Print, cut, play!

**Want more?** You can also [generate your own material](#material) right on this website!

{{% /section-centered %}}

{{% section-centered heading="Material" anchor="material" html="true" %}}

<p>Pick your desired settings and click the button! When in doubt, just use the defaults for your first games.</p>

{{< boardgame-settings type="game" local_storage="firecrackersConfig" btn_label="Generate Material" >}}
	{{< setting-hidden id="setting-gameTitle" text="Firecrackers" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly grayscale." >}}
  {{< setting-enum id="setting-itemSize" text="Card Size?" values="small,regular,large" valaskey="true" def="regular" >}}
  {{< setting-checkbox id="setting-expansions-scoreCards" text="Add Scoreworks?" remark="An expansion that adds cards to randomize how scoring works at the end of the game." >}}
  {{< boardgame-settings-section heading="Packs" >}}
{{< setting-checkbox-multiple id="setting-packs" values="black,red,orange,yellow,green,turquoise,blue,purple,pink,brown,white" valuesChecked="black,red,yellow,green,blue,brown" >}}
  {{< /boardgame-settings-section >}}
{{< /boardgame-settings >}}

<p class="settings-remark"><strong>Not working? Or unsure what to do?</strong> The "Download" button above has PDFs I already made for you! Pick any one of those.</p>

{{% /section-centered %}}

{{% section-centered heading="Credits" anchor="credits" %}}

The fonts used are **4th of July** (headings, fancy text) and **Neuton** (body text, readable, multiple variations). Both freely available online. Parts of the illustrations were generated with AI; everything else is mine.

As usual with me, this game idea popped into my head just a few weeks before New Year's Eve. I raced to develop and finish it, then tested it that night with family, and it just ... worked really well? I barely had to polish and tweak afterwards.

I guess that's the benefit of basing a game idea on two proven mechanics: **push your luck** and **deck building**. The first mechanic is about asking players if they want to continue playing (e.g. "reveal another card") at the risk of drawing something bad and being eliminated. The second asks players to use their rewards of a round (e.g. "each card is worth 1 coin") to buy new cards and therefore build a better deck over time. 

One of my simplest games, one of my most thematic games, and one that seems to hook most people immediately.

For more information, as always, read my [detailed developer diary on Pandaqi Blog](/blog/boardgames/firecrackers/).

{{% /section-centered %}}

{{< support >}}
