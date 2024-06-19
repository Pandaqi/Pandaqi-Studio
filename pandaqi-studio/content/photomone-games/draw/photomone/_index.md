---
type: "gamepage"
boardgame: true

title: "Photomone"
headerTitle: "A party game about drawing secret words like an ant"
blurb: "A drawing party game. But you're ants leaving pheromone trails, so drawing just became a lot harder and a lot more fun."
blurbShort: "A party game about drawing secret words. But you're an ant, so you can only draw using your pheromone trail."

weightProject: 10


color: "brown"


date: 2023-07-21

difficulty: "no-brainer"
genres: ["party"]
categories: ["boardgame", "one-paper-game", "hybrid-game"]
tags: ["drawing", "creative", "guessing", "turn-based"]
themes: ["top-down", "vector"]

extraJSBoardInclude: true
sharedJS: "photomone-games"
sharedJSInclude: true

downloadLink: "https://drive.google.com/drive/folders/1d3b_Zsuor4bz9sVmQIdErx2p5GIYF6Nk"

multiplayermode: "cooperative"
language: EN
playtime: 30
playercount: [2,3,4,5,6,7,8]
ages: everyone
devlog: "/blog/boardgames/photomone/"

---


{{% boardgame-intro class="no-shadow" /%}}

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

{{% boardgame-settings-container type="board" remarks="For most game modes, using _core_ (or _easy_) words is ideal. With words printed on the board, however, the game becomes much easier and it's recommended to allow much harder words!" %}}

{{< boardgame-settings type="board" local_storage="photomoneConfig" game_title="Photomone" defaults="true" >}}
  {{< setting-checkbox id="setting-printWordsOnPaper" text="Include Words?" remark="Prints random words on the paper itself." >}}
  {{< setting-enum id="setting-wordComplexity" text="Word Complexity?" values="Core,Easy,Medium,Hard" valaskey="true" remark="How hard should the words be?" def="Core" >}}
  {{< setting-checkbox id="setting-addStartingLines" text="Include Lines?" remark="Already adds a few random lines to the paper" >}}
  {{< setting-checkbox id="setting-useEllipseOutline" text="Use round edge?" remark="Makes the board more circular / organic." >}}
  {{< boardgame-settings-section heading="Expansions" >}}
    {{< setting-checkbox id="setting-expansions-sneakySpots" text="Sneaky Spots?" >}}
    {{< setting-checkbox id="setting-expansions-precisePainters" text="Precise Painters?" >}}
    {{< setting-checkbox id="setting-expansions-actionAnts" text="Action Ants?" >}}
    {{< setting-checkbox id="setting-expansions-coopColony" text="Coop Colony?" >}}
    {{< setting-checkbox id="setting-expansions-antertainmentBreak" text="Antertainment Break?" >}}
  {{< /boardgame-settings-section >}}
{{< /boardgame-settings >}}

{{% /boardgame-settings-container %}}

{{% boardgame-settings-container type="game" %}}

{{< boardgame-settings type="game" local_storage="photomoneConfig" game_title="Photomone" >}}
  {{< setting-checkbox id="setting-createPDF" text="Create PDF?" remark="Downloads a PDF with randomly generated word cards" >}}
  {{< setting-enum id="setting-wordComplexity" text="Word Complexity?" values="Core,Easy,Medium" valaskey="true" remark="How hard should the words be?" def="Core" >}}
  {{< setting-checkbox id="setting-expansions-sneakySpots" text="Sneaky Spots?" remark="The interface needs to know if you're using this expansion." >}}
  {{< boardgame-settings-section heading="Word Categories" >}}
{{< setting-checkbox-multiple id="setting-categories" values="anatomy,animals,clothes,food,items,nature,occupations,places,sports,vehicles" values_checked="anatomy,animals,clothes,food,items,nature,occupations,places,sports,vehicles" >}}
  {{< /boardgame-settings-section >}}
{{< /boardgame-settings >}}

{{% /boardgame-settings-container %}}

{{< support >}}

{{% section-centered heading="Credits" %}}

Check out the main page for [Photomone Games](/photomone-games/) for detailed credits and more information.

This was, as expected, the first and original version. It's probably also the simplest. Even though there are many ways to play (with a phone? without phone? printed word cards?), the core rules are incredibly simple yet always create challenges when trying to draw something.

Even though the other ideas came later and sought to give the game more depth or variation, I think I still prefer this first version the most. I'm just a person who likes really minimal and simple games that you can just pick up and instantly play with anyone.

{{% /section-centered %}}

<script>
window.onload = (ev) => {
  const p = new PHOTOMONE.Game({ gameTitle: "photomone", loadGame: false });
}
</script>