---
type: "single"
gamepage: true
boardgame: true

title: "Arquetect"
headerTitle: "Arquetect | A fast and light game about designing your ideal city, despite opponents starting fires."
blurb: "A fast game about designing the best scoring city, despite opponents starting fires and disease outbreaks. A waitless game using cards in your hand and nothing else."

extraCSS: true
downloadLink: "https://drive.google.com/drive/folders/1ydtMKAUdtozQFcBwwR8VoP9TrmmNv_0F"

---

{{% section-centered heading="Material" anchor="material" html="true" %}}

{{< boardgame-settings type="game" local_storage="arquetectConfig" >}}
	{{< setting-hidden id="setting-gameTitle" text="Arquetect" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly grayscale." >}}
  {{< setting-enum id="setting-cardSize" text="Card Size?" values="small,regular,huge" valaskey="true" def="regular" >}}
{{< /boardgame-settings >}}

{{% /section-centered %}}

