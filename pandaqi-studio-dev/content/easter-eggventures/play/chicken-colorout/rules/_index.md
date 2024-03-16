---
type: "rules"
---

{{% rules-block id="setup" heading="Setup" icon="setup" icontint="green" %}}

Place a 3x3 grid of random tiles on the table. Place the starting tile (showing each egg's special power) in the center. Place the Seeker pawn on it.

Give each player 10 random egg tokens.

@TODO: IMAGE EXAMPLE

{{% /rules-block %}}

{{% rules-block id="objective" heading="Objective" icon="objective" icontint="red" %}}

The game ends as soon as **one player has hidden all their eggs**. That player wins.

{{% /rules-block %}}

{{% rules-block id="action_play" heading="Gameplay" icon="action" icontint="green" %}}

Begin with the start player, then take clockwise turns until done.

On your turn, either **explore** or **hide an egg**.

Exploring means you _move_ the Seeker in a straight line to a new tile, and rotate them one quarter turn. You may also move them **off board** to "explore". If so, draw a new tile and place it underneath the Seeker.

Hiding means placing one egg token (of yours) in a free egg slot.
* You can **never** hide an egg on a tile that the **Seeker is watching**.
* You must always satisfy the specific requirements written on that tile.

The specific egg type you hide may trigger a consequence or action. The starting tile reminds you of this.

{{% /rules-block %}}

{{% rules-block id="slots" heading="Hiding Slots" icon="expansion" icontint="red" %}}

There are 4 different types of requirements that can be on a slot. All of them can also be _inverted_, if a red cross shows before them.

There's no need to memorize these; all of this is public information, so just ask around or look up what icons mean as you play.

* **Egg**: Must play that type of egg
* **Board**: Must play the type that appears the MOST or the LEAST on the entire map.
* **Rainbow**: Must play a different type than ones already here
* **Rainbow Arrow**: must play a different type than what's already on neighbor pointed at.

@TODO: List them properly, though a rules-table won't work if we need to display both the POSITIVE and NEGATIVE version, right?

Expansions add more varied requirements.


{{% /rules-block %}}

{{% rules-block id="expansions" heading="Expansions" icon="expansion" icontint="red" %}}

Played the base game and ready for more? Check out these expansions! It's recommended to include the extra tiles from _Terrific Tiles_ before playing with any of the other expansions.

{{% rules-block heading="Terrific Tiles" %}}

This expansion adds more _map tiles_ to print. 

These new tiles have some new possible slot requirements:

* **Hand**: Must play the egg type you have the MOST or LEAST.
* **Skull**: Must play an egg that hasn't been played yet this round---but take no action.
* **Pawn Arrow**: Play any egg here, but only if there's a Pawn on the neighbor to which the arrow points.

They also display some written text that is used in the _Special Scores_ expansion.

{{% /rules-block %}}

{{% rules-block heading="Special Scores" %}}

Most of the rules stay the same, but there's one crucial difference.

When placing an egg, you immediately **score it**.

* The default score value of an egg is the **distance** in tiles between the egg and the Seeker. (In a sense, you score more if the egg is "well-hidden".)
* Some tiles, however, also include a special score rule which is _added_ to this. This can be a fixed number or a dynamic rule such as "score = the number of eggs on this tile". 

If a rule or requirement mentions a "Pawn", know that the Seeker is also a Pawn. (More Pawns will only appear if you play with the Peering Pawns expansion.) If the rule gives you a non-integer value, always _round down_.

For each point scored, you may take **any egg token** from storage. This includes the special **Victory Egg**: the only one that scores points at the end. Of course, you may only grab Victory Eggs of value 1---the higher values are to track high scores without requiring loads of material.

The game still ends when a player gets rid of their eggs. Victory Eggs don't count here, nor can they be hidden or traded.

This player, however, is _not_ necessarily the winner. Instead, it's the player who has the **most Victory Eggs** when this happens.

{{% /rules-block %}}

{{% rules-block heading="Peering Pawns" %}}

This expansion adds _pawns_ to print.

Each player gets their own Pawn.

During the **explore** action, you may also move your own Pawn by at most 3 tiles. Just as with the Seeker, moving _off board_ explores and adds a new tile to the map.

Similarly, when triggering the egg action that allows teleporting the Seeker, you may also teleport your own Pawn instead.

Crucially, you may only hide eggs on your **current tile** ( = where your Pawn stands now).

If playing with the **score** expansion, the default score of an egg changes: now it's equal to the distance between the egg and the closest Pawn (including Seeker; excluding yourself).

{{% /rules-block %}}

{{% /rules-block %}}