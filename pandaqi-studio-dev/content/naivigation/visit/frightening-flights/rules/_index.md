---
type: "rules"
---

{{% rules-block id="setup" heading="Setup" icon="setup" %}}

Press the button below to get a random setup you can simply copy to your table.

{{< rules-example id="naivigation-setup" >}}

Alternatvely, manually do the setup as follows.
* Create a deck of 25 tiles, including 5 airports.
* Randomly place these in a 5x5 grid. 
* Place the vehicle on the first non-airport tile (oriented randomly).

Grab all **Elevation Cards** and place them in numeric order (low to high). This is the "Elevation Deck". It represents the current altitude of your plane. Remove cards from the top until it shows the same elevation as your starting tile.

<div class="rulebook-shared-rule">
Combine the default Vehicle Cards with the specific Vehicle Cards for this game. Shuffle and place as a FACEUP draw pile. Each player draws 3 of these to hold in their hand. 

Combine the default Health Cards and the specific Health Cards for this game. Shuffle and take out 5: this is your Health Deck.

Place 5 instruction tokens in a row. You'll place your vehicle cards underneath these each round. Pick any start player.
</div>

{{% /rules-block %}}

{{% rules-block id="objective" heading="Objective" icon="objective" %}}

You win once you've **visited all airports**. You lose immediately once you're total loss: your **health deck is empty**.

{{% /rules-block %}}

{{% rules-block id="action_play" heading="Gameplay" icon="action" %}}

Skip "Rounds & Turns" if you already know how to play Naivigation. The other section has unique rules for this game.

{{< rules-example id="naivigation-turn" >}}

{{% rules-block heading="Rounds & Turns" class="rulebook-shared-rule-block" %}}

Play happens in rounds.

From the start player, take clockwise turns doing one thing: **play a Vehicle Card**.

> Add a card from your hand, facedown, to an empty spot on the row of instructions. (Then draw a new card.)

Continue until each instruction token has a card below it! Then, **reveal each instruction and execute it** (left to right), one at a time. This moves the vehicle. 

Whoever played into the first slot becomes the new start player. Discard the instructions and play the next round!

_No communication about the game is allowed._

Whenever you **take damage**, reveal the top card of your Health Deck. These cards always have a _handicap_ which must be followed at all times.

{{% /rules-block %}}

{{% rules-block heading="Moving & Visiting" %}}

When moving, first check your elevation.

* Tiles show an _elevation_ number. (If they don't, their elevation is simply 1.)
* **You can only fly over tiles if your elevation is higher.** 
* If you try to enter a tile at the wrong elevation, take 1 damage and don't move.

There is only one exception: **landing**.

* Any Airport or Stopover tiles can be landed on if you have **the exact same elevation**.
* Remove the tile and replace it with a random one from the deck. (Remember: if all Airports are gone, you win the game.)
* Change your elevation deck to the elevation of this _new_ tile. 

The map **wraps around**: flying off of one side makes you reappear on the other. Doing this, however, incurs 1 damage.

@TODO: EXAMPLE IMAGE

{{% /rules-block %}}

{{% /rules-block %}}

{{% rules-block id="vehicle-cards" heading="Vehicle Cards" icon="expansion" %}}

@TODO: EXAMPLE IMAGE

The following vehicle cards are in the base game.

* **Fly:** move one step forward ( = in current facing direction)
* **Turn**: rotate a quarter turn left or right (start player decides)
* **Stunt**: move one step forward, ignoring elevation/the elevation rule.
* **Elevate**: if played in an odd-numbered slot, add 1 elevation. Otherwise, remove 1 elevation.

It's possible to fly **too low** (you need to remove the last elevation card) or **too high** (need to add a new elevation card but can't). In both cases, take 1 damage, but don't change elevation.

The elevation deck ranges from 1--5. Elevation on tiles ranges from 0--4.

{{% /rules-block %}}

{{% rules-block id="expansions" heading="Expansions" icon="expansion" %}}

Played the base game and ready for more? Try one or more of these expansions!

{{% rules-block heading="Fuel & Falling" %}}

This expansion adds a constant extra pressure or decision to the game. Its rules are simple as always, but it makes the game considerably harder, so ye be warned.

During **setup**,
* Place the **10 Fuel Cards** on the table: this is your Fuel Deck.
* Include the **Refuel** Vehicle Cards.

During **gameplay**, many Vehicle Cards deplete fuel. Whenever you execute a card that ends up **moving the plane**, it costs 1 Fuel. (That is, remove the next Fuel card from that deck.)

