---
type: "single"
gamepage: true
boardgame: true

title: "Meadowmight"
headerTitle: "Meadowmight | Claim the biggest meadow in this war of the wool."
blurb: "Build a meadow and fill it with sheep, but beware other players stomping into your peaceful grasslands and fencing off the wrong parts!"

extraCSS: true
downloadLink: "https://drive.google.com/drive/folders/1mdYwronNojq_L3I9vTkGdCVhVsnpiruT" # already updated!

fullHeaderImg: "meadowmight_header"
headerImg: "meadowmight_header"

headerThumb: "meadowmight_favicon"

customHeight: "small"
headerDarkened: true

color: "green"

bgColor: "#1f2902"
bgColorLink: "#5b360c"

textColor: "#e6ffe8"
textColorLink: "#f0c39b"

googleFonts: ""

date: 2024-05-26

categories: ["boardgame"]
tags: ["animals"]

multiplayermode: "competitive"
language: EN
genre: ["tile", "high-interaction"]
playtime: 30
playercount: [2,3,4,5,6]
complexity: low
ages: everyone

---

{{% boardgame-intro heading="" %}}

Claim the biggest meadow in this war of the wool.

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

{{< boardgame-settings type="game" local_storage="meadowMightConfig" btn_label="Generate Material" >}}
	{{< setting-hidden id="setting-gameTitle" text="Meadowmight" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly grayscale." >}}
  {{< setting-enum id="setting-tileSize" text="Tile Size?" values="small,regular,huge" valaskey="true" def="regular" >}}
  {{< setting-checkbox id="setting-expansions-wolf" text="Wool Wolves (Expansion)?" remark="Adds four special tiles with unique actions!" >}}
{{< /boardgame-settings >}}

<p class="settings-remark"><strong>Not working? Or unsure what to do?</strong> The "Download" button above has PDFs I already made for you! Pick any one of those.</p>

{{% /section-centered %}}

{{% section-centered heading="Credits" anchor="credits" %}}

This game doesn't have an interesting (or complicated) origin, for a change. I woke up one day with this idea in my head, tested a paper prototype the same day, and after some tweaks it just worked.

The words "deceptively cute" are certainly applicable. The game is simple, light and looks warm and fuzzy. But while playing, you'll notice it's exceptionally cutthroat and mean. My body of work can pretty much be summarized as "player interaction---the game", so I'm okay with this contrast and actually think it's quite funny.

The fonts used are **Sheep** (by MJType) and **PajamaPants** (by Sarah Weber). Some images were generated with AI, but not all, because it _really_ doesn't understand top-down perspective on many things. Everything else is mine.

For more information, as always, read my [detailed developer diary on Pandaqi Blog](https://pandaqi.com/blog/boardgames/meadowmight).

{{% /section-centered %}}