---
type: "single"
gamepage: true
boardgame: true

title: "Epic Medics"
headerTitle: "Epic Medics | A boardgame about fighting viruses"
blurb: "Oh no, a terrible pandemic is raging across the country! Will you be the heroic medics ... or will you play the virus?"

fullHeaderImg: "epicmedics_header"
headerImg: "epicmedics_bg"
headerThumb: "epicmedics_logo"

customHeight: "small"

color: "pink"

bgColor: "#FFDDBB"
bgColorLink: "#5741D4"

textColor: "#510103"
textColorLink: "#FFCCFF"

entryBannerNonTextClasses: "no-shadow"

googleFonts: "https://fonts.googleapis.com/css2?family=PT+Serif:ital,wght@0,400;0,700;1,400&display=swap"
extraCSS: true

date: 2020-03-22

categories: ["boardgame"]
tags: ["hybrid", "opg"]

downloadLink: "https://drive.google.com/open?id=1bZ0z3L63sfoK-iMKIQFG8yPzU5Efe9b-"

multiplayermode: 'cooperative'
language: EN
genre: ["strategy", "traitor"]
playtime: 90-120
playercount: [2,3,4,5,6,7]
complexity: medium
ages: everyone

---

{{% boardgame-intro heading="" img="epicmedics_header" %}}

A cooperative <a href="/boardgames#one_paper_games" style="color:#540003;">One Paper Game</a> for 2&ndash;7 players about fighting an uncontrollable pandemic</p>

{{% /boardgame-intro %}}

<section>
	<p class="bigQuestion">Who will you be?</p>
	<div class="bigQuestionButtons">
		<div>
			<a href="#team-medic" class="btn">Team Medic</a> 
		</div>
		<div>
			<a href="#team-virus" class="btn">The Virus</a>
		</div>
	</div>
</section>

<div class="board-image">
	{{< figure url="epicmedics_board" alt="Example of Game Board (Map: Netherlands)" >}}
</div>

<div class="float-left">
	{{< figure url="epicmedics_med" alt="Cartoon Medics" >}}
</div>

<a name="team-medic"></a>
{{% section-centered heading="Team Medics" class="background-alternate" %}}

Your job is to discover the vaccine and keep the virus from spreading too much.

On your turn, take one of these actions:
- **Move:** move your character to a new city
- **Quarantine:** close the city you're currently in (disallowing anyone from entering or leaving)
- **Research:** you may ask the virus a question (such as "is this city infected?") or take a step towards a vaccine ... but for a price
- **Cure:** cure all sick people in your city (if the vaccine has been discovered)

You may do as many actions as you wish. But you must pay for each of them by _moving someone across the board_. Which might just help the virus spread a little faster ...

You have one big **advantage**: you can cooperate with all the other medic players, each of which has a unique ability (and gets a turn every round).

But there's a huge **disadvantage**: you can only move healthy people. Even worse: the virus can move unseen, while you have to take and discuss your actions out in the open!

{{% /section-centered %}}

<div class="float-right">
	{{< figure url="epicmedics_virus" alt="Cartoon Virus" >}}
</div>

<a name="team-virus"></a>

{{% section-centered heading="Team Virus" %}}

Your job is to infect as many cities as possible. (Or overwhelm the medics and prevent them from creating a vaccine.)

Take one of these actions:
- **Move:** move a sick person to a new city
- **Quarantine:** sneakily evade quarantine or add it ... but for a price
- **Outbreak:** pick a healthy city that has sick people in it; you may infect _everyone_ in the city at once!

You use a **secret part** of the board to infect cities, which means medics will have a tough time figuring out the mysterious ways of a virus ... 

{{% /section-centered %}}

{{% section-centered heading="Random Events" class="background-alternate" anchor="game" html="true" %}}


<p>This is an expansion to the base game. It introduces a random event at the start of each round, to shake things up and add extra challenge.</p>

<p>At the start of a game, go to this website and click the button below. It opens an interface in a new tab. Whenever you start a new round (in the real game), click the button again to get a new event.</p>

{{< boardgame-settings type="game" local_storage="epicMedicsConfig" >}}
	{{< setting-hidden id="setting-gameTitle" text="Epic Medics" >}}
	{{< setting-playercount min="2" max="7" def="4" >}}
{{< /boardgame-settings >}}

{{% /section-centered %}}