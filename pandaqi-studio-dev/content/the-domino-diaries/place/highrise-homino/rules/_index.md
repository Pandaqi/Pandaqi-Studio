---
type: "rules"
---

{{% rules-block heading="Setup" icon="setup" %}}

Create a deck of **Tenant Tiles** and one for **Room Tiles**.

Draw 6 tenants from the deck and place them faceup on the table: those are your **Guests**.

Draw 6 room tiles from the deck and also place them faceup on the table: that is your **Market**.

@TODO: EXAMPLE IMAGE

{{% /rules-block %}}

{{% rules-block heading="Objective" icon="objective" %}}

The game **ends** as soon as either the Tenant Deck or Room Deck is **empty**. Players sum the value of all Tenants they have (and any special tiles that tell you they score points). **Highest score wins!**

{{% /rules-block %}}

{{% rules-block heading="Gameplay" icon="action" %}}

Gameplay happens in _rounds_. Each round, players take clockwise **Turns**. Once done, execute one **Attract** Phase.

{{% rules-block heading="Turn" %}}

On your turn, grab 1 domino from the Market, and place it in your map.

The placement rules are simple.

* It needs to connect to an existing domino and can't overlap.
* Floors need to match (unless there's a wall/door between them).
* You can't connect a door and a wall.

You may also _destroy_ as much of your personal map as you want, as long as your map is _connected_ (no loose parts) by the end of your turn. The destroyed tiles are discarded permanently. This is called **Construction Work** and can have other consequences (such as guests leaving).

See [Objects](#objects) for details about what every icon on a domino means.

@TODO: EXAMPLE IMAGE

{{% /rules-block %}}

{{% rules-block heading="Attract" %}}

First, determine what floor every player is on.

* Players count how many **floor icons** (@TODO: INLINE ICON?) they have.
* Then sort players based on that, low to high. (The player who has the least such icons is the _first_ floor, the next player is the _second floor_, etcetera.)
* Ties are allowed: those players are simply all on the same floor of the building.

Now, in that order, players **attract a Tenant**.

* Pick 1 Tenant from the Guests.
* You may only pick Tenants of whom you fulfill their [wishes](#guests).
* Crucially, when fulfilling wishes, you **also** count the dominoes of other players to whom you're "connected" as your own. By default, you are connected to everyone _on the same floor as you_. Special icons (such as the elevator) can change this.
* Place the tenant somewhere on your map.

Once done, refill the Guests and the Market, and play the next round.

@TODO: EXAMPLE IMAGE

{{% /rules-block %}}

{{% /rules-block %}}

{{% rules-block id="objects" heading="Objects" icon="score" %}}

In the base game, there are only a few objects with a special power. (All other objects are useful for attracting guests, but otherwise do nothing special.)

@TODO: RULES TABLE

The expansions add far more objects with special powers. If you enabled the "add text" option (which is the default), these explanations will just be printed on the tiles and they explain themselves.

{{% /rules-block %}}

{{% rules-block id="guests" heading="Guests & Wishes" icon="score" %}}

Guests have two sides: one side shows their SCORE (on the star icon), the other their WISHES. 

{{% remark %}}
If you want, you can fold the tenants down the middle so they become actual pawns you can place.
{{% /remark %}}

Their wish icons follow a few simple rules.

* Most wishes are regular icons you'd also see on the tiles. You must have _at least one_ of that object somewhere in your map (to attract that tenant).
* If there's a number as well, it means you need to have at least _that many_ of the object. (The number is left out if it's simply 1.)
* A red cross through a wish means it's inverted: you should _not_ have that object. (If there's a number, it means you must have strictly FEWER of the object than the number.)

@TODO: EXAMPLE IMAGE

{{% /rules-block %}}

{{% rules-block heading="Variants & Expansions" icon="expansion" %}}

Played the base game and ready for more? Or want to tweak it a little to fit your group? Check out these variants and expansions!

It's recommended to try the expansions once you understand the base game, and to try them in the order listed.

All the expansions add a third type of wall: **windows**. Their rule is simple: nothing can be placed at the other side of a window. (Windows must be at the "outside" of the building.)

The expansions also talk about tenants **"leaving"**. This simply means that they go to another player to whom you're connected. (If you're connected to multiple players, you _choose_ to which one the leaving tenant goes.)

