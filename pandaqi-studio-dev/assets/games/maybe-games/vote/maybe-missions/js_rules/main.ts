import ResourceLoader from "js/pq_games/layout/resources/resourceLoader";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import Point from "js/pq_games/tools/geometry/point";
import InteractiveExample from "js/pq_rulebook/examples/interactiveExample";
import CardPicker from "../js_game/cardPicker";
import CONFIG from "../js_shared/config";
import VotePicker from "../js_game/votePicker";
import Card from "../js_game/card";
import { MissionType, VoteType } from "../js_shared/dict";
import shuffle from "js/pq_games/tools/random/shuffle";
import fromArray from "js/pq_games/tools/random/fromArray";
import Bounds from "js/pq_games/tools/numbers/bounds";
import convertCanvasToImageMultiple from "js/pq_games/layout/canvas/convertCanvasToImageMultiple";
import InteractiveExampleGenerator from "js/pq_rulebook/examples/interactiveExampleGenerator";
import InteractiveExampleSimulator from "js/pq_rulebook/examples/interactiveExampleSimulator";


class Hand
{
    cards: Card[] = []
    flipped: boolean[] = []

    empty()
    {
        this.cards = [];
        this.flipped = [];
    }

    fill(num:number, options:Card[])
    {
        shuffle(options);
        this.addCards(options.splice(0, num));
        return this;
    }

    addCard(c:Card, flipped = false) 
    { 
        this.cards.push(c);
        this.flipped.push(flipped);
        return this;
    }

    addCards(cards:Card[])
    {
        for(const c of cards)
        {
            this.addCard(c);
        }
        return this;
    }

    removeCard(c:Card)
    {
        const idx = this.cards.indexOf(c);
        if(idx < 0) { return null; }
        this.cards.splice(idx, 1);
        this.flipped.splice(idx, 1);
        return this;
    }

    popCard()
    {
        if(this.count() <= 0) { return null; }
        this.flipped.pop();
        return this.cards.pop();
    }

    getRandom()
    {
        return fromArray(this.cards);
    }

    getRandomMultiple(num:number, remove = false)
    {
        const copy = this.cards.slice();
        shuffle(copy);
        const arr = copy.slice(0, num);
        if(remove)
        {
            for(const elem of arr) { this.removeCard(elem); }
        }
        return arr;
    }

    getVoteFrequencies()
    {
        const freqs = { [VoteType.YES]: 0, [VoteType.NO]: 0 };
        for(const card of this.cards)
        {
            if(!card.isVote()) { continue; }
            freqs[card.subType]++;
        }
        return freqs;
    }

    getVoteTypeDiff()
    {
        const freqs = this.getVoteFrequencies();
        return freqs[VoteType.YES] - freqs[VoteType.NO];
    }

    isSuccess()
    {
        const freqs = this.getVoteFrequencies();
        if(CONFIG.rulebook.equalityWinsMission) { return freqs[VoteType.YES] >= freqs[VoteType.NO] };
        return freqs[VoteType.YES] > freqs[VoteType.NO];
    }

    isAllNegatives()
    {
        const freqs = this.getVoteFrequencies();
        return freqs[VoteType.YES] <= 0;
    }

    count()
    {
        return this.cards.length;
    }

    getPlayerOrder(descending = false, filter:VoteType = null)
    {
        const players = this.getVotersWith(filter);

        const arrTemp = [];
        for(const player of players)
        {
            arrTemp.push({ obj: this.cards[player], idx: player });
        }
        arrTemp.sort((a,b) => {
            if(descending) { return b.obj.num - a.obj.num; }
            return a.obj.num - b.obj.num;
        });

        const arr = [];
        for(const elem of arrTemp)
        {
            arr.push(elem.idx);
        }
        return arr;
    }

    getPlayerOrderString(descending = false, filter:VoteType = null)
    {
        const order = this.getPlayerOrder(descending, filter);
        const arr = [];
        for(const idx of order)
        {
            arr.push("Player " + (idx + 1));
        }
        return arr.join(" > ");
    }

