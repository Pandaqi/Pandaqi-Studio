---
type: "gamepage"
gamepage: true
boardgame: true

title: "Waterfall"
headerTitle: "Fall down the waterfall as best you can to collect the highest-scoring gemstones along the way."
blurb: "Fall down the waterfall as best you can, while lengthening the waterfall as you play, to collect the highest-scoring gemstones along the way."
blurbShort: "Fall down the waterfall as best you can to collect the highest-scoring gemstones along the way."

downloadLink: ""

color: "turquoise"
invert: true

date: 2025-05-26

categories: ["boardgame"]
tags: ["creative", "guessing", "word"]

multiplayermode: "competitive"
language: EN
playtime: 30
playercount: [2,3,4,5,6]
ages: everyone
devlog: "/blog/boardgames/waterfall/"

---

{{% boardgame-intro /%}}

{{% boardgame-instructions %}}

This game is uses text for the action on tiles, which means some English reading comprehension is required. It also adds a few more rules and variations, making it a more complicated (but "deeper") version of the original.

If you want a very simple, textless, more casual game, check out the original [Waterfall](/waterfall/) game!  

{{% /boardgame-instructions %}}

{{% boardgame-settings-container type="material" %}}

{{< boardgame-settings type="game" local_storage="waterfallConfig" btn_label="Generate Material" game_title="Waterfall" defaults="true" >}}
  {{< setting-checkbox id="setting-useIconsForDefaultActions" text="Use Icons for Common Actions?" remark="Some actions are 90% of the game; represent those with an icon instead of English text." >}}
  {{< setting-checkbox id="setting-useConditionalActions" text="Allow Conditional Actions?" remark="Slightly harder to understand, but allow more depth and variety." >}}
  {{< boardgame-settings-section heading="Sets" >}}
    {{< setting-checkbox id="setting-sets-pawns" text="Player Pawns?" checked="checked" >}}
    {{< setting-checkbox id="setting-sets-base" text="Base Tiles?" checked="checked" >}}
    {{< setting-checkbox id="setting-sets-gates" text="Gated Tiles?" remark="Harder to understand and play with, but allow more depth and variety." >}}
  {{< /boardgame-settings-section >}}
{{< /boardgame-settings >}}

{{% /boardgame-settings-container %}}

{{% section-centered heading="Credits" anchor="credits" %}}

This was actually the "original version" of my Waterfall game idea. After working on it, however, I realized how to make it simpler and remove all text. (This almost always happens and is why iteration is the magic word when trying to create _anything_.) That is why there are _two_ Waterfall games which I developed and released in parallel.

As such, for more background information or details, visit the [Waterfall](/waterfall/) project page.

{{% /section-centered %}}