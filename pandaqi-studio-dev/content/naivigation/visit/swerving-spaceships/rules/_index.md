---
type: "rules"
---

{{% rules-block id="setup" heading="Setup" icon="setup" icontint="green" %}}

Press the button below to get a random setup you can simply copy to your table.

{{< rules-example id="setup" >}}

Alternatively, manually do the setup as follows.
* Create 5 piles of 4 tiles each without planets. 
* Then add exactly 1 planet inside each pile and shuffle. 
* Place them in a 5x5 grid (each pile being one row). 
* Place the spaceship on the first non-planet tile, in a random orientation. 
* (This is for map diversity. If planets are still bunched up in groups, simply redo this setup.)

<div class="naivigation-shared-rule">
Combine the default Vehicle Cards with the specific Vehicle Cards for this game. Give each player 3 of these to hold in their hand.

Combine the default Health Cards and the specific Health Cards for this game. Shuffle and take out 5: this is your Health Deck.

Place the 5 row tokens in order: you'll place your instructions underneath these each round.
</div>

{{% /rules-block %}}

{{% rules-block id="objective" heading="Objective" icon="objective" icontint="red" %}}

You win once you've visited **5 planets**. You lose immediately once you're total loss: your **health deck is empty**. 

{{% /rules-block %}}

{{% rules-block id="action_play" heading="Gameplay" icon="action" icontint="green" %}}

Skip "Rounds & Turns" if you already know how to play Naivigation (it repeats the shared rules). The other section has unique rules for this game.

<!--- @TODO: Mark the entire _block_ as a shared rule?? Test this, make it work --->
{{% rules-block heading="Rounds & Turns" class="naivigation-shared-rule" %}}

Play happens in rounds.

First determine **start player**. Throw the compass in the air and see to which player it points (the most).

From the start player, take clockwise turns doing one thing: **play a Vehicle Card**.

> Add a card from your hand, facedown, to an empty spot on the row of instructions. (Then draw a new card.)

At the end of the round, **reveal each instruction and execute it** (left to right), one at a time. This moves the vehicle. Discard the instructions and play the next round!

_No communication about the game is allowed._ You may only communicate about your cards or plans when the **"Discuss"** Vehicle Card is executed.

Whenever you **take damage**, reveal the top card of your Health Deck. These cards always have a _handicap_, which must all be followed at all times.

{{% /rules-block %}}

{{% rules-block heading="Moving & Visiting" %}}

You can only **visit a planet** if the spaceship has the **same orientation** as indicated. 
* If it's wrong, you bounce back (to where you came from) and take 1 damage.
* If correct, replace the planet with a random tile from the deck. You've visited it!

The map **wraps around**. (Flying off of one side makes you reappear on the other.) Doing this, however, incurs 1 damage.

In the base game, just ignore any special elements on tiles. They are for the expansions. That's it!

@TODO: IMAGE

{{% /rules-block %}}

{{% /rules-block %}}

{{% rules-block id="vehicle-cards" heading="Vehicle Cards" icon="expansion" icontint="red" %}}

@TODO: Make this a rules-table or something?

@TODO: IMAGE

The following vehicle cards are in the base game.

* **Thrust**: Move one tile forward, in the direction the spaceship currently faces.
* **Steer:** The steering cards show a **range**. You may pick any angle (perfect horizontal, vertical or diagonal) within that range.
  * Remember this is steering, so rotate the vehicle starting from its current direction. (Don't just snap to the angle indicated.)
* **Disengage.** Perform one gravitational pull step.
	* Find the closest planet. (If tied, pick one.)
	* Move one tile closer to that planet.
	* Ignore diagonals in all this: only count horizontal and vertical steps.


{{% /rules-block %}}

{{% rules-block id="expansions" heading="Expansions" icon="expansion" icontint="red" %}}

{{% rules-block heading="Shields & Asteroids" %}}
@TODO

* **Shield**: Toggles the shield on and off. When the shield is on, you don't take damage.
	* When on, place this card faceup on the table to remember this. (When the shield turns off, just remove this card.)
	* A **Disengage** card ALSO turns off the shield.

{{% /rules-block %}}

{{% rules-block heading="Weapons & Aliens" %}}
@TODO
{{% /rules-block %}}

{{% rules-block heading="Trade & Technology" %}}
@TODO
{{% /rules-block %}}

{{% /rules-block %}}