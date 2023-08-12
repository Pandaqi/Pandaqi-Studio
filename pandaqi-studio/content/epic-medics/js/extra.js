// shuffle function for randomizing a list
// the fastest and most reliable way I know to pick random events
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

// event constructor function
function Event(team, header, text, action) {
	this.team = team;
	this.header = header;
	this.text = text;
	this.action = action;
}

// complete list of events
// (team 0 = medics, team 1 = virus)
var allEvents = [
	// category 1: clearly helps medics
	new Event(0, "Help from the outside", "Your technician has enhanced your mobile phones, allowing you to pick up even the weakest of signals. You receive a short message: the voice of a woman, claiming she discovered something ... but is too sick to leave her home.", "The virus must tell you one trait (which hadn't been revealed before). If all traits are revealed, you may immunize a random city."),
	new Event(0, "A New Hope", "Just when the virus seemed out of control, a major breakthrough occurs.", "Pick one: take one step on the vaccine track, or completely immunize any city"),
	new Event(0, "Overtime", "After much debate, the new bill about overtime payment and burn-out insurance finally came through. Medics all over the country have suddenly decided that working overtime is a terrific idea.", "Every medic player may take one extra <em>free</em> action"),
	new Event(0, "Interesting Intern", "After only three weeks on the job, the new intern has already been able to take over everyone else's job. Suspicious. We suspect the intern of having a high IQ, though we can't be sure.", "Each medic player may use <em>any</em> ability this round, not just the one related to their character."),
	new Event(0, "Government Funds", "The government has looked everywhere these past few days: under the cupboard, under the bed, behind the plants. When all hope seemed lost, they found a hidden stash of money in the refrigerator. They are spending it on medical care.", "Once this round, you may build a research station for free in your current city. (Check the rules on character abilities.)"),
	new Event(0, "Special Medic Network", "To everyone's surprise, the government was prepared for this virus outbreak. They build a hidden road network for medics to use, so they can fly around the country like a rocket.", "Every medic may move two spaces for the price of one (when they do a <em>move</em> action)"),
	new Event(0, "Forgetful Virus", "Due to all the attention he's getting, the virus is confused and has forgotten what his purpose was in life.", "All virus traits are disabled for this round"),
	new Event(0, "Slow Virus", "The virus has become lacksidaisical. No wait, that's not a word. I mean the virus has become lackadaisical, thinking he has the victory in the bag, which makes him slow to respond.", "The actions <em>breach city</em> and <em>infect city</em> are not free this round. They cost the virus an action to execute."),
	new Event(0, "Intense Interrogation", "Finally, the medics have been able to pin down a human being with the virus, who is still very much alive and able to give them information. They decide to track down everywhere that person has been and all areas they have touched.", "The medics may ask the virus any question (about any city, if needed), and they must answer honestly."),
	new Event(0, "Hard Measures (II)", "The president has decided that enough is enough. And to him, more than three sick people is enough ... to quarantine a city.", "Every city with more than three sick people in it, immediately goes into quarantine"),
	new Event(0, "Makeshift Hospital", "The community has asked everyone to bring some left over wood, stone, furniture, cables, and other stuff. They used it to build a hospital, albeit temporarily, for everyone expects it to collapse soon.", "The medics may build a hospital in a random city. (Check the rules on character abilities.)"),
	new Event(0, "Hard Measures (III)", "The president has decided that enough is enough. The large cities in the country pose the greatest risk, so all efforts should concentrate on curing those.", "Cross out all people in cities with more than three people"),

	
	// category 2: clearly helps virus
	new Event(1, "Fake News (I)", "Some people on Facebook are claiming that the virus can be cured by rubbing your belly with olive oil and dancing the macarena. They were wrong.", "The virus may infect three random <em>healthy people</em>. If there are not enough healthy people, they may add them wherever they desire."),
	new Event(1, "Fake News (II)", "Some major figures are claiming the virus is a hoax designed by scientists who want more money. They were wrong.", "The virus may infect a <em>city</em> at random."),
	new Event(1, "Fake News (III)", "Apparently, Twitter is full of biochemical experts. They state that the virus is not dangerous, will automatically pass away, and is hardly deadly. They were wrong.", "The virus may either kill ( = cross out) three random people, or remove quarantine status from a city."),
	new Event(1, "Cold Season", "Weirdly enough, Spring will not be arriving this year, which means the country is stuck in colder temperatures for a bit longer.", "The virus may use the <em>spread infection</em> action for free this round."),
	new Event(1, "Double Trouble", "Just when they thought the virus was under control, a second virus hits the country. Luckily, it only lasts a single round and isn't too damaging.", "The virus may invent a second virus, with only a single trait. He may choose any trait, but once the round is over, the second virus is gone."),
	new Event(1, "Picking up the Pace", "Mathematicians have been warning the country for weeks now that viruses grow exponentially. Even so, nobody listened, and now they are surprised that a virus can spread that fast.", "Once this round, when a new city is breached, the virus can make it spread even further: pick a random outgoing connection at this city and breach whatever city is at the end of that."),
	new Event(1, "Surprise Effect", "We thought the virus had a round shape, but it turns out to be a square! This changes everything!", "Medics need one extra step on the vaccine track to unlock it. (If the vaccine is already unlocked, disable it again.)"),
	new Event(1, "Sneaky Virus", "When initiating quarantine, nobody thought about closing the sewers. Apparently, the virus can use that to escape.", "The virus may ignore one quarantine for free this round"),
	new Event(1, "Angry Mob", "Some people feel isolated during this lockdown. Furious, they have gathered in a large mob outside the mayor's house &mdash; which, to put it mildly, only made the situation worse.", "The virus picks a city and \"gathers\" people there. He may move one person &mdash; sick or healthy &mdash; from each adjacent city towards the chosen city."),
	new Event(1, "Sudden Incompetence", "Overwhelmed by the pressure and stress from fighting a virus, all medics have lost their way.", "Medics may not use their special ability this round"),
	new Event(1, "Immune to Interrogation", "The medics are trying to break the virus, telling him that they know what he's up to, but the virus just won't crack. In fact, he seems to enjoy it.", "The virus may lie <em>once</em> this round when asked a question (for free)."),
	new Event(1, "Pop Festival", "Even after the virus breakout, someone decided to keep organizing their music festival. ", "The virus must draw a music note in a random city. The medics may not quarantine this city. At the end of each round (until the end of the game), the medics must move one person from an adjacent city to the festival."),

	// category 3: more of a gray area, I try to balance teams 50/50
	new Event(0, "Bad Roads", "Due to neglected construction projects, because all the workers got sick, some (rail)roads are in a terrible condition.", "Both team medics and the virus may choose one rail(road) to cross out."),
	new Event(1, "Woeful Weather", "Due to terrible weather conditions, and general panic among the public, all boat and plane trips have been cancelled.", "Nobody may use a boat or airplane this round &mdash; applies to both players and people."),
	new Event(0, "Volunteer Work", "People all over the country decided to take a day off and volunteer wherever they are needed. \"A heartwarming gesture,\" says our spokesman, \"though they might just be making matters worse.\" ", "Every medic player must move an extra player on their turn. However, the virus must tell them (honestly) if that person came from a healthy city or not."),
	new Event(1, "Fake News (IV)", "Your uncle is claiming that cars and trains are the definite cause of the virus spread. Everyone is laughing at him. Unfortunately, he is the president of the country.", "Nobody may use a road or railroad this round &mdash; applies to both players and people."),
	new Event(0, "Makeshift Airport", "Airports are terrible places, for they spread viruses very easily. But they're also incredible places, for you can travel quickly. Which one will it be?", "Both medics and virus may either create a new airport or close an existing one."),
	new Event(1, "Hard Measures (I)", "The president has decided that enough is enough. The only way to fight the virus, is by locking everything down and giving it no chance. Unfortunately, he seems to be forgetting the downsides of that approach.", "Every city with more than three healthy people in it, immediately goes into quarantine."),
	new Event(0, "No way to go", "Against public health advise, people have been trying to visit each other. The government doesn't like this and is closing down the country.", "No <em>person</em> may use a road or railroad. Players can still use them"),
	new Event(1, "Five Star Restaurant", "To help people in times of need, a five star restaurant has started stelling its ice cream for free! This, unfortunately, attracts many tourists from all over the world.", "The medics must draw an ice-cream symbol in a random city. This city now receives an extra airport (draw a new slot and draw a plane). At the end of each round (until the end of the game), one sick and one healthy person will arrive at this city."),

	
];


