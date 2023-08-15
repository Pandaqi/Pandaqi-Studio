---
# draft: true
type: "single"

gamepage: true
boardgame: true

title: "Hand Pies"
headerTitle: "Hand Pies | A quick game playable with just a paper and your fingers"
blurb: "A quick game playable with just a single paper. Each turn, place a finger on a new square, to score more points than your opponents before you've used your whole hand."

fullHeaderImg: "foldigami_header"

headerThumb: "foldigami_header"

customHeight: "small"
headerDarkened: true

color: "pink"

bgColor: "#083d08"
bgColorLink: "#9ce4eb"

textColor: "#cdfff9"
textColorLink: "#083d42"

googleFonts: "https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,400;0,900;1,400&family=Jockey+One&display=swap"

date: 2023-08-13 # @TODO: real release date is 2024-01-26

categories: ["boardgame"]
tags: ["one_paper_game", "opg"]

extraCSS: true
extraJS: true
extraJSBuild: true

downloadLink: "https://drive.google.com/drive/folders/101SQ5KBbdwiiYC-2nU-5H7gKoTnqhXZE"

multiplayermode: "competitive"
language: EN
genre: ["opg", "simple", "quick", "travel", "creative", "colorful"]
playtime: 20
playercount: [2,3,4,5,6]
complexity: low
ages: everyone

---


{{% boardgame-intro heading="" img="foldigami_header" url="https://drive.google.com/drive/folders/101SQ5KBbdwiiYC-2nU-5H7gKoTnqhXZE" %}}

Place your fingers on the best squares and score more pie points than your opponents! Playable with just a single paper, nothing else needed.

{{% /boardgame-intro %}}

{{% section-centered heading="What do I need?" %}}

Generate a paper below. Print and play!

Or click the "Download" button to print one of the PDFs I already generated for you.

{{% /section-centered %}}

{{% section-centered heading="Board" html="true" anchor="board" %}}

<p>Input your desired settings and click "generate". Rules are explained on the board itself.</p>

{{< boardgame-settings type="board" local_storage="handPiesConfig" >}}
  {{< setting-hidden id="setting-gameTitle" text="Hand Pies" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly grayscale to conserve ink." >}}
  {{< setting-checkbox id="setting-includeRules" text="Include Rules?" remark="Only turn off if you're familiar with all the rules." checked="checked" >}}
  <h3>Expansions</h3>
  {{< setting-checkbox id="setting-expansions-machines" text="Mighty Machines?" remark="Adds squares with a special action when you pick them." >}}
  {{< setting-checkbox id="setting-expansions-recipeBook" text="Recipe Book?" remark="Adds more ways to score by combining specific ingredients!" >}}
  {{< setting-checkbox id="setting-expansions-money" text="Dining Dollars?" remark="Adds the element of money, causing longer and more tactical games." >}}
  {{< setting-checkbox id="setting-expansions-fixedFingers" text="Fixed Fingers?" remark="Adds restrictions to which finger you're allowed to use for something." >}}
{{< /boardgame-settings >}}

<p class="remark-under-settings"><strong>Not working?</strong> Don't worry! At the "Download" link, you can also find PDFs with valid boards for all situations. Check the "Premade" folder.</p> 

{{% /section-centered %}}

{{% section-centered heading="Credits" %}}

I've used the fonts **Cherry Bomb One** (headings, thick) and **Quicksand** (body, thin). They are both freely available from Google Fonts.

Most of the assets and code are completely mine. For some of the images, a generative AI was used. Sometimes for inspiration, sometimes as part of the end product.

@TODO: Make a joke/reference about _finger food_.

Want more details? Check out the [devlog](https://pandaqi.com/blog/boardgames/hand-pies).

{{% /section-centered %}}