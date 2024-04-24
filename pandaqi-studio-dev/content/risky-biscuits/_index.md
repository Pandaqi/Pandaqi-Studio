---
type: "single"
gamepage: true
boardgame: true

title: "Risky Biscuits"
headerTitle: "A game of world domination, now playable with just paper and a pen."
blurb: "Infiltrate enemy territories, spy on them, use magical artefacts, and dominate the world."

extraCSS: true
extraJSBoard: true
extraJSBoardInclude: true
downloadLink: "https://drive.google.com/drive/folders/16Zhb_Ze5ijQTEWXIizQsO1SAh1xNXU9p"

---

{{% section-centered heading="Material" anchor="material" html="true" %}}

{{< boardgame-settings type="board" local_storage="riskyBiscuitsConfig" game_title="Risky Biscuits" defaults="true" >}}
  {{< setting-enum id="setting-boardSize" text="Board Size?" values="tiny,small,regular,large,huge" valaskey="true" def="regular" remark="How many cities and routes to place." >}}
  {{< setting-enum id="setting-printSize" text="Print Size?" values="1 page, 4 pages, 9 pages" keys="1x1,2x2,3x3" def="1x1" >}}
{{< /boardgame-settings >}}

{{% /section-centered %}}