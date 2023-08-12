---
# draft: true

type: "single"
gamepage: true
boardgame: true

title: "Kingseat"
headerTitle: "Kingseat | A social hidden role game for large groups, playable without a table."
blurb: "A fast and simple hidden role game, with simultaneous turns and no player elimination, and even without table or chairs."

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

date: 2023-05-02 #@TODO: change to 2023-12-20 when done

categories: ["boardgame"]
tags: ["traditional"]

extraCSS: true
extraJSGame: true
extraJSGameBuild: true

downloadLink: "https://drive.google.com/drive/folders/1as4B3n_kxQ9K1jIVtWMI_P5VnAjbXRP1"

multiplayermode: "competitive"
language: EN
genre: ["card", "social", "party", "queueing", "fast", "hidden role"]
playtime: 20
playercount: [3,4,5,6,7,8,9,10,11,12]
complexity: low
ages: everyone

---

{{% boardgame-intro heading="" img="sixpack_header" class="no-shadow" url="https://drive.google.com/drive/folders/1as4B3n_kxQ9K1jIVtWMI_P5VnAjbXRP1" %}}

Pick your secret allegiance. Now make sure they get the most votes, without being obvious.

{{% /boardgame-intro %}}

{{% section-centered heading="What do I need?" %}}

Three simple steps.
* Read the _very_ short [playful rules](rules).
* Download the material to print (using the "Download") button above.
* Print it, cut it, play!

**Want more?** You can also [generate your own material](#material) right on this website! Pick the "prince packs" you want and enjoy.

{{% /section-centered %}}

{{% section-centered heading="Material" anchor="material" html="true" %}}

<p>Input your settings, click the button. A new page will open that generates a nice PDF for you!</p>

{{< boardgame-settings type="game" local_storage="kingseatConfig" >}}
	{{< setting-hidden id="setting-gameTitle" text="Kingseat" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly grayscale." >}}
  {{< setting-enum id="setting-cardSize" text="Card Size?" values="small,regular,huge" valaskey="true" def="regular" >}}
  <h3>Princes</h3>
  {{< setting-checkbox id="setting-packs-lionsyre" text="Lionsyre?"  >}}
  {{< setting-checkbox id="setting-packs-slydefox" text="Slydefox?"  >}}
  {{< setting-checkbox id="setting-packs-woolfhall" text="Woolfhall?"  >}}
  {{< setting-checkbox id="setting-packs-hornseeker" text="Hornseeker?"  >}}
  {{< setting-checkbox id="setting-packs-brownbeards" text="Brownbeards?"  >}}
  {{< setting-checkbox id="setting-packs-monarchrys" text="Monarchrys?"  >}}
  {{< setting-checkbox id="setting-packs-crassclamps" text="Crassclamps?"  >}}
  {{< setting-checkbox id="setting-packs-gulliballistas" text="Gulliballistas?"  >}}
  {{< setting-checkbox id="setting-packs-hardshellHero" text="Hardshell Hero?"  >}}
  {{< setting-checkbox id="setting-packs-squlofish" text="Squlofish?"  >}}
  {{< setting-checkbox id="setting-packs-smugwing" text="Smugwing?"  >}}
  {{< setting-checkbox id="setting-packs-salsaSalamanda" text="Salsa Salamanda?"  >}}
{{< /boardgame-settings >}}

<p style="font-size:0.66em; opacity: 0.66;">Check the rules to see how many Princes are recommended for each player count. Each choice adds ~1 page to print ( = 12 cards for that particular prince).</p> 

<p style="font-size:0.66em; opacity: 0.66;"><strong>Not working?</strong> Don't worry! At the "Download" link, you can also find valid PDFs with material!</p> 

{{% /section-centered %}}

{{% section-centered heading="Throneless Games" %}}

This game is part of my series I call "Throneless Games". That name was chosen because in these games ...

* You have no fixed position: you swap places a lot.
* The person sitting on the "throne" each round is important
* And the games can be played while standing up (or with minimal table space)

They all follow the same simple rules (and visual style). Each version, however, adds different cards to play with and a few major rule changes to shake things up. Below are the other games in this series.

* [Queenseat](https://pandaqi.com/queenseat) (adds a Throne card with interesting rule changes and possibilities) (COMING SOON)
* [Kaizerseat](https://pandaqi.com/kaizerseat) (adds other action types to the cards, such as actions that trigger when a card is in the Tell) (COMING SOON)
* [Smallseat](https://pandaqi.com/smallseat) (a simplified version with a visual style more attractive to kids) (COMING SOON)

{{% /section-centered %}}

{{< support >}}

{{% section-centered heading="Credits" %}}

This game actually uses three different fonts. (These are called "blackletter" or "fraktur" fonts.)

* Moderne Fraktur
* UniFraktur Cook (Bold)
* Gothic Ultra OT

Generally, you don't want to do that. (Two different font families at most!) But I just couldn't find a single font of which I liked all the letters, in all situations, and it was always readable. These fit together nicely and still kept text easy to read.

All other assets and code is mine. The main emblem (or "coat of arms") for each pack was generated using image AI, although with a lot of manual work before and after. (For example, the AI doesn't seem to understand that most animals have 4 legs, not 5.)

This game started as a "queueing game". I wanted to design games you could play in a queue or waiting room. This meant they had to be very simple, but allow many different group sizes. They had to be playable without table, chairs, or much space at all. 

Kingseat was the first game to come out of this journey. It's not the best, as it still requires people to stand in a circle and hold quite some cards, but it turned out a very good game in its own right. (Better "queueing games" are coming!)

For a detailed diary about the game, check out the [devlog](https://pandaqi.com/blog/boardgames/kingseat).

{{% /section-centered %}}