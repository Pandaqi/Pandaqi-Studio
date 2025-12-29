---
type: "rules"
---

## Setup

{{< rules/rules-example id="naivigation-setup" >}}

{{< rules/rules-image-sidebar src="setup.webp" alt="Example of how to setup the game." >}}

Alternatively, manually do the setup as follows.

* Create a deck of 25 tiles, including 5 Airports and the Starting Tile.
* Randomly place these in a 5x5 grid. 
* Place the vehicle on the starting tile (oriented randomly).

Grab all **Elevation Cards** and place them in numeric order (low to high). This is the "Elevation Deck". It represents the current altitude of your plane. Start at the same elevation as your starting tile.

The elevation of a _map tile_ is given by the number of triangles in the corners. The elevation for a specific _terrain_ (grass, forest, ...) is always the same.


<div class="rulebook-shared-rule">
Combine the default Vehicle Cards with the specific Vehicle Cards for this game. Shuffle and place as a FACEUP draw pile. Each player draws 3 of these to hold in their hand. 

Combine the default Health Cards and the specific Health Cards for this game. Shuffle and take out 5: this is your Health Deck.

Place 5 instruction tokens in a row. You'll place your vehicle cards underneath these each round. Pick any start player.
</div>


## Objective

You win once you've **visited all airports**. You lose immediately once you're total loss: your **health deck is empty**.


## Gameplay

Skip "Rounds & Turns" if you already know how to play Naivigation. The other section has unique rules for this game.

{{< rules/rules-example id="naivigation-turn" >}}

### Rounds & Turns

Play happens in rounds.

From the start player, take clockwise turns doing one thing: **play a Vehicle Card**.

> Add a card from your hand, facedown, to an empty spot on the row of instructions. (Then draw a new card.)

Continue until each instruction token has a card below it! Then, **reveal each instruction and execute it** (left to right), one at a time. This moves the vehicle. 

Whoever played into the first slot becomes the new start player. Discard the instructions and play the next round!

_No communication about the game is allowed._

Whenever you **take damage**, reveal the top card of your Health Deck. These cards always have a _handicap_ which must be followed at all times.

{{< rules/rules-image src="gameplay.webp" alt="The core gameplay of Naivigation: play vehicle cards, execute, move vehicle." >}}


### Moving & Visiting

When moving, first check your elevation.

* Tiles have a specific _elevation_, shown by triangles in the corner.
* **You can only fly over tiles if your elevation is higher.** 
* If you try to enter a tile at the wrong elevation, take 1 damage and don't move.

There is only one exception: **landing**.

* Any Airport or Stopover tiles can be landed on if you have **the exact same elevation**.
* If so, remove the tile and replace it with a random one from the deck. (Remember: if all Airports are gone, you win the game.)
* And change your Elevation to the elevation of this _new_ tile. 

The map **wraps around**: flying off of one side makes you reappear on the other. Doing this, however, incurs 1 damage.

{{< rules/rules-image src="gameplay_moving_visiting.webp" alt="How to fly around and land on/collect airports." >}}



## Vehicle Cards

{{< rules/rules-image src="vehicle_cards.webp" alt="Examples of the 4 basic vehicle cards in the game, as well as elevation extremes being bad." >}}

The following vehicle cards are in the base game.

* **Fly:** move one step forward ( = in current facing direction)
* **Turn**: rotate a quarter turn left or right (start player decides)
* **Elevate**: if played in an odd-numbered slot, add 1 elevation. Otherwise, remove 1 elevation.
* **Stunt**: move one step forward, ignoring elevation rules.

It's possible to fly **too low** (you need to remove the last elevation card) or **too high** (need to add a new elevation card but can't). In both cases, take 1 damage, but don't change elevation.

The elevation deck ranges from 1--5. Elevation on tiles ranges from 0--4.


## Upgrades

Played the base game and ready for more? Try one or more of these expansions!

### Variants

For an **easier game**, 

* Whenever you replace your tile (after landing), **don't** update your Elevation to the new tile. Just keep it as it is.
* Also allow flying over a tile if your elevation is the **same**.

For a **harder game**, 

* Take out the **Stunt** cards. (Or simply make them the same as **Fly**.)
* Disable **wrapping around** the map. (Just stay where you are, and take 1 damage for this at the end of the round.)


### Fuel & Falling

This expansion adds a constant extra pressure or decision to the game. Its rules are simple as always, but it makes the game considerably harder, so ye be warned.

