---
type: "rules"
---

{{% rules-block id="setup" heading="Setup" icon="setup" icontint="pink" %}}

Print a game board. Each player ... 

* Picks a unique icon that's easy to draw and recognize.
* Picks a starting location by drawing the icon there. The location also mentions a few properties you already own: draw your icon there as well.
* Picks a money square: you'll track your money here during the game.

The money squares are already filled with your starting money. (15 divided into 1 + 2 + 3 + 4 + 5)

{{% /rules-block %}}

{{% rules-block id="objective" heading="Objective" icon="objective" icontint="blue" %}}

The game ends when a player goes **bankrupt**, or nobody can **move** anymore, or somebody has used their entire **money square**.

Everybody counts their final score: money + rent of properties you own + ??

Highest score wins!

{{% /rules-block %}}

{{% rules-block id="gameplay" heading="Gameplay" icon="action" class="force-page-break-before" icontint="lightblue" %}}

Take clockwise turns. Each turn has one step **move**.

* Your current square tells you _how many spaces_ you can move (see [movement slots](#movement_slots)).
* Cross out your icon, draw it again in any _free movement slot_ at your destination. (If there is none, skip to the next square, until you _can_ land somewhere.)

@TODO: EXAMPLE IMAGE

There are two possible squares.

* **Property**: if owned, you must pay the rent indicated to the owner. If unowned, you might buy it: see [buying_property](#buying_property).
* **Crossroads**: execute the action (from the center) that's closest to you, see [action_slots](#action_slots).

@TODO: EXAMPLE IMAGE

{{< rules-example id="turn" >}} @TODO: does a playful rules example make sense?

{{% rules-block id="handling_money" heading="Handling Money" %}}

When you receive money, write the _number_ in a free cell of your money square. 

When you pay money, cross out the cells needed to arrive at the correct sum. There is no "change": if you're unlucky, you will overshoot the amount.

@TODO: EXAMPLE IMAGE?

{{% /rules-block %}}

{{% rules-block id="buying_property" heading="Buying Property" %}}

To buy property, pay the price indicated, then draw your icon in a free owner slot.

If you don't want to buy, the property goes up for **auction**. Players can bid whatever they want, as long as it's higher than the previous bid. The highest bidder gets the property. (If nobody bids, nothing happens.)

@TODO: EXAMPLE IMAGE (these are all just tiny squares floating right)

{{% /rules-block %}}

{{% rules-block id="upgrading_and_trading" heading="Upgrading & Trading" %}}

You may _upgrade_ or _trade_ at any moment! 

When trading, you can only exchange tangible goods. (No promises, no things you don't have yet.) If a property switches hands, cross out the previous owner and write the new owner's icon. If there's no space for that, you _can't_ trade this property. 

You can upgrade property as soon as you have **all property of the same color** ( = the full set). Pay the purchase cost again to move up one rent level. (Cross out the old level, circle the new one.)

@TODO: EXAMPLE IMAGE

{{% /rules-block %}}

{{% /rules-block %}}

@TODO:

* Even start square is an expansion? 
  * **Start**: you get 2 money by passing it (not just landing on it). 
* Utilities / Trains are an expansion
* Jail is also an expansion?
* Starting locations / Starting properties are optional?
* Hobo Variant => eliminated players stay alive and can _choose_ whether to move on their turn or not. The property where they currently are is worth _half_ (both when purchasing and when paying rent)
* ALTERNATIVE => no need to have a monopoly to build houses, but you must be on the square itself to build one.
* Randomized player powers/missions. (These are also printed on your unique starting location.)
  * RELATED COMMENT: Definitely add variable player powers. I have no idea how to balance shit but off the top of my head maybe a player gets 300 for passing go or can travel between railroads (maybe for free if they own them or for a price to the owner), or can move one more/fewer space than their roll or gets up to two free rerolls or spends 50 less on rent or whatever.

* Bid for first player / First round no buys
* Silent auctions => write bid on a piece of paper, revealed simultaneously, highest wins
* Anything else?