---
type: "rules"
---

{{% rules-block id="setup" heading="Setup" icon="setup" icontint="purple" %}}

Each player picks one color and gets all tiles showing that sheep: their **Sheeple**. Take all unused Sheeple out of the deck. 

Shuffle the deck and deal each player 4 tiles. Finally, place a random tile (faceup) on the table. 

{{% /rules-block %}}

{{% rules-block id="objective" heading="Objective" icon="objective" icontint="lightblue" %}}

The game ends when all players are out of tiles. Highest score wins!

{{% /rules-block %}}

{{% rules-block id="action_play" heading="Gameplay" icon="action" class="force-page-break-before" icontint="purple" %}}

Take clockwise turns. On your turn, either PLAY or CHANGE.

@TODO: INTERACTIVE EXAMPLE? (Does that even make sense?)

{{% rules-block heading="Play" %}}

Play a tile from your hand, faceup to the table. 

* It must be next to an existing tile **or** on top of a _facedown_ tile.
* You can't play a Sheeple into a meadow that **already has another player's Sheeple**. 

{{% remark %}}
In other words, there can be no path between two different Sheeples with no fences in-between.
{{% /remark %}}

If you connect multiple meadows with your tile, a [conflict](#conflict) happens.

Finally, draw a tile from the deck.

@TODO: IMAGE EXAMPLE

{{% /rules-block %}}

{{% rules-block heading="Change" %}}

Discard a tile from your hand to **rotate** an existing tile.
* You may orient the tile however you like.
* You **can't** rotate a tile that has a double fence on any side.
* You **can't** take the change action anymore once a player has run out of tiles.

If this rotation connected two meadows with different Sheeple inside, a [conflict](#conflict) happens.

@TODO: IMAGE EXAMPLE

{{% remark %}}
Yes, this permanently reduces your hand size by 1.
{{% /remark %}}

{{% /rules-block %}}

{{% rules-block heading="Conflict" id="conflict" %}}

Count the size of each meadow on different sides of the tile. (Exclude the tile itself.)

The _biggest_ meadow wins. All Sheeple inside the losing meadow(s) are turned _facedown_.
* If tied, count the number of Sheeple: highest wins. 
* If still tied, you **cannot take this action**. (There can never be a single meadow claimed by multiple players.)

@TODO: IMAGE EXAMPLE

{{% /rules-block %}}

{{% /rules-block %}}

{{% rules-block id="scoring" heading="Scoring" icon="score" class="force-page-break-before" icontint="purple" %}}

Any of your sheep that are not **in an enclosed meadow** ( = fences on all sides), score nothing. Facedown tiles should be considered as "closed on all sides".

For every sheep that remains, add the score of its meadow.
* Each tile inside the meadow is +1 point.
* Each _neutral sheep_ inside the meadow is also +1 point.

@TODO: IMAGE EXAMPLE

{{% /rules-block %}}

{{% rules-block id="expansions" heading="Expansions" icon="expansion" class="force-page-break-before" icontint="purple" %}}

Once you've played the base game a few times, maybe you're ready for some expansions or variants!

{{% rules-block heading="Fuzzy Fences" %}}

This is a _variant_ you can play with the same material. It's slightly friendlier, as it allows **multiple people to claim meadows**.

The following rules change.

* You _can_ play a Sheeple in the same meadow as another, as long as they're not adjacent (with no fence in-between).
* When counting your final score, every Sheeple from another player (in your meadow) is **-2 points**
* If multiple meadows are connected, count **diversity first**. The meadow with the _highest_ number of different Sheeple wins. (If tied, count number of tiles, then number of sheeple.)

{{% remark %}}
As usual, all losing Sheeple are turned facedown, even if they belong to the winner(s) too.
{{% /remark %}}

{{% /rules-block %}}

{{% rules-block heading="Wool Wolves" %}}

This expansion adds the **wolf** tile. (@TODO: And special actions on tiles?)

@TODO

{{% /rules-block %}}

{{% /rules-block %}}