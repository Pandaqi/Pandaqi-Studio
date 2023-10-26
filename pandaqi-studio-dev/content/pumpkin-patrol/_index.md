---
type: "single"
gamepage: true
boardgame: true

title: "Pumpkin Patrol"
headerTitle: "Pumpkin Patrol | Hand out the most candy in a very competitive Halloween neighborhood."
blurb: "Attract the most valuable Trick-or-Treaters with beautiful Halloween decorations, but don't forget to collect enough candy to actually make them happy!"

extraCSS: true
downloadLink: "@TODO"

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
tags: ["medieval", "mosaic", "numbers", "deck"]

multiplayermode: "competitive"
language: EN
genre: ["card", "party"]
playtime: 20
playercount: [2,3,4,5,6,7,8,9,10]
complexity: low
ages: everyone

---


{{% boardgame-intro heading="" img="cookie_smasher_header" class="no-shadow" %}}

Hand out the most candy in a very competitive Halloween neighborhood.

{{% /boardgame-intro %}}

{{% section-centered heading="What do I need?" %}}

Three simple steps.
* Read the short [playful rules](rules).
* Download the base game PDF. (Download > Files > Starter.)
* Print, cut, play!

**Want more?** You can also [generate your own material](#material) right on this website! Pick the sets you like and press the button.

{{% /section-centered %}}

{{% section-centered heading="Material" anchor="material" html="true" %}}

<p>Pick your desired settings and click the button! When in doubt, just use the defaults for a first game.</p>

{{< boardgame-settings type="game" local_storage="pumpkinPatrolConfig" btn_label="Generate Material" >}}
	{{< setting-hidden id="setting-gameTitle" text="Pumpkin Patrol" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly grayscale." >}}
  {{< setting-checkbox id="setting-includePeopleCards" text="Generate People Cards?" checked="checked" >}}
  {{< setting-checkbox id="setting-includeHandCards" text="Generate Hand Cards?" checked="checked" >}}
  {{< setting-enum id="setting-cardSize" text="Card Size?" values="small,regular,huge" valaskey="true" def="regular" >}}
  <h3>Cards</h3>
  {{< setting-enum id="setting-setPeople" text="People Set?" values="starter,beginner,advanced,expert,random" valaskey="true" def="starter" >}}
  {{< setting-enum id="setting-setDecorations" text="Decoration Set?" values="starter,beginner,random" valaskey="true" def="starter" >}}
  {{< setting-enum id="setting-setTreats" text="Treat Set?" values="starter,beginner,random" valaskey="true" def="starter" >}}
{{< /boardgame-settings >}}

<p class="settings-remark">You can combine the sets in any way and the generator will create a balanced deck. The names "starter" and "beginner" merely give an indication how hard it is to play with this specific set.</p>

<p class="settings-remark"><strong>Not working? Or unsure what to do?</strong> The "Download" button above has PDFs I already made for you! Pick any one of those.</p>

{{% /section-centered %}}

{{% section-centered heading="Credits" anchor="credits" %}}

For more information, as always, read my [detailed developer diary on Pandaqi Blog](https://pandaqi.com/blog/boardgames/pumpkin-patrol).

{{% /section-centered %}}