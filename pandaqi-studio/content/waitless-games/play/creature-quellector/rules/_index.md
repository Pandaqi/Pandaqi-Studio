---
type: "rules"
pdf: false
---

## Setup

Create a deck with 5 cards per player (the actual cards inside do not matter). Shuffle. Deal all players 5 cards.


## Objective

The game ends when a player is **out of cards**, _or_ all players have decided they're **done**.

The winner is the player with the strongest squad in their hand.


## Gameplay

Youngest player starts. Take clockwise turns. On your turn ...

* Pick an opponent who is not "done".
* Pick a number: 1, 2 or 3.
* You and your opponent choose that many cards from your hand (your **Squad**)
* Reveal your squads at the same time and decide who wins (see [next section](#squads))
* Trade squads. (You get the opponent's squad, they get yours.) However, the winner picks one card that they do **not** have to give away.

{{< rules/rules-image src="gameplay.webp" alt="The five simple steps of every turn, visualized." >}}

You can't pick a number larger than the number of cards you or your opponent have. 

After the fight, if you're satisfied with your squad, you can decide to stop. Say "I'm Done!" You don't get any more turns. (Un-spread your hand to signal this.)

Your opponent can do so too, _after_ you've chosen what to do.

{{< rules/rules-example id="turn" >}}


## Squads

{{< rules/rules-image src="card_anatomy.webp" alt="What different card parts mean." class="float-right" >}}

Creatures always belong to one **element** (their "main type"; the large icon in the center and corners). The rest of the card has a mix of _powers_: **types** and **actions**.

Determine your squad's strength with three simple steps.

1. The player who has the most **actions**, _must_ execute **one** of them. (If tied, defender wins.)
2. Every **type** is worth +1 point for you.
3. However, types that match an **element** played by the opponent are worth **nothing** for you. (They are "Countered".)

{{< rules/rules-image src="battle_resolution.webp" alt="An example of how to resolve a battle (actions, counters, sum what's left)." >}}

The player with the highest score wins. If tied, defender wins.

When calculating your final score at the **end of the game**, pretend you're fighting **your own hand**! 

* All your elements Counter yourself.
* All _actions_ score +1 point, but can be Countered as usual.
* The _actions_ from the player who has **the most** (out of all players), however, aren't countered. (They all count +1, always.)


## Upgrades

Each game will have 4 elements (red, blue, green, purple). Each element has 4 options to choose from, which you can pick on the website.

Each action tells you whether it must be executed BEFORE the fight or AFTER it.

{{% rules/rules-remark %}}
You can also turn on "multitype": icons can show two types at once. Choose which one it is _after_ revealing squads.
{{% /rules/rules-remark %}}

### Red

Red stands for aggression, attacking, destroying.

{{< rules/rules-table >}}
<!-- -->
    {{< rules/rules-table-entry heading="Fire" icon="red-fire" >}}
        <span class="action-timing">BEFORE</span>: Take 1 Squad card into your hand (from any squad).
    {{< /rules/rules-table-entry >}}
<!-- -->
    {{< rules/rules-table-entry heading="Electric" icon="red-electric" >}}
        <span class="action-timing">AFTER</span>: The loser steals one card <em>or</em> gives away one card to the winner.
    {{< /rules/rules-table-entry >}}
<!-- -->
    {{< rules/rules-table-entry heading="Star" icon="red-star" >}}
        <span class="action-timing">BEFORE</span>: Pick a type. Its icons count double!
    {{< /rules/rules-table-entry >}}
<!-- -->
    {{< rules/rules-table-entry heading="Dragon" icon="red-dragon" >}}
        <span class="action-timing">BEFORE</span>: Add one more card from your hand to one of the squads.
    {{< /rules/rules-table-entry >}}
{{< /rules/rules-table >}}


### Blue

Blue stands for change, multitype, fluidity.

{{< rules/rules-table >}}
<!-- -->
    {{< rules/rules-table-entry heading="Water" icon="blue-water" >}}
        <span class="action-timing">BEFORE</span>: Swap 1 card from your squad with 1 from your hand.
    {{< /rules/rules-table-entry >}}
<!-- -->
    {{< rules/rules-table-entry heading="Ice" icon="blue-ice" >}}
        <span class="action-timing">BEFORE</span>: For every card with multiple types, pick only <em>one</em> that counts (for that card).
    {{< /rules/rules-table-entry >}}
<!-- -->
    {{< rules/rules-table-entry heading="Poison" icon="blue-poison" >}}
        <span class="action-timing">BEFORE</span>: Pick 2 types. All icons of type 1 turn into type 2.
    {{< /rules/rules-table-entry >}}
<!-- -->
    {{< rules/rules-table-entry heading="Weather" icon="blue-weather" >}}
        <span class="action-timing">BEFORE</span>: Swap 1 card from your squad with 1 card from the opponent's squad.
    {{< /rules/rules-table-entry >}}
{{< /rules/rules-table >}}


### Green

Green stands for defense, blocking, safety.

{{< rules/rules-table >}}
<!-- -->
    {{< rules/rules-table-entry heading="Earth" icon="green-earth" >}}
        <span class="action-timing">BEFORE</span>: Pick a type. Ignore it entirely. (Icons are worth 0 points and main types do not Counter anything.)
    {{< /rules/rules-table-entry >}}
<!-- -->
    {{< rules/rules-table-entry heading="Grass" icon="green-grass" >}}
        <span class="action-timing">BEFORE</span>: Pick a type. It cannot be Countered.
    {{< /rules/rules-table-entry >}}
<!-- -->
    {{< rules/rules-table-entry heading="Rock" icon="green-rock" >}}
        <span class="action-timing">AFTER</span>: Pick a card. It does not get traded (after the fight).
    {{< /rules/rules-table-entry >}}
<!-- -->
    {{< rules/rules-table-entry heading="Bug" icon="green-bug" >}}
        <span class="action-timing">AFTER</span>: If one of the players says they're "done", the other must do so too.
    {{< /rules/rules-table-entry >}}
{{< /rules/rules-table >}}


### Purple

Purple stands for revealing, randomness, surprises.

{{< rules/rules-table >}}
<!-- -->
    {{< rules/rules-table-entry heading="Air" icon="purple-air" >}}
        <span class="action-timing">AFTER</span>: The loser must show their whole hand to everyone.
    {{< /rules/rules-table-entry >}}
<!-- -->
    {{< rules/rules-table-entry heading="Magic" icon="purple-magic" >}}
        <span class="action-timing">BEFORE</span>: Both players add 1 (secret) card to the opponent's squad. The attacker decides: continue fighting, or cancel the fight.
    {{< /rules/rules-table-entry >}}
<!-- -->
    {{< rules/rules-table-entry heading="Ghost" icon="purple-ghost" >}}
        <span class="action-timing">AFTER</span>: Both players permanently reveal 1 card from their hand. (Rotate it to face away from you.)
    {{< /rules/rules-table-entry >}}
<!-- -->
    {{< rules/rules-table-entry heading="Dark" icon="purple-dark" >}}
        <span class="action-timing">BEFORE</span>: Pick a type. All its icons become a penalty (worth -1 instead of +1).
    {{< /rules/rules-table-entry >}}
{{< /rules/rules-table >}}

About the "Magic" action:

* If you continue the fight, reveal the extra secret cards and continue as normal.
* If you cancel the fight, both players take their squads back into their hand, and nothing more happens.


