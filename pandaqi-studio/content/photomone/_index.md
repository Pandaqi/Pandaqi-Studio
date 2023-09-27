---
type: "single"
gamepage: true
boardgame: true

title: "Photomone"
headerTitle: "Photomone | A party game about drawing secret words like an ant"
blurb: "A drawing party game. But you're ants leaving pheromone trails, so drawing just became a lot harder and a lot more fun."

fullHeaderImg: "photomone_header"
headerImg: "photomone_header"

headerThumb: "favicon"

customHeight: "small"
headerDarkened: true

color: "brown"

bgColor: "#ffc48a"
bgColorLink: "#ffd340"

textColor: "#302a24"
textColorLink: "#282310"

googleFonts: ""

date: 2023-07-21

categories: ["boardgame"]
tags: ["hybrid", "opg", "one_paper_game", "traditional"]

extraCSS: true
extraJSBoard: true
extraJSBoardInclude: true
sharedJS: "photomone"
sharedJSInclude: true

downloadLink: "https://drive.google.com/drive/folders/1d3b_Zsuor4bz9sVmQIdErx2p5GIYF6Nk"

multiplayermode: "cooperative"
language: EN
genre: ["party", "drawing", "association", "guessing"]
playtime: 30
playercount: [2,3,4,5,6,7,8]
complexity: low
ages: everyone

---


{{% boardgame-intro heading="" img="photomone_header" class="no-shadow" %}}

A party game about drawing secret words. But you're an ant, so you can only draw using your pheromone trail.

{{% /boardgame-intro %}}

{{% section-centered html="true" %}}

<div class="photomone-canvas" data-addui="true" data-pointradiusfactor="0.02" data-pointboundsmin="50" data-pointboundsmax="100" data-linewidthfactor="0.015" data-transparentbackground="false" inkfriendly="" data-noexpansions="true">
</div>

{{% /section-centered %}}

{{% section-centered heading="What do I need?" %}}

First time playing? Read the short [playful rules](rules).

For each game, you need two things: a paper board (to draw on) and a list of words.

You can generate [random boards](#board) below. Print and play!

For the words, pick whatever style suits you best.

* **Like traditional games?** Click "Download" and print the material (3 pages of word cards). Reuse that anytime you want to play.
* **Don't mind a smartphone?** Use [the word generator](#game) on a device (like a smartphone) to get secret words while playing.
* **Travelling? Low on space?** Enable the "include words" option when generating boards. This means the words are printed _on the board itself_.

{{% /section-centered %}}

{{% section-centered heading="Board" html="true" anchor="board" %}}

<p>Input your desired settings and click "generate".</p>

{{< boardgame-settings type="board" local_storage="photomoneConfig" >}}
  {{< setting-hidden id="setting-gameTitle" text="Photomone" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly white / grayscale to conserve ink." >}}
  {{< setting-checkbox id="setting-printWordsOnPaper" text="Include Words?" remark="Prints random words on the paper itself." >}}
  {{< setting-enum id="setting-wordComplexity" text="Word Complexity?" values="Core,Easy,Medium,Hard" valaskey="true" remark="How hard should the words be?" def="Core" >}}
  {{< setting-checkbox id="setting-addStartingLines" text="Include Lines?" remark="Already adds a few random lines to the paper" >}}
  {{< setting-checkbox id="setting-useEllipseOutline" text="Use round edge?" remark="Makes the board more circular / organic." >}}

  <h3>Expansions</h3>
  {{< setting-checkbox id="setting-expansions-sneakySpots" text="Sneaky Spots?" >}}
  {{< setting-checkbox id="setting-expansions-precisePainters" text="Precise Painters?" >}}
  {{< setting-checkbox id="setting-expansions-actionAnts" text="Action Ants?" >}}
  {{< setting-checkbox id="setting-expansions-coopColony" text="Coop Colony?" >}}
  {{< setting-checkbox id="setting-expansions-antertainmentBreak" text="Antertainment Break?" >}}
{{< /boardgame-settings >}}

<p style="font-size:0.66em; opacity: 0.66;">Not working? Don't worry! At the "Download" link, you can also find PDFs with valid boards for all situations. Check the "Premade" folder.</p> 

<p style="font-size:0.66em; opacity: 0.66;">For most game modes, using "core" (or "easy") words is ideal. With words printed on the board, however, the game becomes much easier and it's recommended to allow much harder words!</p> 

{{% /section-centered %}}

{{% section-centered heading="Game" anchor="game" html="true" %}}

<p>Input your settings, click the button. A new page opens with the game interface!</p>

{{< boardgame-settings type="game" local_storage="photomoneConfig" >}}
	{{< setting-hidden id="setting-gameTitle" text="Photomone" >}}
  {{< setting-checkbox id="setting-createPDF" text="Create PDF?" remark="Downloads a PDF with randomly generated word cards" >}}
  {{< setting-enum id="setting-wordComplexity" text="Word Complexity?" values="Core,Easy,Medium" valaskey="true" remark="How hard should the words be?" def="Core" >}}
  <!-- {{< setting-checkbox id="setting-includeNamesAndGeography" text="Include names?" remark="Adds geography and proper names of people, brands, ..." >}} -->
  {{< setting-checkbox id="setting-expansions-sneakySpots" text="Sneaky Spots?" remark="The interface needs to know if you're using this expansion." >}}
  <h3>Word Categories</h3>
  {{< setting-checkbox-multiple id="setting-categories" values="anatomy,animals,clothes,food,items,nature,occupations,places,sports,vehicles" valuesChecked="anatomy,animals,clothes,food,items,nature,occupations,places,sports,vehicles" >}}
{{< /boardgame-settings >}}

{{% /section-centered %}}

{{< support >}}

{{% section-centered heading="Credits" %}}

The fonts used are **Proza Libre** and **GelDotica**. All other assets and code are mine.

This idea started its life many years ago when I saw a game called "StarLink". In that game---you never guessed it---you must draw things by connecting stars with straight lines. However, that's where the game stopped. I tried to continue the idea further, take it in completely new directions, and provide that for free.

For a detailed diary about the game, check out the [devlog](https://pandaqi.com/blog/boardgames/photomone).

<div class="photomone-update-block">
Photomone now has a spin-off you can play entirely on a smartphone or tablet! Check out <a href="https://pandaqi.com/photomone-digital-antists">Photomone: Digital Ant-ists</a>.
</div>

<div class="photomone-update-block" style="margin-bottom: 3em;">
Photomone now has a spin-off that turns the game on its head. The result is something similar to popular games like "Codenames". Check out <a href="https://pandaqi.com/photomone-antsassins">Photomone: Antsassins</a>.
</div>

{{% /section-centered %}}

<script>
window.onload = (ev) => {
  const p = new PHOTOMONE.Game({ gameTitle: "photomone", loadGame: false });
}
</script>