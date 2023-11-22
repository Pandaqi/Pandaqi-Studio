---
type: "single"
gamepage: true
boardgame: true

title: "The Mist"
headerTitle: "The Mist | Explore an area covered in mist and discover the right path."
blurb: "A Mist covers the world. Each area might be a warm fire, or a trap, or a portal---you decide, but do so wisely."

extraCSS: true
extraJSBoard: true
extraJSBoardInclude: true
downloadLink: "https://drive.google.com/drive/folders/1yy2JZhtm1iiTvff9o3kyOf0sXtMQjF_f" # already updated!

fullHeaderImg: "aeronaut_header"
headerImg: "aeronaut_header"

headerThumb: "favicon"

customHeight: "small"
headerDarkened: true

color: "blue"

bgColor: "#014556"
bgColorLink: "#601a87"

textColor: "#e6faff"
textColorLink: "#edccff"

googleFonts: ""

date: 2023-01-01 # 2024-05-25

categories: ["boardgame"]
tags: []

multiplayermode: "competitive"
language: EN
genre: ["opg", "strategy", "map"]
playtime: 45
playercount: [2,3,4,5,6]
complexity: medium
ages: everyone

---

{{% boardgame-intro heading="" %}}

A [One Paper Game](/boardgames#one_paper_games) about exploring a world where each square is multiple things at once---until you step onto it.

{{% /boardgame-intro %}}

{{% section-centered heading="How to play?" %}}

[Generate](#board) a paper below. Or click the "Download" button and pick any _one_ PDF I already generated for you.

Print and play! 

The rules are so simple, they're on the paper itself. (If you still want a reference or more clarification, check the [rules](rules) page.)

{{% section-centered heading="Material" anchor="material" html="true" %}}

<p>Input your settings, press the button, and download the PDF with your unique world!</p>

{{< boardgame-settings type="board" local_storage="theMistConfig" >}}
	{{< setting-hidden id="setting-gameTitle" text="The Mist" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the board mostly grayscale." >}}
  {{< setting-checkbox id="setting-includeRules" text="Include Rules?" checked="checked" remark="Only disable this if you know all the rules by heart." >}}
  <!--- @TODO: probably some difficulty setting or advanced sets to include --->
{{< /boardgame-settings >}}

<p class="settings-remark"><strong>Not working?</strong> Don't worry! At the "download" button you can find loads of premade boards I already generated for you. (Also, send me an email about what isn't working.)</p>

{{% /section-centered %}}


{{% section-centered heading="Credits" %}}

The fonts used are **??** (headings) and **??** (body). Both freely available. 

@TODO

Want more details? Check out the [devlog](https://pandaqi.com/blog/boardgames/the-mist).

{{% /section-centered %}}