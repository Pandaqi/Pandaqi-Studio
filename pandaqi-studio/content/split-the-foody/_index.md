---
type: "single"
gamepage: true
boardgame: true

title: "Split the Foody"
headerTitle: "A game of food heists and dividing treasure."
blurb: "Stealing food treasure is the easy part. Grabbing the biggest chunk when dividing the booty is tough---but also crucial to your success as a true pearate."

extraCSS: true
downloadLink: "https://drive.google.com/drive/folders/1Jw9vO5RnVDgh-ECN8NxMDVKeN9Uhfjjg"

customHeight: "small"
headerDarkened: true

color: "brown"

bgColor: "#421b04"
bgColorLink: "#871a1a"

textColor: "#fff4ed"
textColorLink: "#f0d8d5"

googleFonts: ""

date: 2024-05-26

categories: ["boardgame"]
tags: ["pirate", "bidding", "bluffing", "social"]

multiplayermode: "competitive"
language: EN
genre: ["card", "party"]
playtime: 30
playercount: [2,3,4,5,6,7]
complexity: low
ages: everyone

---

{{% boardgame-intro heading="" %}}

A bluffin', stealin', eatin' game of food heists and dividing treasure amongst the pearates.

{{% /boardgame-intro %}}

{{% section-centered heading="What do I need?" %}}

Three simple steps.
* Read the short [playful rules](rules).
* Download the base game PDF. (Download > Files > Base Game.)
* Print, cut, play!

**Want more?** You can also [generate your own material](#material) right on this website!

{{% /section-centered %}}

{{% section-centered heading="Material" anchor="material" html="true" %}}

<p>Pick your desired settings and click the button! When in doubt, just use the defaults for your first games.</p>

{{< boardgame-settings type="game" local_storage="splitTheFoodyConfig" btn_label="Generate Material" >}}
	{{< setting-hidden id="setting-gameTitle" text="Split the Foody" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly grayscale." >}}
  {{< setting-enum id="setting-cardSize" text="Card Size?" values="small,regular,huge" valaskey="true" def="regular" >}}
  {{< setting-enum id="setting-cardSet" text="Which set?" values="Base Game,Appetite for All,Coins for Combos" keys="base,appetite,coins" def="base" >}}
{{< /boardgame-settings >}}

<p class="settings-remark"><strong>Not working? Or unsure what to do?</strong> The "Download" button above has PDFs I already made for you! Pick any one of those.</p>

{{% /section-centered %}}

{{% section-centered heading="Credits" anchor="credits" %}}

For a while now, the popular author Brandon Sanderson has had a running joke about food heists. One day, I wrote down that it would be a cool title for a game about pirates ignoring treasure but stealing food.

About half a year later, I picked up that idea and actually turned it into a game. So I guess my first credits must go to Brando, though the eventual game barely has anything to do with the original spark.

Besides that, the fonts used are **Primitive** (headings) and **Rosarivo** (body text). (I initially used a different pirate-like-font that's quite common, but ditched it because it looked too clean and similar to the body font.) Parts of the illustrations were generated with AI. Everything else is entirely mine.

I usually pick my next idea based on what is "easiest or simplest to make". This idea seemed really simple ... but I had to do a _lot_ of testing and prototyping to actually make it work, while keeping the rules light. A bit of a misfire from me, but in the end I'm glad I stuck it out and made this game, because it's quite different from anything else I made before.

For more information, as always, read my [detailed developer diary on Pandaqi Blog](/blog/boardgames/split-the-foody).

{{% /section-centered %}}