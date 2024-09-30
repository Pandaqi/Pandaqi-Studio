---
type: "gamepage"
boardgame: true

title: "Chaos Contract"
headerTitle: "Enter Chaos Contracts with other lost souls and place the difference between major rewards and huge curses on a single dice roll."
blurb: "Enter Chaos Contracts with other lost souls and place the difference between major rewards and huge curses on a single dice roll."

weightProject: 30

downloadLink: "https://drive.google.com/drive/folders/1uw-nB4F36NqM6XUbVqXUyemRKPAwjDLJ"

color: "purple"
fontSizeBase: 17

date: 2025-11-26

difficulty: "simple"
genres: ["family", "thematic"]
categories: ["boardgame", "card-game"]
tags: ["chance", "dice", "contracts", "turn-based", "numbers", "high-score"]
themes: ["mythology"]

multiplayermode: ["cooperative", "competitive"]
language: EN
playtime: 30
playercount: [2,3,4,5]
ages: everyone
devlog: "/blog/boardgames/the-luck-legends/chaos-contract/"

---

{{% boardgame-intro /%}}

{{% boardgame-instructions /%}}

{{% boardgame-settings-container type="material" %}}

{{< boardgame-settings type="game" local_storage="chaosContractConfig" btn_label="Generate Material" game_title="Chaos Contract" defaults="true">}}
  {{< boardgame-settings-section heading="Sets" >}}
    {{< setting-checkbox id="setting-sets-base" text="Base?" checked="checked" >}}
    {{< setting-checkbox id="setting-sets-lostSouls" text="Lost Souls?" remark="An expansion with more special contracts." >}}
    {{< setting-checkbox id="setting-sets-devilishNumbers" text="Devilish Numbers?" remark="An expansion with more wacky numbers and strong powers." >}}
  {{< /boardgame-settings-section >}}
{{< /boardgame-settings >}}

{{% /boardgame-settings-container %}}

{{% section-centered heading="Credits" anchor="credits" %}}

The fonts used are **Celexa** (headings) and **Quixotte** (body text). Everything else is mine.

This idea was originally one of the first Luck Legends games. I still believe it's one of the simplest when it comes to core rules, but the issue was that those _contract_ cards require _text to explain the contract_. Even if very simple, that still requires the players to be old enough to read (in English). Understanding how likely you are to pass a challenge, together or not, is another matter that younger players probably will not get.

That's why I eventually moved this game a bit further into the project. I created code to randomly generate a set of varied and balanced contracts, so if you press that button (instead of downloading my premade PDF), you get a completely unique game every time!

And as I worked more on it, the title _Chaos Contract_ came to me, and the theme slowly shifted to something like "making a deal with the devil". Every turn, you try to succeed at some improbable challenge by rolling dice, and you'll often take other players with you in the fall---or success, of course.

{{% /section-centered %}}