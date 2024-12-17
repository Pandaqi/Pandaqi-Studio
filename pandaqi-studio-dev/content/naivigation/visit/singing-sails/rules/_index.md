---
type: "rules"
---

{{% rules-block id="setup" heading="Setup" icon="setup" %}}

{{% rules-double-view src="setup.webp" alt="Example of how to setup a new game." split="leftheavy" %}}

This game has a special setup for the map, instead of the usual setup for a Naivigation game.

* Place a **starting tile** ( = any empty water tile) on the table. Place your Boat on it.
* Orient the **Boat** and **Compass Tile** however you like. Start the **Wind Deck** at power 1.
* Divide the remaining map tiles into 4 roughly equal piles. Insert 2 harbor tiles into each and shuffle. (Add more harbor tiles if you want an even harder game.)
* Place each pile at one edge of the compass (North, East, South, West), _faceup_.

{{% /rules-double-view %}}

<div class="rulebook-shared-rule">
Combine the default Vehicle Cards with the specific Vehicle Cards for this game. Shuffle and place as a FACEUP draw pile. Each player draws 3 of these to hold in their hand. 

Combine the default Health Cards and the specific Health Cards for this game. Shuffle and take out 5: this is your Health Deck.

Place 5 instruction tokens in a row. You'll place your vehicle cards underneath these each round. Pick any start player.
</div>

{{% /rules-block %}}

{{% rules-block id="objective" heading="Objective" icon="objective" %}}

You win once you've collected **all harbors**. You lose immediately once you're total loss: your **health deck is empty**. 

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

Whenever you **take damage**, reveal the top card of your Health Deck. These cards always have a _handicap_, which must all be followed at all times.

{{< rules-image src="gameplay.webp" alt="The core gameplay of Naivigation: play vehicle cards, execute, move vehicle." >}}

{{% /rules-block %}}

{{% rules-block heading="Moving & Visiting" %}}

To collect a **Harbor Tile**, visit it with your Ship rotated to **point at the Harbor**.

{{% remark %}}
Notice half a Harbor is land, i.e. you can only sail into it from the other side.
{{% /remark %}}

Whenever you sail **off the board**, you **explore**.

* Draw the next tile from every (compass) deck.
* Place it at the **side of the map** that matches the side of the compass from whence it came.
* The tile at the side you just explored **must** be placed **underneath** the ship. Other tiles follow the placement rules below.

Newly placed tiles should **match terrain** (if possible).

* Water Tile? It must connect to water (on at least one side).
* Land Tile? It must connect to land (on at least one side).
* Besides these rules, you're free to place and orient the tile however you want.

