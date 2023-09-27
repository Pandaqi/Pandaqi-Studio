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
  {{< setting-enum id="setting-printSize" text="Print Size?" values="1 page, 4 pages, 9 pages" keys="1x1,2x2,3x3" def="1x1" >}}
  <h3>Expansions</h3>
  {{< setting-checkbox id="setting-trajectories" text="Trajectories?" remark="Get points for completing specific routes." >}}
  {{< setting-checkbox id="setting-bonusBalloons" text="Bonus Balloons?" remark="Some routes have a bonus or penalty for using it." >}}
  {{< setting-checkbox id="setting-multiRoutes" text="Multi Routes?" remark="Some routes require players to collaborate to complete them." >}}
{{< /boardgame-settings >}}

{{% /section-centered %}}