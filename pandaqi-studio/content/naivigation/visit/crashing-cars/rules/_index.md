---
type: "rules"
---

## Setup

{{< rules/rules-example id="naivigation-setup" >}}

{{< rules/rules-image-sidebar src="setup.webp" alt="Example of how to setup a new game." >}}

Alternatively, manually do the setup as follows.

* Create a deck of 25 tiles: 20 **crossroads tiles** ( = roads in all 4 directions) and 5 **shop tiles**. 
* Shuffle and place these in a 5x5 grid.
* Place the car at the Starting Tile (oriented randomly).
* Shuffle all remaining map tiles and place them facedown as one draw pile.

Grab all **Gear Cards** and sort them from low to high. The top card of this pile always represents your current "Gear". Start at 0.


<div class="rulebook-shared-rule">
Combine the default Vehicle Cards with the specific Vehicle Cards for this game. Give each player 3 of these to hold in their hand.

Combine the default Health Cards and the specific Health Cards for this game. Shuffle and take out 5: this is your Health Deck.

Place 5 instruction tokens in a row. You'll place your vehicle cards underneath these each round. Pick any start player.
</div>


## Objective

You win once you've visited **all the shops**. You lose immediately once you're total loss: your **health deck is empty**. 


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

Whenever you **take damage**, reveal the top card of your Health Deck. These cards always have a _handicap_, which must all be followed at all times.

{{< rules/rules-image src="gameplay.webp" alt="The core gameplay of Naivigation: play vehicle cards, execute, move vehicle." >}}


### Moving & Visiting

To **visit a shop**, it must have a parking lot next to it. If your car is "properly parked" ( = matches orientation printed on tile), you successfully visit all adjacent shops. Collect the tile, replace with a new map tile.

Notice shops also have a number. If you visit the shop exactly with the card in that _slot_ (in the instructions row), great job! If not, you take 1 damage.

You can go **off the road**. If you did so, however, take 1 damage at the end of the round. (You don't take multiple damage for this in a single round.)

If you drive **off the map**, you take 1 damage and stay where you are.

Whenever you take damage, you can also do it in another way (instead of lowering your health): **changing the map**. 

* Draw the top 5 tiles from the deck.
* Use them to replace 5 crossroads tiles on the map. (You can't replace shops.)

If there are fewer replaceable tiles left (than 5), just replace as much as possible. If _none_ are left, you can't take this option anymore.

{{< rules/rules-image src="gameplay_moving_visiting.webp" alt="How to visit shops, drive safely (or not), or change the map over time." >}}



## Vehicle Cards

{{< rules/rules-image src="vehicle_cards.webp" alt="Examples of how to use the default Vehicle Cards and Map Tiles in the base game." >}}

The following vehicle cards are available.

* **Gear**: change the Gear by as much as the slot number in which it's played (up or down).
* **Drive**: move as many tiles _forward_ as your _Gear_. (If Gear is negative, move backward.)
* **Turn**: rotate as many quarter turns to the _right_ as your _Gear_. (If Gear is negative, rotate to the _left_ instead.)
* **Cruise**: move once while ignoring Gear (forward, backward, rotate left, or rotate right)

There are also three special **map tiles** with traffic signs.

* **Stop Sign:** When entered, end the round immediately, and reset Gear to 0.
* **Construction**: When entered, take 1 damage.
* **Earthquake**: Swap 2 map tiles, or replace 1 map tile from the deck. (You can't swap your current tile.)


## Upgrades

Played the base game and ready for more? Try out these expansions! They are in no particular order; each expansion changes the game in equally interesting ways.

### Traffic & Police

This expansion adds the Police Pawn, as well as new Vehicle Cards (**Police**, **Lock Doors**) and Map Tiles (**Traffic Light**, **Maximum Speed**).

During **setup**, place a **Police Pawn** as far away from your starting position as possible.

During **gameplay**,

* In this expansion, you can break traffic rules. 
* For every broken rule, however, move the Police Car 1 tile closer to you (horizontally or vertically).
* When you collide with the Police Car, you lose the game.

By default, **going off-road** breaks traffic laws, of course!

{{< rules/rules-image src="expansion_traffic_police.webp" alt="Examples of how the police moves, and how the new cards/tiles influence this." >}}

It also modifies existing map tiles to allow "breaking the law".

* **Parking Lot** (if included): If you end the round here with your car in the wrong orientation, you break the law.
* **Construction Work** (if included): If you enter this tile, you break the law.
* **Stop Sign** (if included): you may _decide_ to ignore it and not stop the round. But if you do, you break the law.


### Fuel & Fear

This expansion adds a **Fuel Deck**.

> At the end of each round, your fuel is depleted by as many cards as your current Gear.

Parking lots are the only exception. While there, you don't use any fuel.

If you run out of fuel, you incur **1 damage**. If you overfill your fuel (you want to add more fuel than you have cards), you incur **1 damage**. In both cases, reset the fuel tank to maximum size.

There are two ways to refuel.

* Play the **Refuel** vehicle card. Gain as many Fuel cards as your current Gear.
* Visit the **Tank Station**. This completely fills up your fuel tank.

{{< rules/rules-image src="expansion_fuel_fear.webp" alt="Examples of how fuel is drained, what that means, and how to refuel." >}}

For an even bigger challenge (_optional_), deplete Fuel _every time_ a Drive card is played instead. This replaces draining Fuel at the end of the round.


### Taxis & Cargo

{{< rules/rules-image-sidebar src="setup.webp" alt="Example of how to setup a new game." >}}

This expansion adds a deck of **Passenger Cards** (with destinations, curses and rewards).

It also adds two Vehicle Cards.

* **Load/Unload**: either grab a new passenger from the deck (they're now in your car), or drop off an existing passenger.
* **Turn On Radio:** if the radio is turned on this round, the _curses_ of all your passengers are ignored.


Your car has a maximum size of 3. (Some curses or rewards change this.)

* While inside your car, Passengers have a "curse" that is permanently active.
* If you drop off a passenger while **adjacent to their destination**, you get the "reward" listed on them. 
* If their destination isn't on the board, you can drop them off at any shop.

For an even bigger challenge (_optional_), add this to the objective: "You can't win the game until you've successfully dropped off 3 passengers."

{{% rules/rules-remark %}}
Lower or raise this number of passengers to modulate difficulty further.
{{% /rules/rules-remark %}}


### Terrain & Tripplanning

This expansion finally gives special powers to different **road types** (Dirt, Asphalt, Cobblestones) and adds a new map tile (**Tunnel**).

It also changes how to treat the **numbers** on shops. The following rule holds.

> When you visit a shop with a certain number, you must first visit all shops of the _same number_ before you can jump to a different one.

For example, the first shop you visit is a 3-shop. Then you must first visit _all other 3-shops_ before you can visit any other.

Visiting a shop out of order will **instantly lose** you the game. (For a more friendly version, simply incur **1 damage** for this.)

{{< rules/rules-image src="expansion_terrain_tripplanning.webp" alt="Examples of how to visit shops in order, as well as the different road types." >}}