    getVotersAll()
    {
        const arr = [];
        for(let i = 0; i < this.count(); i++)
        {
            arr.push(i);
        }
        return arr;
    }

    getVotersWith(t:VoteType = null)
    {
        if(t == null) { return this.getVotersAll(); }

        const arr = [];
        for(let i = 0; i < this.count(); i++)
        {
            if(this.cards[i].subType != t) { continue; }
            arr.push(i);
        }
        return arr;
    }

    getResourceDistribution() : Record<string,number>
    {
        const dict = {};
        for(let i = 0; i < this.count(); i++)
        {
            const card = this.cards[i];
            const isFlipped = this.flipped[i];
            const icons = isFlipped ? card.resources.bad : card.resources.good;
            for(const icon of icons)
            {
                if(!dict[icon.type]) { dict[icon.type] = 0; }
                dict[icon.type] += icon.cross ? -1 : 1;
            }
        }
        return dict;
    }

    getScore() : number
    {
        const dict = this.getResourceDistribution();

        let leastOccurring = null;
        let leastFreq = Infinity;

        let mostOccurring = null;
        let mostFreq = -Infinity;

        for(const [key,freq] of Object.entries(dict))
        {
            if(freq < leastFreq) { leastOccurring = key; leastFreq = freq; }
            if(freq > mostFreq) { mostOccurring = key; mostFreq = freq; }
        }

        let score = 0;
        for(const [key,freq] of Object.entries(dict))
        {
            if(key == leastOccurring) { continue; }
            if(key == mostOccurring) { score += 2*freq; continue; }
            score += freq; 
        }

        return score;
    }

    async draw(vis:MaterialVisualizer)
    {
        const canvases = [];
        for(const card of this.cards)
        {
            canvases.push(await card.draw(vis));
        }
        
        const images = await convertCanvasToImageMultiple(canvases, true);
        for(let i = 0; i < this.count(); i++)
        {
            if(!this.flipped[i]) { continue; }
            images[i].style.transform = "rotate(180deg)";
        }
        return images;
    }
}

interface SimulatorStats
{
    proposalSuccess: number,
    proposalAllNegatives: number,
    proposalCardsNum: number,
    proposalContent: { good: Record<string,number>, bad: Record<string,number> },
    wonCardsNum: number,
    wonCardsContent: Record<string,number>,
    cardsRanOutMaster: number,
    cardsRanOutMission: number,
    roundsPlayed: number,
    numPlayers: number,
    scoreResourceDistribution: Record<string, number>,
    scoreDistribution: Record<number, number>,
    voteDiffs: Record<number, number>,

    proposalSuccessRate?: number,
    proposalAllNegativesRate?: number,
    proposalCardsNumAvg?: number,
    proposalContentDistribution?: Record<string, string>,
    wonCardsNumAvg?: number,
    wonCardsContentAvg?: Record<string, number>,
    roundsPlayedPerGame?: number,
    scoreAvg?: number,
    numPlayersAvg?: number,
}

class SimulatorCustom
{
    registerInDict(dict, type, num = 1)
    {
        if(!dict[type]) { dict[type] = 0; }
        dict[type] += num;
    }

    trackGameEnd(sim:InteractiveExampleSimulator, rounds:number, playerHands:Hand[], playerScores:Hand[])
    {
        const numPlayers = playerScores.length;
        const stats = sim.getStats();

        stats.roundsPlayed += rounds;
        stats.numPlayers += numPlayers;

        for(const scoringCards of playerScores)
        {
            const resourceDist = scoringCards.getResourceDistribution();
            for(const [key,freq] of Object.entries(resourceDist))
            {
                this.registerInDict(stats.scoreResourceDistribution, key, freq / numPlayers);
            }

            const scoreFinal = scoringCards.getScore();
            this.registerInDict(stats.scoreDistribution, scoreFinal);
        }
    }

