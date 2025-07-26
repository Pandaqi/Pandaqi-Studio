---
type: "project"
draft: true 


title: "Conductors of the Underground"
headerTitle: "Fix the transit mess in Hades' underworld"
blurb: "Lala vlavla"


buttonColor: "#7C593B"

googleFonts: "https://fonts.googleapis.com/css2?family=Secular+One&family=Manrope:wght@300;500;800&display=swap"

extraJS: true

date: 2021-04-29

categories: ["board-game"]
tags: [""]

meta: 
  - name: ages
    val: everyone
  - name: complexity
    val: medium
  - name: playtime
    val: 45 minutes
---

## What's the idea?
  
Hades has some trouble controlling his underworld. There are just too many souls arriving! And all of them have different needs, curses and treatments!

He has asked you to take care of his troubles. The player who wins ( = @TODO OBJECTIVE HERE) will officially receive the job as Conductor of the Underground, for all eternity. Isn’t that nice?


## Board Generation
  
_Where is the "player count" setting?_ You don't need it! Each board can support any player count you want. With fewer players, the rules simply tell you to ignore certain parts of the board.

{{< settings/settings-box type="board" game_title="Conductors of the Underground" >}}
  {{< settings/setting-seed >}}
  {{< settings/setting-enum id="setting-boardType" text="Board type?" values="Simple,Hexagon,Rectangle" valaskey="true" remark="Hexagon boards are more structured and simpler, Rectangle boards are more varied (as there are more options for each route)" >}}
  {{< settings/setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Removes many decorational elements and turns the board black-and-white." >}}
{{< /settings/settings-box >}}