// variable to keep track of event list + current event number
var eventList = [];
var eventNum = -1;
var totalNumEvents = -1;

// when the event button is clicked ...
document.getElementById('eventButton').addEventListener('click', function(ev) {
	// if this is the first click ... 
	if(eventNum == -1) {
		// grab number of players
		var numPlayers = parseInt( document.getElementById('playerCount').value );

		// use that to determine number of rounds
		var totalNumEvents = 10 + 2 - numPlayers;

		// shuffle complete event list
		allEvents = shuffle(allEvents);

		// generate the list of events 
		// (do not allow duplicates, split events evenly across virus and medics)
		var curTeam = Math.round(Math.random());
		var counter = 0;
		while(eventList.length < totalNumEvents) {
			if(allEvents[counter].team == curTeam) {
				// add event to current list
				eventList.push(allEvents[counter]);

				// remove event from total list
				allEvents.splice(counter, 1);

				// go to the other team
				curTeam = (curTeam+1)%2;

				// reset stuff completely
				counter = -1;
				allEvents = shuffle(allEvents);
			}

			counter++;
		}

		var event0 = eventList.splice(0,1)[0];
		var event1 = eventList.splice(0,1)[0];

		// randomize the list of events 
		// (it's boring/predictable if it's always the same order of teams)
		// (HOWEVER, make sure the first two events _are_ alternating, otherwise it's too unfair)
		eventList = shuffle(eventList);
		eventList.unshift(event1);
		eventList.unshift(event0);

		// change button text
		ev.currentTarget.innerHTML = 'Next Event!';

		// remove player count form
		document.getElementById('playerCountForm').innerHTML = '';
		document.getElementById('playerCountForm').style.display = 'none';
	}

	// go to next event
	eventNum++;

	// some basic error checking
	if(eventNum < 0 || eventNum >= eventList.length) {
		document.getElementById('curEventDisplay').innerHTML = "<p style='text-align:center;font-weight:bold;'>Sorry, something went wrong, or we're out of events.</p>";
		return;
	}

	// read it
	var eventHeader = eventList[eventNum].header;
	var eventText = eventList[eventNum].text;
	var eventAction = eventList[eventNum].action;

	// display the event
	document.getElementById('curEventDisplay').innerHTML = '<div class="event"><h3>' + eventHeader + '</h3><span class="roundNumber">(Round ' + (eventNum+1) + ')</span><p>' + eventText + '</p><p class="takeAction">' + eventAction + '</p></div>';
});