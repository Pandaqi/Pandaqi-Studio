---
type: "single"
gamepage: true
boardgame: true

title: "The Game of Happiness"
headerTitle: "The Game of Happiness | A group game of discovery and relatability."
blurb: "Rank a series of random events based on how happy they'd make you---and hope your friends and family know you well enough to perfectly guess your ranking."

extraCSS: true
downloadLink: "https://drive.google.com/drive/folders/1GyAwnyAyk8J9XK190-KQNGulIBGo3xIb" # already updated!

fullHeaderImg: "the_game_of_happiness_header"
headerImg: "the_game_of_happiness_header"

headerThumb: "the_game_of_happiness_favicon"

customHeight: "small"
headerDarkened: true

color: "black"

bgColor: "#014556"
bgColorLink: "#601a87"

textColor: "#e6faff"
textColorLink: "#edccff"

googleFonts: ""

date: 2023-01-01 # 2024-12-12?

categories: ["boardgame"]
tags: ["emotional", "discovery", "guessing", "ranking"]

multiplayermode: "cooperative"
language: EN
genre: ["card", "party", "social"]
playtime: 45
playercount: [2,3,4,5,6,7]
complexity: low
ages: everyone

---


{{% boardgame-intro heading="" %}}

Rank a series of random events based on how happy they'd make you---and hope your friends and family know you well enough to perfectly guess your ranking.

{{% /boardgame-intro %}}

{{% section-centered heading="What do I need?" %}}

Three simple steps.
* Read the ultra-short [playful rules](rules).
* Download the base game PDF. (Download > Files > Base Pack.)
* Print, cut, play!

**Want more?** You can also [generate your own material](#material) right on this website!

**Don't want to print stuff?** You can also play the game digitally on a single smartphone. Go to [material](#material) on a device and check "Load Digital Game".

{{% /section-centered %}}

{{% section-centered heading="Material" anchor="material" html="true" %}}

<p>Pick your desired settings and click the button! When in doubt, just use the defaults for your first games.</p>

{{< boardgame-settings type="game" local_storage="theGameOfHappinessConfig" btn_label="Generate Material" >}}
	{{< setting-hidden id="setting-gameTitle" text="The Game Of Happiness" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly grayscale." >}}
  {{< setting-enum id="setting-itemSize" text="Card Size?" values="small,regular,large" valaskey="true" def="regular" >}}
  {{< setting-checkbox id="setting-includeCards" text="Include Cards?" checked="checked" >}}
  {{< setting-checkbox id="setting-includeTokens" text="Include Tokens?" checked="checked" remark="If you already have these, or plan on using something else, you can disable this." >}}
  {{< setting-checkbox id="setting-digitalGame" text="Load Digital Game?" remark="Loads the digital interface to play this game on a single smartphone instead. (Doesn't generate material.)" >}}
  <h3>Packs</h3>
  {{< setting-checkbox-multiple id="setting-packs" values="base,advanced,expert,silly,super,past,jobs,personal,habits,items" keys="Base,Advanced,Expert,Silly,Superpowers,Blast to Past,Jovial Jobs,Let's Get Personal,Horrible Habits,Interesting Items" valuesChecked="base" >}}
{{< /boardgame-settings >}}

<p class="settings-remark"><strong>Which pack(s) should I use!?</strong> The base, advanced, expert and silly packs contain ~10 new cards for each category. They are the largest and most diverse. They get slightly more "complex" (in order of the list), but you should mostly see this as a way to break the game into more manageable files to print and cut.</p> 

<p class="settings-remark">The other packs add cards within one particular category, such as Superpowers: cards proposing a fun dilemma through a superpower with a drawback. They are usually much smaller and should just be shuffled into the category cards you already have.</p>

<p class="settings-remark"><strong>Not working? Or unsure what to do?</strong> The "Download" button above has PDFs I already made for you! Pick any one of those.</p>

{{% /section-centered %}}

{{% section-centered heading="Credits" anchor="credits" %}}

This game is a personal project. I've been struggling with finding something I enjoy and gives me happiness for as long as I can remember. This game is basically another experiment in trying to find answers or discoveries. It's also why the game is kept really small and simple, with no marketing, expansions, or any of the stuff I usually do.

It's a simple, fun structure that allows a group of people to think about what makes them and others (un)happy. A game that isn't really a game, but it kinda is. It's as serious or as silly as your group wants it to be.

The fonts used are **Sunny Spells** (headings, decorative) and **Minya Nouvelle** (body, text, paragraphs). Both freely available for commercial use. Everything else is entirely mine.

For more information, as always, read my [detailed developer diary on Pandaqi Blog](https://pandaqi.com/blog/boardgames/the-game-of-happiness/).

{{% /section-centered %}}