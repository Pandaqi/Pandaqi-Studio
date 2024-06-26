---
type: "gamepage"
boardgame: true

title: "Dinoland"
headerTitle: "Create a flourishing world of dinosaurs that avoids the asteroid as much as possible."
blurb: "Create a flourishing world of dinosaurs that avoids the asteroid as much as possible."

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

{{< boardgame-settings type="game" local_storage="dinolandConfig" btn_label="Generate Material" game_title="Dinoland" defaults="true">}}
  {{< boardgame-settings-section heading="Sets" >}}
    {{< setting-checkbox id="setting-sets-pawns" text="Pawns?" checked="checked" >}}
    {{< setting-checkbox id="setting-sets-base" text="Base?" checked="checked" >}}
    {{< setting-checkbox id="setting-sets-expansion" text="Expansion?" >}}
  {{< /boardgame-settings-section >}}
{{< /boardgame-settings >}}

{{% /boardgame-settings-container %}}

{{% section-centered heading="Credits" anchor="credits" %}}

@TODO

{{% /section-centered %}}