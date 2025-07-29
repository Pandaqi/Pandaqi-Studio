---
type: "project"

title: "One Pizza the Puzzle"
blurb: "A One Paper Game for 2–8 players about running your own pizza business. A raging rivalry, however, makes it impossible to cross paths with other pizza couriers without causing huge problems ..."
# blurb: "A [One Paper Game](/boardgames#one-paper-games) for 2--8 players about running your own pizza business, but a raging rivalry forbids crossing paths with other pizza couriers."

date: 2020-10-25

difficulty: "kids-can-play"
genres: ["thematic"]
categories: ["board-game", "one-paper-game"]
tags: ["movement", "area-control", "take-that", "cooking", "resource-management", "turn-based"]
themes: ["food", "vector", "colorful"]

downloadLink: "https://drive.google.com/drive/folders/19oX1xwugq8ArnmKhe8kDO5fuZNPDTfKd"

multiplayermode: "competitive"
language: EN
playtime: 45
playercount: [2,3,4,5,6,7,8]
ages: everyone
devlog: "/blog/boardgames/one-pizza-the-puzzle/devlog-one-pizza-the-puzzle/"

media: [video/onepizza_explanation_gif]

---

{{% review-container class="limit-width" %}}
  {{< review stars="5" author="" >}}
  This game made me realize several things: I love food, I cannot draw straight lines, and I was born to be a ruthless pizza courier.
  {{< /review >}}

  {{< review stars="4" author="" >}}
  I suspect 50% of the players will not appreciate the cheesy pun in the title. As they say: tomatoes before swine.
  {{< /review >}}

  {{< review stars="5" author="" >}}
  A steaming hot game with delicious decisions, tasty competitiveness, topped with maze-like mechanics and a side dish of pizza parcour possibilities.
  {{< /review >}}
{{% /review-container %}}

## What's the idea?

### Objective

Be be the first to **earn 10 money**.

### Gameplay

Each player picks an empty building to start a shiny new pizza restaurant. You receive one _pizza courier_: a continuous line you'll draw on the board during the game.

Each turn, take one action for each courier: **Move**, **Eat** or **Reset**.

### Actions

**Move?** Pick one of the shapes printed on the board. Now extend the line of your courier with that shape.
* Passed an ingredient building? You get that ingredient!
* Passed a building with an order? You can deliver the pizza (if you have the ingredients) for money!

**Eat?** Devour your ingredient to execute a special power! Teleport through buildings, move other couriers in the _wrong_ direction, stuff like that.

**Reset?** Reset your courier back to base, for a severe penalty---useful when stuck.

## What do I need?

Grab and print any game board from the files. Or use the Generator to create a random new board.

Grab some friends and (differently-colored) pens. That's it!

**Concerned about ink?** Only page 1, 2 and 4 of the rulebook are relevant for the base game. There's also an option to create "ink friendly" boards.

**Tip for Teaching?** Explain the "Move" action---it's the core of the game. Explain the "Reset" action whenever someone gets stuck. Then place the ingredient list on the table, so everyone can look up their power when you "Eat" them, and immediately play! 

## Background

Interested how this works? Check out my devlogs at [Pandaqi Blog](/blog/boardgames/one-pizza-the-puzzle). 

Here are links to the specific first articles:
- [(Devlog) One Pizza](/blog/boardgames/one-pizza-the-puzzle/devlog-one-pizza-the-puzzle) => about the general process, issues I faced, how I solved them, changes and different versions of the game, explanations about what works (and doesn't work) for boardgames, ...
- [(Technical Devlog) One Pizza](/blog/boardgames/one-pizza-the-puzzle/tech-devlog-one-pizza-the-puzzle) => explains the algorithms and code behind randomly generating complex game boards, which are still balanced and fun to play at all times.)

## Credits

Fonts? **Leckerli One**, because it just looked like a font you'd find on a pizza box. And **Nunito**, the body font&mdash;minimal, readable, available in many different weights.

All visuals were drawn in **Affinity Designer** as vector art, the game board generated using **JavaScript** and **Phaser v3** game engine.