{{% rules-block id="roomService" heading="Room Service" %}}

From now on, it becomes important to create **Rooms**.

> A "room" is any enclosed space (walls on all sides) with at least one door.

Why? Because guests can now have **Special Wishes**. The table below explains what each icon means.

@TODO: RULES TABLE

Finally, this expansion adds a property to some tenants: **Construction**. If this icon shows (next to their star), 

* You can't attract this tenant if you did Construction this turn. 
* Additionally, they will _leave_ if you do Construction during your turn.

{{% /rules-block %}}

{{% rules-block id="walletWatchers" heading="Wallet Watchers" %}}

This expansion adds another property to some tenants: **Wallet**. If this icon shows, 

* They can only be attracted if they can actually pay to live with you.
* Their score = the maximum price they're willing to pay.
* The current price of your map is the _smaller_ of these two numbers: your LARGEST ROOM or the number of UNIQUE ICONS.
* During the Attract Phase, they will re-check their price requirements. If you have the wrong price now, this Tenant _leaves_.

At the **end of the game**, the final **price** of your map is ADDED to your total score.

Finally, this expansion also adds a few more Special Wishes.

@TODO: RULES TABLE

{{% /rules-block %}}

{{% rules-block id="usefulUtilities" heading="Useful Utilities" %}}

This expansion adds some basic utilities: Power ("electricity"), Water and Wi-Fi ("internet").

From now on, guests will _wish_ for these things. See the added Special Wishes below.

@TODO: RULES TABLE

How do you get it?

* Special "generator" icons appear on the dominoes.
* If you place such a generator in your map, you get the utility _if_ you have "access" to it.
* You have access if a player on the floor _below you_ has the utility. (In a sense, the wires/pipes go _up_ through the building and you must connect to the network below you.)
* If there is no player below you---that is, you are the lowest floor---then you always have access to it.

@TODO: the generator icons => I need a list with all the added TILES/OBJECTS anyway for each expansion too ...

{{% /rules-block %}}

{{% rules-block id="happyHousing" heading="Happy Housing" %}}

This expansion adds some more Special Wishes and Objects (again).

@TODO: RULES TABLE(S)

It also adds a new property: **Wandering** (@TODO: Inline Icon). If a tenant shows this icon,

* You can attract it by satisfying just _one_ of its wishes.
* Every Attract Phase, however, you must check this tenant again. If a player connected to you satisfies _all its wishes_, it _leaves_ and goes to them.

{{% /rules-block %}}

{{% rules-block id="livingTogether" heading="Living Together" %}}

This expansion makes it possible (or simply more fun and challenging) to play the game completely _cooperatively_.

You'll be working together to achieve goals for your entire skyscraper, for which you're rewarded with unique tiles and objects to place in your map. But you'll also be threatened, such as by quality inspection, and you must collectively pass these checks.

During **setup**, create two decks: **Goal Dominoes** and **Threat Dominoes**. Remove any dominoes from a set that you're _not_ using this game.

Keep three faceup Goal Dominoes at all times, and one faceup Threat domino (drawn from these decks). 

Also deal every player their own **Goal Domino**. It is not allowed to communicate your personal (secret) goal in any way. Your actions and choices will have to reveal it to the others.

During **gameplay**,

* Whenever a goal is achieved, give that domino to a player. They now place it in their map and get its reward. (This domino is considered as having "all floor types" and "no walls", allowing you to place it anywhere.)
* Whenever a threat is not defended, place the card faceup on the table. If it has a penalty, it triggers now. **If you have 3 failed threats, you lose immediately.**

During the Attract Phase, check whether goals are achieved or threats not defended. Unachieved goals simply stay where they are. Defended threats are discarded and replaced by a new one from the deck.

Unless stated otherwise, goals refer to a _single floor_. (If it's your secret personal goal, then it obviously refers to _your personal map_ only.)

When the **game is over**, you win if all personal goals have been reached. Your score is the combined score of all the individual maps---higher is better!

{{% /rules-block %}}

{{% /rules-block %}}

