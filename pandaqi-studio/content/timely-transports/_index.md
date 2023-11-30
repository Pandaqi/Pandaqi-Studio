---
type: "single"
gamepage: true
boardgame: true

title: "Timely Transports"
headerTitle: "Timely Transports | The first ever hybrid between boardgames and computer games"
blurb: "The first ever hybrid board+smartphone game for 1–8 players about transporting exotic goods across the jungle!"

fullHeaderImg: "timelytransports_header"
headerImg: "timelytransports_header"

customHeight: "small-medium"

color: "green"

bgColor: "#FFDDBB"
bgColorLink: "brown"

textColor: "#2B3B2A"
textColorLink: "#FFCCAA"

googleFonts: "https://fonts.googleapis.com/css2?family=Rowdies:wght@400;700&family=Yanone+Kaffeesatz:wght@400;700&display=swap"

extraCSS: true
extraJSBoard: true
extraJSBoardInclude: true

date: 2020-07-02

categories: ["boardgame"]
tags: ["hybrid", "opg"]

downloadLink: "https://drive.google.com/drive/folders/1d0eedJEL16SlrI33umvVDxZOgPvqQ25r"

multiplayermode: "competitive"
language: EN
genre: ["realtime", "speed", "moving", "strategy"]
playtime: 20
playercount: [1,2,3,4,5,6,7,8]
complexity: low
ages: everyone

---


{{% boardgame-intro heading="" img="timelytransports_header_faded" %}}

A hybrid board+smartphone game for 1&ndash;8 players about transporting exotic goods across the jungle.

{{% /boardgame-intro %}}

<!-- Introduction + explanation text -->
{{% section-centered heading="What do I do?" %}}

**Lead a transport company in the jungle!** Bamboo, birds, bees, anything can appear. Deliver it to the right city for points.

Moving a vehicle? Start a timer! Your movement is done when it runs out. But forget about it ... and you'll face the consequences.

Your vehicle is idling on a city when another player arrives? It's bumped off the board! 

Keep all your vehicles going, all the time, and you might just win!

{{% /section-centered %}}

{{% section-centered heading="What do I need?" %}}
The game is played on a **physical** board with pieces to move around, but the timers (and more) are controlled by your **smartphone**. Each player needs to have a smartphone with them.

{{< figure url="timelytransports_tutorial_2" class="small-centered-image" alt="Tutorial: Moving in realtime, with timers on your smartphone" >}}

Print these files. (Use the "Download" button.)
- Two pages of materials ( = the vehicles and resource chips).
- The rules &mdash; including images, setup and examples &mdash; are only three pages.

Use this website
- Scroll down to the [generator](#board) to print a game board.
- Each player visits the [game](#game) section to play.

The **campaign** has six scenarios, increasing in difficulty, allowing you to get comfortable with the game before adding new rules and mechanics.

{{% /section-centered %}}

{{% section-centered heading="Game" html="true" anchor="game" %}}

<p>Input your desired settings. Click "start game". It takes you to a new page. Don't start until all players are ready!</p>

  {{< boardgame-settings type="game" local_storage="timelyTransportsConfig" >}}
    {{< setting-hidden id="setting-gameTitle" text="Timely Transports" >}}
    {{< setting-playercount min="1" max="8" def="4" id="setting-playerCount" >}}
    {{< setting-enum id="setting-difficulty" text="Scenario?" values="1. Training Wheels,2. Good Luck,3. Fancy Vehicles,4. Another Upgrade,5. Extraordinary Events,6. Crazy Cargo" keys="Training Wheels,Good Luck,Fancy Vehicles,Another Upgrade,Extraordinary Events,Crazy Cargo" keep-case="true" >}}
    {{< setting-enum id="setting-playerRank" text="Which player are you?" values="-- ignore --,1st,2nd,3rd,4th,5th,6th,7th,8th" keys="0,1,2,3,4,5,6,7,8" remark="If used, each player must input a unique rank. (Order does not matter.) By knowing which player you are, the game can space out events and sound effects more fairly and evenly." >}}
    {{< setting-enum id="setting-timeout" text="Add Timeouts?" values="-- ignore --,Every 5 minutes,Every 10 minutes" keys="0,5,10" remark="If some of your players find the game too stressful, include regular timeouts. This gives them some time to breathe and make new plans once in a while." >}}
  {{< /boardgame-settings >}}

<p style="font-size: 0.75em;"><strong>Remark:</strong> because it opens a new page, your browser might register this as a pop-up. It's not, I <em>never</em> show pop-ups.</p>

{{% /section-centered %}}

{{% section-centered heading="Board" html="true" anchor="board" %}}
  
  <p>Input your desired settings. Click "generate board" until you get one you like.</p>
  <p>The "split board" option is highly recommended! It creates a huge board consisting of 4 papers, which allows everyone around a table to easily reach all destinations.</p>

  {{< boardgame-settings type="board" >}}
    {{< setting-hidden id="setting-gameTitle" text="Timely Transports" >}}
    {{< setting-playercount min="1" max="8" def="4" >}}
    {{< setting-enum id="settingBoard-difficulty" text="Scenario?" values="1. Training Wheels,2. Good Luck,3. Fancy Vehicles,4. Another Upgrade,5. Extraordinary Events,6. Crazy Cargo" keys="Training Wheels,Good Luck,Fancy Vehicles,Another Upgrade,Extraordinary Events,Crazy Cargo" keep-case="true" >}}
    {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Removes many decorational elements and turns the board (mostly) grayscale." >}}
    {{< setting-checkbox id="settingBoard-splitBoard" text="Split Board?" remark="If disabled, the board is only <em>one</em> piece of paper (instead of four papers that combine into a larger board). Highly recommended to keep this enabled." checked="true" >}}
    {{< setting-checkbox id="settingBoard-cityBonus" text="Bad City Bonus?" remark="If the computer thinks a capital is worse than the others, it will give it a few bonus points. The owner of this capital gets these for free at the start of the game." >}}
    {{< setting-checkbox id="settingBoard-rulesReminder" text="Add rules reminder?" checked="true" >}}
  {{< /boardgame-settings >}}

  <p style="font-size: 0.75em;"><strong>Not working?</strong> Don't worry. Click the "Download" button and you'll also find already generated boards. Use one of those! (And send me an email with the details of your problem.)</p>

{{% /section-centered %}}

{{< support >}}

{{% section-centered heading="Credits" %}}
          
Fonts? **Rowdies** for header text. **Yanone Kaffeesatz** for body text. Both freely available on Google Fonts.

Website (boards and game)? The **Phaser 3** library for programming, also completely free and open source.

Everything else (concept, code, graphics, rules, ...) was completely made by me, Pandaqi! I've written two in-depth articles about the creation of this game (as I usually do):
- [[Devlog] Timely Transports](/blog/boardgames/timely-transports/devlog-timely-transports): about problems I faced, solutions I found, why I chose to do certain things (or not do them), general interesting stuff about game design.
- [[Technical Devlog] Timely Transports](/blog/boardgames/timely-transports/tech-devlog-timely-transports): about the actual algorithms used for the game interface and generating the game board, both high overview and actual code samples
- [[Update] Timely Transports](/blog/boardgames/timely-transports/update-timely-transports): about the huge update I did for the game, half a year after release. Why I did it, what changed, and more.

{{% /section-centered %}}