During **setup**,
* Place the **10 Fuel Cards** on the table: this is your Fuel Deck.
* Include the **Refuel** Vehicle Cards.

During **gameplay**, many Vehicle Cards deplete fuel. Whenever you execute a card that ends up **moving the plane**, it costs 1 Fuel. (That is, remove the next Fuel card from that deck.)

If you **run out of fuel** ( = fuel deck is empty), you enter "free fall".

* The Fly and Elevate cards don't work anymore. (You will mostly be steering and hoping for a refuel.)
* At the end of each round, you automatically move forward 1 tile and drop 1 elevation level. (Take these two steps in the order that suits you.)

{{< rules/rules-image src="fuel_falling.webp" alt="Example of tracking fuel, freefall when you run out, and how to refuel in time." >}}


### Repairs & Racing

This expansion adds three new Vehicle Cards: **Repair, Backflip** and **Fly**.

{{< rules/rules-image src="expansion_repairs_racing.webp" alt="Examples of the 3 new vehicle cards in this expansion." >}}


### Timezones & Tomorrow

This expansion adds new material (**Timezone Tiles**) and a new mechanic.

During **setup**, add a Timezone tile above each _column_ of the map. From left to right, add them in numeric order.

{{% rules/rules-remark %}}
Once you understand this expansion better, you can add the Timezone tiles in a RANDOM ORDER!
{{% /rules/rules-remark %}}

The remaining Timezone Tiles create the **Clock Deck**. It works similar to the Elevation Deck: place them in numeric order, from low to high, and start the timer at the lowest number.

During **gameplay**,

* After _each round_, advance the clock by placing the next tile on top.
* Whenever you collect a new airport, reset this clock to 0.
* Whenever you fly into a new timezone, modify the clock based on the difference. 
  * Example: going from zone +2 to +3 means you **add** a Clock Card (advance time).
  * Example: going from zone +5 to +3 means you **remove** two Clock Cards (back in time).

Crucially, the clock now determines if you can visit a specific airport at all.

> An airport can only be collected if you reach it when the Clock is _lower_ than its indicated time.

{{< rules/rules-image src="expansion_timezones_tomorrow.webp" alt="Example of how to track the Clock and timezones, and use that to land on airports in time." >}}


### Birds & Bumps

This expansion adds **Obstacle Pawns**: Bird, Balloon and Tornado.

During **setup**, place 3 random obstacles on random airports. 

{{% rules/rules-remark %}}
Add more obstacles for a harder game, fewer for an easier game.
{{% /rules/rules-remark %}}

During **gameplay**,

* After each round, the obstacles fly to an adjacent tile. 
* Which one? The one with the largest elevation difference to their current tile. 
* If there's a tie, start player chooses where they go.

When you _hit_ an obstacle, there are consequences. These depend on what you hit.

{{< rules/rules-image src="expansion_birds_bumps.webp" alt="Example of how to place and move obstacle pawns, including their special power when you collide with them." >}}


### Passengers & Planes

{{< rules/rules-image-sidebar src="expansion_passengers_planes.webp" alt="Example of passengers and how to read/use them." >}}

This expansion adds extra material: **Passenger Tiles**.

During **setup**, draw 3 random Passenger Tiles. They will be traveling with your amazing airline today.

Each passenger ...
* Has a specific airport they want to visit.
* Has a penalty (which must be followed for as long as they are in your airplane)
* Has a bonus (which triggers when you deliver them)


The passenger leaves ("is delivered") when you visit their preferred airport. If so, clearly place them apart from the undelivered passengers.

{{% rules/rules-remark %}}
Yes, you _don't_ have to deliver them all to win, though it's probably desirable because of their penalty.
{{% /rules/rules-remark %}}

Once comfortable with this, you can raise the number of passengers. You can also add the following rule: "When you visit a new airport, draw an extra passenger. If its destination doesn't exist anymore, remove 1 passenger (delivered or not) of choice."


### Poly Planes

With some expansions enabled, you have enough material and options to split players into two teams, even on low player counts. You might try this variant then. (Similar to the shared Naivigation rules for 6+ players, where you're moving two vehicles and racing against each other.)

* The teams move their own airplane, with their own decks. (Instruction row, Elevation/Fuel, Passengers, ...)
* Each round, however, each team must also place 1 card in the row of the _other_ team. (Doesn't matter who or when.)

If you ever crash into the other airplane, both teams lose the game.


