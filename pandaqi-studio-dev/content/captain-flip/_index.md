---
type: "single"
gamepage: true
boardgame: true

title: "Captain Flip"
headerTitle: "Remember the locations of the best tiles and flip them before anyone else."
blurb: "A mix between a memory game and strategy game, where flipping tiles gives you actions, and scoring the tiles you wanted is a challenge."

extraCSS: true
downloadLink: ""

customHeight: "small"
headerDarkened: true

color: "purple"

bgColor: "#003401"
bgColorLink: "#ff1f1f"

textColor: "#f2ffef"
textColorLink: "#ffe9e9"

googleFonts: ""

date: 2023-01-01 # 2024-12-26

categories: ["boardgame"]
tags: ["simple"]

multiplayermode: "competitive"
language: EN
genre: ["tile"]
playtime: 30
playercount: [2,3,4,5,6,7]
complexity: low
ages: everyone

---

{{% boardgame-intro heading="" %}}

Remember the locations of the best tiles and flip them before anyone else.

{{% /boardgame-intro %}}

{{% section-centered heading="What do I need?" %}}

Three simple steps.
* Read the short [playful rules](rules).
* Download the base game PDF. (Download > Files > Base Pack.)
* Print, cut, play!

This game is incredibly simple (just flip one tile and take its action) and well-suited for families and kids. This does require text on the tiles, however, which means players need some knowledge of the English language.

**Want more?** You can also [generate your own material](#material) right on this website!

{{% /section-centered %}}

{{% section-centered heading="Material" anchor="material" html="true" %}}

<p>Pick your desired settings and click the button! When in doubt, just use the defaults for your first games.</p>

{{< boardgame-settings type="game" local_storage="captainFlipConfig" btn_label="Generate Material" >}}
	{{< setting-hidden id="setting-gameTitle" text="Captain Flip" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly grayscale." >}}
  {{< setting-enum id="setting-itemSize" text="Card Size?" values="small,regular,large" valaskey="true" def="regular" >}}
{{< /boardgame-settings >}}

<p class="settings-remark"><strong>Not working? Or unsure what to do?</strong> The "Download" button above has PDFs I already made for you! Pick any one of those.</p>

<p class="settings-remark"><strong>What about expansions?</strong> You can play all expansions and variants using the same minimalist base material!</p>

{{% /section-centered %}}

{{% section-centered heading="Credits" anchor="credits" %}}

@TODO

For more information, as always, read my [detailed developer diary on Pandaqi Blog](/blog/boardgames/captain-flip/).

{{% /section-centered %}}