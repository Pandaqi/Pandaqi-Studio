---
type: "single"
gamepage: true
boardgame: true

title: "Noble Flood"
headerTitle: "Score the best possible patterns with your hand of cards or deny others the opportunity."
blurb: "Score the best possible patterns with your hand of cards or deny others the opportunity. Also playable with standard deck of cards."

extraCSS: true
downloadLink: ""

customHeight: "small"
headerDarkened: true

color: "purple"

bgColor: "#003401"
bgColorLink: "#ff1f1f"

textColor: "#f2ffef"
textColorLink: "#ffe9e9"


date: 2023-01-01 # 2024-12-26

categories: ["boardgame"]
tags: ["creative", "guessing", "word"]

multiplayermode: "competitive"
language: EN
genre: ["card", "party", "social"]
playtime: 30
playercount: [3,4,5,6,7]
complexity: low
ages: everyone
devlog: "/blog/boardgames/noble-flood/"

---

{{% boardgame-intro heading="" %}}

Score the best possible patterns with your hand of cards or deny others the opportunity.

{{% /boardgame-intro %}}

{{% section-centered heading="What do I need?" %}}

Three simple steps.
* Read the short [playful rules](rules).
* Download the base game PDF. (Download > Files > Base Set.)
* Print, cut, play!

**Want more?** You can also [generate your own material](#material) right on this website!

{{% /section-centered %}}

{{% section-centered heading="Material" anchor="material" html="true" %}}

<p>Pick your desired settings and click the button! When in doubt, just use the defaults for your first games.</p>

{{< boardgame-settings type="game" local_storage="nobleFloodConfig" btn_label="Generate Material" game_title="Noble Flood" defaults="true" >}}
  {{< setting-checkbox id="setting-generatePlayingCards" text="Generate Playing Cards?" checked="checked" remark="If turned off, you can use your own standard card deck to play the game." >}}
  {{< boardgame-settings-section heading="Sets" >}}
    {{< setting-checkbox id="setting-sets-base" text="Base Game?" checked="checked" >}}
    {{< setting-checkbox id="setting-sets-fullFlood" text="Full Flood?" >}}
    {{< setting-checkbox id="setting-sets-straightShake" text="Straight Shake?" >}}
  {{< /boardgame-settings-section >}}
{{< /boardgame-settings >}}

<p class="settings-remark"><strong>Not working? Or unsure what to do?</strong> The "Download" button above has PDFs I already made for you! Pick any one of those.</p>

{{% /section-centered %}}

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