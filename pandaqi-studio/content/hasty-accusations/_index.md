---
type: "gamepage"
boardgame: true

title: "Hasty Accusations"
headerTitle: "Ensure your character survives the murder investigation, but do it in secret"
blurb: "Everybody is investigating the same murder and pointing fingers every which way. Secret fingers. With secret actions. And you don't want too many targeting your hidden role."
blurbShort: "Ensure your character survives the murder investigation, but do it in secret."

downloadLink: "https://drive.google.com/drive/folders/1rpuM28gjwNK5-sSxLlJj0HYrXq8mgZkr" # already updated!


color: "black"


date: 2025-01-12

difficulty: "simple"
genres: ["thematic"]
categories: ["boardgame", "card-game"]
tags: ["hidden-roles", "detective", "fixed-order", "player-elimination"]

multiplayermode: "competitive"
language: EN
playtime: 30
playercount: [2,3,4,5,6,7]
ages: everyone
devlog: "/blog/boardgames/hasty-accusations/"

---

{{% boardgame-intro /%}}

{{% boardgame-instructions /%}}

{{% boardgame-settings-container type="material" %}}

{{< boardgame-settings type="game" local_storage="hastyAccusationsConfig" btn_label="Generate Material" game_title="Hasty Accusations" defaults="true" >}}
  {{< setting-checkbox id="setting-includeCards" text="Include Cards?" checked="checked" remark="Generates the action cards with which you play." >}}
  {{< setting-checkbox id="setting-includeCharacters" text="Include Characters?" checked="checked" remark="Generates material for all possible suspects." >}}
  {{< setting-enum id="setting-cardSet" text="Which set?" values="Base Game,Advanced Detective,Expert Investigator" keys="base,advanced,expert" def="base" >}}
{{< /boardgame-settings >}}

{{% /boardgame-settings-container %}}

{{% section-centered heading="Credits & Remarks" anchor="credits" %}}

Because this game went through so many iterations, the "lore" behind the theme has become quite comedic. You're basically terrible detectives who keep accusing potential suspects way too early, which puts them in danger and ends up getting them killed. But you're _just_ capable enough that you try to protect one specific suspect until the end. That's the only way I can thematically explain the mechanics and flow of this game. 

Anyway, the fonts used are **Dragging Canoe** (headers, short fancy text) and **Libre Caslon (Text)** (body, long readable paragraphs). Both freely available. Some of the assets were generated with AI, some entirely designed by me (because it was faster than having the AI create something usable). Everything else is entirely mine.

This game idea basically popped into my head as I went to bed one night. A game where you were secretly placing murder or protection cards before suspects, trying to make _your_ suspect survive when the review phase game. I basically drew the table layout and rules sketch in my notebook (always beside my bed!) then and there.

Of course, actually creating and testing the game changed it in so many ways that only the _core_ mechanics remains in the final version: play cards to suspects, move the loupe, review the biggest suspect when the loupe resets. 

(I call it a "loupe" because "magnifying glass" was just too long to put on the cards and in the rulebook. This synonym is quite common in my own language, but I've learned most English speakers wouldn't use it often.)

But, as always, all those changes made the game much better.

{{% /section-centered %}}

{{< support >}}
