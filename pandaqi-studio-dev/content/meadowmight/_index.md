---
type: "single"
gamepage: true
boardgame: true

title: "Meadowmight"
headerTitle: "Meadowmight | Claim the biggest meadow in this war of the wool."
blurb: "Build a meadow and fill it with sheep, but beware other players stomping into your peaceful grasslands and fencing off the wrong parts!"

extraCSS: true
downloadLink: "https://drive.google.com/drive/folders/1mdYwronNojq_L3I9vTkGdCVhVsnpiruT" # already updated!

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
tags: ["animals"]

multiplayermode: "competitive"
language: EN
genre: ["tile", "high-interaction"]
playtime: 30
playercount: [2,3,4,5,6]
complexity: low
ages: everyone

---

{{% boardgame-intro heading="" img="cookie_smasher_header" class="no-shadow" %}}

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
  <h3>Expansions</h3>
  {{< setting-checkbox id="setting-expansions-wolf" text="Wolf?" remark="Adds the aggressive wolf tile!" >}}
{{< /boardgame-settings >}}

<p class="settings-remark"><strong>Not working? Or unsure what to do?</strong> The "Download" button above has PDFs I already made for you! Pick any one of those.</p>

{{% /section-centered %}}

{{% section-centered heading="Credits" anchor="credits" %}}

@TODO

For more information, as always, read my [detailed developer diary on Pandaqi Blog](https://pandaqi.com/blog/boardgames/meadowmight).

{{% /section-centered %}}