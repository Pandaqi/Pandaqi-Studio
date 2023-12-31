---
type: "single"

gamepage: true
boardgame: true

title: "Photomone: Antsassins"
headerTitle: "Photomone: Antsassins | A party game about trying to communicate which vague shape belongs to your team"
blurb: "A party game similar to Codenames. The board has random shapes, and you must somehow communicate which one is yours."

fullHeaderImg: "photomone_antsassins_header"
headerImg: "photomone_antsassins_header"

headerThumb: "favicon"

customHeight: "small"
headerDarkened: true

color: "brown"

bgColor: "#ffd59b"
bgColorLink: "#ffd340"

textColor: "#201913"
textColorLink: "#282310"

googleFonts: ""

date: 2023-09-18

categories: ["boardgame"]
tags: ["traditional"]

extraCSS: true

downloadLink: "https://drive.google.com/drive/folders/1g78Fggawe7LX35DNlYHZJALXqPZIAPav"

multiplayermode: "competitive"
language: EN
genre: ["party", "drawing", "association", "guessing", "team"]
playtime: 45
playercount: [2,3,4,5,6,7,8]
complexity: low
ages: everyone

---

{{% boardgame-intro heading="" img="photomone_antsassins_header" class="no-shadow" %}}

A party game about communicating a secret code to your team mates. But the code is made out of weird _shapes_---and you may only say _words_.

{{% /boardgame-intro %}}

{{% section-centered heading="What do I need?" %}}

Three simple steps.
* Read the short [playful rules](rules).
* Click "Download", go to "Files", and pick any _one_ of the Beginner's Sets.
* Print it, cut it, play!

**Want more?** You can [generate your own PDF](#material) with material below, according to your wishes. (Or, at the "Download", handpick your own _Code Cards_ and _Tiles_ combo.)

**Hey, Pandaqi here!** This game is quite experimental. It requires your group to be imaginative and take creative leaps, otherwise it falls flat. I am open to any feedback on how to improve it. If you read my [devlog](https://pandaqi.com/blog/boardgames/photomone-antsassins/), you'll see how much I struggled to make it "good enough".

{{% /section-centered %}}

{{% section-centered heading="Material" anchor="material" html="true" %}}

<p>Input your settings, click the button. A new page will open that generates a nice PDF for you!</p>

{{< boardgame-settings type="game" local_storage="photomoneAntsassinsConfig" btn_label="Create Material" >}}
	{{< setting-hidden id="setting-gameTitle" text="Photomone Antsassins" >}}
  {{< setting-enum id="setting-tileShape" text="Tile Shape?" values="Rectangle,Hexagon,Triangle" valaskey="true" >}}
  {{< setting-enum id="setting-tileType" text="Tile Type?" values="Photomone,Mosaic,Clouds,Shapes,Simple,Lines" valaskey="true" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly grayscale." >}}
  <h3>What to include?</h3>
  {{< setting-checkbox id="setting-includeTiles" text="Include Tiles?" checked="checked" >}}
  {{< setting-checkbox id="setting-includeCodeCards" text="Include Code Cards?" checked="checked" >}}
  {{< setting-checkbox id="setting-includeTokens" text="Include Tokens?" remark="Optional; you only need one set of these to play forever." checked="checked" >}}
  {{< setting-checkbox id="setting-addAlmostActions" text="Add Actions?" remark="Can be left out to make a first game simpler to learn." checked="checked" >}}
  {{< setting-enum id="setting-numSecretTilesPerTeam" text="Secret tiles per team?" values="1,2,3,4" def="1" valaskey="true" >}}
  {{< setting-enum id="setting-numTeamsOnCodeCard" text="Teams on code cards?" values="2,3,4" def="4" valaskey="true" >}}
{{< /boardgame-settings >}}

<p class="remark-below-settings">Everything is sorted based on how easy it is to play. Rectangles are more predictable (and easy to see shapes in) than hexagons or triangles. The same is true Photomone and Mosaic vs the rest.</p> 

<p class="remark-below-settings">Not working? Don't worry! At the "Download" link, you can also find PDFs I already generated for you.</p> 

{{% /section-centered %}}

{{< support >}}

{{% section-centered heading="Credits" %}}

The fonts used are **Proza Libre** and **GelDotica**. All other assets and code are mine.

This game is a spin-off of [Photomone](https://pandaqi.com/photomone) . Visit the original game for more information and more fun!

For a detailed diary about the game, check out the [devlog](https://pandaqi.com/blog/boardgames/photomone-antsassins/).

<div class="photomone-update-block" style="margin-bottom: 3em;">
Photomone now has a spin-off you can play entirely on a smartphone or tablet! Check out <a href="https://pandaqi.com/photomone-digital-antists">Photomone: Digital Ant-ists</a>.
</div>

{{% /section-centered %}}