---
type: "single"
gamepage: true
boardgame: true

title: "Slippery Slopes: Trippy Touches"
headerTitle: "A spin-off of Slippery Slopes, completely playable on one mobile phone."
blurb: "It's Slippery Slopes, but now playable on one mobile phone!"

customHeight: "small"
headerDarkened: true

color: "red"

bgColor: "#014556"
bgColorLink: "#601a87"

textColor: "#e6faff"
textColorLink: "#edccff"

date: 2024-04-25

difficulty: "no-brainer"
genres: ["party"]
categories: ["game", "spin-off"]
tags: ["social", "guessing", "sorting", "language", "creative", "limited-communication"]
themes: ["retro", "colorful"]

extraCSS: true
customJS: ["external"]

multiplayermode: "cooperative"
language: EN
playtime: 20
playercount: [2,3,4,5,6,7,8,9,10]
ages: everyone
devlog: "/blog/boardgames/slippery-slopes/"

---

<div class="boardgame-intro">
  <div class="big-header-image">
    <img src="webp/slippery_slopes_trippy_touches_header.webp">
  </div>
</div>

{{% section-centered heading="" %}}

<p style="font-size: 1.5em; line-height: 1.35em; text-align: center;">How would you communicate the word <strong>"<span id="random-slippery-word">...</span>"</strong> using only the four sliders below?</p>

<div class="slippery-slopes-interactive-widget" data-wordnodeid="random-slippery-word" data-reloadbtnid="slippery-reload-button"></div>

<p style="font-size: 0.75em; opacity: 0.75; text-align: center; margin-top: 0;">(Use your mouse/finger to move them!)</p>

Congratulations, you've just learned how to play this quick party game! Use the section below to start an official game on your phone. Or <a href="" id="slippery-reload-button">refresh this example</a> as much as you like.

{{% /section-centered %}}

{{% section-centered heading="Game" anchor="game" html="true" %}}

<p>Input your settings, click the button. The game opens in a new page and explains itself as you go!</p>

{{< boardgame-settings type="game" local_storage="slipperySlopesTrippyTouchesConfig" game_title="Slippery Slopes: Trippy Touches" >}}
  {{< setting-enum id="setting-maxTurns" text="How many rounds?" values="5,10,15,20,25" valaskey="true" def="10" >}}
  {{< boardgame-settings-section heading="Word Settings" >}}
    {{< setting-enum id="setting-wordComplexity" text="Word Complexity?" values="Core,Easy,Medium" valaskey="true" remark="How hard should the words be?" def="Core" >}}
    {{< setting-checkbox id="setting-includeNamesAndGeography" text="Include names?" remark="Adds geography and proper names of people, brands, ..." >}}
  {{< /boardgame-settings-section >}}
{{< /boardgame-settings >}}

{{% /section-centered %}}

{{< support >}}

{{% section-centered heading="Credits" %}}

This game is the "digital" version of [Slippery Slopes](/slippery-slopes/). If you want a physical (offline) version of this idea, with more expansions and sliders, check that out!

While finishing that project, I realized there was nothing standing in the way of creating a digital version. The core of this game has only two parts (draw random words, mark something on a slider), and both of those are easy to do on a website, on any device.

Well, you know me, if I think "it shouldn't be _too_ hard to ..." then I've basically decided to try and make it this very weekend.

For more information, I refer you to the original game (and its credits/devlog at the bottom)!

{{% /section-centered %}}