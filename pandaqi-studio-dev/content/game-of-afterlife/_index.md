---
type: "single"
gamepage: true
boardgame: true

title: "Game of Afterlife"
headerTitle: "Make daring, brave or unique decisions as you travel through life---and maybe even beyond that."
blurb: "Make daring, brave or unique decisions as you travel through life---and maybe even beyond that. A free One Paper Game inspired by games like Candyland and Game of Life."

extraCSS: true
extraJSBoard: true
extraJSBoardInclude: true
downloadLink: "https://drive.google.com/drive/folders/1VZtVpBq27LacmVpvDLphLO5SajwAQGaw"

---

{{% section-centered heading="Material" anchor="material" html="true" %}}

{{< boardgame-settings type="board" local_storage="gameOfAfterlifeConfig" >}}
	{{< setting-hidden id="setting-gameTitle" text="Game of Afterlife" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the board mostly grayscale." >}}
  {{< setting-enum id="setting-boardSize" text="Board Size?" values="tiny,small,regular,large,huge" valaskey="true" def="regular" remark="How long the path should be." >}}
  {{< setting-enum id="setting-printSize" text="Print Size?" values="1 page, 4 pages, 9 pages" keys="1x1,2x2,3x3" def="1x1" >}}
{{< /boardgame-settings >}}

{{% /section-centered %}}