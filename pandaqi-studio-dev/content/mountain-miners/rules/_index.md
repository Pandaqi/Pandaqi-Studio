---
type: "rules"
---

{{% rules-block id="setup" heading="Setup" icon="setup" icontint="green" %}}

Create a 6x6 grid of random map tiles, but rotated so that it's a _diamond shape_. 

Place the **arrow tile** above any corner (pointing at it). Pick any start player.

@TODO: EXAMPLE IMAGE

{{% /rules-block %}}

{{% rules-block id="objective" heading="Objective" icon="objective" icontint="red" %}}

The game ends when no **point tiles** remain. (Those are the gemstones with a number on them.) Sum the values of all tiles you scored. Highest score wins!

{{% /rules-block %}}

{{% rules-block id="action_play" heading="Gameplay" icon="action" icontint="green" %}}

Begin with the start player, then take clockwise turns until done.

On your turn, 
* If possible, **grab** an available tile at the **top of the mountain**.
* Then move the arrow tile a quarter turn clockwise.

You _may_ also discard an action tile (of yours) to execute its action. You may do this both before and after your turn.

**What is the top of the mountain?** It's the layer of tiles _closest_ to the arrow tile. You can only grab from those options, not any tiles on layers further away.

**What if the board splits?** You collect all tiles from the _smaller group_!

@TODO: EXAMPLE IMAGE

@TODO: INTERACTIVE EXAMPLE

{{% /rules-block %}}

{{% rules-block id="scoring" heading="Gemstones & Actions" icon="score" icontint="green" %}}

Tiles have two possible types: a gemstone (unique color + scores points) or an action tile.

At the end of the game, 
* If you have a **gemstone** the **most** out of all players, **add** the point value of each tile (of that type) to your score.
* If you have a **gemstone** the **least** out of all players, **subtract** the point value of each tile (of that type) from your score.

In both cases, ties (for first or last place) are allowed. Action tiles score nothing.

To make this easy to see, keep your collected tiles in piles sorted by _icon_.

@TODO: Make the actions a rules-table including its icons

The possible actions are ...
* **Move the Arrow** (the most common action): move the Arrow tile to any of the eight positions. (North, East, South, West, and in-between)
* **Arrow Lock**: Turn the arrow facedown. It doesn't move automatically anymore at the end of your turn. This is undone when the _next_ Arrow Lock is played.
* **Swap**: Swap 2 tiles on the board. You may also swap with an empty space, essentially _moving_ a tile, as long as the board stays connected.
* **Double**: Take 2 turns in a row.
* **Steal**: Steal a collected tile from another player.

Action tiles can move the arrow tile to diagonals. This is allowed and follows all the same rules; see the example.

@TODO: EXAMPLE IMAGE

{{% /rules-block %}}

{{% rules-block id="variants" heading="Variants & Expansions" icon="expansion" icontint="red" %}}

Once you're familiar with the base game, try some of these variants or expansions!

{{% rules-block heading="Variants" %}}

To give the game a **quicker start**, you can give each player 1 random tile before the game starts.
* You can pick this completely randomly.
* Or restrict it to just the action tiles.
* Optional: the start player can choose where the arrow starts, but does NOT get this 1 starting tile.

You can also **vary** the size and shape of **the map**. It's recommended to use a diamond of at least 5x5 tiles, but anything goes.

{{% /rules-block %}}

{{% rules-block heading="Dark Tunnels" %}}

Start the game with all the tiles turned _facedown_.

It also adds new actions:
* **Flashlight**: pick a row of tiles and secretly look at them.
* **Lightbulb**: pick a row of tiles and _reveal_ all of them.
* **Bomb**: remove a 2x2 cluster of tiles from the board. The next player must skip their turn to refill this hole from the deck. 
* **Second Arrow**: add or remove the second Arrow Tile.
* **Ransack**: Flip a _faceup_ tile facedown. Then collect an adjacent tile and end your turn.

It also adds two new icons: 
* **Trash**: Each trash icon is worth -1 point and can't be discarded.
* **Multiplier**: Add this to an icon pile to multiply its score at the end. Once done, however, you may never grab another tile with that icon again.

@TODO: Make "reveal/check" tiles also a default action? So, at the end of your turn, it's "Either move the arrow OR turn 1 facedown tile faceup (at the end of your turn)."

{{% /rules-block %}}

{{% rules-block heading="Gemshards" %}}

Tiles can now be _divided_ into multiple sections.

When you grab such a tile, you only get the side that currently _points_ towards the Arrow Tile. Place tiles before you such that this side faces _away_ from you, to always remember.

If the Arrow Tile is on a diagonal, it points at _two sides_. You may choose which one you want.

Similarly, if you want to use a tile for an action, you can only use that one.

It also adds new actions:
* **Rotate Grabbed**: rotate a tile you've already grabbed. (To make another side point up and be true.)
* **Rotate Board**: rotate a tile on the board
* **Teleport Arrow**: move the arrow to any location.
* **Rumble**: Move 2 tiles to empty spaces in the mountain (still within the original grid).

It also adds new icons: 
* **Wildcard**. When you receive it, immediately decide to which pile ( = existing icon) you want to add it. You **can't** grab a wildcard if you have no regular icons yet.

{{% /rules-block %}}

{{% /rules-block %}}