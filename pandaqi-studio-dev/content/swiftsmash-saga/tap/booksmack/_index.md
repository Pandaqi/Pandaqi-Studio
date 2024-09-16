---
type: "gamepage"
boardgame: true

title: "Booksmack"
headerTitle: "Be the first to tap the highest letter of the alphabet ... or sneakily take away victory by spelling a word."

color: "purple"

downloadLink: "https://drive.google.com/drive/folders/13Pl94vYlfbsGWsz5_ADtw0wvNRmFUs6E"

date: 2025-07-26

difficulty: "kids-can-play"
genres: ["family", "thematic", "adventure"]
categories: ["boardgame", "tile-game", "standard"]
tags: ["fixed-order", "shared-map", "grid", "turn-based", "guessing", "bias", "variable-setup", "orientation", "set-collection", "high-score"]
themes: ["sea"]

multiplayermode: "competitive"
language: EN
playtime: 30
playercount: [2,3,4,5,6,7,8]
ages: everyone
devlog: "/blog/boardgames/swiftsmash-saga/booksmack/"

---

{{% boardgame-intro /%}}

{{% boardgame-instructions %}}
The base game has only two rules and no text on cards. It's ideal for little kids **learning the alphabet** (and language in general). Adding the expansion(s) makes it a more tactical game for all ages.
{{% /boardgame-instructions %}}

{{% boardgame-settings-container type="material" %}}

{{< boardgame-settings type="game" local_storage="booksmackConfig" btn_label="Generate Material" game_title="Booksmack" defaults="true">}}
  {{< boardgame-settings-section heading="Sets" >}}
    {{< setting-checkbox id="setting-sets-base" text="Base?" checked="checked" >}}
    {{< setting-checkbox id="setting-sets-powerPunctuation" text="Power Punctuation?" >}}
    {{< setting-checkbox id="setting-sets-niftyNumbers" text="Nifty Numbers?" >}}
    {{< setting-checkbox id="setting-sets-gigglingGlyphs" text="Giggling Glyphs?" >}}
    {{< setting-checkbox id="setting-sets-cursedCritics" text="Cursed Critics?" >}}
  {{< /boardgame-settings-section >}}
{{< /boardgame-settings >}}

{{% /boardgame-settings-container %}}

{{% section-centered heading="Credits" anchor="credits" %}}

The fonts used are **Abril Fatface** (headings) and **Whackadoo** (body text). Everything else is mine.

I'm not sure how this idea came to me, but I'm glad it did. I guess I was just brainstorming possible entries into the _SwiftSmash Saga_ (games about quickly "smashing" or "tapping" the right card), and then it suddenly occured to me that the _alphabet_ has an implicit order. 

An order that everyone knows: the "a" comes before the "b", which comes before the "c", and so forth.

If players simply hold cards with a letter ... I get a good game (seemingly for free) from just _one_ rule: "Smash the letter that comes latest in the alphabet"

Well, I made that game, added a few more fun tweaks or special actions, and it was indeed as good and simple as I hoped. I think _Booksmack_ is perhaps the most elegant design I ever made. The amount of fun gameplay you get in return for just _two rules_ is astonishing. That's also why I placed this game as the "first" (or "easiest") entry into the SwiftSmash Saga.

{{% /section-centered %}}