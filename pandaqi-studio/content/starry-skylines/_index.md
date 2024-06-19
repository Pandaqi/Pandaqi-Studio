---
type: "gamepage"
boardgame: true

title: "Starry Skylines"
headerTitle: "Build your new city in space, together"
blurb: "You are all simultaneously building a city in space. On the same planet. And no, this is not a cooperative game."
blurbShort: "A [One Paper Game](/boardgames#one-paper-games) for 1--9 players about simultaneously building a city in space."

noThumb: true
customHeight: "small-medium"

color: "black"


extraJSBoardInclude: true

date: 2020-08-22

difficulty: "no-brainer"
genres: ["family"]
categories: ["boardgame", "one-paper-game", "hybrid-game"]
tags: ["area-control", "numbers", "point-salad", "logic", "variable-setup", "construction", "synergies", "events", "modular"]
themes: ["space", "top-down"]

downloadLink: "https://drive.google.com/drive/folders/1_CkFN2QRv_amGofQcfP9RkGQgiZj9HXh"

multiplayermode: "competitive"
language: EN
playtime: 30-60
playercount: [1,2,3,4,5,6,7,8,9]
ages: everyone
devlog: "/blog/boardgames/starry-skylines/devlog-starry-skylines/"

---

{{% boardgame-intro /%}}

<div class="limit-width explanation-gif">
  {{< video url="video/starryskylines_explanation_gif" controls="controls" >}}
</div>

{{% section-centered heading="How to play" unfold="true" %}}

Build the nicest neighbourhood on your planet and **score the most points**. The problem? Your opponents are doing the same and invading your precious space!

Each round, this website presents **three new options**. Each player must **pick one** of the options and execute it.

An option can contain _buildings_ to place, _people_ to add to your buildings, a _special effect_ to execute or a _street number_ to place.

Play continues until the board is full or a player has been unable to do a move for several turns.

Count your people, count your buildings, get awards for special achievements, and voila---the player with the most points wins!

{{% /section-centered %}}

{{% section-centered heading="What do I need?" %}}

Three simple steps.

* Grab an empty sheet of paper, fold it six times.
* Click "Download" to find the rulebook. (Only read the first few pages for your first game.)
* Open the [game](#game) on any device.

This website handles everything for you. It also shows explanations for all the different buildings and mechanics (if you **click** on them).

**Don't like blank papers?** Use the [board](#board) generator below to get a random starting setup.

{{% /section-centered %}}

{{% boardgame-settings-container type="game" %}}

{{< boardgame-settings type="game" local_storage="starrySkylinesConfig" game_title="Starry Skylines" >}}
  {{< setting-playercount min="1" max="8" def="3" >}}
  {{< setting-enum id="setting-planet" text="Planet?" values="Learnth,Uronus,Marsh,Yumpiter,Meercury,Intervenus,Pluto,Naptune" valaskey="true" keep-case="true" >}}
  {{< setting-enum id="setting-manualCombo" text="Play handpicked combination?" values="-- ignore --,Nature,Leadership,Resources,Entertainment,Chaotic" keys=",Nature,Leadership,Resources,Entertainment,Chaotic" remark="Choose a handpicked combination of planets if you want to follow a particular theme. Only use this if you've read the rules for all planets before." >}}
{{< /boardgame-settings >}}

{{% /boardgame-settings-container %}}

{{% boardgame-settings-container type="board" remarks="**Only 3 players maximum?** Nope! As stated in the rules, each _paper_ has a maximum of 3 players. So, for example, with 5 players you play on _two_ papers. Copy this same starting setup to all." %}}

{{< boardgame-settings type="board" game_title="Starry Skylines" defaults="true" >}}
  {{< setting-playercount min="1" max="3" def="3" >}}
  {{< setting-enum id="setting-planet" text="Planet?" values="Learnth,Uronus,Marsh,Yumpiter,Meercury,Intervenus,Pluto,Naptune" valaskey="true" keep-case="true" >}}
  {{< setting-enum id="setting-manualCombo" text="Play handpicked combination?" values="-- ignore --,Nature,Leadership,Resources,Entertainment,Chaotic" keys=",Nature,Leadership,Resources,Entertainment,Chaotic" >}}
{{< /boardgame-settings >}}

{{% /boardgame-settings-container %}}

{{< support >}}

{{% section-centered heading="Credits" %}}

This game is inspired by the boardgame [Welcome To ...](https://boardgamegeek.com/boardgame/233867/welcome). If you like this game, check out that one!

Fonts are freely available from Google Fonts. 

* [Titillium Web](https://fonts.google.com/specimen/Titillium+Web) for the body text
* [Montserrat Subrayada](https://fonts.google.com/specimen/Montserrat+Subrayada) for the headers

Because the first font looked "space-y", while legible.Tthe second font looked like the letters were skylines. Perfect!

I've also written a detailed devlopment log about the whole process of creating this game: [(Devlog) Starry Skylines](/blog/boardgames/starry-skylines/devlog-starry-skylines)

Wondering what a game looks like? Here are some of our test games.

{{% figure alt="Three finished games of Starry Skylines" url="page/starryskylines_finishedgames" %}}

<span style="opacity: 0.75; font-style: italic; font-size: 0.75em; display: inline-block;">(Yeah, we couldn't find any white paper, therefore we used yellow ones. This is a section of the campaign I played with two players; there are more games on the backside of these papers.)</span>

{{% /section-centered %}}