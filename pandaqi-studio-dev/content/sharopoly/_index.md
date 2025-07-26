---
type: "project"

title: "Sharopoly"
headerTitle: "Claim routes and connect sky castles in a fast game inspired by Ticket to Ride."
blurb: "Travel the world, claim the most valuable routes and profit from it. Connect the sky castles faster than your opponents, in a One Paper Game inspired by Ticket to Ride."


extraJSBoardInclude: true
downloadLink: "https://drive.google.com/drive/folders/1lgnWjJG1pjb-YD7vg_0rS1QHW54xFpP1"

---

## Material

The tool below can generate random playing boards! Input your settings, press the button, and download the PDF with your unique world.

{{< settings/settings-box type="board" local_storage="sharopolyConfig" game_title="Sharopoly" defaults="true"  >}}
  {{< settings/setting-enum id="setting-boardSize" text="Board Size?" values="tiny,small,regular,large,huge" valaskey="true" def="regular" remark="How many cities and routes to place." >}}
  {{< settings/setting-enum id="setting-printSize" text="Print Size?" values="1 page, 4 pages, 9 pages" keys="1x1,2x2,3x3" def="1x1" >}}
{{< /settings/settings-box >}}
