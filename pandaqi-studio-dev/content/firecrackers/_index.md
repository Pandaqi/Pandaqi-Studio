---
type: "single"
gamepage: true
boardgame: true

title: "Firecrackers"
headerTitle: "Firecrackers | Build the best fireworks show without having it blow up in your face."
blurb: "A push-your-luck game about building your own deck of valuable fireworks, with the least chance of igniting the wrong one."

extraCSS: true
downloadLink: "https://drive.google.com/drive/folders/12cmopxbr8HZWw8jkXijINkCd8wdTAPQs" # already_updated!

fullHeaderImg: "firecrackers_header"
headerImg: "firecrackers_header"

headerThumb: "firecrackers_favicon"

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
tags: ["medieval", "mosaic", "numbers", "deck"]

multiplayermode: "competitive"
language: EN
genre: ["card", "party"]
playtime: 20
playercount: [2,3,4,5,6,7,8,9,10]
complexity: low
ages: everyone

---


{{% boardgame-intro heading="" %}}

Build the best fireworks show without having it blow up in your face.

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

{{< boardgame-settings type="game" local_storage="firecrackersConfig" btn_label="Generate Material" >}}
	{{< setting-hidden id="setting-gameTitle" text="Firecrackers" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly grayscale." >}}
  {{< setting-enum id="setting-cardSize" text="Card Size?" values="small,regular,large" valaskey="true" def="regular" >}}
  <h3>Packs</h3>
  {{< setting-checkbox-multiple id="setting-packs" values="black,red,orange,yellow,green,turquoise,blue,purple,pink,brown,white" valuesChecked="black,red,yellow,green,blue,brown" >}}
{{< /boardgame-settings >}}

<p class="settings-remark"><strong>Not working? Or unsure what to do?</strong> The "Download" button above has PDFs I already made for you! Pick any one of those.</p>

{{% /section-centered %}}

{{% section-centered heading="Credits" anchor="credits" %}}

The fonts used are **4th of July** (headings, fancy text) and **Neuton** (body text, readable, multiple variations). Both freely available online. Parts of the illustrations were generated with AI; everything else is mine.

@TODO

For more information, as always, read my [detailed developer diary on Pandaqi Blog](https://pandaqi.com/blog/boardgames/firecrackers).

{{% /section-centered %}}