    trackDisaster(sim:InteractiveExampleSimulator, masterCards:Card[], missionCards:Card[])
    {
        const stats = sim.getStats();
        if(masterCards.length <= 0) { stats.cardsRanOutMaster++; }
        if(missionCards.length <= CONFIG.rulebook.marketSize) { stats.cardsRanOutMission++; }
    }

    trackResultStats(sim:InteractiveExampleSimulator, playerScores:Hand[])
    {
        const stats = sim.getStats();
        let totalWon = 0;

        const wonCardsContent:Record<string,number> = {};
        for(const hand of playerScores)
        {
            totalWon += hand.count();

            for(let i = 0; i < hand.count(); i++)
            {
                const card = hand.cards[i];
                const isFlipped = hand.flipped[i];
                const icons = isFlipped ? card.resources.bad : card.resources.good;
                for(const icon of icons)
                {
                    if(icon.cross) { this.registerInDict(wonCardsContent, icon.type, -1); }
                    else { this.registerInDict(wonCardsContent, icon.type, +1); }
                }
            }
        }

        for(const [key,data] of Object.entries(wonCardsContent))
        {
            this.registerInDict(stats.wonCardsContent, key, data / playerScores.length);
        }

        stats.wonCardsNum += totalWon / playerScores.length;
    }

    trackProposalStats(sim:InteractiveExampleSimulator, success:boolean, proposal:Hand, votes:Hand)
    {
        const stats = sim.getStats();
        stats.proposalSuccess += success ? 1 : 0;
        stats.proposalAllNegatives += votes.isAllNegatives() ? 1 : 0;
        stats.proposalCardsNum += proposal.count();

        for(const card of proposal.cards)
        {
            const icons = [card.resources.good, card.resources.bad].flat();
            for(const icon of icons)
            {
                if(icon.cross) { this.registerInDict(stats.proposalContent.bad, icon.type); }
                else { this.registerInDict(stats.proposalContent.good, icon.type); }
            }
        }
    }

    trackStartingState(sim:InteractiveExampleSimulator, playerHands:Hand[])
    {
        const stats = sim.getStats();
        for(const hand of playerHands)
        {
            this.registerInDict(stats.voteDiffs, Math.abs(hand.getVoteTypeDiff()), 1);
        }
    }
}

