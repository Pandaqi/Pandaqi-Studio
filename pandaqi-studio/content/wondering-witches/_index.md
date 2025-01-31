---
type: "gamepage"
boardgame: true

title: "Wondering Witches"
headerTitle: "Brew potions, deduce recipes, and enchant the poorly communicating High Witch"
blurb: "Brew a secret potion to defeat your greatest enemies—as witches tend to do—but the High Witch is terrible at communicating recipes ..."
blurbShort: "Ten ingredients, one correct combination. A cooperative [One Paper Game](/boardgames#one-paper-games) for 1--5 players about finding the right potion, where ingredients have wondrous effects and the High Witch is terrible at communicating."

customHeight: "small-medium"

color: "purple"

date: 2023-02-14 # old publishing date: 2020-04-28

difficulty: "kids-can-play"
genres: ["family"]
categories: ["boardgame", "one-paper-game", "hybrid-game"]
tags: ["cooking", "deduction", "logic"]
themes: ["magic", "fantasy"]

downloadLink: "https://drive.google.com/open?id=1y4WescX98VLllbV7FqojADUnAr5fc8Vx"

multiplayermode: "cooperative"
language: EN
playtime: 20-60
playercount: [1,2,3,4,5]
ages: everyone
requirements: "A blank paper!"
devlog: "/blog/boardgames/wondering-witches/devlog-wondering-witches/"
---

{{% boardgame-intro /%}}

{{% section-centered heading="How can I play?" %}}

Three steps.

* Click the download button above to find the rulebook.
* Grab a blank paper and pens.
* Visit this website on a device.

There's also a solo mode, a competitive variant and an offline variant (that doesn't need this website).

{{% /section-centered %}}

{{% section-centered heading="How does it work?" unfold="true" %}}

You win by finding the secret recipe ( = the secret number attached to each ingredient). You lose if the board is full.

On your turn, call out an ingredient. Everybody either ...

* **Places** that in a garden of theirs
* Or **grows** an entire garden (which contains that ingredient)

When satisfied, **test a potion**! Input a garden on the game interface; it tells you the results. Maybe some parts were correct, others were not. Maybe an effect is triggered that changes everything!

Brew your potions wisely ... and you might discover the secret combination.

{{% /section-centered %}}

{{% section-centered heading="Board" html="true" anchor="board" %}}
  
<p>Input your settings. Click the button. Copy the gardens and ingredients to your paper.</p>

{{< boardgame-settings type="board" local_storage="wonderingWitchesConfig" game_title="Wondering Witches" >}}
	{{< setting-playercount id="setting-numPlayers" min="1" max="4" def="4" >}}
	{{< setting-checkbox id="setting-supercells" text="Supercells?" remark="Turns some cells into a special one!" >}}
	{{< setting-checkbox id="setting-pageBack" text="Two-sided?" remark="With expansions enabled, you'll need both sides of the paper (64 cells) to stand a chance!" >}}
{{< /boardgame-settings >}}

<p style="font-size:0.5em;opacity:0.66;">The generator isn't working? Don't worry! The "Download" button also gives you PDFs with valid boards! (And a colorized game board, if you don't like blank papers.)</p>

{{% /section-centered %}}

{{% section-centered heading="The High Witch" anchor="high-witch" html="true" %}}

<p>Input your settings, click the button. A new page opens with the interface for testing your potions!</p>

{{< boardgame-settings type="game" local_storage="wonderingWitchesConfig" game_title="Wondering Witches" >}}
	{{< setting-checkbox id="setting-competitive" text="Competitive?" >}}
	{{< setting-checkbox id="setting-events" text="Events?" checked="checked" >}}
	{{< setting-checkbox id="setting-freeClue" text="Free Clue?" checked="checked" remark="Start the game with a free (cryptic) hint. Recommended." >}}
	{{< setting-checkbox id="setting-effects" text="Effects?" >}}
	{{< setting-enum id="setting-recipeLength" text="Number of Ingredients?" values="4,5,6,7,8,9,10" def="4" valaskey="true" remark="The secret recipe is always length four. But other ingredients make it harder to find it." >}}
	{{< setting-checkbox id="setting-dramaDecoys" text="Drama Decoys?" remark="Decoy ingredients can now be one of three different types." >}}
{{< /boardgame-settings >}}

{{% /section-centered %}}

{{< support >}}

{{% section-centered heading="Credits" %}}

Fonts? **Niconne** for headings and **Mali** for the body text. Both freely available on Google Fonts.

The digital part was made using standard website code (HTML/CSS/JavaScript) and the Phaser (v3) framework 

As always, I wrote two devlogs about the development process of this game:
- [(Devlog) Wondering Witches](/blog/boardgames/wondering-witches/devlog-wondering-witches) => about the whole process for the (board)game
- [(Technical Devlog) Wondering Witches](/blog/boardgames/wondering-witches/tech-devlog-wondering-witches) => about the technical side, programming this website
- [(Update) Wondering Witches](/blog/boardgames/wondering-witches/v2-update) => about the huge update I did a few years later, making the game as good as it is now

{{% /section-centered %}}