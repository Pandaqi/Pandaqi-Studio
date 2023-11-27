---
type: "rules"
---

{{% rules-block id="setup" heading="Setup" icon="setup" icontint="purple" %}}

Each player picks one color and gets all 5 tiles showing that sheep: their **Sheeple**. Take all unused Sheeple out of the deck. 

Shuffle the deck and deal each player 3 tiles. (Each player should hold 8 tiles in total.) 

Finally, place a random tile (faceup) on the table. 

{{% /rules-block %}}

{{% rules-block id="objective" heading="Objective" icon="objective" icontint="lightblue" %}}

The game ends when all players are out of tiles. Highest score wins!

{{% /rules-block %}}

{{% rules-block id="action_play" heading="Gameplay" icon="action" class="force-page-break-before" icontint="purple" %}}

Take clockwise turns. On your turn, either PLAY or CHANGE, then draw 1 tile from the deck.

{{% rules-block heading="Play" %}}

Play a tile from your hand, faceup to the table. 

* It must be next to an existing tile **or** on top of a _facedown_ tile.
* You can't play a Sheeple into a meadow that **already has another player's Sheeple**. 
* The maximum board size is 8x8.

{{% remark %}}
In other words, there can be no path between two different Sheeples with no fences in-between.
{{% /remark %}}

If you connect multiple meadows with your tile, a [conflict](#conflict) happens.

@TODO: IMAGE EXAMPLE

{{% /rules-block %}}

{{% rules-block heading="Change" %}}

Discard **2 tiles** from your hand to **rotate** an existing tile.
* You may orient the tile however you like.
* You **can't** rotate a tile that has a double fence on any side.
* You **can't** take the change action anymore once any player has run out of tiles.

If this rotation connected two meadows with different Sheeple inside, a [conflict](#conflict) happens.

@TODO: IMAGE EXAMPLE

{{% remark %}}
Yes, this permanently reduces your hand size by 1.
{{% /remark %}}

{{% /rules-block %}}

{{% rules-block heading="Conflict" id="conflict" %}}

Count the size of each meadow on different sides of the tile. Exclude the tile that caused the conflict itself.

The _biggest_ meadow wins. All Sheeple inside the losing meadow(s) are turned _facedown_.
* If tied, count the number of Sheeple: highest wins. 
* If still tied, you **cannot take this action**. 

There can never be a single meadow claimed by multiple players. If the tile that caused the conflict contains a Sheeple of the wrong color, it's also turned facedown.

@TODO: IMAGE EXAMPLE

{{% /rules-block %}}

{{% /rules-block %}}

{{% rules-block id="scoring" heading="Scoring" icon="score" class="force-page-break-before" icontint="purple" %}}

You score for each **enclosed meadow** ( = fences on all sides) that contains a **Sheeple of yours**. 
Facedown tiles should be considered as "closed on all sides". 

* Each tile inside the meadow is +1 point.
* Each _neutral sheep_ inside the meadow is also +1 point.

So yes, you score each meadow only once, regardless of the number of Sheeple you have.

@TODO: IMAGE EXAMPLE

{{% /rules-block %}}

{{% rules-block id="expansions" heading="Expansions" icon="expansion" class="force-page-break-before" icontint="purple" %}}

Once you've played the base game a few times, maybe you're ready for some expansions or variants!

In these rules, the term "adjacent" always means horizontal or vertical, never diagonal.

{{% rules-block heading="Fuzzy Fences" %}}

This is a _variant_ you can play with the same material. It's much friendlier, as it allows bigger scores and multiple people to claim meadows.

The following rules change.

**SCORING**: When counting your final score,
* You score _every Sheeple_ inside an enclosed meadow. (So now you can score meadows multiple times!)
* Every Sheeple from another player (in your meadow), however, is **-2 points**

**PLACING & CONFLICT**:
* There is no maximum board size.
* You _can_ play a Sheeple in the same meadow as another. Conflict only happens when two meadows, which were previously separate, are connected.
* If so, count **diversity first**. The meadow with the _highest_ number of different Sheeple wins. (If tied, apply the usual rules: number of tiles, number of sheeple, otherwise conflict is forbidden.)

{{% remark %}}
As usual, all losing Sheeple are turned facedown, even if they belong to the winner(s) too.
{{% /remark %}}

**CHANGING:** The **change** action also allows **moving** an existing tile (instead of rotating). Do so according to the following rules.
* You can only move tiles that contain neutral sheep.
* They move one step, to an adjacent tile.
* They _cannot_ move over a double fence.

@TODO: IMAGE EXAMPLE

{{% /rules-block %}}

{{% rules-block heading="Personal Piles" %}}

This is a _variant_ you can play with the same material.

During **setup**, equally distribute _all tiles_ over facedown piles. Each player receives one such pile. They insert their own Sheeple into it and shuffle.

During **gameplay**, you only draw tiles from _your own deck_. Your hand limit is 6.

Optional: for a game with less conflict (but more tension and luck), include _fewer_ Sheeple per player.

{{% /rules-block %}}

{{% rules-block heading="Wool Wolves" %}}

This expansion adds four special tiles with their own rules. 

**Wolf:** When placed, you may _move_ all adjacent tiles that have a sheep. Move them one step, to a tile that's adjacent to them. (Yes, this may overlap existing tiles, even faceup ones.) Adjacent tiles without a sheep are turned facedown.

**Tree:** When placed, you have a choice. Either rotate two tiles for free, or draw a tile (permanently increasing your hand size by 1).

**Pond:** All adjacent tiles with a sheep score +2 points. If there are _no_ adjacent tiles with sheep, you may take one Sheeple of yours back into your hand.

**House:** This tile and all adjacent tiles (horizontal and vertical) cannot be rotated.

@TODO: IMAGE EXAMPLE

Due to the extra tiles, the maximum board size is raised to 10x10.

{{% /rules-block %}}

{{% /rules-block %}}