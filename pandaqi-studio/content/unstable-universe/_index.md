---
type: "gamepage"
boardgame: true

title: "Unstable Universe"
headerTitle: "The only boardgame where you're allowed to cut the paper into pieces"
blurb: "The only boardgame where you're allowed to cut the board into pieces, especially when you are losing."
blurbShort: "The only game in which you're allowed to cut the paper into pieces, especially when you are losing. A [One Paper Game](/boardgames#one-paper-games) for 2--9 players."


color: "blue"


extraJSBoardInclude: true

date: 2020-09-05

difficulty: "no-brainer"
genres: ["family", "racing"]
categories: ["boardgame", "one-paper-game"]
tags: ["cutting", "experimental", "movement"]
themes: ["space", "nature"]

downloadLink: "https://drive.google.com/drive/folders/1wu61RX3FCPVfmWjDTW7yOoeqhsgfuMLr"

multiplayermode: "competitive"
language: EN
playtime: 30-60
playercount: [2,3,4,5,6,7,8,9]
ages: everyone
devlog: "/blog/boardgames/unstable-universe/devlog-unstable-universe/"

---


{{% boardgame-intro /%}}

<div class="limit-width">
{{< video url="video/unstableuniverse_explanation_gif" controls="controls" >}}
</div>

{{% review-container %}}
  {{< review stars="5" author="" >}}
  What a cutting-edge game!
  {{< /review >}}

  {{< review stars="4" author="" >}}
  The second game about rocks, papers and scissors &mdash; and already a classic
  {{< /review >}}

  {{< review stars="4" author="" >}}
  This game cuts right through the crowd with its innovative mechanics and makes the efforts of its competition look paper-thin
  {{< /review >}}
{{% /review-container %}}

{{% section-centered heading="What's the idea?" html="true" unfold="true" %}}

  <h3>When do I win?</h3>
  <p>Be the first to fulfill your personal mission and reach the center!</p>

  <h3>What can I do?</h3>
  <p>Start at the edge. Take the same action each turn: <strong>move to a new node</strong>.</p>
  <ul>
    <li>Some nodes have <strong>special actions</strong>, such as teleportation.</li>
    <li>Most nodes trigger a <strong>cutting action</strong>!</li>
  </ul>

  <h3>Cutting the board?</h3>
  <p>Yes, you must <strong>cut into the game board</strong> following certain rules! If a piece comes loose, it drifts away and is out of the game, including all people on it.</p>

{{% /section-centered %}}

{{% section-centered heading="What do I need?" %}}

Three steps:
1. <span style="color:#f92e2e;">Generate a random board below and print it.</span>
2. <span style="color:#9e2d41;">Read the rules (one page).</span>
3. <span style="color:purple;">Grab some pens, scissors and friends.</span>

**Concerned about ink?** Only page 1, 3 and 4 of the rulebook are relevant for the base game. You can also generate "ink friendly" boards.

**Tip for Teaching?** Explain the first page, immediately start playing! Simply place the node list on the table, so players can look up what something does whilst playing.

{{% /section-centered %}}

{{% boardgame-settings-container type="material" remarks="**Secret board?** The _Expeditions_ expansion adds nodes that trigger whenever their piece of paper comes loose. If you are _able to print double-sided_, these nodes will be placed on the _backside_ of the paper. This means the paper actually has secrets that will be revealed during the game! (Do a test print, though.), **Tip for Cleanup?** When done, you should have a bunch of puzzle pieces ( = all pieces of paper you cut off). Here's the challenge: try to fit them back together to recreate the original paper! Sounds easier than it is :)" %}}
  
{{< boardgame-settings type="board" game_title="Unstable Universe" defaults="true" >}}
  {{< setting-seed >}}
  {{< setting-playercount min="2" max="9" def="4" >}}
  {{< setting-checkbox id="setting-firstGame" text="First game(s)?" remark="Everyone gets the same Mission, to simplify learning and teaching the game." checked="checked" >}}
  {{< setting-checkbox id="setting-secretBoard" text="Secret Board?" >}}
  {{< boardgame-settings-section heading="Expansions" >}}
    {{< setting-checkbox id="setting-expansions-nastyNodes" text="Nasty Nodes?" >}}
    {{< setting-checkbox id="setting-expansions-nodesOfKnowledge" text="Nodes of Knowledge?" >}}
    {{< setting-checkbox id="setting-expansions-theElectricExpansion" text="The Electric Expansion?" >}}
    {{< setting-checkbox id="setting-expansions-extremeExpeditions" text="Extreme Expeditions?" >}}
    {{< setting-checkbox id="setting-expansions-sharpScissors" text="Sharp Scissors?" >}}
  {{< /boardgame-settings-section >}}
{{< /boardgame-settings >}}

{{% /boardgame-settings-container %}}

{{< support >}}

{{% section-centered heading="Credits" %}}
          
Fonts? **SciFly**, created by Tomi Haaparanta.

Check out my other (board)games. Support me if you enjoy my work!

I wrote two detailed articles about the development of this game:
- [(Devlog) Unstable Universe](/blog/boardgames/unstable-universe/devlog-unstable-universe) => about the general process, problems, decision making, why I did what I did</li>
- [(Technical Devlog) Unstable Universe](/blog/boardgames/unstable-universe/tech-devlog-unstable-universe) => about the algorithms and (programming) techniques used for creating this website that generates random game boards

{{% /section-centered %}}

{{% section-centered heading="In action!" html="true" %}}
  <div style="display: flex; width: 100%; flex-wrap: wrap; margin-top: 2rem;">
    {{< figure url="page/unstableuniverse_inaction_1" >}}
    {{< figure url="page/unstableuniverse_inaction_2" >}}
  </div>

  <p style="opacity:0.5;font-size:16px;">
    Two pictures of the game "in action". Some people in my play groups insist on using these way too complex icons, like a sheep or stick figure&mdash;I recommend just using simple shapes in your games. The bottom board is from an older version of the game, but the sunlight in the picture was really nice, so I decided to keep it on this page.
  </p>
{{% /section-centered %}}