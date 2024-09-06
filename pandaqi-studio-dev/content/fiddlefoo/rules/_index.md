---
type: "rules"
---

{{% rules-block id="setup" heading="Setup" icon="setup" %}}

{{% rules-double-view src="setup.webp" split="leftheavy" %}}

Place 1 random card of each color in a 2x2 square on the table. This is the start of the (shared) **Map**.

Create a deck from all remaining cards.
* Deal each player **8 cards** (to take into their hand).
* Place the rest as a facedown draw pile to the side.

{{% /rules-double-view %}}

{{% /rules-block %}}

{{% rules-block id="objective" heading="Objective" icon="objective" %}}

The game ends when a player is **out of cards**. The number of **music notes** left in your hand represent your _negative points_.

It's recommended to play a few games in a row, keeping track of score. The player with the best score at the end ( = _least_ negative score) wins!

{{% /rules-block %}}

{{% rules-block id="action_play" heading="Gameplay" icon="action" %}}

{{< rules-example id="turn" >}}

From start player, take clockwise turns until done.

On your turn, **add 1 hand card to the Map**.

* The card has to be in the **same row** (horizontal or vertical) as another card of the same _color_.
* The card **can't be adjacent** to a card of the same _color_.

{{% remark %}}
In the rare case you can't play any card on your turn, draw 1 card from the deck.
{{% /remark %}}

By doing so, you'll have created a "Pair": your new card and the older one of the same color.

There are two important properties of such a Pair.

* Its **range**: all the numbers between its _lowest_ number and its _highest_ number. (For example, a 2-6 Pair has a range that includes 3, 4, and 5.)
* Its **distance**: how many spaces are in-between the two cards on the map.

{{% remark %}}
If you created multiple pairs, pick the one with the **largest range**. No, distance doesn't matter.
{{% /remark %}}

{{< rules-image src="gameplay_pair.webp" alt="Example of valid card placement and the pair you create from it." >}}

Now all the other players _may_ **throw hand cards at you** that match one of the following criteria. They do so while yelling "Fiddlefoo, a penalty card for you!" ;)

* Either that card is the same _color_ and its number is inside the _range_.
* Or the _number of music notes_ on that card is equal to the _distance_. If they choose this option, they may only give you 1 card this turn.

If the **distance** you created is larger than 3, however, you do a "Safe Song"! Nobody may throw anything at you, but you must draw 1 card from the deck.

Take all cards received into your hand.

If you end your turn without any cards, the game ends (and you win). Have fun!

{{< rules-image src="gameplay_penalty.webp" alt="Example of penalty cards others may throw at you for making a certain pair." >}}

{{% /rules-block %}}

{{% rules-block id="expansions" heading="Expansions & Variants" icon="expansion" %}}

{{% rules-block heading="Variant: Wildcard" %}}

You might've noticed that the Purple color is a bit special. (It has fewer cards / numbers.)

If you play this Variant, the Purple color **becomes a wildcard!** It is any color you want. 

In practice, this means the following.

* If a wildcard number is inside the range somebody created, you can always throw it to them. (Even if their Pair used a different color.)
* If someone creates a Pair using wildcards, then you can throw _any_ card at them that has a number within its range.

{{% /rules-block %}}

{{% rules-block heading="Variant: Cooperative" %}}

This Variant allows you to play the game _cooperatively_. (Everyone wins/loses together.)

What changes?
* During the game, you keep track of a single faceup pile of cards for each color, next to the board.
* Instead of throwing a card at another player, you may also decide to _add_ it to such a pile. You may only do so, however, if your number is higher than the current number at the top of the pile.
* The game ends when _all_ players have emptied their hand except one. You **win** if every faceup pile (next to the board) contains exactly 10 music notes.

{{< rules-image src="variant_cooperative.webp" alt="Example of how to setup and play the cooperative variant (with slight modifications to base game)." >}}

{{% /rules-block %}}

{{% rules-block heading="Expansion: Talkytoot" %}}

{{% rules-double-view src="setup.webp" split="leftheavy" %}}

This expansion adds extra material: cards that also contain _special actions_. 

Such actions can trigger ...
* **When paired** (they are part of a Pair created this turn)
* **When thrown** (at another player)
* **When drawn** (from the deck)
* or **When Scored** (at the end of the game)

They usually allow you to do something you _really want to do_ but can't following the regular rules. Less likely, they are penalties or restrictions to obey.

It's recommended to include just _some_ of them---perhaps the one you like the most!---as all of them at the same time is very overwhelming.

{{% /rules-double-view %}}

{{% /rules-block %}}

{{% /rules-block %}}