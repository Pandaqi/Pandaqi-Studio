---
type: "rules"
---

{{% rules/rules-block id="setup" heading="Setup" icon="setup" icontint="pink" %}}

Print a game board and hand out pens. Each player ...

* Receives an inventory at the edge of the board. (Optional: cut these off and keep them secret.)
* Picks any drawable icon: you'll use that to represent your **traveler**.
* Draws that icon at the capital. (Always the city "A", colored differently.)

With **2 players**, you get a bigger hand: use 2 inventories per player.

Pick a start player. Players who come later in the turn order (clockwise) receive a small compensation before the game starts.

* The 2nd and 3rd player add 1 balloon of choice to their inventory. 
* The 4th and 5th player add 2 balloons of choice.
* The 6th player adds 3 balloons of choice.

@TODO: Now we need an IMAGE of the setup (with the new modifications)

{{% /rules/rules-block %}}

{{% rules/rules-block id="objective" heading="Objective" icon="objective" icontint="blue" %}}

The game ends when **all routes have been claimed** or **nobody can take any more actions**. 

The player with the **highest score** wins.

{{% /rules/rules-block %}}

{{% rules/rules-block id="gameplay" heading="Gameplay" icon="action" class="force-page-break-before" icontint="lightblue" %}}

Take clockwise turns. On your turn, pick one action: **Move** or **Claim**.

The rules often mention that somebody is "rewarded". This always means that they pick one balloon of choice _or_ add one space to their inventory.

{{< rules/rules-example id="turn" >}}

{{% rules/rules-block id="action_move" heading="Move" %}}

Pick a **destination**: a city connected to your traveler's current city, with a free movement slot. 

* Cross out your traveler and draw it inside a slot at your destination.
* If you traveled over a claimed route (from someone else), the owner is **rewarded**. 
* Add **two balloons** to your inventory. You may, however, only pick types from routes that are connected to your destination.
* If the type you picked belongs to a claimed route (from someone else), the owner is **rewarded**.

If no free movement slot exists on a connected city, you cannot move anymore.

@TODO: IMAGE

{{% /rules/rules-block %}}

{{% rules/rules-block id="action_claim" heading="Claim" %}}

To claim a route, pay balloons from your inventory.

* They must be the same type as the route
* And you must pay equally many as the length of the route ( = number of spaces)

Cross out the balloons paid from your inventory. Draw your icon in all claimed spaces. (A route can only be claimed once.)

You can claim a route from _anywhere_---you don't need to be next to it. If you _are_ next to a route you just claimed, however, you are **rewarded**.

With **2 players**, double routes become single routes. Only one of them can be claimed.

{{% /rules/rules-block %}}

{{% /rules/rules-block %}}

{{% rules/rules-block id="scoring" heading="Scoring" class="force-page-break-before" icon="score" icontint="yellow" %}}

All points are permanent on the board. This means you don't need to track score while playing: just calculate it when the game is over.

You score points for claimed routes.

* 1 balloon = 1 point
* 2 balloons = 2 points
* 3 balloons = 3 points
* 4 balloons = 5 points
* 5 balloons = 7 points
* 6 balloons = 9 points

You'll also notice there are numbers in the empty space between routes. Those points are scored if that area is **completely enclosed by claimed routes**.

The points go to the player who participated the most: the majority of routes used (to enclose the area) are theirs. (If tied, this bonus goes to all who have the majority.)

@TODO: IMAGE EXAMPLE?

{{% /rules/rules-block %}}

{{% rules/rules-block id="expansions" heading="Expansions" class="force-page-break-before" icon="expansion" icontint="yellow" %}}

Once you've played the base game once or twice, you might be ready for expansions!

{{% rules/rules-block id="expansion_trajectories" heading="Trajectories" %}}

Trajectories are printed at the bottom right. If you've fulfilled one, draw your icon in an open slot and receive its reward. 

There are two trajectory types:

* **Cities**: fulfilled if you can travel from one city to the other using only _your_ routes. (You have "connected" the two cities with your traveling company!)
* **Routes**: fulfilled if you own routes of all the types shown (at least). Order and length doesn't matter.

{{% blocks/remark %}}
You can't claim a trajectory twice nor when all its slots are already taken.
{{% /blocks/remark %}}

@TODO: Rules table showing specific trajectory bonuses

When _swapping_, add a new inventory space. Then cross out the current balloon and draw the new one in the new space you just created. (A swap should not cost you any inventory space.)

{{% /rules/rules-block %}}

{{% rules/rules-block id="expansion_wildWinds" heading="Wild Winds" %}}

Introduces **gray routes**. You can use any one type to claim these. (For example, a gray route of 3 blocks can be claimed by 3 yellow.)

@TODO: IMAGE EXAMPLE

When picking balloons to receive, a gray route allows you to pick a "wildcard". Write a "W" in an inventory slot. This balloon can represent _any_ type when claiming a route. If you do this, however, you only receive 1 balloon this turn (regardless of other rules).

{{% /rules/rules-block %}}

{{% rules/rules-block id="expansion_multiroutes" heading="Multiroutes" %}}

Introduces **multiroutes**.

Each space of a multiroute is a different type. As such, during a **Claim** action, you only claim one space at a time. 

Anybody who participated scores _full_ points for this route, but only if it is _completed_. Similarly, anybody who participated can use it to complete trajectories _once completed_.

@TODO: IMAGE EXAMPLE?

{{% /rules/rules-block %}}

{{% rules/rules-block id="expansion_bonus" heading="Bonus Balloons" %}}

Some route blocks have an added bonus or penalty. You receive this bonus when you claim the route.

By default, the bonus immediately takes effect. Other bonuses are an **ability**: you can use this power once, at any time. Once used, cross out the bonus.

As opposed to trajectories, bonuses are always value "1". (One point, one balloon, etcetera.) 

@TODO: Rules table showing these bonuses

{{% /rules/rules-block %}}

{{% rules/rules-block id="expansion_variants" heading="Variants" %}}

Below are some variants that make the game more competitive and "cutthroat". Try any **one** of the rules below in a game.

When picking your two balloons (during "move") ...

* You must pick two different types (if possible).
* You can't pick the type over which you just moved.
* If you pick a type from a claimed route, and the owner doesn't _want_ to be rewarded, they can block you. You're simply not allowed to pick that type.

{{% /rules/rules-block %}}

{{% /rules/rules-block %}}




