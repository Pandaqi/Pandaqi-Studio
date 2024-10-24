---
type: "gamepage"
boardgame: true

title: "Feed the Beast"
headerTitle: "Keep the beast satisfied with your food offerings, but be the first to get rid of the entire feast."
blurb: "Keep the beast satisfied with your strategic offerings of apples, pie or bread. Be the first to get rid of your entire food storage."
blurbShort: "Oh, the dragon wants candy now? It will only release the princess for a slice of pie? Time to prepare the right dinner that wins me the game!"

downloadLink: "https://drive.google.com/drive/folders/1iuOlI1iYqptXn3HZQYIu0x7qy_jmb2aZ"

color: "black"

date: 2025-08-26

difficulty: "kids-can-play"
categories: ["boardgame", "standard"]
genre: ["family", "thematic"]
tags: ["variable-setup", "move-through-all", "map-selection"]
themes: ["monsters", "mythology", "fantasy"]

multiplayermode: "competitive"
language: EN
playtime: 30
playercount: [2,3,4,5,6]
ages: everyone
devlog: "/blog/boardgames/feed-the-beast/"

---

{{% boardgame-intro /%}}

{{% boardgame-instructions /%}}

{{% boardgame-settings-container type="material" %}}

{{< boardgame-settings type="game" local_storage="feedTheBeastConfig" btn_label="Generate Material" game_title="Feed the Beast" defaults="true" >}}
  {{< setting-checkbox id="setting-allowMultiFoodRecipes" text="Add multi food menus?" checked="checked" remark="Makes the game slightly harder but also faster and more strategic (usually)." >}}
  {{< boardgame-settings-section heading="Sets" >}}
    {{< setting-checkbox id="setting-sets-foodTokens" text="Food Tokens?" checked="checked" >}}
    {{< setting-checkbox id="setting-sets-recipeCards" text="Menu Cards?" checked="checked" >}}
    {{< setting-checkbox id="setting-sets-baseBeasts" text="Beasts (Base)?" checked="checked" >}}
    {{< setting-checkbox id="setting-sets-advancedBeasts" text="Beasts (Advanced)?" >}}
    {{< setting-checkbox id="setting-sets-saveThePrincess" text="Save the Princess?" >}}
  {{< /boardgame-settings-section >}}
{{< /boardgame-settings >}}

{{% /boardgame-settings-container %}}

{{% section-centered heading="Credits" anchor="credits" %}}

The fonts used are **Getronde** (headings, rough and grungy, but not so rough it's unreadable) and **IBM Plex Serif** (body, longer paragraphs, highly readable). Generative AI was used for the big monster illustrations and food tokens, everything else is mine.

Besides making games, I am a writer, most notably of the _Wildebyte Arcades_: a series of stories about somebody stuck _inside_ video games. As I was planning many (many) books ahead, I wanted to write down some general plot idea for a Pokémon-parody story. When I woke up the next day, my brain was like "what if there's this HUGE creature blocking an important path, and they have to satisfy it/lure it away/whatever by giving it the gifts it wants?"

That sounded like a game! There's a monster with food preferences, players get rewarded for giving the right thing (or punished for giving the wrong thing), and the first player to get rid of all their tokens wins.

Then I made that game, and it became the _Feed the Beast_ you see now, with relatively minor changes. It's just a very simple but strong core mechanic, easy to dress up and make more interesting by giving every monster _unique powers and preferences_. (Coming up with 20 unique beasts to play was frankly most of the work.)

The second part of that original idea---the fact that the monster might be guarding something, like the typical "princess locked in a tower"---was eventually moved to an expansion to keep the base game simple.

{{% /section-centered %}}