---
title: "Creature Quellector"
date: 2023-05-02
type: "rules"
pdf: false
---

{{% rules-block id="setup" heading="Setup" icon="setup" icontint="pink" %}}

Create a deck with 5 cards per player (the actual cards inside do not matter). Shuffle. Deal all players 5 cards.

{{% /rules-block %}}

{{% rules-block id="objective" heading="Objective" icon="objective" icontint="blue" %}}

The game ends when a player is **out of cards**, _or_ all players have decided they're **done**.

The winner is the player with the strongest squad in their hand.

{{% /rules-block %}}

{{% rules-block id="action_play" heading="Gameplay" icon="action" class="force-page-break-before" icontint="lightblue" %}}

Youngest player starts. Take clockwise turns. On your turn ...

* Pick an opponent who is not "done".
* Pick a number: 1, 2 or 3.
* You and your opponent choose that many cards from your hand (your **Squad**)
* Reveal your squads at the same time and decide who wins (see [next section](#squads))
* Trade squads. (You get the opponent's squad, they get yours.) However, the winner picks one card that they do **not** have to give away.

{{< rules-image src="gameplay.webp" alt="The five simple steps of every turn, visualized." >}}

You can't pick a number larger than the number of cards you or your opponent have. 

After the fight, if you're satisfied with your squad, you can decide to stop. Say "I'm Done!" You don't get any more turns. (Un-spread your hand to signal this.)

Your opponent can do so too, _after_ you've chosen what to do.

{{< rules-example id="turn" >}}

{{% /rules-block %}}

{{% rules-block id="squads" heading="Squads" class="force-page-break-before" icon="scoring" icontint="purple" %}}

{{< rules-image src="card_anatomy.webp" alt="What different card parts mean." class="float-right" >}}

Creatures have one main type (the large one in the center and corners). It also shows which type it "counters" (to the right), and what type counters our main type (to the left). 

The rest of the card has a mix of icons.

{{% remark %}}
This is a reminder. The counter cycle is always the same.
{{% /remark %}}

Determine your squad's strength with three simple steps.

1.	The player who has the most **action** icons, executes **one** of their actions. (If tied, nobody does.)
2.	Check the main types your opponent has. The types they Counter are worth **nothing** for you.
3.	Each remaining **type icon** is worth +1 point.

The player with the highest score wins. In case of a tie, the defender wins.

{{< rules-image src="battle_resolution.webp" alt="An example of how to resolve a battle (actions, counters, sum what's left)." >}}

When calculating your final score at the **end of the game**, pretend you’re fighting **your own hand**! (Its main types Counter yourself.)

{{% /rules-block %}}

{{% rules-block id="types" heading="Types" class="force-page-break-before" icon="expansion" icontint="orange" %}}

Each game will have 4 elements (red, blue, green, purple). Each element has 4 options to choose from, which you can pick on the website.

Each action tells you whether it must be executed BEFORE the fight or AFTER it.

{{% remark %}}
You can also turn on "multitype": icons can show two types at once. Choose which one it is _after_ revealing squads.
{{% /remark %}}

{{% rules-block id="red" heading="Red" %}}

Red stands for aggression, attacking, destroying. It counters Purple.

{{< rules-table >}}
<!-- -->
    {{< rules-table-entry heading="Fire" icon="red-fire" >}}
        <span class="action-timing">BEFORE</span>: Take one Squad card into your hand.
    {{< /rules-table-entry >}}
<!-- -->
    {{< rules-table-entry heading="Electric" icon="red-electric" >}}
        <span class="action-timing">AFTER</span>: The winner steals one card from the loser.
    {{< /rules-table-entry >}}
<!-- -->
    {{< rules-table-entry heading="Star" icon="red-star" >}}
        <span class="action-timing">BEFORE</span>: Pick a type. Its icons count double!
    {{< /rules-table-entry >}}
<!-- -->
    {{< rules-table-entry heading="Dragon" icon="red-dragon" >}}
        <span class="action-timing">BEFORE</span>: Add one more card from your hand to one of the squads.
    {{< /rules-table-entry >}}
{{< /rules-table >}}

{{% /rules-block %}}

{{% rules-block id="blue" heading="Blue" %}}

Blue stands for change, multitype, fluidity. It counters Red.

{{< rules-table >}}
<!-- -->
    {{< rules-table-entry heading="Water" icon="blue-water" >}}
        <span class="action-timing">BEFORE</span>: Swap one card from your squad with one from your hand.
    {{< /rules-table-entry >}}
<!-- -->
    {{< rules-table-entry heading="Ice" icon="blue-ice" >}}
        <span class="action-timing">BEFORE</span>: Pick one type from a card with multiple types. Only the chosen one counts (for that card).
    {{< /rules-table-entry >}}
<!-- -->
    {{< rules-table-entry heading="Poison" icon="blue-poison" >}}
        <span class="action-timing">BEFORE</span>: Pick two types. All icons of type 1 turn into type 2.
    {{< /rules-table-entry >}}
<!-- -->
    {{< rules-table-entry heading="Weather" icon="blue-weather" >}}
        <span class="action-timing">BEFORE</span>: Swap one card from your squad with one card from the opponent's squad.
    {{< /rules-table-entry >}}
{{< /rules-table >}}

{{% /rules-block %}}

{{% rules-block id="green" heading="Green" %}}

Green stands for defense, blocking, safety. It counters Blue.

{{< rules-table >}}
<!-- -->
    {{< rules-table-entry heading="Earth" icon="green-earth" >}}
        <span class="action-timing">BEFORE</span>: Pick a type. Ignore it entirely. (It's worth 0 points, but also doesn't Counter anything.)
    {{< /rules-table-entry >}}
<!-- -->
    {{< rules-table-entry heading="Grass" icon="green-grass" >}}
        <span class="action-timing">BEFORE</span>: Pick a type. It cannot be Countered.
    {{< /rules-table-entry >}}
<!-- -->
    {{< rules-table-entry heading="Rock" icon="green-rock" >}}
        <span class="action-timing">AFTER</span>: Pick a card. It does not get traded (after the fight).
    {{< /rules-table-entry >}}
<!-- -->
    {{< rules-table-entry heading="Bug" icon="green-bug" >}}
        <span class="action-timing">AFTER</span>: The winner must say they are "done".
    {{< /rules-table-entry >}}
{{< /rules-table >}}

{{% /rules-block %}}

{{% rules-block id="purple" heading="Purple" %}}

Purple stands for revealing, randomness, surprises. It counters Green.

{{< rules-table >}}
<!-- -->
    {{< rules-table-entry heading="Air" icon="purple-air" >}}
        <span class="action-timing">AFTER</span>: The loser must show their whole hand to the opponent
    {{< /rules-table-entry >}}
<!-- -->
    {{< rules-table-entry heading="Magic" icon="purple-magic" >}}
        <span class="action-timing">BEFORE</span>: Both players add another (secret) card to the opponent's squad. The attacker decides: continue fighting, or cancel the fight.
    {{< /rules-table-entry >}}
<!-- -->
    {{< rules-table-entry heading="Ghost" icon="purple-ghost" >}}
        <span class="action-timing">AFTER</span>: Permanently reveal one card from your hand. (Rotate it to face away from you.)
    {{< /rules-table-entry >}}
<!-- -->
    {{< rules-table-entry heading="Dark" icon="purple-dark" >}}
        <span class="action-timing">BEFORE</span>: Pick a type. It becomes a penalty (worth -1 instead of +1).
    {{< /rules-table-entry >}}
{{< /rules-table >}}

About the "Magic" action:

* If you continue the fight, reveal the extra secret cards and continue as normal.
* If you cancel the fight, both players take their squads back into their hand, and nothing more happens.

{{% /rules-block %}}

{{% /rules-block %}}