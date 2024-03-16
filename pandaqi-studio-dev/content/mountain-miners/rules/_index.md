---
type: "rules"
---

{{% rules-block id="setup" heading="Setup" icon="setup" icontint="yellow" %}}

{{% rules-double-view src="setup.webp" alt="Example of the default setup for the game (regardless of player count)." %}}

Create a 6x6 grid of random map tiles, but rotated so that it's a _diamond shape_. 

Place the **arrow tile** above any corner (pointing at it). Pick any start player.

{{% /rules-double-view %}}

{{% /rules-block %}}

{{% rules-block id="objective" heading="Objective" icon="objective" icontint="purple" %}}

The game ends when no **gemstones** remain ( = the only tiles that score points). Sum the values of all tiles you scored. **Highest score wins**!

{{% /rules-block %}}

{{% rules-block id="action_play" heading="Gameplay" icon="action" icontint="yellow" %}}

Begin with the start player, then take clockwise turns until done.

On your turn, 
* If possible, **grab** an available tile at the **top of the mountain**.
* Then move the arrow tile a quarter turn clockwise.

You _may_ also discard an action tile (of yours) to execute its action. You may do this both before and after your turn.

**What is the top of the mountain?** It's the layer of tiles _closest_ to the arrow tile. You can only grab from those options, not any tiles on layers further away.

<!--- 
**What if the board splits?** You collect all tiles from the _smaller group_! => @TODO: Might just ignore this altogether, why would a split be disastrous for gameplay?
--->

{{< rules-image src="turn.webp" alt="Examples of two subsequent turns in the game." >}}

{{< rules-example id="turn" >}}

{{% /rules-block %}}

{{% rules-block id="scoring" heading="Gemstones & Actions" icon="score" icontint="purple" %}}

Tiles have two possible types: a gemstone (unique color + scores points) or an action tile.

At the end of the game, 
* If you have a **gemstone** the **most** out of all players, **add** the point value of each tile (of that type) to your score.
* If you have a **gemstone** the **least** out of all players, **subtract** the point value of each tile (of that type) from your score.

Ties (for first or last place) are allowed. Action tiles score nothing.

To make this easy to see, keep your collected gemstones in piles sorted by _icon_.

@TODO: Make the actions a rules-table including its icons

The possible actions are ...
* **Move the Arrow** (most common): move the Arrow tile to any of the eight positions. (North, East, South, West, and in-between)
* **Arrow Lock**: Turn the arrow facedown. It doesn't move automatically anymore at the end of your turn. This is undone when the _next_ Arrow Lock is played.
* **Swap**: Swap 2 tiles on the board. You may also swap with an empty space, essentially _moving_ a tile, as long as the board stays connected.
* **Double**: Grab 1 more tile this turn.
* **Steal**: Steal a collected tile from another player.

Action tiles can move the arrow tile to diagonals. This is allowed and follows all the same rules; see the example.

{{< rules-image src="scoring.webp" alt="Scoring example (for 3 players) and clarification about diagonal arrow angles." >}}

{{% /rules-block %}}

{{% rules-block id="expansions" heading="Variants & Expansions" icon="expansion" icontint="yellow" %}}

Once you're familiar with the base game, try some of these variants or expansions! The more you add, however, the more it's recommended to increase the map size (and play a longer game).

{{% rules-block heading="Variants" %}}

To give the game a **quicker start**, you can give each player 1 random tile before the game starts.
* It's recommended to restrict this to action tiles. But you _can_ pick it at random.
* Optional: make this start tile a _secret_ one that you keep in your hand.
* Optional: the start player can choose where the arrow starts, but does NOT get this 1 starting tile.

To make the game **harder**, only allow _one action_ at most per turn. (That is, you may discard an action tile before or after grabbing a tile, but _not both_.)

You can also **vary** the size and shape of **the map**. It's recommended to use a diamond shape of at least 5x5 tiles, but anything goes.

{{% /rules-block %}}

{{% rules-block heading="Dark Tunnels" %}}

Start the game with all the tiles turned _facedown_.

At the end of each turn, when you move the arrow, you must also **gather information** (if possible).
* If you **haven't used an action** this turn, secretly look at a facedown tile.
* Otherwise, turn one facedown tile faceup.

It also adds new actions:
* **Lightbulb**: pick a row of tiles and _reveal_ all of them.
* **Bomb**: remove a 2x2 cluster of tiles from the board, without collecting them. The next player must skip their turn to refill this hole from the deck. 
* **Second Arrow**: add or remove the second Arrow Tile.
* **Ransack**: Flip a _faceup_ tile facedown. Then collect an adjacent tile and end your turn.

A second Arrow simply means you have more options to choose from when picking your tile. Both of them move automatically at the end of each turn.

It also adds two new gemstones: 
* **Trash**: Each trash icon is worth -2 point and can't be discarded or removed in any way.
* **Multiplier**: Add this to a gemstone pile to multiply its score at the end. Once done, however, you may never grab another tile with that icon again.

{{% /rules-block %}}

{{% rules-block heading="Gemshards" %}}

Tiles can now be _divided_ into multiple sections.

When you grab such a tile, you only get the side that currently _points_ towards the Arrow Tile. Place tiles before you such that this side faces _away_ from you, to always remember. (You only get _that_ gemstone or action, not the others on the tile.)

In some situations, the Arrow Tile may point at the line between _two sides_. In that case, choose which of the two options you want upon grabbing the tile.

It also adds new actions:
* **Rotate Grabbed**: rotate a tile you've already grabbed. (To make another side point up and be true.)
* **Rotate Board**: rotate a tile on the board
* **Teleport Arrow**: move the arrow to any location.

It also adds a new gemstone: 
* **Wildcard**: immediately decide to which gemstone pile of yours you want to add it. It becomes that type. You **can't** grab a wildcard if you have no regular gemstones yet.

{{% /rules-block %}}

{{% rules-block heading="Golden Actions" %}}
This expansion merely adds a few more (chaotic, powerful, spicy) actions.

@TODO: Rules-table of what is added.

* **Flashlight**: 
* **Rumble**: Move 2 tiles to empty spaces in the mountain (still within the original grid).


{{% /rules-block %}}

{{% /rules-block %}}