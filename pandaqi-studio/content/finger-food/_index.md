---
draft: false
type: "single"

gamepage: true
boardgame: true

title: "Finger Food"
headerTitle: "Finger Food | A quick game playable with just a paper and your fingers"
blurb: "A quick game playable with just a single paper. Each turn, place a finger on a new square, to score more points than your opponents before you've used your whole hand."

fullHeaderImg: "finger_food_header"
headerImg: "finger_food_header"

headerThumb: "favicon"

customHeight: "small"
headerDarkened: true

color: "pink"

bgColor: "#613700"
bgColorLink: "#ffbc8b"

textColor: "#ffded3"
textColorLink: "#5b2608"

googleFonts: "https://fonts.googleapis.com/css2?family=Cherry+Bomb+One&family=Quicksand:wght@500;700&display=swap"

date: 2024-01-26

categories: ["boardgame"]
tags: ["one_paper_game", "opg"]

extraCSS: true
extraJSBoard: true
extraJSBoardInclude: true

downloadLink: "https://drive.google.com/drive/folders/101SQ5KBbdwiiYC-2nU-5H7gKoTnqhXZE"

multiplayermode: "competitive"
language: EN
genre: ["opg", "simple", "quick", "travel", "creative", "colorful"]
playtime: 20
playercount: [2,3,4,5,6]
complexity: low
ages: everyone

---

{{% boardgame-intro heading="" img="finger_food_header" %}}

Place your fingers on the best squares and score more pie points than your opponents! Playable with just a single paper, nothing else needed.

{{% /boardgame-intro %}}

{{% section-centered heading="What do I need?" icon="webp/finger_food_hand.webp" %}}

Generate a paper below. Print and play!

Or click the "Download" button to print one of the PDFs I already generated for you.

{{% /section-centered %}}

{{% section-centered heading="Board" html="true" anchor="board" icon="webp/finger_food_hand.webp" %}}

<p>Input your desired settings and click "generate". Rules are explained on the board itself.</p>

{{< boardgame-settings type="board" local_storage="fingerFoodConfig" >}}
  {{< setting-hidden id="setting-gameTitle" text="Finger Food" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly grayscale to conserve ink." >}}
  {{< setting-checkbox id="setting-includeRules" text="Include Rules?" remark="Only turn off if you're familiar with all the rules." checked="checked" >}}
  <h3>Expansions</h3>
  {{< setting-checkbox id="setting-expansions-machines" text="Mighty Machines?" remark="Adds squares with a special action when you pick them." >}}
  {{< setting-checkbox id="setting-expansions-recipeBook" text="Recipe Book?" remark="Adds more ways to score by combining specific ingredients!" >}}
  {{< setting-checkbox id="setting-expansions-money" text="Dining Dollars?" remark="Adds the element of money, causing longer and more tactical games." >}}
  {{< setting-checkbox id="setting-expansions-fixedFingers" text="Fixed Fingers?" remark="Adds restrictions to which finger you're allowed to use for something." >}}
{{< /boardgame-settings >}}

<p class="remark-under-settings"><strong>Not working?</strong> Don't worry! At the "Download" link, you can also find PDFs I already generated for you.</p> 

{{% /section-centered %}}

{{% section-centered heading="Clarifications" icon="webp/finger_food_hand.webp" %}}

Yes, you really play with your hands! And yes, that means you might physically get in each other's way, and people with large hands naturally have a slight advantage, and after a while you'll need to move your head to see some obscured squares.

This game isn't a 1-hour long tactical battle---it's a fun game to play in ten minutes that needs _no_ other preparation or material whatsoever.

Boards are as balanced and pretty as I can make them (through random generation code). If you don't like the look of one, however, or think it's unbalanced, just press the button again to generate another! It's free! And fast!

To make sure we're all on the same page, here is an image of how a single hand might be placed and how to score it (at the end of the game.)

![Example of hand placement and scoring.](rules_explanation.webp)

At the end, you might want to take a picture (from above) or write down the fingers for each player on another paper. Especially if you have many players (4+), it can be tiring to keep your hand in a difficult position for a long time, or very hard to verify scores from your own perspective.

{{% /section-centered %}}

{{% section-centered heading="Credits" icon="webp/finger_food_hand.webp" %}}

I've used the fonts **Cherry Bomb One** (headings, thick) and **Quicksand** (body, thin). They are both freely available from Google Fonts.

Everything else (idea, code, assets) are completely mine, with the exception of some ingredient and machine illustrations. For those a generative AI was used, although they were often (heavily) edited afterwards to keep a consistent style.

Want more details? Check out the [devlog](https://pandaqi.com/blog/boardgames/finger-food/).

{{% /section-centered %}}

{{< support >}}