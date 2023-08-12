function Task(name, story, desc, category, money, questions, treasurer, leader, type, params = {}) {
	this.name = name;

	// basic stuff: story, task description, categories, starting money
	this.story = story;
	this.desc = desc;
	this.category = category;
	this.money = money;

	// the list of question objects (question + answer) for this task
	this.questions = questions;

	// whether the treasurer or leader has an especially important role in this task
	this.treasurer = treasurer;
	this.leader = leader;

	// the type of task
	// simple = just play X cards to get reward
	// money = more difficult tasks that will only yield money
	// help = a task that can yield players a joker/vrijstelling/whatever
	// misc = a task that does something else entirely (for example, you may ask a question of the mole)
	this.type = type;

	// optional parameters
	// => minPlayers, maxPlayers, forbiddenAtStart, forbiddenAtEnd, firstGame, timePerPlayer, totalTime ...
	this.params = params;
}

function Q(question, answers) {
	this.question = question;
	this.answers = answers;
	this.connectedTask = null;
}

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }

    return a;
}

const ROLVOORDELEN = [
	'De leider mag direct één extra kaart trekken',
	'De leider mag gratis een inspanningskaart trekken',
	'De PM mag één extra kaart trekken',
	'De PM mag één iemand dwingen <em>of</em> verbieden om geld in te zetten voor deze opdracht',

	'De leider mag één iemand dwingen om minstens twee kaarten te spelen deze opdracht',
	'De leider mag van één speler de kaarten bekijken (voordat de opdracht begint)',
	'De PM mag een briefje stelen uit andermans persoonlijke pot',
	'De PM krijgt direct twee briefjes van 10 in diens persoonlijke pot erbij',

	'De PM mag vier briefjes uit de pot inruilen voor een vrijstelling',
	'De PM mag twee briefjes uit de pot inruilen voor een joker',
	'De leider mag, op elk moment tijdens deze opdracht, eenmaal besluiten om twee spelers van kaarten te laten wisselen',
	'De leider trekt twee extra kaarten aan het begin van diens beurt',

	'De leider mag iemand anders dwingen om diens hele hand weg te doen en evenveel kaarten terug te trekken (van de gedekte stapel)',
	'De leider mag de bovenste drie kaarten van de trekstapel bekijken',
	'De PM mag één iemand, tijdens de opdracht, dwingen om een extra geldbriefje in te zetten',
	'De PM mag geld uit de pot inzetten (maximaal vijf briefjes): als de huidige opdracht slaagt, wordt dit geld verdubbeld, anders verdwijnt het',

	'De leider noemt een kaartsoort (behalve kameleon of leider): alle spelers die deze kaarten vasthebben moeten die direct weggooien',
	'De leider noemt een kaartsoort: deze soort mag niet worden gespeeld tijdens de opdracht',
	'De PM mag één ingezet geldbriefje verdubbelen (met geld uit de bank) van de persoon links of rechts naast zich',
	'De PM mag geld uit de pot inzetten: voor elk ingezet briefje mag diegene een extra kaart trekken',

	'De leider mag twee kaarten trekken van de speler met de meeste kaarten, en geeft één kaart aan de speler met de minste kaarten',
	'De leider mag tijdens de opdracht besluiten om géén beurt te doen óf diens beurt twee maal te doen',
	'De PM mag geld uit de pot inwisselen voor (maximaal 3) jokers: voor elke honderd euro een joker',
	'De PM mag kaarten weggooien voor extra inzet: voor elke weggegooide kaart komt een extra briefje van 20 bij de inzet voor deze opdracht',

	// @IMPROV: a few more entries? (Also different types, because being the "trol" is also a sort of "role"?)
];

const ADDERTJES = [
	'Je mag helemaal niks tegen elkaar zeggen of overleggen.',
	'Iedereen speelt zijn kaarten <em>gedekt</em>',
	'Iedereen moet deze opdracht individueel doen (alleen toepasselijk op groepsopdrachten). Bondjes tellen ook even niet.',
	'Iedereen moet deze opdracht in teams van 2 doen. (Elk tweetal telt als één speler voor de regels van deze opdracht.)',
	'Iedereen moet deze opdracht in teams van 3 doen. (Elk drietal telt als één speler voor de regels van deze opdracht.)',
	'Iedereen moet minstens 1 geldbriefje inleggen.',
	'Iedereen moet minstens 2 geldbriefjes inleggen.',
	'Iedereen is moe en moet een (extra) inspanningskaart spelen om de opdracht te laten slagen.',
	'Het geld voor dit spel moet <em>uit de pot</em> worden ingezet (ook de startinzet). Als de opdracht slaagt, wordt dit bedrag verdubbeld, anders ben je het kwijt.',
	'Als er jokers kunnen worden verdiend, worden deze verdubbeld.',
	'Iedereen moet de helft van zijn handkaarten (afgerond naar beneden) tijdelijk opzij leggen. Je mag deze niet gebruiken voor deze opdracht.',
	'In plaats van kaarten spelen voor deze opdracht, mag je alle kaarten in de hand van een andere speler bekijken.',
	'Kies één speler: deze krijgt een extra negatieve eigenschap. (Als je zonder eigenschappen speelt, mag deze speler simpelweg niet meedoen met deze opdracht.)',
	'Kies één speler: deze krijgt een extra positieve eigenschap. (Als je zonder eigenschappen speelt, mag deze speler gratis twee kaarten trekken.)',
	'Kies één speler: deze legt al zijn kaarten af en trekt evenveel nieuwe.',
	'De startinzet van deze opdracht wordt verdubbeld.',
	'De startinzet van deze opdracht wordt gehalveerd (naar beneden afgerond).',
	'De startinzet van deze opdracht wordt 0.',
	'Iedereen <em>moet</em> (minstens) twee kaarten spelen.',
	'Iedereen <em>moet</em> precies één kaart spelen.',
	'Alleen afvallers mogen aan deze opdracht deelnemen. (Als er geen afvallers zijn, mag alleen de leider deze opdracht doen.)',
	'De opbrengst van deze opdracht gaat niet in de pot, maar in de persoonlijke geldstapels van de spelers. (De leider verdeelt.)',
	'Iedereen moet één kaart naar links doorgeven, voordat de opdracht begint.',
	'Iedereen moet één kaart naar rechts doorgeven, voordat de opdracht begint.',
	'De speler die aan het einde van deze opdracht de meeste kaarten overheeft, krijgt een joker.',
	'De speler die aan het einde van deze opdracht de meeste kaarten overheeft, mag vier briefjes van 50 toevoegen aan diens persoonlijke pot.',
	'Kies een tijdelijke leider en PM voor deze opdracht. (Als de opdracht is afgelopen, gaan deze rollen weer terug naar de vorige eigenaars.)',
	'De speler die aan het einde van deze opdracht het minste geld in diens persoonlijke pot heeft, mag gratis drie kaarten trekken. (Bij gelijkspel gebeurt er niks.)',
	'De PM krijgt vier geldbriefjes van 10 in diens persoonlijke stapel erbij.',
	'Iedereen moet één kaart uit de hand direct weggooien.',
	'Iedereen moet twee kaarten uit de hand direct weggooien.',
	'De persoon met de minste kaarten ruilt diens hand met de persoon met de meeste kaarten.',
	'Iedereen die een wantrouwkaart heeft moet deze nu meteen spelen (voordat de opdracht begint) en uitvoeren.',
	'De speler met de meeste samenwerkingskaarten mag voor alle andere spelers beslissen hoeveel geld ze uit hun persoonlijke pot inzetten (voor deze opdracht)',
	'Iedereen moet hun getrokken kaart (aan het begin van hun beurt) aan iedereen laten zien.',
	'Ga allemaal op een andere plek zitten (alleen voor deze opdracht).',
	'Spelers mogen besluiten om deze opdracht <em>geen</em> beurt te doen. Voor iedere speler die dat doet, gaat een extra briefje van 20 (uit de bank) bij de inzet.',
	'Iedereen moet één kaart uit diens hand aan een andere speler geven, voordat de opdracht begint.',
	'Voor elke niet-standaard kaart die wordt gespeeld, gaat één briefje uit de inzet voor deze opdracht.',
	'Voor elke standaardkaart die wordt gespeeld, gaat één briefje uit de inzet voor deze opdracht.',
	'De trol hoeft zich niet aan de regels te houden bij deze opdracht. (Het is aan de trol zelf om dit onopvallend ergens voor te gebruiken.)',
	'Men gaat twee keer de tafel rond bij deze opdracht.',
	'Alle spelers zonder bondje mogen géén kaart trekken aan het begin van hun beurt. (Als je zonder bondjes speelt, mag de speler met de meeste kaarten geen extra kaart trekken.)',
	'De speler die het meeste geld inzet bij deze opdracht, mag nog een extra beurt nemen nadat alle andere spelers zijn geweest.',
	'Iedereen mag de kaarten van één andere speler bekijken, voordat de opdracht begint.',
	'Tijdens deze opdracht mag je kaarten met het getal 0 op elk moment inruilen voor de bovenste kaart van de stapel.',
	'De PM is deze opdracht beschermd: er mag geen nieuwe PM worden genomineerd.',
	'De leider is deze opdracht beschermd: er mogen geen leiderkaarten worden gespeeld.',
]

