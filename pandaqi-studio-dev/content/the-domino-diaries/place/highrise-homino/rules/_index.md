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

The game ends as soon as either the Tenant or Room deck is empty. Players sum the value of all Tenants they have

{{% /rules-block %}}

{{% rules-block heading="Gameplay" icon="action" %}}

Gameplay happens in _rounds_. Each round, players take clockwise Turns. Once done, execute on Attract Phase.

{{% rules-block heading="Turn" %}}

On your turn, grab 1 domino from the Market, and place it in your map.

The placement rules are simple.

* It needs to connect to an existing domino and can't overlap.
* Walls need to match. Floors also need to match, unless there's a wall between them.

You may also _destroy_ as much of your personal map as you want, as long as your map is _connected_ (no loose parts) by the end of your turn. The destroyed tiles are discarded permanently. This is called **Construction Work** and can have other consequences (such as guests leaving).

See [Tiles](#tiles) for details about what every icon or tile type means.

{{% /rules-block %}}

{{% rules-block heading="Attract" %}}

First, determine what floor every player is on.

* Players count how many **floor icons** (@TODO: INLINE ICON?) they have.
* Then sort players based on that, low to high. (The player who has the least such icons is the _first_ floor, the next player is the _second floor_, etcetera.)
* Ties are allowed: those players are simply all on the same floor of the building.

Now, in that order, players **attract a Tenant**.

* Pick 1 Tenant from the Guests.
* You may only pick Tenants of whom you fulfill their [requirements](#guests).
* Crucially, when fulfilling requirements, you can also count the dominoes of other players to whom you're "connected". By default, you are connected to everyone _on the same floor as you_.
* Place the tenant somewhere on your map.

Once done, refill the Guests market, and play the next round.

{{% /rules-block %}}

{{% /rules-block %}}

{{% rules-block id="tiles" heading="Tiles" icon="score" %}}

Below is a list of the different tiles that might appear.

* **Staircase (up/down)**: you are now connected to the first player(s) below/above you.
* **Elevator**: you are now connected to everyone else that has an elevator.
* **Sofa**: ??
* **Bed**: ??
* **Toilet**: ??
* **Pool**: ??
* **Bar**: ??
* **Game Room**: ??

(These tiles are part of Guest wishes. But they also often provide score benefits or modifiers on their own.)

{{% /rules-block %}}

{{% rules-block id="guests" heading="Guests & Requirements" icon="score" %}}

Guests have two sides: one side shows their PROPERTIES, the other their WISHES/REQUIREMENTS. (If you want, you can fold the tenants down the middle so they become actual pawns you can place. But this is not required, of course.)


Guests can have certain _properties_:

* **Value**: how much they score at the end. => Can I make this DYNAMIC in some expansions, such as "I am worth the number of toilets you have"
* **Price**: the maximum price they're willing to pay. => @TODO: Provide an easy way to attach a price to your entire map
* **Construction**: you can't attract them if you did Construction this turn. Additionally, they will leave if you do Construction during your turn.


Below is a list of the different wishes a guest might have.

* **Size**: you need to have at least this much space ( = this many dominoes/rectangles/living space)
* **Floor**: you must be at least on this floor to attract them. (Probably too difficult to make them wander, seeing how often floors change.)
* **Tenants**: you need to have at most this many tenants
* **Rooms**: you need to have at least this many rooms
* **Utilities/Items**: you need to have this utility/item. (Sometimes there's a number next to it that says how many times you need to have the utility)
* **Floor Type**: you need at least a room with this floor. (Also Walls/Windows?) => Maybe FLOOR TYPE is the general background for each Tenant?





@TODO: EXAMPLE IMAGE

{{% /rules-block %}}

{{% rules-block heading="Variants & Expansions" icon="expansion" %}}

Played the base game and ready for more? Or want to tweak it a little to fit your group? Check out these variants and expansions!

@IDEA (for cooperative play, mostly): a SHARED responsibility for the entire building.
* **YES! IDEA!** These are also simply dominoes, but they're really special ones. 
  * For example, a "power generator" domino. It can only be placed if a very specific requirement is met. Once placed, though, it provides power to the _entire building_.
  * Similarly, a "janitor" domino. Once placed, the entire building becomes cleaner, which helps pass certain checks. => Maybe your final building only wins if you have "4 star cleanliness = 4 janitors"
* Maybe general goal cards that you need to meet before the game is over.
* More general actions/tenants that do sweeping changes across the entire building. For example:

MY PRETTY CLEAN APPROACH (from the devlog):
* During the game, you draw dominoes with goals and threats.
  * Such as "_all_ tenants find a place this round" or "the entire building needs 3 pools by the end of the game"
  * Or "an inspector is coming, make sure there is no mess in the entire building or the game ends"
  * Or "every player needs a room with a wooden floor" or "every player needs a room of at least size 6"
* These dominoes also provide _rewards_ if completed, which always aid _cooperative play_. For example, if you meet a challenge, the domino might grant someone the power to move 1 Tenant freely each round. Or that domino might hold a "power generator" that can power the entire building.
* **QUESTION:** Can I then REUSE this system in competitive play too? The first to fulfill the current goal / fail to the current threat gets the reward / penalty.



@IDEA: Obviously, Tenants can also NOT want something, in which case there's a red cross through the icon

@IDEA: Interacting Tenants? "For every tenant of type X that also lives on this floor, I am worth -1."


@IDEA: Special Offers =>
* Any remaining one-time, really special ideas for items on dominoes that I have. 
* Which combines with ...
* IDEA: WANDERING TENANTS: These can be attracted again _every attract phase_. However, once they are on a floor (attracted by _someone_ already), you use their second set of requirements / their requirements for moving DOUBLE. => And then maybe some special one-time tile/event that can attract tenants anyway

@IDEA: Rooms =>
* A "room" is any enclosed space (walls on all sides) with at least one door.
* GUESTS require certain #rooms, type rooms, etcetera.
* Some items only work (or not) inside certain finished rooms.

@IDEA: Price =>
* Introduces the idea of things having a price and guests having a min/max they can pay. => THIS PRICE = THE SCORE
  * That means calculating your apartment's price should be easy and lead to _low numbers_.
  * But this only applies to those who have the "WALLET" property showing. Others don't care about price, otherwise it's far too hard.
* During the Attract Phase, any tenant will re-check their price requirements. If you have the wrong price, the Tenant walks to any player to whom you're connected.

@IDEA: Basic Utilities => gas, water, electricity.
* If you place such a box on your floor, you get that utility _if_ another player to whom you're connected has it.
* If you are the lowest floor, you always get it.
* GUESTS obviously WISH for these things.
* Some ITEMS on dominoes can only be placed (or only score/work) if you HAVE these things.





{{% /rules-block %}}

