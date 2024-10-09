---
type: "rules"
---

{{% rules-block id="setup" heading="Setup" icon="setup" %}}

This game has a special setup for the map, instead of the usual setup for a Naivigation game.

* Place the **Starting Tile** (a compass on water) on the table. Place your Boat on it.
* Orient the **Boat** and **Compass Tile** however you like. Start the **Wind Deck** at power 1.
* Divide the remaining map tiles into 4 roughly equal piles. Insert 2 harbor tiles into each and shuffle. (Add more harbor tiles if you want an even harder game.)
* Place each pile at one edge of the compass (North, East, South, West), _faceup_.

@TODO: EXAMPLE IMAGE

<div class="naivigation-shared-rule">
Combine the default Vehicle Cards with the specific Vehicle Cards for this game. Shuffle and place as a FACEUP draw pile. Each player draws 3 of these to hold in their hand. 

Combine the default Health Cards and the specific Health Cards for this game. Shuffle and take out 5: this is your Health Deck.

Place 5 instruction tokens in a row. You'll place your vehicle cards underneath these each round. Pick any start player.
</div>

{{% /rules-block %}}

{{% rules-block id="objective" heading="Objective" icon="objective" %}}

You win once you've visited **all harbors**. You lose immediately once you're total loss: your **health deck is empty**. 

{{% /rules-block %}}

{{% rules-block id="action_play" heading="Gameplay" icon="action" %}}

Skip "Rounds & Turns" if you already know how to play Naivigation. The other section has unique rules for this game.

{{< rules-example id="naivigation-turn" >}}

{{% rules-block heading="Rounds & Turns" class="naivigation-shared-rule-block" %}}

Play happens in rounds.

From the start player, take clockwise turns doing one thing: **play a Vehicle Card**.

> Add a card from your hand, facedown, to an empty spot on the row of instructions. (Then draw a new card.)

Continue until each instruction token has a card below it! Then, **reveal each instruction and execute it** (left to right), one at a time. This moves the vehicle. 

Whoever played into the first slot becomes the new start player. Discard the instructions and play the next round!

_No communication about the game is allowed._

Whenever you **take damage**, reveal the top card of your Health Deck. These cards always have a _handicap_, which must all be followed at all times.

{{% /rules-block %}}

{{% rules-block heading="Moving & Visiting" %}}

Whenever you sail **off the board**, you **explore**.
* Draw the next tile from the deck and place it underneath the ship.
* You must always draw from the deck associated with the **direction of the ship**. (Example: if the ship points East, draw a new tile from the East deck.)
* Deck is empty? Take 1 damage, stay where you are.
* Sailed into a **land** tile? Take 1 damage, stay where you are.

**Harbor Tiles** are half-water and half-land. 
* You can only safely sail into it from the water side.
* If you _end_ a round at a Harbor, you collect it! Replace with a new tile from any deck.
* (Remember you win the game if all Harbor Tiles you added have been collected.)

@TODO: EXAMPLE IMAGE

{{% /rules-block %}}

{{% /rules-block %}}

{{% rules-block id="vehicle-cards" heading="Vehicle Cards & Map Tiles" icon="expansion" %}}

The following Vehicle Cards are in the game.

* **Sail**: move in the current _compass direction_, as many tiles as the current _wind speed_.
* **Wind**: change the Wind Deck by 1 (up or down).
* **Rotate**: rotate either the compass or the ship (in the direction indicated)

If you added the **Discuss** card (from shared material), it only works if **there is no wind** ( = Wind Deck at 0). Without wind blowing your ears off, you can finally hear each other!

The following special Map Tiles are in the base game. Their action triggers when you visit.

* **Island** (good; common): add a tile (from any deck) to the map at any position. If it's a land tile, however, you must attach it to other land (if possible).
* **Anchor** (bad): the round ends immediately. If there were instructions left to execute, you take 1 damage.
* **Lighthouse** (good): while the ship is here, the start player may show their hand and play their cards faceup.

@TODO: EXAMPLE IMAGE

{{% /rules-block %}}

{{% rules-block id="expansions" heading="Expansions" icon="expansion" %}}

Played the base game and ready for more? It's recommended to add these expansions in order, as they get progressively harder, but not required.

{{% rules-block heading="Supertiles & Slipstreams" %}}

This expansion adds some map tiles with special icons. They trigger when the ship is on that tile.

