---
type: "project"


title: "Timely Transports"
blurb: "The first ever hybrid board+smartphone game for 1–8 players about transporting exotic goods across the jungle!"
# blurb: "A hybrid board+smartphone game for 1–8 players about transporting exotic goods across the jungle."

date: 2020-07-02

difficulty: "simple"
genres: ["party", "family"]
categories: ["board-game", "one-paper-game", "hybrid-game"]
tags: ["transportation", "movement", "real-time", "fast-paced", "shared-map", "procedural-generation", "campaign", "resource-management"]
themes: ["vector"]

downloadLink: "https://drive.google.com/drive/folders/1d0eedJEL16SlrI33umvVDxZOgPvqQ25r"

multiplayermode: "competitive"
language: EN
playtime: 20
playercount: [1,2,3,4,5,6,7,8]
ages: everyone
devlog: "/blog/boardgames/timely-transports/devlog-timely-transports/"

media: [timelytransports_tutorial_1, timelytransports_tutorial_2]

---

<!-- Introduction + explanation text -->

**Lead a transport company in the jungle!** 

Bamboo, birds, bees, anything can appear. Deliver it to the right city for points.

Moving a vehicle? Start a timer! Your movement is done when it runs out. But forget about it ... and you'll face the consequences.

Your vehicle is idling on a city when another player arrives? It's bumped off the board! 

Keep all your vehicles going, all the time, and you might just win!

## What do I need?

The game is played on a **physical** board with pieces to move around, but the timers (and more) are controlled by your **smartphone**. Each player needs to have a smartphone with them.

Print these files. (Use the "Download" button.)
* Two pages of materials ( = the vehicles and resource chips).
* The rules &mdash; including images, setup and examples &mdash; are only three pages.

Use this website
* Scroll down to the [generator](#board) to print a game board.
* Each player visits the [game](#game) section to play.

The **campaign** has six scenarios, increasing in difficulty, allowing you to get comfortable with the game before adding new rules and mechanics.

{{% boardgame-settings-container type="game" remarks="**Don't** tap to start on your device until all players are ready!||Because it opens a new page, your browser might register this as a pop-up. It's not, I would never show pop-ups." %}}

{{< boardgame-settings type="game" local_storage="timelyTransportsConfig" game_title="Timely Transports" >}}
  {{< setting-playercount min="1" max="8" def="4" id="setting-playerCount" >}}
  {{< setting-enum id="setting-difficulty" text="Scenario?" values="1. Training Wheels,2. Good Luck,3. Fancy Vehicles,4. Another Upgrade,5. Extraordinary Events,6. Crazy Cargo" keys="Training Wheels,Good Luck,Fancy Vehicles,Another Upgrade,Extraordinary Events,Crazy Cargo" keep-case="true" >}}
  {{< setting-enum id="setting-playerRank" text="Which player are you?" values="-- ignore --,1st,2nd,3rd,4th,5th,6th,7th,8th" keys="0,1,2,3,4,5,6,7,8" remark="If used, each player must input a unique rank. (Order does not matter.) By knowing which player you are, the game can space out events and sound effects more fairly and evenly." >}}
  {{< setting-enum id="setting-timeout" text="Add Timeouts?" values="-- ignore --,Every 5 minutes,Every 10 minutes" keys="0,5,10" remark="If some of your players find the game too stressful, include regular timeouts. This gives them some time to breathe and make new plans once in a while." >}}
{{< /boardgame-settings >}}

{{% /boardgame-settings-container %}}

{{% boardgame-settings-container type="board" remarks="The **split board** option is highly recommended! It creates a huge board consisting of 4 papers, which allows everyone around a table to easily reach all destinations." %}}

{{< boardgame-settings type="board" local_storage="timelyTransportsConfig" game_title="Timely Transports" defaults="true" >}}
  {{< setting-playercount min="1" max="8" def="4" >}}
  {{< setting-enum id="settingBoard-difficulty" text="Scenario?" values="1. Training Wheels,2. Good Luck,3. Fancy Vehicles,4. Another Upgrade,5. Extraordinary Events,6. Crazy Cargo" keys="Training Wheels,Good Luck,Fancy Vehicles,Another Upgrade,Extraordinary Events,Crazy Cargo" keep-case="true" >}}
  {{< setting-checkbox id="settingBoard-splitBoard" text="Split Board?" remark="If disabled, the board is only <em>one</em> piece of paper (instead of four papers that combine into a larger board). Highly recommended to keep this enabled." checked="true" >}}
  {{< setting-checkbox id="settingBoard-cityBonus" text="Bad City Bonus?" remark="If the computer thinks a capital is worse than the others, it will give it a few bonus points. The owner of this capital gets these for free at the start of the game." >}}
  {{< setting-checkbox id="settingBoard-rulesReminder" text="Add rules reminder?" checked="true" >}}
{{< /boardgame-settings >}}

{{% /boardgame-settings-container %}}


## Credits
          
Fonts? **Rowdies** for header text. **Yanone Kaffeesatz** for body text. Both freely available on Google Fonts.

Website (boards and game)? The **Phaser 3** library for programming, also completely free and open source.

Everything else (concept, code, graphics, rules, ...) was completely made by me, Pandaqi! I've written two in-depth articles about the creation of this game (as I usually do):
- [(Devlog) Timely Transports](/blog/boardgames/timely-transports/devlog-timely-transports): about problems I faced, solutions I found, why I chose to do certain things (or not do them), general interesting stuff about game design.
- [(Technical Devlog) Timely Transports](/blog/boardgames/timely-transports/tech-devlog-timely-transports): about the actual algorithms used for the game interface and generating the game board, both high overview and actual code samples
- [(Update) Timely Transports](/blog/boardgames/timely-transports/update-timely-transports): about the huge update I did for the game, half a year after release. Why I did it, what changed, and more.

