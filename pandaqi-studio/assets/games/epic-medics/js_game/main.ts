import Random from "js/pq_games/tools/random/main"
import Event from "./event"
import allEvents from "./dict"

const eventList : Event[] = [];
var eventNum = -1;

// when the event button is clicked ...
const eventButton = document.getElementById('eventButton');
const displayNode = document.getElementById('curEventDisplay');
eventButton.addEventListener('click', (clickEvent) => 
{
	const firstClick = eventNum < 0;
	const data = JSON.parse(window.localStorage.getItem("epicMedicsConfig") || "{}");

	if(firstClick) 
	{
		const numPlayers = parseInt(data.playerCount ?? data.numPlayers ?? 4);
		const totalNumEvents = 10 + 2 - numPlayers;
		Random.shuffle(allEvents);

		// generate the list of events 
		// (do not allow duplicates, split events evenly across virus and medics)
		let curTeam = Math.round(Math.random());
		let counter = -1;
		while(eventList.length < totalNumEvents && counter < eventList.length) {
			counter++;

			const notOurDesiredTeam = allEvents[counter].team != curTeam;
			if(notOurDesiredTeam) { continue; }
			
			eventList.push(allEvents[counter]);
			allEvents.splice(counter, 1);
			curTeam = (curTeam + 1) % 2;
			counter = -1;
		}

		const event0 = eventList.splice(0,1)[0];
		const event1 = eventList.splice(0,1)[0];

		// randomize the list of events 
		// (it's boring/predictable if it's always the same order of teams)
		// (HOWEVER, make sure the first two events _are_ alternating, otherwise it's too unfair)
		Random.shuffle(eventList);
		eventList.unshift(event1);
		eventList.unshift(event0);

		const btn : HTMLButtonElement = clickEvent.currentTarget as HTMLButtonElement;
		btn.innerHTML = 'Next Event!';
	}

	eventNum++;

	const invalidEventNum = eventNum < 0 || eventNum >= eventList.length;
	if(invalidEventNum) 
	{
		displayNode.innerHTML = "<p style='text-align:center;font-weight:bold;'>Sorry, something went wrong, or we're out of events.</p>";
		return;
	}

	const ev:Event = eventList[eventNum];
	displayNode.innerHTML = '<div class="event"><h3>' + ev.header + '</h3><span class="roundNumber">(Round ' + (eventNum + 1) + ')</span><p>' + ev.text + '</p><p class="takeAction">' + ev.action + '</p></div>';
});