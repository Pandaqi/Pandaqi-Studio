---
type: "single"
gamepage: true
boardgame: true

title: "The Mist"
headerTitle: "Explore an area covered in mist and discover the right path"
blurb: "A Mist covers the world. Each area might be a warm fire, or a trap, or a portal---you decide, but do so wisely."

extraCSS: true
extraJSBoard: true
extraJSBoardInclude: true
downloadLink: "https://drive.google.com/drive/folders/1yy2JZhtm1iiTvff9o3kyOf0sXtMQjF_f" # already updated!

customHeight: "large"
headerDarkened: true

color: "brown"

bgColor: "#09162f"
bgColorLink: "#204208"

textColor: "#e6faff"
textColorLink: "#e5fb9e"

date: 2025-01-26

difficulty: "no-brainer"
genres: ["family", "thematic"]
categories: ["boardgame", "one-paper-game"]
tags: ["shared-map", "movement"]
themes: ["fantasy"]

multiplayermode: "competitive"
language: EN
playtime: 30
playercount: [2,3,4,5,6]
ages: everyone
devlog: "/blog/boardgames/the-mist/"

---

{{% boardgame-intro heading="" %}}

A [One Paper Game](/boardgames#one_paper_games) about exploring a world where each square is multiple things at once---until you step onto it.

{{% /boardgame-intro %}}

{{% section-centered heading="How to play?" %}}

[Generate](#board) a paper below. Or click the "Download" button and pick any _one_ PDF I already generated for you.

Print and play! 

The rules are so simple, they're on the paper itself. (If you still want a reference or more clarification, check the [rules](rules) page.)

{{% /section-centered %}}

{{% section-centered heading="Board" anchor="board" html="true" %}}

<p>Input your settings, press the button, and download the PDF with your unique world!</p>

{{< boardgame-settings type="board" local_storage="theMistConfig" >}}
	{{< setting-hidden id="setting-gameTitle" text="The Mist" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the board mostly grayscale." >}}
  {{< setting-checkbox id="setting-includeRules" text="Include Rules?" checked="checked" remark="Only disable this if you know all the rules by heart." >}}
  {{< setting-enum id="setting-boardSize" text="Board Size?" values="tiny,small,regular,big,huge" valaskey="true" def="regular" remark="Increases or decreases the number of squares on the board; not page size." >}}
  <h3>Which sets to include?</h3>
  {{< setting-checkbox id="setting-sets-base" text="Base Set?" checked="checked" >}}
  {{< setting-checkbox id="setting-sets-advanced" text="Advanced Set?" >}}
  {{< setting-checkbox id="setting-sets-expert" text="Expert Set?" >}}
{{< /boardgame-settings >}}

<p class="settings-remark"><strong>Not working?</strong> Don't worry! At the "download" button you can find loads of premade boards I already generated for you. (Also, send me an email about what isn't working.)</p>

{{% /section-centered %}}

{{< support >}}

{{% section-centered heading="Credits" %}}

The fonts used are **Adventure Script** (headings) and **Inika** (body). Both freely available. Some of the art was generated with AI. Everything else (code, assets, idea, etcetera) is entirely mine.

This is probably my game with the highest ratio of "rules" to "depth". 

The game is extremely simple! In fact, it is explained on the paper itself, and even that leaves more than enough room for anything else. 

Yet the core idea behind those rules allows a _lot_ of strategy, play styles, and therefore depth. Every turn is the same simple decision (between 4 icons), but every single decision matters a lot for every turn after it. And to make matters worse, other players are doing the same thing, all within a shared map.

While obviously not on the same level as Chess or Go, I do compare its general feel to those games.

I sometimes feel like those games aren't so much "designed" as that they are "found". This feels like a game that was always there, I just found it and hopefully executed it well enough :)

Want more details? Check out the [devlog](/blog/boardgames/the-mist).

{{% /section-centered %}}