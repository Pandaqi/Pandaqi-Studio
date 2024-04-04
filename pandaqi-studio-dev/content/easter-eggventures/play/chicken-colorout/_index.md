---
type: "single"
gamepage: true
boardgame: true

title: "Chicken Colorout"
headerTitle: "Be the first to hide all your eggs in an environment filled with kids eager to find them again."
blurb: "Be the first to hide all your eggs in an environment filled with kids eager to find them again."

extraCSS: true
downloadLink: ""

customHeight: "small"
headerDarkened: true

color: "brown"

bgColor: "#230e00"
bgColorLink: "#2d2d2d"

textColor: "#fff0e8"
textColorLink: "#e0e0e0"


date: 2023-01-01 # 2024-12-26

categories: ["boardgame"]
tags: ["strategy"]

multiplayermode: "competitive"
language: EN
genre: ["tile"]
playtime: 30
playercount: [2,3,4,5,6]
complexity: low
ages: everyone

---

{{% boardgame-intro heading="" %}}

An [Easter Eggventures](/easter-eggventures/) game about a reverse egg hunt: you try to hide all your eggs in the best hiding spots so they will never be found again.

{{% /boardgame-intro %}}

{{% section-centered heading="What do I need?" %}}

Three simple steps.
* Read the short [playful rules](rules).
* Download the base game PDF. (Download > Files > Base Game.)
* Print, cut, play!

**Want more?** You can also [generate your own material](#material) right on this website, to suit your specific needs.

{{% /section-centered %}}

{{% section-centered heading="Material" anchor="material" html="true" %}}

<p>Pick your desired settings and click the button! The settings already selected are the "base game" mentioned in the introduction.</p>

{{< boardgame-settings type="game" local_storage="chickenColoroutConfig" btn_label="Generate Material" >}}
	{{< setting-hidden id="setting-gameTitle" text="Chicken Colorout" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly grayscale." >}}
  {{< setting-enum id="setting-itemSize" text="Card Size?" values="small,regular,large" valaskey="true" def="regular" >}}
  <h3>Sets</h3>
  {{< setting-checkbox id="setting-sets-base" text="Base Game?" checked="checked" >}}
  {{< setting-checkbox id="setting-sets-score" text="Special Scores?" >}}
  {{< setting-checkbox id="setting-sets-pawns" text="Peering Pawns?" >}} 
{{< /boardgame-settings >}}

<p class="settings-remark"><strong>Not working? Or unsure what to do?</strong> The "Download" button above has PDFs I already made for you! Pick any one of those.</p>

{{% /section-centered %}}

{{% section-centered heading="Credits" anchor="credits" %}}

@TODO

For more information, check out the credits and supporting information from the [Easter Eggventures overview page](/easter-eggventures/).

{{% /section-centered %}}