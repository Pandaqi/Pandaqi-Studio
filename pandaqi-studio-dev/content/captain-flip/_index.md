---
type: "single"
gamepage: true
boardgame: true

title: "Captain Flip"
headerTitle: "Remember the locations of the best tiles and flip them before anyone else."
blurb: "A mix between a memory game and strategy game, where flipping tiles gives you actions, and scoring the tiles you wanted is a challenge."

extraCSS: true
downloadLink: "https://drive.google.com/drive/folders/1XyTJDG_9tOtEwNdNxfAAKBFr6LHghwIX"

customHeight: "small"
headerDarkened: true

color: "turquoise"

bgColor: "#003401"
bgColorLink: "#ff1f1f"

textColor: "#f2ffef"
textColorLink: "#ffe9e9"


date: 2023-01-01 # 2024-12-26

categories: ["boardgame"]
tags: ["simple", "sea", "animals"]

multiplayermode: "competitive"
language: EN
genre: ["tile"]
playtime: 30
playercount: [2,3,4,5,6]
complexity: low
ages: everyone
devlog: "/blog/boardgames/captain-flip/"

---

{{% boardgame-intro heading="" %}}

Remember the locations of the best tiles and flip them before anyone else.

{{% /boardgame-intro %}}

{{% section-centered heading="What do I need?" %}}

Three simple steps.
* Read the short [playful rules](rules).
* Download the base game PDF. (Download > Files > Base Pack.)
* Print, cut, play!

This game is incredibly simple (just flip one tile and take its action) and well-suited for families and kids. This does require text on the tiles, however, which means players need some knowledge of the English language.

**Want more?** You can also [generate your own material](#material) right on this website!

{{% /section-centered %}}

{{% section-centered heading="Material" anchor="material" html="true" %}}

<p>Pick your desired settings and click the button! When in doubt, just use the defaults for your first games.</p>

{{< boardgame-settings type="game" local_storage="captainFlipConfig" btn_label="Generate Material" >}}
	{{< setting-hidden id="setting-gameTitle" text="Captain Flip" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly grayscale." >}}
  {{< setting-enum id="setting-itemSize" text="Card Size?" values="small,regular,large" valaskey="true" def="regular" >}}
{{< /boardgame-settings >}}

<p class="settings-remark"><strong>Not working? Or unsure what to do?</strong> The "Download" button above has PDFs I already made for you! Pick any one of those.</p>

<p class="settings-remark"><strong>What about expansions?</strong> You can play all expansions and variants using the same minimalist base material!</p>

{{% /section-centered %}}

{{% section-centered heading="Credits" anchor="credits" %}}

This game started its life as a simple idea: "could I create a game where your only action each turn is to _flip a tile_?" This felt like it should lead to a game that's very easy to learn but has lots of depth. It would combine a _memory game_ (which tiles are where, and what do they do?) and a _strategy game_ (flipping the right ones in the right way).

And that's how this game was made! I realized we needed different actions for _flipping faceup_ and _flipping facedown_. I invented some fun actions and slight rules tweaks to make it all balanced. Then I did a paper prototype that was too complicated, simplified it, and ended up with Captain Flip.

The fonts used are **Underlapped** (headings, short texts) and **Sofia Sans Condensed** (body, paragraphs). Both are freely available. The sea creatures were generated using image AI. Everything else (code, design, rules, drawings, etcetera) is entirely mine.

(Underlapped is what is called a "double font". Each letter is itself twice. Very neat, discovered that while researching fonts for this game, and it just fit the theme---of each tile having two possible actions or states---perfectly.)

For more information, as always, read my [detailed developer diary on Pandaqi Blog](/blog/boardgames/captain-flip/).

{{% /section-centered %}}