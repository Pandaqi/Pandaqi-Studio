---
type: "gamepage"

boardgame: true

title: "Photomone: Antsassins"
headerTitle: "A party game about trying to communicate which vague shape belongs to your team"
blurb: "A party game similar to Codenames. The board has random shapes, and you must somehow communicate which one is yours."
blurbShort: "A party game about communicating a secret code to your team mates. But the code is made out of weird _shapes_---and you may only say _words_."

weightProject: 30


color: "brown"


date: 2023-09-18

difficulty: "no-brainer"
genres: ["party"]
categories: ["boardgame", "standard", "tile-game", "spin-off"]
tags: ["creative", "guessing", "turn-based"]
themes: ["top-down", "vector"]


downloadLink: "https://drive.google.com/drive/folders/1g78Fggawe7LX35DNlYHZJALXqPZIAPav"

multiplayermode: "competitive"
language: EN
playtime: 45
playercount: [2,3,4,5,6,7,8]
ages: everyone
devlog: "/blog/boardgames/photomone-antsassins/"

---

{{% boardgame-intro /%}}

{{% boardgame-instructions %}}
**Hey, Pandaqi here!** This game is quite experimental. It requires your group to be imaginative and take creative leaps, otherwise it falls flat. I am open to any feedback on how to improve it. If you read my [devlog](/blog/boardgames/photomone-antsassins/), you'll see how much I struggled to make it "good enough".
{{% /boardgame-instructions %}}

{{% boardgame-settings-container type="material" remarks="Everything is sorted based on how easy it is to play. Rectangles are more predictable (and easy to see shapes in) than hexagons or triangles. The same is true Photomone and Mosaic vs the rest." %}}

{{< boardgame-settings type="game" local_storage="photomoneAntsassinsConfig" btn_label="Create Material" game_title="Photomone Antsassins" >}}
  {{< setting-enum id="setting-tileShape" text="Tile Shape?" values="Rectangle,Hexagon,Triangle" valaskey="true" >}}
  {{< setting-enum id="setting-tileType" text="Tile Type?" values="Photomone,Mosaic,Clouds,Shapes,Simple,Lines" valaskey="true" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly grayscale." >}}
  {{< boardgame-settings-section heading="What to Include?" >}}
    {{< setting-checkbox id="setting-includeTiles" text="Include Tiles?" checked="checked" >}}
    {{< setting-checkbox id="setting-includeCodeCards" text="Include Code Cards?" checked="checked" >}}
    {{< setting-checkbox id="setting-includeTokens" text="Include Tokens?" remark="Optional; you only need one set of these to play forever." checked="checked" >}}
    {{< setting-checkbox id="setting-addAlmostActions" text="Add Actions?" remark="Can be left out to make a first game simpler to learn." checked="checked" >}}
    {{< setting-enum id="setting-numSecretTilesPerTeam" text="Secret tiles per team?" values="1,2,3,4" def="1" valaskey="true" >}}
    {{< setting-enum id="setting-numTeamsOnCodeCard" text="Teams on code cards?" values="2,3,4" def="4" valaskey="true" >}}
  {{< /boardgame-settings-section >}}
{{< /boardgame-settings >}}

{{% /boardgame-settings-container %}}

{{< support >}}

{{% section-centered heading="Credits" %}}

Check out the main page for [Photomone Games](/photomone-games/) for detailed credits and more information.

This game is basically my attempt at turning the Photomone idea into a "traditional game", where you just print and cut material once, and can then replay it forever. I also tried to take it one step further again, by adding many different tiles with "vague visualizations" that can be combined to maybe look like something else, and code cards with special abilities and actions.

Yes, the game Codenames was a direct inspiration for this. But also, yes, as stated at the top of the game page, this game ended up quite experimental and not as amazing as I'd hoped. Hopefully one day I will figure out what hampered the development so much and provide an updated version that is smoother.

For a detailed diary about the game, check out the [devlog](/blog/boardgames/photomone-antsassins/). It is looong and writes about aaaaall the problems I encountered and different versions.

{{% /section-centered %}}