---
type: "rules"
---

{{% rules-block id="setup" heading="Setup" icon="setup" icontint="green" %}}

Each player receives **9 random Life Cards**. Decide the order you want, then place them in a faceup stack before you.

Shuffle the **Cat Deck** and deal everyone 3 cards. Finally, pick anyone to be the Kittyqueen.

{{% remark %}}
Material can be downloaded from [the website](https://pandaqi.com/nine-lives).
{{% /remark %}}

{{% /rules-block %}}

{{% rules-block id="objective" heading="Objective" icon="objective" icontint="lightblue" %}}

The game ends when **a player runs out of lives**. The players with the **most lives** win.

{{% /rules-block %}}

{{% rules-block id="action_play" heading="Gameplay" icon="action" class="force-page-break-before" icontint="orange" %}}

Play happens in rounds. The Kittyqueen starts, then take clockwise turns.

@TODO: Interactive Example

{{% rules-block heading="On your turn" %}}

On your turn, PLAY a card from your hand.

There's only one rule: **no cat may appear more than 9 times (across all cards).**

Before playing a card, you _may_ also **wager a life**. Place your top Life Card in front of you. Draw as many cards as it shows, then execute its _power_.

If your turn makes a cat appear _exactly_ 9 times, you are rewarded: you aren't required to take turns anymore (this round).

@TODO: IMAGE EXAMPLE => show playing forbidden numbers, wagering a life, playing a perfect 9

{{% /rules-block %}}

{{% rules-block heading="End of Round" %}}

A round can end in three ways.

* Somebody must take a turn, but can't. If so, only they **lose a life**.
* Only one player remains who is forced to take turns. If so, only they **lose a life**.
* Or _all_ cats appear 9(+) times. If so, **everyone loses a life**.

Losing a life means discarding the top card of your lives deck, as well as _any lives you wagered_. (Otherwise, wagered lives just return to the top of your Life deck.)

The player with the most lives becomes the new Kittyqueen. (If tied, the current Kittyqueen picks their successor from the tied players.)

<!--- Another alternative: all those who did NOT wager, draw cards now --->

For a more "forgiving" (first) game, perhaps add the following rule: at the end of each round, always draw as many cards as your current Life indicates.

@TODO: IMAGE EXAMPLE => Show playing a stack (cards underneath each other)

{{% /rules-block %}}

{{% /rules-block %}}

{{% rules-block id="lives" heading="Lives" icon="score" class="force-page-break-before" icontint="purple" %}}

Each Life Card shows a **power** and a number of **cards**. 

* The number of cards indicates how many cards you draw when wagering the card.
* The power indicates some special ability you get when wagering this card. (Only for _you_, and only on that turn!)

At any time, only the _top card_ from your deck applies to you. (Whenever your top Life Card changes, make sure to check your new power.)

During the game, you may always browse through your lives to see what's coming up!

Below is a table explaining what each icon means.

@TODO: Rules-table with all icons explained. 
=> Shouldn't I just create an automatic feature that _reads_ stuff like this from the dict? 
=> Yes, an automatic part of PQ-RULEBOOK!! 
=> Can create a TABLE or a RULES-TABLE. (For the first, check Kangaruse implementation. For the second, check underlying HTML for rules tables.)

{{% /rules-block %}}