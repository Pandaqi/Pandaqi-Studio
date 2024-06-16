---
type: "single"
gamepage: true
boardgame: true

title: "Pyrrameds"
headerTitle: "Build a pyramid of cards that delivers the right medicine to the right patients."
blurb: "Build a pyramid of cards that delivers the right medicine to the right patients. Do it with everyone else, but finish before anyone else."

extraCSS: true
downloadLink: "https://drive.google.com/drive/folders/1qkIw5weWYltavQCp8GJ-TmiT63Pb9sci"

customHeight: "small"
headerDarkened: true

color: "yellow"

bgColor: "#503000"
bgColorLink: "#b8dcce"

textColor: "#ffeedd"
textColorLink: "#112233"

date: 2025-05-26

categories: ["boardgame"]
tags: ["creative", "guessing", "word"]

multiplayermode: "competitive"
language: EN
playtime: 30
playercount: [2,3,4,5,6]
ages: everyone
devlog: "/blog/boardgames/pyrrameds/"

---

{{% boardgame-intro heading="" %}}

Build a pyramid of cards that delivers the right medicine to the right patients.

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

{{< boardgame-settings type="game" local_storage="pyrramedsConfig" btn_label="Generate Material" game_title="Pyrrameds" defaults="true" >}}
  {{< boardgame-settings-section heading="Sets" >}}
    {{< setting-checkbox id="setting-sets-base" text="Base Game?" checked="checked" >}}
    {{< setting-checkbox id="setting-sets-operations" text="Operations?" >}}
    {{< setting-checkbox id="setting-sets-intensiveCare" text="Intensive Care?" >}}
  {{< /boardgame-settings-section >}}
{{< /boardgame-settings >}}

<p class="settings-remark"><strong>Not working? Or unsure what to do?</strong> The "Download" button above has PDFs I already made for you! Pick any one of those.</p>

{{% /section-centered %}}

{{% section-centered heading="Credits" anchor="credits" %}}

The fonts used are **Library 3 AM** (headings, decorative) and **Bellota** (body, readable, longer paragraphs). Both a freely available online. 

Honestly, finding fonts was hard for this game, because I wanted to convey "medicine" or "hospital" ... without making the game look very serious or deep. Because it's just a short card game about placing cards tactically in a pyramid shape.

Some generative AI was used for detailed illustrations. Everything else---code, assets, design, rules, etcetera---is mine!

This game idea has no especially funny or interesting origin story. It just popped into my head when I went to bed one night: place medicine or patients in a pyramid, but the patients may only be placed if there's a _path_ through medicine that has exactly what they need. It seemed simple enough that I could find the time to just _make it_ and see what happened.

I decided to write a simulation first (instead of doing a paper prototype first) this time. This showed me that teaching computers how pyramid shape/placement works is _not fun_. It also helped me finetune the numbers to ensure the game is always playable and winnable. It's no guarantee it will be _fun_, but it's a guarantee it's at least _not bad_.

(Yes, I know Pyramid has one -r. I made it two just to prevent people and machines autocorrecting the game's title to Pyramids immediately.)

{{% /section-centered %}}