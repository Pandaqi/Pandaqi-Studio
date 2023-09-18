---
title: "Sixpack"
date: 2023-04-14
type: "rules"
pdf: false
---

{{% rules-block id="setup" heading="Setup" icon="setup" icontint="pink" %}}

{{< rules-image src="starting_setup.webp" alt="Example starting setup (for three players)." class="float-right" >}}

Each player picks their favorite pack: 6 cards with the same icon. (See [Packs](#packs) for what they do and recommendations.)

Pick one extra pack _together_. Shuffle all cards into one deck.

Deal 6 cards to each player. Place 3 cards face-up in the center of the table: these are your "piles".

**Playing with 2?** Add one extra pack---which means 4 in total---and deal 10 cards each.

{{% remark %}}
Visit the [website](https://pandaqi.com/sixpack) to generate or download PDFs with the material.
{{% /remark %}}

{{% /rules-block %}}

{{% rules-block id="objective" heading="Objective" icon="objective" icontint="purple" %}}

The game ends when one player is **out of cards**. The player with the most **cards left** wins. (Tied? Count the hand icons.)

You can also play multiple rounds and keep score. Your score for each round is **#cards + #hands**.

{{% /rules-block %}}

{{% rules-block id="action_play" heading="Gameplay" icon="action" class="force-page-break-before" icontint="lightblue" %}}

All players pick one secret card from their hand. When everyone is ready, reveal them all at the same time.

{{% remark class="anchor-top" %}}
With 2 players, each player picks **two** cards from their hand (if possible).
{{% /remark %}}

Any **duplicate** cards are removed. Then handle the cards from **lowest** to **highest**.

{{< rules-image src="gameplay_1_reveal_and_remove.webp" alt="Start of a round: pick, reveal, remove duplicates." >}}

Each card is placed on the pile with the closest number _below_ it.

* Such a **pile doesn't exist**? Claim any pile you want. If a pile exists with the _same number_, however, take the card back into your hand instead.
* You **played the extreme card** (6)? Claim that pile.

**Claiming** a pile means that the pile is removed. Any cards that show a hand icon (<span style="display: inline-block; width: 32px; height: 32px;"><img src="../assets/hand_icon.webp" style="width:32px; height:32px; margin-bottom: -8px;"></span>) go into your hand. The card you played starts a new pile in its place.

That's it! Have fun!


{{< rules-image src="gameplay_2_place_or_claim.webp" alt="End of a round: handle cards from low to high. Place, claim, or take back." >}}

{{< rules-example id="turn" >}}

{{% /rules-block %}}

{{% rules-block id="packs" heading="Packs" class="force-page-break-before" icon="expansion" icontint="yellow" %}}

The packs below are _roughly_ in the order recommended. Further down the list, cards are less impactful and more of a fun gimmick.

For your first games, use one "reverse" pack and "neutral" cards otherwise. Afterwards, try adding one unique pack per game, to learn what they do. Once comfortable, add more and more special packs (replacing the neutral ones).

{{% remark %}}
Most packs should only be included once. These packs can be included twice: Default, Reverse, Seethrough, and Calculator.
{{% /remark %}}

{{% rules-block id="reverse" heading="Reverse" icon="pack-reverse" %}}

Before handling each card, count the number of (visible) reverse cards. If **odd**, the rules are reversed.

* Handle cards from high to low
* Cards must be placed on the pile with the closest number _above_ it
* The new extreme is "1". (Piles are claimed by playing the "1", instead of "6".)

When claiming a pile, hands are also reversed. (A card with no hand, now counts as a hand. A card with a hand icon does not.)

{{< rules-image src="pack_reverse.webp" alt="Example of a turn with the reverse active." >}}

{{< rules-example id="turn-with-reverse" >}}

{{% /rules-block %}}

{{% rules-block id="takeback" heading="Takeback" icon="pack-takeback" %}}

This card can be played on a pile with the **same number** to _claim_ it. If the card would claim a pile any other way, take it back into your hand instead.

{{% /rules-block %}}

{{% rules-block id="seethrough" heading="Seethrough" icon="pack-seethrough" %}}

It **copies** the **number** of the card below it and its **hand** (if it has one).

Additionally, ...
* Hold this card _facing the other players_. (You look at the back of the card; they always see that you have it.)
* If you play on top of such a card, reveal another card from your hand in the same way. (Flip it around, facing the other players at all times.)

{{% remark %}}
Of course, you may remind yourself at any time about what your revealed cards look like.
{{% /remark %}}

This might mean that you don't pick cards simultaneously anymore! 

* If any players revealed cards, they must pick a card _first_. Go in order of their lowest revealed card (from low to high).
* If multiple players have the _same_ lowest revealed card, they _must_ play that one.

{{< rules-image src="pack_seethrough.webp" alt="Examples of the (three) rules of seethrough cards." >}}

{{% /rules-block %}}

{{% rules-block id="lateArrival" heading="Late Arrival" icon="pack-lateArrival" %}}

When played, immediately **add one extra card** from your hand to the round. (Proceed as normal; as if that card had been played right from the start.)

{{% /rules-block %}}

{{% rules-block id="sheriff" heading="Sheriff" icon="pack-sheriff" %}}

While visible, the sheriff's number becomes the **new extreme**.

* You can only _claim_ piles by playing a sheriff's number. (Replacing the usual rules.) 
* Cards with the **same** number as the sheriff, may be played on top of it. 
* Cards that **fit nowhere** are played at the _bottom_ of a sheriff pile.

{{% remark %}}
If multiple sheriffs are visible, all their numbers count as an extreme with which you can claim a pile.
{{% /remark %}}

{{< rules-image src="pack_sheriff.webp" alt="Examples of the (three) rules of sheriff cards." >}}

{{% /rules-block %}}

{{% rules-block id="veto" heading="Veto" icon="pack-veto" %}}

When played, pick another card that's still waiting to be played and **remove it**. If no such card exists, however, throw away a card from your own hand instead.

{{% /rules-block %}}

{{% rules-block id="noSuperheroes" heading="No Superheroes" icon="pack-noSuperheroes" %}}

While visible, all special card effects are **disabled**.

{{% /rules-block %}}

{{% rules-block id="superNumbers" heading="Super Numbers" icon="pack-superNumbers" %}}

Has **two numbers**.

* You decide which one to use _after_ all cards have been revealed. 
* If multiple supernumbers are played, they _all_ count as "duplicates" of each other. (They go away before checking any other duplicates.)
* When on top of a pile, both numbers are true at once.

{{< rules-image src="pack_supernumber.webp" alt="Example of using the supernumber card (when playing, and when on top of a pile)." >}}

{{% /rules-block %}}

{{% rules-block id="bitingHand" heading="Biting Hand" icon="pack-bitingHand" %}}

When won, it **negates** all hands in the pile. You don't get them and must throw away an extra card for each hand icon.

If the pile has no hands, keep any one card from it.

{{% /rules-block %}}

{{% rules-block id="sticky" heading="Sticky" icon="pack-sticky" %}}

Steal one card from everyone who played the **same number** this round. Additionally, all other duplicates are removed, but this card stays.

{{% /rules-block %}}

{{% rules-block id="secondHand" heading="Second Hand" icon="pack-secondHand" %}}

When won, either ...

* Grab any card on top of another pile
* _Or_ grab any card from another player's hand.

{{% remark %}}
As per the usual rules, you may only keep the card itself if it shows the hand icon.
{{% /remark %}}

{{% /rules-block %}}

{{% rules-block id="carousel" heading="Carousel" icon="pack-carousel" %}}

When played, all players give one card to their left or right. (Player decides the direction.)

{{% /rules-block %}}

{{% rules-block id="pileDriver" heading="Pile Driver" icon="pack-pileDriver" %}}

When played, grab **part of its pile** and place it **on top of another**. Do this _before_ claiming the pile (if this card would do so).

If you grab the _whole_ pile, leave this card to start a new one. (There must always be exactly three piles on the table.) 

{{< rules-image src="pack_piledriver.webp" alt="Example of using the piledriver card." >}}

{{% /rules-block %}}

{{% rules-block id="copycat" heading="Copycat" icon="pack-copycat" %}}

After revealing the cards, pick a **target**: any card played by another player. Your copycat gets the **same number and special effect** as the target.

Once played on a pile, the card is simply itself again.

{{% remark %}}
If there are multiple copycats, players choose their target in numerical order, low to high.
{{% /remark %}}

{{% /rules-block %}}

{{% rules-block id="calculator" heading="Calculator" icon="pack-calculator" %}}

**Adds its number** to the card on top of it. (Any number above 6, is rounded down to 6.)

If play is reversed, it **subtracts** its number. (Any number below 1, is rounded up to 1.)

Additionally, you may attach any number of Calculator cards to the actual card you play. These change its number in the same way. (When placed on the pile, place all attached calculator cards first, then the regular card on top.)

{{< rules-image src="pack_calculator.webp" alt="Example of using the Calculator card (in different ways)" >}}

{{% /rules-block %}}

{{% /rules-block %}}