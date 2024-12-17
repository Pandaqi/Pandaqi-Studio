---
type: "rules"
---

{{% rules-block id="setup" heading="Setup" icon="setup" %}}

Press the button below to get a random setup you can simply copy to your table.

{{< rules-example id="naivigation-setup" >}}

{{% rules-double-view src="setup.webp" alt="Example of how to setup a new game." split="leftheavy" %}}

Alternatively, manually do the setup as follows.

* Create a deck of 25 tiles: 20 **crossroads tiles** ( = track in all 4 directions, with a split) and 5 **station tiles**.
* Place these in a 5x5 grid.
* Shuffle all remaining track tiles and place them facedown as one draw pile.

{{% /rules-double-view %}}

Shuffle the 5 Train Pawns and place each on a random station. You _can't_ start a Train on its destination ( = station that shows its icon and color).

{{% remark %}}
For a simpler (first) game, simply use fewer trains and stations.
{{% /remark %}}

Finally, pick any (single) **Switch Tile**. Place it in any orientation above the instruction row too.

<div class="rulebook-shared-rule">
Combine the default Vehicle Cards with the specific Vehicle Cards for this game. Give each player 3 of these to hold in their hand.

Combine the default Health Cards and the specific Health Cards for this game. Shuffle and take out 5: this is your Health Deck.

Place 5 instruction tokens in a row. You'll place your vehicle cards underneath these each round. Pick any start player.
</div>

{{% /rules-block %}}

{{% rules-block id="objective" heading="Objective" icon="objective" %}}

In this game, you're not steering a single train, but rather controlling the **rails** (on which multiple trains travel).

You win once you've delivered **all trains to their matching stations**. You lose immediately once you're total loss: your **health deck is empty**. 

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

When a train enters a station **of the right color** ( = matching color/icon), remove the train from the map! (Remember that you win once all trains are safely removed in this way.)

You incur **1 damage** in any of the following situations.

* A train enters the station of **a wrong color**. When this happens, though, you _may_ teleport the train to another station of the wrong color.
* A train tries to **leave the map**.
* Two trains **collide** ( = a train enters a tile that already has another train).

{{< rules-image src="gameplay_moving_visiting.webp" alt="How to move and deliver trains, how to do it badly and take damage, and how to change the map over time." >}}

When moving trains, the **Switch Tile** is crucial. 

> The Switch Side that points _up_ (away from the instruction row) shows the direction (symbol) you should take.

If multiple directions are allowed, you _choose_. If none of the directions matches your train's current tile, you can _go any direction_ (as long as there's railroad track there).

Whenever you take damage in this game, you may also (instead of losing health) do the following: **change the map**.
 
* Remove 5 crossroads tiles.
* And replace them with the top 5 tiles from the deck. (You can't replace stations.)

If there are fewer replaceable tiles left (than 5), just replace as much as possible. If _none_ are left, you can't take this option anymore.

{{% /rules-block %}}

{{% /rules-block %}}

{{% rules-block id="vehicle-cards" heading="Vehicle Cards" icon="expansion" %}}

The following vehicle cards are available.

* **Train Color**: move 1 train of a matching color by 1 "step".
* **Switch**: rotate the Switch Tile.
* **Map**: rotate 1 map tile; or replace 1 map tile from deck.

{{< rules-image src="vehicle_cards.webp" alt="Examples for the Vehicle Cards present in the base game." >}}

Because all the vehicle cards allow _choice_ when executing, there's a single major change from the core Naivigation rules: **whoever played the card makes the decisions for it**. (Instead of the start player deciding for all.)

{{% /rules-block %}}

{{% rules-block id="expansions" heading="Expansions" icon="expansion" %}}

Played the base game and ready for more? Try some of these expansions!

{{% rules-block heading="Leaders & Followers" %}}

This expansion adds two new Vehicle Cards (**Disengage** and **Control Room**)

During **setup**, pick any one train to become the **Leading Train**.

* When it shares a tile with another train, it doesn't collide. Instead, the other train is attached to the Leading Train.
* If the Leading Train moves, it takes all trains on the same tile with it.
* A train attached to the Leading Train can't move independently anymore. The only way to cut the connection is by playing a Disengage card (see below).

{{< rules-image src="expansion_leaders_followers.webp" alt="Example of how to pick and use a Leading Train, as well as the new Vehicle Cards helping with that." >}}

{{% /rules-block %}}

{{% rules-block heading="Animals & Crossings" %}}

This expansion adds **Animal Pawns**, a new Vehicle Card (**Wildlife**), and a new map tile (**Railway Crossing**).

During **setup**, place an animal on every crossing.

During **gameplay**, 

* If a train enters a tile _adjacent_ to an Animal, you're allowed to move it again in any direction.
* If a train _collides_ with an animal, remove the animal and take **2 damage**.
* If a new crossing is added, place a new animal on it.

{{< rules-image src="expansion_animals_crossings.webp" alt="Examples of how to place and move Animals, and how to deal with (almost) hitting them." >}}

{{% /rules-block %}}

{{% rules-block heading="Rails & Fails" %}}

{{% rules-double-view src="expansion_rails_fails.webp" alt="All different rail types explained." split="leftheavy" %}}

This expansion adds tiles with different **types of rails**. Their special powers apply to trains moving over them.

If this is too much at once, you can also enable only one or two of the special types, and pretend the others are "regular".

{{% /rules-double-view %}}

{{% /rules-block %}}

{{% rules-block heading="Direction & Delay" %}}

The Switch Tile system in the base game makes train movement very easy. This final "expansion" makes it a bit more realistic---but also harder---by giving trains "forward" and "backward" movement.

It adds new material: Train Tiles (one per train) and a Vehicle Card (**Electricity**).

During **setup**, place the **Train Tiles** for all trains above the instruction row too. Rotate them such that "Forward" points up (or "is at the top").

{{% remark %}}
If playing with a Leading Train, just make the 1st Train Tile the lead.
{{% /remark %}}

When **moving** a train, you only consider the Switch Symbols when the track splits (3-way or 4-way split). Otherwise, the train follows its Train Tile.

{{< rules-image src="expansion_direction_delay.webp" alt="Examples of the Train Tiles and how they modify movement on simple rails, as well as the new Vehicle Card that controls this." >}}

For an even bigger challenge (_optional_): even on split tracks, "forward" and "backward" still matter! For example, if you choose the "Square" direction, but your Train Tile is set to Backward, then you actually move in the _opposite_ direction.

{{% /rules-block %}}

{{% rules-block heading="Traintwist & Railsteal" %}}

This is a _competitive_ variant of the game. Because the game already has multiple trains buzzing around, this needs minimal changes.

During **setup**, 

* Create a 6x6 grid.
* Each player picks a personal color. Include **2 trains** for each color. (The material of this expansion provides the extra pawns.)
* Place every Train Pawn as _far away_ from its station as possible. (It's fine if this means multiple trains start on the same tile.)

The **objective** is simply to be the first to **finish all your trains!**

{{% /rules-block %}}

{{% /rules-block %}}