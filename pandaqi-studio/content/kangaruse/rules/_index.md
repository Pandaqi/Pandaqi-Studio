---
type: "rules"
---

## Setup

{{< rules/rules-image src="setup.webp" alt="Example of a game board + possible player icons + starting positions." class="float-right" >}}

Grab a new paper. It should show a grid.

* All squares on one axis show the same **number** command (1-4).
* All squares on the other axis show a **direction** command (left, right, up, down).

Everybody invents a simple, unique icon they draw in their starting position. If you enabled "starting positions", these are given. Otherwise, choose any square that doesn't score points.


## Objective

The game ends when **nobody can jump anymore**. (You can also simply "give up" if your position is hopeless or stop the game once all scoring squares have been used.)

Count your score (at the end, by checking all squares you visited). The player with the **most points** wins.


## Gameplay

{{< rules/rules-example id="turn" >}}

The best jumper starts, then take clockwise turns until done.

On your turn, **jump**.

* Either **pick any number** (1-4), but follow your squares's direction command.
* Or **pick any direction** (up, right, down, left), but follow your square's number command.

Jump the chosen number of spaces in the chosen direction.

* Draw your icon in the new square.
* Cross out the square from which you came.

{{< rules/rules-image src="gameplay.webp" alt="Example of picking and executing your jump." >}}

Your target square must be **unused**: not crossed out and not occupied. 

If you have no valid move, you _may_ teleport to an unused non-scoring square by **paying 10 points**. If you can't or won't, you get no more turns.

{{% rules/rules-remark %}}
You can't land on or jump over **trees**. **Rivers** simply do nothing.
{{% /rules/rules-remark %}}

Finally, check the special action of your new square. That's it!



## Special Types

Below is a list of all types in the game and their explanation. It's recommended to simply enable "include rules" when generating a board, so you never need to read any of this!

<div data-rulebook-table="types"></div>

Extra clarifications.

* **Crocodile**: this doesn't happen retroactively. Only when somebody _lands_ on a scoring square, and there's currently a crocodile in that row/column, they score nothing. If you track score afterwards (not while playing), cross out the icon (or write "CROC" over it) to remember this.
* **Dingo**: if you can't obey both commands, you simply jump as normal. You're not out of the game.
* **Destroying**: when you "destroy" other squares, it simply means crossing them out (so they can't be visited anymore). Any points scored from that square still count and players currently there don't "die". 

{{% rules/rules-remark %}}
I tested a variant where destroying meant people also lost the score for it, but that was way too harsh and could lead to everybody scoring negative points ;) Use this variation at your own peril.
{{% /rules/rules-remark %}}

