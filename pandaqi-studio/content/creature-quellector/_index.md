---
type: "single"
gamepage: true
boardgame: true

title: "Creature Quellector"
headerTitle: "Creature Quellector | A game you can play while standing in line, about collecting and battling creatures."
blurb: "Choose your battles wisely and build the strongest hand of magical creatures. A waitless game, playable without table, chairs, or loads of material"

fullHeaderImg: "creature_quellector_header"
headerImg: "creature_quellector_header"

headerThumb: "favicon"

customHeight: "large"
headerDarkened: true

color: "brown"

bgColor: "#014556"
bgColorLink: "#601a87"

textColor: "#e6faff"
textColorLink: "#edccff"

googleFonts: ""

date: 2024-02-25

categories: ["boardgame"]
tags: ["queuing game", "waitless game"]

extraCSS: true

downloadLink: "https://drive.google.com/drive/folders/1UyxnFsYPynwQmRD2xbAh7RQyIC7yYAJi"

multiplayermode: "competitive"
language: EN
genre: ["card", "queue", "waitless", "collecting", "deck", "battle"]
playtime: 20
playercount: [2,3,4,5,6]
complexity: low
ages: everyone

---

{{% boardgame-intro heading="" img="creature_quellector_header" class="no-shadow" %}}

Pick your battles wisely to design the best squad of cute creatures.

{{% /boardgame-intro %}}

{{% section-centered heading="What do I need?" %}}

Three simple steps.
* Read the short [playful rules](rules).
* Download any _one_ material PDF (Download > Files > Sets > any file).
* Print it, cut it, play!

**Want more?** You can also [generate your own material](#material) right on this website! For each element, pick the type you like the most.

{{% /section-centered %}}

{{% section-centered heading="Material" anchor="material" html="true" %}}

<p>Input your settings, click the button. A new page will open that generates a nice PDF for you!</p>

{{< boardgame-settings type="game" local_storage="creatureQuellectorConfig" >}}
	{{< setting-hidden id="setting-gameTitle" text="Creature Quellector" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly grayscale." >}}
  {{< setting-enum id="setting-cardSize" text="Card Size?" values="small,regular,huge" valaskey="true" def="regular" >}}
  {{< setting-checkbox id="setting-multiType" text="Multitype?" remark="An expansion: some icons will become two types at once." >}}
  <h3>Elements</h3>
  {{< setting-enum id="setting-elements-red" text="Red" values="fire,electric,star,dragon" valaskey="true" def="fire" >}}
  {{< setting-enum id="setting-elements-blue" text="Blue" values="water,ice,poison,weather" valaskey="true" def="water" >}}
  {{< setting-enum id="setting-elements-green" text="Green" values="earth,grass,rock,bug" valaskey="true" def="earth" >}}
  {{< setting-enum id="setting-elements-purple" text="Purple" values="air,magic,ghost,dark" valaskey="true" def="air" >}}
{{< /boardgame-settings >}}

<p class="setting-remark"><strong>Not working?</strong> Don't worry! At the "Download" link, you can also find valid PDFs with material already created!</p> 

<p class="setting-remark"><strong>Creature names</strong> are randomly generated from a huge list of words and phrases. This means there might be "unfortunate" combinations to some people, such as "childkill", which I just can't prevent. I hope we can all see the humor in silly random names!

{{% /section-centered %}}

{{% section-centered heading="Waitless Games?" %}}

This game is part of a genre I invented which I call "waitless games" or "queuing games".

What does that mean?

* You don't need a table, chairs, or much space at all.
* The game requires very little material.
* Rounds are fast and can be started/paused/ended at an instant.
* (If possible, turns happen simultaneously so you literally don't need to wait.)

In other words, take this game with you wherever you go. Whenever you have to wait for something, stand in line, have some downtime ... play it!

{{% /section-centered %}}

{{< support >}}

{{% section-centered heading="Credits" %}}

This game started when I had a discussion with somebody about how _annoying_ it is to _wait_ and do _nothing_! Especially in theme parks, where waiting might mean "standing for 2 hours doing nothing in a tight space".

I thought: "wouldn't it be possible to create a _queuing game_? What would that look like?"

This was my first attempt. (Well, actually my second, but the first one turned into something with slightly too many cards to play comfortably in a tight space.) I realized I needed a ...

* Small deck
* Big cards, preferably with no text, so easy to read in any circumstance.
* No "discarding", "drawing" or "playing" of cards (as that requires a table or extra space)
* Something in which the specific cards in your hand, or their order, doesn't really matter. (This makes it easy to immediately pause the game by just putting the cards in your pocket or something.)

After a long process of brainstorming and experimenting, this game was the result.

Obviously, the aesthetic and rules were very much inspired by Pokémon (and similar card collection games). I tried to make it more unique, but hey, there's a reason Pokémon is as popular as it is ;)

For a detailed diary about the game, check out the [devlog](https://pandaqi.com/blog/boardgames/creature-quellector).

{{% /section-centered %}}

<!--- Loads a random element-related theme for the whole page --->
<script>
  const themes = ["red", "blue", "green", "purple"];
  const randTheme = themes[Math.floor(Math.random() * themes.length)];
  document.body.classList.add("theme-" + randTheme);
</script>