---
type: "single"
gamepage: true
boardgame: true

title: "Pumpkin Patrol"
headerTitle: "Hand out the most candy in a very competitive Halloween neighborhood."
blurb: "Attract the most valuable Trick-or-Treaters with beautiful Halloween decorations, but don't forget to collect enough candy to actually make them happy!"

extraCSS: true
downloadLink: "https://drive.google.com/drive/folders/1tg66GnYFxZukTDFUGoSjGIpr9BlU3Wy8"

customHeight: "small"
headerDarkened: true

color: "purple"

bgColor: "#210029"
bgColorLink: "#d14808"

textColor: "#f8ebff"
textColorLink: "#ffe1d3"

date: 2024-10-12

categories: ["boardgame"]
tags: ["holiday", "large-groups"]

multiplayermode: "competitive"
language: EN
genre: ["card", "party"]
playtime: 60
playercount: [2,3,4,5,6,7]
complexity: low
ages: everyone
devlog: "/blog/boardgames/pumpkin-patrol/"

---


{{% boardgame-intro heading="" %}}

Hand out the most candy in a very competitive Halloween neighborhood.

{{% /boardgame-intro %}}

{{% section-centered heading="What do I need?" %}}

Three simple steps.
* Read the short [playful rules](rules).
* Download the base game PDF. (Download > Files > Starter Set.)
* Print, cut, play!

**Want more?** You can also [generate your own material](#material) right on this website! Pick the sets you like and press the button.

{{% /section-centered %}}

{{% section-centered heading="Material" anchor="material" html="true" %}}

<p>Pick your desired settings and click the button! When in doubt, just use the defaults for a first game.</p>

{{< boardgame-settings type="game" local_storage="pumpkinPatrolConfig" btn_label="Generate Material" >}}
	{{< setting-hidden id="setting-gameTitle" text="Pumpkin Patrol" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly grayscale." >}}
  {{< setting-checkbox id="setting-includePeopleCards" text="Generate People Cards?" checked="checked" >}}
  {{< setting-checkbox id="setting-includeHandCards" text="Generate Hand Cards?" checked="checked" >}}
  {{< setting-enum id="setting-cardSize" text="Card Size?" values="small,regular,huge" valaskey="true" def="regular" >}}
  <h3>Cards</h3>
  {{< setting-enum id="setting-setPeople" text="People Set?" values="starter,beginner,advanced,expert,random" valaskey="true" def="starter" >}}
  {{< setting-enum id="setting-setDecorations" text="Decoration Set?" values="starter,beginner,random" valaskey="true" def="starter" >}}
  {{< setting-enum id="setting-setTreats" text="Treat Set?" values="starter,beginner,random" valaskey="true" def="starter" >}}
{{< /boardgame-settings >}}

<p class="settings-remark">You can combine the sets in any way and the generator will create a balanced deck. The names "starter", "beginner", and so forth merely give an indication how hard it is to play with or learn this specific set.</p>

<p class="settings-remark"><strong>Not working? Or unsure what to do?</strong> The "Download" button above has PDFs I already made for you! Pick any one of those.</p>

{{% /section-centered %}}

{{% section-centered heading="Credits" anchor="credits" %}}

The fonts used are **Carousel** (headings, thick decorative text) and **DuBellay** (body, longer text), both freely available. Most of the images were generated with AI. Everything else is completely mine.

This game idea started when I went to exercise outside, a week before Halloween, and saw that the neighbors had already placed a huge pumpkin at their front door. I scrambled back inside to write down the idea and immediately get to work. It was done (and even tested with others) a few days before Halloween.

Which meant we got to play it that night and have fun! 

But it also meant it was too late to properly finish and release the game now, which is why it was published a year _later_. This "break" also gave me the chance to come back to the idea with fresh eyes and greatly improve some of the rules and actions before publishing the final version.

It ended up becoming a very simple game with cute art, yet many opportunities to think ahead and strategize.

Hopefully this game gives families around the world a fun activity to do around Halloween. The theme is obviously focused on it, though the game is perfectly playable on its own, any day.

For more information, as always, read my [detailed developer diary on Pandaqi Blog](/blog/boardgames/pumpkin-patrol).

{{% /section-centered %}}