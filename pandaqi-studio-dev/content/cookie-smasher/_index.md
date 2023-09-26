---
type: "single"
gamepage: true
boardgame: true

title: "Arquetect"
headerTitle: "Arquetect | A fast and light game about designing your ideal city, despite opponents starting fires."
blurb: "A fast game about designing the best scoring city, despite opponents starting fires and disease outbreaks. A waitless game using cards in your hand and nothing else."

extraCSS: true
extraJSGame: true

---

{{% section-centered heading="Material" anchor="material" html="true" %}}

{{< boardgame-settings type="game" local_storage="arquetectConfig" >}}
	{{< setting-hidden id="setting-gameTitle" text="Arquetect" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly grayscale." >}}
  {{< setting-enum id="setting-cardSize" text="Card Size?" values="small,regular,huge" valaskey="true" def="regular" >}}
{{< /boardgame-settings >}}

{{% /section-centered %}}

{{% section-centered heading="Credits" anchor="credits" %}}

The fonts used are **Palette Mosaic** and **Pettingill CF**, not mine, but both freely available. The art was partially generated using AI (specifically DALL-E). Everything else (idea, code, design, parts of the illustrations) is mine.

Fun facts:

* I initially included Tomato and Potato in the list of fruits and vegetables. Those, however, only came to medieval Europe a few centuries later, when they sailed the seas and colonized America.
* The medieval diet was much less diverse than that of today, which is to be expected. It did provide a challenge, though, when creating this game. I had to ... bend the timeline a bit to get enough unique (and recognizable) food. 

Below is a list of "wrong" foods.
* Rice wasn't available in Europe during the middle ages.
* Though they were able to make bread and grain-based products, some crucial ingredients for _cookies_ (as we know them today) were missing.
* Coffee is a bit dodgy, but it's generally assumed this arrived in Europa around the very _end_ of the middle ages. 
* They probably had broccoli long ago, but evidence is also not great.

_Then why is the game called Cookie Smasher?_ This started as a spin-off for the mobile game "Cookie Clicker". Before I knew it, the idea of cookies was entrenched in the rules and illustrations, and I couldn't get rid of it. The name also stayed because it's a good description of the game: you smash the right card to win, and Cookies are the right card most often. (As they are automatically "poisoned" when nothing else is.)

For more information, as always, read my [detailed devlog on Pandaqi Blog](https://pandaqi.com/blog/boardgames/cookie-smasher).