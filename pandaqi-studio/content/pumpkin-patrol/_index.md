---
type: "gamepage"
boardgame: true

title: "Pumpkin Patrol"
headerTitle: "Hand out the most candy in a very competitive Halloween neighborhood."
blurb: "Attract the most valuable Trick-or-Treaters with beautiful Halloween decorations, but don't forget to collect enough candy to actually make them happy!"
blurbShort: "Hand out the most candy in a very competitive Halloween neighborhood."

downloadLink: "https://drive.google.com/drive/folders/1tg66GnYFxZukTDFUGoSjGIpr9BlU3Wy8"


color: "purple"


date: 2024-10-12

difficulty: "kids-can-play"
genres: ["family"]
categories: ["boardgame", "card-game"]
tags: ["fixed-order", "movement", "hand-management", "high-score", "turn-based", "kill-steal", "modular", "patterns"]
themes: ["holiday", "monsters"]

multiplayermode: "competitive"
language: EN
playtime: 60
playercount: [2,3,4,5,6,7]
ages: everyone
devlog: "/blog/boardgames/pumpkin-patrol/"

---

{{% boardgame-intro /%}}

{{% boardgame-instructions /%}}

{{% boardgame-settings-container type="material" remarks="You can combine the sets in any way and the generator will create a balanced deck. The names _starter_, _beginner_, and so forth merely give an indication how hard it is to play with or learn this specific set." %}}

{{< boardgame-settings type="game" local_storage="pumpkinPatrolConfig" btn_label="Generate Material" game_title="Pumpkin Patrol" defaults="true" >}}
  {{< setting-checkbox id="setting-includePeopleCards" text="Generate People Cards?" checked="checked" >}}
  {{< setting-checkbox id="setting-includeHandCards" text="Generate Hand Cards?" checked="checked" >}}
  {{< boardgame-settings-section heading="Cards to Include" >}}
    {{< setting-enum id="setting-setPeople" text="People Set?" values="starter,beginner,advanced,expert,random" valaskey="true" def="starter" >}}
    {{< setting-enum id="setting-setDecorations" text="Decoration Set?" values="starter,beginner,random" valaskey="true" def="starter" >}}
    {{< setting-enum id="setting-setTreats" text="Treat Set?" values="starter,beginner,random" valaskey="true" def="starter" >}}
  {{< /boardgame-settings-section >}}
{{< /boardgame-settings >}}

{{% /boardgame-settings-container %}}

{{% section-centered heading="Credits" anchor="credits" %}}

The fonts used are **Carousel** (headings, thick decorative text) and **DuBellay** (body, longer text), both freely available. Most of the images were generated with AI. Everything else is completely mine.

This game idea started when I went to exercise outside, a week before Halloween, and saw that the neighbors had already placed a huge pumpkin at their front door. I scrambled back inside to write down the idea and immediately get to work. It was done (and even tested with others) a few days before Halloween.

Which meant we got to play it that night and have fun! 

But it also meant it was too late to properly finish and release the game now, which is why it was published a year _later_. This "break" also gave me the chance to come back to the idea with fresh eyes and greatly improve some of the rules and actions before publishing the final version.

It ended up becoming a very simple game with cute art, yet many opportunities to think ahead and strategize.

Hopefully this game gives families around the world a fun activity to do around Halloween. The theme is obviously focused on it, though the game is perfectly playable on its own, any day.

{{% /section-centered %}}