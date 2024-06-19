---
type: "gamepage"
boardgame: true

title: "Cookie Smasher"
headerTitle: "Smash the poisoned food faster than anyone else to prevent the king's assassination!"
blurb: "A fast party game about quick thinking and deduction, finding the poisoned food, then smashing it before anyone else."
blurbShort: "Smash the poisoned food faster than anyone else to prevent the king's assassination!"

blurbProject: "The king dines at a mighty feast, but one ingredient is secretly poisoned. Smash it before anyone else to save the king!"
weightProject: 20

downloadLink: "https://drive.google.com/drive/folders/1Vb-cB7KrYaxakv2X2oSmQJdSNg-9T5T_"


color: "white"


date: 2024-07-26

difficulty: "simple"
genres: ["action", "party"]
categories: ["boardgame", "card-game"]
tags: ["simultaneous-turns", "fast-paced", "numbers"]
themes: ["colorful", "mosaic", "medieval"]

multiplayermode: "competitive"
language: EN
playtime: 20
playercount: [2,3,4,5,6,7]
ages: everyone
devlog: "/blog/boardgames/swiftsmash-saga/cookie-smasher/"

---

{{% boardgame-intro /%}}

{{% boardgame-instructions /%}}

{{% boardgame-settings-container type="material" %}}

{{< boardgame-settings type="game" local_storage="cookieSmasherConfig" btn_label="Generate Material" game_title="Cookie Smasher" defaults="true" >}}
  {{< setting-enum id="setting-cardSet" text="Card Set?" values="starter,beginner,amateur,advanced,expert,random" valaskey="true" def="starter" >}}
  {{< setting-enum id="setting-textPlacement" text="Text Placement?" values="bottom,top" valaskey="true" def="bottom" remark="Text is always mirrored, this just determines which side is the regular one (top/bottom)." >}}
{{< /boardgame-settings >}}

{{% /boardgame-settings-container %}}

{{% section-centered heading="Credits" anchor="credits" %}}

The fonts used are **Palette Mosaic** and **Pettingill CF**. The first is available on Google Fonts, the second is from Chuck's Fonts. Both are free for commercial use.

The website and rules use a slightly different font (**Old Standard**). It is more "regular" and readable, especially on longer paragraphs.

The art was partially generated using AI (specifically DALL-E 3). Everything else (idea, code, design, parts of illustrations) is mine.

Fun facts:

* I initially included Tomato and Potato in the list of fruits and vegetables. Those, however, only came to medieval Europe a few centuries later, when they sailed the seas and colonized America.
* The medieval diet was much less diverse than that of today, which is to be expected. It did provide a challenge, though, when creating this game. I had to ... bend the timeline a bit to get enough unique (and recognizable) food. 

Below is a list of "wrong" foods.
* Rice wasn't available in Europe during the middle ages.
* Though they were able to make bread and grain-based products, some crucial ingredients for _cookies_ (as we know them today) were missing.
* Coffee is a bit dodgy, but it's generally assumed this arrived in Europa around the very _end_ of the middle ages. 
* They probably had broccoli long ago, but evidence is scarce.

_Then why is the game called Cookie Smasher?_ I am also the author of the _Wildebyte_ books, in which the main character gets stuck in the world of (video) games. One of the earliest recurring characters I invented was "Cookie Clicker".

As I wrote a scene with them, my brain thought: "couldn't I do something similar as a _board game_?" I instantly got flashbacks to playing _Halli Galli_ as a kid, and so this game was born.

Before I knew it, the idea of cookies was entrenched in the rules and illustrations. Getting rid of it felt boring and hurt my soul. The name also stayed because it's a good description of the game: you smash the right card to win, and Cookies are the right card very often. (As they are automatically "poisoned" when nothing else is.)

(Unless you play the later, more advanced card sets. Here's a quick strategy tip for those reading this: _eggs_ is the most probable card to be poisoned, while _pear_ and _cinnamon_ are the least probable. I asked the computer to simulate a million games, that's how I know for sure.)

{{% /section-centered %}}