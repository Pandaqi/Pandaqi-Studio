---
type: "project"

title: "Unstable Universe"
blurb: "The only boardgame where you're allowed to cut the board into pieces, especially when you are losing."
# blurb: "The only game in which you're allowed to cut the paper into pieces, especially when you are losing. A [One Paper Game](/boardgames#one-paper-games) for 2--9 players."

date: 2020-09-05

difficulty: "no-brainer"
genres: ["family", "racing"]
categories: ["board-game", "one-paper-game"]
tags: ["cutting", "experimental", "movement"]
themes: ["space", "nature"]

downloadLink: "https://drive.google.com/drive/folders/1wu61RX3FCPVfmWjDTW7yOoeqhsgfuMLr"

multiplayermode: "competitive"
language: EN
playtime: 30-60
playercount: [2,3,4,5,6,7,8,9]
ages: everyone
devlog: "/blog/boardgames/unstable-universe/devlog-unstable-universe/"

media: [video/unstableuniverse_explanation_gif, page/unstableuniverse_inaction_1, page/unstableuniverse_inaction_2]

---

{{% review-container %}}
  {{< review stars="5" author="" >}}
  What a cutting-edge game!
  {{< /review >}}

  {{< review stars="4" author="" >}}
  The second game about rocks, papers and scissors---and already a classic
  {{< /review >}}

  {{< review stars="4" author="" >}}
  This game cuts right through the crowd with its innovative mechanics and makes the efforts of its competition look paper-thin
  {{< /review >}}
{{% /review-container %}}

## What's the idea?

### When Do I Win?
Be the first to fulfill your personal mission and reach the center!

### What can I do?
Start at the edge. Take the same action each turn: **move to a new node**.

* Some nodes have **special actions**, such as teleportation.
* Most nodes trigger a **cutting action**!

### Cutting the board?
Yes, you must **cut into the game board** following certain rules! If a piece comes loose, it drifts away and is out of the game, including all people on it.

## What do I need?

Three steps:
1. <span style="color:#f92e2e;">Generate a random board below and print it.</span>
2. <span style="color:#9e2d41;">Read the rules (one page).</span>
3. <span style="color:purple;">Grab some pens, scissors and friends.</span>

**Concerned about ink?** Only page 1, 3 and 4 of the rulebook are relevant for the base game. You can also generate "ink friendly" boards.

**Tip for Teaching?** Explain the first page, immediately start playing! Simply place the node list on the table, so players can look up what something does whilst playing.

**Tip for Cleanup?** When done, you should have a bunch of puzzle pieces ( = all pieces of paper you cut off). Here's the challenge: try to fit them back together to recreate the original paper! Sounds easier than it is :)


{{% boardgame-settings-container type="material" %}}
  
{{< boardgame-settings type="board" game_title="Unstable Universe" local_storage="unstableUniverseConfig" defaults="true" >}}
  {{< setting-seed >}}
  {{< setting-playercount min="2" max="9" def="4" >}}
  {{< setting-checkbox id="setting-firstGame" text="First game(s)?" remark="Everyone gets the same Mission, to simplify learning and teaching the game." checked="checked" >}}
  {{< boardgame-settings-section heading="Expansions" >}}
    {{< setting-checkbox id="setting-expansions-nastyNodes" text="Nasty Nodes?" >}}
    {{< setting-checkbox id="setting-expansions-nodesOfKnowledge" text="Nodes of Knowledge?" >}}
    {{< setting-checkbox id="setting-expansions-theElectricExpansion" text="The Electric Expansion?" >}}
    {{< setting-checkbox id="setting-expansions-extremeExpeditions" text="Extreme Expeditions?" >}}
    {{< setting-checkbox id="setting-expansions-sharpScissors" text="Sharp Scissors?" >}}
  {{< /boardgame-settings-section >}}
{{< /boardgame-settings >}}

{{% /boardgame-settings-container %}}


## Credits
          
Fonts? **SciFly**, created by Tomi Haaparanta.

Check out my other (board)games. Support me if you enjoy my work!

I wrote two detailed articles about the development of this game:
- [(Devlog) Unstable Universe](/blog/boardgames/unstable-universe/devlog-unstable-universe) => about the general process, problems, decision making, why I did what I did</li>
- [(Technical Devlog) Unstable Universe](/blog/boardgames/unstable-universe/tech-devlog-unstable-universe) => about the algorithms and (programming) techniques used for creating this website that generates random game boards

Thescreenshots contain two pictures of the game "in action". Some people in my play groups insist on using these way too complex icons, like a sheep or stick figure---I recommend just using simple shapes in your games. The bottom board is from an older version of the game, but the sunlight in the picture was really nice, so I decided to keep it on this page.