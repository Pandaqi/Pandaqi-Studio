---
draft: true 


title: "Lijpe Lessen"
headerTitle: "Lijpe Lessen &mdash; improviseer jezelf door de middelbare school"
blurb: "??"



buttonColor: "#7CFF86"

googleFonts: "https://fonts.googleapis.com/css2?family=Grandstander:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap"

date: 2021-04-29

categories: ["game"]
tags: []

meta:
  - name: leeftijd
    val: alle
  - name: complexiteit
    val: laag
  - name: speeltijd
    val: "ligt eraan"
---

Een spel voor 3&ndash;10 spelers waarbij docenten ter plekke aan de hand van willekeurige woorden een les moeten improviseren en de scholieren proberen met hun eigen geïmproviseerde verhaal de toets te halen.

## Hoe Werkt Het?
Lalavalvla

## Speel het Spel!

<p>Kies de gewenste instellingen hieronder en klik "Start spel!"</p>
<p>Je hoeft het spel maar op één apparaat (computer, tablet, smartphone) op te starten.</p>
<p><em>Opmerking:</em> het spel opent op een nieuwe pagina. Op sommige apparaten denkt hij daarom dat dit een pop-up is en blokkeert deze. Dat is het niet, ik zou nooit pop-ups laten zien.</p>

	{{< settings/settings-box type="game" local_storage="lijpeLessenConfig" >}}

		{{< settings/setting-hidden id="setting-gameTitle" text="Lijpe Lessen" >}}
		{{< settings/setting-playercount min="3" max="10" def="3" >}}
		{{< settings/setting-enum id="setting-numRounds" text="Hoeveel dagen?" values="2,3,4,5,6,7" valaskey="true" >}}

		<h3>Uitbreidingen</h3>
		{{< settings/setting-checkbox id="setting-expansions-locations" text="Locaties?" >}}
		{{< settings/setting-checkbox id="setting-expansions-gym" text="Lichamelijke Opvoeding?" >}}
		{{< settings/setting-checkbox id="setting-expansions-parents" text="Boze ouders?" >}}

	{{< /settings/settings-box >}}
