---
type: "rules"
---

{{< decision-tree >}}
label = root
text = Your turn. What do you want?
paths =
* Attract People = attract
* Prepare Treats = treats
* Hinder Another = obstruct
style =
* color = #FFAAAA
<!---->
label = attract
text = Add cards to your home that match what that Person wants.
<!----->
label = treats
text = Discard cards you don't need and draw 2 new ones for each.
paths =
* A = nodeA
* B = nodeB
<!---->
label = obstruct
text = Add cards to another player's home. Steal decorations with a matching icon.
<!---->
label = nodeA
text = 
paths =
* A = nodeC
* B = nodeD
<!---->
label = nodeB
<!---->
label = nodeC
<!---->
label = nodeD
{{< /decision-tree >}}


{{% rules-block id="setup" heading="Setup" icon="setup" icontint="purple" %}}

Pick a set from [the website](https://pandaqi.com/pumpkin-patrol). For your first games, just play the starter set.

Each player receives 5 **Hand Cards**. Hand cards always show _two_ things at the same time: you pick only _one_ of the options when you use the card. Place the remaining Hand Cards as a shuffled facedown deck.

Each player places 1 random Person Card faceup between them and their left neighbor. 

* With 2 or 3 players, place 2 Person cards each.
* With 2 players, include each Person only _once_.

Randomly place the remaining Person Cards faceup in the center of the table, in a row.

The scariest person becomes start player.

@TODO: IMAGE EXAMPLE (of setup, but also card skeletons + WILDCARD and the general idea with building a home and stuff)

{{% /rules-block %}}

{{% rules-block id="objective" heading="Objective" icon="objective" icontint="lightblue" %}}

The game ends as soon as **2 or fewer Persons remain** (unscored) at the start of a round. Players sum the points on the Persons they scored: **highest score wins!**

{{% /rules-block %}}

{{% rules-block id="action_play" heading="Gameplay" icon="action" class="force-page-break-before" icontint="purple" %}}

Play happens in rounds. Rounds have two phases: PLAY and WALK.

_What's the general idea?_ During the game, players create a row of cards in front of them. (They decorate their home.) You need that to attract Persons and ask them to stop at your beautiful front door.

But that's not enough. Balance building your decorations with building your bowl of treats. Because to score any visitor, you also need to pay the Treats they require.

{{< rules-example id="turn" >}}

{{% rules-block heading="Play" %}}

Take clockwise turns, beginning with the start player. On your turn, take **two actions**. 

The possible actions are ...

**ADD**: Add a card from your hand to _any_ home. Make sure the side you want ( = which specific decoration) points up. 

If you add it to somebody else's home,

* They decide how to rotate it.
* You steal a decoration of theirs, but only one that matches an icon on _your_ card. 
* A wildcard ("?") matches any icon, even disregarding the type (decoration or treat).

**REMOVE**: Draw 2 new Hand Cards, either from the facedown deck _or_ from the discard pile. Pay for it by discarding 1 card from your home or hand.

{{% remark %}}
If the draw pile runs out, immediately take the discard pile, shuffle it, and make it the new facedown deck.
{{% /remark %}}

@TODO: IMAGE EXAMPLE

{{% /rules-block %}}

{{% rules-block heading="Walk" %}}

All Persons currently in play will **walk**. They can do so simultaneously.

> Each person moves clockwise to the first player who fulfills their **Home requirements**. If no such player exists, they take one step and stop _between_ their current player and the next.

Home requirements are fulfilled if a player has _at least_ the decorations shown on the Person's card.

Once all Persons have moved, scoring happens in turn order. You _may_ score anyone at your front door, except a Person you have _already scored_. For each Person,

* Pay their **Treat requirements**. (Discard cards from your hand that contain _at least_ their Treat requirements. As always, you can only pick _one_ side per card.)
* Place the Person card facedown in your score pile.
* Grab the first Person card from the row in the center of the table. Place it between you and your left neighbor: it's now in play.

Start player moves one to the left. Next round!

@TODO: IMAGE EXAMPLE

{{% /rules-block %}}

{{% /rules-block %}}

{{% rules-block id="expansions" heading="Expansions" icon="expansion"  icontint="purple" %}}

Once you're familiar with the base game, you can try the more advanced sets!

{{% rules-block heading="Variants" %}}

**Want an easier game?** (Perhaps when playing with kids or first-timers.) Add this rule:

> If a person comes from _between two players_ ( = they didn't start walking from another's front door), you may ignore any _one decoration_ from their requirements.

This makes it easier to attract Persons in certain situations, without being overpowered.

**Want a less cutthroat game?** Don't allow placing decorations in other player's homes.

**Want a more strategic game?** 
* Start with 4 cards each. 
* Whenever you add a new Person to the game, you may pick _any_ card from the row in the center of the table. 
* (If that's too overwhelming, keep a market of 4 faceup Persons at any time. Keep the rest as a facedown deck, unpickable until revealed.)

{{% /rules-block %}}

{{% rules-block heading="Beginner Set" %}}

This set adds three new mechanics.

**Powers**: people can have a special power. Such a power is indicated by the _heart_ icon, and replaces the funny tagline.

These can be permanent or triggered at a specific moment.

* "On walk": execute at the _start_ of the walking phase ( = "just before walking").
* "On visit": execute at the _end_ of the walking phase ( = "everyone is done walking").
* "On score": execute when you pay treats and score this card.

**"At Most"**: some people have an "at most" requirement. They will only visit if you have **no decorations besides the ones they accept**. 

Example: 

* Say somebody wants "at most 2 pumpkins"
* They will visit if you have 1 Pumpkin
* They will not visit if you have 1 Pumpkin and 1 Spider, as the Spider is "too much".
* They will not visit if you have 3 Pumpkins, as the third Pumpkin is "too much".

It also adds new treats and decorations. These have a different value / probability behind the scenes, but change no rules for players.

{{% /rules-block %}}

{{% rules-block heading="Advanced Set" %}}

This set adds two new mechanics.

**Card Requirements**: instead of requiring specific types, they just want a number of _cards_.

**Set Requirements**: instead of requiring specific types, they just want a _set_. There are two options.
* "Same" (equals sign): they want X icons of the _same_ type. (The type itself doesn't matter, as long as the whole set is the same one.)
* "Different" (not-equals sign): they want X icons that are all a _different_ type.

{{% /rules-block %}}

{{% rules-block heading="Expert Set" %}}

This adds no new rules. It simply contains the people with the toughest powers, and of course uses everything introduced before now.

{{% /rules-block %}}

{{% rules-block heading="Assemble your own deck" %}}

Firstly, there's no need to play with exactly 16 Persons (2 of each type). You can shrink the Person pool for a shorter game, or include each person only once and add _more_ types.

Secondly, you can combine sets to create your own deck.

* Make sure the icons on Person and Hand cards match. (That's why it's recommended to include all or most of a set.)
* Make sure there's enough variety in the Person scores.

However, sets are randomly generated! This means a specific card (e.g. "Vampire") is never the same, and also that a set is balanced with _itself_. It's recommended to just play specific sets _or_ generate an entirely new "Random" set.

{{% /rules-block %}}

{{% /rules-block %}}