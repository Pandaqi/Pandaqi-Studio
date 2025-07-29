---
type: "rules"
---

## Setup

{{< rules-double-view src="starting_setup.webp" alt="Examples of a starting setup (3 players, 2 sides)." >}}

All players pick a clear side at which they sit: left, right, top or bottom. This is important! It determines how you must _read_ the letters on the board.

Shuffle all cards into a face-down deck. Deal all players **4** cards. Finally, draw another card and place it (face-up) in the center of the table. 

{{% rules/rules-remark %}}
On low player counts (2--3), you might use roughly half the deck. On high player counts (6+), consider printing two PDFs for a double-sized deck.
{{% /rules/rules-remark %}}

{{< /rules-double-view >}}


## Objective

The game ends when somebody runs out of cards and can't draw (enough) new ones. The player with the most points wins.


## How it works

As you see, these dominoes don't have regular letters. They have special symbols that _look like different letters_ when viewed from a different angle.

Therefore, letters mean whatever they look like _from your perspective_. If you sit on the left, and a letter is a "P" from that side---then it's a "P" for you. It might be some other letter for someone else.

The "+" symbol is a _wildcard_. It can be any letter you want. Some symbols have sides that mean nothing: those also count as wildcards.

{{% rules/rules-remark %}}
Empty cells are just empty, not a wildcard. Regard them as if it's an empty unfilled space on the board.
{{% /rules/rules-remark %}}

{{< rules/rules-image src="how_it_works.webp" alt="Example of rotating dominoes for other letters, and wildcards." >}}


## Gameplay

Take clockwise turns. On your turn, **place**, **score**, and then **refill your hand**.

{{< rules/rules-example id="turn" >}}

### Place

Play any number of dominoes from your hand. They must be in a straight line and connect to the existing dominoes. Otherwise, orient and place them as you wish.

You're also allowed to _overlap_ existing dominoes. However, you may not fully overlap one domino with a new one.

{{% rules/rules-remark %}}
If you lack table space, enable a "maximum board size": the playing area is at most 10 cells horizontally and vertically.
{{% /rules/rules-remark %}}

{{< rules/rules-image src="word_placement_right.webp" alt="Examples of correct domino placements" >}}

{{< rules/rules-image src="word_placement_wrong.webp" alt="Examples of wrong domino placements" >}}


### Score

{{< rules-double-view src="scoring.webp" alt="Example of scoring your turn (with valid and invalid words)" >}}

Every new **valid** word gives you points. However, every new **invalid** word means minus points.

Each symbol is simply worth 1 point. A word is at least 2 letters long. (So ignore any single, isolated letters.)

Score is tracked with a face-down pile in front of you. Grab as many cards from the deck as points you scored, and add them to your score pile.

{{< /rules-double-view >}}


### Refill Hand

Refill your hand back to 4. If you **did not** play a domino this turn, you must draw 1--4 cards _from your own score pile_.



## Upgrades

### Supercells

Instead of a letter, a domino space can now contain a special _action_ (or cell type). When reading words, they are an empty space and do nothing.

However, when you _overlap_ this space with another domino, the action is triggered. 

{{< rules/rules-image src="special_cell_placement.webp" alt="Example of how to use special cells." >}}

Below are all options.

{{< rules/rules-table >}}
<!-- -->
    {{< rules/rules-table-entry heading="Double Letter" >}}
        Doubles the value of the letter inside (when scoring this turn).
    {{< /rules/rules-table-entry >}}
<!-- -->
    {{< rules/rules-table-entry heading="Double Word" >}}
        Doubles the value of all words that use this cell (when scoring this turn).
    {{< /rules/rules-table-entry >}}
<!-- -->
    {{< rules/rules-table-entry heading="Thief" >}}
        At the end of your turn, refill your hand using another player's score pile.
    {{< /rules/rules-table-entry >}}
<!-- -->
    {{< rules/rules-table-entry heading="Destroyer" >}}
        Remove one domino from the board (immediately).
    {{< /rules/rules-table-entry >}}
{{< /rules/rules-table >}}

{{< rules/rules-table >}}
<!-- -->
    {{< rules/rules-table-entry heading="Dictionary" >}}
        All words you create this turn must be valid.
    {{< /rules/rules-table-entry >}}
<!-- -->
    {{< rules/rules-table-entry heading="Shield" >}}
        Invalid words (created this turn) do not give minus points.
    {{< /rules/rules-table-entry >}}
<!-- -->
    {{< rules/rules-table-entry heading="Gift" >}}
        All <em>other</em> players must give one card from their score pile back to the draw pile
    {{< /rules/rules-table-entry >}}
<!-- -->
    {{< rules/rules-table-entry heading="Rotate" >}}
        Rotate a domino that's fully visible any way you like.
    {{< /rules/rules-table-entry >}}
{{< /rules/rules-table >}}

{{< rules/rules-table >}}
<!-- -->
    {{< rules/rules-table-entry heading="Detour" >}}
        You're allowed to move away from your straight line (when placing dominoes this turn)
    {{< /rules/rules-table-entry >}}
<!-- -->
    {{< rules/rules-table-entry heading="X-Ray" >}}
        When scoring, pretend walls, wildcards and empty spaces aren't there.
    {{< /rules/rules-table-entry >}}
<!-- -->
{{< /rules/rules-table >}}


### Werewalls

Ah, our favorite Keebble element again! Walls can now be baked into dominoes, at any edge. A wall between two cells means they aren't "adjacent" anymore. 

It allows breaking up words or creating words where you otherwise couldn't. But beware, because they also increase the likelihood of negative points for invalid words created!

{{< rules/rules-image src="wall_placement.webp" alt="Examples of (in)valid wall usage." >}}


