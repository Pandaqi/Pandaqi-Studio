---
type: "single"
gamepage: true
boardgame: true

title: "Creature Quellector"
headerTitle: "Creature Quellector | A game you can play while standing in line, about collecting and battling creatures."
blurb: "Choose your battles wisely and build the strongest hand of magical creatures. A queuing game, playable without table, chairs, or loads of material"


extraCSS: true

---

{{% section-centered heading="Material" anchor="material" html="true" %}}

{{< boardgame-settings type="game" local_storage="creatureQuellectorConfig" >}}
	{{< setting-hidden id="setting-gameTitle" text="Creature Quellector" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly grayscale." >}}
  {{< setting-enum id="setting-cardSize" text="Card Size?" values="small,regular,huge" valaskey="true" def="regular" >}}
  {{< setting-checkbox id="setting-multiType" text="Multitype?" remark="An expansion: some icons will become two types at once." >}}
  <h3>Elements</h3>
  {{< setting-enum id="setting-elements-red" text="Red" values="fire,electric,star,dragon" valaskey="true" def="fire" >}}
  {{< setting-enum id="setting-elements-blue" text="Blue" values="water,ice,poison,weather" valaskey="true" def="water" >}}
  {{< setting-enum id="setting-elements-green" text="Green" values="earth,grass,rock,bug" valaskey="true" def="earth" >}}
  {{< setting-enum id="setting-elements-purple" text="Purple" values="air,magic,ghost,dark" valaskey="true" def="air" >}}
{{< /boardgame-settings >}}

{{% /section-centered %}}