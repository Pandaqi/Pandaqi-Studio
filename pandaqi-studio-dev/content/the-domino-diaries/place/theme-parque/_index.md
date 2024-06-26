---
type: "gamepage"
boardgame: true

title: "Theme Parque"
headerTitle: "Design a theme park of dominoes together that scores you the most points."
blurb: "Design a theme park of dominoes together, but with the queues and attractions that score you the most points."

downloadLink: "@TODO"

color: "purple"

date: 2025-01-12

categories: ["boardgame"]
tags: ["creative", "guessing", "word"]

multiplayermode: "cooperative"
language: EN
genre: ["card", "party", "social"]
playtime: 30
playercount: [3,4,5,6,7]
complexity: low
ages: everyone
devlog: "/blog/boardgames/librarians/"

---

{{% boardgame-intro /%}}

{{% boardgame-instructions /%}}

{{% boardgame-settings-container type="material" %}}

{{< boardgame-settings type="game" local_storage="themeParqueConfig" btn_label="Generate Material" game_title="Theme Parque" defaults="true">}}
  {{< setting-checkbox id="setting-addText" text="Add Text on Tiles?" checked="checked" remark="Explains how each special tile works on the tile itself." >}}
  {{< boardgame-settings-section heading="Sets" >}}
    {{< setting-checkbox id="setting-sets-pawns" text="Pawns?" checked="checked" >}}
    {{< setting-checkbox id="setting-sets-base" text="Base?" checked="checked" >}}
    {{< setting-checkbox id="setting-sets-wishneyland" text="Wishneyland Parki?" >}}
    {{< setting-checkbox id="setting-sets-unibearsal" text="Unibearsal Honeyos?" >}}
    {{< setting-checkbox id="setting-sets-rollercoasters" text="Raging Rollercoasters?" >}}
  {{< /boardgame-settings-section >}}
{{< /boardgame-settings >}}

{{% /boardgame-settings-container %}}

{{% section-centered heading="Credits" anchor="credits" %}}

@TODO

{{% /section-centered %}}