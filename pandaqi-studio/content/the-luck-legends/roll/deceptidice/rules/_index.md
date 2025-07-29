---
type: "rules"
---

## Setup

Deal all players a random deck of **9 Cards**. Keep the remaining cards to the side as a facedown draw pile.

Playing with lots of players (6--8)? Start everyone with **6 Cards** instead.

Pick anyone to be the **start player** ("Liar").


## Objective

The game **ends** as soon as somebody has **only 3 cards left**. Rank players based on how many cards they have left; **more is better**.


## Gameplay

{{< rules/rules-example id="turn" >}}

Gameplay happens in simultaneous rounds.

First, all players divide their deck into **3 decks** ("3 dice") as fairly as possible, without looking. 

{{% rules/rules-remark %}}
Playing with few players (2--3)? Have each player create **4 decks** instead.
{{% /rules/rules-remark %}}

Then, everyone simultaneously rolls their dice. That is, shuffle every pile and secretly look at the card on top.

Starting from the Liar, in clockwise turns, players must now **guess** what's on the table. This includes _all_ dice, not just their own.

{{< rules/rules-image src="gameplay_dicebreak.webp" alt="Example of how to create dice, roll, and then formulate a guess about what's on the table." >}}

A guess has two required elements.

* NUMBER: You say _how many_ cards are in your combo.
* TARGET: You say a specific _number_ or _color_.

For example, a guess might be "2 cards with number 3" or "4 cards with color Red".

You _may_ add a third element to your guess, depending on the chosen TARGET.

* Target a _number_? Then you may say "**less than** TARGET". For example: "2 cards with a number _less than_ 3."
* Target a _color_? Then you may say "**without** TARGET". For example: "4 cards _without_ Red."

{{% rules/rules-remark %}}
For an introductory game with new players, you can leave out this third element completely.
{{% /rules/rules-remark %}}

Crucially, you must always **guess higher** than the previous player. This means your NUMBER---how many cards---must be higher. The other properties can be whatever you need.

{{< rules/rules-image src="gameplay_guess.webp" alt="Example of how to go higher and higher in guesses, or challenge and end the round with someone losing." >}}

If you don't want to do that, you **challenge** the previous guess and call their bluff.
* Reveal all the top cards of all the dice. Check if the previous guess was correct: _at least_ their guessed combo must appear on the table.
* If so, you were wrong and **you lose**. If not, then your challenge was correct, and the **player before you loses**. 

The loser of a round **discards** one of their dice (faceup).

They become the new Liar. Play the next round!


## Upgrades

Played the base game and ready for more? Or looking to tweak the game to fit your playing group better? Check out these variants and expansions!

### Variant: Straights

{{< rules/rules-image-sidebar src="variant_straights.webp" alt="Example of how to guess on a straight." >}}

This variant adds another **option for guessing**: straights. A straight is a set of numbers _in numeric order_ (without gaps or skips).

* NUMBER: Say _how many_ cards are in your straight (as usual)
* ELEMENT: Then state _one_ specific number inside the interval.

For example, such a guess might be "5 cards in numeric order, including the number 3."


When is a straight higher than another guess? 

> If at least one of the numbers you said (NUMBER or ELEMENT) is higher than the NUMBER of the previous guess.


### Variant: Vague Guesses

{{<  rules-image-sidebar src="variant_vague_guesses.webp" alt="Example of how to do a vague guess, and how to convert between vague and specific." >}}

This variants adds another **option for guessing**: vague guesses. Instead of stating the _specific_ color or number, you just say "of the same color" or "of the same number".

For example, "3 cards of the same number" or "4 cards of the same color".


When is a vague guess higher than another guess? 

* If the other guess is _vague_ too, then the usual rule applies (higher NUMBER)
* If the other guess is _specific_, then your NUMBER must be at least _double_ the previous NUMBER.

For example, the previous guess was "3 Cards with a 2". Then you can only guess "X Cards of the same number" if X is at least 6.

This "conversion" also works in reverse. 

> If you make a _specific_ guess, whereas the previous guess was _vague_, your guess only needs to be higher than _half_ the previous number.

For example, the previous guess was "6 Cards of the same number". Then you may do a specific guess like "4 Cards with a 2" and it's considered higher. (Because 4 is greater than 6/2 = 3.)


### Variants

To actually **use all possible cards** (instead of just the ones with which players start), add the following rule:

> The **losing player** of a round _may_ also **swap** one of their cards with one from the draw pile. 

If you have a very high player count---the draw pile is basically empty---you can replace this with allowing the loser to swap with _another player_.

To make the game **more predictable**, 
* During setup, have everyone _show_ their starting cards to the rest of the table.
* During gameplay, on your turn, you must reveal 1 of your secret dice (which you haven't revealed yet this round).


### Wildcards

{{<  rules-image-sidebar src="expansion_wildcards.webp" alt="Example of how to use a wildcard." >}}

This expansion adds a tiny bit of extra material: Wildcards. 

These cards always match the current guess that's being challenged.

* If the combo was based on _numbers_, then every wildcard is the number you want.
* If the combo was based on _colors_, then every wildcard is the color you want.



### Power Cards

{{<  rules-image-sidebar src="expansion_powercards.webp" alt="Example of how to guess on (or higher than) power cards." >}}

This expansion adds more material: Power Cards. These cards have **no** suit or number.

Instead, these cards show a unique **combo** (that you would never be able to guess otherwise).

* If you roll this card, you're allowed to guess this specific combo.
* When you do, explain the combo and state its unique value.

Other guesses are only **higher** than that if ...
* They're also a Power Card with a **higher value**.
* Or the **number of cards** is higher than the previously stated combo value.


For example, 
* A power card might say "two pairs". That is, two numbers that appear two times. And say the value of that card is 3.
* Then other players can bid HIGHER by saying ...
  * "I have a Power Card with value X", where X is higher than 3.
  * Or "My combo has X cards with ..." where X is higher than 3.

You are allowed to _lie_ about having a power card, making up some random combination and value. If challenged on this, you _always lose_.



