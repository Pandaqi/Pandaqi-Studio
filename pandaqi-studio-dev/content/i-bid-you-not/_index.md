---
type: "single"
gamepage: true
boardgame: true

title: "I Bid You Not"
headerTitle: "Sweeten the deal and be the highest bidder---or sour the deal and run away."
blurb: "Take turns either adding items to the offer or declaring an auction. But once the auction is over, you might not be happy with how much you paid for what you got."

extraCSS: true
downloadLink: "https://drive.google.com/drive/folders/17wUGca1wpZq7EFj3XV7zTPL_Q774X4lN"

customHeight: "small"
headerDarkened: true

color: "purple"

bgColor: "#003401"
bgColorLink: "#ff1f1f"

textColor: "#f2ffef"
textColorLink: "#ffe9e9"

googleFonts: ""

date: 2023-01-01 # 2024-12-26

categories: ["boardgame"]
tags: ["simple", "auction", "bidding"]

multiplayermode: "competitive"
language: EN
genre: ["tile"]
playtime: 45
playercount: [3,4,5,6]
complexity: low
ages: everyone
devlog: "/blog/boardgames/i-bid-you-not/"

---

{{% boardgame-intro heading="" %}}

Sweeten the deal and be the highest bidder---or sour the deal and run away.

{{% /boardgame-intro %}}

{{% section-centered heading="What do I need?" %}}

Three simple steps.
* Read the short [playful rules](rules).
* Download the base game PDF. (Download > Files > Base Pack.)
* Print, cut, play!

**Want more?** You can also [generate your own material](#material) right on this website!

{{% /section-centered %}}

{{% section-centered heading="Material" anchor="material" html="true" %}}

<p>Pick your desired settings and click the button! When in doubt, just use the defaults for your first games.</p>

{{< boardgame-settings type="game" local_storage="iBidYouNotConfig" btn_label="Generate Material" >}}
	{{< setting-hidden id="setting-gameTitle" text="I Bid You Not" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly grayscale." >}}
  {{< setting-enum id="setting-itemSize" text="Card Size?" values="small,regular,large" valaskey="true" def="regular" >}}
  <h3>Sets</h3>
  {{< setting-checkbox id="setting-sets-base" text="Base Game?" checked="checked" >}}
  {{< setting-checkbox id="setting-sets-oddInventions" text="Odd Inventions?" >}}
  {{< setting-checkbox id="setting-sets-doubleDevices" text="Double Devices?" >}}
{{< /boardgame-settings >}}

<p class="settings-remark"><strong>Not working? Or unsure what to do?</strong> The "Download" button above has PDFs I already made for you! Pick any one of those.</p>

{{% /section-centered %}}

{{% section-centered heading="Credits" anchor="credits" %}}

This game started as the question "what's the simplest bidding game I can come up with?" (With the added requirement that it actually be a good game and not a vague shouting match.)

Having played a few abstract, number-based card games lately, my brain immediately wandered to the following set of ideas. (Which are basically the rules to the entire game.)

* You take turns building an **offer** on the table, where each card must have a higher number than the previous.
* But at any point, somebody can refuse to make the offer better and declare an **auction**.
* An auction means everyone plays a secret card---their bid---and the highest wins all the cards inside the offer.

It has this push-and-pull that you want in all games. On the one hand, you want the offer to include better cards. But you also don't want to make it too good, or wait too long, before declaring an auction and trying to _win_ that offer.

It also had the usual issue of number-based games where higher number are just "always better". As such, there's one more rule that turns auctions on their head, allowing any number to win. And once that part worked, I polished it with the usual suspects: some cards have _special actions_ and some cards are worth _negative_ points.

All of that combined into the simplest bidding game I can imagine, with as much strategy and variety as possible.

The fonts used are **Digitalt** (header, thick) and **Inter Tight** (body, paragraphs), both freely available for commercial use. Some imagery was generated with AI. Everything else (code, rules, idea, assets, etcetera) is entirely mine.

For more information, as always, read my [detailed developer diary on Pandaqi Blog](/blog/boardgames/i-bid-you-not/).

{{% /section-centered %}}