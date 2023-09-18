---
draft: true

type: "single"
gamepage: true
boardgame: true

title: "Creature Quellector"
headerTitle: "Creature Quellector | A game you can play while standing in line, about collecting and battling creatures."
blurb: "Choose your battles wisely and build the strongest hand of magical creatures. A queuing game, playable without table, chairs, or loads of material"

fullHeaderImg: "sixpack_header"
headerImg: "sixpack_header"

headerThumb: "favicon"

customHeight: "small"
headerDarkened: true

color: "purple"

bgColor: "#0d0018"
bgColorLink: "#84060b"

textColor: "#ecd9ff"
textColorLink: "#f7fa96"

googleFonts: ""

date: 2023-05-02

categories: ["boardgame"]
tags: ["queuing game"]

extraCSS: true
extraJSGame: true

downloadLink: "https://drive.google.com/drive/folders/1UyxnFsYPynwQmRD2xbAh7RQyIC7yYAJi"

multiplayermode: "competitive"
language: EN
genre: ["card", "queue", "collecting", "deck", "battle"]
playtime: 20
playercount: [2,3,4,5,6]
complexity: low
ages: everyone

---

{{% boardgame-intro heading="" img="sixpack_header" class="no-shadow" url="https://drive.google.com/drive/folders/1UyxnFsYPynwQmRD2xbAh7RQyIC7yYAJi" %}}

Pick your battles wisely to design the best squad of cute creatures.

{{% /boardgame-intro %}}

{{% section-centered heading="What do I need?" %}}

Three simple steps.
* Read the short [playful rules](rules).
* Download the material to print (using the "Download") button above.
* Print it, cut it, play!

**Want more?** You can also [generate your own material](#material) right on this website! For each element, pick the type you like the most.

{{% /section-centered %}}

{{% section-centered heading="Material" anchor="material" html="true" %}}

<p>Input your settings, click the button. A new page will open that generates a nice PDF for you!</p>

{{< boardgame-settings type="game" local_storage="kingseatConfig" >}}
	{{< setting-hidden id="setting-gameTitle" text="Kingseat" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly grayscale." >}}
  {{< setting-enum id="setting-cardSize" text="Card Size?" values="small,regular,huge" valaskey="true" def="regular" >}}
  <h3>Elements</h3>
  {{< setting-enum id="setting-elements-red" text="Red" values="fire,electric,star,dragon" valaskey="true" def="fire" >}}
  {{< setting-enum id="setting-elements-blue" text="Blue" values="water,ice,poison,weather" valaskey="true" def="water" >}}
  {{< setting-enum id="setting-elements-green" text="Green" values="earth,grass,rock,bug" valaskey="true" def="earth" >}}
  {{< setting-enum id="setting-elements-purple" text="Purple" values="air,magic,ghost,dark" valaskey="true" def="air" >}}
{{< /boardgame-settings >}}

<p style="font-size:0.66em; opacity: 0.66;"><strong>Not working?</strong> Don't worry! At the "Download" link, you can also find valid PDFs with material already created!</p> 

{{% /section-centered %}}

{{% section-centered heading="Queuing Games" %}}

This game is something I call a "queuing game". What does that mean?

* You don't need a table, chairs, or much space at all
* The game requires very little material
* Rounds are fast and can be started/paused/ended at an instant

In other words, take this game with you wherever you go. Whenever you have to wait for something, stand in line, have some downtime ... play it!

{{% /section-centered %}}

{{< support >}}

{{% section-centered heading="Credits" %}}

This game started when I had a discussion with somebody about how _annoying_ it is to _wait_ and do _nothing_! Especially in theme parks, where waiting might mean "standing for 2 hours doing nothing in a tight space".

I thought: "wouldn't it be possible to create a _queuing game_? What would that look like?"

This was my first attempt. (Well, actually my second, but the first one turned into something with slightly too many cards to play comfortably in a tight space.) I realized I needed a ...

* Small deck
* Big cards, preferably with no text, so easy to read in any circumstance.
* No "discarding", "drawing" or "playing" of cards (as that requires a table)
* Something in which the specific cards in your hand, or their order, doesn't really matter. (This makes it easy to immediately pause the game by just putting the cards in your pocket or something.)

After a long process of brainstorming and experimenting, this game was the result.

Obviously, the aesthetic and rules were very much inspired by Pokémon (and similar card collection games). I tried to make it more unique, but hey, there's a reason Pokémon is as popular as it is ;)

For a detailed diary about the game, check out the [devlog](https://pandaqi.com/blog/boardgames/creature-quellector).

{{% /section-centered %}}