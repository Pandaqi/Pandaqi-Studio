---
type: "rules"
---

## Setup

Print a world map from the website. Each player invents a unique icon: you'll use this to draw where your armies are.

Take clockwise turns placing **1** army in any free space, until everybody has **2** armies in total.

{{% rules/rules-remark %}}
A free space has nothing inside: no artefact, no obstacle, no other army.
{{% /rules/rules-remark %}}

All land spaces can be used. Ocean spaces, however, can only be used if highlighted.

Areas can contain any number of icons from any number of players! The "current owner" of an area, however, is the one who has the **majority**. In case of a tie, it's the player who holds the most artefacts. If that's also a tie, nobody owns the area.

@TODO: IMAGE EXAMPLE
* Clearly label continent, area, region, artefact, available ocean space
* Show unique icon being drawn inside squares
* Show majority rule => who "owns" what areas after some setup

## Objective

The game ends once all army slots have been used. The player who **owns the most areas** (at that moment) **wins**. Ties are broken by most individual armies.

## Gameplay

Take clockwise turns. Each turn has the same three steps: **Move**, **Battle** and **Debrief**. All of these are _optional_.

{{< rules/rules-example id="turn" >}}

### Move

Move an army of yours into another free space. Cross out the old one, draw it again at the new location. You can repeat this as often as you like, but each individual army can only move once per turn.

@TODO: IMAGE EXAMPLE

### Battle

Start a battle against another player. This can be within an area you occupy _or_ against an adjacent area.

Both sides of the conflict ...

* Go clockwise around the table, asking any player who is also inside the contested area ...
  * If they _support_ the battle. If so, their number of armies is added to the total.
  * If they want to use an _artefact_. If they do, execute its power, then cross it out (it can never be used again).
* Until they arrive at the number that represents their final strength.

{{% rules/rules-remark %}}
You can discuss, promise, negotiate all you want. But when the battle has started, and you ask people what they want to do (join and/or use artefact) ... they're free to break promises and do anything they want.
{{% /rules/rules-remark %}}

The losing side---the lowest number---is _wiped out_. Cross out all their armies (in that area).

The winning side loses as many armies as the _difference_ between these numbers. Distribute these losses fairly across everyone who contributed, rounded down. Any losses that simply can't be taken by someone, must be suffered by the current owner of the area.

@TODO: IMAGE EXAMPLE
* A fights player B within the same territory.
* A asks around and gets support from C, bringing their total to 10 armies.
* B has no support and has 5 armies.
* A and C win, B is wiped out. They difference is 10 - 5 = 5 armies. So, A loses 2 armies and C loses 2 armies.

All winners receive **1 free army** to place in one of the areas involved _or_ an adjacent one.

If this _completely_ wipes out a player, they simply come back following the same rules as the setup. (Place 2 new armies in any free spaces.)

### Debrief

Count how many areas you own. That is, you are currently the _majority_. Also count bonus armies if you control an entire _continent_. 

Now place that many new armies, in areas you already occupy _or_ adjacent areas that are unoccupied.

## Artefacts

There are two types. 

* **Area Powers**: these can only be activated by the current owner of that area. (As such, they can change hands and don't belong to anyone until used.)
* **Artefacts**: these are simply _spaces_ that can be visited. They are, thus, owned by the first visitor forever. (If that army is destroyed, the artefact is destroyed with it. Some artefacts have some "curse" or "effect" upon destruction.)

These powerups are how I want to make "destroyed" slots relevant. Examples are ... 

* "Army of the Dead": all destroyed armies in your area belong to _you_ now (in this battle).
* "Shield of Ruin": you can only battle in this area if the number of armies used is greater/smaller than the number of destroyed armies.
* "Path to the Underworld": all armies that are adjacent to a _destroyed_ slot, may flee the battle before it begins. (Next to any other destroyed square in an adjacent area.) 

@TODO: RULES TABLE, IMAGE EXAMPLE