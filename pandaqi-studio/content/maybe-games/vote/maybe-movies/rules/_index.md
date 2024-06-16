---
type: "rules"
---

{{% rules-block id="setup" heading="Setup" icon="setup" icontint="green" %}}

{{% rules-double-view src="setup.webp" alt="Visualization of how to setup the game." %}}

Create a deck of **Votes**: 5 YES and 5 NO per player. Shuffle and deal 10 secret Votes to each player.

{{% remark %}}
If someone starts with only Votes of a single type, however rare, deal again.
{{% /remark %}}

Place any remaining votes in a faceup draw pool. 

Create a deck of **Movie Cards**. Place 6 of them faceup next to the deck: the market.

{{% /rules-double-view %}}

{{% /rules-block %}}

{{% rules-block id="objective" heading="Objective" icon="objective" icontint="red" %}}

{{% rules-double-view src="objective.webp" alt="Example of how to determine your score at the end of the game." %}}

The game ends when **all players are out of Votes**.

During the game, you build a row of **Movies Made**. Each Vote Card you've **won** (not in hand) is worth the number of times its icon appears on these Movies Made. The **highest score wins**!

{{% /rules-double-view %}}

{{% /rules-block %}}

{{% rules-block id="action_play" heading="Gameplay" icon="action" icontint="green" %}}

{{< rules-image src="gameplay.webp" alt="Example of how to play a round (pitch, vote, handle fail/success)" >}}

From start player, take clockwise turns.

On your turn, **pitch a movie idea!**
* Chain cards from the market into a row in the center of the table.
* You must use at least 1 card.
* (Refill the market as needed.)

The sum of the numbers in orange (top) is called the **Budget** of the movie. 

The sum of the numbers in green (bottom) is called the **Profit** of the movie.

Once done, everyone **votes simultaneously**.
* Pick a secret Vote from your hand.
* One everyone has done so, reveal simultaneously.
* Sum the votes: every YES has its value added, every NO has its value subtracted.
* Every 2 icons of the same type can be used as a **wildcard** to match any other icon. (Instead of using them as what they are; you can't do both.) This does not apply to icons of which you have a negative amount, of course.

If the votes match the **Budget** (at least), your pitch SUCCEEDS! (The movie is greenlit!) Otherwise, it FAILS.

If the movie succeeds,
* Grab as many Votes as the **Profit**. Use the votes from this round first, then fill up the remaining space from draw pool. 
* Shuffle and fairly distribute among all YES-voters. 
* Any leftover Votes---which couldn't be shared fairly---go to the active player.
* These Votes are **won**. Place them faceup in front of you; don't take them into your hand.
* Place 1 card from this movie in the row of Movies Made.

<!--- @TODO: Change the first Profit rule to "you must fill up the remaining space with Votes that are all the same icon, if possible"?? --->

If the movie fails, all NO-voters _win_ their own vote. If _everyone_ voted NO, however, then nobody gets anything back.

Any remaining Movie Cards are discarded.

{{< rules-example id="turn" >}}

{{% /rules-block %}}

{{% rules-block id="expansions" heading="Expansions" icon="expansion" icontint="red" %}}

Played the base game and ready for more? Or feel like your group needs some tweaks to the game? Check out these expansions.

{{% rules-block heading="Trendsetter Tricks" %}}

This expansion _expands_ on the idea of market demands and tracking Movies Made. We now track if a movie failed or not, and new pitches with matching properties change based on that.

During **gameplay**, the following rule is added.

For each symbol that matches a Previous Movie,
* If that movie failed, the **Cost** of that card doubles.
* If that movie succeeded, the **Profit** of that card doubles.

At the **end of the round**, the following rule replaces the "save a successful movie card" rule. 

* Turn the movie into one stack of cards with any card on top. 
* If success, place the green side up, otherwise orange side. 
* Place this stack into the row of Movies Made.

{{< rules-image src="trendsetter_tricks.webp" alt="Examples of the changes to the base game in the Trendsetter Tricks expansion." >}}

{{% /rules-block %}}

{{% rules-block heading="Breaking Changes" %}}

During **setup**, 
* Also include 2 CHANGE tokens per player.
* And place 2 faceup Movie Cards before each player.

After **voting**, first resolve all CHANGE votes.
* Sort those players by number on the vote (low to high; CHANGE numbers are unique)
* Each of them must now _change_ the pitch by adding one of their own Movie Cards and/or removing an existing Movie Card.
* (Refill your personal Movie Cards as needed.)
* Once done, everyone takes back their vote, while the CHANGE-voters draw a new one from the pool. You simply vote again on the new pitched Movie.

Optionally, players may improvise a pitch for why their change is amazing and makes the movie waaaay better.

<!--- @TODO: EXAMPLE IMAGE for this --->

{{% /rules-block %}}

{{% rules-block heading="Blockbuster Budgets" %}}

This expansion includes **Movie Cards** with text (instead of icons) for _Cost_ and _Profit_. This means pitches are more varied.

Clarifications:
* Some texts depend on order. In that case, read the cards from the pitch from left to right, from the perspective of the active player.
* Some texts might create a tie or multiple options. In that case, the active player picks which one it is.

As always,
* The top (orange) part shows the _cost_ that must be paid for the pitch to succeed.
* The bottom (green) part shows _how many votes_ you may draw for this card, if the movie succeeds and it comes time to distribute the profits.

<!--- @TODO: EXAMPLE IMAGE for this?? --->

{{% /rules-block %}}

{{% /rules-block %}}