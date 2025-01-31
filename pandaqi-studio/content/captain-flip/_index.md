---
type: "gamepage"
boardgame: true

title: "Captain Flip"
headerTitle: "Remember the locations of the best tiles and flip them before anyone else."
blurb: "A mix between a memory game and strategy game, where flipping tiles gives you actions, and scoring the tiles you wanted is a challenge."
blurbShort: "Remember the locations of the best tiles and flip them before anyone else."

downloadLink: "https://drive.google.com/drive/folders/1XyTJDG_9tOtEwNdNxfAAKBFr6LHghwIX"

color: "turquoise"

date: 2025-02-26

difficulty: "kids-can-play"
categories: ["boardgame", "tile-game", "standard"]
genre: ["family"]
tags: ["logic", "memory"]
themes: ["sea", "animals", "monsters"]

multiplayermode: "competitive"
language: EN
playtime: 30
playercount: [2,3,4,5,6]
ages: everyone
devlog: "/blog/boardgames/captain-flip/"

---

{{% boardgame-intro /%}}

{{% boardgame-instructions %}}
This game is incredibly simple (just flip one tile and take its action) and well-suited for families and kids. This does require text on the tiles, however, which means players need some knowledge of the English language.

**DISCLAIMER:** There is another (quite successful and recent) boardgame called "Captain Flip" too. This is _not_ that game---the name similarity is a coincidence. I had finished development of my own game and page before it came out, otherwise I would have changed the name to literally anything else. Pretend this game has always been called "Memorybeard" or something. (I usually finish these games _far_ before publicly releasing them, so don't trust the release date.)
{{% /boardgame-instructions %}}

{{% boardgame-settings-container type="material" remarks="**What about expansions?** You can play all expansions and variants using the same minimalist base material!" %}}
    {{< boardgame-settings type="game" local_storage="captainFlipConfig" btn_label="Generate Material" game_title="Captain Flip" defaults="true" >}}
    {{< /boardgame-settings >}}
{{% /boardgame-settings-container %}}

{{% section-centered heading="Credits" anchor="credits" %}}

This game started its life as a simple idea: "could I create a game where your only action each turn is to _flip a tile_?" This felt like it should lead to a game that's very easy to learn but has lots of depth. It would combine a _memory game_ (which tiles are where, and what do they do?) and a _strategy game_ (flipping the right ones in the right way).

And that's how this game was made! I realized we needed different actions for _flipping faceup_ and _flipping facedown_. I invented some fun actions and slight rules tweaks to make it all balanced. Then I did a paper prototype that was too complicated, simplified it, and ended up with Captain Flip.

The fonts used are **Underlapped** (headings, short texts) and **Sofia Sans Condensed** (body, paragraphs). Both are freely available. The sea creatures were generated using image AI. Everything else (code, design, rules, drawings, etcetera) is entirely mine.

(Underlapped is what is called a "double font". Each letter is itself twice. Very neat, discovered that while researching fonts for this game, and it just fit the theme---of each tile having two possible actions or states---perfectly.)

{{% /section-centered %}}