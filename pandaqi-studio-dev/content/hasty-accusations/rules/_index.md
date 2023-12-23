---
type: "rules"
---

{{% rules-block id="setup" heading="Setup" icon="setup" icontint="purple" %}}

Decide the number of suspects to use. It's recommended to use at least 5, and at least as many as the number of players.

Then,
* Place one row of **faceup** suspects on the table. (Below these cards, evidence piles will build during the game.)
* Place the **loupe token** above the first.
* Shuffle the remaining suspects (that are in the game). Deal each player 1: this is their **secret suspect**. (Suspects that aren't dealt are discarded without looking.)
* Create a deck of **playing cards**, shuffle, and deal each player 4.

@TODO: IMAGE EXAMPLE of this setup

{{% /rules-block %}}

{{% rules-block id="objective" heading="Objective" icon="objective" icontint="lightblue" %}}

The game ends when **only one player is left**. They win!

{{% /rules-block %}}

{{% rules-block id="action_play" heading="Gameplay" icon="action" class="force-page-break-before" icontint="purple" %}}

Most treacherous player starts. Take clockwise turns until done.

{{% rules-block heading="On your turn" %}}

Play a card from your hand **facedown** on a suspect's evidence pile, then draw back up to 4 cards.

{{% remark %}}
Can't play a card? Discard your whole hand and draw 4 new cards.
{{% /remark %}}

If you play a card at the current *loupe* suspect, play it **faceup** and execute its action.

Finally, move the loupe one suspect forward ( = to the right). If there is none, execute a [review](#review).

**Exception: the first round is safe.** No review triggers; the loupe just returns to the first suspect. You can disable this rule on advanced sets (where murdering is harder) or if you don't want it.

{{% /rules-block %}}

{{% rules-block heading="Review" id="review" %}}

When a review triggers, whatever evidence pile has the **most cards** is evaluated. (If tied, the active player picks _one_ of them to evaluate.)

> **From top to bottom, reveal each card and execute what it does.** 

If an action must be executed by a player, this is always the _active player_.

If the corresponding suspect is **murdered**, remove them, and end this phase immediately.

If this was a player's secret suspect, they must say so. They're eliminated and discard their hand.

Discard all cards from this evidence pile. Return the loupe to the first suspect. Next turn!

{{% /rules-block %}}

{{% /rules-block %}}

{{% rules-block id="cards" heading="Cards" icon="score" class="force-page-break-before" icontint="purple" %}}

Cards always have a power. As stated, this triggers when _revealed_. This happens when placed at the loupe pile (where you play faceup), or when a pile is evaluated.

Most cards can be played anywhere, but there are some exceptions.

* A @TODO:INLINE ICON means it MUST be played at the (current) loupe pile.
* A @TODO:INLINE ICON means it CAN'T be played at the (current) loupe pile.
* A @TODO:INLINE ICON means it MUST be played at one of your own suspects.
* A @TODO:INLINE ICON means it CAN'T be played at one of your own suspects.

@TODO: IMAGE of card skeleton.

On the website you can pick which card set you want. For your first games, just pick the base set. As you gain experience, consider introducing more and more advanced cards.

{{% /rules-block %}}

{{% rules-block id="expansion" heading="Variants & Expansions" icon="expansion" class="force-page-break-before" icontint="purple" %}}

{{% rules-block heading="Traitor Variant" %}}
When dealing out secret suspects, 
* Select random cards equal to the number of players.
* Swap one (at random) for the Traitor card.

This ensures one player is the _Traitor_!

The traitor wins if _everyone else loses_. In other words, 
* If only 1 suspect remains, they reveal themselves and **lose**.
* But if multiple suspects remain, yet all **other players are eliminated**, they reveal themselves and **win**.
{{% /rules-block %}}

{{% rules-block heading="Suspect Powers" %}}
You probably noticed some icons on the suspects. We'll use those now!

* A @TODO: INLINE ICON (skull?) power triggers when this suspect dies.
* A @TODO: INLINE ICON (card?) icon triggers when you play a card here.

It's recommended to have a balanced mix of death and play powers on your chosen suspects.

As usual, when the action gives a choice, the currently active player is the one to make it.
{{% /rules-block %}}

{{% rules-block heading="Big Hands Variant" %}}
Instead of drawing cards as you go, deal the _whole deck_ at the start (as fairly as possible). 

If you run out of cards, your suspect is immediately reviewed. If they don't die, you receive their evidence pile as your new hand cards.
{{% /rules-block %}}


{{% /rules-block %}}