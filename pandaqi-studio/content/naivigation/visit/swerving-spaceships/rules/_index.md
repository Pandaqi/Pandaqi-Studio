---
type: "rules"
---

## Setup

Press the button below to get a random setup you can simply copy to your table.

{{< rules/rules-example id="naivigation-setup" >}}

{{< rules/rules-image-sidebar src="setup.webp" alt="Example of how to setup a new game." >}}

Alternatively, manually do the setup as follows.
* Create a deck of 25 tiles, including 5 planets and 1 starting tile. 
* Randomly place these in a 5x5 grid. 
* Place the vehicle on the starting tile (oriented randomly)


<div class="rulebook-shared-rule">
Combine the default Vehicle Cards with the specific Vehicle Cards for this game. Shuffle and place as a FACEUP draw pile. Each player draws 3 of these to hold in their hand. 

Combine the default Health Cards and the specific Health Cards for this game. Shuffle and take out 5: this is your Health Deck.

Place 5 instruction tokens in a row. You'll place your vehicle cards underneath these each round. Pick any start player.
</div>

<!--- 
OLD SETUP
Alternatively, manually do the setup as follows.
* Create 5 piles of 4 tiles each without planets. 
* Then add exactly 1 planet inside each pile and shuffle. 
* Place them in a 5x5 grid (each pile being one row). 
* Place the spaceship on the first non-planet tile, in a random orientation. 
* (This is for map diversity. If planets are still bunched up in groups, simply redo this setup.)
--->


## Objective

You win once you've visited **5 planets**. You lose immediately once you're total loss: your **Health Deck is empty**. 


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

Whenever you **take damage**, reveal the top card of your Health Deck. These cards always have a _handicap_, which must be followed at all times.

{{< rules/rules-image src="gameplay.webp" alt="The core gameplay of Naivigation: play vehicle cards, execute, move vehicle." >}}


### Moving & Visiting

You can only **visit a planet** if the spaceship has the **same orientation** as indicated. 
* If it's wrong, you just stay where you are and take 1 damage.
* If correct, replace the planet with a random tile from the deck. You've visited it!

The map **wraps around**: flying off of one side makes you reappear on the other. Doing this, however, incurs 1 damage.

Whenever you move **diagonally**, you must choose which of the two directions (horizontally or vertically) you want to take. Actual diagonal movement doesn't exist.

{{< rules/rules-image src="gameplay_moving_visiting.webp" alt="Example of the rules around collecting planets and moving through space." >}}



## Vehicle Cards

The following vehicle cards are in the base game.

* **Thrust**: Move one tile forward, in the direction the spaceship currently faces.
* **Steer:** The steering cards show a **range**. You may pick any angle (horizontal, vertical or diagonal) within that range.
  * Remember this is steering, so rotate the vehicle starting from its current direction. (Don't just snap to the angle indicated.)
* **Disable.** Perform one gravitational pull step.
  * Find the closest planet. (If tied, pick one.)
  * Move one tile closer to that planet.

{{< rules/rules-image src="vehicle_cards.webp" alt="Examples of how to execute the three possible movement cards." >}}


## Upgrades

It's recommended to add these expansions in order, as they get progressively harder, but not required. None of them change rules, they merely add more tiles (for the map) and vehicle cards (to play).

### Shields & Asteroids

{{< rules/rules-image-sidebar src="expansion_shields_asteroids.webp" alt="Examples of how to use all the new tiles/cards in the Shields expansion." >}}

Add the following map tiles.
* **Asteroids:** if you fly into this tile, take 1 damage.
* **Wormhole:** teleport to another wormhole, take 1 damage.

Add the following vehicle cards.
* **Shield**: Toggles the shield on and off. When the shield is on, you don't take damage, but you also can't land on planets.
	* When on, place this card faceup on the table to remember this. (When the shield turns off, just remove this card.)
	* A **Disable** card ALSO turns off the shield.
* **Thrust+**: Moves 2 spaces at once. (Ignore the space you pass by; you simply skip over it.)



### Weapons & Aliens

First, we define **line of sight**. A spaceship can "see" all non-empty tiles in front of their nose. Here, non-empty means it's either a special tile or it contains a spaceship.

Add the following map tiles.
* **Sun**: flying into this tile incurs 3 damage. It _also_ counts for gravitational pull (when playing a Disable card).
* **Enemy Spaceship**: Take 1 damage if you enter their line of sight or enter their tile. Then _rotate_ the spaceship to any different orientation.

Add the following vehicle card.
* **Shoot**: destroys the _first_ tile within line of sight. 
  * If this is a planet, you immediately lost the game! 
  * If this tile contained another spaceship (when playing with two teams), they take 2 damage.

{{< rules/rules-image src="expansion_weapons_aliens.webp" alt="Examples of how to use all the new tiles/cards in the Weapons expansion." >}}


### Trade & Technology

Include the special **planet** and **planet properties** cards. Place the planet cards in a row. Then place two random property cards underneath each planet. 

There are two types of properties:
* **Collectable if**: this means you can ONLY collect this planet if you satisfy the given requirement(s)
* **Reward if**: this means you get some reward or penalty for visiting the planet in a certain way. 

When visiting a planet successfully, remove its card (and its properties) from this row.

Add the following map tiles.
* **Space Station**: enter this tile to repair 2 damage. Then remove the tile and replace with the top one from the deck.
* **Moon**: when visiting, collect this tile and replace with a new one from the deck. You may also  _rearrange_ the planets or planet properties.

If you have a planet property requiring a resource, make sure that resource is actually part of the starting map.

Add the following vehicle cards
* **Hyper**: move to one edge of the map ( = one end of your row or column)

{{< rules/rules-image src="expansion_trade_tech.webp" alt="Examples of how to use all the new tiles/cards in the Trade expansion." >}}


