---
title: "Kangaruse"
date: 2023-05-02
type: "rules"
pdf: false
---

{{% rules-block id="setup" heading="Setup" icon="setup" icontint="green" %}}

{{< rules-image src="setup.webp" alt="Example of a game board + possible player icons + starting positions." class="float-right" >}}

Grab a new paper. It should show a grid.

* All squares on one axis show the same **number** command (1-4).
* All squares on the other axis show a **direction** command (left, right, up, down).

Everybody invents a simple, unique icon they draw in their starting position. (If you enabled "starting positions", these are given. Otherwise, you may choose any square that doesn't score points.)


{{% /rules-block %}}

{{% rules-block id="objective" heading="Objective" icon="objective" icontint="yellow" %}}

The game ends when **nobody can jump anymore**. The player with the **most points** wins.

{{% /rules-block %}}

{{% rules-block id="action_play" heading="Gameplay" icon="action" class="force-page-break-before" icontint="purple" %}}

{{< rules-example id="turn" icontint="orange" >}}

The best jumper starts, then take clockwise turns until done.

On your turn, **jump**.

* Either **pick any number** (1-4), but follow the direction command.
* Or **pick any direction** (up, right, down, left), but follow the number command.

Jump the chosen number of spaces in the chosen direction.

* Draw your kangaroo in the new square.
* Cross out the square from which you came.

Your target square must be **unused**: not crossed out and not occupied. 

If you have no valid move, you _may_ teleport to an unused non-scoring square by **paying 15 points**. If you can't or won't, you get no more turns.

{{% remark %}}
You can't land or jump over **trees**. **Rivers** simply do nothing.
{{% /remark %}}

Finally, check the special action of your new square. That's it!

{{< rules-image src="gameplay.webp" alt="Example of picking and executing your jump." >}}

{{% /rules-block %}}

{{% rules-block id="special_types" heading="Special Types" class="force-page-break-before" icon="expansion" icontint="blue" %}}

Below is a list of all types in the game and their explanation. It's recommended to simply enable "include rules" when generating a board, so you never need to read any of this!

<div id="kangaruse-type-table">
</div>

{{% /rules-block %}}