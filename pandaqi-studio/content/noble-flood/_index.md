---
type: "gamepage"
boardgame: true

title: "Noble Flood"
headerTitle: "Score the best possible patterns with your hand of cards or deny others the opportunity."
blurb: "Score the best possible patterns with your hand of cards or deny others the opportunity. Also playable with standard deck of cards."
blurbShort: "Score the best possible patterns with your hand of cards or deny others the opportunity."

downloadLink: "https://drive.google.com/drive/folders/1CcsMv1m33GWZypAiNYZgkpCh17RQtqW5"

color: "purple"

date: 2025-05-26

difficulty: "simple"
categories: ["boardgame", "card-game"]
genre: ["family"]
tags: ["contracts", "shared-map", "high-score"]
themes: []

multiplayermode: "competitive"
language: EN
playtime: 30
playercount: [2,3,4,5,6]
ages: everyone
devlog: "/blog/boardgames/noble-flood/"

---

{{% boardgame-intro /%}}

{{% boardgame-instructions /%}}

{{% boardgame-settings-container type="material" %}}

{{< boardgame-settings type="game" local_storage="nobleFloodConfig" btn_label="Generate Material" game_title="Noble Flood" defaults="true" >}}
  {{< setting-checkbox id="setting-generatePlayingCards" text="Generate Playing Cards?" checked="checked" remark="If turned off, you can use your own standard card deck to play the game." >}}
  {{< setting-checkbox id="setting-generateContracts" text="Generate Contracts?" checked="checked" remark="Required to play the game." >}}
  {{< boardgame-settings-section heading="Sets" >}}
    {{< setting-checkbox id="setting-sets-base" text="Base Game?" checked="checked" >}}
    {{< setting-checkbox id="setting-sets-fullFlood" text="Full Flood?" >}}
    {{< setting-checkbox id="setting-sets-straightShake" text="Straight Shake?" >}}
  {{< /boardgame-settings-section >}}
{{< /boardgame-settings >}}

{{% /boardgame-settings-container %}}

{{% section-centered heading="Credits" anchor="credits" %}}

The fonts used are **Romes Palace** (headings, decorative) and **Cardo** (body, readable, longer paragraphs). Some illustrations also use **Rechtman** (cursive, wavey). All of these are freely available online.

Everything else---code, assets, design, rules, etcetera---is mine!

This game was born from two ideas clashing in my head at the same time. 

Firstly, my disappointment with _poker_ (and similar games). Many people ignore the bluffing aspect (or just can't do it), which mostly turns my poker games into "get lucky with your cards". And I am _never_ lucky in games, always getting the absolute worst poker hands ;)

Secondly, I was making my general list of game mechanics and game genres (for [categorization of this website](/tools/categorizer/)), and came across a few mechanics I had never even considered before. One of them was "contracts": players choose which simple "mission" or "contract" they will fulfill this round. For example, "play 3 Hearts".

To me, contracts solved the issue of unlucky hands. You could simply pick the contract that best _suited_ your hand each round. And because everyone does so, you also naturally get information about what _they_ might be holding in their hand. (If they pick the contract to play loads of Hearts, well, they probably have loads of Hearts right?)

All of that combined into this simple card-based game that I like a lot.

And yes, _Noble Flood_ is a pun on _Royal Flush_. It felt like a silly temporary name, until I started to like it a lot halfway through development, and it stuck.

{{% /section-centered %}}