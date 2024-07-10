---
type: "gamepage"
boardgame: true

title: "Mountain Miners"
headerTitle: "Mine the best tiles from the top of the mountain, by constantly changing what is up and what is down."
blurb: "Mine the best tiles from the top of the mountain, by constantly changing what is up and what is down."

downloadLink: "https://drive.google.com/drive/folders/1Y8dzzlw19-ZWUxmLlk7f35NBR22OEEkd"


color: "black"


date: 2024-11-12

difficulty: "kids-can-play"
genres: ["family"]
categories: ["boardgame", "tile-game", "standard"]
tags: ["set-collection", "shared-map", "fixed-order", "high-score", "mining", "orientation"]
themes: ["fantasy"]

multiplayermode: "competitive"
language: EN
playtime: 15
playercount: [2,3,4,5,6]
ages: everyone
devlog: "/blog/boardgames/mountain-miners/"

---

{{% boardgame-intro /%}}

{{% boardgame-instructions %}}
The base game can be learned in less than a minute; several small expansions keep the game interesting for way longer!
{{% /boardgame-instructions %}}

{{% boardgame-settings-container type="material" remarks="The optional expansions can be used however you wish. If you check all of them, however, more tile types are possible in the generation (but you also need to play with both expansions enabled)." %}}

{{< boardgame-settings type="game" local_storage="mountainMinersConfig" btn_label="Generate Material" game_title="Mountain Miners" defaults="true" >}}
  {{< boardgame-settings-section heading="Sets" >}}
    {{< setting-checkbox id="setting-sets-base" text="Base Game?" checked="checked" >}}
    {{< setting-checkbox id="setting-sets-darkTunnels" text="Dark Tunnels?" >}}
    {{< setting-checkbox id="setting-sets-gemShards" text="Gemshards?" >}}
    {{< setting-checkbox id="setting-sets-goldenActions" text="Golden Actions?" >}}
  {{< /boardgame-settings-section >}}
{{< /boardgame-settings >}}

{{% /boardgame-settings-container %}}

{{% section-centered heading="Credits" anchor="credits" %}}

The fonts used are **Vlaanderen Chiseled** (headings, decorative text) and **Rokkitt** (body, longer paragraphs). Both are freely available online. Some generative AI was used for the main tile illustrations, everything else is entirely mine.

I'm not sure where this game idea started. It just popped into my head like "wait a minute, if you rotate a grid of tiles sideways, you get a diamond shape. That's like 4 mountains attached to each other. So you can have a game about people mining from the top of the mountain, but _which_ mountain changes all the time". 

I sketched it, prototyped it, made some changes, actually spent most of the time creating graphics and refining actions, and before you know it there was a very simple but effective game.

I like those kinds of games, because they have very simple _material_ requirements (just a bunch of tiles) and all information is _open_ (the entire mountain is public and visible from the start, allowing long-term plans). Especially with family or kid's games like these, that really helps. If somebody has forgotten what a certain action does, they can just point at it and someone else will remind them. You can't do that when you have to be "secretive" about which cards you're holding or whatever.

I also like it because it's just such a simple and silly idea---turn the regular rectangular board into a diamond by placing it at an angle---that actually works.

{{% /section-centered %}}