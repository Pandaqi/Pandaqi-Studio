---
type: "gamepage"
boardgame: true

title: "Magnetmen"
headerTitle: "Score the most points before everyone repels you"
blurb: "The Magnetmen are magical robots, scoring points left and right. The only issue? The more you use them, the more spaces from which you're repelled."
blurbShort: "A [One Paper Game](/boardgames#one_paper_games) about scoring points before the Magnetmen repel you from the entire board!"

extraJSBoardInclude: true
downloadLink: "https://drive.google.com/drive/folders/1IWl4VH_Ai7e6BQM6PE4dY3YUfkDn2zQj" # already updated!

color: "blue"

date: 2025-01-26

difficulty: "no-brainer"
genres: ["family"]
categories: ["boardgame", "one-paper-game"]
tags: ["set-collection", "shared-map", "high-score"]
themes: ["science-fiction"]

multiplayermode: "competitive"
language: EN
playtime: 20
playercount: [2,3,4]
ages: everyone
devlog: "/blog/boardgames/magnetmen/"

---

{{% boardgame-intro /%}}

{{% boardgame-instructions ruleless="true" /%}}

{{% boardgame-settings-container type="board" %}}

{{< boardgame-settings type="board" local_storage="magnetmenConfig" game_title="Magnetmen" defaults="true" >}}
  {{< setting-checkbox id="setting-includeRules" text="Include Rules?" checked="checked" remark="Only disable if you've printed the rulebook or know them by heart." >}}
  {{< setting-enum id="setting-boardSize" text="Board Size?" values="small,regular,big,huge" valaskey="true" def="regular" remark="Increases or decreases the number of icons on the board; not page size." >}}
  {{< boardgame-settings-section heading="Which Magnetmen to include?" >}}
      {{< setting-checkbox id="setting-sets-base" text="Base Set?" checked="checked" >}}
    {{< setting-checkbox id="setting-sets-advanced" text="Advanced Set?" >}}
    {{< setting-checkbox id="setting-sets-expert" text="Expert Set?" >}}
  {{< /boardgame-settings-section >}}
{{< /boardgame-settings >}}

{{% /boardgame-settings-container %}}

{{< support >}}

{{% section-centered heading="Credits" %}}

The fonts used are **Vina Sans** (headings) and **Urbanist** (body). Both freely available from Google Fonts. 

The Magnetmen were generated using DALL-E 3 image AI. If there's one thing those AIs can consistently do, it's combine physical resources (such as metal or wood) into coherent images of characters or poses! Everything else (assets, icons, rules, code, etcetera) is mine.

This game is the result of my never-ending search for games that are absolutely as simple and accessible as possible. 

I asked myself: "could I make a One Paper Game where every turn is the same simple action? _Cross out one square_?"

I sought ways to get a fun and challenging game, while the rules are so simple they can be taught in 30 seconds. A game you can print a few times, take with you wherever you go, and play wherever you are.

Magnetmen was the first attempt. (Some other OPG games with that same idea are coming soon.)

To be honest, this game is so small and simple that I pretty casually worked on it in between much larger projects. The game was done within a few days. It almost feels like it just dropped into my lap. And yet, it works _great_, even better than I could've hoped for.

{{% /section-centered %}}