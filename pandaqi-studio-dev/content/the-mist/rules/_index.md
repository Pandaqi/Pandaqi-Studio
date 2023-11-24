---
type: "rules"
---

{{% rules-block id="setup" heading="Setup" icon="setup" icontint="pink" %}}

Print a paper and grab some pens. Pick any start player.

Each player invents their own unique symbol, and draws it in any square at the _edge_ of the board. (You can't start at the same location as somebody else.)

@TODO: IMAGE EXAMPLE (inventing a symbol, where the entrances are, etcetera)

{{% remark %}}
Material can be downloaded from [the website](https://pandaqi.com/the-mist).
{{% /remark %}}

{{% /rules-block %}}

{{% rules-block id="objective" heading="Objective" icon="objective" icontint="blue" %}}

The game ends as soon as **nobody can move anymore**. Each player checks the entire path that they walked. Sum the values of all squares: **highest score wins**!

{{% /rules-block %}}

{{% rules-block id="gameplay" heading="Gameplay" icon="action" class="force-page-break-before" icontint="lightblue" %}}

Take clockwise turns. On your turn, always do the same thing: **take one step**. 

* On your current location, pick _one_ of its 4 icons to be the correct one. (Clearly cross out all the others.)
* Then move from your current location to an adjacent, unvisited location. Draw your player icon in the circle of the new tile.

You can always remember where you are now by finding the square that has your player icon, but also still shows all its icons.

@TODO: IMAGE EXAMPLE

That's it!

The paper itself explains how each Square works and/or how it scores. You can also read the next section on the [Squares](#squares).

{{% /rules-block %}}

{{% rules-block id="squares" heading="Squares" class="force-page-break-before" icon="expansion" icontint="yellow" %}}

When squares talk about some type being "visible", it means exactly what you think. It doesn't matter whether the square is visited or not, as long as the icon _is showing_ (not crossed out), it's on the board.

When squares talk about "destroying", it means crossing out **all** its icons. (So it represents nothing.) If a player is currently there, they don't die. Just leave them be---you can't die in this game.

Below is an overview of _all_ squares in the game.

@TODO: Dynamically load table from dict.ts

{{% /rules-block %}}
