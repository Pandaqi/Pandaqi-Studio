---
type: "project"
date: 2023-01-01 # 2024-05-25

title: "Aeronaut Odyssey"
blurb: "Travel the world, claim the most valuable routes and profit from it. Connect the sky castles faster than your opponents, in a One Paper Game inspired by Ticket to Ride."

downloadLink: "https://drive.google.com/drive/folders/11yggBK2i8MlMg6sxD-oE4xBQzpgC4AUr"

categories: ["boardgame"]
tags: ["real_inspired"]

multiplayermode: "competitive"
language: EN
genre: ["opg", "strategy", "map"]
playtime: 45
playercount: [2,3,4,5,6]
complexity: medium
ages: everyone

---

## Material

The tool below can generate random playing boards! Input your settings, press the button, and download the PDF with your unique world. (This can take up to 30 seconds on huge boards.)

{{< boardgame-settings type="board" local_storage="aeronautOdysseyConfig" game_title="Aeronaut Odyssey" defaults="true" >}}
  {{< setting-enum id="setting-boardSize" text="Board Size?" values="tiny,small,regular,large,huge" valaskey="true" def="regular" remark="How many cities and routes to place." >}}
  {{< setting-enum id="setting-splitDims" text="Print Size?" values="1 page, 4 pages, 9 pages" keys="1x1,2x2,3x3" def="1x1" >}}
  {{< setting-enum id="setting-boardClarity" text="Board Clarity?" values="chaos,okay,normal,clean,superclean" valaskey="true" def="clean" remark="More clarity means the board does more checks to prevent ugly situations. That, however, takes much longer to generate." >}}
  {{< setting-checkbox id="setting-useRealMaterial" text="Use Real Material?" remark="Creates a board playable using a Ticket to Ride game!" >}}

  {{< boardgame-settings-section heading="Expansions" >}}
    {{< setting-checkbox id="setting-expansions-trajectories" text="Trajectories?" remark="Get points for completing specific routes." checked="checked" >}}
    {{< setting-checkbox id="setting-expansions-wildWinds" text="Wild Winds?" remark="Adds wildcard routes and balloons (use/get a type of choice)." >}}
    {{< setting-checkbox id="setting-expansions-multiRoutes" text="Multi Routes?" remark="Some routes require players to collaborate to complete them." >}}
    {{< setting-checkbox id="setting-expansions-bonusBalloons" text="Bonus Balloons?" remark="Some routes have a bonus or penalty for using it." >}}
  {{< /boardgame-settings-section >}}
{{< /boardgame-settings >}}

<p class="settings-remark"><strong>Not working?</strong> Don't worry! At the "download" button you can find loads of premade boards I already generated for you. (Also, send me an email about what isn't working.)</p>

<p class="settings-remark">To approximate an average Ticket to Ride board, choose the "large" board size, and "use real material". Also make sure your printer doesn't add very large margins, as that might make the spaces too small.</p>

<p class="settings-remark">If you increase the board size, it's recommended to also increase print size. Otherwise things get too small. (If you <strong>use real material</strong>, it does so automatically. Then the blocks obviously need to stay the same size as the plastic trains from the real game and can't shrink.)</p>