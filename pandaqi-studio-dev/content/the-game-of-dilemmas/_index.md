---
type: "single"
gamepage: true
boardgame: true

title: "The Game of Dilemmas"
headerTitle: "Create the juiciest dilemmas that have players doubt themselves"
blurb: "Combine a positive and negative card from your hand to create a dilemma. If yours is the most controversial, you score the most points!"

extraCSS: true
downloadLink: "https://drive.google.com/drive/folders/1b-raHI4BNZjow8E4X9Qc7ZLWbr4jZ3ne" # already updated!

customHeight: "small"
headerDarkened: true

color: "green"

bgColor: "#003401"
bgColorLink: "#ff1f1f"

textColor: "#f2ffef"
textColorLink: "#ffe9e9"

googleFonts: ""

date: 2023-01-01 # 2024-12-26

categories: ["boardgame"]
tags: ["creative", "guessing", "ranking"]

multiplayermode: "competitive"
language: EN
genre: ["card", "party", "social"]
playtime: 30
playercount: [3,4,5,6]
complexity: low
ages: everyone

---

{{% boardgame-intro heading="" %}}

Create tough dilemmas by combining cards from your hand, then make sure yours gets the most controversial votes.

{{% /boardgame-intro %}}

{{% section-centered heading="What do I need?" %}}

Three simple steps.
* Read the ultra-short [playful rules](rules).
* Download the base game PDF. (Download > Files > Base Pack.)
* Print, cut, play!

**Want more?** You can also [generate your own material](#material) right on this website!

{{% /section-centered %}}

{{% section-centered heading="Material" anchor="material" html="true" %}}

<p>Pick your desired settings and click the button! When in doubt, just use the defaults for your first games.</p>

{{< boardgame-settings type="game" local_storage="theGameOfDilemmasConfig" btn_label="Generate Material" >}}
	{{< setting-hidden id="setting-gameTitle" text="The Game Of Dilemmas" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly grayscale." >}}
  {{< setting-enum id="setting-itemSize" text="Card Size?" values="small,regular,large" valaskey="true" def="regular" >}}
  {{< setting-checkbox id="setting-includeCards" text="Include Cards?" checked="checked" >}}
  {{< setting-checkbox id="setting-includeTokens" text="Include Tokens?" checked="checked" remark="If you already have these, or plan on using something else, you can disable this." >}}
  <h3>Packs</h3>
  {{< setting-checkbox-multiple id="setting-packs" values="base,advanced,expert,extraordinary" keys="Base,Advanced,Expert,Extraordinary" valuesChecked="base" >}}
{{< /boardgame-settings >}}

<p class="settings-remark"><strong>Which pack(s) should I use!?</strong> The packs mostly exist to break the huge number of possible cards into smaller chunks. There are no big differences. Each pack could be used standalone or mixed with any other packs in a game.</p> 

<p class="settings-remark">Except for the <strong>extraordinary</strong> pack! It contains more adult content, not suitable for every group. (It's also much smaller, so needs to be shuffled into existing packs.)</>

<p class="settings-remark"><strong>Not working? Or unsure what to do?</strong> The "Download" button above has PDFs I already made for you! Pick any one of those.</p>

{{% /section-centered %}}

{{% section-centered heading="Credits" anchor="credits" %}}

The fonts used are **Sunny Spells** (headings, decorative) and **Minya Nouvelle** (body, text, paragraphs). Both freely available for commercial use. Everything else is entirely mine.

This is an incredibly simple party game that naturally grew out of [The Game of Happiness](https://pandaqi.com/the-game-of-happiness/). While the original is a cooperative experience, this one is more a truly competitive game. 

I think the Game of Happiness works best in families or groups that want to actually explore what makes them (or their loved ones) happy. It's surely a game, but not competitive and more focused on emotions.

The Game of Dilemmas is more of a silly, gamified, creative, try-your-best-to-make-your-friends-laugh.

For more information, as always, read my [detailed developer diary on Pandaqi Blog](https://pandaqi.com/blog/boardgames/the-game-of-dilemmas/).

**Want to add your own cards?** You can always send me a message with ideas for cards! Once I have enough, I can easily add them as another pack.

{{% /section-centered %}}