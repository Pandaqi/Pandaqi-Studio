---
type: "rules"
---

{{% rules-block heading="Setup" icon="setup" %}}

Create a deck with all **Role** dominoes. Shuffle and deal each player 1 Role. Once revealed, also give each player their corresponding **Starting Dominoes**. (It shows their role icon and unique terrain, and is marked "Starting Domino").

Start the **Shared Map** in the center of the table by combining the Starting Dominoes of all players.

All players also start their individual map by placing their second Starting Domino before them.

@TODO: EXAMPLE IMAGE

{{% /rules-block %}}

{{% rules-block heading="Objective" icon="objective" %}}

The game **ends** when one player is forced to **leave the empire**. All players score themselves, even the one who left. **Highest score wins!**

This game is a mix between cooperative and competitive by default. If you want to play fully _cooperatively_, check out that variant at the end.

{{% /rules-block %}}

{{% rules-block heading="Gameplay" icon="action" %}}

Play happens in rounds. Each round has three steps: DRAW, PLACE, and REPORT.

{{% rules-block heading="Draw" %}}

Draw 2 times as many dominoes as there are players (from the deck). Place them faceup in a row on the table. This is the **Domino Market** (for this round).

Each player also receives a new **Mission Domino**.

@TODO: IMAGE EXAMPLE

{{% /rules-block %}}

{{% rules-block heading="Claim" %}}

From start player, take clockwise turns until the Domino Market is empty.

On your turn, **pick 1 domino** (from the market) and **place it**.

* You may place it either in your individual map or the shared map.
* It must attach to the existing map (and not overlap). All maps have a maximum size of 8x8.
* On your individual map: paths must match, terrain does not.
* On the shared map: paths don't need to match, terrain must.
* Crucially, if an icon is present on a Role card, **only that player** may handle dominoes showing that icon.

Picking and placing a domino is _required_. You may only do nothing if you _can't_ use any of the remaining dominoes.

{{% /rules-block %}}

{{% rules-block heading="Report" %}}

Take turns in the order of the _role numbers_. (Low to high; every role has a unique number.)

First, you execute the **Report** action of your Role. This can give rewards or penalties depending on how well you did personally.

Every player checks if their **Mission Domino** is fulfilled. If not, they place the domino facedown before them.

> If a player has 3 facedown Goals ( = 3 failed rounds), they are disowned and must leave the family.

The strength you need to have (in certain areas) is always _dynamic_. It depends on the current state of the board, which allows missions to grow in difficulty as our map also grows. If a mission shows _the same icon_ multiple times, you must only satisfy the _highest number_ of those options. 

Some missions also give a reward for succeeding or penalty for failing.

{{% /rules-block %}}

{{% /rules-block %}}

{{% rules-block id="scoring" heading="Scoring & Pathing" icon="score" %}}

In this game, the _scores_ and _pathing_ of each Player's map are the most important parts. 

Why? Because only **Capital icons** actually do something. The other icons _modify_ what the Capital does if they're on a path connected to it.

The score of every player _is_ their Role's strength. For example, if the Brother of Warfare has a map that scores 8, then the current strength of your empire's military is 8.

