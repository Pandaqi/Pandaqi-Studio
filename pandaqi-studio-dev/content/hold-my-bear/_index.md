---
type: "single"
gamepage: true
boardgame: true

title: "Hold my Bear"
headerTitle: "Hold my Bear | Play with more skill, or play a different sport altogether, but beware treacherous bears."
blurb: "Beat your opponents at the Unbearable Games, either by being more skillful ... or changing the sport being played altogether. A fast and loose card game for any situation."

extraCSS: true
downloadLink: "https://drive.google.com/drive/folders/1JD-LWnPoX3yXfQM8jXdlh4vsZvdMOzQQ"

---

{{% section-centered heading="Material" anchor="material" html="true" %}}

{{< boardgame-settings type="game" local_storage="holdMyBearConfig" >}}
	{{< setting-hidden id="setting-gameTitle" text="Hold my Bear" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly grayscale." >}}
  {{< setting-enum id="setting-cardSize" text="Card Size?" values="small,regular,huge" valaskey="true" def="regular" >}}
  <h3>Animals</h3>
  {{< setting-checkbox-multiple id="setting-animalsBase" values="bear,ferret,tiger,chicken,dog,cat,hamster,vole" valuesChecked="bear,ferret,tiger,hamster,vole" >}}
  <h3>Expansion Animals</h3>
  {{< setting-checkbox-multiple id="setting-animalsExpansion" values="turtle,beaver,raccoon,giraffe,ape,bat,salamander,fish,butterfly,kangaroo,badger,wolf,scorpion,aardvark" >}}
{{< /boardgame-settings >}}

<p class="settings-remark"><strong>Not working?</strong> Don't worry! You can also find premade PDFs at the "Download" button.</p>

<p class="settings-remark">For most player counts, the default values (1 bear + 4 animals) are fine. With more players, you can add the other animals. If you're up for a bigger challenge, you can slowly start adding expansion animals (one at a time).</p>

{{% /section-centered %}}

{{% section-centered %}}

@TODO

{{% /section-centered %}}

