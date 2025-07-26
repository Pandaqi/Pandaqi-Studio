---
type: "project"
draft: true


title: "The Curse of Coop"
headerTitle: "Enter a cursed temple ... or rule it as a (mad) god"
blurb: "Lala vlavla"


buttonColor: "#7C593B"

googleFonts: "https://fonts.googleapis.com/css2?family=Langar&family=Londrina+Solid:wght@100;300;400;900&display=swap"

extraJS: true

date: 2021-04-29

categories: ["board-game"]
tags: ["competitive", "hybrid"]

meta: 
  - name: ages
    val: everyone
  - name: complexity
    val: low
  - name: playtime
    val: ~15 minutes per player
---


## What's the idea?

Lala vlavla

## Board Generation
  
Input any seed you want (your favorite artist, a made-up word, whatever) and your player count.

Click "Generate Board". Save the image (or PDF) and print it.

{{< settings/settings-box type="board" >}}

  {{< settings/setting-hidden id="setting-gameTitle" text="The Curse of Coop" >}}
  {{< settings/setting-seed >}}
  {{< settings/setting-playercount min="2" max="8" def="4" >}}
  {{< settings/setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Removes many decorational elements and turns the board (mostly) grayscale." >}}

  <h3 style="margin-bottom: 0px;">Expansions</h3>

  {{< settings/setting-checkbox id="setting-pizzaPolice" text="Pizza Police?" >}}

{{< /settings/settings-box >}}
