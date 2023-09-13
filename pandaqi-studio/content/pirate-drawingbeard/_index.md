---
type: "single"
draft: false
gamepage: true
boardgame: true

title: "Pirate Drawingbeard"
headerTitle: "Pirate Drawingbeard | Unravel cryptic drawings to find the secret treasures"
blurb: "1-6 pirates try to discover the secret (drawn) hints of the other players, to find the treasure before the others"

fullHeaderImg: "pirate_drawingbeard_header"
headerImg: "pirate_drawingbeard_header"

headerThumb: "favicon"

customHeight: "small"
headerDarkened: true

color: "blue"

bgColor: "#b2f6ff"
bgColorLink: "#ff8f20"

textColor: "#01202b"
textColorLink: "#582d11"

googleFonts: "https://fonts.googleapis.com/css2?family=Chelsea+Market&family=Charis+SIL:ital,wght@0,400;1,400;1,700&display=swap"

date: 2022-07-20

categories: ["boardgame"]
tags: ["hybrid", "opg"]

extraCSS: true
extraJSGame: true

downloadLink: "https://drive.google.com/drive/folders/1BU_ccMrmdtSwBwXPqsV8sVUkaZR1Jdjp"

multiplayermode: "competitive"
language: EN
genre: ["logic", "puzzle", "deduction"]
playtime: 40
playercount: [1,2,3,4,5,6]
complexity: low
ages: everyone

---


{{% boardgame-intro heading="" img="pirate_drawingbeard_header" url="https://drive.google.com/drive/folders/1BU_ccMrmdtSwBwXPqsV8sVUkaZR1Jdjp" %}}

Discover the treasure by figuring out what secret visual clues the other players are holding!

{{% /boardgame-intro %}}

<!-- Introduction + explanation text -->
{{% section-centered heading="What's the idea?" %}}

Everyone receives a unique **clue** in the form of a drawing. For example: "The treasure is next to a palm tree".

When you know _all_ the clues, they point to exactly _one_ tile on the map: the treasure!

But you can't just share your clues: you can only ask the players questions in mysterious ways ...

This game is a spin-off of [Pirate Riddlebeard](https://pandaqi.com/pirate-riddlebeard). It was designed to be **language independent** (all clues are visual) and use **simpler maps and clues**. A more kid/family friendly version of the same idea!

{{% /section-centered %}}

{{% section-centered heading="What do I need?" %}}

Three steps.
* Read the rules. (Click the "Download" button.)
* Grab some pens and papers.
* Start the [game](#game) on your phone and play!

**Reusable version?** You can also download a material sheet _once_ and reuse that for all your games!

**Phone?** You only need a device (and internet) to generate the setup. Once that's done, you can put it away.

**Offline version?** There's a folder called "Premade Games". Pick one, print it, cut the hints into cards, and you can play completely offline at some later point in time.

{{% /section-centered %}}

{{% section-centered heading="Game" html="true" anchor="game" %}}

<p>Input your desired settings. Click "start game".</p>
<p>For your <strong>first game</strong>, just input your player count and immediately start. Add the other options when you know the game and want more!</p>

  {{< boardgame-settings type="game" local_storage="pirateDrawingbeardConfig" >}}
    {{< setting-seed >}}
    {{< setting-hidden id="setting-gameTitle" text="Pirate Drawingbeard" >}}
    {{< setting-playercount min="1" max="6" def="4" >}}
    {{< setting-checkbox id="setting-useRealMaterial" text="Use Real Material?" remark="Enable if you're reusing the printed out material sheet." >}}
    {{< setting-checkbox id="setting-createPremadeGame" text="Create premade game?" remark="Downloads a PDF with a board and hint cards for offline play." >}}
    {{< setting-checkbox id="setting-inkFriendly" text="Colored?" remark="Default maps are grayscale to be print friendly. This adds full color." >}}
    {{< setting-checkbox id="setting-fastGeneration" text="Fast Generation?" remark="Produces a game much faster, but can lead to more unfair or chaotic games" >}}
    <h3 class="settings-heading">Hints</h3>
    {{< setting-checkbox id="setting-expansions-rotation" text="Rotation Hints?" >}}
    {{< setting-checkbox id="setting-expansions-special" text="Special Hints?" >}}
    {{< setting-checkbox id="setting-expansions-symbols" text="Symbol Hints?" >}}
    {{< setting-checkbox id="setting-expansions-networks" text="Network Hints?" remark="Not playable with real/reused material." >}}
    {{< setting-checkbox id="setting-multiHints" text="Multi Hints?" remark="Players receive 1 hint by default. This allows up to 3. Can make generation faster." >}}
    {{< setting-checkbox id="setting-advancedHints" text="Advanced Hints?" remark="Adds many types of hints that are really hard to figure out." >}}
  {{< /boardgame-settings >}}

{{% /section-centered %}}

{{< support >}}

{{% section-centered heading="Credits" %}}

Fonts? **Chelsea Market** for headings and fancy text, **Charis Sil** for the rest. Both are freely available on Google Fonts.

Website (boards and game)? The **Phaser 3** library for displaying the map graphics. Otherwise vanilla **JavaScript**.

How does this game work? A smart algorithm! It creates a random map and tries to find a set of hints that lead to exactly _one_ tile. I created the original algorithm for [Pirate Riddlebeard](https://pandaqi.com/pirate-riddlebeard). Then I refined it and switched to _images_ (instead of text hints) for this game.

Want to know how I made that? Check out the [devlog](/blog/boardgames/the-pirate-games/devlog-pirate-drawingbeard).

{{% /section-centered %}}