---
type: "rules"
---

{{% rules-block id="setup" heading="Setup" icon="setup" icontint="pink" %}}

Print a game board and hand out pens. Each player ...

* Receives an inventory. (Optional: cut these off and keep them secret.)
* Picks any drawable icon: you'll use that to represent yourself
* Draws that icon at a city of choice: that's your **traveler**.

{{% /rules-block %}}

{{% rules-block id="objective" heading="Objective" icon="objective" icontint="blue" %}}

The game ends when a player **can't take any action** on their turn. The player with the **highest score** wins.

{{% /rules-block %}}

{{% rules-block id="gameplay" heading="Gameplay" icon="action" class="force-page-break-before" icontint="lightblue" %}}

Take clockwise turns. On your turn, pick one action: **Move** or **Claim**.

{{< rules-example id="turn" >}}

{{% rules-block id="action_move" heading="Move" %}}

Pick a **destination**: a city connected to your traveler's current city, with a free movement slot. 

* Cross out your traveler and draw it inside a slot at your destination.
* You receive **two balloons**. You may, however, only pick types that are connected to your destination. (Draw them in your inventory.)
* If you traveled over a claimed route (from someone else), the owner is **rewarded**. In this rulebook, "rewarded" always means that somebody may pick one balloon of choice _or_ add one extra inventory space.

Other players may "profit" from your turn. They pick one of the balloon types you received and also receive that. You may, however, only "profit" _once per round_.

If no free movement slot exists, or your inventory is full, you cannot move anymore.

@TODO: IMAGE

{{% /rules-block %}}

{{% rules-block id="action_claim" heading="Claim" %}}

To claim a route, pay balloons from your inventory.

* They must be the same type as the route
* And you must pay the same _number_ of them as the length of the route ( = number of spaces)

Cross out the balloons paid from your inventory. Draw your icon in all claimed spaces. (A route can only be claimed once.)

You can claim a route from _anywhere_---you don't need to be next to it. If you _are_ next to a route you just claimed, however, you are **rewarded** (see previous section).

<!--- 
@NOTE: This rule is pretty useless, right? 
Check the two cities of the route you just claimed. Any traveler currently there receives one balloon of the type you used. --->
{{% /rules-block %}}

{{% /rules-block %}}

{{% rules-block id="scoring" heading="Scoring" class="force-page-break-before" icon="score" icontint="yellow" %}}

All points are permanent on the board. This means you don't need to track score while playing: just calculate it when the game is over.

You score points for claimed routes.

* 1 balloon = 1 point
* 2 balloons = 2 points
* 3 balloons = 4 points
* 4 balloons = 7 points
* 5 balloons = 10 points

{{% /rules-block %}}

{{% rules-block id="solo_mode" heading="Solo & Duo Mode" class="force-page-break-before" %}}

With 2 players ("duo mode"), double routes become single routes. They can only be claimed once. Additionally, you have a bigger hand: use _two_ inventories (per player).

With 1 player ("solo mode"), play against a fake opponent. 

On their turn,
* Check if they can claim any route. If so, do it.
* Otherwise, they move from their current city to the destination with the lowest number.
* If you move over a route they claimed, they choose a balloon of the same type as the route.
* Otherwise, whenever they have a choice, you decide.

{{% /rules-block %}}

{{% rules-block id="expansions" heading="Expansions" class="force-page-break-before" icon="expansion" icontint="yellow" %}}

Once you've played the base game once or twice, you might be ready for expansions!

{{% rules-block id="expansion_trajectories" heading="Trajectories" %}}

Trajectories are printed at the bottom right. If you've fulfilled one, draw your icon in an open slot and receive its reward. 

You've fulfilled a trajectory if you can travel from one city to the other using only _your_ routes. (You have "connected" the two cities with your traveling company!)

{{% remark %}}
You can't claim a trajectory twice nor when all its slots are already taken.
{{% /remark %}}

@TODO: Rules table showing specific trajectory bonuses

When _swapping_, cross out the current balloon and write the new type underneath it. A swap should not cost you any inventory space.

{{% /rules-block %}}

{{% rules-block id="expansion_bonus" heading="Bonus Balloons" %}}

Some route blocks have an added bonus or penalty. You receive this bonus when you claim the route.

By default, the bonus immediately takes effect. Other bonuses are an **ability**: you can use this power once, at any time. Once used, cross out the bonus.

As opposed to trajectories, bonuses are always value "1". (One point, one balloon, etcetera.) 

@TODO: Rules table showing these bonuses

{{% /rules-block %}}

{{% rules-block id="expansion_multiroutes" heading="Multiroutes" %}}

Introduces **multiroutes**.

Each space of a multiroute is a different type. As such, during a **Claim** action, you only claim one space at a time. 

Anybody who participated scores _full_ points for this route, but only if it is _completed_. Similarly, anybody who participated can use it to complete trajectories _once completed_.

@TODO: IMAGE EXAMPLE?

{{% /rules-block %}}

{{% rules-block id="expansion_wildWinds" heading="Wild Winds" %}}

Introduces **gray routes**. You can use any one type to claim these. (For example, a gray route of 3 blocks can be claimed by 3 yellow.)

@TODO: IMAGE EXAMPLE

When picking balloons to receive, a gray route allows you to pick a "wildcard". Write a "W" in an inventory slot. This balloon can represent _any_ type when claiming a route. If you do this, however, you only receive 1 balloon this turn (regardless of other rules).

{{% /rules-block %}}

{{% /rules-block %}}




