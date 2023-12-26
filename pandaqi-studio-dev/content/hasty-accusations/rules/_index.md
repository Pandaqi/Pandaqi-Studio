---
type: "rules"
---

{{% rules-block id="setup" heading="Setup" icon="setup" icontint="purple" %}}

Pick which card set you want from the [website](https://pandaqi.com/hasty-accusations/). For your first games, just pick the base set. As you gain experience, consider introducing more and more advanced cards.

Decide the number of suspects to use. It's recommended to use at least 5 and more than the number of players.

Then,
* Place one row of **faceup** suspects on the table. (Below these cards, evidence piles will build during the game.)
* Place the **loupe token** above a suspect in the middle of the row.
* Shuffle the remaining suspects (that are in the game). Deal each player 1: this is their **secret suspect**. (Suspects that aren't dealt are discarded without looking.)
* Create a deck of **playing cards**, shuffle, and deal each player 4.
* Finally, create a row of 4 faceup cards next to the deck: **the market**.

Let's start!

@TODO: IMAGE EXAMPLE of this setup

{{% /rules-block %}}

{{% rules-block id="objective" heading="Objective" icon="objective" icontint="lightblue" %}}

The game ends when **only one player is left**. They win!

{{% /rules-block %}}

{{% rules-block id="action_play" heading="Gameplay" icon="action" class="force-page-break-before" icontint="purple" %}}

Most treacherous player starts. Take clockwise turns until done.

{{% rules-block heading="On your turn" %}}

Play as many cards from your hand as you want.

Each card is placed on the "evidence pile" below a suspect that is still alive. (Its tile is not turned facedown.)

* If you play a card **faceup** ( = open), you execute its action and move the loupe one step forward.
* If you play the card **facedown**, move the loupe one step backward.

If you play nothing, discard your whole hand, and the loupe moves forward one step.

Only move the loupe at the end of your turn, after playing all your cards and summing their movement. If there is no next step for the loupe, it **wraps around** to the other side. If this happened, execute a [review](#review) now!

@TODO: EXAMPLE IMAGE

{{% /rules-block %}}

{{% rules-block heading="Review" id="review" %}}

When a review triggers, whatever evidence pile has the **most cards** is evaluated. (If tied, the active player picks _one_ of them to evaluate.)

> **From top to bottom, reveal each card and execute what it does.** 

Evaluation has three simple rules:
* If an action must be executed by a player, this is always the _active player_.
* If the corresponding suspect is **murdered**, turn the suspect tile facedown and stop revealing cards immediately.
* If the murdered suspect belonged to a player, they must say so. They're eliminated and discard their hand.

Discard all cards from the evaluated evidence pile.

**Exception: the first round is safe.** The loupe just returns to the first suspect _without_ evaluating a pile. You can disable this rule on advanced sets (where murdering is harder) or if you don't want it.

Finally, all players fill up their hand. Starting with the active player, take clockwise turns drawing your hand **back up to the hand limit** (default = 4):
* Pick as many cards as needed from the market.
* Then refill the market from the deck, up to the current hand limit.

Next turn!

@TODO: EXAMPLE IMAGE

{{% /rules-block %}}

{{% rules-block id="cards" heading="Cards" %}}

Cards always have a power. As stated, this triggers when _revealed_. This happens when played faceup or when a pile is evaluated.

Some cards, however, show an icon in the top left.

* A @TODO: INLINE icon means their action **only** triggers during **review**!
* A @TODO: INLINE icon means their action does **not** trigger during **review**!

{{% /rules-block %}}

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

@TODO: The rules table with all suspects + their actions explained.
{{% /rules-block %}}

{{% rules-block heading="Big Hands Variant" %}}
Instead of drawing cards as you go, deal the _whole deck_ at the start (as fairly as possible; discard any leftovers). 

You can play at most 2 cards during a turn. (And don't refill during review as there is no market.)

If you have no cards at the start of your turn, your suspect is immediately reviewed. If they don't die, you receive their evidence pile as your new hand cards.
{{% /rules-block %}}

{{% rules-block heading="Speedy Variant" %}}
When a suspect is murdered, completely remove their tile from the row. This means the game speeds up (and simplifies) more and more as it progresses.
{{% /rules-block %}}

{{% /rules-block %}}