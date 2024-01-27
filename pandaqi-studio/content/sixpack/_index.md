---
type: "single"
gamepage: true
boardgame: true

title: "Sixpack"
headerTitle: "A simple, fast card game about six wonderful cards."
blurb: "A card game both simple and fast about using your six unique cards as best you can, while predicting how the others will use theirs."

customHeight: "small"
headerDarkened: true

color: "purple"

bgColor: "#0d0018"
bgColorLink: "#84060b"

textColor: "#ecd9ff"
textColorLink: "#f7fa96"

googleFonts: ""

date: 2023-10-20

categories: ["boardgame"]
tags: ["traditional"]

extraCSS: true

downloadLink: "https://drive.google.com/drive/folders/1as4B3n_kxQ9K1jIVtWMI_P5VnAjbXRP1"

multiplayermode: "competitive"
language: EN
genre: ["card", "numbers", "math", "fast"]
playtime: 15
playercount: [2,3,4,5,6]
complexity: low
ages: everyone

---

{{% boardgame-intro heading="" class="no-shadow" %}}

You get six cards. Play them well, but don't be the first to play them all.

{{% /boardgame-intro %}}

{{% section-centered heading="What do I need?" %}}

Three simple steps.
* Read the short [playful rules](rules).
* Download **one** material PDF to print. ("Download" > Files > Essential Pack)
* Print, cut, play!

**Want more (customization)?** You can also [generate your own material](#material) right on this website! Pick the packs you want and enjoy.

{{% /section-centered %}}

{{% section-centered heading="Material" anchor="material" html="true" %}}

<p>Input your settings, click the button. A new page will open that generates a nice PDF for you!</p>

{{< boardgame-settings type="game" local_storage="sixpackConfig" btn_label="Generate Material" >}}
	{{< setting-hidden id="setting-gameTitle" text="Sixpack" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly grayscale." >}}
  {{< setting-enum id="setting-cardSize" text="Card Size?" values="small,regular,big" valaskey="true" def="regular" >}}
  {{< setting-checkbox id="setting-randomizePacks" text="Randomize Packs?" remark="Ignores the settings below and just selects random packs." >}}
  <h3>Packs</h3>
  {{< setting-enum id="setting-packs-blank" text="Blank?" values="0,1,2,3,4,5,6" valaskey="true" remark="These are cards with no special ability. See the rules." def="3" >}}
  {{< setting-enum id="setting-packs-reverse" text="Reverse?" values="0,1,2,3,4,5,6" valaskey="true" def="2" >}}
  {{< setting-enum id="setting-packs-takeback" text="Takeback?" values="0,1,2,3,4,5,6" valaskey="true" def="1" >}}
  {{< setting-enum id="setting-packs-seethrough" text="Seethrough?" values="0,1,2,3,4,5,6" valaskey="true" def="0" >}}
  {{< setting-enum id="setting-packs-lateArrival" text="Late Arrival?" values="0,1,2,3,4,5,6" valaskey="true" def="0" >}}
  {{< setting-enum id="setting-packs-sheriff" text="Sheriff?" values="0,1,2,3,4,5,6" valaskey="true" def="0" >}}
  {{< setting-enum id="setting-packs-veto" text="Veto?" values="0,1,2,3,4,5,6" valaskey="true" def="0" >}}
  {{< setting-enum id="setting-packs-noSuperheroes" text="No Superheroes?" values="0,1,2,3,4,5,6" valaskey="true" def="0" >}}
  {{< setting-enum id="setting-packs-superNumbers" text="Super Numbers?" values="0,1,2,3,4,5,6" valaskey="true" def="0" >}}
  {{< setting-enum id="setting-packs-bitingHand" text="Biting Hand?" values="0,1,2,3,4,5,6" valaskey="true" def="0" >}}
  {{< setting-enum id="setting-packs-sticky" text="Sticky?" values="0,1,2,3,4,5,6" valaskey="true" def="0" >}}
  {{< setting-enum id="setting-packs-secondHand" text="Second Hand?" values="0,1,2,3,4,5,6" valaskey="true" def="0" >}}
  {{< setting-enum id="setting-packs-carousel" text="Carousel?" values="0,1,2,3,4,5,6" valaskey="true" def="0" >}}
  {{< setting-enum id="setting-packs-pileDriver" text="Pile Driver?" values="0,1,2,3,4,5,6" valaskey="true" def="0" >}}
  {{< setting-enum id="setting-packs-copycat" text="Copycat?" values="0,1,2,3,4,5,6" valaskey="true" def="0" >}}
  {{< setting-enum id="setting-packs-calculator" text="Calculator?" values="0,1,2,3,4,5,6" valaskey="true" def="0" >}}
{{< /boardgame-settings >}}

<p style="font-size:0.66em; opacity: 0.66;"><strong>Reminder!</strong> You always need (at least) one more pack than the number of players.</p> 

<p style="font-size:0.66em; opacity: 0.66;"><strong>Not working?</strong> Don't worry! At the "Download" link, you can also find valid PDFs with material!</p> 

{{% /section-centered %}}

{{< support >}}

{{% section-centered heading="Credits" %}}

The font used is **Londrina Solid** (freely available at Google Fonts). All other assets and code are mine.

This game was inspired by a play session of the game "Take 5". (In the Netherlands, confusingly, this is the _original_ version of the game, published under the name of the _new_ and radically different version.) I thought the game was strong, yet simple and easy to pick up. Naturally, I wanted to try my own hand at such a card game (with numbers and sequences).

Because the rules are so simple, I could spend most of the time on the art and visuals of the cards. The end result is probably my nicest game in terms of graphics and rules!

For a detailed diary about the game, check out the [devlog](/blog/boardgames/sixpack).

{{% /section-centered %}}