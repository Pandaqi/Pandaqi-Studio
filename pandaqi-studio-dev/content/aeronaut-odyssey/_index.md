---
type: "single"
gamepage: true
boardgame: true

title: "Aeronaut Odyssey"
headerTitle: "Aeronaut Odyssey | Claim routes and connect sky castles in a fast game inspired by Ticket to Ride."
blurb: "Travel the world, claim the most valuable routes and profit from it. Connect the sky castles faster than your opponents, in a One Paper Game inspired by Ticket to Ride."


extraCSS: true
extraJSBoard: true
extraJSBoardInclude: true
downloadLink: "https://drive.google.com/drive/folders/1lgnWjJG1pjb-YD7vg_0rS1QHW54xFpP1"

---

{{% section-centered heading="Material" anchor="material" html="true" %}}

<p>The tool below can generate random playing boards! Input your settings, press the button, and download the PDF with your unique world.</p>

{{< boardgame-settings type="board" local_storage="aeronautOdysseyConfig" >}}
	{{< setting-hidden id="setting-gameTitle" text="Aeronaut Oddysey" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the board mostly grayscale." >}}
  {{< setting-enum id="setting-boardSize" text="Board Size?" values="tiny,small,regular,large,huge" valaskey="true" def="regular" remark="How many cities and routes to place." >}}
  {{< setting-enum id="setting-splitDims" text="Print Size?" values="1 page, 4 pages, 9 pages" keys="1x1,2x2,3x3" def="1x1" >}}
  {{< setting-enum id="setting-boardClarity" text="Board Clarity?" values="chaos,okay,normal,clean,superclean" valaskey="true" def="clean" remark="More clarity means the board does more checks to prevent ugly situations. That, however, takes much longer to generate." >}}
  {{< setting-checkbox id="setting-useRealMaterial" text="Use Real Material?" remark="Creates a board that you can play using the material of the original game!" >}}
  <h3>Expansions</h3>
  {{< setting-checkbox id="setting-expansions-trajectories" text="Trajectories?" remark="Get points for completing specific routes." checked="checked" >}}
  {{< setting-checkbox id="setting-expansions-bonusBalloons" text="Bonus Balloons?" remark="Some routes have a bonus or penalty for using it." >}}
  {{< setting-checkbox id="setting-expansions-multiRoutes" text="Multi Routes?" remark="Some routes require players to collaborate to complete them." >}}
  {{< setting-checkbox id="setting-expansions-wildWinds" text="Wild Winds?" remark="Adds wildcard routes and balloons (use/get a type of choice)." >}}
{{< /boardgame-settings >}}

<p class="settings-remark"><strong>Not working?</strong> Don't worry! At the "download" button you can find loads of premade boards I already generated for you. (Also, send me an email about what isn't working.)</p>

<p class="settings-remark">If you increase the board size, it's recommended to also increase print size. Otherwise things get too small. (This is especially true if you <strong>use real material</strong>. Then the blocks obviously need to stay the same size as the plastic trains from the real game and can't shrink.)</p>

{{% /section-centered %}}