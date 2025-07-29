---
type: "project"

title: "Sixpack"
blurb: "A card game both simple and fast about using your six unique cards as best you can, while predicting how the others will use theirs."
# blurb: "You get six cards. Play them well, but don't be the first to play them all."
blurbProject: "Use your 6 cards as best you can to claim the biggest piles, which you do by playing a 1 or a 6 on top at the right time."
weightProject: 60

date: 2023-10-20

difficulty: "kids-can-play"
genres: ["party"]
categories: ["board-game", "card-game", "standard"]
tags: ["numbers", "simultaneous-turns", "fast-paced", "stacking", "move-through-all", "ladder-climbing"]
themes: ["pop-art", "retro", "colorful"]

driveLink: "https://drive.google.com/drive/folders/1as4B3n_kxQ9K1jIVtWMI_P5VnAjbXRP1"

multiplayermode: "competitive"
language: EN
playtime: 15
playercount: [2,3,4,5,6]
ages: everyone
devlog: "/blog/boardgames/the-outnumbered-series/sixpack/"

---

**Reminder** (when generating your own material): You always need (at least) one more pack than the number of players.


{{% boardgame-settings-container type="material" %}}

{{< boardgame-settings type="game" local_storage="sixpackConfig" btn_label="Generate Material" game_title="Sixpack" defaults="true" >}}
  {{< setting-checkbox id="setting-randomizePacks" text="Randomize Packs?" remark="Ignores the settings below and just selects random packs." >}}
  {{< boardgame-settings-section heading="Packs" >}}
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
  {{< /boardgame-settings-section >}}
{{< /boardgame-settings >}}

{{% /boardgame-settings-container %}}

## Background

This game was inspired by a play session of the game "Take 5". (In the Netherlands, confusingly, this is the _original_ version of the game, published under the name of the _new_ and radically different version.) I thought the game was strong, yet simple and easy to pick up. Naturally, I wanted to try my own hand at such a card game (with numbers and sequences).

Because the rules are so simple, I could spend most of the time on the art and visuals of the cards. The end result is probably my nicest game in terms of graphics and rules!

## Credits

The font used is **Londrina Solid** (freely available at Google Fonts). All other assets and code are mine.
