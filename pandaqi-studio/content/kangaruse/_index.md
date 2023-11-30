---
draft: false
type: "single"

gamepage: true
boardgame: true

title: "Kangaruse"
headerTitle: "Kangaruse | Jumping has never been so tactical and treacherous"
blurb: "Jumping has never been so tactical and treacherous. Hop along the smartest route to collect the most points before your opponents stamped the whole brushland to dust."

fullHeaderImg: "kangaruse_header"
headerImg: "kangaruse_header"

headerThumb: "favicon"

customHeight: "small"
headerDarkened: true

color: "brown"

bgColor: "#083d08"
bgColorLink: "#9ce4eb"

textColor: "#cdfff9"
textColorLink: "#083d42"

googleFonts: ""

date: 2024-03-26

categories: ["boardgame"]
tags: ["one_paper_game", "opg"]

extraCSS: true
extraJSBoard: true
extraJSBoardInclude: true

downloadLink: "https://drive.google.com/drive/folders/1kYuSs0w3yKLQBMqBWOlS4ZzGUY32vrHB"

multiplayermode: "competitive"
language: EN
genre: ["opg", "simple", "quick", "wildlife", "nature", "tactical", "point salad"]
playtime: 20
playercount: [2,3,4,5]
complexity: low
ages: everyone

---


{{% boardgame-intro heading="" img="kangaruse_header" %}}

Hop along the smartest route to collect points and powers---before your opponents blocked all your desired jumps.

{{% /boardgame-intro %}}

{{% section-centered heading="webp/page_heading_1.webp" asimage="true" %}}

[Generate](#board) a paper below. Or click the "Download" button to find a PDF I already generated for you.

Print and play!

If you didn't add rules on the paper itself---or just want more clarification---read the short [playful rules](rules).

{{% /section-centered %}}

{{% section-centered heading="webp/page_heading_2.webp" html="true" anchor="board" asimage="true" %}}

<p>Input your desired settings and click "generate".</p>

{{< boardgame-settings type="board" local_storage="kangaruseConfig" >}}
  {{< setting-hidden id="setting-gameTitle" text="Kangaruse" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly grayscale to conserve ink." >}}
  {{< setting-enum id="setting-sideBarType" text="Side Bar?" values="No,Rules,Score" valaskey="true" remark="Add the rules or a score tracker on the paper itself?" def="Rules" >}}
  {{< setting-checkbox id="setting-startingPositions" text="Starting Positions?" remark="Marks a few squares as possible starting positions." >}}
  {{< setting-enum id="setting-boardSize" text="Board Size?" values="Tiny,Small,Regular,Large,Huge" valaskey="true" remark="For a really short or really long game." def="Regular" >}}
  {{< setting-checkbox id="setting-simplifiedIcons" text="Simplified Icons?" remark="Uses simple icons for all types, instead of realistic illustrations." >}}
{{< /boardgame-settings >}}

<p class="remark-under-settings"><strong>Not working?</strong> Don't worry! At the "Download" link, you can also find PDFs I already generated for you.</p> 

{{% /section-centered %}}

{{% section-centered heading="webp/page_heading_3.webp" asimage="true" %}}

I've used the fonts **Mail Ray Stuff** (headings, thick) and **Poppins** (body, thin). The latter is freely available on Google Fonts, the first was received from 1001fonts.

Idea, rules, code and assets are completely mine. A generative AI was used for some parts, especially the animals, though parts were edited or redrawn by me. (If you ask the AI to create a Wolf Spider for example, a common animal in Australia, it just blends a Wolf and a Spider ... while getting the number of legs wrong. Every time.)

This idea started when I woke up one morning and had this pressing thought about a kangaroo game. By the time I got downstairs and could write it down, it had already evolved into a simple but powerful mechanic that could sustain a whole game.

This might be the simplest One Paper Game I ever made, while having a lot of depth and a theme that makes total sense. 

That was a good morning.

Want more details? Check out the [devlog](https://pandaqi.com/blog/boardgames/kangaruse).

Below is a quick image (from my cheap phone) of one early test game we played.

<img src="assets/kangaruse_playtest_paper.webp">

As usual, my players stubbornly insisted on complicated icons and aggressively crossing out squares from opponents who just blocked their move ;) Otherwise, this is fairly representative of what a finished game looks like.

{{% /section-centered %}}