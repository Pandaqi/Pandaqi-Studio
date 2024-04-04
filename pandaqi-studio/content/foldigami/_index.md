---
type: "single"

gamepage: true
boardgame: true

title: "Foldigami"
headerTitle: "A game of wits using only a single paper and nothing else"
blurb: "A game of wits using only a single paper. Even the rules are on the paper itself, and play happens through folding and rotating."

headerThumb: "foldigami_header"

customHeight: "small"
headerDarkened: true

color: "green"

bgColor: "#083d08"
bgColorLink: "#9ce4eb"

textColor: "#cdfff9"
textColorLink: "#083d42"

date: 2023-11-21

categories: ["boardgame"]
tags: ["one_paper_game", "opg"]

extraCSS: true
extraJSBoard: true
extraJSBoardInclude: true

downloadLink: "https://drive.google.com/drive/folders/17jgCO-P1M1Fqa0T7NKt8nfJxslF2TDMB"

multiplayermode: "competitive"
language: EN
genre: ["opg", "folding", "creative", "tactical"]
playtime: 20
playercount: [2]
complexity: low
ages: everyone
devlog: "/blog/boardgames/foldigami/"

---


{{% boardgame-intro heading="" %}}

A game as tough as chess, played using only a paper and nothing else.

{{% /boardgame-intro %}}

<div class="divider-image">
  <img src="assets/page/banner_divider.webp">
</div>

{{% section-centered heading="What do I need?" icon="page/icon_intro.webp" %}}

Generate a paper below. Print and play!

Or click the "Download" button to print one of the PDFs I already generated for you.

{{% /section-centered %}}

<div class="divider-image">
  <img src="assets/page/banner_divider.webp">
</div>

{{% section-centered heading="Board" html="true" anchor="board" icon="page/icon_board.webp" %}}

<p>Input your desired settings and click "generate".</p>

<p>The boards are designed to print and play immediately. If your printer adds margins ( = white space) around the board, and you don't know how to turn that off, you'll have to <em>cut off</em> those margins before playing. (All squares must be, well, exactly square to allow folding nicely.)</p>

  {{< boardgame-settings type="board" local_storage="foldigamiConfig" >}}
    {{< setting-hidden id="setting-gameTitle" text="Foldigami" >}}
    {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly white / grayscale to conserve ink." >}}
    {{< setting-checkbox id="setting-includeRules" text="Include Rules?" remark="Only turn off if you're familiar with all the rules." checked="checked" >}}
    {{< setting-enum id="setting-difficulty" text="Difficulty?" values="Easy,Medium,Hard" valaskey="true" def="Easy" remark="Higher difficulties fill more of the board and use more complicated powerups." >}}
    {{< setting-checkbox id="setting-noRotation" text="Rotate icons identically?" remark="Normally, icons rotate towards the player to whom they belong." >}}
  {{< /boardgame-settings >}}

<p class="remark-under-settings"><strong>Not working?</strong> Don't worry! At the "Download" link, you can also find PDFs I already generated for you.</p> 

{{% /section-centered %}}

<div class="divider-image">
  <img src="assets/page/banner_divider.webp">
</div>

{{% section-centered heading="Clarifications" icon="page/icon_clarifications.webp" %}}

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

{{% /section-centered %}}

<div class="divider-image">
  <img src="assets/page/banner_divider.webp">
</div>

{{% section-centered heading="Credits" icon="page/icon_credits.webp" %}}

Fonts? **Jockey One** and **Figtree**, both freely available from Google Fonts.

Images? All assets are mine, but some used an AI (specifically, _Bing Image_) to get inspiration or a good starting point.

This game idea started as a wild thought: could I create a "true" One Paper Game? Something that doesn't even require a pencil or learning rules (beforehand)? Something I could just drop on a table somewhere, and anybody could pick it up and play?

Rather quickly, I realized how you could interact with a game without pencil or pieces: by folding and rotating the paper. This resulted in Foldigami, an easy but surprisingly tactical game. 

The algorithm tries to generate boards that are fair and evenly matched. This is, however, no certainty. **If you think a board is too unbalanced, simply generate another board.** (And send me a screenshot, so I can improve the algorithm.)

Fun fact: the five animals are actual names used by ancient Asian military to indicate different sections of the army. (_Green Dragon, Red Bird, White Tiger, Black Tortoise_ and _Great Bear_.)

Want more details? Check out the [devlog](/blog/boardgames/foldigami).

{{% /section-centered %}}

<div class="divider-image">
  <img src="assets/page/banner_divider.webp">
</div>

