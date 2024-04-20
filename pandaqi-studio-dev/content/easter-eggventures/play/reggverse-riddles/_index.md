---
type: "single"
gamepage: true
boardgame: true

title: "Reggverse Riddles"
headerTitle: "Win the reverse egg hunt by cleverly changing egg locations just before you decide to look."
blurb: "Win the reverse egg hunt by cleverly changing where eggs are hidden just before you decide to look."

extraCSS: true
downloadLink: ""

customHeight: "small"
headerDarkened: true

color: "purple"

bgColor: "#230023"
bgColorLink: "#CC66CC"

textColor: "#FFDDFF"
textColorLink: "#230023"

date: 2025-03-26

categories: ["boardgame"]
tags: ["creative", "guessing", "word"]

multiplayermode: "competitive"
language: EN
genre: ["card", "party", "social"]
playtime: 30
playercount: [2,3,4,5,6,7,8]
complexity: low
ages: everyone

---

{{% boardgame-intro heading="" %}}

An [Easter Eggventures](/easter-eggventures/) game about changing the rules that determine where eggs are hidden ... just before you decide to look and collec them.

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

{{< boardgame-settings type="game" local_storage="reggverseRiddlesConfig" btn_label="Generate Material" >}}
	{{< setting-hidden id="setting-gameTitle" text="Reggverse Riddles" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly grayscale." >}}
  {{< setting-enum id="setting-itemSize" text="Card Size?" values="small,regular,large" valaskey="true" def="regular" >}}
  {{< boardgame-settings-section heading="Sets" >}}
{{< setting-checkbox id="setting-sets-base" text="Base Game?" checked="checked" >}}
{{< setting-checkbox id="setting-sets-actionTiles" text="Action Tiles?" >}}
{{< setting-checkbox id="setting-sets-secretObjectives" text="Secret Objectives?" >}}
  {{< /boardgame-settings-section >}}
{{< /boardgame-settings >}}

<p class="settings-remark"><strong>Not working? Or unsure what to do?</strong> The "Download" button above has PDFs I already made for you! Pick any one of those.</p>

{{% /section-centered %}}

{{< support >}}

{{% section-centered heading="Credits" anchor="credits" %}}

As stated, this game is part of the Easter Eggventures project. It shares the fonts, style, and origins with all other games in the project. As such, for more information, check out the [Easter Eggventures overview page](/easter-eggventures/).

Funnily enough, the very first rules I playtested for this game were almost the exact inverse of the final rules. The rules said you had to do _either_ the Movement on your tile _or_ use its rule. This was just way too slow and felt you had no control, so I switched it to being forced to do both (move + place new rule), and suddenly the game clicked.

This was the hardest game for me to turn into specific rules. Because a "reverse egg hunt", where you change rules about where eggs are placed instead of looking for them in fixed locations, is a bit of a weird and abstract concept. Which is exactly why I was curious if it could be done ;) In the end, though, I think I turned it into a simple ruleset that anyone can understand quickly.

{{% /section-centered %}}