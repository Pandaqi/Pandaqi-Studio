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

Smash the poisoned food faster than anyone else to prevent the king's assassination!

{{% /boardgame-intro %}}

{{% section-centered heading="What do I need?" %}}

Three simple steps.
* Read the short [playful rules](rules).
* Download the base game PDF. (Download > Files > Starter.)
* Print, cut, play!

**Want more?** You can also [generate your own material](#material) right on this website! Pick the set you like (or "random") and press the button.

{{% /section-centered %}}

{{% section-centered heading="Material" anchor="material" html="true" %}}

<p>Pick your desired settings and click the button! When in doubt, just use the defaults for a first game.</p>

{{< boardgame-settings type="game" local_storage="pumpkinPatrolConfig" btn_label="Generate Material" >}}
	{{< setting-hidden id="setting-gameTitle" text="Pumpkin Patrol" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly grayscale." >}}
  {{< setting-enum id="setting-cardSet" text="Card Set?" values="starter,beginner,amateur,advanced,expert,random" valaskey="true" def="starter" >}}
  {{< setting-enum id="setting-cardSize" text="Card Size?" values="small,regular,huge" valaskey="true" def="regular" >}}
{{< /boardgame-settings >}}

{{% /section-centered %}}

{{% section-centered heading="Credits" anchor="credits" %}}

For more information, as always, read my [detailed devlog on Pandaqi Blog](https://pandaqi.com/blog/boardgames/cookie-smasher).

{{% /section-centered %}}