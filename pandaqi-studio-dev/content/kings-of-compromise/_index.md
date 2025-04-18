---
draft: true
gamepage: true
boardgame: true

title: "Kings of Compromise"
headerTitle: "Kings of Compromise | Design your kingdom to make all players happy"
blurb: "2-6 players try to discover the kingdom that satisfies everyone's secret wishes by changing one thing at a time"

fullHeaderImg: "timelytransports_header_faded"
headerImg: "timelytransports_header_faded"


color: "green"


googleFonts: "https://fonts.googleapis.com/css2?family=Chelsea+Market&display=swap"

date: 2022-06-02

categories: ["boardgame"]
tags: ["hybrid"]

downloadLink: "https://drive.google.com/drive/folders/1_gDZ9A9oi0FvbPjqjx4DDd19GO-NqZKL"

multiplayermode: "cooperative"
language: EN
genre: ["logic", "puzzle", "deduction"]
playtime: 20
playercount: [2,3,4,5,6]
complexity: low
ages: everyone

---


{{% boardgame-intro heading="" img="timelytransports_header_faded" url="https://drive.google.com/drive/folders/1_gDZ9A9oi0FvbPjqjx4DDd19GO-NqZKL" %}}

You want more elves. They want fewer farms. A third player somehow really loves trees. You're obviously not going to simply _say_ what you want, so you'll need to discover the wishes of the other players _while_ designing the perfect kingdom.

{{% /boardgame-intro %}}

<!-- Introduction + explanation text -->
{{% section-centered heading="What's the idea?" %}}

Everyone receives a list of **secret wishes**. The kingdom starts in a state that doesn't make _anybody_ happy!

Each turn, however, you're allowed to change **one thing** about the kingdom and ask the others if they're happy with that.

Try to figure out everyone's wishes, and communicate your own, to design the perfect kingdom before time runs out. 

{{% /section-centered %}}

{{% section-centered heading="What do I need?" %}}

Three steps.
* Read the rules. (Click the "Download" button.)
* Print the material sheet and cut the individual tiles/tokens.
* Start the [game](#game) on your phone and play!

**Phone?** You only need a device (and internet) to generate the setup. Once that's done, you can put it away.

**Offline version?** Besides the rulebook you'll also find a folder called "Premade Games". Pick one, print it, cut the hints into cards, and you can play completely offline at some later point in time.

{{% /section-centered %}}

{{% section-centered heading="Game" html="true" anchor="game" %}}

<p>Input your desired settings. Click "start game".</p>

  {{< boardgame-settings type="game" local_storage="kingsOfCompromiseConfig" >}}

    {{< setting-hidden id="setting-gameTitle" text="Kings of Compromise" >}}
    {{< setting-seed >}}
    {{< setting-playercount min="2" max="6" def="4" >}}

  {{< /boardgame-settings >}}

<p><strong>Remark:</strong> for your first game(s), turn off everything. Once you get the hang of it, introduce more elements to the maps/rules!</p>
<p><strong>Remark:</strong> your browser might register this as a pop-up. It's not, I would <em>never</em> show pop-ups. Simply allow it.</p>

{{% /section-centered %}}

{{% section-centered heading="Feedback & Credits" %}}

Played the game? Let me know what you think! Mail me at [schoolofpanda@gmail.com](mailto:schoolofpanda@gmail.com)
          
Fonts? **Grenze Gotisch** for most text, freely available on Google Fonts.

Website (boards and game)? The **Phaser 3** library for displaying the map graphics. Otherwise vanilla **JavaScript**.

How does this game work? It relies on an algorithm I programmed. It designs a set of wishes and a kingdom that satisfies all of them. Then it scrambles that "perfect kingdom" to get the starting map, and simply distributes the wishes evenly over the players. (It's way more complicated, but this is the gist of it.)

Want to know how I made that? I've written articles!
- @TODO (deduction boardgames article)
- @TODO (devlog)

{{% /section-centered %}}