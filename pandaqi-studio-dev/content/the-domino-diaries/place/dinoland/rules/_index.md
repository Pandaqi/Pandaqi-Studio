---
type: "rules"
---

{{% rules-block heading="Setup" icon="setup" %}}

Create the **Asteroid Deck:** pick 20 random asteroid tiles, shuffle, and place faceup on the table.

Create a **Domino Deck:** grab all Domino tiles, shuffle, and place facedown on the table.

Deal every player a hand of **4 dominoes**. Each player also picks a **color** and receives all pawns of that type.

Finally, prepare the map.
* Place a random domino in the center of the table.
* Place one **Asteroid Crosshairs** tile to its left, and one above it.

{{% /rules-block %}}

{{% rules-block heading="Objective" icon="objective" %}}

The game ends when the **Asteroid Deck runs out**. Calculate the [impact of the asteroid](#asteroid), then calculate the [final scores](#scoring).

If playing **cooperative**, higher is better. If playing **competitive**, highest score wins.

{{% /rules-block %}}

{{% rules-block heading="Gameplay" icon="action" %}}

From start player, take clockwise turns until done.

On your turn, simply **play a domino from your hand** (and then refill your hand). You _may_ also **claim**: place a pawn on any unclaimed domino.

Only two restrictions apply: the domino must be adjacent to the current map and can't overlap anything.

If needed, simply move the Asteroid Crosshairs backward to make space for the growing map.

@TODO: IMAGE EXAMPLE

Dominoes can show one or more icons.

* **Asteroid:** discard the top card of the Asteroid Deck.
* **Arrow:** move the Asteroid Crosshairs in the direction indicated (from your perspective). Yes, this depends on the orientation you choose for your tile!

@TODO: Put all actions on the DINOSAUR types instead?? Would allow giving players a handy overview, would give a reason (in base game) for differentiating them, simplify rules, etcetera

@TODO: IMAGE EXAMPLE?

There is one special type of asteroid tile: the **Egg Hatcher**. When revealed, 

* Find all claimed eggs. (The domino shows an egg and has a player pawn on it.)
* For each one, its owner must now hatch the egg.
* This means they place a domino from their hand _on top_ of the egg, which must show a dinosaur in the spot where the egg previously was.
* If this is impossible, nothing happens.

@TODO: IMAGE EXAMPLE

{{% /rules-block %}}

{{% rules-block id="scoring" heading="Scoring" icon="score" %}}

Let's define an **Area** as the largest possible group of connected tiles with the same terrain.

> Each Area scores its **size** (number of rectangles inside it) multiplied by the number of **dinosaurs** inside.

When playing cooperatively, this is obviously a single score for the entire group.

When playing competitively, each player has an individual score. In that case, you only score areas where you have a presence ( = one of your pawns is inside that area).

@TODO: IMAGE EXAMPLE

{{% /rules-block %}}

{{% rules-block id="asteroid" heading="Asteroid Impact" icon="action" %}}

When the Asteroid Deck runs out, the asteroid crashes into your map.

* It hits the location where both its crosshairs meet.
* That square and all neighboring squares (a 3x3 radius around it) are "destroyed".
* If a square is destroyed, its entire **Area** (see [scoring](#scoring)) must be ignored when scoring.

@TODO: IMAGE EXAMPLE

{{% /rules-block %}}

{{% rules-block heading="Variants & Expansions" icon="expansion" %}}

VARIANT: Change the number of cards in the Asteroid Deck for a longer/shorter game.

EXPANSION: More dominoes, which add these icons (+ one more terrain type?)
* **Eye**: look at the next 5 Asteroid Tiles.
* **Hand**: replace your entire hand with new ones from deck.


{{% /rules-block %}}

