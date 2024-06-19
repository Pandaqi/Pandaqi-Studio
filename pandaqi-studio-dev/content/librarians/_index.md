---
type: "gamepage"
gamepage: true
boardgame: true

title: "Librarians"
headerTitle: "Fill the book shelves in the correct order without communication."
blurb: "Silence in the library! Work together to fill bookshelves in alphabetical order, but without any communication."

downloadLink: "https://drive.google.com/drive/folders/1oXsEhIbOgYbdzvjnbK0XVSkOymGM8KxX"

color: "purple"

date: 2025-01-12

categories: ["boardgame"]
tags: ["creative", "guessing", "word"]

multiplayermode: "cooperative"
language: EN
genre: ["card", "party", "social"]
playtime: 30
playercount: [3,4,5,6,7]
complexity: low
ages: everyone
devlog: "/blog/boardgames/librarians/"

---

{{% boardgame-intro /%}}

{{% boardgame-instructions %}}
The base game is simple enough to play with kids who are learning the alphabet. Adding the extra levels turns this into a challenging puzzle for the whole group.
{{% /boardgame-instructions %}}

{{% boardgame-settings-container type="material" %}}

{{< boardgame-settings type="game" local_storage="librariansConfig" btn_label="Generate Material" game_title="Librarians" defaults="true">}}
  {{< boardgame-settings-section heading="Packs" >}}
    {{< setting-checkbox id="setting-packs-shelves" text="Book Shelf Cards?" checked="checked" >}}
    {{< setting-enum id="setting-packs-red" text="Red?" values="horror,detective,true_crime,tragedy" keys="Horror,Detective,True Crime,Tragedy" >}}
    {{< setting-enum id="setting-packs-green" text="Green?" values="romance,comedy,adventure,self_help" keys="Romance,Comedy,Adventure,Self Help" >}}
    {{< setting-enum id="setting-packs-blue" text="Blue?" values="thriller,action,travel,mythology" keys="Thriller,Action,Travel,Mythology" >}}
    {{< setting-enum id="setting-packs-purple" text="Purple?" values="fantasy,scifi,poetry,graphic_novel" keys="Fantasy,Science-Fiction,Poetry,Graphic Novel" >}}
    {{< setting-enum id="setting-packs-yellow" text="Yellow?" values="biography,science,business,cooking" keys="Biography,Science,Business,Cooking" >}}
    {{< setting-enum id="setting-packs-black" text="Black?" values="mystery,crime,drama,picture_book" keys="Mystery,Crime,Drama,Picture Book" >}}
    {{< setting-checkbox id="setting-packs-actions" text="Thrills Expansion?" >}}
  {{< /boardgame-settings-section >}}
{{< /boardgame-settings >}}

{{% /boardgame-settings-container %}}

{{% section-centered heading="Credits" anchor="credits" %}}

@TODO

{{% /section-centered %}}