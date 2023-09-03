---
title: "Kangaruse"
date: 2023-05-02
type: "rules"
pdf: false
---

{{% rules-block id="setup" heading="Setup" icon="setup" icontint="purple" %}}

Grab a new paper. It should show a grid.

* All squares on one axis show the same **number** command (1-4).
* All squares on the other axis show a **direction** command (left, right, up, down).

Everybody invents a simple, unique icon they draw in their starting position. (If you enabled "starting positions", these are given. Otherwise, you may choose freely.)

{{< rules-image src="setup.webp" alt="Example of a game board + possible player icons + starting positions." >}}

{{% /rules-block %}}

{{% rules-block id="objective" heading="Objective" icon="objective" icontint="orange" %}}

The game ends when **nobody can jump anymore**. The player with the **most points** wins.

{{% /rules-block %}}

{{% rules-block id="action_play" heading="Gameplay" icon="action" class="force-page-break-before" icontint="purple" %}}

{{< rules-example id="turn" >}}

The best jumper starts, then take clockwise turns until done.

On your turn, **jump**.

* Either **pick any number** (1-4), but follow the direction command.
* Or **pick any direction** (up, right, down, left), but follow the number command.

{{< rules-image src="gameplay_pick_option.webp" alt="Example of how you're allowed to jump when standing on a certain square." >}}

Jump the chosen number of spaces in the chosen direction.

* Draw your kangaroo in the new square.
* Cross out the square from which you came.

Your target square must be **unused**: not crossed out and not occupied. If you have no valid move, you get no more turns.

{{% remark %}}
You can't land or jump over **trees**. **Rivers** simply do nothing.
{{% /remark %}}

Finally, check the special action of your new square. That's it!

{{< rules-image src="gameplay_execute_jump.webp" alt="Example of forbidden jumps and successfully executing one." >}}

{{% /rules-block %}}

{{% rules-block id="expansion" heading="Collector Expansion" class="force-page-break-before" icon="expansion" icontint="orange" %}}

The **collector** expansion adds many more ways to score points, and some new squares to help with that. Instead of just scoring with stars, you can collect other items (such as _water_ or _food_) that score in different ways.

All squares that _can_ score are called "score squares" in the rules.

Additionally, you can _choose_ to enable these optional rules.

* **Stuck?** If you're stuck, you're allowed to teleport to any other unused square, at the cost of **losing 10 points**.
* **Buddies?** You're allowed to land on squares that already have a player there. When you do so, move the previous player to any adjacent unused square. If that's impossible, you still can't land here.

{{% remark %}}
It's wise to generate a paper with the score trackers added to the page itself, to make scoring way easier.
{{% /remark %}}

{{% /rules-block %}}

<!--- @TODO: section explaining all the types --->