async function generate(sim:InteractiveExampleSimulator)
{
    // prepare all options and settings
    const numPlayers = CONFIG.rulebook.numPlayerBounds.randomInteger();
    const allCards = sim.getPicker("card").get().slice();
    const allMissionCards = [];
    const allMasterCards = [];
    for(const card of allCards)
    {
        if(card.subType == MissionType.MASTER) { allMasterCards.push(card); }
        else { allMissionCards.push(card); }
    }
    shuffle(allMissionCards);
    shuffle(allMasterCards);

    const allVotes = sim.getPicker("vote").get().slice();
    const allVotesYes = [];
    const allVotesNo = [];
    for(const vote of allVotes)
    {
        if(vote.subType == VoteType.YES) { allVotesYes.push(vote); }
        else { allVotesNo.push(vote); }
    }
    shuffle(allVotesYes);
    shuffle(allVotesNo);

    const numStartingVotes = CONFIG.rulebook.numStartingVotesPerPlayer;
    const numVotesPerType = numPlayers*(0.5*numStartingVotes);
    const fairVotes = [];
    for(let i = 0; i < numVotesPerType; i++)
    {
        fairVotes.push(allVotesYes.pop());
        fairVotes.push(allVotesNo.pop());
    }
    shuffle(fairVotes);

    // the votes in hand + the collected cards ("score") of the player
    const playerHands : Hand[] = [];
    for(let i = 0; i < numPlayers; i++)
    {
        const cardsTemp = fairVotes.splice(0, numStartingVotes);
        playerHands.push(new Hand().addCards(cardsTemp));
    }

    const playerScores : Hand[] = [];
    for(let i = 0; i < numPlayers; i++)
    {
        playerScores.push(new Hand());
    }

    const market = new Hand();

    sim.callCustom("trackStartingState", [playerHands]);

    // actually play the game; repeat rounds until done
    let activePlayer = 0;
    let round = 0;
    while(playerHands[activePlayer].count() > 0)
    {
        const newCardsNeededForMarket = (CONFIG.rulebook.marketSize - market.count());
        if(allMasterCards.length <= 0 || allMissionCards.length <= newCardsNeededForMarket) 
        { 
            sim.callCustom("trackDisaster", [allMasterCards, allMissionCards]); 
            break; 
        }

        for(let i = 0; i < newCardsNeededForMarket; i++)
        {
            market.addCard(allMissionCards.pop());
        }

        // display state of game at round start
        sim.print("In this example, assume we are player 1. It's our turn and it's the start of the game. For simplicity's sake, special powers on Master Cards are ignored.");
        sim.print("The <strong>market</strong> contains the following cards:");
        const masterCard = allMasterCards.pop();
        await sim.listImages(market);

        // display mission proposal
        sim.print("You use them to propose the <strong>following mission</strong>. You also draw a Master Card and add it.");    
        const proposalBounds = new Bounds(1, numPlayers);
        const proposal = new Hand();
        proposal.addCard(masterCard);
        proposal.addCards( market.getRandomMultiple(proposalBounds.randomInteger(), true) );
        await sim.listImages(proposal);
        proposal.removeCard(masterCard); // because it can't be DRAWN by any player from now on

        // display voting
        sim.print("Everyone <strong>votes</strong> on it. The results are:");
        const votes = new Hand();
        for(const hand of playerHands)
        {
            votes.addCard(hand.popCard());
        }
        await sim.listImages(votes);

        // handle collecting cards after mission is SUCCESS/FAIL
        const missionSuccess = votes.isSuccess();
        let playersDrawingCards = [];
        let winMasterCard = true;
        if(missionSuccess) {
            sim.print("There is no majority for NO, so the <strong>mission succeeds!</strong>");
            sim.print("All YES-voters collect a card in <strong>ascending</strong> order (low -> high). In this case: <strong>" + votes.getPlayerOrderString(false, VoteType.YES) + "</strong>. They point the green side up.");
            playersDrawingCards = votes.getPlayerOrder(false, VoteType.YES);
        } else {
            sim.print("The majority voted NO, so the <strong>mission fails</strong>.");

            const allNegatives = votes.isAllNegatives(); // all players voted NO, special situation
            if(allNegatives) {
                sim.print("Special case! All players voted NO, so <strong>everyone</strong> must collect a card in descending order. In this case: <strong>" + votes.getPlayerOrderString(true) + "</strong>. Point the red side up.");
                playersDrawingCards = votes.getPlayerOrder(true);
                winMasterCard = false;
            } else {
                sim.print("All YES-voters collect a card in <strong>descending</strong> order (high -> low). In this case: <strong>" + votes.getPlayerOrderString(true, VoteType.YES) + "</strong>. They point the red side up.");
                playersDrawingCards = votes.getPlayerOrder(true, VoteType.YES);
            }
        }

        sim.callCustom("trackProposalStats", [missionSuccess, proposal, votes]);

        // actually execute the game logic
        const tempPlayerScores = []; // to track ONLY the changes for ONE ROUND (not whole game)
        for(let i = 0; i < numPlayers; i++)
        {
            tempPlayerScores.push( new Hand() );
        }

        if(winMasterCard)
        {
            playerScores[activePlayer].addCard(masterCard, !missionSuccess);
            tempPlayerScores[activePlayer].addCard(masterCard, !missionSuccess);
        }

        let weDrewACard = false;
        for(const player of playersDrawingCards)
        {
            if(player == activePlayer) { weDrewACard = true; }
            const card = proposal.popCard();
            playerScores[player].addCard(card, !missionSuccess);
            tempPlayerScores[player].addCard(card, !missionSuccess);
            if(proposal.count() <= 0) { break; }
        }

        sim.callCustom("trackResultStats", [tempPlayerScores]);

        // report back how the round ends for our active player
        const masterCardResult = missionSuccess ? "green side up" : "red side up";
        let drawResult = "You drew a card this round.";
        if(!weDrewACard)
        {
            drawResult = "You didn't draw any card.";
            if(playersDrawingCards.includes(activePlayer)) { drawResult += " (Proposal empty before it was your turn.)"; }
            else { drawResult += " (You didn't vote YES.)"; }
        }

        if(winMasterCard) { sim.print("You get the Master Card with " + masterCardResult + ". " + drawResult); }
        else { sim.print("You don't get the Master Card because of all NOs. " + drawResult); }

        const activePlayerHasCards = playerScores[activePlayer].count() > 0;
        if(activePlayerHasCards) {
            sim.print("Your scored cards now look as follows:");
            await sim.listImages(playerScores[activePlayer]);
        } else {
            sim.print("And so you end the turn with no cards collected at all.");
        }

        // feed discarded cards back into deck
        allMissionCards.unshift(...proposal.cards);

        // continue to next player
        // (if not simulating, just stop after one iteration)
        activePlayer = (activePlayer + 1) % numPlayers;
        round++;
        if(!sim.enabled) { playerHands[activePlayer].empty(); } 
    }

    sim.callCustom("trackGameEnd", [round, playerHands, playerScores]);
}


