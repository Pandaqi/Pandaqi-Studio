---
type: "project"


title: "Hold my Bear"
blurb: "Beat your opponents at the Unbearable Games, either by being more skillful ... or changing the sport being played altogether. A fast and loose card game for any situation."
# blurb: "Beat your opponents at the Unbearable Games, either by being more skillful ... or changing the sport being played altogether."
downloadLink: "https://drive.google.com/drive/folders/1JD-LWnPoX3yXfQM8jXdlh4vsZvdMOzQQ"


date: 2024-06-25

difficulty: "simple"
genres: ["sports"]
categories: ["board-game", "card-game", "standard"]
tags: ["numbers", "follow", "modular", "hand-management"]
themes: ["nature", "watercolor", "sports"]

multiplayermode: "competitive"
language: EN
genres: ["card", "party"]
playtime: 10
playercount: [3,4,5,6,7,8]
complexity: low
ages: everyone
devlog: "/blog/boardgames/hold-my-bear/"

---





## Unbearable Games

Welcome to the Unbearable Games! Where the rules change every second and bears are sure to ruin everything.

On your turn, you try to play a set of animals that beats the previous one.

And as we all know, there are two ways to win any sport.

* You play better than your opponent ( = higher numbers)
* You change the rules ( = different most occurring animal)

If you can't or don't want to, you must give away cards.

But bears ... have several special powers that can either hand you victory or destroy all your plans.

It's your goal to win _so hard_ that nobody can do the two things above. Have fun! 


{{% boardgame-settings-container type="material" remarks="**Help! What do I need?** For most player counts, the default values (1 bear + 4 animals) are fine. With more players, you can add the other animals. If you're up for a bigger challenge, add expansion animals (one at a time)." %}}

{{< boardgame-settings type="game" local_storage="holdMyBearConfig" btn_label="Generate PDF" game_title="Hold my Bear" defaults="true" >}}
  {{< setting-checkbox id="setting-addBearIcons" text="Add Bear Icons?" checked="checked" remark="Adds icons on the Bear card to remind you of its abilities." >}}
  {{< boardgame-settings-section heading="Animals" >}}
    {{< setting-checkbox-multiple id="setting-animalsBase" values="bear,ferret,tiger,chicken,dog,cat,hamster,vole" values_checked="bear,ferret,tiger,hamster,vole" >}}
  {{< /boardgame-settings-section >}}
  {{< boardgame-settings-section heading="Expansion Animals" >}}
    < setting-checkbox-multiple id="setting-animalsExpansion" values="turtle,beaver,badger,giraffe,ape,bat,walrus,fish,bison,kangaroo,rabbit,sheep,squid,aardvark" >}}
  {{< /boardgame-settings-section >}}
{{< /boardgame-settings >}}

{{% /boardgame-settings-container %}}

## Credits

The fonts used are **Sloval** (headings) and **Ciscopic** (body), both freely available (for commercial use). The website and rules use **Merriweather**, as that is more readable for longer paragraphs. 

Many images were generated with AI (after careful research to make sure there was no copyright infringement). Though most were edited afterwards, because it's not smart enough to understand how an animal could play any sport. 

Everything else (game design, code, icons, general graphics, etcetera) is entirely mine.

This game started with the idea "what if there was a card game in which you sometimes want other people to hold onto a card of yours for a while?" In other words, a certain card is sometimes _really powerful_, but you can't win while you have it.

I combined this with some other ideas, such as the simple game loop of "on your turn, play a valid move OR give away cards". And of course a bad pun on "Hold my Beer!" 

Until I ended up with this simple game that has surprising depth.


