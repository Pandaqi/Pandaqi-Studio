---
type: "project"

title: "Foldigami"
blurb: "A game of wits using only a single paper. Even the rules are on the paper itself, and play happens through folding and rotating."
# blurb: "A game as tough as chess, played using only a paper and nothing else."
blurbProject: "Score more points than your opponent by _folding_ and _flipping_ the paper."

date: 2023-11-21

difficulty: "no-brainer"
genres: ["action", "family", "kids-game"]
categories: ["board-game", "one-paper-game"]
tags: ["folding", "turn-based", "experimental", "creative", "fast-paced"]
themes: ["origami", "history"]

downloadLink: "https://drive.google.com/drive/folders/17jgCO-P1M1Fqa0T7NKt8nfJxslF2TDMB"

multiplayermode: "competitive"
language: EN
playtime: 20
playercount: [2]
ages: everyone
devlog: "/blog/boardgames/waitless-games/foldigami/"
---

## What Do I Need?

Generate a paper below. Print and play!

Or click the "Download" button to print one of the PDFs I already generated for you.

## Board

Input your desired settings and click "generate".

The boards are designed to print and play immediately. If your printer adds margins ( = white space) around the board, and you don't know how to turn that off, you'll have to _cut off_ those margins before playing. (All squares must be, well, exactly square to allow folding nicely.)

{{< boardgame-settings type="board" local_storage="foldigamiConfig" game_title="Foldigami" defaults="true" >}}
  {{< setting-checkbox id="setting-includeRules" text="Include Rules?" remark="Only turn off if you're familiar with all the rules." checked="checked" >}}
  {{< setting-enum id="setting-difficulty" text="Difficulty?" values="Easy,Medium,Hard" valaskey="true" def="Easy" remark="Higher difficulties fill more of the board and use more complicated powerups." >}}
  {{< setting-checkbox id="setting-noRotation" text="Rotate icons identically?" remark="Normally, icons rotate towards the player to whom they belong." >}}
{{< /boardgame-settings >}}

<p class="remark-under-settings"><strong>Not working?</strong> Don't worry! At the "Download" link, you can also find PDFs I already generated for you.</p> 

## Clarifications

The rules for the game are explained _on the paper itself_. Nothing to read beforehand! Nothing to remember!

Below, however, is a list of clarifications in case you're uncertain.

### Setup

* The team with the _fewest_ points (at the start) is usually the best team to start. It often, however, doesn't matter.
* The game assumes the two players sit opposite each other. (As the placement of team icons reinforces.)
* You can replay the same paper 5--10 times, as long as the first move is different.

### Folding

* Yes, you can also fold to the _backside_ of the paper.
* Yes, the dotted lines are also valid targets for a fold. (They're merely dotted so they don't make the board unclear.)
* Yes, "blank square" means any square with no icon. Thus, _also_ squares from the _backside_ of the paper.
* No, it's not allowed to (exactly) "undo" the previous fold.
* No, if a fold is physically impossible to do (because another piece of the paper already overlaps it), you can't do it.

## Credits

Fonts? **Jockey One** and **Figtree**, both freely available from Google Fonts.

Images? All assets are mine, but some used an AI (specifically, _Bing Image_) to get inspiration or a good starting point.

This game idea started as a wild thought: could I create a "true" One Paper Game? Something that doesn't even require a pencil or learning rules (beforehand)? Something I could just drop on a table somewhere, and anybody could pick it up and play?

Rather quickly, I realized how you could interact with a game without pencil or pieces: by folding and rotating the paper. This resulted in Foldigami, an easy but surprisingly tactical game. 

The algorithm tries to generate boards that are fair and evenly matched. This is, however, no certainty. **If you think a board is too unbalanced, simply generate another board.** (And send me a screenshot, so I can improve the algorithm.)

Fun fact: the five animals are actual names used by ancient Asian military to indicate different sections of the army. (_Green Dragon, Red Bird, White Tiger, Black Tortoise_ and _Great Bear_.)

Want more details? Check out the [devlog](/blog/boardgames/waitless-games/foldigami/).