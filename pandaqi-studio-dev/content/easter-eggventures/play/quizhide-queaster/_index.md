---
type: "single"
gamepage: true
boardgame: true

title: "Quizhide Queaster"
headerTitle: "Win the reverse egg hunt by cleverly changing egg locations just before you decide to look."
blurb: "Win the reverse egg hunt by cleverly changing where eggs are hidden just before you decide to look."

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

An [Easter Eggventures](/easter-eggventures/) game about hiding eggs and communicating their location to the seekers using vague fantastical clues.

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

{{< boardgame-settings type="game" local_storage="quizhideQueasterConfig" btn_label="Generate Material" >}}
	{{< setting-hidden id="setting-gameTitle" text="Quizhide Queaster" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly grayscale." >}}
  {{< setting-enum id="setting-itemSize" text="Card Size?" values="small,regular,large" valaskey="true" def="regular" >}}
  <h3>Sets</h3>
  {{< setting-checkbox id="setting-sets-base" text="Base Game?" checked="checked" >}}
  {{< setting-checkbox id="setting-sets-cluesRooms" text="Clues & Rooms?" remark="Simply adds more clue cards and possible room tiles." >}}
{{< /boardgame-settings >}}

<p class="settings-remark"><strong>Not working? Or unsure what to do?</strong> The "Download" button above has PDFs I already made for you! Pick any one of those.</p>

{{% /section-centered %}}

{{% section-centered heading="Credits" anchor="credits" %}}

@TODO

For more information, check out the credits and supporting information from the [Easter Eggventures overview page](/easter-eggventures/).

{{% /section-centered %}}