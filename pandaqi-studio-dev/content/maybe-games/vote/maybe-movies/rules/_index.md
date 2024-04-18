---
type: "rules"
---

{{% rules-block id="setup" heading="Setup" icon="setup" icontint="green" %}}

Create a deck of **Votes**: 5 YES and 5 NO per player. Shuffle and deal 10 secret Votes to each player. Place any remaining votes in a faceup draw pool.

Create a deck of **Movie Cards**. Place 6 of them faceup next to the deck: the market.

@TODO: IMAGE EXAMPLE

{{% /rules-block %}}

{{% rules-block id="objective" heading="Objective" icon="objective" icontint="red" %}}

The game ends when **all players are out of Votes**.

During the game, you build a row of **Movies Made**. Each Vote Card you've **won** (not in hand) is worth the number of times its icon appears on these Movies Made. The **highest score wins**!

@TODO: IMAGE EXAMPLE?

{{% /rules-block %}}

{{% rules-block id="action_play" heading="Gameplay" icon="action" icontint="green" %}}

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
* If the votes match the **Budget** (at least), your pitch SUCCEEDS! (The movie is greenlit!)
* Otherwise, your pitch FAILS.

Example: The votes were YES-3, YES-5 and NO-2. Their sum is thus 3 + 5 - 2 = 6. The budget for the movie was 5. The pitch SUCCEEDS!

If the movie succeeds,
* Grab as many Votes as the **Profit**. Use the votes from this round first, then fill up the remaining space from draw pool. <!--- @TODO: Change this rule to "you must fill up the remaining space with Votes that are all the same icon, if possible"?? --->
* Shuffle and fairly distribute among all YES-voters. 
* Any leftover Votes---which couldn't be shared fairly---go to the active player.
* These Votes are **won**. Place them in front of you, don't take them into your hand.
* Place 2 cards from this movie in the row of Movies Made. <!--- @TODO: 1 card might be fine too here?? --->

If the movie fails, all NO-voters _win_ their own vote. If _everyone_ voted NO, however, then nobody gets anything back.

Any remaining Movie Cards are discarded.

@TODO: IMAGE EXAMPLE

@TODO: INTERACTIVE EXAMPLE (does that make sense?)

{{% /rules-block %}}

{{% rules-block id="expansions" heading="Expansions" icon="expansion" icontint="red" %}}

Played the base game and ready for more? Or feel like your group needs some tweaks to the game? Check out these variants and expansions.

{{% rules-block heading="Variants" %}}

???

{{% /rules-block %}}

{{% rules-block heading="Trendsetter Tricks" %}}

This expansion _expands_ on the idea of market demands and tracking Movies Made. We now track if a movie failed or not, and new pitches with matching properties change based on that.

During **gameplay**, the following rule is added.

For each symbol that matches a Previous Movie,
* If that movie failed, the **Cost** of that card doubles.
* If that movie succeeded, the **Profit** of that card doubles.

At the **end of the round**, the following rule replaces the "save 2 cards from a successful movie" rule. 

* Turn the movie into one stack of cards with any card on top. 
* If success, place the green side up, otherwise orange side. 
* Place this stack into the row of Movies Made.

{{% /rules-block %}}

{{% rules-block heading="Breaking Changes" %}}

During **setup**, 
* Also include 2 CHANGE tokens per player.
* And place 2 faceup Movie Cards before each player.

After **voting**, first resolve all CHANGE votes.
* Sort those players by number on the vote (low to high; CHANGE numbers are unique)
* Each of them must now _change_ the pitch by adding one of their own Movie Cards and/or removing an existing Movie Card.
* (Refill your personal Movie Cards as needed.)
* Once done, everyone takes back their vote _except_ the CHANGE-voters, and you simply vote again on the new pitched Movie.

Optionally, players may improvise a pitch for why their change is amazing and makes the movie waaaay better.

{{% /rules-block %}}

{{% rules-block heading="Blockbuster Budgets" %}}

@TODO: This would add more varied ways to calculate _budget_ and _profit_.

For example,
* Cost = highest/lowest neighbor.
* Cost = number of YES-votes / number of NO-votes
* Profit = 0 if the mission has <3 cards, otherwise 3.
* Profit = equal to number of cards in the mission
* Profit = equal to the number of times this mission was CHANGED.

{{% /rules-block %}}

{{% /rules-block %}}