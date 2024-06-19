---
type: "gamepage"
gamepage: true
boardgame: true

title: "Sleighwell"
headerTitle: "Santa needs help delivering presents in a town that constantly changes."
blurb: "A cooperative game about placing houses and presents such that the sleigh can fulfill all wishes, with a dash of reindeer road and pine tree obstacles."

downloadLink: "https://drive.google.com/drive/folders/11q1JvlufY06QORspG35SfAKQU4JakWhS"


color: "white"



date: 2023-01-01 # 2024-07-25?

categories: ["boardgame"]
tags: ["holiday", "Christmas", "brainteaser"]

multiplayermode: "cooperative"
language: EN
genre: ["tile", "party", "puzzle"]
playtime: 30
playercount: [2,3,4,5,6]
complexity: low
ages: everyone

---

{{% boardgame-intro heading="" %}}

Santa needs help delivering presents in a town that constantly changes.

{{% /boardgame-intro %}}

{{% section-centered heading="What do I need?" %}}

Three simple steps.
* Read the extremely short [playful rules](rules).
* Download the base game PDF. (Download > Files > Base Game.)
* Print, cut, play!

**Want more?** You can also [generate your own material](#material) right on this website!

{{% /section-centered %}}

{{% section-centered heading="Material" anchor="material" html="true" %}}

<p>Pick your desired settings and click the button! When in doubt, just use the defaults for your first games.</p>

{{< boardgame-settings type="game" local_storage="sleighwellConfig" btn_label="Generate Material" >}}
	{{< setting-hidden id="setting-gameTitle" text="Sleighwell" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly grayscale." >}}
  {{< setting-enum id="setting-cardSize" text="Tile Size?" values="small,regular,huge" valaskey="true" def="regular" >}}
  {{< setting-enum id="setting-set" text="Set?" values="Base Game,Reindeer Way,Tough Trees,Special Sleighs" keys="baseGame,reindeerWay,toughTrees,specialSleighs" def="regular" remark="The other sets are (recommended) expansions and require you to already have the base game." >}}
{{< /boardgame-settings >}}

<p class="settings-remark"><strong>Not working? Or unsure what to do?</strong> The "Download" button above has PDFs I already made for you! Pick any one of those.</p>

{{% /section-centered %}}

{{% section-centered heading="Credits" anchor="credits" %}}

The fonts used are **Grace** (headings, fancy text) and **Roboto** (body text, readable, multiple variations). Both freely available online. Parts of the illustrations were generated with AI; everything else is mine.

Obviously, this game started a few months before Christmas. I'd already created a Halloween game which we played with the family that same night. It was quite a success, so my mind raced to invent another simple game (for a large group of players) for Christmas.

After a week of half-baked not-so-great ideas, this one came along. I instantly tested it against myself (with a paper prototype) and confirmed it had potential. A few days later, Sleighwell existed.

A simple game that simulates Santa's job quite well, while being _cooperative_ (always great for families or large groups) and having surprising _depth_. The teach is one minute. Turns are five seconds. Ideal for a family game!

For more information, as always, read my [detailed developer diary on Pandaqi Blog](/blog/boardgames/sleighwell).

{{% /section-centered %}}