const TASKS = [
	new Task(
		"Rennen door Regenwoud", 
		"Zodadelijk rennen jullie in twee teams naar de finish aan de andere kant van dit regenwoud. De winnaar krijgt geld voor de pot ... maar de beste renner van het verliezende team krijgt een joker.",
		"<p>De leider verdeelt de groep in twee. Beide teams spelen beurtelings een renkaart, totdat één team besluit te stoppen.</p><p>De persoon die de meeste kaarten speelde in het stoppende team, krijgt een joker.</p><p>De persoon die de meeste kaarten speelde in het winnende team, krijgt al het ingezette geld in zijn persoonlijke pot.</p><p>Bij een gelijkspel krijgt niemand geld en niemand een joker.</p>",
		["Zwaar"],
		100,
		[
			new Q("Zat de trol in het winnende team?", ["Ja", "Nee"]),
			new Q("Hoeveel kaarten speelde de trol?", ["Nul", "Eén", "Twee", "Meer dan twee"]),
			new Q("Ontving de trol een joker?", ["Ja", "Nee"])
		],
		false,
		true,
		'help'
	),

	new Task(
		"Inspannen voor Jokers",
		"Jokers zijn goud waard, toch? In deze opdracht mag iedereen kiezen: geld voor de pot, of een joker voor zichzelf. Laten we eens kijken hoeveel jullie over hebben voor een klein voordeel.",
		"<p>Als de meerderheid tijdens diens beurt een inspanningskaart heeft gespeeld, gaat alle inleg naar de pot. Iedereen die géén inspanningskaart speelde, krijgt een JOKER.</p><p>Als de meerderheid géén inspanningskaart speelde, echter, verdient niemand iets.</p>",
		["Nadenken"],
		50,
		[
			new Q("Speelde de trol een inspanningskaart?", ["Ja", "Nee"]),
			new Q("Welke kleur ogen heeft de trol?", ["Blauw", "Bruin", "Anders"]),
			new Q("Zette de trol extra geld in uit diens eigen pot?", ["Ja", "Nee"])
		],
		false,
		false,
		'help',
		{
			firstGame: true,
			timePerPlayer: 15
		}
	),

	new Task(
		"Haastige Spoed",
		"Aan de andere kant van een parcours ligt een geldbedrag. Alleen als jullie gezamenlijk binnen de tijd aankomen, gaat dit geld in de pot.",
		"<p>Als men gezamenlijk # renkaarten speelt, is de opdracht geslaagd.</p>",
		['Zwaar', 'Verboden'],
		10,
		[
			new Q("Hoeveel renkaarten speelde de trol?", ["Nul", "Eén", "Twee", "Meer dan twee"]),
			new Q("Hoeveel geld legde de trol in (uit diens eigen pot)?", ["Niks", "Eén briefje", "Minstens twee briefjes"]),
			new Q("Op welke plek staat de trol qua leeftijd?", ["De jongste van de groep", "De oudste van de groep", "Noch de jongste, noch de oudste"])
		],
		false,
		false,
		'simple',
		{
			timePerPlayer: 10,
			firstGame: true
		}
	),

	new Task(
		"Pakketje Afleveren",
		"Iedereen krijgt een eigen pakketje met daarin geld. Dat geld komt alleen in de pot … als de eigenaar van het pakketje over de finish komt.",
		"<p>De PM verdeelt al het geld voor deze opdracht (in overleg) onder de spelers</p><p>Iedere speler die één renkaart speelt bereikt de finish: diens toegewezen geld komt in de pot.</p><p>Als een speler niet finisht, gaat het geld verloren.</p><p>Echter, als een speler géén geld had, maar hij finisht wel, krijgt hij een JOKER.</p>",
		['Zwaar'],
		20,
		[
			new Q("Is de trol gefinisht?", ["Ja", "Nee"]),
			new Q("Hoeveel geld nam de trol mee?", ["Niks", "1 briefje", "2 briefjes", "Meer dan 2 briefjes"]),
			new Q("Was de trol de PM of leider tijdens deze opdracht?", ["PM", "Leider", "Geen van beide"])
		],
		true,
		false,
		'help',
		{
			firstGame: true
		}
	),

	new Task(
		"Een Simpele Puzzel",
		"Vandaag is jullie opdracht zeer simpel. Een levensgrote puzzel met slechts enkele stukjes: los deze op om de gehele inleg te verdienen.",
		"<p>Als men gezamenlijk # puzzelkaarten speelt, is de opdracht geslaagd.</p>",
		['Nadenken'],
		10,
		[
			new Q('Hoeveel puzzelkaarten speelde de trol?', ['Nul', 'Eén', 'Twee', 'Meer dan twee']),
			new Q('Wanneer was de trol aan de beurt?', ['Als eerste', 'Als laatste', 'Ergens in het midden', 'De trol had geen beurt']),
			new Q('Is de trol links- of rechtshandig?', ['Linkshandig', 'Rechtshandig', 'De trol is tweehandig'])
		],
		false,
		false,
		'simple',
		{
			timePerPlayer: 10,
			firstGame: true
		}
	),

	new Task(
		"Spiegelen",
		"Jullie zijn opgedeeld in tweetallen om elkaar te spiegelen. Het probleem is alleen ... dat er een echte spiegel tussen jullie instaat. Zonder te communiceren, zonder naar elkaar te kijken, moeten jullie zoveel mogelijk hetzelfde doen.",
		"<p>De leider maakt tweetallen. (Als oneven aantal spelers, doet de leider zelf niet mee.)</p><p>Men speelt kaarten <em>gedekt</em> en gaat door totdat iedereen besluit te stoppen (in plaats van precies één keer rond de tafel te gaan).</p><p>Elk tweetal verdient sowieso 20 euro voor elke kaart die matcht met een kaart van je medespeler, maar -20 euro voor elke kaart die <em>niet</em> matcht.</p><p>Men verdient ingelegd geld slechts als alle tweetallen perfect matchen.</p>",
		['Nadenken', 'Samenwerken'],
		0,
		[
			new Q('Hoeveel geld haalde de trol op?', ['Een negatief bedrag', '0', '50', '100']),
			new Q('Hoeveel kaarten speelde de trol?', ['Geen', 'Eén', 'Twee', 'Meer dan twee']),
			new Q('Wat is het favoriete continent van de trol?', ['Europa', 'Afrika', 'Azië', 'Noord-Amerika', 'Zuid-Amerika', 'Australië'])
		],
		false,
		true,
		'money',
		{
			firstGame: true,
			timePerPlayer: 20,
		}
	),

	new Task(
		"Great Minds Match Alike",
		"Hoe goed ken jij jouw medekandidaten? Zo goed dat je, zonder hints, exact hetzelfde denkt? Of wil je voor wat geld misschien hulp inschakelen?",
		"<p>De PM maakt tweetallen. (Als oneven aantal spelers, doet de PM zelf niet mee.)</p><p>Beide spelers van elk tweetal moeten <em>gedekt</em> (zonder overleg natuurlijk) exact dezelfde kaart spelen.</p><p>Om de kans van slagen te verhogen, mogen spelers als 'hint' een andere open kaart spelen. Voor iedere kaart die je zo laat zien, echter, gaat één geldbriefje uit de inleg.</p><p>Als iedereen iets heeft neergelegd, worden alle kaarten onthuld. Als meer dan de helft matcht, is de opdracht geslaagd!</p>",
		['Nadenken', 'Samenwerken'],
		50,
		[
			new Q('Heeft de trol gematcht met diens medespeler?', ['Ja', 'Nee', 'De trol speelde niet mee']),
			new Q('Hoe vaak heeft de trol gebruik gemaakt van de mogelijkheid om een hint te laten zien?', ['Nul keer', 'Eén keer', 'Twee keer', 'Meer dan twee keer']),
			new Q('Wat is de lievelingskleur van de trol?', ['Rood', 'Groen', 'Blauw', 'Oranje', 'Geel', 'Paars', 'Wit', 'Zwart', 'Anders'])
		],
		true,
		false,
		'money',
		{
			timePerPlayer: 18,
		}
	),

	new Task(
		"Klimmen &amp; Keuzes",
		"Jullie staan onderaan een verraderlijke klimwand met een verraderlijke keuze: de allerbeste klimmer van deze groep moet in zijn eentje de top halen, of alle spelers mogen elkaar helpen om de top halen, <em>zonder</em> hulp van deze supergoede klimmer.",
		"<p>De speler met de <em>meeste</em> kaarten in de hand, mag niet meer communiceren met de rest en wordt de 'klimmer'. (Bij gelijkspel kiest de leider.)</p><p>Men moet een keuze maken: de klimmer doet in zijn eentje deze opdracht, of iedereen <em>behalve</em> de klimmer doet mee.</p><p>Als men de eerste optie kiest, wordt de inleg verdubbeld.</p><p>De opdracht luidt: speel één inspanningskaart, één renkaart, en één andere kaart (geen inspanning of ren).</p>",
		['Zwaar', 'Gevaarlijk'],
		20,
		[
			new Q("Heeft de trol een kaart gespeeld?", ["Ja, een nuttige kaart", "Ja, maar we hadden er niks aan", "Nee"]),
			new Q("Was de trol de klimmer?", ['Ja', 'Nee']),
			new Q("Wat is de ideale ontspanning voor de trol?", ["Iets kijken (film, serie, ...)", "Sporten", "Uitgaan/Feesten", "Afspreken met vrienden", "Anders"])
		],
		false,
		false,
		'money',
		{
			firstGame: true,
			totalTime: 45,
		}
	),

	new Task(
		"De Zwakste Schakel",
		"Dit is een pittige opdracht. Jullie zullen door de hele stad moeten racen om informatie te verzamelen en de code te kraken, maar de persoon die de meeste inzet toont ... tja, die kan nog wel eens de gevolgen ondervinden van uitputting.",
		"<p>Om deze opdracht te halen, hoef je slechts gezamenlijk # informatiekaarten of inspanningskaarten te spelen.</p><p>Echter, de speler die aan het einde van de opdracht de minste kaarten heeft, moet een pijnlijke keuze maken: al zijn kaarten weggooien of twee briefjes uit diens persoonlijke pot wegdoen.</p><p>(Bij gelijkspel, kiest de PM de verliezer.)</p>",
		['Nadenken', 'Verboden'],
		50,
		[
			new Q("Welke kaarten speelde de trol?", ["Informatie", "Inspanning", "Allebei", "Geen van beide"]),
			new Q("Moest de trol de pijnlijke keuze maken?", ["Ja", "Nee"]),
			new Q("Waar kan de trol het minst goed tegen?", ["Enge beesten", "Vervelend geluid", "Vieze geur", "Extreme hitte of kou", "Drukte", "Mensen die herhaaldelijk taalfouten maken", "Van die mensen die altijd een uur te laat komen"])
		],
		false,
		false,
		'money',
		{
			timePerPlayer: 24,
			firstGame: true
		}
	),

	new Task(
		"Tot Het Uiterste",
		"Soms is het goed om gemiddeld te zijn, soms ook niet. De kandidaten aan de uitersten van de groep mogen voor deze keer de rest uitdagen in een uiterste strijd om geld ... of jokers.",
		"<p>De spelers met de meeste en de minste kaarten in de hand worden de 'uitdagers'. (Bij gelijkspel, worden <em>alle</em> spelers met de meeste/minste kaarten uitdagers.)</p><p>De uitdagers leggen, <em>in het geheim</em>, een bepaalde hoeveelheid kaarten op. De andere spelers doen hetzelfde.</p><p>Als de andere spelers MEER kaarten hebben gespeeld dan de uitdagers, gaat al het geld in de pot. Als ze MINDER kaarten hebben gespeeld, of de uitdagers hebben 4 kaarten van dezelfde soort gespeeld, krijgen de uitdagers allemaal een JOKER (en het geld verdwijnt).</p>",
		['Nadenken', 'Samenwerken'],
		100,
		[
			new Q("In welk team zat de trol?", ["Uitdagers", "Het andere team"]),
			new Q("Hoeveel kaarten heeft de trol gespeeld?", ["Nul", "Eén", "Twee", "Meer dan twee"]),
			new Q("Heeft de trol een joker verdiend?", ["Ja", "Nee"])
		],
		false,
		false,
		'help',
		{
			totalTime: 60
		}
	),

	new Task(
		"Een Vrij Punt",
		"Voor jullie staat een parcours dat al jullie vaardigheden zal testen. Aan het eind hangt een vrijstelling voor de persoon die het snelste is. Hoe ben je het snelste? Door goed in te schatten hoeveel elke vaardigheid waard is ... ",
		"<p>De PM zet de kaartsoorten (rennen, puzzelen, informatie, inspanning) op volgorde van hoog naar laag: de hoogste kaart is 4 punten waard, daarna 3, 2, en 1 voor de laagste kaart. Alle andere kaarten zijn 0 punten.</p><p>Iedereen speelt de ronde zoals normaal, maar de PM mag géén extra kaart trekken aan het begin van diens beurt.</p><p>De speler die het hoogste puntenaantal op tafel weet te leggen, krijgt een vrijstelling!</p><p>Alleen als er een gelijkspel ontstaat (meerdere spelers met het hoogste puntenaantal), gaat het ingezette geld in de pot.</p>",
		['Tijdsdruk'],
		10,
		[
			new Q('Was de trol de PM?', ['Ja', 'Nee']),
			new Q('Hoeveel punten heeft de trol gescoord?', ['0', '1-2', '3-4', '5-6', '7-8', 'Meer dan 8']),
			new Q('Heeft de trol een vrijstelling verdiend?', ['Ja', 'Nee'])
		],
		true,
		false,
		'help',
	),

	new Task(
		"Rommelmarkt",
		"Welkom bij de ingang van de grootste fruitmarkt van dit land. Maar alleen vandaag is er tussen het fruit ook veel anders moois te vinden. Ieder van jullie krijgt een half uur om naar binnen te gaan en iets leuks voor jezelf uit te zoeken, maar pas op: je krijgt maar twee mogelijkheden om te kiezen.",
		"<p>Alle afvallers (spelers met minstens één rode kaart) blijven in de kamer, de rest moet tijdelijk weg. (Als er geen afvallers zijn, blijft de PM in de kamer.)</p><p>De afvallers pakken evenveel hulpmiddelen uit de voorraad (joker, vrijstelling, zwarte vrijstelling) als dat er geldbriefjes zijn ingezet. Vervolgens maken ze # stapeltjes (van alle voorwerpen + geld), leggen deze op volgorde, en verstoppen ze achter iets.</p><p>Nu mogen de andere spelers één voor één de kamer binnenkomen en een getal noemen. Zij krijgen het stapeltje te zien dat ze hebben gekozen. Ofwel ze nemen deze stapel (en krijgen de inhoud), of mogen een ander getal noemen en krijgen dan die inhoud.</p><p>(Ter verduidelijking: het kan dus zijn dat iemand met lege handen achterblijft, door bijvoorbeeld twee keer een lege stapel te kiezen.)</p>",
		['Verboden'],
		50,
		[
			new Q('Wat heeft de trol bij deze opdracht verdiend?', ['Niks', 'Geld', 'Een hulpmiddel (joker, vrijstelling, ...)', 'Geld én Hulpmiddel']),
			new Q('Hoe heeft de trol deze opdracht gespeeld?', ['Hij was afvaller', 'Hij was stapelkiezer en koos de eerste optie', 'Hij was stapelkiezer en koos de tweede optie']),
			new Q('Hoeveel extra geld heeft de trol ingezet?', ['Niks', 'Eén briefje', 'Twee briefjes', 'Meer dan twee briefjes', 'De trol was afvaller en mocht geen extra briefjes inzetten'])
		],
		false,
		false,
		'help'
	),

	new Task(
		"Puzzelen tegen de Klok",
		"Voor jullie ligt een levensgrote puzzel. Los deze op om de gehele inleg te verdienen ... maar hoe sneller, hoe beter.",
		"<p>Als men gezamenlijk # puzzelkaarten speelt, krijgt men 1/4 van de inleg (naar beneden afgerond).</p><p>Als men daarbovenop # inspanningskaarten speelt, krijgt men de gehele inleg.</p><p>Als men daarbovenop # renkaarten speelt, wordt de inleg verdubbeld (met geld uit de bank).</p>",
		['Nadenken', 'Tijdsdruk'],
		50,
		[
			new Q('Hoeveel puzzelkaarten speelde de trol?', ['Nul', 'Eén', 'Twee', 'Meer dan twee']),
			new Q('Hoeveel inspanningskaarten speelde de trol?', ['Nul', 'Eén', 'Twee', 'Meer dan twee']),
			new Q('Speelde de trol een renkaart?', ['Ja', 'Nee'])
		],
		false,
		false,
		'money',
		{
			timePerPlayer: 20,
			firstGame: true
		}
	),

	new Task(
		"Code Kraken",
		"In deze kluis ligt heel veel geld voor het grijpen. De code? Die is verdeeld onder de spelers. Alleen als je de juiste informatie uit iemand anders krijgt, kun je de code kraken.",
		"<p>De PM splitst de groep in twee. (Bij oneven aantal spelers, doet de PM niet mee.)</p><p>Alle mensen uit de eerste groep kiezen drie kaarten uit hun hand. Ze schudden deze en steken ze (gedekt) voor zich uit.</p><p>Alle mensen uit de tweede groep trekken één of twee kaarten van iemand uit de eerste groep. (Niet getrokken kaarten gaan terug in de hand.)</p><p>Als men gezamenlijk minstens 0.5*# informatiekaarten (naar beneden afgerond) weet te trekken en 1 puzzelkaart, is de opdracht geslaagd</p>",
		['Nadenken', 'Samenwerken'],
		10,
		[
			new Q('In welke groep zat de trol?', ['Kaart aanbieders', 'Kaart trekkers', 'De trol deed niet mee.']),
			new Q('Bij hoeveel onthulde informatiekaarten was de trol betrokken?', ['Nul', 'Eén', 'Twee']),
			new Q('Was de trol betrokken bij het onthullen van een puzzelkaart (als aanbieder of trekker)', ['Ja', 'Nee'])
		],
		true,
		false,
		'money',
		{
			totalTime: 75,
			firstGame: true
		}
	),

	new Task(
		"Celebrity Search",
		"Op deze overvolle markt is ergens een bekende Nederlander verstopt. Alle kandidaten krijgen hints naar deze locatie, maar mogen deze niet zomaar doorgeven. De enige manier om hem te vinden, is door de juiste informatie op de juiste manier op te vragen.",
		"<p>Voor deze opdracht nemen spelers niet hun eigen beurt, maar de beurt van de persoon links van hen.</p><p>Iedereen noemt 0-3 kaartsoorten die de ander moet spelen, maar zodra je een soort noemt die de ander niet heeft, is je beurt meteen voorbij.</p><p>Als men gezamenlijk # informatiekaarten weet te spelen, is de opdracht geslaagd.</p>",
		['Samenwerken'],
		50,
		[
			new Q('Noemde de trol een kaartsoort die diens medespeler niet had?', ['Ja', 'Nee']),
			new Q('Hoeveel kaarten speelde de trol?', ['Nul', 'Eén', 'Twee', 'Meer dan twee']),
			new Q('Speelde de trol een informatiekaart?', ['Ja', 'Nee'])
		],
		false,
		false,
		'money',
		{
			firstGame: true,
			timePerPlayer: 18
		}
	),

	new Task(
		'Een Nachtelijk Parcours',
		"Door dit oude, verlaten hotel staat een zwaar parcours naar een grote beloning. En als dat nog niet genoeg was, hebben we ook alle lampen uitgelaten. Iemand zal dit parcours succesvol moeten afleggen, slechts afgaand op de instructies van de anderen over welke voorwerpen waar staan.",
		"<p>De leider kiest een 'loper'; deze verlaat tijdelijk de kamer. De rest kiest één speler die al het ingezette geld vasthoudt. Vervolgens doet iedereen één hand onder tafel, roept de loper terug, en start de tijd.</p><p>Als de loper de juiste persoon aanwijst (diegene die onder tafel het geld vasthoudt), is de opdracht geslaagd.</p><p>De loper mag vragen om een hint. In dat geval moet iemand een informatiekaart spelen en zeggen '&lt;naam van een speler&gt; is het niet!'</p><p>Maar als de loper de juiste persoon al binnen twee beurten vindt, gaat er géén geld naar de pot, en krijgt de loper een vrijstelling.</p>",
		['Zwaar', 'Gevaarlijk'],
		20,
		[
			new Q('Was de trol de loper?', ['Ja', 'Nee']),
			new Q('Hoeveel hints heeft de trol gevraagd (als loper) of gegeven (als niet)?', ['Nul gevraagd', '1-2 gevraagd', '3+ gevraagd', 'Nul gegeven', '1-2 gegeven', '3+ gegeven']),
			new Q('Waarin is de trol afgestudeerd of op dit moment het meest geïnteresseerd?', ['Alfa (taal, geschiedenis, ...)', 'Beta (wiskunde, natuurkunde, ...)', 'Gamma (psychologie, economie, ...)'])
		],
		false,
		true,
		'help',
		{
			totalTime: 60,
		}
	),

	new Task(
		"Kennis is Macht",
		"Laten we eens testen hoe goed jullie elkaar kennen. Om deze opdracht te laten slagen, moeten jullie al mijn quizvragen goed beantwoorden. Jullie krijgen een half uur om zoveel mogelijk informatie te verzamelen over je medekandidaten.",
		"<p>Speel gezamenlijk # informatiekaarten om de opdracht te laten slagen.</p>",
		['Samenwerken', 'Tijdsdruk'],
		50,
		[
			new Q('Hoeveel informatiekaarten speelde de trol?', ['Nul', 'Eén', 'Twee', 'Meer dan twee']),
			new Q('Welke van deze dingen vindt de trol het lekkerste?', ['Chocolade', 'Snoep', 'Fruit/Groente', 'Boterhammen', 'Alles met een lekkere saus', 'Anders']),
			new Q('Wat is de lievelingsvorm van de trol?', ['Vierkant', 'Cirkel', 'Driehoek', 'Veelhoek', 'Ster', 'Halve maan', 'Donut', 'Iets met curves', 'Anders'])
		],
		false,
		false,
		'simple',
		{
			firstGame: true,
			timePerPlayer: 10,
		}
	),

	new Task(
		"Betrouwbare Bezorgers",
		"Al het geld dat jullie tot nog toe hebben verzameld ... is verspreid over de hele stad. Je kunt het alleen terugvinden door de juiste kistje te vinden en te openen, maar ... elk volgende kistje is verder en moeilijker te bereiken dan de vorige.",
		"<p>De PM voegt al het ingezette geld samen met al het geld in de pot en verdeelt dit, <em>in overleg</em>, onder de spelers. Iedere speler moet minstens één briefje krijgen (als mogelijk).</p><p>Een speler komt alleen 'over de finish' als hij een standaardkaart speelt (ren, puzzel, informatie, inspanning) die <em>niet</em> in de beurt daarvoor al is gespeeld.</p><p>Het geld van gefinishte spelers gaat terug in de pot; de rest gaat verloren.</p>",
		['Zwaar'],
		20,
		[
			new Q('Is de trol gefinisht?', ['Ja', 'Nee']),
			new Q('Hoeveel geldbriefjes had de trol bij zich?', ['Nul', 'Eén', 'Twee', 'Meer dan twee']),
			new Q('Was de trol de PM bij deze opdracht?', ['Ja', 'Nee'])
		],
		true,
		false,
		'money',
		{
			firstGame: true,
			timePerPlayer: 12,
		}
	),

	new Task(
		"One Way or Another",
		"Deze opdracht is op twee manieren te winnen: of je lost deze puzzel op, of je ontdekt de geheime locatie van een kluis. Twee simpele manieren om te slagen, zonder te communiceren, maar als je probeert om voor allebei tegelijkertijd te gaan ...",
		"<p>Om deze opdracht te laten slagen moeten minstens # puzzelkaarten óf # informatiekaarten worden gespeeld (je mag de losse kaartsoorten niet bij elkaar optellen).</p><p>Als je de opdracht haalt in een bepaalde soort (bijvoorbeeld door genoeg informatiekaarten te spelen), krijgen alle spelers die de <em>andere</em> soort hebben gespeeld (in dit geval puzzelkaarten) een straf. Ofwel ze moeten twee handkaarten weggooien, ofwel ze moeten een geldbriefje wegdoen.</p>",
		['Nadenken', 'Verboden'],
		10,
		[
			new Q('Wat voor kaart speelde de trol?', ['Informatie', 'Puzzel', 'Beide', 'Geen']),
			new Q('Moest de trol voor straf iets wegdoen?', ['Ja', 'Nee']),
			new Q('Wat voor soort persoon is de trol?', ['Meer iemand die actief is en dingen doet', 'Meer iemand die nadenkt en op de achtergrond blijft'])
		],
		false,
		false,
		'money',
		{
			firstGame: true,
			timePerPlayer: 15,
		}
	),

	new Task(
		"Probleem van de PM",
		"De PM gaat gokken. Hij moet inschatten hoeveel geld jullie halen bij de volgende opdracht. Hoe meer hij wedt, hoe groter de beloning. Maar als hij geen gelijk heeft ... gaat al dat geld uit de pot.",
		"<p>De PM voegt de pot en al het ingezette geld samen. Vervolgens zet hij, in het geheim en zonder overleg, een deel van dit geld in. (Dit mag niet 0 zijn.)</p><p>Als de andere spelers onderstaande opdracht halen, wordt dit bedrag verdubbeld. Als ze het NIET halen, gaat het gegokte bedrag uit de pot!</p><p>De opdracht luidt: speel gezamenlijk # inspanningskaarten. Als er een wantrouwkaart of ontspanningskaart wordt gespeeld, verlies je direct de opdracht.</p>",
		['Nadenken'],
		0,
		[
			new Q('Hoeveel inspanningskaarten speelde de trol?', ['Nul', 'Eén', 'Minstens twee']),
			new Q('Speelde de trol een verboden kaart (wantrouw of ontspanning)?', ['Ja', 'Nee']),
			new Q('Is de trol een man of een vrouw?', ['Man', 'Vrouw'])
		],
		true,
		false,
		'money',
		{
			firstGame: true,
			forbiddenAtStart: true,
			timePerPlayer: 20,
		}
	),

	new Task(
		"Vechten voor een Vrijstelling",
		"We staan onderaan een prachtig bergpad. Echter, om de honderd meter is er een uitdaging tegen een medespeler die je moet winnen. De persoon het verste weet te komen op het pad, in z’n eentje, krijgt een glimmende vrijstelling.",
		"<p>Iedereen speelt om de beurt één kaart, maar speciale acties tellen niet. (Bijvoorbeeld, als jij een wantrouwkaart speelt, mag je niet iemands kaarten bekijken.)</p><p>Als je niet meer verder wilt, zeg je “pass” en lig je eruit. Men gaat door totdat iedereen heeft gepasst.</p><p>Heeft één iemand de meeste kaarten gespeeld? Die krijgt de vrijstelling.</p><p>Als meerdere spelers het hoogste kaartenaantal hebben gespeeld, krijgt niemand de vrijstelling, maar verdient men wél al het ingezette geld.</p>",
		['Verboden'],
		10,
		[
			new Q('Hoeveel kaarten speelde de trol?', ['Nul', 'Eén', 'Twee', 'Meer dan twee']),
			new Q('Heeft de trol een vrijstelling gewonnen?', ['Ja', 'Nee, want de trol was één van meerdere winnaars', 'Nee']),
			new Q('Wat is de favoriete muziekstijl van de trol?', ['Pop', 'Rock', 'Blues', 'Jazz', 'Klassiek', 'R&B', 'Dance', 'Hardrock/Metal', 'Musical', 'Folk', 'Singer-Songwriter', 'Anders'])
		],
		false,
		false,
		'help'
	),

	new Task(
		"Samen staan we Sterk",
		"Voor jullie ligt een stapel loeizware boomstammen. Jullie moeten deze naar de overkant tillen om er een vlot van te maken. Als dat lukt binnen de tijd, krijgen jullie een behoorlijk bedrag voor de pot.",
		"<p>Als men gezamenlijk # inspanningskaarten speelt, én 2 samenwerkingskaarten, is de opdracht geslaagd.</p><p>Maar, iedere speler die een samenwerkingskaart ongedaan maakt (middels een ontspanningskaart), krijgt een JOKER.</p>",
		['Zwaar', 'Tijdsdruk'],
		50,
		[
			new Q('Hoeveel inspanningskaarten speelde de trol?', ['Nul', 'Eén', 'Minstens twee']),
			new Q('Speelde de trol een samenwerkingskaart?', ['Ja', 'Nee']),
			new Q('Heeft de trol een joker gewonnen?', ['Ja', 'Nee'])
		],
		false,
		false,
		'help',
		{
			timePerPlayer: 20,
			firstGame: true
		}
	),

	new Task(
		"Ontmoeting met de Trol",
		"De trol heeft een aanbieding voor jullie: de winnaar van de volgende opdracht mag hem één vraag stellen. Het mag alles zijn, zolang de trol het met “ja” of “nee” kan beantwoorden. Hoeveel hebben jullie over voor deze mogelijkheid?",
		'<p>Iedereen kiest in het geheim een geldbedrag (uit diens persoonlijke pot).</p><p>Als iedereen gekozen heeft, worden de bedragen tegelijkertijd onthuld.</p><p>De speler met het hoogste bod verliest dit uit zijn persoonlijke pot én eenzelfde bedrag gaat <em>uit de gezamenlijke pot</em>!</p><p>De winnaar stelt nu (luid en duidelijk) diens vraag aan de hele tafel.</p><p>Nu komt het antwoord van de trol: iedereen verlaat de kamer en gaat één voor één naar binnen. Als de trol je vraag met "ja" beantwoordt, draait hij jouw stapel handkaarten om. Kandidaten moeten gewoon even een paar seconden wachten en aan hun eigen kaarten ritselen.</p><p>(Bij gelijkspel gebeurt er simpelweg niks.)</p>',
		['Nadenken'],
		0,
		[
			new Q('Hoeveel geldbriefjes heeft de trol geboden?', ['Nul', 'Eén', 'Twee', 'Meer dan twee']),
			new Q('Heeft de trol zichzelf een vraag gesteld?', ['Ja', 'Nee']),
			new Q('Hoeveel kaarten had de trol tijdens deze opdracht in de hand?', ['Nul', 'Eén', 'Twee', 'Drie', 'Vier', 'Meer dan vier']),
		],
		false,
		false,
		'help',
		{
			minPlayers: 5
		}
	),

	new Task(
		"De Cryptische Carousel",
		"Alle kandidaten staan in een gigantische cirkel rondom de grootste fontein van Europa. Hierdoor kan je alleen informatie doorgeven aan de persoon naast je. Komt de juiste informatie terug bij dezelfde persoon, of zit er een kink in de kabel?",
		'<p>De PM verdeelt al het ingezette geld onder de spelers (iedereen minstens één briefje).</p><p>Alle spelers kiezen één kaart uit hun hand en geven deze door naar hun rechterbuur. Iedereen pakt zijn nieuwe kaart en schudt al zijn handkaarten.</p><p>Dit proces herhaalt zich totdat men # keer een kaart heeft doorgegeven.</p><p>Iedere speler die in de laatste ronde dezelfde kaart terugkrijgt als hij in het begin heeft weggegeven, mag zijn geldbriefjes in de pot doen.</p><p>Iedere speler die op het einde 3 kaarten van dezelfde soort vast heeft, krijgt direct een JOKER. (En hoeft de kaarten niet in te leveren.)</p>',
		['Samenwerken'],
		20,
		[
			new Q('Heeft de trol zijn eigen kaart teruggekregen?', ['Ja', 'Nee']),
			new Q('Heeft de trol een joker ontvangen?', ['Ja', 'Nee']),
			new Q('Hoeveel briefgeld kreeg de trol (bij het verdelen van de geldbriefjes)?', ['Nul', 'Eén', 'Twee', 'Drie', 'Meer dan drie briefjes'])
		],
		true,
		false,
		'help',
		{
			timePerPlayer: 25
		}
	),

	new Task(
		"Ren je rot",
		"Verspreid over deze winkelstraat staan tientallen zware dozen. Ren je rot om binnen de tijd alle dozen te bereiken, hun cryptische bestemming te ontcijferen, en op de juiste plek af te leveren &mdash; een ruime beloning wacht op jullie.",
		'<p>Men speelt twee rondes om de tafel.</p><p>De eerste ronde moet men gezamenlijk # renkaarten spelen. Als dat niet lukt, is de opdracht sowieso mislukt.</p><p>In de tweede ronde verdient men 20 euro voor elke puzzelkaart die wordt gespeeld.</p><p>Als men in totaal ook nog eens # inspanningskaarten speelt, verdient men de gehele inleg voor de pot.</p>',
		['Zwaar'],
		50,
		[
			new Q('Hoeveel renkaarten speelde de trol?', ['Nul', 'Eén', 'Twee', 'Meer dan twee']),
			new Q('Hoeveel inspanningskaarten speelde de trol?', ['Nul', 'Eén', 'Twee', 'Meer dan twee']),
			new Q('Hoeveel geld leverde de trol op?', ['Nul', '20', '40', '60', '80', '100 of meer'])
		],
		false,
		false,
		'money',
		{
			timePerPlayer: 26,
			firstGame: true
		}
	),

	new Task(
		"Erop of eronder?",
		"Kunnen jullie gedachten lezen? Ik hoop van wel, want jullie moeten achterhalen hoeveel geld de PM heeft ingezet voor deze opdracht, anders gaat het uit de pot.",
		'<p>De PM legt, in het geheim, een geldbedrag uit de pot opzij. Als de pot leeg is, gebruikt de PM diens persoonlijke pot.</p><p>Iedereen die nog in de opdracht zit, legt <em>tegelijkertijd</em> een briefje (uit de eigen stapel) voor zich.</p><p>Als je niet verder wilt gaan, leg je niks voor je (en bent uit de opdracht).</p><p>Na elke ronde telt de PM het totale bedrag op de briefjes. Als dit méér is dan het bedrag dat hij opzij heeft gezet, is de opdracht mislukt! Het gekozen bedrag gaat uit de pot, maar de PM krijgt een VRIJSTELLING.</p><p>Als alle spelers uit de opdracht zijn, maar het bedrag is niet boven de gekozen waarde, dan verdient men dit bedrag voor de pot!</p>',
		['Samenwerken', 'Nadenken'],
		0,
		[
			new Q('Hoeveel geldbriefjes legde de trol in?', ['Nul', 'Eén', 'Twee', 'Meer dan twee', 'De trol was de PM en deed niet mee']),
			new Q('Wanneer stapte de trol uit het spel?', ['In de eerste ronde', 'In de laatste ronde', 'In een middelste ronde', 'De trol was de PM en deed niet mee']),
			new Q('Hoeveel jokers heeft de trol op dit moment in bezit?', ['Nul', 'Eén', 'Twee', 'Drie', 'Meer dan drie'])
		],
		true,
		false,
		'money',
		{
			forbiddenAtStart: true
		}
	),

	new Task(
		"De hond in de pot",
		"We lopen over een hangbrug op honderden meters hoogte. Eén iemand krijgt dadelijk een kistje met daarin al het geld uit de pot en moet de oversteek veilig maken. Echter, als de medespelers teveel aan zichzelf denken en niet helpen ... kan dit kistje zomaar overboord slaan en kwijtraken.",
		"<p>Iedereen speelt gedekt kaarten. Voor deze opdracht heten renkaarten, informatiekaarten en puzzelkaarten VOOR DE GROEP en de rest VOOR ZICHZELF.</p>Als iedereen heeft gespeeld, worden de kaarten onthuld.</p><p>Als de meerderheid VOOR ZICHZELF heeft gekozen, gaat al het geld uit de pot.</p><p>Als de meerderheid VOOR DE GROEP heeft gekozen, verdient men al het ingezette geld. Iedereen die VOOR DE GROEP koos, echter, verliest één joker of geldbriefje uit de persoonlijke pot (als ze geen joker hebben).</p>",
		['Gevaarlijk', 'Samenwerken'],
		100,
		[
			new Q('Koos de trol voor de GROEP of voor ZICHZELF?', ['Groep', 'Zichzelf']),
			new Q('Is de trol een joker of geldbriefje kwijtgeraakt?', ['Ja, een joker', 'Ja, een geldbriefje', 'Nee, de trol raakte niks kwijt']),
			new Q('Tel de vrijstellingen, zwarte vrijstellingen en rode kaarten van de trol bij elkaar op. Welk getal krijg je?', ['0', '1', '2', '3', '4', '5', '6+'])
		],
		false,
		false,
		'money',
		{
			forbiddenAtStart: true,
			timePerPlayer: 15,
		}
	),

	new Task(
		"Een Beloning voor Later",
		"Men raadt wel eens aan om een brief te sturen naar je toekomstige zelf. Hier bij <em>Wie is de Trol?</em> gaan we graag een stap verder: iedereen mag een envelop met geld (uit de pot) sturen naar iemands toekomstige zelf. Als deze persoon afvalt, gaat dit geld verloren. Maar als deze persoon het de hele reis volhoudt ... wordt dat geld verdubbeld.",
		"<p>De PM geeft alle spelers een deel van de pot. (De pot mag niet leeg.)</p><p>Deze stapel geld moet je open voor een <em>andere</em> speler leggen.</p><p>Als deze persoon aan het einde van het spel nog géén rode kaart heeft gekregen, wordt dit geld verdubbeld en terug in de pot gestopt!</p><p>Als deze persoon tussendoor afvalt, gaat dit geld terug naar de bank. (Schrijf eventueel op een briefje dat dit heeft plaatsgevonden, anders vergeet je het misschien.)</p>",
		['Nadenken', 'Verboden'],
		0,
		[
			new Q('Hoeveel geldbriefjes uit de pot werden aan de trol toevertrouwd?', ['Nul', 'Eén', 'Twee', 'Drie', 'Vier', 'Meer dan vier briefjes']),
			new Q('Met welk dier kan de trol zich het beste identificeren?', ['Leeuw', 'Vos', 'Uil', 'Ezel', 'Hond', 'Dolfijn']),
			new Q('Houdt de trol meer van plannen of meer van improviseren?', ['Plannen', 'Improviseren', 'Geen idee, want de trol laat dit nooit zien of horen', 'Geen idee, want de trol doet nooit iets'])
		],
		true,
		false,
		'money',
		{
			forbiddenAtStart: true,
			forbiddenAtEnd: true
		}
	),

	new Task(
		"Kwadelijke Keuzes",
		"Jullie leider heeft kistjes door deze gang verspreid. Elk kistje kan iets goeds bevatten &mdash; geld voor de pot &mdash; of iets waar vooral de leider profijt van heeft. Met blinddoek op, moeten jullie gezamenlijk één kistje kiezen. Maar geen zorgen: als je slim bent, kan je de mindere kistjes wegspelen.",
		"<p>Alle spelers doen hun ogen dicht, <em>en houden hun ogen de hele opdracht lang dicht</em>, behalve de leider. Die pakt al het ingezette geld, voegt een joker en een vrijstelling toe, en verdeelt dit in # stapeltjes.</p><p>De andere spelers moeten één stapel kiezen; het geld in die stapel gaat naar de pot, een eventuele joker/vrijstelling gaat naar de leider.</p><p>Maar, ze krijgen mogelijkheden om informatie te vergaren. Voor elke twee kaarten van dezelfde soort die men speelt, mag men de inhoud vragen van een stapel.</p><p>Het is aan de leider om eerlijk aan te geven wanneer twee dezelfde kaarten zijn gespeeld. (Want met je ogen dicht, heb je natuurlijk geen zekerheid ... )</p>",
		['Samenwerken', 'Nadenken'],
		50,
		[
			new Q('Was de trol de leider bij deze opdracht?', ['Ja', 'Nee']),
			new Q('Heeft de trol een joker of vrijstelling verdient?', ['Joker', 'Vrijstelling', 'Geen van beide']),
			new Q('Hoeveel kaarten speelde de trol?', ['Nul', 'Eén', 'Twee', 'Drie', 'Vier', 'Meer dan vier'])
		],
		false,
		true,
		'help'
	),

	new Task(
		"Nieuwe (t)rollen",
		"Voor ieder van jullie staat een loodzware ton. Toon zoveel mogelijk inzet, draag deze ton zo ver als je kan, en je krijgt misschien wel het respect van je medekandidaten en een nieuwe belangrijke rol binnen de groep ... ",
		'<p>Alle spelers zetten in het geheim een geldbedrag in uit hun persoonlijke pot.</p><p>De winnaar is de persoon die het hoogste geldbedrag inzette, maar dit geld gaat wel uit de (gezamenlijke) pot. (Bij gelijkspel wint niemand.)</p><p>Deze winnaar wordt direct de <em>leider</em> én <em>PM</em>, en mag deze status de hele ronde niet meer kwijtraken.</p><p>(Als dit de laatste opdracht is van een ronde, geldt dit voor de VOLGENDE ronde.)</p>',
		['Zwaar'],
		0,
		[
			new Q('Was de trol PM of leider tijdens deze opdracht?', ['Beide', 'PM', 'Leider', 'Geen van beide']),
			new Q('Hoeveel geldbriefjes zette de trol in?', ['Nul', 'Eén', 'Twee', 'Drie', 'Vier', 'Meer dan vier']),
			new Q('Welk van deze rollen zou de trol het liefst vervullen?', ['President/Koning', 'CEO (leider van een groot bedrijf)', 'Ouder', 'Vrijwilliger', 'Bekende Nederlander', 'Anders'])
		],
		false,
		false,
		'help',
		{
			forbiddenAtEnd: true,
			totalTime: 60,
		}
	),

	new Task(
		"Verschillende Tweelingen",
		"Voor jullie staat een gigantische bak met knikkers die erg veel op elkaar lijken. Het is jullie taak om zoveel mogelijke unieke combinaties van knikkers met elkaar te versmelten, middels een gevaarlijk smeltapparaat, zonder ook maar één fout te maken en een combinatie twee keer te doen.",
		'<p>Als men # unieke kaartcombinaties van twee kaarten op tafel weet te krijgen, is de opdracht geslaagd.</p><p>Je hoeft de combinatie niet helemaal zelf in je hand te hebben: je mag ook andere combinaties verder afmaken. Als je dat doet, echter, moet je de kaart gedekt spelen. (En dus ook niet diens speciale actie uitvoeren.)</p><p>Als men ook maar één combinatie dubbel heeft, verliest men direct de hele opdracht!</p><p>Voorbeelden van combinaties: renkaart+puzzelkaart of inspanningskaart+samenwerkingskaart. (En nee, dezelfde combinatie in omgekeerde volgorde spelen telt niet als uniek.)</p>',
		['Samenwerken', 'Gevaarlijk'],
		20,
		[
			new Q('Speelde de trol een kaartcombinatie', ['Ja, helemaal zelf', 'Ja, hij maakte een andere af', 'Nee']),
			new Q('Had de trol een aandeel in een dubbele ( = niet-unieke) kaartcombinatie?', ['Ja', 'Nee']),
			new Q('Wat is het hoogste onderwijs dat de trol afgerond?', ['Nog geen', 'Basisschool', 'Middelbare School', 'Associate Degree', 'Bachelor', 'Master'])
		],
		false,
		false,
		'money',
		{
			firstGame: true,
			timePerPlayer: 15,
		}
	),

	new Task(
		"Een Snelle Gok",
		"Men moet om de beurt een minuut zo hard mogelijk rennen. De afgelegde afstanden worden bij elkaar opgeteld en jullie winnen de opdracht wanneer dit totaal boven twee kilometer uitkomt. Echter ... hoe meer personen je hiervoor nodig hebt, hoe minder geld je verdient.",
		'<p>Men moet gezamenlijk #*0.5 (afgerond naar boven) renkaarten spelen. Als dat is gelukt, eindigt de ronde meteen (overige spelers krijgen geen beurt).</p><p>Maar, je wilt deze kaarten zo snel mogelijk op tafel, want voor elke speler die een beurt neemt gaat 20 euro uit de pot.</p><p>Jullie mogen ook kiezen om op te geven en hele opdracht niet te doen (middels een gezamenlijke stemming), maar in dat geval krijgt de leider een gratis joker (en gaat er geen geld naar de pot).</p>',
		['Samenwerken', 'Tijdsdruk'],
		50,
		[
			new Q('Kreeg de trol een beurt bij deze opdracht?', ['Ja', 'Nee', 'Nee, want de groep besloot de hele opdracht niet te doen']),
			new Q('Wat was de rol van de trol?', ['Leider', 'Beginspeler', 'Reguliere speler']),
			new Q('Wat is het lievelingsseizoen van de trol?', ['Winter', 'Lente', 'Zomer', 'Herfst'])
		],
		false,
		true,
		'help',
		{
			timePerPlayer: 20,
			firstGame: true
		}
	),

	new Task(
		"Troeven Tellen",
		"Voor deze middag zijn acht verschillende mogelijke opdrachten geplaatst. De leider bepaalt, aan de hand van diens eigen vaardigheden, welke van al deze opdrachten jullie daadwerkelijk gaan spelen. Wees voorbereid ... op alles.",
		'<p>De leider speelt een open kaart midden op tafel: dit wordt de <em>troef</em>.</p><p>Speel gezamenlijk # kaarten in de troefsoort om de opdracht te laten slagen!</p>',
		['Samenwerken'],
		20,
		[
			new Q('Bepaalde de trol de troef?', ['Ja', 'Nee']),
			new Q('Hoeveel kaarten speelde de trol (nuttig of niet)?', ['Nul', 'Eén', 'Twee', 'Drie', 'Meer dan drie']),
			new Q('Wat is het lievelingsgetal van de trol?', ['Iets tussen 0-10', 'Iets tussen 10-100', 'Een negatief getal', 'Een complex getal', 'Iets extreem wiskundigs, zoals pi', 'Anders'])
		],
		false,
		true,
		'simple',
		{
			firstGame: true,
			timePerPlayer: 15,
		}
	),

	new Task(
		"Turbotroeven",
		"Welkom op de racebaan! Ieder van jullie krijgt een racewagentje en moet alle obstakels op dit pad ontwijken om de finish te bereiken. Als genoeg spelers de finish zien, gaat er veel geld in de pot. Maar ... iedere speler die tegen een obstakel botst en de finish niet haalt, krijgt een joker.",
		"<p>De leider speelt een open kaart midden op tafel: dit wordt de <em>troef</em>.</p><p>Speel gezamenlijk 2*# kaarten die NIET de troefsoort zijn om de opdracht te laten slagen!</p><p>Echter, iedere speler die wél een kaart in de troefsoort speelt, krijgt een JOKER (maar mag geen enkele andere kaartsoort spelen).</p>",
		['Gevaarlijk'],
		50,
		[
			new Q('Hoeveel troefkaarten speelde de trol?', ['Nul', 'Eén', 'Twee', 'Meer dan twee']),
			new Q('Hoeveel NIET-troefkaarten speelde de trol?', ['Nul', 'Eén', 'Twee', 'Drie', 'Meer dan drie']),
			new Q('Wat is het favoriete vervoersmiddel van de trol?', ['Fiets', 'Bus', 'Trein', 'Auto', 'Vliegtuig', 'Benenwagen', 'Tram', 'Metro', 'Anders'])
		],
		false,
		true,
		'help',
		{
			firstGame: true,
			timePerPlayer: 15,
		}
	),

	new Task(
		"De Juiste Volgorde",
		'Jullie staan bij de ingang van een verlaten gebouw dat vroeger een bank was. In de kluis ligt veel geld voor de pot. Maar ... er zijn meerdere manieren om daar te komen, en alleen als je de uitdagingen op de juiste volgorde aanvliegt, zal je plan slagen.',
		'<p>Als drie spelers na elkaar precies deze kaarten spelen (en niks anders), is de opdracht geslaagd: 1 renkaart, 1 informatiekaart, en 1 puzzelkaart.</p><p>(Deze kaarten mogen dus niet door één speler zelf worden gespeeld. En elke keer als iemand iets anders speelt (of niets), wordt de voortgang gereset.)</p>',
		['Samenwerken'],
		20,
		[
			new Q('Welke kaart speelde de trol?', ['Ren', 'Informatie', 'Puzzel', 'Anders']),
			new Q('Speelde de trol een passende kaart (gekeken naar de kaart die vóór hem werd gespeeld)?', ['Ja', 'Nee']),
			new Q('Welk van deze dingen doet de trol als eerste op een dag?', ['Ontbijten', 'Douchen', 'Aankleden', 'Werken', 'Sporten/Oefeningen', 'Nieuws Checken (krant of mobiel)']),
		],
		false,
		true,
		'money',
		{
			firstGame: true,
			timePerPlayer: 16,
		}
	),

	new Task(
		"Weinig Keus",
		'Voor deze opdracht zullen werkelijk alle vaardigheden worden aangesproken. Alle puzzels die hier liggen zijn zo ontworpen dat we denken dat precies één iemand van jullie deze kan oplossen: zal deze persoon opstaan en het juiste doen, of gaat de kans voorbij?',
		'<p>Als men gezamenlijk # unieke kaartsoorten speelt, is de opdracht geslaagd!</p>',
		['Samenwerken', 'Verboden'],
		20,
		[
			new Q('Hoeveel unieke kaartsoorten speelde de trol?', ['Nul', 'Eén', 'Twee', 'Meer dan twee']),
			new Q('Speelde de trol kaarten die niet strikt nodig waren voor de opdracht?', ['Ja', 'Nee']),
			new Q('Welke omschrijving past beter bij de trol?', ['Een alleskunner: wil alles tegelijk doen, kunnen of begrijpen.', 'Een specialist: wil focusen op één ding en daar héél goed in zijn.', 'Een middenweg: de trol kan niet kiezen welke van de twee diegene is.'])
		],
		false,
		false,
		'simple',
		{
			maxPlayers: 8,
			firstGame: true,
			timePerPlayer: 18,
		}
	),

	new Task(
		'Zwarte Markt',
		'Ergens op deze gigantische, chaotische markt ligt een zwarte vrijstelling. Jullie kunnen van mij hints krijgen over de locatie, maar dat zal een prijs hebben die niet velen kunnen betalen.',
		'<p>De PM speelt een kaart: dit wordt de <em>troef</em>.</p><p>De speler die de meeste kaarten in deze soort kan opleggen, krijgt een ZWARTE VRIJSTELLING. Bij gelijkspel speelt men nog een ronde van deze opdracht, met alleen de overgebleven spelers (en een nieuwe troef), totdat iemand wint.</p><p>(De kaart die de PM als troef speelde telt <em>niet</em> mee voor diens totaal!)</p>',
		['Nadenken'],
		0,
		[
			new Q('Hoeveel troefkaarten speelde de trol (in alle rondes die gespeeld zijn)?', ['Nul', 'Eén', 'Twee', 'Drie', 'Vier', 'Meer dan vier']),
			new Q('Was de trol de PM bij deze opdracht?', ['Ja', 'Nee']),
			new Q('Werkt de trol liever alleen of in een team? (In het echt, niet in dit spel natuurlijk.)', ['Alleen', 'Team'])
		],
		true,
		false,
		'help',
		{
			firstGame: true
		}
	),

	new Task(
		'Vluchtroute',
		'Eén van jullie zal dadelijk, zogenaamd, een bank overvallen. Vanaf het moment dat het alarm afgaat, heb je 10 minuten om het gebouw heelhuids te verlaten en daarvoor een vrijstelling te winnen. Lukt dat niet of wordt je gepakt? Dan betekent het geld voor de pot.',
		'<p>De speler met de meeste kaarten wordt de <em>vluchter</em>, de rest wordt <em>uitdagers</em>. (Bij gelijkspel kiest de leider.)</p><p>De uitdagers bepalen een getal tussen 1 en hoeveel kaarten de vluchter in de hand heeft. Als men geen overeenstemming kan bereiken, bepaalt de leider.</p><p>Als de vluchter méér unieke kaartsoorten kan spelen dan het genoemde getal, verdient hij een VRIJSTELLING. Zo niet, gaat al het ingezette geld in de pot.</p><p>Echter, hoe hoger het genoemde getal, hoe lager de opbrengst: men moet "-50 * getal" euro van de inzet aftrekken.</p>',
		['Zwaar'],
		50,
		[
			new Q('Was de trol de vluchter?', ['Ja', 'Nee']),
			new Q('Hoeveel geldbriefjes zette de trol in bij deze opdracht?', ['Nul', 'Eén', 'Twee', 'Drie', 'Vier', 'Meer dan vier']),
			new Q('Hoe vaak is de trol in aanraking geweest met de politie (boete, paspoort kwijt, aangifte, ...)?', ['Nul keer', 'Eén keer', 'Twee keer', '3-5 keer', '6-10 keer', 'Zo vaak dat ik het niet kan bijhouden']),
		],
		false,
		true,
		'help'
	),

	new Task(
		'Stilstand is Achteruitgang',
		'Alle spelers krijgen een kastje dat je bewegingsactiviteit meet. Wanneer je géén inspanning meer levert en dus volledig stilstaat, zal het kastje gaan piepen en is de opdracht mislukt. De puzzel zelf is makkelijk; actief blijven niet.',
		'<p>Als men gezamenlijk # inspanningskaarten speelt, één renkaart en één puzzelkaart, is de opdracht geslaagd!</p>',
		['Samenwerken'],
		20,
		[
			new Q('Speelde de trol een inspanningskaart?', ['Ja', 'Nee']),
			new Q('Speelde de trol een renkaart of puzzelkaart', ['Ja', 'Nee']),
			new Q('Wat is de mening van de trol over hardlopen?', ['Superleuk!', 'Superstom!', 'Goed voor je lichaam, maar het is zooo saai.', 'De trol ziet het punt niet.'])
		],
		false,
		false,
		'simple',
		{
			firstGame: true,
			timePerPlayer: 15,
		}
	),

	new Task(
		'Informatie Eerst',
		'Vannacht wordt iedereen een radio operator. Iedereen heeft een stukje informatie dat naar iemand anders moet, maar voor elk verkeerde tussenstation dat ze nemen, gaat een beetje informatie verloren. Om jullie toch te helpen, mag je wel kiezen wie die belangrijke eerste verbinding maakt.',
		'<p>De persoon die het meeste geld inzet wordt, alleen voor deze opdracht, de leider.</p><p>Als men gezamenlijk # informatiekaarten speelt, is de opdracht geslaagd!</p><p>Echter, elke niet-informatiekaart die wordt gespeeld maakt een eerdere informatiekaart ongedaan.</p>',
		['Samenwerken'],
		20,
		[
			new Q('Was de trol de leider tijdens deze opdracht?', ['Ja', 'Nee']),
			new Q('Hoeveel informatiekaarten speelde de trol?', ['Nul', 'Eén', 'Twee', 'Drie', 'Meer dan drie']),
			new Q('Hoeveel NIET-informatiekaarten speelde de trol?', ['Nul', 'Eén', 'Twee', 'Drie', 'Meer dan drie'])
		],
		false,
		false,
		'simple',
		{
			firstGame: true,
			timePerPlayer: 16,
		}
	),

	new Task(
		"Lasergevecht",
		"De mol daagt jullie uit voor een lasergevecht! Hoe meer voorwerpen jullie weten te schieten, hoe meer geld in de pot. Maar ga voor een heel ander doelwit ... en je vindt misschien wel een zwarte vrijstelling.",
		'<p>Tijdens deze opdracht maken jullie stapels met kaarten van dezelfde soort.</p><p>Tijdens je beurt speel je, zoals gewoonlijk, zoveel open kaarten als je wilt. Als de soort al een stapel heeft, leg je de kaart simpelweg bovenop. Anders begin je met deze kaart een nieuwe stapel.</p><p>Voor elke stapel met # of meer kaarten verdient men 50 euro voor de pot.</p><p>Maar, je mag óók bestaande stapels van tafel pakken en in je hand nemen, zolang ze minder dan # kaarten hebben. De persoon die aan het einde van de opdracht de meeste kaarten in de hand heeft, krijgt een zwarte vrijstelling.</p>',
		['Gevaarlijk', 'Zwaar'],
		0,
		[
			new Q('Pakte de trol een stapel in diens eigen hand?', ['Ja', 'Nee']),
			new Q('Hoeveel nieuwe stapels begon de trol?', ['Nul', 'Eén', 'Twee', 'Drie', 'Meer dan drie']),
			new Q('Hoeveel bestaande stapels heeft de trol uitgebreid?', ['Nul', 'Eén', 'Twee', 'Drie', 'Meer dan drie'])
		],
		false,
		true,
		'help',
		{
			timePerPlayer: 17,
		}
	),

	new Task(
		"Lasershow",
		'Elke speler staat op het dak van één van de hoogste gebouwen in deze stad. Vanaf hier kunnen jullie de aanstaande lasershows van medespelers goed zien, maar de lasershow van jouw eigen gebouw blijft onbekend. Jullie krijgen zoveel pogingen als jullie willen om te raden welk figuur op je eigen gebouw schijnt, maar neem te veel pogingen en je zal de nadelen ondervinden ... ',
		'<p>Alle spelers schudden hun kaarten en laten hun linkerbuurman één kaart trekken. Zonder er zelf naar te kijken houden ze deze boven hun hoofd (zodat de rest van de tafel deze wel kan zien).</p><p>Tijdens je beurt mag je ofwel raden welke kaart je vasthebt, ofwel vragen om een hint, ofwel opgeven. Men gaat net zo lang de tafel rond totdat iedereen zijn eigen kaart heeft geraden of één iemand heeft opgegeven. Voor elke gok of hint, echter, gaat 10 euro uit de pot</p><p>Als je vraagt om een hint, wijs je één specifieke speler aan. Die zegt een kaartsoort die je NIET vasthebt.</p><p>Men verdient het ingezette geld slechts als <em>alle</em> spelers hun eigen kaart raden. Als iemand opgeeft, verliest deze al zijn kaarten, maar krijgt wel een vrijstelling.</p>',
		['Samenwerken'],
		20,
		[
			new Q('Heeft de trol het opgegeven?', ['Ja', 'Nee']),
			new Q('Om hoeveel hints heeft de trol gevraagd?', ['Nul', 'Eén', 'Twee', 'Drie', 'Meer dan drie']),
			new Q('Draagt de trol een bril (of lenzen)?', ['Ja', 'Nee'])
		],
		false,
		false,
		'help'
	),

	new Task(
		"Trolzender",
		'Tijdens het spelen van deze opdracht laten jullie een cryptisch spoor van informatie achter. De laatste speler moet dit spoor perfect reproduceren voor de volle punten ... maar de trol heeft alle middelen tot zijn beschikking om stoorzender te spelen.',
		'<p>Iedereen verlaat de kamer en gaat vervolgens één voor één naar binnen.</p><p>Tijdens je beurt mag je zoveel kaarten <em>gedekt</em> spelen als je wilt. Voor elke kaart die je speelt, mag je een andere (al gespeelde) kaart bekijken.</p><p>Maar er zijn wat extra addertjes onder het gras: je mag kaarten niet voor jezelf neerleggen, elke kaart moet bij een andere speler, en je moet <em>iets</em> spelen.</p><p>De trol mag als enige alle regels breken (niks spelen, kaarten omwisselen, ...).</p><p>Als iedereen is geweest, gaat men weer aan tafel zitten. Als de laatste speler (zonder enige communicatie) exact kan vertellen welke kaarten op welke plek liggen, is de opdracht geslaagd. (Herinnering: je mag natuurlijk wel communiceren over wat je hebt gezien/gedaan terwijl het spel nog bezig is.)</p>',
		['Nadenken'],
		50,
		[
			new Q('Hoeveel kaarten speelde de trol?', ['Nul', 'Eén', 'Twee', 'Drie', 'Meer dan drie']),
			new Q('Hoeveel kaarten lagen er aan het einde voor de neus van de trol?', ['Nul', 'Eén', 'Twee', 'Drie', 'Meer dan drie']),
			new Q('Als hoeveelste ging de trol naar binnen?', ['Als eerste', 'Als laatste', 'Als één van de middelsten'])
		],
		false,
		false,
		'money',
		{
			timePerPlayer: 30
		}
	),

	new Task(
		"Omgekeerde Wereld",
		'Alle afvallers van de vorige rondes komen nog één keer terug in het spel voor een zeer ingewikkelde opdracht. Hun unieke vaardigheden kunnen jullie helpen de opdracht te halen, maar als je de verkeerde afvallers teruglaat, kunnen ze misschien voor hun eigen voordeel gaan.',
		'<p>Dit is een verboden opdracht, wat betekent dat afvallers niet mee mogen doen. Maar, elke afvaller heeft de kans om te ruilen met een speler die wél meedoet. (Dit betekent dat de afvaller deze ronde meespeelt, maar degene waarmee hij ruilt niet.)</p><p>Om dit te doen, kiezen ze een medespeler en moeten de rest van de groep overtuigen om met diegene te ruilen. (Als de meerderheid het ermee eens is, is het gelukt.)</p><p>Als men gezamenlijk 2*# kaarten speelt, <em>zonder</em> standaardkaarten mee te tellen (ren, puzzel, informatie, inspanning), is de opdracht geslaagd!</p><p>Echter, iedere speler die een standaardkaart speelt die door niemand anders wordt gespeeld, krijgt een joker.</p>',
		['Verboden', 'Zwaar'],
		100,
		[
			new Q('Heeft de trol met iemand van plek geruild (zodat hij wel/niet aan de beurt kwam)?', ['Ja', 'Nee']),
			new Q('Hoeveel kaarten speelde de trol?', ['Nul', 'Eén', 'Twee', 'Drie', 'Meer dan drie']),
			new Q('Heeft de trol een joker gewonnen?', ['Ja', 'Nee'])
		],
		false,
		false,
		'help',
		{
			forbiddenAtStart: true,
			timePerPlayer: 20,
		}
	),

	new Task(
		"Uitgesloten Mogelijkheid",
		'Voor deze opdracht zoeken we alleen de meest fitte spelers. De kandidaten met energie voor twee. Je zal namelijk eerst moeten vechten voor je plek ... en daarna ook nog eens moeten vechten om de opdracht te halen.',
		'<p>Splits de groep, in overleg, in twee. Slechts één van de groepen speelt deze opdracht (de andere groep doet niks).</p><p>Om te bepalen welke groep gaat spelen, moeten beide groepen in het geheim een bepaald aantal kaarten opspelen. De groep die de meeste kaarten speelde, wint, en bij gelijkspel is het de groep die de leider bevat. (Maar alle kaarten die je in deze fase speelt ben je al kwijt voordat de opdracht begint!)</p><p>Als men gezamenlijk # inspanningskaarten speelt, is de opdracht geslaagd én krijgt iedereen in de spelende groep een joker.</p>',
		['Samenwerken'],
		50,
		[
			new Q('Zat de trol in het team dat de opdracht uiteindelijk mocht spelen?', ['Ja', 'Nee']),
			new Q('Hoeveel kaarten speelde de trol in totaal? (Zowel de fase waarin de spelende groep werd gekozen als de opdracht zelf.)', ['Nul', 'Eén', 'Twee', 'Drie', 'Vier', 'Meer dan vier']),
			new Q('Heeft de trol op dit moment een rode kaart?', ['Ja', 'Nee'])
		],
		false,
		false,
		'help',
		{
			forbiddenAtStart: true,
			timePerPlayer: 16,
		}
	),

	new Task(
		"Dubbelzinnig Duet",
		'Twee van jullie zullen vandaag, onverwacht, moeten optreden in een kort toneelstuk hier in de buurt. Als jullie alle tekst weten te onthouden en reproduceren, is de opdracht geslaagd. Gelukkig mogen de andere spelers helpen door in de zaal bordjes omhoog te houden. Maar als het tweetal werkelijk alle tekst verkeerd zegt ... krijgen ze daar misschien een andere beloning voor.',
		'<p>De groep moet, in overleg, twee mensen uitkiezen: dit zijn de enige spelers in deze opdracht.</p><p>Alle overige spelers moeten één kaart uit hun hand aan beide spelers doneren.</p><p>Beide spelers spelen om de beurt één kaart, totdat ze allebei besluiten te stoppen. Ze moeten beide minstens twee kaarten spelen.</p><p>Als men # paren weet te spelen (twee kaarten van dezelfde soort), is de opdracht geslaagd! Echter, als ze <em>geen enkel paar</em> spelen, krijgen ze allebei een vrijstelling.</p>',
		['Zwaar'],
		20,
		[
			new Q('Was de trol deel van het tweetal?', ['Ja', 'Nee']),
			new Q('Hoeveel paren speelde/doneerde de trol uit diens eigen hand?', ['Nul', 'Eén', 'Twee', 'Drie', 'Meer dan drie']),
			new Q('Wat is het favoriete dagdeel van de trol?', ['Ochtend', 'Middag', 'Avond', 'Diepe nacht, want de trol is een weerwolf'])
		],
		false,
		false,
		'help',
		{
			totalTime: 60,
		}
	),

	new Task(
		"Geheugenkaarten",
		'Iedereen krijgt van mij enkele van deze grote houten blokken met cijfers, behalve één iemand: de ontcijferaar. De komende paar dagen moeten jullie deze cijfers door het hotel verstoppen, maar mogen verder helemaal niks over deze opdracht zeggen. Aan het einde van de eerstevolgende testfase wil ik van de ontcijferaar horen welke cijfers er precies verstopt zijn.',
		'<p>De groep kiest gezamenlijk één speler uit: dit wordt de <em>ontcijferaar</em>.</p><p>Tijdens deze opdracht bouwt men samen een code in het midden van de tafel. In je beurt moet je (minstens) één kaart gedekt bij deze code leggen, verder mag je spelen wat je wilt.</p><p>De ontcijferaar krijgt geen beurt, maar mag aan het einde van de opdracht eenmalig de hele code bekijken.</p><p>De code (en het ingezette geld) blijft op tafel liggen tot het <em>einde</em> van de eerstvolgende testfase. Op dat moment moet de ontcijferaar (zonder hints of wat dan ook) de hele code perfect reproduceren (zowel kaartsoorten als getallen). Alleen dan krijgt men al het ingezette geld!</p>',
		['Nadenken'],
		100,
		[
			new Q('Was de trol de ontcijferaar?', ['Ja', 'Nee']),
			new Q('Met hoeveel kaarten groeide de code tijdens de beurt van de trol?', ['Nul', 'Eén', 'Twee', 'Meer dan twee']),
			new Q('Wat is het favoriete lichaamsdeel van de trol?', ['Benen', 'Armen', 'Voeten', 'Handen', 'Hoofd', 'Schouders', 'Knie', 'Teen', 'Neus', 'Ogen', 'Oren', 'Iets wat niet voor alle leeftijden is', 'Anders'])
		],
		false,
		false,
		'money',
		{
			timePerPlayer: 15,
		}
	),

	new Task(
		"Als Een Olifant",
		'Welkom in de grootste dierentuin van de wereld. We hebben de eigenaar zo gek gekregen om op enkele olifanten een levensgroot cijfer te schilderen. Jullie krijgen een half uur om al deze olifanten te spotten en de gehele code te bemachtigen.',
		'<p>Niemand mag communiceren tijdens deze opdracht, op welk moment dan ook.</p><p>Iedereen speelt één kaart <em>gedekt</em> in het midden van de tafel. Als ze allemaal zijn gespeeld, worden de kaarten geschudt en op een rijtje gelegd. Dit is de code.</p><p>Vervolgens gaat iedereen de kamer uit en komt één voor één terug. Bij terugkomst, mag je twee kaarten bekijken.</p><p>Als iedereen is geweest (en dus weer aan tafel zit), moet je de code zien te raden.</p><p>Om de beurt, in een zelf te bepalen volgorde, mag elke speler (hoogstens twee keer) een kaart aantikken en zeggen wat het is. (Zowel kaartsoort als getal.)</p><p>Heeft iemand het fout? Jammer, opdracht meteen mislukt. Is de hele code ontcijferd? Al het geld voor de pot!</p>',
		['Samenwerken', 'Tijdsdruk'],
		50,
		[
			new Q('Hoeveel kaarten heeft de trol geprobeerd te raden?', ['Nul', 'Eén', 'Twee']),
			new Q('Als hoeveelste begon de trol met kaarten raden?', ['Als eerste', 'Als laatste', 'Als een van de middelsten']),
			new Q('Als hoeveelste ging de trol naar binnen?', ['Als eerste', 'Als laatste', 'Als een van de middelsten']),
		],
		false,
		false,
		'money',
		{
			timePerPlayer: 36
		}
	),

	new Task(
		'Liegen voor je Leven',
		'Iedere speler moet een feitje over zichzelf vertellen. Daarna krijgt de rest precies één minuut om door diens molboekje te bladeren en uit te vinden of het wel een feitje was ... of een flinke leugen. Kom je weg met een leugen? Dan krijg je een beloning. Speelt iedereen het spel oprecht? Alleen dan valt er geld te verdienen.',
		'<p>Alle spelers nemen twee kaarten in de hand (en leggen hun andere handkaarten even opzij).</p><p>Tijdens je beurt moet je een medespeler vragen: "wat heb je in je hand?" Waarop de medespeler twee kaartsoorten moet antwoorden, maar hierover mag liegen!</p><p>Als jij denkt dat de ander liegt, zeg je dat. Heb je gelijk? Dan verdien jij een joker. Heb je geen gelijk? Dan verdient die ander een joker. Als een speler eenmaal is uitgedaagd kan hij natuurlijk niet nogmaals worden uitgedaagd (want men kent diens kaarten al)</p><p>Alleen als <em>niemand</em> ongelijk heeft &mdash; niemand wordt uitgedaagd of elke uitdaging wordt gewonnen &mdash; gaat het geld in de pot.</p>',
		['Nadenken', 'Tijdsdruk'],
		20,
		[
			new Q('Loog de trol over diens kaarten?', ['Ja', 'Nee']),
			new Q('Heeft de trol een joker verdiend?', ['Ja', 'Nee']),
			new Q('Heeft de trol iemand anders uitgedaagd?', ['Ja, en gewonnen', 'Ja, maar verloren', 'Nee'])
		],
		false,
		false,
		'help',
		{
			timePerPlayer: 20
		}
	),

	new Task(
		'Eén voor Allen',
		'Bovenop deze berg staat één van jullie medespelers te wachten op een zwarte vrijstelling. Jullie krijgen alle tijd van de wereld om naar boven te klimmen en deze af te pakken, maar ... als jullie medespeler minstens twee keer precies kan voorspellen waar jullie staan op de berg, wint hij de opdracht meteen.',
		"<p>De leider probeert deze opdracht een zwarte vrijstelling te verdienen, de rest probeert geld in de pot te krijgen.</p><p>De leider speelt een kaart. Vervolgens voorspelt hij hoeveel andere spelers deze kaart ook hebben (door het noemen van een getal). Na deze voorspelling moeten de andere spelers onthullen of ze inderdaad zo'n kaart hebben of niet.</p><p>Men herhaalt dit proces drie keer. Als de leider minstens twee van de drie keer gelijk had, krijgt hij een zwarte vrijstelling. Anders wint de rest en gaat het ingezette geld in de pot.</p><p>(Herinnering: speciale acties van kaarten gelden natuurlijk nog steeds ...)</p>",
		['Gevaarlijk', 'Verboden'],
		20,
		[
			new Q('Was de trol de leider tijdens deze opdracht?', ['Ja', 'Nee']),
			new Q('Heeft de trol een speciale actie gebruikt?', ['Ja', 'Nee']),
			new Q('Hoe goed is de trol met getallen?', ['Supergoed!', 'Geen wiskundewonder, maar kan ermee vooruit', 'Best slecht eigenlijk', 'Heeft een hekel aan getallen en wil ze nooit meer zien'])
		],
		false,
		false,
		'help',
		{
			firstGame: true
		}
	),

	new Task(
		'Rond de Tafel',
		'Jullie zijn bijeengekomen om een bijzonder potje poker te spelen. Voordat je geld kan verdienen, moet jouw kaart eerst langs alle medespelers, die misschien ... zo hun redenen hebben om jouw kaart lekker zelf te houden.',
		'<p>Alle inzet in deze opdracht is persoonlijk: het geld dat je inzet blijft voor jou liggen. De leider krijgt de startinzet van deze opdracht erbij.</p><p>Deze opdracht heeft # "rondes". Aan het begin van het spel kiest elke kandidaat één kaart uit diens hand en laat deze aan de tafel zien (of noemt de naam).</p><p>Elke ronde geven alle kandidaten één kaart uit hun hand door naar links. <em>In plaats van</em> een kaart doorgeven, mag je ook een kaart uit je hand spelen (voor diens speciale actie).</p><p>Elke speler die in de laatste ronde <em>dezelfde kaartsoort</em> ontvangt als dat hij aan het begin heeft laten zien/weggegeven, mag diens inzet bij de pot doen!</p>',
		['Samenwerken'],
		30,
		[
			new Q('Heeft de trol dezelfde kaart in de laatste ronde weer ontvangen?', ['Ja', 'Nee']),
			new Q('Wat voor kaart liet de trol aan het begin zien?', ['Ren', 'Informatie', 'Puzzel', 'Inspanning', 'Ontspanning', 'Wantrouwen', 'Samenwerken', 'Leider', 'Anders']),
			new Q('Hoeveel kaarten heeft de trol gespeeld (in plaats van door te geven)?', ['Nul', 'Eén', 'Twee', 'Drie', 'Meer dan drie'])
		],
		false,
		true,
		'money'
	),

	new Task(
		'Stap voor Stap',
		'Welkom bij de langste trap van Europa. Voor elke stap die jullie willen zetten, moet je een supersimpele opdracht oplossen, maar verschillende tredes vereisen ook hele verschillende vaardigheden. Kom halverwege de trap en win wat geld. Kom helemaal tot boven en verdubbel je inzet.',
		'<p>Als men gezamenlijk één kaart van elke standaardsoort (renkaarten, puzzelkaarten, informatiekaarten, inspanningskaarten) speelt, is de opdracht geslaagd!</p><p>Als men minstens twee kaarten van elke standaardsoort weet te spelen, wordt de inzet verdubbeld (met geld uit de pot).</p><p>Als men minstens vier kaarten van elke standaardsoort weet te spelen, krijgt iedereen een vrijstelling!</p>',
		['Samenwerken'],
		0,
		[
			new Q('Hoeveel standaardkaarten speelde de trol?', ['Nul', 'Eén', 'Twee', 'Drie', 'Vier', 'Meer dan vier']),
			new Q('Hoeveel niet-nuttige kaarten speelde de trol (geen standaardkaart of er waren al genoeg in die soort)?', ['Nul', 'Eén', 'Twee', 'Drie', 'Meer dan drie']),
			new Q('Wat voor iemand is de trol?', ['Iemand die eerder de lift neemt', 'Iemand die eerder de trap neemt'])
		],
		false,
		false,
		'simple',
		{
			firstGame: true,
			timePerPlayer: 10,
		}
	),

	new Task(
		'Cadeauspel',
		"Jullie zitten aan een ronde tafel die kan draaien. Ieder van jullie heeft een cadeau gekregen met wat geld en misschien wel iets moois. Maar om dit cadeau te krijgen, zal je de tafel eerst minstens twee keer een draai moeten geven. Komt jouw lievelingscadeau terug op de juiste plek, of ga je uit frustratie maar cadeau's van andere mensen wegspelen?",
		"<p>Elke speler pakt een 'cadeau' uit de voorraad (joker, vrijstelling of zwarte vrijstelling) en legt deze voor zichzelf neer. Voeg de geldbriefjes die je wilt inzetten toe aan dit cadeau. De leider ontvangt de startinzet van deze opdracht.</p><p>Als je aan de beurt bent, speel je één kaart. Het <em>getal</em> op deze kaart geeft aan hoeveel stappen alle cadeau's naar links worden doorgegeven. (Bijvoorbeeld, als je een twee speelt, moet iedereen het cadeau dat nu voor hen ligt aan hun buurman twee plekken verderop geven.)</p><p>Let op: dit is een Verboden opdracht! Afvallers krijgen dus geen cadeau aan het begin, maar ze zitten nog steeds aan tafel, dus een cadeau kan zomaar voor de neus van een afvaller belanden.</p><p>Als je eenmaal 2 kaarten voor je hebt liggen, mag je aan het einde van je beurt de stapel die voor je ligt oppakken. Geld gaat in de pot, de rest is voor jou.</p><p>Als je nog geen 2 kaarten voor je hebt liggen, mag je ook 'opgeven', waardoor de stapel voor je meteen verdwijnt (zodat niemand anders hem nog kan winnen).</p>",
		['Verboden'],
		20,
		[
			new Q('Hoeveel kaarten heeft de trol gespeeld?', ['Nul', 'Eén', 'Twee', 'Drie', 'Meer dan drie']),
			new Q('Heeft de trol iets gewonnen?', ['Nee', 'Ja, hulpmiddelen', 'Ja, geld', 'Ja, zowel hulpmiddelen als geld']),
			new Q('Heeft de trol opgegeven?', ['Ja', 'Nee'])
		],
		false,
		false,
		'help',
		{
			forbiddenAtStart: true
		}
	),

	new Task(
		'Een Kunstige Code',
		'Jullie zijn gesplitst in twee groepen en staan op twee balkonnen tegenover elkaar, hoog boven de stad, met een code in de hand. Voor elk juist geraden getal, moeten jullie een volgend cijfer opsteken van jullie code, totdat één groep de hele code heeft ontcijferd. De groep die dat het snelste doet, staat een beloning te wachten ...',
		'<p>De leider splitst de groep in twee. Beide groepen spelen los van elkaar <em>gedekt</em> kaarten en zetten ook los van elkaar geld in. De startinzet voor deze opdracht wordt toegevoegd aan de groep waarin de leider zich bevindt.</p><p>Als alle kaarten van een groep zijn gespeeld, worden ze gedekt, op volgorde van <em>laag</em> naar <em>hoog</em>, op tafel geplaatst</p><p>Nu wordt het interessant! Om de beurt mogen spelers één kaart bij de tegenpartij aanwijzen en raden welk getal het is. Als ze gelijk hebben, wordt die kaart definitief onthuld en mogen ze nog een keer raden. Als ze geen gelijk hebben, moeten ze een kaart van hun eigen code onthullen en is de andere groep aan de beurt.</p><p>De groep die als eerste de code van de tegenpartij kraakt, verdient hun inzet voor de pot én een joker voor elke speler in die groep.</p>',
		['Nadenken'],
		50,
		[
			new Q('Zat de trol in het winnende team?', ['Ja', 'Nee']),
			new Q('Hoeveel kaarten heeft de trol toegevoegd aan de codestapel?', ['Nul', 'Eén', 'Twee', 'Drie', 'Meer dan drie']),
			new Q('Is de trol een creatief persoon? (Als in: is de trol meer creatief of meer rechtlijning/berekenend?)', ['Ja', 'Nee'])
		],
		false,
		true,
		'help'
	),

	new Task(
		'Een Snel Onderonsje',
		'Rennen is het toverwoord. En terwijl jullie rennen, moeten jullie puzzels langs de route oplossen. Elke groep die binnenkomt, verdient diens geld. Hoe sneller je binnenkomt, hoe meer geld. Maar elke groep die je onderschat, die wél finisht maar geen geld heeft meegenomen, krijgt een andere beloning.',
		"<p>Maak tweetallen. (Bij oneven aantal spelers, speelt de PM alleen.)</p><p>De PM verdeelt, in overleg, de gehele inzet onder de tweetallen.</p><p>Elk tweetal dat gezamenlijk één renkaart, inspanningskaart of puzzelkaart weet te spelen, verdient hun geld voor de pot.</p><p>Van elk tweetal dat alle drie de soorten speelt (renkaart, inspanningskaart, puzzelkaart), wordt de inzet zelfs verdubbeld.</p><p>Maar elk tweetal dat géén geld kreeg toebedeeld (van de PM), en tóch slaagt voor deze opdracht, verdient een joker.</p>",
		['Zwaar'],
		40,
		[
			new Q('Wat heeft de trol bij deze opdracht verdiend?', ['Eenmaal de inzet', 'Dubbel de inzet', 'Een joker', 'Helemaal niks']),
			new Q('Was de trol de PM bij deze opdracht?', ['Ja', 'Nee']),
			new Q('Is de trol goed in geheimen bewaren?', ['Ja', 'Nee', 'De trol zegt van wel, maar in werkelijkheid wordt alles meteen doorgeroddeld.'])
		],
		true,
		false,
		'help',
		{
			timePerPlayer: 14,
		}
	),

	new Task(
		'Drie Keer Raden',
		'Je kunt veel in je eentje, maar niet alles. In de volgende opdracht moeten de spelers met de meeste informatie alsnog de hulp van hun medespelers inzetten door, binnen drie pogingen, te raden waar ze zijn. Slechts als je alle informatie samenneemt, en niemand de groep wantrouwt en solo gaat, kan de opdracht slagen.',
		"<p>Als men gezamenlijk # informatiekaarten speelt, krijgt men de helft van de inzet (naar beneden afgerond).</p><p>Als iedere speler die een informatiekaart speelde óók een renkaart of puzzelkaart speelt, krijgt men de volledige inzet.</p><p>Om hierbij te helpen, krijgt iedere speler die een informatiekaart speelde <em>drie pogingen</em> om een kaart in de hand van een medespeler aan te wijzen en te 'raden' welke kaart dit is. Als je gelijk hebt, krijgt je deze kaart en mag hem meteen spelen. (Zoals altijd mag je niet communiceren of hints geven!)</p><p>De trol is de enige die mag liegen over het hebben van een bepaalde kaart, maar als er ook maar één wantrouwkaart wordt gespeeld in deze opdracht, verliest men direct.</p>",
		['Samenwerken', 'Tijdsdruk'],
		20,
		[
			new Q('Speelde de trol een informatiekaart?', ['Ja', 'Nee']),
			new Q('Wist de trol een juiste kaart te raden?', ['De trol hoefde niet te raden', 'Nee, alle pogingen waren fout', 'Ja']),
			new Q('Houdt de trol van gokspelletjes?', ['Ja', 'Nee'])
		],
		false,
		false,
		'money',
		{
			timePerPlayer: 24,
		}
	),

	// Vanaf hier komen vooral opdrachten die de GETALLEN op de kaarten gebruiken
	// (Want dat idee bedacht ik pas laat in de ontwikkeling, dus toen waren alle opdrachten hierboven al bedacht, 
	//  die alleen het _type_ kaart gebruiken)
	new Task(
		'Samen Sommen',
		'In de wiskunde is het belangrijk om exact te zijn. Het is niet genoeg om ergens in de buurt te komen: een som moet precies in een getal eindigen. In deze opdracht zal een medespeler de uitkomst vastleggen; aan jullie de taak om een simpele som te maken die hierop uitkomt. Laten we eens zien of jullie op elkaar kunnen rekenen ... ',
		'<p>De groep kiest, in overleg, één speler. Deze persoon bepaalt het "somgetal" door één of twee kaarten (open) te spelen. De eerste kaart staat voor de eenheden, de tweede kaart voor tientallen. (Bijvoorbeeld, hij speelt een 2 en een 3, dan is het somgetal dus 32.)</p><p>Alle andere spelers mogen tijdens hun beurt kaarten in het midden van de tafel leggen. Op die manier ontstaat tijdens de opdracht een rij van kaarten op een bepaalde volgorde.</p><p>Als men met de (getallen op de) gespeelde kaarten een som kan bedenken (door optellen of aftrekken) die <em>precies</em> uitkomt op het somgetal, is de opdracht geslaagd!</p>',
		['Samenwerken'],
		50,
		[
			new Q('Bepaalde de trol het somgetal?', ['Ja', 'Nee']),
			new Q('Hoeveel kaarten speelde de trol?', ['Nul', 'Eén', 'Twee', 'Drie', 'Vier', 'Meer dan vier']),
			new Q('Kan de trol goed hoofdrekenen?', ['Ja', 'Nee'])
		],
		false,
		false,
		'money',
		{
			timePerPlayer: 20,
		}
	),

	new Task(
		'Geld Gokken',
		'Dit is het grootste casino van Nederland. Het spel? Een variant op poker. De inzet? Jullie persoonlijke pot. (Hotel? Trivago.) Haal de beste score of bluf andere spelers eruit, en je zal veel macht verdienen in de vorm van geldbriefjes die jij bij toekomstige opdrachten mag inzetten ... ',
		'<p>De winnaar van deze opdracht krijgt al het ingezette geld in diens <em>persoonlijke pot</em>. Alleen als niemand wint (=gelijkspel), gaat het geld rechtstreeks naar de pot.</p><p>Men speelt in rondes. Elke ronde wordt de bovenste kaart van de stapel opengedraaid en op tafel gelegd. Vervolgens mogen alle spelers die nog in het spel zijn, extra geld inzetten. Als je niet minstens één geldbriefje inzet, ben je uit het spel.</p><p>Na 3 rondes stopt het spel en onthult iedereen hun kaarten. Door jouw handkaarten te combineren met de kaarten op tafel, moet je een zo goed mogelijke score maken (net zoals bij poker). De persoon met de beste score wint.</p><p>Deze combinaties scoren punten, op volgorde: een paar van dezelfde soort, een paar van dezelfde getallen, drie kaarten van dezelfde soort, drie kaarten met dezelfde getallen, een straat (vier kaarten met opeenvolgende getallen).</p><p>Alle kaarten die gebruikt zijn voor een combinatie, worden afgelegd.</p>',
		['Bluffen'],
		50,
		[
			new Q('Hoeveel rondes is de trol meegegaan?', ['Nul', 'Eén', 'Twee', 'Drie']),
			new Q('Hoeveel geldbriefjes heeft de trol ingezet?', ['Nul', 'Eén', 'Twee', 'Drie', 'Vier', 'Meer dan vier']),
			new Q('Heeft de trol een goede pokerface?', ['Ja', 'Nee']),
		],
		false,
		false,
		'money'
	),

	new Task(
		'Een Tweede Kans',
		'Na het bitterzoete afscheid met een van de kandidaten, vol tranen en knuffels, hebben we besloten jullie een tweede kans te geven. Als jullie je kaarten juist spelen ... kan één van de afvallers terug worden gewonnen.',
		'<p>Als men gezamenlijk # standaardkaarten weet te spelen (inspanning, ren, puzzel, informatie), is deze opdracht geslaagd.</p><p>Echter, als ook maar één speciale kaart wordt gespeeld, verliest men de hele inzet. In dat geval mag de persoon die de <em>meeste</em> speciale kaarten speelde, één rode kaart laten verdwijnen van een speler naar keuze (ook zichzelf).</p><p>Bij gelijkspel gebeurt er niets.</p>',
		['Samenwerken'],
		100,
		[
			new Q('Hoeveel speciale kaarten speelde de trol?', ['Nul', 'Eén', 'Twee', 'Drie', 'Vier of meer']),
			new Q('Hoeveel standaardkaarten speelde de trol?', ['Nul', 'Eén', 'Twee', 'Drie', 'Vier of meer']),
			new Q('Had de trol een rode kaart ten tijde van deze opdracht?', ['Ja', 'Nee'])
		],
		false,
		false,
		'help',
		{
			forbiddenAtStart: true,
		}
	),

	new Task(
		'Wisselkoers',
		'We staan bij de grootste bank van Europa. Hier kan je werkelijk elke muntsoort verkrijgen ... maar soms alleen tegen betaling van iets heel waardevols. Ben je bereid je grootste schatten op het spel te zetten in de hoop op meer? Of betekent het een ongekende straf?',
		'<p>Bij deze opdracht mag men ook hulpmiddelen inzetten! (Jokers, vrijstellingen, rode kaarten, ...)</p>Als de opdracht slaagt, betekent elk ingeette hulpmiddel 100 euro extra voor de pot en je krijgt ze terug. Als hij mislukt, verdwijnen alle hulpmiddelen, maar worden de rode kaarten teruggegeven en <em>verdubbeld</em>.</p><p>Speel gezamenlijk # inspanningskaarten en 3 <em>verschillende</em>speciale kaarten (naar keuze) om de opdracht te laten slagen.</p>',
		['Nadenken', 'Samenwerken', 'Tijdsdruk'],
		20,
		[
			new Q('Zette de trol een hulpmiddel in?', ['Ja', 'Nee']),
			new Q('Hoeveel nuttige kaarten speelde de trol?', ['Nul', 'Eén', 'Twee', 'Drie', 'Meer dan drie']),
			new Q('Wat is de lievelingsmunt van de mol?', ['Euro', 'Gulden', 'Pond', 'Dollar', 'Peseta', 'Geen idee, hij/zij heeft toch nooit geld'])
		],
		false,
		false,
		'money',
		{
			timePerPlayer: 20,
			forbiddenAtStart: true,
		}
	),

	new Task(
		'Verschilderen',
		'Jullie krijgen van mij honderd euro om schilderspullen te kopen en binnen een uur enkele prachtige muurschilderingen te maken. Dat niet alleen, jullie moeten telkens precies dezelfde schildering maken. Elk verschil tussen twee opeenvolgende schilderingen, hoe klein ook, zal geld uit de pot doen verdwijnen.',
		'<p>De leider kiest, in overleg, of deze ronde linksom of rechtsom wordt gespeeld (qua beurtvolgorde).</p><p>Als iedereen diens beurt heeft gedaan, verdient men automatisch al het overgebleven geld. Tijdens het spelen, echter, kunnen er wat briefjes verdwijnen.</p><p>Aan het einde van je beurt, check je het <em>kleinste verschil</em> qua getallen tussen jouw kaarten en die van de speler die voor jou aan de beurt was.</p><p>Bijvoorbeeld: jij speelde een 2 en een 5. De vorige speler speelde een 1 en een 8. Het kleinste verschil is tussen de "2" van jou en de "1" van die ander, namelijk 1 verschil.</p><p>Haal zoveel geldbriefjes uit de inzet als dit verschil! (Deze gaan naar de bank en zijn uit deze opdracht.)</p><p>De eerste speler is een uitzondering (want die heeft niemand die daarvoor aan de beurt was). Pas als iedereen aan de beurt is geweest, checkt de eerste speler het verschil tussen hemzelf en de <em>laatste</em> speler.</p>',
		['Nadenken', 'Tijdsdruk'],
		40,
		[
			new Q('Wat was het kleinste verschil van de trol?', ['0', '1', '2', '3', '4', '5', 'Meer dan 5']),
			new Q('Hoeveel kaarten speelde de trol?', ['Nul', 'Eén', 'Twee', 'Drie', 'Vier', 'Meer dan vier']),
			new Q('Heeft de trol uiteindelijk de inzet verhoogd of verlaagd?', ['Verhoogd (meer geld ingezet dan weggespeeld)', 'Verlaagd (meer geld weggespeeld dan ingezet)'])
		],
		false,
		true,
		'money',
		{
			timePerPlayer: 25
		}
	),

	new Task(
		'Zoek de Verschillen',
		"Deze opdracht gaat in twee groepen. De eerste groep krijgt een fototoestel om een paar mooie kiekjes te schieten. Van elke foto, echter, worden twee versies gemaakt. Het is aan de tweede groep om alle verschillen te herkennen tussen beide versies, anders zal geen geld in de pot belanden.",
		'<p>De leider maakt twee groepen, maar blijft zelf afzijdig. Eén groep wordt de "fotografen", de andere de "raders".</p><p>De fotografen leggen gezamenlijk een aantal kaarten gedekt op tafel (de "foto"). Als ze klaar zijn, onthullen ze de kaarten, en starten de timer.</p><p>De raders bekijken de foto even en verlaten dan de kamer.</p><p>De fotografen mogen nu de foto veranderen door kaarten weg te halen of juist toe te voegen. Dit mag hoogstens 30 seconden kosten. Als ze daarmee klaar zijn, roepen ze de raders terug.</p><p>De raders moeten alle verschillen benoemen: welke kaarten zijn erbij gekomen en welke zijn er verdwenen? (Volgorde of plaats maakt niet uit.)</p><p>Als de raders <em>alles</em> goed hebben, verdient men het geld voor de pot. Maar als de fotografen winnen, krijgen zij allemaal een joker.</p>De <em>leider</em> is scheidsrechter: schrijf de volgorde op een briefje, controleer of het klopt, en check of de fotografen niet te veel tijd nemen.</p><p>(Tip: maak onderscheid tussen wanneer je een verschil <em>definitief</em> benoemt en wanneer je gewoon hardop overlegt binnen je groep.)</p>',
		['Bedriegen'],
		100,
		[
			new Q('Bij welke groep zat de trol?', ['Fotografen', 'Raders']),
			new Q('Hoeveel kaarten speelde de trol (als fotograaf) of benoemde de trol (als rader)?', ['Nul', 'Eén', 'Twee', 'Drie', 'Vier', 'Meer dan vier']),
			new Q('Is de trol fotogeniek?', ["Ja", "Nee"])
		],
		false,
		true,
		'help',
		{
			totalTime: 120
		}
	),

	new Task(
		'Goocheltruc',
		'Eén van jullie medekandidaten is op mysterieuze wijze ... verdwenen. We denken dat het een truc is om een mooie (zwarte) vrijstelling voor zichzelf te winnen, maar we weten het niet zeker. Aan jullie de taak om deze persoon te ontmaskeren als een amateurgoochelaar door zijn trucs te doorzien!',
		'<p>De persoon die het meeste geld inzette bij deze opdracht, wordt de <em>goochelaar</em>.</p><p>De goochelaar trekt drie kaarten van de stapel en legt vervolgens een rij kaarten op tafel (minstens drie lang): de code.</p><p>Start vanaf nu de timer! Onthul de code. Iedereen mag deze even bestuderen en moet dan hun ogen sluiten.</p><p>De goochelaar krijgt 20 seconden om alle kaarten tot een nieuwe volgorde te husselen. Ook mag deze één kaart omdraaien.</p><p>Daarna doet iedereen de ogen open en moet de kaarten weer op de juiste volgorde leggen.</p><p>Als de opdracht om is, checkt men of de originele code terug is gevonden. (De afvallers schrijven de juiste volgorde op een briefje controleren of alles klopt.)</p><p>Is dat zo? Dan gaat het geld in de pot. Is dat niet zo? Dan verdient de goochelaar een (zwarte) vrijstelling, naar eigen keuze.</p>',
		['Verboden', 'Tijdsdruk'],
		50,
		[
			new Q('Wat was de rol van de trol bij deze opdracht?', ['Afvaller (deed niet mee)', 'Goochelaar', 'Reguliere speler']),
			new Q('Hoe vaak heeft de trol kaarten gehusseld (ofwel als goochelaar, ofwel bij vinden van de oplossing)?', ['Nul keer', 'Eén keer', 'Twee keer', 'Drie keer', 'Vier keer', 'Vijf tot tien keer', 'Meer dan tien keer']),
			new Q('Kan de trol kaarten schudden (in het echt)?', ['Ja, super goed', 'Ja, maar met veel moeite', 'Nee, gaat altijd mis, kaarten vallen op de grond enzo', 'Nee, en hij probeert het niet eens meer']),
		],
		false,
		false,
		'help',
		{
			forbiddenAtStart: true,
			totalTime: 90,
		}
	),

	new Task(
		'Doe eens iets Anders',
		'Aan de andere kant van deze wijk liggen een paar mooie kistjes met geld. Deze zijn voor jullie, als deze binnen de tijd worden bereikt ... en als elke speler een andere route neemt!',
		'<p>Als men gezamenlijk # renkaarten en # inspanningskaarten speelt, is de opdracht geslaagd.</p><p>Echter, geen van de kaarten die je speelt mogen hetzelfde getal hebben als een kaart die in de beurt hiervoor was gespeeld.</p>',
		['Samenwerken', 'Tijdsdruk'],
		20,
		[
			new Q('Hoeveel renkaarten speelde de trol?', ['Nul', 'Eén', 'Twee', 'Drie', 'Meer dan drie']),
			new Q('Hoeveel informatiekaarten speelde de trol?', ['Nul', 'Eén', 'Twee', 'Drie', 'Meer dan drie']),
			new Q('Probeert de trol graag nieuwe dingen, of blijft diegene liever bij het bekende?', ['Altijd nieuwe dingen!', 'Lekker altijd hetzelfde!']),
		],
		false,
		false,
		'simple',
		{
			timePerPlayer: 20,
			firstGame: true
		}
	),

	new Task(
		'Reken maar',
		'Om deze ingewikkelde rekenpuzzel op te lossen, zal je alle hersenkracht hard nodig hebben. Maar brandt je brein uit, en je kan wel eens te ver gaan in het zoeken van oplossingen ... ',
		'<p>Als men gezamenlijk # puzzelkaarten speelt, is de opdracht geslaagd!</p><p>Echter, terwijl men speelt, houdt men gezamenlijk een "totaalgetal" bij. Deze begint op 0, en elke keer als je een kaart speelt, tel je het getal van die kaart erbij op.</p><p>Elke keer dat het totaalgetal boven de 8 uitkomt, reset deze terug naar 0, maar moet de laatst gespeelde puzzelkaart ongedaan worden gemaakt.</p>',
		['Nadenken'],
		20,
		[
			new Q('Hoeveel voegde de trol toe aan het totaalgetal ( = de getallen van al diens kaarten bij elkaar opgeteld)?', ['0-2', '3-5', '6-8', '9-11', '12+']),
			new Q('Zorgde een kaart van de trol ervoor dat een puzzelkaart ongedaan werd gemaakt?', ['Ja', 'Nee']),
			new Q('Hoeveel puzzelkaarten speelde de trol?', ['Nul', 'Eén', 'Twee', 'Drie', 'Meer dan drie']),
		],
		false,
		false,
		'money',
		{
			firstGame: true,
			timePerPlayer: 16,
		}
	),

	new Task(
		'Pas op voor de Bom',
		'Alle spelers staan verspreid door dit verlaten gebouw. Je mag het gebouw niet verlaten, maar verder mag je doen wat je wilt. De eerste speler krijgt een bom in de handen, die eens in de zoveel tijd zal ontploffen. Je raakt de bom alleen kwijt door een andere speler aan te tikken. Hoe lang zal dat goed gaan?',
		'<p>Terwijl men speelt, houdt men gezamenlijk een "totaalgetal" bij. Deze begint op 0, en elke keer als je een kaart speelt, tel je het getal van die kaart erbij op.</p><p>Elke keer dat het totaalgetal boven de 10 uitkomt, barst de bom! De speler die dit veroorzaakte moet één hulpmiddel (joker, vrijstelling, etc.) aan een andere speler geven. Als je geen middelen hebt, moet je twee geldbriefjes uit je persoonlijke pot aan iemand anders geven. Hierna reset het totaalgetal terug naar 0.</p><p>Als men gezamenlijk # informatiekaarten speelt, is de opdracht geslaagd! Maar als de bom drie keer barst, verliest men sowieso de opdracht.</p>',
		['Gevaarlijk'],
		20,
		[
			new Q('Hoeveel informatiekaarten speelde de trol?', ['Nul', 'Eén', 'Twee', 'Drie', 'Meer dan drie']),
			new Q('Hoeveel voegde de trol toe aan het totaalgetal ( = de getallen van al diens kaarten bij elkaar opgeteld)?', ['0-2', '3-5', '6-8', '9-11', '12+']),
			new Q('Is de bom afgegaan bij de trol?', ['Ja', 'Nee']),
		],
		false,
		false,
		'money',
		{
			timePerPlayer: 20,
		}
	),

	new Task(
		'Een Bijzonder Paar',
		'Ook deze opdracht kent een puzzel, maar deze keer moet je hem allemaal <em>individueel</em> bekijken en stukjes van de oplossing aandragen. Als iedereen zijn steentje bijdraagt, is de puzzel hartstikke makkelijk. Maar als mensen besluiten puzzelstukjes voor zichzelf te houden omdat daar misschien iets moois uitkomt ... tja, dan wordt het lastig.',
		'<p>Maak tweetallen. (Bij oneven aantal spelers, speelt de leider alleen.) Iedereen gaat de kamer uit.</p><p>De leider (of diens tweetal) begint. Ze kiezen gezamenlijk kaarten om te spelen en maken hier een stapeltje van, midden op tafel. Dan gaan ze weg en roepen het volgende tweetal, dat eveneens kaarten speelt en het stapeltje op tafel aanvult. Dit gaat door totdat alle tweetallen zijn geweest.</p><p>Als men uiteindelijk # kaarten van dezelfde soort óf # kaarten met hetzelfde getal in de stapel heeft zitten, is de opdracht geslaagd!</p><p>Je mag ook als tweetal (gezamenlijk) kiezen om géén beurt te doen. In dat geval krijg je beide een joker <em>als de opdracht is geslaagd</em>, anders krijg je niets.</p>',
		['Samenwerken'],
		20,
		[
			new Q('Als hoeveelste ging de trol naar binnen?', ['Als eerste', 'Als laatste', 'Als een van de middelsten', 'De trol besloot geen beurt te doen']),
			new Q('Hoeveel kaarten voegde de trol toe aan de stapel?', ['Nul', 'Eén', 'Twee', 'Drie', 'Meer dan drie']),
			new Q('Heeft de trol op dit moment een (liefdes)relatie?', ['Ja, verkering', 'Ja, getrouwd', 'Ja, ander soort relatie', 'Nee'])
		],
		false,
		true,
		'help',
		{
			timePerPlayer: 20,
		}
	),

	new Task(
		'Op Eén Lijn',
		'In deze opdracht moet men om de beurt een klein stukje werken. Als de juiste stukjes na elkaar worden uitgevoerd, valt de oplossing zo in je schoot. Maar als de reeks van goede acties wordt onderbroken, door, ik zeg maar iets, een trol in jullie midden, moet je helemaal opnieuw beginnen.',
		'<p>Als # spelers op rij een geldige kaart spelen, is de opdracht geslaagd (en eindigt de opdracht direct)!</p><p>Wanneer is een kaart geldig? Als deze precies hetzelfde getal heeft als een kaart die in de beurt hiervoor is gespeeld. De eerste speler mag alles spelen wat diegene wil.</p><p>(Oftewel: als iemand géén kaart speelt of een ongeldige kaart dan wordt de rij dus onderbroken en moet je weer opnieuw beginnen met tellen.)</p><p>Als je een <em>nulkaart</em> speelt, draait de speelrichting van deze opdracht. (Stel je ging kloksgewijs rond de tafel, dan ga je vanaf nu tegen de klok in verder.)</p><p>Als de leider voor de <em>derde</em> keer aan de beurt is, of de tijd om is, maar je hebt nog steeds geen geldige reeks, is de opdracht gefaald!</p>',
		['Nadenken'],
		20,
		[
			new Q('Hoeveel geldige kaarten speelde de trol?', ['Nul', 'Eén', 'Twee', 'Drie', 'Vier', 'Meer dan vier']),
			new Q('Hoe vaak kwam de trol aan de beurt?', ['Nul keer', 'Eén keer', 'Twee keer', 'Drie keer', 'Meer dan drie keer']),
			new Q('Draaide de trol de speelrichting?', ['Ja', 'Nee'])
		],
		false,
		false,
		'money',
		{
			timePerPlayer: 20,
		}
	),

	new Task(
		"Haastige spoed is zelden goed",
		'Ieder van jullie heeft een eigen fiets gekregen. Als jullie binnen een uur allemaal in het dorp aan de andere kant van de heuvel verschijnen, is de opdracht geslaagd. Als jullie <em>precies</em> op het uur binnenkomen, krijgen jullie al het geld. Maar, voor elke vijf minuten die je te vroeg binnenkomt, gaat geld uit de inzet.',
		'<p>Als men gezamenlijk # inspanningskaarten én één ontspanningskaart heeft gespeeld, is de opdracht geslaagd!</p><p>Echter, de opdracht stopt <em>meteen</em> wanneer dit eenmaal op tafel ligt. Voor elke speler die <em>niet</em> aan de beurt is gekomen, gaat 20 euro uit de inzet.</p>',
		['Samenwerken', 'Tijdsdruk'],
		20,
		[
			new Q('Wat voor kaart(en) speelde de trol?', ['Inspanningskaart', 'Ontspanningskaart', 'Beide', 'Iets anders', 'Geen']),
			new Q('Is de trol aan de beurt gekomen?', ['Ja, hij was de eerste speler', 'Ja', 'Nee']),
			new Q('Wat voor soort fietser past het beste bij de trol?', ['Supersnelle fietser', 'Trage fietser', 'Wiebelende fietser', 'Onveilige fietser', 'De trol fietst nooit'])
		],
		false,
		false,
		'money',
		{
			timePerPlayer: 15,
			firstGame: true
		}
	),

	new Task(
		'Een Luie Uitdaging',
		'Deze opdracht speelt iedereen voor zichzelf &mdash; maar je kunt nog steeds van anderen profiteren. Iedereen moet zo snel mogelijk door het hotel rennen en een kistje vinden met hun naam erop. Echter, als jij jouw kistje niet op tijd bereikt, mag je voorspellen of het iemand anders wél is gelukt ... en daar misschien een joker aan overhouden.',
		'<p>Houdt iedereens geldinzet apart (gooi het niet op één hoop). De startinzet van deze opdracht gaat naar de leider.</p><p>Iedereen die een inspanningskaart speelt, verdient diens eigen inzet voor de pot.</p><p>Echter, als je géén inspanningskaart speelt, moet je een speler aanwijzen die nog niet aan de beurt is geweest, en voorspellen of diegene een inspanningskaart speelt of niet.</p><p>Heb jij gelijk? Dan krijg jij een joker. Heb jij geen gelijk? Dan krijgt die ander een joker.</p><p>(Herinner dat twee samenwerkingskaarten, bijvoorbeeld, ook één inspanning kunnen voorstellen. En natuurlijk hoef je een inspanningskaart niet perse te spelen als je deze hebt ...)</p>',
		['Bluffen', 'Tijdsdruk'],
		20,
		[
			new Q('Speelde de trol een inspanningskaart?', ['Ja', 'Nee']),
			new Q('Hoeveel geldbriefjes zaten in de persoonlijke inzet van de trol?', ['Nul', 'Eén', 'Twee', 'Drie', 'Vier', 'Vijf', 'Meer dan vijf']),
			new Q('Wat heeft de trol gedaan?', ['Iemand uitgedaagd en gewonnen', 'Iemand uitgedaagd en verloren', 'Werd uitgedaagd en won', 'Werd uitgedaagd en verloor', 'Anders'])
		],
		false,
		true,
		'help',
		{
			timePerPlayer: 24
		}
	),

	new Task(
		'Oplettende Ogen',
		'Tijdens dit spel moet iedere speler, stuk voor stuk, enkele handelingen uitbeelden. De andere kandidaten moeten dit, echter, van een flinke afstand aanschouwen. Als ook maar één iemand precies kan reproduceren wat iemand anders deed, is de opdracht geslaagd. Maar voor elke persoon die daarin faalt, gaat veel geld uit de pot.',
		'<p>Tijdens je beurt moet je een andere speler aanwijzen en raden hoeveel inspanningskaarten ze in de hand hebben. Elke twee samenwerkingskaarten die je vast hebt, tellen óók als een inspanningskaart.</p><p>Als iemand het fout heeft, zeg je slechts "fout" (maar geeft verder geen informatie weg). Je mag hierover liegen en zeggen dat een goede gok fout was.</p><p>Als iemand het goed heeft, laat je deze kaarten aan de tafel zien en moet ze vervolgens weggooien.</p><p>Je mag natuurlijk niet iemand kiezen van wie al is onthuld welke kaarten ze hadden.</p><p>Deze opdracht slaagt als minstens één persoon het goed heeft geraden. Echter, voor elke persoon die een fout maakt, gaat 50 euro uit de pot!</p>',
		['Nadenken'],
		50,
		[
			new Q('Heeft de trol het juiste aantal geraden?', ['Ja', 'Nee']),
			new Q('Hoe vaak hebben anderen een fout aantal geraden bij de trol?', ['Nul keer', 'Eén keer', 'Twee keer', 'Drie keer', 'Meer dan drie keer']),
			new Q('Wat is de favoriete dag van de week van de trol?', ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag']),
		],
		false,
		false,
		'money',
		{
			firstGame: true
		}
	),

	new Task(
		'Eerst zweten, dan geloven',
		'Deze gigantische steen moet naar een geheime locatie. Daarvoor zullen jullie hem eerst een eindje de heuvel op moeten tillen, daarna uitvogelen hoe je de steen op de auto laadt en de auto start, en vervolgens ontrafelen waar hij precies naartoe moet. Elke verdere stap levert meer geld op, maar als je de eerdere stappen al faalt, ben je gedoemd ...',
		'<p>Als men gezamenlijk # inspanningskaarten speelt, krijgt men 1/4 van de inzet (afgerond naar beneden).</p><p>Als men daarbovenop # puzzelkaarten speelt, krijgt men de gehele inzet.</p><p>Als men daarbovenop # informatiekaarten speelt, wordt de inzet verdubbeld.</p>',
		['Samenwerken', 'Zwaar'],
		50,
		[
			new Q('Hoeveel inspanningskaarten speelde de trol?', ['Nul', 'Eén', 'Twee', 'Drie', 'Meer dan drie']),
			new Q('Hoeveel puzzelkaarten en informatiekaarten speelde de trol (bij elkaar opgeteld)?', ['Nul', 'Eén', 'Twee', 'Drie', 'Vier', 'Vijf', 'Meer dan vijf']),
			new Q('Speelde de trol een kaart die nutteloos was? (Er kwamen er niet genoeg op tafel, of het was niet nodig voor de opdracht.)', ['Ja', 'Nee']),
		],
		false,
		false,
		'money',
		{
			firstGame: true,
			timePerPlayer: 15
		}
	),

	// Hier probeer ik walkie-talkies na te bootsen binnen dit spel xD
	new Task(
		"Walkie-Talkie Zoektocht",
		"Twee groepen zijn midden in de nacht op verschillende plekken gedropt. Jullie moeten elkaar binnen een uur tegenkomen op een afgesproken plek ... maar communicatie verloopt slechts via twee onbetrouwbare walkie-talkies.",
		"<p>De leider pakt een blaadje en een pen. Ook maakt diegene twee groepen en stuurt hen naar verschillende kamers (of zo ver mogelijk uit elkaars zicht en gehoor).</p><p>Als aan het einde van deze opdracht allebei de groepen <em>exact</em> dezelfde kaarten hebben gespeeld, is de opdracht geslaagd!</p><p>Iedere groep speelt een ronde zoals normaal (de leider begint, men speelt om de beurt kaarten), maar met twee extra regels:</p><p>Iedereen behalve de PM moet minstens één kaart spelen.</p><p>Elke keer als iemand zijn beurt heeft gedaan, pakt diegene het blaadje en loopt naar de andere groep. Onderweg, terwijl niemand kan meekijken, mag je iets op het blaadje schrijven. Vervolgens lever je het blaadje af en dan pas is de volgende persoon in die andere groep aan de beurt.</p><p>Belangrijk: je mag niet communiceren tussen groepen! Schrijven op het blaadje is de enige communicatie die je hebt. En als de opdracht is afgelopen, wordt het blaadje meteen verfrommeld en weggegooid: je mag niet achteraf dingen controleren.</p>",
		['Nadenken', 'Samenwerken'],
		100,
		[
			new Q('Hoeveel kaarten heeft de trol gespeeld?', ['Nul', 'Eén', 'Twee', 'Meer dan twee']),
			new Q('Als hoeveelste was de trol aan de beurt?', ['Eerste in diens groep', 'Laatste in diens groep', 'Als een van de middelste spelers in diens groep']),
			new Q('Hoeveel heeft de trol op het blaadje geschreven?', ['Niks', 'Eén woord/symbool', 'Twee woorden/symbolen', 'Meer dan twee dingen; het leek wel een halve roman!'])
		],
		false,
		true,
		'money',
		{
			minPlayers: 4,
			timePerPlayer: 30,
		}
	),

	new Task(
		"Slechte Verbinding",
		"In dit prachtige theater wordt vanavond een voorstelling opgevoerd ... in een taal die jullie niet kennen. Gelukkig hebben we een tolk die jullie precies gaat vertellen wat er gebeurd. Het enige probleem is dat deze boodschap via meerdere spelers moet gaan, en de kwaliteit van jullie walkie-talkies is niet om over naar huis te schrijven.",
		"<p>De leider verdeelt de volgende rollen: één speler wordt 'ontcijferaar', twee spelers worden 'doorgever', de rest wordt 'verteller'. Nadat hun taak gedaan is, doet iedere spelers diens ogen en oren dicht. De ontcijferaar daarentegen begint met ogen en oren dicht.</p><p>Alle vertellers verzinnen samen een verhaaltje van precies 10 woorden door om de beurt een woord op een blaadje te schrijven.</p><p>Ze vertellen dit aan de eerste doorgever. Die vertelt het weer aan de andere doorgever. En die vertelt het aan de ontcijferaar.</p><p>De doorgevers mogen allebei bewust woorden weglaten. Voor elk weggelaten woord verdient men 20 euro extra.</p><p>Als de ontcijferaar precies hetzelfde verhaal weet te vertellen als het origineel, verdient men al het geld! Zo niet, verdient men niks.</p>",
		['Samenwerken'],
		0,
		[
			new Q('Welke rol had de trol?', ['Ontcijferaar', 'Doorgever', 'Verteller']),
			new Q('Hoe heeft de trol de boodschap beïnvloed?', ['De trol heeft 0-2 woorden bijgedragen', 'De trol heeft 3+ woorden bijgedragen', 'De trol heeft 0-2 woorden weggelaten', 'De trol heeft 3+ woorden weggelaten', 'De trol heeft de boodschap niet beïnvloedt, alleen ontcijferd.']),
			new Q('Wat is de favoriete manier van de trol om een verhaal mee te krijgen?', ['Film', 'Serie', 'Boek', 'Gesproken', 'Social Media', 'Anders (krant, blogs, ...)'])
		],
		false,
		true,
		'money',
		{
			minPlayers: 4,
			totalTime: 240
		}
	),

	//
	// Eigenschappen
	//
	new Task(
		'In Karakter',
		'In deze opdracht moet iedereen in de huid kruipen van een bekend historisch figuur en op die manier informatie geven aan medekandidaten. Echter, hoe meer informatie je geeft, hoe groter de kans dat mensen meer over jouw echte persoonlijkheid te weten komen ... ',
		'<p>Als men gezamenlijk # informatiekaarten speelt, is de opdracht geslaagd!</p><p>Echter, de persoon met het minste aantal kaarten aan het einde van de opdracht moet een extra negatieve eigenschap aantrekken. (Bij gelijkspel kiest de leider.)</p>',
		['Bedriegen'],
		20,
		[
			new Q('Speelde de trol een of meerdere informatiekaarten?', ['Ja', 'Nee']),
			new Q('Moest de trol een negatieve eigenschap aantrekken?', ['Ja', 'Nee']),
			new Q('Doet de trol vaak stemmetjes, imitaties of typetjes?', ['Ja', 'Ja, maar diegene is er helemaal niet goed in', 'Nee'])
		],
		false,
		false,
		'eigenschappen',
		{
			timePerPlayer: 12,
			eigenschappen: true
		}
	),

	new Task(
		'Yin of Yang',
		'Welkom in deze eeuwenoude Chinese tempel. Als jullie genoeg moeite doen, moet het geen probleem zijn om de vele puzzels op te lossen en de uitgang te vinden. Echter, de eerste puzzel die wordt opgelost, bepaalt de toon van de rest van het spel. En de spelers die het meeste uit de toon vallen, staat een verrassing te wachten ...',
		'<p>Als men gezamenlijk # inspanningskaarten speelt, is de opdracht geslaagd! Maar er is een addertje onder het gras.</p><p>Het getal op de eerste kaart die wordt gespeeld is het "yingetal".</p><p>De speler die de meeste kaarten heeft gespeeld die <em>onder</em> dit getal zitten, moet een extra negatieve eigenschap pakken.</p><p>De speler die de meeste kaarten heeft gespeeld die <em>boven</em> dit getal zitten, mag een extra positieve eigenschap pakken!</p><p>Bij een gelijkspel, berekent men het <em>verschil</em> tussen de getallen. (Bijvoorbeeld, het yingetal is 3, iemand speelt een kaart met 1, dan is het verschil 2 voor die kaart.) Men kiest dan de speler met het <em>grootste</em> verschil in totaal.</p>',
		['Nadenken'],
		20,
		[
			new Q('Bepaalde de trol het yingetal?', ['Ja', 'Nee']),
			new Q('Wat was de uitkomst van de opdracht voor de trol?', ['Moest een negatieve eigenschap pakken', 'Mocht een positieve eigenschap pakken', 'Niks bijzonders']),
			new Q('Hoeveel inspanningskaarten speelde de trol?', ['Nul', 'Eén', 'Twee', 'Drie', 'Meer dan drie']),
		],
		false,
		false,
		'eigenschappen',
		{
			eigenschappen: true
		}
	),

	new Task(
		'Eigenaardige Actie',
		'Jullie zitten gezamenlijk in een grote boot die alleen vooruit komt door zelf te roeien. Maar in welke richting moet je roeien? Als je binnen de tijd op de juiste bestemming aankomt, gaat er geld in de pot. Maar de boot heeft nog wat andere bijzondere ... eigenschappen.',
		'<p>Als men gezamenlijk # inspanningskaarten én # informatiekaarten speelt, is de opdracht geslaagd!</p><p>Als dit niet lukt, moet iedereen die een kaart speelde die uiteindelijk nutteloos bleek, een extra negatieve eigenschap pakken. (Bijvoorbeeld: jij speelde een informatiekaart, maar uiteindelijk kwamen er niet genoeg informatiekaarten op tafel en daardoor mislukte de opdracht.)</p><p>Als dit wél lukt, mag iedereen die géén inspanningskaart of informatiekaart speelde een negatieve eigenschap wegdoen.</p>',
		['Gevaarlijk', 'Tijdsdruk'],
		40,
		[
			new Q('Welke kaarten speelde de trol?', ['Inspanning', 'Informatie', 'Beide', 'Anders']),
			new Q('Heeft de trol een eigenschap veranderd?', ['Ja, hij moest een extra negatieve eigenschap pakken', 'Ja, hij mocht een negatieve eigenschap wedoen', 'Nee']),
			new Q('Claimde de trol een bepaalde eigenschap te hebben tijdens deze opdracht?', ['Ja', 'Nee'])
		],
		false,
		false,
		'eigenschappen',
		{
			timePerPlayer: 20,
			eigenschappen: true
		}
	),

	new Task(
		'Streven naar Cijfers',
		'Welkom bij de veiling! De startspeler mag elke ronde een streefgetal opspelen en hoger/lager zeggen, en vervolgens moet iedereen proberen aan dat commando te voldoen, anders lig je uit de veiling. En wat is er te winnen voor de persoon die het beste tegen anderen kan opbieden? Een interessante keuze ... ',
		'<p>Men speelt net zoveel rondes totdat iemand heeft gewonnen (of de tijd om is).</p><p>Elke ronde speelt de leider een kaart en zegt "hoger" of "lager".</p><p>Als je in het spel wilt blijven, moet je tijdens je beurt een kaart spelen met <em>hetzelfde getal</em> of een getal dat <em>hoger/lager</em> is (afhankelijk van wat de leider zegt). Lukt dat niet, dan doe je niet meer mee.</p><p>Zodra iemand een kameleonkaart of nulkaart speelt, mag deze persoon vanaf nu de rondes beginnen en het getal bepalen.</p><p>Als nog maar één iemand over is, mag diegene kiezen: ofwel al het geld gaat in de pot, ofwel hij mag één negatieve eigenschap wegdoen en één positieve eigenschap aantrekken.</p><p>Bij gelijkspel, wint de persoon die in totaal de hoogste getallen heeft opgelegd. Als de tijd afloopt, speel je de huidige ronde nog af.</p>',
		['Tijdsdruk', 'Nadenken'],
		40,
		[
			new Q('Hoeveel rondes deed de trol mee?', ['Nul', 'Eén', 'Twee', 'Drie', 'Vier', 'Meer dan vier']),
			new Q('Heeft de trol de opdracht gewonnen?', ['Ja', 'Nee']),
			new Q('Hoeveel rondes was de trol de persoon die het streefgetal mocht bepalen?', ['Nul', 'Eén', 'Twee', 'Drie', 'Meer dan drie'])
		],
		false,
		true,
		'eigenschappen',
		{
			eigenschappen: true,
			timePerPlayer: 20
		}
	),

	new Task(
		'Rad van Voortuin',
		"Door deze prachtige voortuin verspreid staat op meerdere plekken een groot rad. Op zo'n rad staat een wirwar van opties: geld, een positieve eigenschap, een negatieve eigenschap, en nog meer. Als jij langs rent en een korte puzzel oplost, mag jij aan het rad dichter bij geld brengen. Maar als jij besluit iets anders te doen, mag je het rad een stukje meer naar de andere kant doen ... ",
		"<p>Als men gezamenlijk # renkaarten óf puzzelkaarten op speelt (je mag ze bij elkaar optellen), is de opdracht geslaagd!</p><p>Echter, voor elke <em>andere</em> kaart die wordt gespeeld, moet één ren- of puzzelkaart van tafel worden verwijderd. Als zo'n kaart er niet ligt, mag je niks anders spelen</p><p>Waarom zou je iets anders spelen? Voor elke andere kaart die je speelt, mag je één eigenschap van jezelf verwisselen met een eigenschap van iemand anders!</p><p>De persoon die uiteindelijk de meeste ren- of puzzelkaarten heeft gespeeld, mag één negatieve eigenschap wegdoen of één positieve eigenschap aantrekken. (Bij gelijkspel kiest de PM.)</p>",
		['Zwaar', 'Nadenken'],
		50,
		[
			new Q('Welke nuttige kaarten speelde de trol?', ['Ren', 'Puzzel', 'Beide', 'Anders']),
			new Q('Hoe vaak heeft de trol een eigenschap van zichzelf verwisseld?', ['Nul keer', 'Eén keer', 'Twee keer', 'Drie keer', 'Meer dan drie keer']),
			new Q("Hoe vaak heeft de trol (tot nog toe) in het spel een eigenschap aangetrokken/weggespeeld of iemand anders z'n eigenschappen uitgedaagd?", ['Nul keer', 'Eén keer', 'Twee keer', 'Drie keer', 'Vier keer', 'Vijf keer', 'Zes keer', 'Meer dan zes keer'])
		],
		false,
		false,
		'eigenschappen',
		{
			eigenschappen: true
		}
	),

	//
	// Speciale Krachten
	//
	new Task(
		'Krachten Kopen',
		'Welkom op deze markt. Jullie krijgen al het geld uit de pot tot je beschikking om te besteden ... maar alleen de groep die gezamenlijk het meeste uitgeeft, gaat naar huis met een aantal nuttige speciale krachten. Of vertrouwen jullie elkaar zoveel, dat jullie kunnen afspreken dat niemand geld verkwist?',
		'<p>Maak tweetallen. (Bij oneven aantal spelers, is één iemand alleen.)</p><p>Elk tweetal krijgt een briefje en een pen: daarop schrijven ze een geldbedrag. Als iedereen klaar is, worden de briefjes onthuld.</p><p>De groep die het meeste heeft geboden krijgt twee speciale krachten om te verdelen: de <strong>Fotofinish</strong> en de <strong>Coup</strong>. Hun bod, echter, gaat uit de pot.</p><p>Alleen als <em>alle</em> spelers een kruis (X) opschrijven als bod (en dus niks bieden), verdient men het ingezette geldbedrag voor de pot (maar niemand krijgt de speciale krachten).</p>',
		['Bluffen'],
		40,
		[
			new Q('Hoeveel heeft de trol geboden?', ['Het allerhoogste bedrag', 'Het allerlaagste bedrag', 'Een middelhoog bedrag', 'Niks (een kruis)']),
			new Q('Heeft de trol speciale krachten verdiend bij deze opdracht?', ['Ja, één', 'Ja, twee zelfs', 'Nee']),
			new Q('Welke superkracht zou de trol het liefst willen hebben?', ['Onzichtbaarheid', 'Vliegen', 'Gedachten lezen', 'Teleporteren', 'Ongelofelijke kracht', 'Ongelofelijke snelheid', 'Oneindig genezingsvermogen', 'Onweerstaanbaar knap', 'Extreem slim', 'Zoiets sentimenteels als "oh mijn superkracht zou zijn dat ik meteen wereldvrede kon stichten" of "alle mensen op aarde meteen blij en gelukkig maken!"'])
		],
		false,
		false,
		'specialeKrachten',
		{
			specialeKrachten: true,
			forbiddenAtEnd: true
		}
	),

	new Task(
		'Werk Weigeren',
		'De persoon die het eerste over de finish rent, krijgt een grote beloning. Maar geen zorgen als je je vandaag niet zo fit voelt: je kunt de ander dwingen om rustig aan te doen ... tegen een zekere betaling.',
		'<p>De speler die de meeste inspanningskaarten speelt, krijgt de volgende twee speciale krachten: <strong>Helderziende</strong> en <strong>Miljonair</strong>.</p><p>Echter, als iemand een inspanningskaart speelt, mag jij direct een kaart opleggen <em>met hetzelfde getal</em> om dit te "verbieden".</p><p>Voor elke kaart die je zo wegspeelt, gaat wel 20 euro uit de pot.</p><p>Men verdient de inzet voor deze opdracht slechts bij een gelijkspel tussen 3+ personen ( = drie of meer spelers hebben allemaal de meeste hoeveelheid inspanningskaarten gespeeld). Bij een gelijkspel tussen 2 personen verdelen ze de speciale krachten.</p>',
		['Zwaar'],
		50,
		[
			new Q('Hoeveel inspanningskaarten speelde de trol?', ['Nul', 'Eén', 'Twee', 'Drie', 'Meer dan drie']),
			new Q('Hoe vaak verbood de trol andermans kaart?', ['Nul keer', 'Eén keer', 'Twee keer', 'Meer dan twee keer']),
			new Q('Hoeveel speciale krachten heeft de trol tot nog toe in het spel verdiend?', ['Nul', 'Eén', 'Twee', 'Drie', 'Vier', 'Meer dan vier'])
		],
		false,
		false,
		'specialeKrachten',
		{
			specialeKrachten: true,
			forbiddenAtEnd: true
		}
	),

	new Task(
		"Krachtige Combo's",
		'Er zijn vele manieren om deze opdracht te laten slagen, maar ze zijn niet allemaal even effectief. De persoon die de opdracht op de beste manier afrond, wordt hiervoor flink beloond. Alleen als niemand de opdracht haalt, of er een rotzooitje van maakt, krijg de gezamenlijke pot een beloning.',
		'<p>Voor deze opdracht, zijn de volgende kaartencombinaties belangrijk: </p><ol><li>2 inspanningskaarten en 3 renkaarten</li><li>3 puzzelkaarten en 1 wantrouwkaart</li><li>4 informatiekaarten</li><li>2 samenwerkingskaarten en 1 inspanningskaart</li></ol><p>De speler die de beste kaartencombo speelt ( = het hoogste op de lijst), verdient twee speciale krachten: <strong>Afluisteraar</strong> en <strong>Alleskunner</strong>. Bij gelijkspel kiest de leider.</p><p>Als je met <em>Bondjes</em> speelt, mogen spelers binnen een bondje hun kaarten samenvoegen voor combinaties.</p><p>Alleen als niemand een kaartencombo speelt, of slechts de laagst scorende combo, verdient men het ingezette geld voor de pot!</p>',
		['Bluffen', 'Zwaar'],
		40,
		[
			new Q('Welke kaartencombo speelde de trol?', ['2 inspanning + 3 ren', '3 puzzel + 1 wantrouwen', '4 informatie', '2 samenwerking + 1 inspanning', 'Geen']),
			new Q('Heeft de trol speciale krachten verdiend bij deze opdracht?', ['Ja, allebei', 'Ja, maar moest delen met diens bondgenoot', 'Nee']),
			new Q('Was de trol de eerste die deze opdracht liet mislukken?', ['Ja, door een kaartencombo te spelen die niet de laagste was', 'Nee, de opdracht mislukte niet', 'Nee, iemand anders ging voor'])
		],
		false,
		false,
		'specialeKrachten',
		{
			specialeKrachten: true
		}
	),

	new Task(
		'Een Daverend Duet',
		'Iedereen weet dat meer mensen samen meer kunnen bereiken ... maar in deze opdracht moet je juist met minder mensen overweg. In de eerste fase kiest men, door andermands geldbriefjes te laten spreken, wie meedoet. In de tweede fase moet blijken of jullie de slimste koppen bij elkaar hebben gebracht, of de meest egoïstische.',
		'<p>Men mag GEEN geld uit de persoonlijke pot inzetten voordat deze opdracht begint. Vervolgens speelt men in twee rondes.</p><p>In de eerste ronde mag jij geld uit de persoonlijke pot <em>van iemand anders</em> inzetten: jij bepaalt dus hoeveel die persoon inzet bij deze opdracht. Slechts de helft van de groep (afgerond naar boven) die het meeste geld inzette, doet mee aan ronde twee! (Bij gelijkspel kiest de PM.)</p><p>Ronde twee verloopt zoals normaal: de spelers die meedoen spelen om de beurt kaarten.</p><p>Als men gezamenlijk # informatiekaarten of puzzelkaarten op tafel krijgt (je mag ze bij elkaar optellen), is de opdracht geslaagd!</p><p>Maar, de speler die de meeste nutteloze kaarten speelde (dus niet informatie of puzzel), krijgt twee speciale krachten: <strong>Gokker</strong> en <strong>Beveiliger</strong></p>',
		['Samenwerken'],
		40,
		[
			new Q('Met welke rondes deed de trol mee?', ['Ronde 1', 'Ronde 1 en 2', 'Geen enkele ronde']),
			new Q('Hoeveel geldbriefjes zette de trol in uit andermans pot?', ['Nul', 'Eén', 'Twee', 'Drie', 'Vier', 'Meer dan vier']),
			new Q('Welke kaarten speelde de trol in ronde?', ['De trol deed niet mee', 'Informatiekaart', 'Puzzelkaart', 'Alleen maar nutteloze kaarten', 'Iets anders'])
		],
		false,
		false,
		'specialeKrachten',
		{
			specialeKrachten: true,
			forbiddenAtEnd: true,
		}
	),

	new Task(
		'Beweeglijke Bingo',
		'Jullie staan in een prachtige ronde zaal. Ieder van jullie heeft een scherm met daarachter enkele geheime voorwerpen, die vooralsnog nutteloos zijn. Maar, elke tien seconden moeten jullie voorwerpen gooien naar je buren, totdat een van jullie een bingo heeft ... die wel degelijk nuttig is.',
		'<p>Zodra je tijdens deze opdracht vier kaarten van dezelfde soort in je hand hebt, mag je "BINGO" roepen en krijg je twee speciale krachten: <strong>Handelaar</strong> en <strong>Spion</strong></p><p>Iedereen speelt tegelijkertijd. Na elke tien seconden, geeft iedereen een kaart uit hun hand door naar links.</p><p>Zodra iemand een inspanningskaart open op tafel gooit, draait de speelrichting (links doorgeven <-> rechts doorgeven). </p><p>Alleen als nog niemand BINGO heeft geroepen wanneer de tijd om is, verdient men de hele inzet voor de pot.</p><p>Als jij voor het begin van deze opdracht al een set in je hand hebt, mag je de speciale krachten meteen pakken. In dat geval speelt men deze opdracht voor de beloning van twee jokers.</p><p>(Bij gelijkspel of onenigheden, zoals twee mensen die haast tegelijk BINGO roepen, beslist de leider.)</p>',
		['Nadenken', 'Tijdsdruk'],
		40,
		[
			new Q('Hoe vaak heeft de trol de draairichting veranderd?', ['Nul keer', 'Eén keer', 'Twee keer', 'Drie keer', 'Meer dan drie keer']),
			new Q('Heeft de trol een BINGO behaald?', ['Ja', 'Nee']),
			new Q('Hoeveel speciale krachten heeft de trol tot nog toe <em>ingezet</em> in het spel?', ['Nul', 'Eén', 'Twee', 'Drie', 'Meer dan drie'])
		],
		false,
		false,
		'specialeKrachten',
		{
			specialeKrachten: true,
			totalTime: 90,
			forbiddenAtEnd: true
		}
	),

	new Task(
		'Een Speciale Keuze',
		'Jullie gaan allemaal tegelijkertijd abseilen. Terwijl je boven een duizelingwekkende hoogte naar beneden klimt, kom je links en rechts grote kaarten met getallen tegen. Wie lage getallen naar beneden brengt helpt de groep. Wie alleen de hoge getallen pakt, brengt de pot in gevaar, maar kan rekenen op een interessant aanbod als hij weer met beide benen op de grond staat.',
		'<p>In deze opdracht zijn de getallen op kaarten belangrijk. Als men gezamenlijk méér kaarten speelt met een getal van 4 of lager, dan kaarten met een getal boven de 4, gaat alle inzet naar de pot. Maar, iedereen die slechts kaarten speelde met een getal boven de 4, mag een speciale kracht naar keuze uitkiezen.</p><p>De spelers die de meeste kaarten speelden mogen als eerste kiezen. Als de speciale krachten op zijn, mag je een joker pakken. (Bij gelijkspel/twijfel kiest de PM.)</p>',
		['Samenwerken', 'Gevaarlijk'],
		40,
		[
			new Q('Hoeveel kaarten speelde de trol?', ['Nul', 'Eén', 'Twee', 'Drie', 'Meer dan drie']),
			new Q('Hoeveel kaarten speelde de trol met een getal boven de 4?', ['Nul', 'Eén', 'Twee', 'Drie', 'Meer dan drie']),
			new Q('Heeft de trol een speciale kracht verdiend met deze opdracht?', ['Ja', 'Nee'])
		],
		false,
		false,
		'specialeKrachten',
		{
			specialeKrachten: true,
			forbiddenAtEnd: true
		}
	),

	//
	// Bondjes
	//
	new Task(
		'Bondgenoten',
		'In deze opdracht is geen tijd om je vrienden uit te zoeken: je moet ze al hebben. De groep die het beste presteert wordt beloond, zelfs als je geen bondje hebt, maar natuurlijk sta je samen sterker ...',
		'<p>Verdeel de groep aan de hand van de huidige bondjes. (Alle spelers met een bondje spelen als tweetal samen, de rest speelt in hun eentje.)</p><p>Iedere groep speelt, tegelijkertijd, gedekt kaarten. Als iedereen klaar is worden de kaarten onthuld.</p><p>De groep die het <em>hoogste cijfer</em> heeft, wanneer je de getallen van alle kaarten bij elkaar optelt, krijgt een joker. Als iemand in diens eentje wint, krijgt diegene een vrijstelling! (Bij gelijkspel kiest de leider.)</p><p>Men verdient alleen het geld voor deze opdracht als men gezamenlijk # puzzelkaarten weet te spelen.</p>',
		['Samenwerken'],
		40,
		[
			new Q('Zat de trol in een bondje tijdens deze opdracht?', ['Ja', 'Nee']),
			new Q('Hoeveel kaarten speelde de trol?', ['Nul', 'Eén', 'Twee', 'Drie', 'Vier', 'Meer dan vier']),
			new Q('Wat heeft de trol gewonnen?', ['Niks', 'Een joker', 'Een vrijstelling'])
		],
		false,
		false,
		'bondjes',
		{
			bondjes: true
		}
	),

	new Task(
		'Gedachten Lezen',
		'Hoe goed ken jij jouw bondgenoot? Goed genoeg om, zonder enig overleg of communicatie, precies te raden welke code door hem of haar is gecreërd? Ik hoop van wel, anders heeft de komende opdracht geen enkele kans van slagen ... ',
		'<p>Verdeel de groep aan de hand van de huidige bondjes: alle spelers met een bondje spelen als tweetal samen, de rest speelt <strong>niet</strong>.</p><p>Eén speler van elk tweetal moet de kamer uit. De spelers die in de kamer blijven, maken ieder afzonderlijk een code voor hun medespeler, door kaarten uit hun hand in een stapel op tafel te leggen.</p><p>Vervolgens worden deze stapels gehusseld: elke stapel krijgt een andere plek op tafel (maar de stapel zelf blijft intact).</p><p>Als men klaar is, worden de anderen teruggeroepen. Het is nu aan jou de taak om te <em>raden</em> welke code die van jouw <em>medespeler</em> is!</p><p>Als minstens de helft van de codes goed wordt geraden, is de opdracht geslaagd!</p><p>(Zorg ervoor dat de andere spelers niet je handkaarten kunnen zien, want dan weten ze meteen hoeveel kaarten er in jouw code zitten. En nee, je mag geen code van 0 kaarten doen.)</p>',
		['Samenwerken'],
		20,
		[
			new Q('Heeft de trol de code van diens medespeler goed geraden?', ['De trol mocht niet raden', 'Ja', 'Nee']),
			new Q('Hoeveel kaarten speelde de trol bij het maken van de code', ['De trol maakte geen code', 'Eén', 'Twee', 'Drie', 'Vier', 'Meer dan vier']),
			new Q('Heeft de trol op dit moment een bondje?', ['Ja', 'Nee'])
		],
		false,
		false,
		'bondjes',
		{
			forbiddenAtStart: true,
			bondjes: true
		}
	),


]


// @IMPROV: Dat idee van "je moet ofwel de kaartsoorten ofwel de getallen reproduceren, maar je weet nog niet welke" is sterk, moet ik ergens gebruiken (en dan moeten mensen véél kaarten onthouden!)
// @IMPROV: Nog één opdracht met inspanningskaarten, misschien ietsje minder zwaar deze keer
// @IMPROV: Iets meer opdrachten met speciale rol voor de PM (en leider, in mindere mate)
// @IMPROV: Remove "leider kiest wie begint" en dat soort shit van opdrachten, want dat gebeurt nu automatisch

// @IMPROV: Deze keuze in een opdracht stoppen => Dan maakt de leider een keuze: ofwel de inzet van deze opdracht wordt verdeeld over de persoonlijke geldstapels van de spelers in de groep, ofwel alle spelers in de groep krijgen een joker (maar al het geld gaat verloren).</p>

// IDEE: Een spel waarbij je niet met de kaarten in je hand speelt, maar met de geldbriefjes in je persoonlijke pot (of een deel uit de gezamenlijke pot)?


// VRAGEN: favoriete maand van het jaar
// TITEL VOOR EEN OPDRACHT (met meerdere rondes/fases): "Een Stap Verder"
// TITEL VOOR EEN OPDRACHT (een soort poker om een joker te winnen): "Jokerpoker"
// TITEL VOOR EEN OPDRACHT: "Omgekeerde Wereld"

// @IMPROV: 
// Ik heb op het laatste moment extra categorieën toegevoegd: Bedriegen, Bluffen, ??
// Ik moet even door de oude opdrachten heen om deze her en der toe te voegen (want het past beter dan de huidige categorieën)

/* AFGEVALLEN VRAGEN:
 new Q('Hoe groot zijn de toekomstplannen van de trol?', ['Niet aanwezig', 'Behoorlijk onzichtbaar', 'De trol denkt niet dat hij/zij een toekomst heeft'])


URL: https://www.businessinsider.nl/21-vragen-om-echt-meer-te-weten-te-komen-over-iemands-persoonlijkheid-tijdens-een-sollicitatiegesprek/
 */


// Leuke titel voor opdracht: "Recht van de Sterkste"