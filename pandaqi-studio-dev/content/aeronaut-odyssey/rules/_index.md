---
type: "rules"
---

{{% rules-block id="setup" heading="Setup" icon="setup" icontint="pink" %}}

Print a game board. Cut off the player areas (or fold them away).

Each player ...

* Receives a player area. (Optional: cut these off and keep them secret.)
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

Pick a **destination**: a city connected to your traveler's current city, with a free movement slot. Skip over any cities with all slots filled.

* Cross out your traveler and draw it at your destination.
* Pick one of the types over which you just moved. You receive **two trains** of that type; draw them in your player area.
* If you traveled over a claimed route (from someone else), the owner is rewarded with one train of choice.

{{% remark %}}
Your area is full? You can't receive any more trains or do a "Move" action.
{{% /remark %}}

@TODO: IMAGE

{{% /rules-block %}}

{{% rules-block id="action_claim" heading="Claim" %}}

To claim a route, pay trains from your own area. They must be ...

* The same type as the route
* The same number as the length of the route ( = number of spaces)

Cross out the trains paid from your own area. Draw your icon in all claimed spaces. (A route can only be claimed once.)

Check the two cities of the route you just claimed. Any traveler currently there receives one train of the type you used.
{{% /rules-block %}}

{{% /rules-block %}}

{{% rules-block id="scoring" heading="Scoring" class="force-page-break-before" icon="score" icontint="yellow" %}}

All points are permanent on the board. This means you don't need to track score while playing: just calculate it when the game is over.

You score points for claimed routes.
* 1 train = 1 point
* 2 trains = 2 points
* 3 trains = 4 points
* 4 trains = 7 points
* 5 trains = 10 points

{{% /rules-block %}}

{{% rules-block id="solo_mode" heading="Solo & Duo Mode" class="force-page-break-before" %}}

With 2 players ("duo mode"), double routes become single routes. They can only be claimed once. Additionally, you have a bigger hand: use _two_ player areas (per player).

With 1 player ("solo mode"), play against a fake opponent. 

On their turn,
* Check if they can claim any route. If so, do it.
* Otherwise, they move from their current city to the destination with the lowest number.
* If you move over a route they claimed, they choose a train of the same type as the route.
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

{{% /rules-block %}}

{{% rules-block id="expansion_bonus" heading="Bonus Balloons" %}}

Some route blocks have an added bonus or penalty. You receive this bonus when you claim the route.

By default, the bonus immediately takes effect. Other bonuses are an **ability**: you can use this power once, at any time. Once used, cross out the bonus.

As opposed to trajectories, bonuses are always value "1". (One point, one balloon, etcetera.) 

When they have a red minus sign, however, their value is "-1". (You lose one point, you lose one balloon, etcetera.)

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

When you travel across a gray route, you can _choose_ which balloon types you want to receive!

{{% /rules-block %}}

{{% rules-block id="expansion_thieves" heading="Thieves & Spies" %}}

IDEA: You can steal trains from another player. You say a random number and get whatever is (or was?) inside that cell.

Related idea: if you lay the second route on a double, the original player steals the last card in your hand (or any card). Or you may steal. It’s just a great situation for stealing.

IDEA: A way to change the value of trajectories. (Like make them better just before completing them, or worse just before someone else does it.)

IDEA: Benefit from being in the same city as the player who just claimed some route?

Yes, leave this as an expansion. Because the idea of “stealing” needs a paragraph of explanation. (Say a number. What if nothing is there? How to prevent repeating the same number during the game, if that’s allowed?)

IDEA (could be its own expansion): Add secret objectives or powers to the player areas (expansion).

IDEA (could be its own expansion): Turn the train types ( = hot air balloons I guess) into characters or resources that each have their own unique effect?

{{% /rules-block %}}

{{% /rules-block %}}




