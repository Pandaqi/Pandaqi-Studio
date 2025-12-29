
import Event from "./event"
import allEvents from "./dict"
import { SettingType, shuffle, loadSettings } from "lib/pq-games";

const CONFIG =
{
	_settings:
	{
		playerCount:
		{
			type: SettingType.NUMBER,
			min: 2,
			max: 7,
			value: 4,
			label: "Player Count"
		}
	}
}

const callback = async () =>
{
	const eventList : Event[] = [];
	var eventNum = -1;

	// preparation
	const numPlayers = parseInt((CONFIG._settings.playerCount.value ?? 4).toString());
	const totalNumEvents = 10 + 2 - numPlayers;
	shuffle(allEvents);

	// generate the list of events 
	// (do not allow duplicates, split events evenly across virus and medics)
	let curTeam = Math.round(Math.random());
	let counter = -1;
	let numTries = 0;
	const maxTries = 500;
	while(eventList.length < totalNumEvents && numTries < maxTries) {
		counter = (counter + 1) % allEvents.length;
		numTries++;

		const notOurDesiredTeam = allEvents[counter].team != curTeam;
		if(notOurDesiredTeam) { continue; }
		
		eventList.push(allEvents[counter]);
		allEvents.splice(counter, 1);
		curTeam = (curTeam + 1) % 2;
		counter = -1;
		numTries = 0;
	}

	const somethingWentWrong = (numTries >= maxTries);
	if(somethingWentWrong)
	{
		while(eventList.length < totalNumEvents) { eventList.push(allEvents.pop()); }
	}

	const event0 = eventList.splice(0,1)[0];
	const event1 = eventList.splice(0,1)[0];

	// randomize the list of events 
	// (it's boring/predictable if it's always the same order of teams)
	// (HOWEVER, make sure the first two events _are_ alternating, otherwise it's too unfair)
	shuffle(eventList);
	eventList.unshift(event1);
	eventList.unshift(event0);

	// when the event button is clicked ...
	const eventButton = document.getElementById('eventButton');
	eventButton.innerHTML = 'Next Event!';
	const displayNode = document.getElementById('curEventDisplay');
	eventButton.addEventListener('click', () => 
	{
		eventNum++;

		const invalidEventNum = eventNum < 0 || eventNum >= eventList.length;
		if(invalidEventNum) 
		{
			displayNode.innerHTML = "<p style='text-align:center;font-weight:bold;'>Sorry, something went wrong, or we're out of events.</p>";
			return;
		}

		const ev:Event = eventList[eventNum];
		displayNode.innerHTML = `<div class="event"><h3>${ev.header}</h3><span class="roundNumber">(Round ${(eventNum + 1)})</span><p>${ev.text}</p><p class="takeAction">${ev.action}</p></div>`;
	});
}

loadSettings(CONFIG, callback)