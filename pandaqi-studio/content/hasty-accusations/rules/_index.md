---
type: "rules"
---

## Setup

Pick which card set you want from the [website](https://pandaqi.com/hasty-accusations/). For your first games, just pick the base set. As you gain experience, consider introducing more and more advanced cards.

Decide the number of suspects to use. It's recommended to use at least 5 and more than the number of players.

{{< rules/rules-image-sidebar src="setup.webp" alt="Example setup for a 4-player game (with 5 suspects)." >}}

Then,
* Place one row of **faceup** suspects on the table.
* Place the **loupe token** above a suspect in the middle of the row.
* Create a deck of suspect cards (that are in the game). Shuffle and deal each player 1: this is their **secret suspect**.
* Create a deck of **playing cards**, shuffle, and deal each player 4.
* Finally, create a row of 4 faceup cards next to the deck: **the market**.

Let's start!



## Objective

The game ends when **only one player is left**. They win!


## Gameplay

Most treacherous player starts. Take clockwise turns until done.

### On Your Turn

Play as many cards from your hand as you want.

Each card is placed on the "evidence pile" below a suspect that is still alive. (Its tile is not turned facedown.)

* If you play a card **faceup** ( = open), you execute its action and move the loupe one step forward.
* If you play the card **facedown**, move the loupe one step backward.

If you play nothing, discard your whole hand, and the loupe moves forward one step.

Only move the loupe at the end of your turn, after playing all your cards and summing their movement. If there is no next step for the loupe, it **wraps around** to the other side. If this happened, execute a [review](#review) now!

{{% rules/rules-remark %}}
**Exception:** until all players have had at least 1 turn, no review happens yet.
{{% /rules/rules-remark %}}

{{< rules/rules-image src="gameplay.webp" alt="Two examples of turns. (One regular, one that makes the loupe wrap around = review.)" >}}


### Review

When a review triggers, whatever evidence pile has the **most cards** is evaluated. (If tied, the active player picks _one_ of them to evaluate.)

> **From top to bottom, reveal each card and execute what it does.** 

{{< rules/rules-image src="review.webp" alt="Example of a review phase and how to evaluate the largest pile. (And how murders take place!)" >}}

Evaluation has three simple rules:
* If an **action** must be executed by a player, this is always the _active player_.
* If the corresponding suspect is **murdered**, turn the suspect tile facedown and stop revealing cards immediately.
* If the murdered suspect **matches a player's secret suspect**, they must say so. They're eliminated and discard their hand.

Discard all cards from the evaluated evidence pile.

Finally, all players fill up their hand. Starting with the active player, take clockwise turns drawing your hand **back up to the hand limit** (default = 4):
* Pick as many cards as needed from the market.
* Then refill the market from the deck, up to the current hand limit.

Next turn!

## Cards

Cards always have a power. As stated, this triggers when _revealed_. This happens when played faceup or when a pile is evaluated during Review.

Some cards, however, show an icon in the top left.

* A <span data-rulebook-icon="only-review"></span> means their action **only** triggers during **review**! (Not when played faceup in regular play.)
* A <span data-rulebook-icon="only-play"></span> means their action does **not** trigger during **review**! (Only in regular play.)

See [All Cards](#cards_reference) if you want a reference that displays and explains all cards in the game.

## Upgrades

### Traitor Variant

When dealing out secret suspects, 
* Select random cards equal to the number of players.
* Swap one (at random) for the Traitor card.

This ensures one player is the _Traitor_!

The traitor wins if _everyone else loses_. In other words, 
* If only 1 suspect remains, they reveal themselves and **lose**.
* But if multiple suspects remain, yet all **other players are eliminated**, they reveal themselves and **win**.

### Suspect Powers

You probably noticed some icons on the suspects. We'll use those now!

* A <span data-rulebook-icon="skull"></span> power triggers when this suspect **dies**.
* A <span data-rulebook-icon="power-card"></span> power triggers when you **play a card** here.

It's recommended to have a balanced mix of death and play powers on your chosen suspects.

As usual, when the action gives a choice, the currently active player is the one to make it.

Below is a table explaining all the suspect's powers.

<div data-rulebook-table="powers"></div>

### Big Hands Variant

Instead of drawing cards as you go, deal the _whole deck_ at the start (as fairly as possible; discard any leftovers). 

You can play at most 2 cards during a turn. (And don't refill during review as there is no market.)

If you have no cards at the start of your turn, your suspect is immediately reviewed. If they don't die, you receive their evidence pile as your new hand cards.

### Speedy Variant

When a suspect is murdered, completely remove their tile from the row. This means the game speeds up (and simplifies) more and more as it progresses.

## All Cards

Below is an overview of _all_ cards in the game.

The **base** set contains ...

<div data-rulebook-table="base"></div>

The **advanced** set contains ...

<div data-rulebook-table="advanced"></div>

The **expert** set contains ...

<div data-rulebook-table="expert"></div>


