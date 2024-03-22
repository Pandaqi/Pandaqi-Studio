---
type: "single"
gamepage: true
boardgame: true

title: "Librarians"
headerTitle: "Fill the book shelves in the correct order without communication."
blurb: "Silence in the library! Work together to fill bookshelves in alphabetical order, but without any communication."

extraCSS: true
downloadLink: "https://drive.google.com/drive/folders/1oXsEhIbOgYbdzvjnbK0XVSkOymGM8KxX" # already updated!

customHeight: "small"
headerDarkened: true

color: "purple"

bgColor: "#003401"
bgColorLink: "#ff1f1f"

textColor: "#f2ffef"
textColorLink: "#ffe9e9"

googleFonts: ""

date: 2023-01-01 # 2024-12-26

categories: ["boardgame"]
tags: ["creative", "guessing", "word"]

multiplayermode: "cooperative"
language: EN
genre: ["card", "party", "social"]
playtime: 30
playercount: [3,4,5,6,7]
complexity: low
ages: everyone

---

{{% boardgame-intro heading="" %}}

Silence in the library! Work together to fill bookshelves in alphabetical order, but without any communication.

{{% /boardgame-intro %}}

{{% section-centered heading="What do I need?" %}}

Three simple steps.
* Read the short [playful rules](rules).
* Download the base game PDF. (Download > Files > Base Pack.)
* Print, cut, play!

The base game is simple enough to play with kids who are learning the alphabet. Adding the extra levels turns this into a challenging puzzle for the whole group.

**Want more?** You can also [generate your own material](#material) right on this website!

{{% /section-centered %}}

{{% section-centered heading="Material" anchor="material" html="true" %}}

<p>Pick your desired settings and click the button! When in doubt, just use the defaults for your first games.</p>

{{< boardgame-settings type="game" local_storage="librariansConfig" btn_label="Generate Material" >}}
	{{< setting-hidden id="setting-gameTitle" text="Librarians" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly grayscale." >}}
  {{< setting-enum id="setting-itemSize" text="Card Size?" values="small,regular,large" valaskey="true" def="regular" >}}
  <h3>Packs</h3>
  {{< setting-enum id="setting-packs-red" text="Red?" values="horror,detective,true_crime,tragedy" keys="Horror,Detective,True Crime,Tragedy" >}}
  {{< setting-enum id="setting-packs-green" text="Green?" values="romance,comedy,adventure,self_help" keys="Romance,Comedy,Adventure,Self Help" >}}
  {{< setting-enum id="setting-packs-blue" text="Blue?" values="thriller,action,travel,mythology" keys="Thriller,Action,Travel,Mythology" >}}
  {{< setting-enum id="setting-packs-purple" text="Purple?" values="fantasy,scifi,poetry,graphic_novel" keys="Fantasy,Science-Fiction,Poetry,Graphic Novel" >}}
  {{< setting-enum id="setting-packs-yellow" text="Yellow?" values="biography,science,business,cooking" keys="Biography,Science,Business,Cooking" >}}
  {{< setting-enum id="setting-packs-black" text="Black?" values="mystery,crime,drama,picture_book" keys="Mystery,Crime,Drama,Picture Book" >}}
  {{< setting-checkbox id="setting-packs-actions" text="Thrills Expansion?" >}}
{{< /boardgame-settings >}}

<p class="settings-remark"><strong>Not working? Or unsure what to do?</strong> The "Download" button above has PDFs I already made for you! Pick any one of those.</p>

<p class="settings-remark">As stated in the rulebook, you should play with each color included once. But within each color you have 4 options that you can swap out as you like, if you've printed the material. When unsure, just pick the base set from the "Download" button.</p>

{{% /section-centered %}}

{{% section-centered heading="Credits" anchor="credits" %}}

@TODO

For more information, as always, read my [detailed developer diary on Pandaqi Blog](/blog/boardgames/librarians/).

{{% /section-centered %}}