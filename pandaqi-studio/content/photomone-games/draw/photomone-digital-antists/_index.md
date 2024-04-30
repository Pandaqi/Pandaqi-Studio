---
type: "single"
gamepage: true

title: "Photomone: Digital Antists"
headerTitle: "A video game spin-off for Photomone"
blurb: "Communicate words by drawing. But you may only draw straight lines between the dots on your screen, and not all dots are created equal."

weightProject: 20

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
sharedJS: "photomone-games"
sharedJSInclude: true

downloadLink: ""

multiplayermode: "cooperative"
language: EN
playtime: 30
playercount: [2,3,4,5,6,7,8]
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

Check out the main page for [Photomone Games](/photomone-games/) for detailed credits and more information.

This game is basically the same as the original Photomone, except of course that it's _digital_!

It is played on one device (preferably a tablet or smartphone), instead of drawing on a physical paper. It's simplified in some ways, and changed in others to use the computer for cool stuff! 

This was one of the first instances where I realized just how powerful the addition of one device can be for some games. It can take away any downtime or setup (the computer handles it for you!) and remove the need to print or carry material. That's why I started doing hybrid games a lot more after this one (and the [Keebble Games](/keebble-games/).)

For some games it's still a bad idea, though. That is why 90+% of my board games are still completely analog, and that will probably not change much in the future.

For a detailed diary about the game, check out the [devlog](/blog/boardgames/photomone-digital-antists).

{{% /section-centered %}}

<script>
window.onload = (ev) => {
  const p = new PHOTOMONE.Game({ gameTitle: "photomoneDigital", loadGame: false })
}
</script>