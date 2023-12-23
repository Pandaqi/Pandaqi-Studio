---
type: "single"
gamepage: true
boardgame: true

title: "Hasty Accusations"
headerTitle: "Hasty Accusations | Ensure your character survives the murder investigation, but do it in secret."
blurb: "Everybody is investigating the same murder and pointing fingers every which way. Secret fingers. With secret actions. And you don't want too many targeting your hidden role."

extraCSS: true
downloadLink: "https://drive.google.com/drive/folders/1rpuM28gjwNK5-sSxLlJj0HYrXq8mgZkr" # already updated!

fullHeaderImg: "hasty_accusations_header"
headerImg: "hasty_accusations_header"

headerThumb: "hasty_accusations_favicon"

customHeight: "small"
headerDarkened: true

color: "black"

bgColor: "#014556"
bgColorLink: "#601a87"

textColor: "#e6faff"
textColorLink: "#edccff"

googleFonts: ""

date: 2023-01-01 # 2024-07-25?

categories: ["boardgame"]
tags: ["murder", "detective"]

multiplayermode: "competitive"
language: EN
genre: ["card", "party"]
playtime: 45
playercount: [2,3,4,5,6,7]
complexity: low
ages: everyone

---

{{% boardgame-intro heading="" %}}

Ensure your character survives the murder investigation, but do it in secret.

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

{{< boardgame-settings type="game" local_storage="hastyAccusationsConfig" btn_label="Generate Material" >}}
	{{< setting-hidden id="setting-gameTitle" text="Hasty Accusations" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly grayscale." >}}
  {{< setting-enum id="setting-cardSize" text="Card Size?" values="small,regular,huge" valaskey="true" def="regular" >}}
  {{< setting-checkbox id="setting-includeCards" text="Include Cards?" checked="checked" remark="Generates the action cards with which you play." >}}
  {{< setting-checkbox id="setting-includeCharacters" text="Include Characters?" checked="checked" remark="Generates material for all possible suspects." >}}
  {{< setting-enum id="setting-cardSet" text="Which set?" values="Base Game,Advanced Detective,Expert Investigator" keys="base,advanced,expert" def="base" >}}
{{< /boardgame-settings >}}

<p class="settings-remark"><strong>Not working? Or unsure what to do?</strong> The "Download" button above has PDFs I already made for you! Pick any one of those.</p>

{{% /section-centered %}}

{{% section-centered heading="Credits" anchor="credits" %}}

@TODO

For more information, as always, read my [detailed developer diary on Pandaqi Blog](https://pandaqi.com/blog/boardgames/hasty-accusations).

{{% /section-centered %}}