The **Refuel** card replenishes the entire fuel tank. It can, however, only be used if the plane has _landed_. If executed at any other time, take 1 damage and clear the remaining instructions.

If you **run out of fuel** ( = fuel deck is empty), you enter "free fall".

* The Fly and Elevate cards don't work anymore. (You will mostly be steering and hoping for a refuel.)
* At the end of each round, you automatically move forward 1 tile and drop 1 elevation level.

@TODO: EXAMPLE IMAGE

{{% /rules-block %}}

{{% rules-block heading="Repairs & Racing" %}}

Adds three new Vehicle Cards.

* **Repair:** when executed, repair 1 damage. (Add one card back to the Health Deck.) It can only be used if the plane has _landed_. If executed at any other time, take 1 damage and clear the remaining instructions.
* **Backflip:** rotate the plane 180 degrees
* **Fly+:** fly forward twice.

@TODO: EXAMPLE IMAGE?

{{% /rules-block %}}

{{% rules-block heading="Timezones & Tomorrow" %}}

This expansion adds new material (**Timezone Tiles**) and a new mechanic.

During **setup**, add a Timezone tile above each _column_ of the map. From left to right, add them in numeric order.

{{% remark %}}
Once you understand this expansion better, you can add the Timezone tiles in a RANDOM ORDER!
{{% /remark %}}

The remaining Timezone Tiles create the **Clock Deck**. It works similar to the Elevation Deck: place them in numeric order, from low to high, and start the timer at the lowest number.

During **gameplay**,
* After each round, advance the clock by placing the next tile on top.
* Whenever you fly into a new timezone, modify the clock based on the difference. (Example: going from zone +5 to +3 means the clock goes back by 2 tiles.)
* Whenever you collect a new airport, reset this clock to 0.
* An airport can only be collected if you reach it when the clock is _lower_ than its indicated time. (Each airport has a simple CLOCK ICON with a number on it.)

If it's impossible to land on _any_ airport anymore, you immediately lose the game.

@TODO: EXAMPLE IMAGE

{{% /rules-block %}}

{{% rules-block heading="Birds & Bumps" %}}

This expansion adds **Obstacle Pawns**.

During **setup**, place 3 random obstacles on random airports. 

During **gameplay**,

* After each round, the obstacles fly to an adjacent tile. 
* Which one? The one with the largest elevation difference to their current tile. 
* If there's a tie, start player chooses where they go.

When you _hit_ an obstacle, there are consequences. These depend on what you hit.

* **Bird**: take 1 damage and end the round.
* **Balloon**: end the round. (You can only hit this if your elevation is 3 or higher.)
* **Storm**: take 1 damage. (You can only hit this if your elevation is 3 or lower.)

It also adds a few cards for the action/time deck about **weather effects** (in case you're playing with that expansion).

@TODO: EXAMPLE IMAGE

{{% /rules-block %}}

{{% rules-block heading="Passengers & Planes" %}}

This expansion adds extra material: **Passenger Tiles**.

During **setup**, draw 3 random Passenger Tiles. They will be traveling with your amazing airline today.

Each passenger ...
* Has a specific airport they want to visit.
* Has a penalty (which must be followed for as long as they are in your airplane)
* Has a bonus (which triggers when you deliver them)

The passenger leaves ("is delivered") when you visit their preferred airport. If so, clearly place them apart from the undelivered passengers.

{{% remark %}}
Yes, you _don't_ have to deliver them all to win, though it's probably desirable because of their penalty.
{{% /remark %}}

@TODO: EXAMPLE IMAGE

Once comfortable with this, you can raise the number of passengers. You can also add the following rule: "When you visit a new airport, draw an extra passenger. If its destination doesn't exist anymore, remove 1 passenger (delivered or not) of choice."

{{% /rules-block %}}

{{% rules-block heading="Variant: Poly Planes" %}}

With some expansions enabled, you have enough material and options to split players into two teams, even on low player counts. You might try this variant then. (Similar to the shared Naivigation rules for 6+ players, where you're moving two vehicles and racing against each other.)

* The teams move their own airplane, with their own decks. (Instruction row, Elevation/Fuel, Passengers, ...)
* Each round, however, each team must also place 1 card in the row of the _other_ team. (Doesn't matter who or when.)

If you ever crash into the other airplane, both teams lose the game.

{{% /rules-block %}}

{{% /rules-block %}}