const callbackInitStats = () =>
{
    return {
        numPlayers: 0,
        proposalSuccess: 0,
        proposalAllNegatives: 0,
        proposalCardsNum: 0,
        proposalContent: { good: {}, bad: {} },
        wonCardsNum: 0, // per player, per round
        wonCardsContent: {},
        cardsRanOutMaster: 0,
        cardsRanOutMission: 0,
        roundsPlayed: 0,
        scoreResourceDistribution: {},
        scoreDistribution: {},
        voteDiffs: {}
    }
}

const callbackFinishStats = (sim:InteractiveExampleSimulator) =>
{
    const stats:SimulatorStats = sim.getStats();
    const numTurns = stats.roundsPlayed;
    const iters = sim.getIterations();

    stats.proposalSuccessRate = stats.proposalSuccess / numTurns;
    stats.proposalAllNegativesRate = stats.proposalAllNegatives / numTurns;
    stats.proposalCardsNumAvg = stats.proposalCardsNum / numTurns;
    stats.proposalContentDistribution = {};
    for(const key of Object.keys(stats.proposalContent.good))
    {
        const freqGood = stats.proposalContent.good[key];
        const freqBad = stats.proposalContent.bad[key];
        const total = freqGood + freqBad;
        const rates = Math.round((freqGood / total)*100) + "%/" + Math.round((freqBad / total)*100) + "%";
        stats.proposalContentDistribution[key] = rates;
    }

    stats.wonCardsNumAvg = stats.wonCardsNum / numTurns;
    stats.wonCardsContentAvg = {};
    for(const [key,data] of Object.entries(stats.wonCardsContent))
    {
        stats.wonCardsContentAvg[key] = data / numTurns;
    }

    // these stats are per GAME, so should be divided by iterations not turns
    // (because they're only registered once per game, of course)
    stats.roundsPlayedPerGame = stats.roundsPlayed / iters;
    stats.numPlayersAvg = stats.numPlayers / iters;

    let scoreAvg = 0;
    for(const [key,freq] of Object.entries(stats.scoreDistribution))
    {
        scoreAvg += parseInt(key) * freq;
    }
    stats.scoreAvg = scoreAvg / stats.numPlayersAvg / iters;
}

const SIMULATION_ENABLED = true;
const SIMULATION_ITERATIONS = 500;

const gen = new InteractiveExampleGenerator({
    id: "turn",
    callback: generate,
    config: CONFIG,
    itemSize: new Point(CONFIG.rulebook.cardSize),
    pickers: { card: CardPicker, vote: VotePicker },
    simulateConfig: {
        enabled: SIMULATION_ENABLED,
        iterations: SIMULATION_ITERATIONS,
        callbackInitStats,
        callbackFinishStats,
        custom: new SimulatorCustom()
    }
})