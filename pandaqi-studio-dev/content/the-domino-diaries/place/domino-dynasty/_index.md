---
type: "gamepage"
boardgame: true

title: "Domino Dynasty"
headerTitle: "Run a family empire by each fulfilling your own role as well as possible."
blurb: "Run a family empire by each fulfilling your own role as well as possible, by placing dominoes strategically for yourself or others."
blurbShort: "Run a family empire together and alone. A [Domino Diaries](/the-domino-diaries/) game."

weightProject: 50

downloadLink: "@TODO"

color: "purple"

date: 2025-01-12

categories: ["boardgame"]
tags: ["creative", "guessing", "word"]

multiplayermode: "cooperative"
language: EN
playtime: 30
playercount: [3,4,5,6,7]
ages: everyone
devlog: "/blog/boardgames/the-domino-diaries/domino-dynasty/"

---

{{% boardgame-intro /%}}

{{% boardgame-instructions /%}}

{{% boardgame-settings-container type="material" %}}

{{< boardgame-settings type="game" local_storage="dominoDynastyConfig" btn_label="Generate Material" game_title="Domino Dynasty" defaults="true">}}
  {{< boardgame-settings-section heading="Sets" >}}
    {{< setting-checkbox id="setting-sets-pawns" text="Pawns?" checked="checked" >}}
    {{< setting-checkbox id="setting-sets-base" text="Base?" checked="checked" >}}
    {{< setting-checkbox id="setting-sets-detail" text="Animal Detail Tiles?" checked="checked" >}}
    {{< setting-checkbox id="setting-sets-strong" text="Strong Species?" >}}
    {{< setting-checkbox id="setting-sets-wildlife" text="Wildlife Wishes?" >}}
    {{< setting-checkbox id="setting-sets-utilities" text="Unnatural Utilities?" >}}
  {{< /boardgame-settings-section >}}
{{< /boardgame-settings >}}

{{% /boardgame-settings-container %}}

{{% section-centered heading="Credits" anchor="credits" %}}

The fonts used are **Dumbledor** (headings) and **Libre Caslon Text** (body text). Some generative image AI was used. Everything else (code, idea, rules, illustrations) is entirely mine.

@TODO

{{% /section-centered %}}