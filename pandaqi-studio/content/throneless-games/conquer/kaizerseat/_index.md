---
type: "gamepage"
boardgame: true

title: "Kaizerseat"
headerTitle: "Make sure the right Seeker wins the throne in the most strategical Throneless Game."
blurb: "Vote, swap places, use powers and backstab to ensure the right Seeker wins the throne. The longest and most strategical Throneless Game."
blurbShort: "A [Throneless Game](/throneless-games/) game about helping your animal win the throne, aimed more at kids."

blurbProject: "The most complicated version, giving you the deepest gameplay in return."
weightProject: 40

downloadLink: "https://drive.google.com/drive/folders/1XYqoqGmFc2gfgWcIsjDOJG48GQ2qjZGJ"


color: "black"


date: 2025-11-12

difficulty: "simple"
genres: ["thematic"]
categories: ["boardgame", "card-game"]
tags: ["political", "hidden-roles", "social", "fast-paced"]
themes: ["medieval"]

multiplayermode: "competitive"
language: EN
playtime: 30
playercount: [4,5,6,7,8,9,10]
ages: everyone

---

{{% boardgame-intro /%}}

{{% boardgame-instructions /%}}

{{% boardgame-settings-container type="material" remarks="Check the rules to see **how many Seekers** are recommended for each player count. Each choice adds ~1 page to print." %}}

{{< boardgame-settings type="game" btn_label="Create Material" local_storage="kaizerseatConfig" game_title="Kaizerseat" defaults="true" >}}
  {{< setting-checkbox id="setting-highLegibility" text="High Legibility?" remark="Picks a more neutral font for maximum legibility." checked="checked" >}}
  {{< setting-checkbox id="setting-generateThroneCards" text="Generate Thronecards?" checked="checked" >}}
  {{< setting-checkbox id="setting-generateSeatCards" text="Generate Seatcards?" checked="checked" >}}
  {{< setting-enum id="setting-set" text="Set?" values="none,starter,medium,advanced,complete,random" valaskey="true" def="starter" remark="Pick a predetermined set, or use none and pick your specific princes below!" >}}
  {{< boardgame-settings-section heading="Seekers" >}}
    {{< setting-checkbox id="setting-packs-solongNecks" text="Solongnecks?" checked="checked" >}}
    {{< setting-checkbox id="setting-packs-boardomThieves" text="Boardom Thieves?" >}}
    {{< setting-checkbox id="setting-packs-longswordFins" text="Longsword Fins?" >}}
    {{< setting-checkbox id="setting-packs-atheneyes" text="Atheneyes?" checked="checked" >}}
    {{< setting-checkbox id="setting-packs-gallopeers" text="Gallopeers?" >}}
    {{< setting-checkbox id="setting-packs-candlesticks" text="Candlesticks?" checked="checked" >}}
    {{< setting-checkbox id="setting-packs-taredtula" text="Taredtula?" >}}
    {{< setting-checkbox id="setting-packs-sonarAndSons" text="Sonar & Sons?" checked="checked" >}}
    {{< setting-checkbox id="setting-packs-sirensOfSeatongue" text="Sirens of Seatongue?" >}}
    {{< setting-checkbox id="setting-packs-cracktapus" text="Cracktapus?" >}}
    {{< setting-checkbox id="setting-packs-ravenletters" text="Ravenletters?" >}}
    {{< setting-checkbox id="setting-packs-twistertoots" text="Twistertoots?" >}}
  {{< /boardgame-settings-section >}}
{{< /boardgame-settings >}}

{{% /boardgame-settings-container %}}

{{% section-centered heading="Credits" anchor="credits" %}}

Check out the main overview page for [Throneless Games](/throneless-games/) for more detailed credits and background.

Whenever I create a game, the idea always starts on a sort of middle ground and I usually try to _simplify, simplify, simplify_. I chuck out rules, I discard special actions that sound really cool but take 20 extra words to explain, etcetera.

The result are very simple and streamlined games such as Smallseat and Queenseat.

I have also learned, however, that those nice ideas can be brought back if you set up the game to be a little longer and more complex from the start. It's almost always possible to create one version that players _know_ will take longer to play and has a few more rules to learn, but which gives the coolest actions and deepest strategy in return.

As expected, this became Kaizerseat. About half of it is the result of discarded ideas that I pushed upstream, the other half unique mechanics and actions invented just for this version. For example, it contains a Seatcard that randomizes a few rules per game, and it has _multiple types of actions_. Both were ideas I'd originally given to other games, but which turned out to be slightly too much for those simple versions. So they ended up here!

{{% /section-centered %}}