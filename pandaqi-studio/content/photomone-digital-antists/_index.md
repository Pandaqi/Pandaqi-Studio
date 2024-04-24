---
type: "single"
gamepage: true

title: "Photomone: Digital Antists"
headerTitle: "A video game spin-off for Photomone"
blurb: "Communicate words by drawing. But you may only draw straight lines between the dots on your screen, and not all dots are created equal."

customHeight: "small"
headerDarkened: true

color: "brown"

bgColor: "#ffeba2"
bgColorLink: "#ee4266"

textColor: "#362a03"
textColorLink: "#ffe4ea"

date: 2023-08-21

difficulty: "no-brainer"
genres: ["party"]
categories: ["boardgame", "one-paper-game", "hybrid-game", "spin-off"]
tags: ["drawing", "creative", "guessing", "turn-based"]
themes: ["top-down", "vector"]

extraCSS: true
sharedJS: "photomone"
sharedJSInclude: true

downloadLink: ""

multiplayermode: "cooperative"
language: EN
genres: ["party", "drawing", "association", "guessing"]
playtime: 30
playercount: [2,3,4,5,6,7,8]
complexity: low
ages: everyone
devlog: "/blog/boardgames/photomone-digital-antists/"

---

<script>window.configStringToUse = window.localStorage.photomoneDigitalAntistsConfig;</script>
<!-- <div style="margin-top: min(3vw, 2em);"> -->

<div style="margin-bottom: -23vw; position: relative; z-index: -1; opacity: 0.9;">
  <img src="assets/photomone_digital_antists_header.webp">
</div>

<div style="max-width: 720px; margin: auto; padding: 1em;">
<!-- <h2 style="text-align: center; filter: drop-shadow(0 0 4px black);">Try it!</h2> -->

<p style="background-color: rgba(0,0,0,0.86); border-radius: 0.5em; padding: 0.5em;;">Use this demo to instantly try Photomone (and if it works on your device). Once you're ready to start an actual game, scroll down to <a href="#game">the game</a>.</p>

<div class="photomone-canvas" data-addui="true" data-pointradiusfactor="0.02" data-pointboundsmin="50" data-pointboundsmax="100" data-linewidthfactor="0.015" data-noexpansions="true" data-transparentbackground="false" style="filter: drop-shadow(0 0 12px #222);"></div>

</div>

{{% section-centered heading="Game" anchor="game" html="true" %}}

<p>Input your settings, click the button. A new page opens and you can immediately play</p>

<p>If unsure, just leave all settings as they are.</p>

{{< boardgame-settings type="game" local_storage="photomoneDigitalAntistsConfig" game_title="Photomone: Digital Antists" >}}
  {{< setting-enum id="setting-wordComplexity" text="Word Complexity?" values="Core,Easy,Medium" valaskey="true" remark="How hard should the words be?" def="Core" >}}
  {{< setting-enum id="setting-timerLength" text="Timer Length?" values="30,45,60,90" valaskey="true" remark="How many seconds you have per drawing?" def="45" >}}
  {{< setting-checkbox id="setting-enableTutorial" text="Tutorial?" remark="Explains how to play while taking your first few turns." checked="checked" >}}
  {{< setting-checkbox id="setting-expansions-sneakySpots" text="Sneaky Spots?" remark="Adds dots with special powers." >}}
  {{< boardgame-settings-section heading="Word Categories" >}}
    {{< setting-checkbox-multiple id="setting-categories" values="anatomy,animals,clothes,food,items,nature,occupations,places,sports,vehicles" values_checked="anatomy,animals,clothes,food,items,nature,occupations,places,sports,vehicles" >}}
  {{< /boardgame-settings-section >}}
{{< /boardgame-settings >}}

{{% /section-centered %}}

{{< support >}}

{{% section-centered heading="Credits" %}}

This game is a (completely digital) spin-off for [Photomone](https://pandaqi.com/photomone). It is played on one device (preferably a tablet or smartphone), instead of drawing on a physical paper. It's simplified in some ways, and changed in others to use the computer for cool stuff!

For a detailed diary about the game, check out the [devlog](/blog/boardgames/photomone-digital-antists).

<div class="photomone-update-block" style="margin-bottom: 3.5em;">
Photomone now has a spin-off that turns the game on its head. The result is something similar to popular games like "Codenames". Check out <a href="https://pandaqi.com/photomone-antsassins/">Photomone: Antsassins</a>.
</div>

{{% /section-centered %}}

<script>
window.onload = (ev) => {
  const p = new PHOTOMONE.Game({ gameTitle: "photomoneDigital", loadGame: false })
}
</script>