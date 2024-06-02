---
type: "rules"
---

{{% rules-block id="setup" heading="Setup" icon="setup" icontint="green" %}}

{{% rules-double-view src="setup.webp" alt="Example game setup (for 2 players, to keep it simple)." %}}

Place any tile with the **add** (+) action facup on the table: this is the start of the waterfall.

Give all players **4 tiles** and **1 Pawn**. Everyone places the pawn above the waterfall.

The remaining tiles become the facedown draw pile.

{{% /rules-double-view %}}

{{% /rules-block %}}

{{% rules-block id="objective" heading="Objective" icon="objective" icontint="red" %}}

The game **ends** when when the waterfall **contains 20(+) cards**. (Or in the rare case where the deck is empty; all tiles are either inside the waterfall or scored.)

Players sum the points on their scored tiles: **highest score wins!**

{{% /rules-block %}}

{{% rules-block id="action_play" heading="Gameplay" icon="action" icontint="green" %}}

From start player, take clockwise turns until the game ends.

On your turn, you first **play cards** and then **fall down the waterfall**.

{{< rules-image src="gameplay.webp" alt="Example of a simple turn: playing cards and then falling down that number of steps." >}}

**PLAY**: Play as many hand cards as you want. 

* Sum the _numbers_ on them. That is how many spaces you're allowed to fall.
* If you have **no** tile in hand, move a single space and draw a tile.

**FALL**: For every space you move, pick one of the positions _below_ your current tile (down left or down right).

* It has a tile? Execute its action!
* It's empty? You've exited the waterfall. Reset to the top; your turn is over.

You **can't** enter a tile that contains another player, _unless_ both your options are blocked.

{{< rules-example id="turn" >}}

{{% /rules-block %}}

{{% rules-block id="actions" heading="Actions" icon="action" icontint="red" %}}

Everything in this game happens by executing a tile's action (when you visit it).

The main actions are ADD, DRAW and SCORE. They get a bit more explanation; all other actions are simple one-liners that can be found in the table below.

{{< rules-image src="tile_actions.webp" alt="Visual explanation of the three major actions: ADD, DRAW and SCORE." >}}

When you do an **ADD** action,
* Place a tile from your hand in the waterfall, which is a _pyramid_ shape.
* Adjacent to an existing tile.

The **DRAW** action allows 3 drawing cards from the top of the facedown deck, into your hand. If the deck runs out, shuffle the discarded tiles and make it the new deck.

The **SCORE** action works as follows. You may score at most _two_ tiles this way (with one SCORE action).
* Check the _gemstones_ that you visited thus far (when falling down this turn).
* Pick a **tile from your hand** that has a _matching gemstone_. (If none exists, just do nothing.)
* Place that tile facedown in your score pile. Its _number_ scores you points at the end of the game.

@TODO: RULES TABLE with ALL ACTIONS

That's it! Have fun!

{{% /rules-block %}}