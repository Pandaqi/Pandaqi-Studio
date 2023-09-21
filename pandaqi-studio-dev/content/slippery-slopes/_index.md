---
type: "single"
gamepage: true
boardgame: true

title: "Slippery Slopes"
headerTitle: "Slippery Slopes | A party game about communicating words by grading them on funky scales."
blurb: "A party game about communicating words by grading them on funky scales. Simple words suddenly become impossible when you can only indicate where they fall on scales such as hot-cold and heavy-light."

extraCSS: true
extraJSGame: true

---

{{% section-centered heading="Material" anchor="material" html="true" %}}

{{< boardgame-settings type="game" local_storage="slipperySlopesConfig" >}}
	{{< setting-hidden id="setting-gameTitle" text="Slippery Slopes" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly grayscale." >}}
  {{< setting-enum id="setting-cardSize" text="Card Size?" values="small,regular,huge" valaskey="true" def="regular" >}}
  {{< setting-checkbox id="setting-includeActions" text="Include Actions?" remark="Highly recommended to make guessing easier." checked="checked" >}}
  {{< setting-checkbox id="setting-crasheryCliffs" text="Crashery Cliffs?" remark="An expansion: slight rule changes and more types of sliders and actions." >}}
{{< /boardgame-settings >}}

{{% /section-centered %}}

CREDITS = Frauces font (super soft variation) for body, Super Funtime for headers. A sort of spiritual successor to my That's Amorphe games, only delayed because I was too busy to make it back then (and ran into some problems I didn't know how to solve back then).