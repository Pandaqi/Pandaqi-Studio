---
type: "rules"
---

{{% rules-block id="setup" heading="Setup" icon="setup" %}}

Press the button below to get a random setup you can simply copy to your table.

{{< rules-example id="naivigation-setup" >}}

Alternatively, manually do the setup as follows.
* Create a deck of 25 tiles: 20 **crossroads tiles** ( = track in all 4 directions, with a split) and 5 **station tiles**.
* Place these in a 5x5 grid.
* Remove all leftover crossroads or station tiles from the deck. Shuffle all remaining track tiles and place them facedown as the draw pile.

Shuffle the 5 Train Pawns and place one on each station.
* Point the train out of the station.
* Place the corresponding **Train Tile** above the instruction row. Rotate it such that "Forward" is at the top.
* EXCEPTION: The Train Pawn must be different than its station. So if it happens to match already, place it somewhere else.

Finally, place the **Switch Tile** in any orientation above the instruction row too.

<div class="rulebook-shared-rule">
Combine the default Vehicle Cards with the specific Vehicle Cards for this game. Give each player 3 of these to hold in their hand.

Combine the default Health Cards and the specific Health Cards for this game. Shuffle and take out 5: this is your Health Deck.

Place 5 instruction tokens in a row. You'll place your vehicle cards underneath these each round. Pick any start player.
</div>

@TODO: IMAGE EXAMPLE

{{% /rules-block %}}

{{% rules-block id="objective" heading="Objective" icon="objective" %}}

In this game, you're not steering a single train, but rather controlling the **rails** (on which multiple trains travel).

You win once you've delivered all **5 trains to their matching stations**. You lose immediately once you're total loss: your **health deck is empty**. 

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

{{% /rules-block %}}

{{% rules-block heading="Moving & Visiting" %}}

When a train enters a station **of the right color** ( = matching color/icon), remove the train from the map! (Remember that you win once all trains are safely removed in this way.)

You suffer **1 damage** in any of the following situations.

* A train enters the station of **a wrong color**. When this happens, though, you _may_ teleport the train to another station of the wrong color.
* A train tries to **leave the map**.
* Two trains **collide** ( = a train enters a tile that already has another train).

When leaving a tile with a **switch** (it splits into multiple directions), the following steps determine where to go.

* Look at the Switch Tile.
* The color/symbol that points _up_ (away from the instruction row) is the one to take.
* EXCEPTION: If this matches no direction, or multiple directions, then the start player _chooses_.

Whenever you take damage in this game, you may also (instead of losing health) do the following: **change the map**. 
* Remove 5 crossroads tiles.
* And replace them with the top 5 tiles from the deck.

{{% remark %}}
This option is not available, of course, it there aren't 5 deck tiles or 5 crossroads tiles anymore to replace.
{{% /remark %}}

@TODO: IMAGE EXAMPLE

{{% /rules-block %}}

{{% /rules-block %}}

{{% rules-block id="vehicle-cards" heading="Vehicle Cards" icon="expansion" %}}

The following vehicle cards are available.

* **Train Color** (CHOICE; if the card has multiple colors): move 1 train of a matching color by 1 "step". 
  * Check the corresponding Train Tile.
  * The side that points _up_ (away from instruction row) shows whether that step means _forward_, _backward_ or _do nothing_.
* **Switch** (CHOICE): rotate the Switch Tile.
* **Electricity** (CHOICE): rotate any Train Tile.
* **Map** (CHOICE): rotate 1 map tile; or replace 1 map tile from deck.

Because all the vehicle cards allow _choice_ when executing, there is one major change from the core rules: **whoever played the card makes the decisions for it**. (Instead of the start player deciding for all.)

@TODO: EXAMPLE IMAGE

{{% /rules-block %}}

{{% rules-block id="expansions" heading="Expansions" icon="expansion" %}}

Played the base game and ready for more? Try some of these expansions!

{{% rules-block heading="Leaders & Followers" %}}

The first train you place during setup---and thus the first Train Tile, from left to right---becomes the **Leading Train**.

* When it shares a tile with another train, it doesn't collide. Instead, the other train is attached to the Leading Train.
* If the Leading Train moves, it takes all trains on the same tile with it.
* A train attached to the Leading Train can't move independently anymore. The only way to cut the connection is by playing a Disengage card (see below).

It also adds a new Vehicle Card.

* **Disengage:** move all trains connected to the leading car to an adjacent tile.
* **Lead Change** (?? rare? useful?): Rotate both the Switch Tile and a Train Tile one quarter turn.

{{% /rules-block %}}

{{% rules-block heading="Animals & Crossings" %}}

This expansion adds **Animal Pawns** and map tiles with **Railway Crossings**.

During **setup**, place an animal on every crossing.

During **gameplay**, 

* If a train enters a tile _adjacent_ to an Animal, you're allowed to move it again in any direction.
* If a train _collides_ with an animal, remove the animal and take **2 damage**.
* If a new crossing is added, place a new animal on it.

It also adds a vehicle card.

* **Wildlife (Management)**: Move an animal to an adjacent tile.

{{% /rules-block %}}

{{% rules-block heading="Rails & Fails" %}}

This expansion adds tiles with different **types of rails**. Their special powers apply to trains moving over them.

* **Speedy**: any step taken on it is _doubled_.
* **One Way**: they only allow moving in one direction (forward/backward).
* **Safety**: while on here, you never take any damage.
* **Wide/Double**: allows 2 trains without colliding.
* **Colored**: only allows trains of the color shown. (@TODO: Must there be some exception to this? Or does the Map card and other rules already prevent a deadlock?)

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