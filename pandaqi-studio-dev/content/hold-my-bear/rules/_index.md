---
type: "rules"
---

{{% rules-block id="setup" heading="Setup" icon="setup" icontint="pink" %}}

Draw a random card and place it face-up on the table. This is the "match" currently taking place. 

Deal the deck of cards until empty, as fairly as possible.

Pick a start player: whoever can (and wants to) take the first valid move.

@TODO: IMAGE EXAMPLE of SETUP? (Feels a bit pointless.)

{{% /rules-block %}}

{{% rules-block id="objective" heading="Objective" icon="objective" icontint="blue" %}}

You win if, at the **start of your turn**, the match on the table is **already yours**! (In other words, you played a match that nobody could trump for a whole round.)

{{% /rules-block %}}

{{% rules-block id="action_play" heading="Gameplay" icon="action" class="force-page-break-before" icontint="lightblue" %}}

Take clockwise turns until done. On your turn, do ONE of two things: **play a valid move** or **give away two cards**.

If you're out of cards (at the start of your turn), steal 5 cards from other players, in whatever way you want.

{{< rules-example id="turn" >}} @TODO: playful example

{{% rules-block id="gameplay_valid_move" heading="Valid Move" %}}

Cards have an animal ( = suit) and a number.

A "match" is simply the set of cards in the center of the table.

* The sport you're playing is determined by the **most occurring animal**. (In case of a tie, you play multiple sports at once!)
* How well you're doing is determined by the **sum of all numbers**.

To do a valid move, you must play a set of cards that ...

* **Changes the sport**. Provide another animal that occurs more often than the current majority animal. The total value may be anything.
* **Or** provides a **higher value** (in the same sport). Play cards with the same majority animal, but with a total value that's higher.

{{% remark %}}
Such a set may contain at most 5 cards.
{{% /remark %}}

Remove the previous match (cards) from the game. Ensure the new cards face you to remember you were the one who played them!

@TODO: IMAGE EXAMPLE

{{% /rules-block %}}

{{% rules-block id="gameplay_give_away" heading="Give Away" %}}

There are no restrictions to this (in the base game). Other players might strike deals, beg for a card, or claim they don't want your card. Or you don't allow any discussion and just decide yourself!

All that needs to happen, is that **two cards** move from your hand to that of **another player**. This happens _publicly_: all players should get a chance to see the details of the exchange.

{{% /rules-block %}}

{{% /rules-block %}}

{{% rules-block id="bears" heading="What's up with bears?" class="force-page-break-before" icon="expansion" icontint="purple" %}}

Bears are both a **trump** and a **wildcard**. What does that mean?

* You can **always** raise the match by simply playing more bears. (Example: 3 tigers can be trumped by 1 bear, as that is more than 0 bears.)
* If there's another majority animal in this match, all bears **become the same type** as that one. (Example: you play 2 tigers and 2 bears. Now there are 4 tigers on the table.)

Bears are, however, also a liability. 

* You **cannot win with a bear in your hand**. (If you do, you must reveal that you have a bear and continue playing.)
* You also cannot play non-bear cards that have the **same number as a bear** in your hand. (Not even if you play the bear as well in the same match!)

@TODO: IMAGE EXAMPLE

{{% /rules-block %}}