Calculating your score has three steps.
* Find all your Capital icons (which will be your Role Icon + the Neutral Icon) on your individual map. Each of them is worth +1 by default.
* Check any paths attached to it. Icons on that path _modify_ the score of that icon, such as doubling it. Any Role icon on the path "stops" the path. (That is, if the path continues after it, imagine it's a brand new path starting from zero.)
* Finally, _multiply_ the score of your individual map by the size of your **Province** on the shared map.
  * Your Province is the group of tiles attached to your Starting Domino, with the same terrain.
  * You can grow it as well by building _paths_ to other patches on the shared map with this terrain.

{{% remark %}}
In a way, your individual maps are "zoomed-in" versions of your spot in the shared map.
{{% /remark %}}

FOR EXAMPLE: Say you are Brother of Warfare. 

* Your individual map has one Military icon: +1.
* You have two People modifiers connected to it: +3.
* Your province on the shared map has size 4: your score is now 3*4 = 12.
* As such, this round players have **a military strength of 12** at their disposal (for completing Goals or the Report phase)
  * If one player needs 6 to defend against a threat, and another needs 6 as well, then great! You have enough.
  * If they both need 8, though, you don't have enough to give them both. In those cases, _you_ decide who gets whatever you can give.

@TODO: EXAMPLE IMAGE

{{% /rules-block %}}

{{% rules-block heading="Variants & Expansions" icon="expansion" %}}

Played the base game and ready for more? Or want to tweak it a little to fit your group? Check out these variants and expansions!

{{% rules-block heading="Variant" %}}

**For a completely cooperative game:** most of the game stays the same. Only the following changes need to be made.

* Some mission cards have the **secret** symbol (@TODO: inline icon). This means the Mission must be kept _secret_. You may discuss and strategize together, but not outright communicate this exact Mission.
* You **lose** if the game ends before you were able to complete 4 Missions per player. (For example: in a 4-player game, you lose if someone leaves the empire before completing 16 missions in total.)
* Otherwise, you **win**. Your final score is the strength of the _weakest_ player; higher is obviously better.

**For an even more tactical game:** also count the shared map when determining your score/strength! The full formula becomes:
* Check your Role's Capital icons on both your individual and shared map.
* Multiply the _sum_ of that by your Province size, divided by 2.

**For a more chaotic game:** start your individual map _empty_. Your score can never go below 1. (So your strength, at the start of the game, is 1.)

{{% /rules-block %}}

{{% rules-block heading="Goblin Grandma" %}}

This expansion makes external threats (from Goblins) more immediate and powerful.

It introduces the **Corrupter Icon** (@TODO: INLINE ICON). This can be used by any player.

> All People icons attached to a Corrupter (via a path) become Goblins instead.

This number of Goblins is used in missions to scale their threat.

It also introduces missions with the **"Attack" penalty**. An Attack means the following.

* Find all **open-ended paths** in your map. (Paths that lead nowhere, pointing out of your map.)
* Goblins attack all those locations! Remove each domino which has one or more open-ended paths from your map.

@TODO: EXAMPLE IMAGE

{{% /rules-block %}}

{{% rules-block heading="Proximity Papa" %}}

This expansion adds more icons that can appear on tiles, all of which have "proximity" powers. That is, they change score or only do something depending on the icons/paths _around_ them or _close to them_.

This expansion also adds **Events**.
* During setup, create a deck of all Event dominoes. Shuffle and place facedown.
* At the start of each round, reveal the top Event. It has a power or rules change that applies to this entire round.

{{% /rules-block %}}

{{% rules-block heading="Directional Daddy" %}}

* Paths now get arrows (sometimes), and you may only count the path insofar as it consistently points TO the icon
* Threats from outside (goblins?) can now have a direction, such as "we hit from the LEFT side of the shared map" or something?

{{% /rules-block %}}

{{% rules-block heading="Machine Mama" %}}

This is about connecting paths/"engines" between players.

> You can only give/receive stuff from players if there's a path between THEIR ICON and YOUR ICON on the shared map.

> You can "lend" your power to another player to whom you're connected _once_ per round. (That is, they can handle your icon and/or execute your Report power too.)

IDEAS:

* Anything your individual map can provide, goes to _your area_ only (by default). Others need to build paths to you.
* You actually make BINDING agreements? => All players get some dominoes for their role, and they can give them out/exchange them like "a favor for a favor". And you can cash in that favor at any later moment.
* The general idea of THREATS and GOALS (from dominoes drawn) seems too useful to ignore. Why?
  * It gives players a reason to help _another player/role_ grow (on the shared map), because they need it to be strong to weather a storm or meet a goal.



{{% /rules-block %}}

{{% /rules-block %}}