* **Faint Rumors**: you may freely discuss the game, but not reveal your exact hand cards.
* **Harbor Hint**: look at any deck until you find a Harbor tile. Move it to the top of the deck.
* **Shipwreck**: you can't pass through this tile, unless you move at a speed of at least 2 tiles (at once).

Most of all, it adds map tiles with a **water current**. 

* This is shown with an arrow and a strength.
* When you end your turn there, you're automatically moved by the water streams. 
* (By as many tiles as shown, in the direction shown.)

{{% /rules-block %}}

{{% rules-block heading="Windstorms & Weather" %}}

This expansion adds special **Vehicle Cards** that change the weather. They go from severe storms to sunny days, and the rules ensure that weather can't change _too much_ at once.

During **setup**, 

* Start the "Weather Deck" by placing 1 random such card faceup on the table. 
* All other Weather Cards are just shuffled into the regular deck. (They are just "vehicle cards" with some special rules.)

During **gameplay**, the top card of the Weather Deck shows a permanent rule that must be followed.

When it comes to playing and revealing Weather cards,

* If you have such a card in your hand, you _must_ play at least one this round. 
* When revealed, check its number against the top weather card. If it's more than 2 away, permanently remove this card, it does nothing.
* Otherwise, place it on top of the weather deck.

This expansion also adds two more (simpler) **Vehicle Cards**.

* **Row**: move the ship _forward_ by 1 tile.
* **Spyglass**: draw 3 tiles from any deck. Attach them to your current map at the _side_ (of the compass) from where you grabbed the tile.

WHAT COULD THE WEATHER CARDS POSSIBLY DO?
* Thunder (-3) => spin the compass to randomize it. Do the same at the start of each round.
* Storm (-2) => all instructions are doubled. Rotating the ship's direction incurs 1 damage.
* Windy Day (-1) => the wind value is doubled.
* Calm Seas (0) => There is no wind at all.
* Cloudy Day (1) => the weather card only switches if the new weather card's number is at most 1 away.
* Sunny Day (2) => you're not required to play a weather card if you have one (?)
* Scorching Heat (3) => the wind value is divided by 2 (rounded). Any time you end a round with this weather, take 1 damage.

{{% /rules-block %}}

{{% rules-block heading="Islands & Treasures" %}}

This expansion adds special **Treasure Cards**.

During **setup**, draw 5 random treasures and place them faceup on the table. (The others will not be used this game.)

Each treasure has an "ideal island" where it can be found. (General shape, number of tiles, surroundings, etcetera.)

During **gameplay**, when you visit a harbor at an "ideal island", you collect the associated treasure! You get the bonus described. Remove the treasure; you can't collect it multiple times.

This expansion also adds a new Vehicle Card.

* **Dig**: replace 1--3 tiles next to the ship (horizontal, vertical, diagonal) with new ones from the deck.

VARIANT: For easier treasure collection, notice that every treasure also shows a specific harbor tile. Add this rule: "You also get the treasure by simply visiting that harbor, regardless of what its island looks like."

VARIANT: For a harder game, add this to the objective: you can only win if you collected _all treasures_.

{{% /rules-block %}}

{{% rules-block heading="Pirates & Cannons" %}}

This expansion adds special **tiles** and (Enemy) **pawns**.

During **gameplay**,

* When a tile appears with an **Enemy symbol**, place a new Enemy of that type on the map (Pirate Ship, Sea Monster or Whirlpool).
* Each round, _1 vehicle card_ needs to be played to every Enemy in play, faceup. It doesn't matter who does it or when.
* After moving your own ship, move all Enemies (in any order), according to their single Vehicle Card.

What do Enemies do?

* **Pirate Ship**: if you run into them, take 2 damage and remove the Pirates. If you are to the _left_ or _right_ of one, take 1 damage. 
* **Sea Monster**: if you run into them, take 1 damage.
* **Whirlpool**: if you run into them, shuffle all remaining instructions this round. If there are no instructions left, remove the whirlpool.

It also adds a **Pirate Haven/Harbor** tile. You need to visit these as well (to win the game). You can only do so, however, if there are currently Enemies within 2 tiles of this harbor.

Finally, this expansion also adds a new **Vehicle Card** for self-defense.

* **Cannon**: destroy any Enemy to your left or right.
  * It also shows an Enemy Symbol + arrow. If played to an Enemy, _that_ icon decides how it moves.

{{% /rules-block %}}

{{% /rules-block %}}