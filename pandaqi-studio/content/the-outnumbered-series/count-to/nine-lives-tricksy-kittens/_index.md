---
type: "single"
gamepage: true
boardgame: true

title: "Nine Lives: Tricksy Kittens"
headerTitle: "Be the first cat to achieve your nine lives!"
blurb: "A trick-taking game about getting your nine lives before anybody else, by placing smart bets on the right cats."
weightProject: 92

extraCSS: true
downloadLink: "https://drive.google.com/drive/folders/1FxdHCEaLdaSrGDIrCx5yZHMx6P07_Ios"

customHeight: "small"
headerDarkened: true

color: "white"

bgColor: "#161616"
bgColorLink: "#871a45"

textColor: "#f7f7f7"
textColorLink: "#ffcce7"

date: 2024-09-11

difficulty: "simple"
genres: ["family"]
categories: ["boardgame", "card-game"]
tags: ["numbers", "hand-management", "move-through-all", "turn-based", "player-powers", "trick-taking"]
themes: ["nature"]

multiplayermode: "competitive"
language: EN
playtime: 45
playercount: [3,4,5,6,7,8,9]
ages: everyone
devlog: "/blog/boardgames/the-outnumbered-series/nine-lives-tricksy-kittens/"

---

<div class="bg-cats"></div>

{{% boardgame-intro heading="" class="no-shadow" %}}

A trick-taking game about getting your nine lives before anybody else, by placing smart bets on the right cats.

{{% /boardgame-intro %}}

{{% section-centered heading="What do I need?" %}}

Three simple steps.
* Read the short [playful rules](rules).
* Download the base game PDF. (Download > Files > Starter Set.)
* Print, cut, play!

**Want more?** You can also [generate your own material](#material) right on this website!

{{% /section-centered %}}

{{% section-centered heading="Material" anchor="material" html="true" %}}

<p>Pick your desired settings and click the button! When in doubt, just use the defaults for your first games.</p>

{{< boardgame-settings type="game" local_storage="nineLivesTricksyKittensConfig" btn_label="Generate Material" game_title="Nine Lives: Tricksy Kittens" defaults="true" >}}
  {{< setting-checkbox id="setting-includePowers" text="Include Powers?" checked="checked" remark="Remove them if you're sure you never want to play with them." >}}
  {{< boardgame-settings-section heading="Suits" >}}
    {{< setting-checkbox-multiple id="setting-suits" values="hearts,spades,diamonds,clubs,hourglasses,cups,stars,cats,crowns" values_checked="hearts,spades,diamonds,clubs" >}}
  {{< /boardgame-settings-section >}}
{{< /boardgame-settings >}}

<p class="settings-remark"><strong>Not working? Or unsure what to do?</strong> The "Download" button above has PDFs I already made for you! Pick any one of those.</p>

<p class="settings-remark">As stated in the rules, you need 1 suit per player. Each suit is only 9 cards (1 page in regular size), so when unsure, just include all of them.</p>

{{% /section-centered %}}

{{% section-centered heading="Credits" anchor="credits" %}}

The fonts used are **Puss in Boots** (headings, fancy text) and **Catcafe** (body text, readable). Both freely available online. Parts of the illustrations were generated with AI. Everything else is mine.

This game is obviously a variant on the original game [Nine Lives](/the-outnumbered-series/nine-lives/).

To most gamers, the idea of trick taking is second nature. To people who have never played such a game---or rarely do so---it needs quite some explanation. That's why this version didn't become the "original", but rather a spin-off to try for those who think they'll enjoy it.

This one was also the hardest to make, as my first _five_ attempts were fine and playable, but just felt very mediocre. It took a return to one of my favorite card games (Spades) to make it all work.

Do you have a favorite version of Nine Lives? Let me know which one and why!

For more information, as always, read my [detailed developer diary on Pandaqi Blog](/blog/boardgames/the-outnumbered-series/nine-lives-tricksy-kittens/).

{{% /section-centered %}}