---
type: "rules"
---

## Setup

{{<  rules-image-sidebar src="setup.webp" alt="Example of how to setup a new game." >}}

Create a deck of **Tenant Tiles** and one for **Room Tiles**.

Draw 6 Tenants from the deck and place them faceup on the table: those are your **Guests**.

Draw 6 room tiles from the deck and also place them faceup on the table: that is your **Market**.

Pick anyone to be start player.



## Objective

The game **ends** as soon as either the Tenant Deck or Room Deck is **empty**. Players sum the value of all Tenants they have (and any special tiles that tell you they score points). **Highest score wins!**


## Gameplay

Gameplay happens in _rounds_. Each round, players take clockwise **Turns**. Once done, execute one **Attract** Phase.

### Turn

On your turn, grab **1 domino** from the Market, and place it in your map.

The placement rules are simple.

* It needs to connect to an existing domino and can't overlap.
* **Floors need to match**. (Unless there's a wall/door between them.)
* You can't connect a door and a wall.

You may also _destroy_ as much of your personal map as you want, as long as your map is _connected_ (no loose parts) by the end of your turn. The destroyed tiles are discarded permanently. This is called **Construction** and can have consequences.

{{< rules/rules-image src="gameplay_turn.webp" alt="Example of how to take a turn: pick a domino from market and place it in your personal map." >}}


### Attract

First, determine what floor every player is on.

* Players count how many **floor icons** they have.
* Then sort players based on that, low to high. (The player who has the least such icons is the _first_ floor, the next player is the _second floor_, etcetera.)
* Ties are allowed: those players are simply all on the same floor. If so, they take turns in clockwise order, from start player.

{{< rules/rules-image src="gameplay_attract.webp" alt="Example of how to sort players and then attract Tenants (if you fulfill their wishes)." >}}

Now, in that order, players **attract a Tenant**.

* Pick 1 Tenant from the Guests.
* You may only pick Tenants of whom you fulfill their [wishes](#guests) (see next section).
* Crucially, when fulfilling wishes, you **also** count the dominoes of other players to whom you're "connected" as your own. 
* Place the Tenant somewhere near your map.

By default, you are connected to everyone _on the same floor as you_. Special icons (such as the elevator) can change this.

Once done, refill the Guests and the Market, and play the next round.



## Guests & Wishes

{{<  rules-image-sidebar src="guests_wishes.webp" alt="Example of what every part of a Guest tile means." >}}

Guests have two sides: one side shows their SCORE (on the star icon), the other their WISHES. 

Their wish icons follow a few simple rules.

* Most wishes are regular icons also present on tiles. You must have **at least one** of that object in your map.
* If there's a **number** as well, it means you need to have at least **that many** of the object.
* A **red cross** means it's inverted: you should **not** have that object. (Thus, if there's a number, it means you must have strictly **fewer** of the object than the number.)


{{% rules/rules-remark %}}
If you want, you can fold the Tenants down the middle so they become actual pawns you can place.
{{% /rules/rules-remark %}}


## Upgrades

Played the base game and ready for more? Or want to tweak it a little to fit your group? Check out these variants and expansions!

All the expansions add a third type of wall: **windows**. Their rule is simple: nothing can be placed at the other side of a window. (Windows must be at the "outside" of the building.)

The expansions also talk about Tenants **"leaving"**. This simply means that they go to another player. 

Leaving Tenants are always "cheatable". This means that it's up to the player who _receives_ the Tenant to check if they go to them, and say so. The current owner of that Tenant can "forget" it if nobody else catches it.

{{% rules/rules-remark %}}
If multiple players are valid targets, you _choose_ to which one the leaving Tenant goes.
{{% /rules/rules-remark %}}

### Room Service

{{<  rules-image-sidebar src="expansion_room_service.webp" alt="Example of what a Room is and how Construction works." >}}

From now on, it becomes important to create **Rooms**.

> A "room" is any enclosed space (walls on all sides) with at least one door.

This expansion adds a property to some Tenants: **Construction**. If this icon shows (next to their star), 


* You **can't** attract this Tenant if you did Construction this turn. 
* Additionally, they will **leave** if you do Construction during your turn. 
* If you share a floor with multiple players, it must leave to one of them.

Guests can now have **Special Wishes** (that relate to Rooms). The table below explains what each icon means.

<div data-rulebook-table="roomService-wishes"></div>

There are also some new **Objects** that can appear.

<div data-rulebook-table="roomService-objects"></div>


### Wallet Watchers

{{<  rules-image-sidebar src="expansion_wallet_watchers.webp" alt="Example of the Wallet property and calculating your apartment Price." >}}

This expansion adds another property to some Tenants: **Wallet**. If this icon shows, 

* They can only be attracted if they can actually pay to live with you.
* Their score = the maximum price they're willing to pay.
* The current price of your map is the _smaller_ of these two numbers: your LARGEST ROOM or the number of UNIQUE ICONS.


If you're in for a challenge, also add this _optional_ rule.

* Whenever you Attract a new Tenant, they will **leave** if you have the wrong price now.
* This Tenant goes to whoever has a price they can pay.
* If none exist, they are simply discarded.

At the **end of the game**, the final **price** of your map is ADDED to your total score.

Finally, this expansion also adds a few more Special Wishes and Objects. (If you choose "text on tiles", which is the default, the way an Object works is simply written on the tile itself.)

<div data-rulebook-table="walletWatchers-wishes"></div>

<div data-rulebook-table="walletWatchers-objects"></div>


### Useful Utilities

{{< rules/rules-image-sidebar src="expansion_utilities.webp" alt="Example of how to access and provide Utility wishes." >}}

This expansion adds some basic **utilities**: Power ("electricity"), Water and Wi-Fi ("internet").

How do you get them?


* Special "generator" icons appear on the dominoes.
* If you place such a generator in your map, you get the utility _if_ you have "Access" to it.
* You have Access if a player on the floor _below you_ has the utility. (In a sense, the wires/pipes go _up_ through the building.)
* If there's no player below you---you're the lowest floor---then you always have Access to it.

From now on, guests will **wish** for these things. See the added Special Wishes (and Objects) below.

<div data-rulebook-table="usefulUtilities-wishes"></div>

<div data-rulebook-table="usefulUtilities-objects"></div>


### Happy Housing

{{<  rules-image-sidebar src="expansion_happy_housing.webp" alt="Example of the Wandering property." >}}

This expansion adds some more Special Wishes and Objects (again).

It also adds a new property: **Wandering**. If a Tenant shows this icon,

* You can attract it by satisfying just _one_ of its wishes.
* Whenever you Attract a new Tenant, however, they can **leave**. If another player satisfies _ALL their wishes_ now, they go to them.


As usual, this expansion adds some special Wishes and Objects too.

<div data-rulebook-table="happyHousing-wishes"></div>

<div data-rulebook-table="happyHousing-objects"></div>


### Living Together

This expansion makes it possible (or simply more fun and challenging) to play the game completely _cooperatively_.

You'll be working together to achieve goals for your entire skyscraper, for which you're rewarded with unique tiles and objects to place in your map. But you'll also be threatened, such as by quality inspection, and you must collectively pass these checks.

{{< rules/rules-image src="expansion_living_together.webp" alt="Example of how to play the cooperative variant (in general)." >}}

During **setup**, create two decks: **Goal Dominoes** and **Threat Dominoes**. Remove any dominoes from a set that you're _not_ using this game.

Keep three faceup Goal Dominoes at all times, and one faceup Threat domino (drawn from these decks). 

Also deal every player their own **Goal Domino**. It is not allowed to communicate your personal (secret) goal in any way. Your actions and choices will have to reveal it to the others.

During **gameplay**,

* Whenever a goal is achieved, give that domino to a player. They now place it in their map and get its reward. (This domino is considered as having "all floor types" and "no walls", allowing you to place it anywhere.)
* Whenever a threat is not defended, place the card faceup on the table. If it has a penalty, it triggers now. **If you have 3 failed threats, you lose immediately.**

During the Attract Phase, check whether goals are achieved or threats not defended. Unachieved goals simply stay where they are. Defended threats are discarded and replaced by a new one from the deck.

Unless stated otherwise, goals refer to a _single floor_. (If it's your secret personal goal, then it obviously refers to _your personal map_ only.)

When the **game is over**, you win if all personal goals have been reached. Your score is the combined score of all the individual maps---higher is better!



