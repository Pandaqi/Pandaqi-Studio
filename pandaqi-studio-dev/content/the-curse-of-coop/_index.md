---
type: "gamepage"
draft: true

gamepage: true
boardgame: true

title: "The Curse of Coop"
headerTitle: "Enter a cursed temple ... or rule it as a (mad) god"
blurb: "Lala vlavla"


buttonColor: "#7C593B"

googleFonts: "https://fonts.googleapis.com/css2?family=Langar&family=Londrina+Solid:wght@100;300;400;900&display=swap"

extraJS: true

date: 2021-04-29

categories: ["boardgame"]
tags: ["competitive", "hybrid"]

meta: 
  - name: ages
    val: everyone
  - name: complexity
    val: low
  - name: playtime
    val: ~15 minutes per player
---


{{% boardgame-intro heading="The Curse of Coop" url="#" %}}

A [One Paper Game](/boardgames#one_paper_games) for 2&ndash;8 players about entering a cursed temple as a researcher. Some players, however, might be in it for the gold ... In fact, as you trudge through dark caverns and mysterious rooms, you get the feeling the whole temple might be against you!

{{% /boardgame-intro %}}

{{% section-centered heading="What's the idea?" %}}

Lala vlavla

{{% /section-centered %}}

{{% section-centered heading="Board Generation" html="true" %}}
  
  <p>Input any seed you want (your favorite artist, a made-up word, whatever) and your player count.</p>
  <p>Click "Generate Board". Save the image (or PDF) and print it.</p>

  {{< boardgame-settings type="board" >}}

    {{< setting-hidden id="setting-gameTitle" text="The Curse of Coop" >}}
    {{< setting-seed >}}
    {{< setting-playercount min="2" max="8" def="4" >}}
    {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Removes many decorational elements and turns the board (mostly) grayscale." >}}

    <h3 style="margin-bottom: 0px;">Expansions</h3>

    {{< setting-checkbox id="setting-pizzaPolice" text="Pizza Police?" >}}

  {{< /boardgame-settings >}}

  <p>Remark, remark, remark.</p>

{{% /section-centered %}}