There are two situations where you **take 1 damage** (and don't move): sailing into **land**, or there is **no more tile** to place underneath your ship.

{{< rules-image src="gameplay_moving_visiting.webp" alt="How to sail around, explore new parts of the world, and collect harbors by visiting them." >}}

{{% /rules-block %}}

{{% /rules-block %}}

{{% rules-block id="vehicle-cards" heading="Vehicle Cards & Map Tiles" icon="expansion" %}}

{{< rules-image src="vehicle_cards.webp" alt="Examples of how to use the Vehicle Cards and special Map Tiles in the base game." >}}

The following Vehicle Cards are in the game.

* **Sail**: move in the current _compass direction_, as many tiles as the current _wind speed_.
* **Wind**: change the Wind Deck by 1 (up or down).
* **Rotate**: rotate either the compass or the ship (in the direction indicated).

The following special Map Tiles are in the base game. Their action triggers when you visit.

* **Island** (good; common): add a tile (from any deck) to the map at any position, ignoring tile placement rules.
* **Anchor** (bad): the round ends immediately. If there were instructions left to execute, you take 1 damage.
* **Lighthouse** (good): while the ship is here, the start player may show their hand and play their cards faceup.

If you added the **Discuss** card (from shared material), it only works if **Wind < 2**. Without wind blowing your ears off, you can finally hear each other!

{{% /rules-block %}}

{{% rules-block id="expansions" heading="Expansions" icon="expansion" %}}

Played the base game and ready for more? It's recommended to add these expansions in order, as they get progressively harder, but not required.

{{% rules-block heading="Variants" %}}

For an **easier game**, 

* Allow the **Rotate** card to rotate as much as you want
* Allow the **Wind** card to set the wind to whatever you want.
* Allow collecting harbors with **any Ship orientation**

For a **harder game**, 

* Only allow collecting harbors if you **end the round** on them.

{{% /rules-block %}}

{{% rules-block heading="Supertiles & Slipstreams" %}}

This expansion adds some more **map tiles** (Buoy, Shipwreck, Treasure Map). They trigger, as usual, when the ship is on that tile.

Most of all, it adds map tiles with a **water current**. 

* This is shown with waves and arrows in a specific direction.
* When entered, you're automatically moved again by the water stream (in the direction shown).
* This happens _after_ any other effects or special situations the tiles trigger.

{{< rules-image src="expansion_supertiles_slipstreams.webp" alt="Example of how to follow water currents, and explanation for how new map tiles work." >}}

{{% /rules-block %}}

{{% rules-block heading="Windstorms & Weather" %}}

This expansion adds special **Vehicle Cards** that change the weather (as well as **Row** and **Spyglass**). They go from severe storms to sunny days, and the rules ensure that weather can't change _too much_ at once.

{{< rules-image src="expansion_windstorms_weather.webp" alt="Example of how to play/use Weather Cards, and the other new vehicle cards." >}}

During **setup**, 

* Start the "Weather Deck" by placing 1 random such card faceup on the table. 
* All other Weather Cards are just shuffled into the regular deck.

During **gameplay**, the top card of the Weather Deck shows a permanent rule that must be followed.

When it comes to playing and revealing Weather cards,

* If you have such a card in your hand, you _must_ play at least one this round. 
* When revealed, check its number against the active Weather Card. 
  * If it's more than 3 away, permanently remove your played card, it does nothing.
  * Otherwise, place it on top of the Weather Deck: this is now the active weather!

{{% /rules-block %}}

{{% rules-block heading="Islands & Treasures" %}}

This expansion adds special **Treasure Cards**. It also adds a new Vehicle Card (**Dig**) and Map Tile (**Whirlpool**)

During **setup**, draw 3 random treasures and place them faceup on the table. (The others will not be used this game.)

Each treasure has an "ideal island" where it can be found. This is any island that fits the _condition_ written on the treasure.

During **gameplay**, when you visit a harbor at an "ideal island", you collect the associated treasure! You get the bonus described. Remove the treasure; you can't collect it multiple times.

{{< rules-image src="expansion_islands_treasures.webp" alt="Example of how to read and collect Treasures." >}}

Below are some optional variants to modulate game difficulty.

* You can add more or fewer treasures at the start.
* Notice that every treasure also shows a specific harbor. For an **easier** game, add this rule: "You also get the treasure by simply visiting that harbor, regardless of what its island looks like."
* For a **harder** game, add this to the objective: you can only win once you collected _all treasures_.

{{% /rules-block %}}

{{% rules-block heading="Pirates & Cannons" %}}

This expansion adds (Enemy) **Pawns** (Pirate Ship, Sea Monster, Huge Wave), and a special **tile** and **vehicle card** to deal with them.

During **setup**, place 1 Pawn of each enemy type somewhere besides the board. This is _their_ "instruction token", for their own little instruction row with 1 slot.

During **gameplay**,

* Whenever you place a map tile with an **Enemy symbol**, place a new Enemy of that type on the map (Pirate Ship, Sea Monster or Whirlpool).
  * This new Enemy must be placed at most 2 spaces away from the tile you just added.
* Each round, _1 vehicle card_ needs to be played to every Enemy Instruction Token, faceup. It doesn't matter who does it or when.
* After moving your own ship, move all Enemies (in any order), according to their single Vehicle Card.

{{% remark %}}
So yes, all pawns of the same type, will all move in the same way.
{{% /remark %}}

{{< rules-image src="expansion_pirates_cannnons.webp" alt="Examples of how to place Pawns, give them instructions, then move and interact with them." >}}

In these rules, "adjacent" means **to the side**. A tile is adjacent to another if it's directly to the left or right. 

Similarly, distance is measured _without diagonals_ too: if something is "2 spaces away", it means you can take 2 left/right/up/down steps to reach the tile.

{{% /rules-block %}}

{{% /rules-block %}}