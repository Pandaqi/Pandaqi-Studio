---
type: "gamepage"
gamepage: true
boardgame: true

title: "Wildebyte Cover Generator"
headerTitle: "Automatic generator of Wildebyte covers, setting correct size and texts"


---

{{% section-centered heading="Material" anchor="material" html="true" %}}

{{< boardgame-settings type="game" local_storage="devTestConfig" >}}
	{{< setting-hidden id="setting-gameTitle" text="Dev Test" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the board mostly grayscale." >}}
{{< /boardgame-settings >}}

{{% /section-centered %}}