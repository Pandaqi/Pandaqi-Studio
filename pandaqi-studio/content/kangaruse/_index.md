---
draft: true
type: "single"

gamepage: true
boardgame: true

title: "Kangaruse"
headerTitle: "Kangaruse | Jumping has never been so tactical and treacherous"
blurb: "Jumping has never been so tactical and treacherous. Hop along the smartest route to collect the most points before your opponents stamped the whole brushland to dust."

fullHeaderImg: "foldigami_header"

headerThumb: "foldigami_header"

customHeight: "small"
headerDarkened: true

color: "green"

bgColor: "#083d08"
bgColorLink: "#9ce4eb"

textColor: "#cdfff9"
textColorLink: "#083d42"

googleFonts: ""

date: 2023-08-13 # @TODO: real release date is 2024-03-26

categories: ["boardgame"]
tags: ["one_paper_game", "opg"]

extraCSS: true
extraJS: true
extraJSBuild: true

downloadLink: "https://drive.google.com/drive/folders/1kYuSs0w3yKLQBMqBWOlS4ZzGUY32vrHB"

multiplayermode: "competitive"
language: EN
genre: ["opg", "simple", "quick", "wildlife", "nature", "tactical", "point salad"]
playtime: 20
playercount: [2,3,4,5,6]
complexity: low
ages: everyone

---


{{% boardgame-intro heading="" img="foldigami_header" url="https://drive.google.com/drive/folders/1kYuSs0w3yKLQBMqBWOlS4ZzGUY32vrHB" %}}

Hop along the smartest route to collect the best squares---before your opponents stamped the whole brushland to dust and made jumping impossible.

{{% /boardgame-intro %}}

{{% section-centered heading="What do I need?" %}}

Generate a paper below. Print and play!

Or click the "Download" button to print one of the PDFs I already generated for you.

{{% /section-centered %}}

{{% section-centered heading="Board" html="true" anchor="board" %}}

<p>Input your desired settings and click "generate".</p>

{{< boardgame-settings type="board" local_storage="kangaruseConfig" >}}
  {{< setting-hidden id="setting-gameTitle" text="Kangaruse" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly grayscale to conserve ink." >}}
  {{< setting-checkbox id="setting-includeRules" text="Include Rules?" remark="Adds the rules on the paper itself." >}}
  <h3>Expansions</h3>
  {{< setting-checkbox id="setting-expansions-machines" text="Mighty Machines?" remark="Adds squares with a special action when you pick them." >}}
  {{< setting-checkbox id="setting-expansions-recipeBook" text="Recipe Book?" remark="Adds more ways to score by combining specific ingredients!" >}}
  {{< setting-checkbox id="setting-expansions-money" text="Dining Dollars?" remark="Adds the element of money, causing longer and more tactical games." >}}
  {{< setting-checkbox id="setting-expansions-fixedFingers" text="Fixed Fingers?" remark="Adds restrictions to which finger you're allowed to use for something." >}}
{{< /boardgame-settings >}}

<p class="remark-under-settings"><strong>Not working?</strong> Don't worry! At the "Download" link, you can also find PDFs with valid boards for all situations. Check the "Premade" folder.</p> 

{{% /section-centered %}}

{{% section-centered heading="Credits" %}}

I've used the fonts **Mail Ray Stuff** (headings, thick) and **Poppins** (body, thin). The latter is freely available on Google Fonts, the first was received from 1001fonts.

Idea, rules, code and assets are completely mine. A generative AI was used for inspiration, but cast aside once I noticed it was easier to draw what I was looking for myself.

This idea started when woke up one morning and had this pressing thought about a kangaroo game. By the time I got downstairs and could write it down, it had already evolved into a simple but powerful mechanic that could sustain a whole game.

This might be the simplest One Paper Game I ever made, while having a lot of depth and theme that makes total sense. 

That was a good morning.

Want more details? Check out the [devlog](https://pandaqi.com/blog/boardgames/kangaruse).

{{% /section-centered %}}