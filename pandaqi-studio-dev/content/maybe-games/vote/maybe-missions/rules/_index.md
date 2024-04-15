---
type: "rules"
---

{{% rules-block id="setup" heading="Setup" icon="setup" icontint="green" %}}

Create a deck containing 5 YES and 5 NO Votes per player. Shuffle and deal each player 10 secret Vote Tokens. (Change these numbers to modify duration of a game.)

Create a deck of Master Cards and a deck of Mission Cards next to it.

Finally, create the market: 6 faceup Mission Cards in a row.

@TODO: IMAGE EXAMPLE

{{% /rules-block %}}

{{% rules-block id="objective" heading="Objective" icon="objective" icontint="red" %}}

The game ends once **everyone's Votes have run out**. The player with the **highest score wins**.

Of the cards you collected, only the side pointing _up_ ("away from you") counts. Each resource is worth 1 point. Furthermore,
* The resource which you have the most counts _double_. 
* The resource which you have the least does _not count_. (In case of a tie, you pick any one of the options.)

{{% /rules-block %}}

{{% rules-block id="action_play" heading="Gameplay" icon="action" icontint="green" %}}

From start player, take clockwise turns.

On your turn, **prepare a mission**.
* Reveal the top Master Card from the deck.
* Then pick cards from the market and place them besides the Master Card.
* You must choose at least 1 card, and at most as many cards as the number of players.
* (Refill the market as needed.)

The Master card contains a **rule**. This rule applies to the current round and must be followed.

Once the mission is prepared, all players simultaneously **vote**.
* Stick out your hand with a secret Vote inside, then reveal simultaneously.
* If the majority voted YES, the mission SUCCEEDS.
* Otherwise, the mission FAILS.

All YES-voters now take turns collecting a single mission card.

* SUCCESS? Sort turns from low to high (by vote numbers). Place your collected card before you with the green side up. 
* FAIL? Sort turns from high to low (by vote numbers). Place your collected card before you with the red side up.

If everyone voted NO, then everyone must collect a mission card and place it with the red side up. (In order of vote number, high to low.)

Whatever happens, the active player always wins the Master Card. As usual, if the mission SUCCEEDED the green side points up, otherwise the red side points up.

Once done, all Votes are discarded. Next round!

_Remark:_ If the mission cards have run out while picking, any players remaining simply don't collect anything.

@TODO: IMAGE EXAMPLE

@TODO: INTERACTIVE EXAMPLE

{{% /rules-block %}}

{{% rules-block id="expansions" heading="Expansions" icon="expansion" icontint="red" %}}

Played the base game and ready for more? Or feel like your group needs some tweaks to the game? Check out these variants and expansions.

{{% rules-block heading="Variants" %}}

You can allow Master Cards to be **played** as well. This only applies to collected Master Cards that are positive (green side up).

* At any time, before a new round starts, you may place that card next to the Master Card deck.
* Its rule applies to this round again. (It only _overrides_ the regular Master Card if the rules contradict.)
* Afterwards, the card is discarded. (It can't be won and doesn't return to you.)

<!--- @TODO: This might become a rule of the BASE GAME? Test and check if this ruins simplicity. --->
To **reduce randomness** ("bad luck of the draw"), you can add the following rule.

> If you didn't collect a card this round, you may discard 2 Votes to draw new ones from the deck.

{{% /rules-block %}}

{{% rules-block heading="Secret Identities" %}}

For this expansion, also use the Identity cards. 

During setup, deal each player 1 Public Identity (faceup) and 1 Secret Identity (facedown).

* The Public Identity shows a special ability that only you possess. You must follow it at all times.
* The Secret Identity shows unique scoring rules that only apply to you. You must follow these when calculating your score at the end, on top of the usual scoring rules.

When a secret identity talks about icons showing on a card, it's always about a collected Mission Card, and only the side that points _up_. 

@TODO: EXAMPLE IMAGE?

{{% /rules-block %}}

{{% rules-block heading="Gadget Shopping" %}}

For this expansion, also use the Shop cards.

During setup, pick a random Shop card and place it in clear view of all players.

Before the start of a round, you are allowed to _buy_ from the shop. By paying the resources indicated on the left, you get the corresponding reward on the right. Paying means you discard collected cards showing _at least_ those icons.

The possible rewards are:

* Collect the green side of a random Mission Card.
* Collect a random Master Card
* Execute action X

@TODO: Not sure about this one. Feels like we stray away from the VOTING mechanic, which should be the core of EVERYTHING. Like, can't we say ...

* Whenever you want to buy something, everyone votes on it. Your purchase only succeeds if majority votes YES. The token used for this is replaced by drawing a new one (?)
* Or maybe we can vote on who becomes the next active player? That feels very important to control.

@TODO: EXAMPLE IMAGE?

{{% /rules-block %}}

{{% /rules-block %}}