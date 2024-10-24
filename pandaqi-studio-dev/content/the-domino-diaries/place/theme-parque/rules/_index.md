---
type: "rules"
---

{{% rules-block heading="Setup" icon="setup" %}}

Place the **Entrance Tile** in the center of the table. 

Shuffle the deck and hand each player 5 Tiles. Each player also picks a color and receives all its Pawns.

Finally, place 5 Tiles faceup next to the deck: this is the **market**.

@TODO: EXAMPLE IMAGE

{{% /rules-block %}}

{{% rules-block heading="Objective" icon="objective" %}}

The game ends as soon as **all dominoes have been placed** or **all players are out of pawns**.

Everybody scores their claimed attractions. **Highest score wins!**

{{% /rules-block %}}

{{% rules-block heading="Gameplay" icon="action" %}}

From start player, take clockwise turns until done. 

Each turn has three steps (in this order): PLAY, CLAIM, DRAW.

{{% rules-block heading="Play" %}}

You **must** play 2 dominoes.

The placement rules are ...
* Must connect to the existing board. (No overlap. Holes are fine.)
* Path endings don't need to match: they can be a dead end or run off into the void. That is, _unless_ the domino part to which they're connected has a path of the same type.
* A _queue_ can have exactly one connection to a regular path, and one connection to an attraction. Any other connections (to a different queue type, both ends to a regular path, etcetera) are disallowed.

@TODO: IMAGE EXAMPLE

{{% /rules-block %}}

{{% rules-block heading="Claim" %}}

You **may** claim a "scorable item" on a domino (see [scoring](#scoring)) by placing your Pawn on it.

Everything can only be claimed once.

When you place your final Pawn, **you are done**. Give away your remaining tiles however you wish. You get no more turns.

<!--- OPTIONAL RULE: Once an Attraction is claimed, its queue is not allowed to grow any longer anymore! --->

@TODO: IMAGE EXAMPLE?

{{% /rules-block %}}

{{% rules-block heading="Draw" %}}

Finally, draw tiles from the market until you have 5 hand tiles again. Refill the market from the deck as needed.

{{% /rules-block %}}

{{% /rules-block %}}

{{% rules-block id="scoring" heading="Scoring" icon="score" %}}

In these rules,
* **Nearby** refers to all 8 neighbors (horizontally, vertically, diagonally)
* **Adjacent** refers to only the usual 4 of them (horizontally and vertically)

Tiles come in 4 varieties.
* **Paths**: regular, queue1 and queue2.
* **Decoration**: modifies their surroundings. (These are reasily recognizable because they have _no_ number in the top-left, because they never score themselves!)
* **Attractions**: only score when connected to a regular path through a **queue**. It scores the **length of its longest queue** multiplied by its **score factor**.
* **Stalls**: only score when **adjacent to any path**. It scores whatever it says.

As you see, only Attractions and Stalls are "scorable items". They might have **requirements** (text starting with "If"): if not met, they don't score anything.

Finally, some deadend paths have a special icon: **tunnel**. It connects to any other path in the same _row or column_. (As such, this is a way to connect paths or make them longer without being adjacent.)

@TODO: EXAMPLE IMAGE

@TODO: TABLE OF ALL OPTIONS

{{% /rules-block %}}

{{% rules-block heading="Variants & Expansions" icon="expansion" %}}

Played the base game and ready for more? Or want to tweak it a little to fit your group? Check out these variants and expansions!

{{% rules-block heading="Wishneyland Parki" %}}

This adds a few more attractions, decoration and stalls. These are the "simpler" additions to the game, with one-liner rules and often no special requirements.

@TODO: TABLE OF ALL OPTIONS

{{% /rules-block %}}

{{% rules-block heading="Unibearsal Honeyos" %}}

This adds a few more attractions, decoration and stalls. These are the slightly "harder" additions to the game, which often score in very unique ways or have strict requirements before scoring.

@TODO: TABLE OF ALL OPTIONS

{{% /rules-block %}}

{{% rules-block heading="Raging Rollercoasters" %}}

This adds **rollercoasters** to the game! Rollercoasters are attractions that must be created from _multiple_ parts.

The possible rollercoaster parts are: Station, Straight, Bend, Tunnel.

* Every **Station** tile can be claimed by a Pawn. Yes, a single rollercoaster with multiple stations can be claimed _multiple times_ (by different players).
* **Rollercoaster parts must match**. If a tile has an open-ended rollercoaster track, you can _only_ play tiles adjacent to it that continue the rollercoaster track properly. Any other placement is illegal.
* **Queues must be connected to stations.** You can't attach a path to any other coaster part.
* **Tunnels continue the coaster from another tunnel.** That tunnel, however, must be _nearby_ or in the _same row or column_.

A rollercoaster only scores points if it has at least one station and it is a loop (it comes back to where it started).

> **Rollercoaster Score** = 2 x "length of rollercoaster" x "length of queue"

@TODO: IMAGE EXAMPLE

{{% /rules-block %}}

{{% /rules-block %}}

