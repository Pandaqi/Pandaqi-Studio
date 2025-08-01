---
type: "rules"
---

## Setup

{{<  rules-image-sidebar src="setup.webp" alt="Example of how to setup a new game." >}}

For each Animal in the game, place its **Passport** on the table. It contains details about each animal. Don't worry, most of it **isn't used** in the _base game_.

Place the **Entrance Tile** in the center of the table. 

Shuffle the deck and hand each player **5 Tiles**. Each player also picks a color and receives all its **Pawns**.

Finally, place 5 Tiles faceup next to the deck: this is the **market**.



## Objective

As soon as only **1 player remains who has Pawns**, that player takes the final turn of the game. 

Otherwise, the game ends immediately as soon as the **market is empty** (and can't be refilled).

Everyone scores their claimed Exhibits. **Highest score wins!**


## Gameplay

From start player, take clockwise turns until done. 

Each turn has three simple steps (in this order): PLAY, CLAIM, DRAW.

First, two definitions.
* An **Area** is any group of connected tiles of the same terrain. (Paths are not terrain.)
* An **Exhibit** is a (smallest) group of connected Areas that is completely **enclosed** (fences on all sides). For the base game, just treat both fence types the same.

{{% rules/rules-remark %}}
Yes, a single Exhibit can contain different terrains, animals, players, or even empty tiles and paths.
{{% /rules/rules-remark %}}

### Play

Place **1 or 2 dominoes**. If you can't place anything, put 2 dominoes from your hand back into the deck (randomly).

{{< rules/rules-image src="gameplay_play.webp" alt="Example of how to play (valid) dominoes on your turn: 1 or 2, top or bottom, put animals on preferred terrain." >}}

Dominoes come in two flavors. If one part of the domino has _no background_ ( = no terrain), it's a "TOP" tile. Otherwise, it's a "BOTTOM" tile.

* BOTTOM: Must be placed adjacent to the current map. It **can't** overlap an existing domino.
* TOP: **Must overlap** an existing domino. Can't overlap spaces with a Pawn.

Once a space is overlapped, whatever is underneath is forgotten. You should _never_ have to lift a domino to see below it.

Only two placement rules apply.

* When placing animals, they must be placed on one of their **preferred terrains** (see their Passport).
* Once an Area is claimed by a player, **only they** are allowed to overlap it (and thus change some part of it).


### Claim

{{<  rules-image-sidebar src="gameplay_claim.webp" alt="Example of how claim an Area." >}}

You **may** claim an Area by placing your Pawn on it. Each Area can only be claimed once.

Empty spaces and paths are **not** Areas.



### Draw

Finally, draw tiles from the market until your hand is full again. Refill the market from the deck as needed.



## Scoring

At the end of the game, each player scores the Exhibits they claimed.

* Determine the most common Terrain (inside this Exhibit) and count how many spaces it fills.
* Count the number of animals (inside this Exhibit).
* **Exhibit Score = #Spaces x #Animals**

Your score is _doubled_ if all animals inside the Exhibit are of the same type.

{{< rules/rules-image src="gameplay_scoring.webp" alt="Example of how to calculate the score of an Exhibit: largest area times animals times modifier." >}}


## Upgrades

Played the base game and ready for more? Or want to tweak it a little to fit your group? Check out these variants and expansions!

It's highly recommended to add the "Feeding" upgrade as soon as possible. It was left out of the base game merely to keep your first game as simple as possible.

### Variants

**Want a harder game?** Add this rule: "You _must_ place 2 dominoes on your turn, and they must be separated from each other."

**Want a more competitive game?** Change how exhibits score. Instead of counting the _most common terrain_, you simply count the size of _your (claimed) Area only_. Yes, this means different players get different points for the same Exhibit.


### Upgrade: Feeding

This is an "upgrade" to the base game that requires no extra material. It uses those "food" icons that are on many tiles.

Whenever someone **finishes an Exhibit**, a **Feed Phase** triggers.

{{< rules/rules-image src="gameplay_feed.webp" alt="Example of how to trigger and resolve a Feeding Phase." >}}

* Check all **claimed Exhibits** that contain at least one animal. Its owner(s) must feed the animals inside! (The exhibit that triggered the Feed Phase is excluded from this.)
* You do so by **discarding** a domino that shows Food from inside the Exhibit. (You always discard only 1 food, regardless of how many animals there are.)
* If you **can't** feed them, **discard** the domino showing the **most animals** inside the Exhibit. If none available, discard the one with the **most terrains**.

If this Exhibit has multiple players inside, they discuss what to do. In the end, though, the player closest to the one who triggered the Feed Phase has the final say.


### Zooperative

This expansion allows playing the game completely **cooperatively**. You win or lose together.

It also allows playing a **campaign**: multiple games in a row, each one slightly harder. The campaign starts at level 1 and ends at level 8. (You can go further if you want, but it becomes practically unwinnable.)

During **setup**, draw as many **Campaign Cards** as the level you've chosen. Only pick from cards that belong to your current level (or lower). Place them faceup on the table: they give you your mission(s) for this game.

During **gameplay**, simply keep your hand tiles open. Players still take _turns_, though, and you still have final say over what you do.

How do **Campaign Cards** work? They always have a Win condition. Sometimes, they also have a special rule that's true for the entire game.

> **Win:** if at the end of any turn, this condition is true, remove this card.

You instantly win the game when there are no "Win" Campaign Cards left.

On higher levels, more conditions are possible.

> **Endgame:** by the end of the _game_, you only win if this condition is true. 

>**Replace:** if at the end of any turn, this condition is true, replace it with a new Campaign Card. Put the original card to the side. You can't win while there are "Replace" cards left.

{{% rules/rules-remark %}}
Yes, if at least one Endgame is present, you'll have to play the entire game until the end.
{{% /rules/rules-remark %}}


### Strong Species

{{<  rules-image-sidebar src="expansion_strong.webp" alt="Example of what Strong fences mean." >}}

This expansion adds a few more animals and a new terrain.

It uses a new detail from the Animal Passport: **strong**.

> All animals that are **strong** can only be enclosed by _strong fences_. The regular fence simply does nothing for an area that contains a strong animal.



### Wildlife Wishes

{{<  rules-image-sidebar src="expansion_wildlife.webp" alt="Example of the new Wildlife rules in action." >}}

This expansion adds a few more animals, a new terrain, and **objects** (such as toys for the animals).

It also uses a few more details from the Animal Passport:

* You **can't** mix Herbivores and Carnivores within the same Area or Exhibit.
* You **can't** mix Solitary and Social animals in the same Area or Exhibit.
* An Area that contains only Social animals can be claimed by infinitely many players.

Below is a list of all objects.

<div data-rulebook-table="objects"></div>

### Unnatural Utilities

{{<  rules-image-sidebar src="expansion_utilities.webp" alt="Example of how to calculate food requirements following the new rule." >}}

This expansion adds a few more animals, a new terrain, and **stalls** (or "utilities"). These modify their surroundings in some way.

The amount of **food** you must pay during the "Feed Phase" changes. 

* Sum the **food** requirements of all animals inside.
* Divide by 4; round down.
* That's how many Food icons must be discarded for this Exhibit.

It also enables **animal powers**. 

* Some animals have a power written on their passport. By default, the power triggers once, at the moment this animal is _played_.
* (If it triggers at some other moment, this is stated.)
* These powers are only **activated** once a **Research Lab** has been played. (Before that moment, ignore powers entirely.)

Finally, it adds **Extinct Animals** (a stamp on their Passport). You **can't play** an extinct animal until a Research Lab has been played.

Below is a list of all the stalls.

<div data-rulebook-table="stalls"></div>
