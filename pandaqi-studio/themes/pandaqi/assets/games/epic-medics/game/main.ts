// Epic Medics is a hand-written widget, not a material generator: it reads its own controls from the
// page markdown (#playerCount, #eventButton, #curEventDisplay) and uses nothing from pq-games.
import Event from "./event"
import allEvents from "./dict"

const shuffle = (arr:any[]) =>
{
    for(let i = arr.length - 1; i > 0; i--)
    {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

const getPlayerCount = () =>
{
    const node = document.getElementById("playerCount") as HTMLSelectElement | null;
    const value = parseInt(node?.value ?? "4");
    return isNaN(value) ? 4 : value;
}

const buildEventList = () : Event[] =>
{
    const eventList : Event[] = [];

    const numPlayers = getPlayerCount();
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

    return eventList;
}

const showEvent = (displayNode:HTMLElement, eventList:Event[], eventNum:number) =>
{
    const invalidEventNum = eventNum < 0 || eventNum >= eventList.length;
    if(invalidEventNum)
    {
        displayNode.innerHTML = "<p style='text-align:center;font-weight:bold;'>Sorry, something went wrong, or we're out of events.</p>";
        return;
    }

    const ev:Event = eventList[eventNum];
    displayNode.innerHTML = `<div class="event"><h3>${ev.header}</h3><span class="roundNumber">(Round ${(eventNum + 1)})</span><p>${ev.text}</p><p class="takeAction">${ev.action}</p></div>`;
}

window.addEventListener("load", () =>
{
    const button = document.getElementById("eventButton");
    const displayNode = document.getElementById("curEventDisplay");
    if(!button || !displayNode) { console.error("[Epic Medics] The page is missing #eventButton or #curEventDisplay."); return; }

    let eventList : Event[] = [];
    let eventNum = -1;

    button.addEventListener("click", () =>
    {
        // the first click rolls the scenario; every later click advances it
        if(eventList.length <= 0)
        {
            eventList = buildEventList();
            eventNum = -1;
            button.innerHTML = "Next Event!";
        }

        eventNum++;
        showEvent(displayNode, eventList, eventNum);
    });
})
