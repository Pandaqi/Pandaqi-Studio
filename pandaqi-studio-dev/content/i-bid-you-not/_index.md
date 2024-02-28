---
type: "single"
gamepage: true
boardgame: true

title: "I Bid You Not"
headerTitle: "Sweeten the deal and be the highest bidder---or sour the deal and run away."
blurb: "Take turns either adding items to the offer or declaring an auction. But once the auction is over, you might not be happy with how much you paid for what you got."

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
tags: ["simple", "auction", "bidding"]

multiplayermode: "competitive"
language: EN
genre: ["tile"]
playtime: 30
playercount: [3,4,5,6,7]
complexity: low
ages: everyone

---

{{% boardgame-intro heading="" %}}

Sweeten the deal and be the highest bidder---or sour the deal and run away.

{{% /boardgame-intro %}}

{{% section-centered heading="What do I need?" %}}

Three simple steps.
* Read the short [playful rules](rules).
* Download the base game PDF. (Download > Files > Base Pack.)
* Print, cut, play!

**Want more?** You can also [generate your own material](#material) right on this website!

{{% /section-centered %}}

{{% section-centered heading="Material" anchor="material" html="true" %}}

<p>Pick your desired settings and click the button! When in doubt, just use the defaults for your first games.</p>

{{< boardgame-settings type="game" local_storage="iBidYouNotConfig" btn_label="Generate Material" >}}
	{{< setting-hidden id="setting-gameTitle" text="I Bid You Not" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly grayscale." >}}
  {{< setting-enum id="setting-itemSize" text="Card Size?" values="small,regular,large" valaskey="true" def="regular" >}}
  <h3>Sets</h3>
  {{< setting-checkbox id="setting-sets-base" text="Base Game?" >}}
  {{< setting-checkbox id="setting-sets-oddInventions" text="Odd Inventions?" >}}
  {{< setting-checkbox id="setting-sets-doubleDevices" text="Double Devices?" >}}
{{< /boardgame-settings >}}

<p class="settings-remark"><strong>Not working? Or unsure what to do?</strong> The "Download" button above has PDFs I already made for you! Pick any one of those.</p>

{{% /section-centered %}}

{{% section-centered heading="Credits" anchor="credits" %}}

@TODO

For more information, as always, read my [detailed developer diary on Pandaqi Blog](/blog/boardgames/i-bid-you-not/).

{{% /section-centered %}}