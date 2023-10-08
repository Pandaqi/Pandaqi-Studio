---
type: "rules"
---

{{% rules-block id="setup" heading="Setup" icon="setup" icontint="yellow" %}}

{{< rules-double-view src="starting_setup_1.webp" alt="Example of a starting setup. (Square tiles, 4 players, mosaic style.)" >}}

Divide the players into pairs ( = teams of 2). If your player count is odd, include one team of 3.

Shuffle the **code cards** and give each player one. Rotate this code card such that your team's color is at the bottom.

{{% remark %}}
Yes, with 2--3 players, everyone is in the same team and you play cooperatively.
{{% /remark %}}

The code card shows the "secret tile" of your teammate that you, somehow, must communicate during the game. It also contains other special tiles, explained later.

Finally, shuffle the **tiles**. Arrange them in a grid to match the layout on the code cards.

On the [website](https://pandaqi.com/photomone-antsassins), you can pick whatever tile type you want. The rules are identical for all. However, do not "mix" different tiles in the same game.

{{< /rules-double-view >}}

{{% /rules-block %}}

{{% rules-block id="objective" heading="Objective" class="force-page-break-before" icon="objective" icontint="purple" %}}

Be the first **team** to guess all your **secret tiles**!

{{% /rules-block %}}

{{% rules-block id="action_play" heading="On your turn" icon="action" icontint="yellow" %}}

Take clockwise turns. Each turn has two _optional_ steps: **clue** and **guess**.

{{% rules-block heading="Clue" id="clue" %}}

Give a clue to your teammate about which tiles **are NOT the secret tile**. 

> Say a **word** that describes a group of tiles. Also say a **number** equal to the size of that group.

You can say everything, except _letters, numbers, shapes_ or _colors_.

In a team of 3? Provide clues for teammates in a circle (1 -> 2 -> 3 -> 1).

{{% remark %}}
Tip: walk around, look at the board from all angles, and try to see shapes that cross multiple tiles at once!
{{% /remark %}}

{{< rules-image src="clue.webp" alt="Example of giving a clue about multiple tiles (which are not the secret tile)." >}}

{{% /rules-block %}}

{{% rules-block heading="Guess" id="guess" %}}

Guess your own secret tile by tapping it with your finger. Your teammate reveals the result ...

* **Correct?** Great! If your team has now guessed all its tiles, you win.
* **Almost?** (darker color, no glow) Your teammate says "almost".
* **Antsassin?** (black tile) Your team is out of the game.
* **Otherwise?** Do nothing.

If the antsassin eliminated all teams but one, the remaining team wins.

{{% remark %}}
Optional: print the token sheet. Use these to remember which tiles from your team ("secret" or "almost") have been guessed.
{{% /remark %}}

{{< rules-image src="guess.webp" alt="Examples of what happens after somebody guessed a certain tile." >}}

Playing cooperatively? The tokens are required. After each turn, mark a secret tile from another team's color (that isn't in the game). If somebody can't mark another tile anymore, you've lost the game.

{{% /rules-block %}}

{{% /rules-block %}}

{{% rules-block id="almost" heading="Almost Tiles" icon="beware" icontint="purple" %}}

{{< rules-double-view src="almost_actions.webp" alt="How almost actions are placed + example of how its used." >}}

The _almost_ tiles appear in one of three ways: same _column_, same _row_, or _adjacent_ (to the secret tile of its team).

> The team _to which the tile belongs_ executes its action (if it has one). 

The team picks which of its members takes the action. If this team isn't in the game, pretend the tile is from your own team.

{{% remark %}}
First game? You can turn off all actions when printing your PDF from the website.
{{% /remark %}}

{{< /rules-double-view >}}

{{< rules-table >}}
<!-- -->
    {{< rules-table-entry heading="Spy" icon="spy" >}}
        Point at two tiles that don't belong to you. (Not your secret tile or a matching almost tile.)
    {{< /rules-table-entry >}}
<!-- -->
    {{< rules-table-entry heading="Double" icon="double" >}}
        Immediately give another clue.
    {{< /rules-table-entry >}}
<!-- -->
    {{< rules-table-entry heading="Antsassin Clue" icon="antsassin" >}}
        Give a clue about where antsassins are.
    {{< /rules-table-entry >}}
<!-- -->
    {{< rules-table-entry heading="Secret" icon="secret" >}}
        Give a clue about where secret tiles are. (As opposed to the regular clue about where it is NOT.)
    {{< /rules-table-entry >}}
<!-- -->
    {{< rules-table-entry heading="Rotate" icon="rotate" >}}
        Rotate 3 tiles. You can't pick your secret tile(s).
    {{< /rules-table-entry >}}
<!-- -->
    {{< rules-table-entry heading="Swap" icon="swap" >}}
        Swap 2 tiles with others from the board or new ones from the pile. You can't pick your secret tile(s).
    {{< /rules-table-entry >}}
<!-- -->
    {{< rules-table-entry heading="Big Hint" icon="hint" >}}
        Tap a tile. All other teams must state its type: team, almost, assassin, or otherwise.
    {{< /rules-table-entry >}}
<!-- -->
    {{< rules-table-entry heading="Retry" icon="retry" >}}
        Swap your code card for a new one.
    {{< /rules-table-entry >}}
{{< /rules-table >}}

{{% /rules-block %}}