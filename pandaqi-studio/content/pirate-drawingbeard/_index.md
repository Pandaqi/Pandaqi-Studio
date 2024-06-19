---
type: "gamepage"
boardgame: true

title: "Pirate Drawingbeard"
headerTitle: "Unravel cryptic drawings to find the secret treasures"
blurb: "1-6 pirates try to discover the secret (drawn) hints of the other players, to find the treasure before the others"
blurbShort: "Discover the treasure by figuring out what secret visual clues the other players are holding!"

color: "blue"


date: 2022-07-20

difficulty: "simple"
genres: ["puzzle"]
categories: ["boardgame", "hybrid-game", "tile-game", "spin-off", "one-paper-game"]
tags: ["deduction", "turn-based", "logic"]
themes: ["pirate"]


downloadLink: "https://drive.google.com/drive/folders/1BU_ccMrmdtSwBwXPqsV8sVUkaZR1Jdjp"

multiplayermode: "competitive"
language: EN
playtime: 40
playercount: [1,2,3,4,5,6]
ages: everyone
devlog: "/blog/boardgames/the-pirate-games/devlog-pirate-drawingbeard/"

---


{{% boardgame-intro /%}}

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

**Offline version?** There's a folder called "Generated Games". Pick one, print it, cut the hints into cards, and you can play completely offline at some later point in time.

{{% /section-centered %}}

{{% boardgame-settings-container type="game" %}}

{{< boardgame-settings type="game" local_storage="pirateDrawingbeardConfig" game_title="Pirate Drawingbeard" >}}
  {{< setting-seed >}}
  {{< setting-playercount min="1" max="6" def="4" >}}
  {{< setting-checkbox id="setting-useRealMaterial" text="Use Real Material?" remark="Enable if you're reusing the printed out material sheet." >}}
  {{< setting-checkbox id="setting-createPremadeGame" text="Create PDF?" remark="Downloads a PDF with a board and hint cards for offline play." >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Colored?" remark="Default maps are grayscale to be ink friendly. This adds full color." >}}
  {{< setting-checkbox id="setting-fastGeneration" text="Fast Generation?" remark="Produces a game much faster, but can lead to more unfair or chaotic games" >}}
  {{< boardgame-settings-section heading="Hints" >}}
    {{< setting-checkbox id="setting-expansions-rotation" text="Rotation Hints?" >}}
    {{< setting-checkbox id="setting-expansions-special" text="Special Hints?" >}}
    {{< setting-checkbox id="setting-expansions-symbols" text="Symbol Hints?" >}}
    {{< setting-checkbox id="setting-expansions-networks" text="Network Hints?" remark="Not playable with real/reused material." >}}
    {{< setting-checkbox id="setting-multiHints" text="Multi Hints?" remark="Players receive 1 hint by default. This allows up to 3. Can make generation faster." >}}
    {{< setting-checkbox id="setting-advancedHints" text="Advanced Hints?" remark="Adds many types of hints that are really hard to figure out." >}}
  {{< /boardgame-settings-section >}}
{{< /boardgame-settings >}}

{{% /boardgame-settings-container %}}

{{< support >}}

{{% section-centered heading="Credits" %}}

Fonts? **Chelsea Market** for headings and fancy text, **Charis Sil** for the rest. Both are freely available on Google Fonts.

Website (boards and game)? The **Phaser 3** library for displaying the map graphics. Otherwise vanilla **JavaScript**.

How does this game work? A smart algorithm! It creates a random map and tries to find a set of hints that lead to exactly _one_ tile. I created the original algorithm for [Pirate Riddlebeard](https://pandaqi.com/pirate-riddlebeard). Then I refined it and switched to _images_ (instead of text hints) for this game.

Want to know how I made that? Check out the [devlog](/blog/boardgames/the-pirate-games/devlog-pirate-drawingbeard).

{{% /section-centered %}}