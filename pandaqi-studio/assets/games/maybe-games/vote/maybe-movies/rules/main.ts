import convertCanvasToImageMultiple from "js/pq_games/layout/canvas/convertCanvasToImageMultiple";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import Point from "js/pq_games/tools/geometry/point";
import Bounds from "js/pq_games/tools/numbers/bounds";
import fromArray from "js/pq_games/tools/random/fromArray";
import shuffle from "js/pq_games/tools/random/shuffle";
import InteractiveExampleGenerator from "js/pq_rulebook/examples/interactiveExampleGenerator";
import InteractiveExampleSimulator from "js/pq_rulebook/examples/interactiveExampleSimulator";
import Card from "../game/card";
import CardPicker from "../game/cardPicker";
import VotePicker from "../game/votePicker";
import { CONFIG } from "../shared/config";
import { VoteType } from "../shared/dict";


class Hand
{
    cards: Card[] = []

    getCards() { return this.cards.slice(); }
    fill(num:number, options:Card[])
    {
        shuffle(options);
        this.addCards(options.splice(0, num));
        return this;
    }

    addCard(c:Card, flipped = false) 
    { 
        this.cards.push(c);
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
        this.getAtIndex(this.cards.indexOf(c), true);
        return this;
    }

    removeCards(cards:Card[])
    {
        for(const c of cards)
        {
            this.removeCard(c);
        }
        return this;
    }

    getAtIndex(idx:number, remove = false)
    {
        if(idx < 0) { return null; }
        const card = this.cards[idx];
        if(remove) { this.cards.splice(idx, 1); }
        return card;
    }

    popCard()
    {
        if(this.count() <= 0) { return null; }
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

    getTacticalVote(proposal:Hand, remove = false)
    {
        if(this.count() <= 0) { return null; }

        const proposalIcons = proposal.getIconDistribution();
        const voteFreqs = this.getVoteFrequencies();
        const dontHaveNoVotes = voteFreqs[VoteType.NO] <= 0;
        const dontHaveYesVotes = voteFreqs[VoteType.YES] <= 0;
        
        const noProbIfMatch = 0.225; 
        const yesProbIfNoMatch = 0.075; // very low, it USUALLY only makes sense to vote YES if we are helping fund the movie

        // check which of our cards matches icons
        const optionsMatching = [];
        for(const card of this.cards)
        {
            if(card.subType != VoteType.YES) { continue; }

            const myIcons = card.getIconsAsList();
            let numMatchingIcons = 0;
            for(const key of myIcons)
            {
                if(proposalIcons[key] > 0) { numMatchingIcons++; proposalIcons[key]--; }
            }

            if(numMatchingIcons <= 0) { continue; }
            optionsMatching.push(card);
        }

        let finalCard : Card;
        const useMatchingOption = (optionsMatching.length > 0) && Math.random() > noProbIfMatch;
        if(useMatchingOption) {
            finalCard = fromArray(optionsMatching);
        } else {
            let voteSubType = (Math.random() <= yesProbIfNoMatch) ? VoteType.YES : VoteType.NO;
            if(dontHaveNoVotes) { voteSubType = VoteType.YES; }
            if(dontHaveYesVotes) { voteSubType = VoteType.NO; }

            const options = [];
            for(const card of this.cards)
            {
                if(card.subType != voteSubType) { continue; }
                options.push(card);
            }
            finalCard = fromArray(options);
        }

        if(remove) { this.removeCard(finalCard); }
        return finalCard;
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

    isSuccess(proposal:Hand)
    {
        const iconsPlayed = this.getIconDistribution(true);
        const iconsNeeded = proposal.getIconDistribution();

        // first match raw icon for icon
        const iconsLeftToMatch : string[] = [];
        for(const [icon,freqNeeded] of Object.entries(iconsNeeded))
        {
            if(!iconsPlayed[icon]) { iconsPlayed[icon] = 0; }

            const freqPlayed = iconsPlayed[icon];
            const freqChange = Math.min(freqNeeded, freqPlayed);
            iconsNeeded[icon] -= freqChange;
            iconsPlayed[icon] -= freqChange;

            const iconsNeededRemaining = (freqNeeded - freqChange);
            for(let i = 0; i < iconsNeededRemaining; i++)
            {
                iconsLeftToMatch.push(icon);
            }
        }

        // if no icons left to match, it's a success
        if(iconsLeftToMatch.length <= 0) { return true; }

        let numWildcardSetsAvailable = 0;
        if(CONFIG.rulebook.useWildcardSetsRule)
        {
            const wildcardSetSize = CONFIG.rulebook.numIconsNeededForWildcard ?? 3;
            for(const [icon,freqRemaining] of Object.entries(iconsPlayed))
            {
                if(freqRemaining <= 0) { continue; } // no, negative wildcard sets don't count, too hard :p
                numWildcardSetsAvailable += Math.floor(freqRemaining / wildcardSetSize);
            }
        }

        return numWildcardSetsAvailable >= iconsLeftToMatch.length;
    }

    count()
    {
        return this.cards.length;
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
    
    getTotalProfit() : number
    {
        let profit = 0;
        for(const card of this.cards)
        {
            profit += card.movieDetails.profit;
        }
        return profit;
    }

    getIconDistribution(checkVoteType = false) : Record<string,number>
    {
        const dict = {};
        for(const card of this.cards)
        {
            const icons = card.getIconsAsList();
            
            let change = 1; 
            if(checkVoteType)
            {
                change = (card.subType == VoteType.NO) ? -1 : 1;
            }
            
            for(const icon of icons)
            {
                if(!dict[icon]) { dict[icon] = 0; }
                dict[icon] += change;
            }
        }
        return dict;
    }

    getScore(moviesMade:Hand) : number
    {
        const iconDist = moviesMade.getIconDistribution();
        let score = 0;
        for(const card of this.cards)
        {
            const iconType = card.voteDetails.icon;
            score += iconDist[iconType] ?? 0;
        }
        return score;
    }

    async draw(sim:InteractiveExampleSimulator)
    {
        const canvases = [];
        for(const card of this.cards)
        {
            canvases.push(await card.draw(sim.getVisualizer()));
        }        
        return await convertCanvasToImageMultiple(canvases, true);
    }
}

interface SimulatorStats
{
    roundsPlayed: number,
    roundsPlayedPerGame?: number,

    numPlayers: number,
    numPlayersAvg?: number,

    proposalSuccess: number,
    proposalCardsNum: number,
    proposalContent: Record<string,number>,

    cardsRanOutMovie: number,
    cardsRanOutVotes: number,

    wonVotesNum: number,
    wonVotesContent: Record<string,number>,
    
    scoreIconDistribution: Record<string, number>,
    scoreDistribution: Record<number, number>,
    voteDiffs: Record<number, number>,

    proposalSuccessRate?: number,
    proposalAllNegativesRate?: number,
    proposalCardsNumAvg?: number,
    proposalContentDistribution?: Record<string, string>,
    wonVotesNumAvg?: number,
    wonVotesContentAvg?: Record<string, number>,
    
    scoreAvg?: number,
    
}

class SimulatorCustom
{
    registerInDict(dict, type, num = 1)
    {
        if(!dict[type]) { dict[type] = 0; }
        dict[type] += num;
    }

    trackGameEnd(sim:InteractiveExampleSimulator, rounds:number, playerScores:Hand[], moviesMade:Hand)
    {
        const numPlayers = playerScores.length;
        const stats:SimulatorStats = sim.getStats();

        stats.roundsPlayed += rounds;
        stats.numPlayers += numPlayers;

        for(const scoringCards of playerScores)
        {
            const resourceDist = scoringCards.getIconDistribution();
            for(const [key,freq] of Object.entries(resourceDist))
            {
                this.registerInDict(stats.scoreIconDistribution, key, freq / numPlayers);
            }

            const scoreFinal = scoringCards.getScore(moviesMade);
            this.registerInDict(stats.scoreDistribution, scoreFinal);
        }
    }

    // @NOTE: this is per ROUND
    trackResultStats(sim:InteractiveExampleSimulator, playerScores:Hand[])
    {
        const stats:SimulatorStats = sim.getStats();
        
        let totalWon = 0;
        const wonVotesContent:Record<string,number> = {};
        for(const hand of playerScores)
        {
            totalWon += hand.count();

            for(const card of hand.cards)
            {
                const icons = card.getIconsAsList();
                for(const icon of icons)
                {
                    this.registerInDict(wonVotesContent, icon);
                }
            }
        }

        for(const [key,data] of Object.entries(wonVotesContent))
        {
            this.registerInDict(stats.wonVotesContent, key, data / playerScores.length);
        }

        stats.wonVotesNum += totalWon / playerScores.length;
    }

    trackProposalStats(sim:InteractiveExampleSimulator, success:boolean, proposal:Hand)
    {
        const stats = sim.getStats();
        stats.proposalSuccess += success ? 1 : 0;
        stats.proposalCardsNum += proposal.count();

        for(const card of proposal.cards)
        {
            const icons = card.getIconsAsList();
            for(const icon of icons)
            {
                this.registerInDict(stats.proposalContent, icon);
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
    // prepare all options and settings (random cards, 5/5 vote split YES/NO)
    const numPlayers = CONFIG.rulebook.numPlayerBounds.randomInteger();
    const allCards = shuffle(sim.getPicker("card").get().slice());
    
    const allVotes = shuffle(sim.getPicker("vote").get().slice());
    const playerHands : Hand[] = [];
    
    // the votes in hand + the collected votes ("score") of the player
    const dealDeck = CONFIG.rulebook.dealEntireVotesDeckAtStart;
    if(dealDeck)
    {
        // this just deals the deck and ignores remaining cards
        const numVotesPerPlayer = Math.floor(allVotes.length / numPlayers);
        for(let i = 0; i < numPlayers; i++)
        {
            const hand = new Hand();
            const votes = allVotes.splice(0, numVotesPerPlayer);
            hand.addCards(votes);
            playerHands.push(hand);
        }
    } else {
        // this adds a 50%/50% YES/NO split for each player, then shuffles and deals randomly
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
    
        for(let i = 0; i < numPlayers; i++)
        {
            const cardsTemp = fairVotes.splice(0, numStartingVotes);
            playerHands.push(new Hand().addCards(cardsTemp));
    
            // for this game, we need to accurately track the vote deck too, so do that
            for(const vote of cardsTemp)
            {
                allVotes.splice(allVotes.indexOf(vote), 1);
            }
        }
    }

    const playerScores : Hand[] = [];
    for(let i = 0; i < numPlayers; i++)
    {
        playerScores.push(new Hand());
    }

    const market = new Hand();
    const moviesMade = new Hand();

    sim.callCustom("trackStartingState", [playerHands]);

    // actually play the game; repeat rounds until done
    let activePlayer = 0;
    let round = 0;
    let votesLeftToPlay = true;
    while(votesLeftToPlay)
    {
        const newCardsNeededForMarket = (CONFIG.rulebook.marketSize - market.count());
        if(allCards.length < newCardsNeededForMarket)
        {
            sim.stats.cardsRanOutMovie++;
            break;
        }

        for(let i = 0; i < newCardsNeededForMarket; i++)
        {
            market.addCard(allCards.pop());
        }

        // display state of game at round start
        sim.print("In this example, assume we are player " + (activePlayer + 1) + ". It's our turn and it's round " + (round + 1) + " of the game.");
        sim.print("The <strong>market</strong> contains the following cards:");
        await sim.listImages(market);

        // display mission proposal
        sim.print("You use them to propose the <strong>following movie</strong>."); 
        const proposalBounds = new Bounds(CONFIG.rulebook.minProposalSize, numPlayers);
        const proposal = new Hand();
        proposal.addCards( market.getRandomMultiple(proposalBounds.randomInteger(), true) );
        await sim.listImages(proposal);

        // display voting
        sim.print("Everyone <strong>votes</strong> on it. YES-votes add their icons to the total; NO-votes remove theirs. The results are:");
        const votes = new Hand();
        for(const hand of playerHands)
        {
            votes.addCard(hand.getTacticalVote(proposal, true));
        }
        await sim.listImages(votes);

        const tempPlayerScores : Hand[] = [];
        for(let i = 0; i < numPlayers; i++)
        {
            tempPlayerScores.push(new Hand());
        }

        // calculate, display, and handle the results
        const movieSuccess = votes.isSuccess(proposal);
        const profit = proposal.getTotalProfit();

        sim.callCustom("trackProposalStats", [movieSuccess, proposal]);

        let votesScoredFromPlayed = [];
        if(movieSuccess) {
            sim.print("The cost is <strong>matched</strong> ( = at least the icons required are played), so the <strong>movie is made!</strong>");
            sim.print("This movie's profit is <strong>" + profit + "</strong>. Grab that many Votes (from this round and pool) and distribute fairly over <strong>all YES-voters</strong>. Leftover votes go to active player.");

            let votesToDistribute = [];
            const votesCanBePaidFromCardsPlayedAlone = profit <= votes.count();
            if(votesCanBePaidFromCardsPlayedAlone) {
                votesScoredFromPlayed = votes.getRandomMultiple(profit);
                votesToDistribute = votesScoredFromPlayed.slice();
            } else {
                votesToDistribute = votes.getRandomMultiple(votes.count());
                let votesRanOut = false;
                while(votesToDistribute.length < profit)
                {
                    if(allVotes.length <= 0) { votesRanOut = true; break; }
                    votesToDistribute.push(allVotes.pop());
                }

                if(votesRanOut)
                {
                    sim.stats.cardsRanOutVotes++;
                    break;
                }
            }
            shuffle(votesToDistribute);

            // yes voters get fair share
            const yesVoters = votes.getVotersWith(VoteType.YES);
            const numPerPlayer = Math.floor(profit / yesVoters.length);
            for(const voter of yesVoters)
            {
                tempPlayerScores[voter].addCards(votesToDistribute.splice(0, numPerPlayer));
            }

            // active player gets whatever remains (too)
            tempPlayerScores[activePlayer].addCards(votesToDistribute);

        } else {
            sim.print("The cost is <strong>not matched</strong> ( = too few matching icons played), so the <strong>movie fails!</strong>.");
            sim.print("Each NO-voter scores <strong>their own vote</strong>.");

            const noVoters = votes.getVotersWith(VoteType.NO);
            for(const voter of noVoters)
            {
                const card = votes.getAtIndex(voter);
                tempPlayerScores[voter].addCard(card);
                votesScoredFromPlayed.push(card);
            }
        }

        // make the temporary scores final (they're only temporary for simulation stat tracking)
        sim.callCustom("trackResultStats", [tempPlayerScores]);
        for(let i = 0; i < numPlayers; i++)
        {
            playerScores[i].addCards( tempPlayerScores[i].getCards() );
        }

        // make sure we properly track remaining votes, then give them back to pool
        votes.removeCards(votesScoredFromPlayed);
        allVotes.unshift(...votes.cards);

        // move the movie into Movies Made, put rest back into deck
        sim.print("You <strong>pick 1 card</strong> from the proposal to <strong>add to Movies Made</strong> (which determines scoring per icon at the end). Remaining cards are discarded.");

        const movieMadeCards = proposal.getRandomMultiple(CONFIG.rulebook.numCardsToMovieMade, true);
        moviesMade.addCards(movieMadeCards);
        allCards.unshift(...proposal.cards);

        // report back how the round ends for our active player
        const weScoredSomething = playerScores[activePlayer].count();
        if(weScoredSomething) {
            sim.print("Your final scored votes look as follows:");
            await sim.listImages(playerScores[activePlayer]);
        } else {
            sim.print("You scored no votes this round. Next round!");
        }

        // continue to next player
        // (if not simulating, just stop after one iteration)
        activePlayer = (activePlayer + 1) % numPlayers;
        round++;
        votesLeftToPlay = playerHands[activePlayer].count() > 0;
        
        if(sim.displaySingleTurn()) { votesLeftToPlay = false; } 
    }

    sim.callCustom("trackGameEnd", [round, playerScores, moviesMade]);
}


const callbackInitStats = () =>
{
    return {
        numPlayers: 0,
        proposalSuccess: 0,
        proposalCardsNum: 0,
        proposalContent: {},
        wonVotesNum: 0, // per player, per round
        wonVotesContent: {},
        cardsRanOutMovie: 0,
        cardsRanOutVotes: 0,
        roundsPlayed: 0,
        scoreIconDistribution: {},
        scoreDistribution: {},
        voteDiffs: {}
    } as SimulatorStats
}

const callbackFinishStats = (sim:InteractiveExampleSimulator) =>
{
    const stats:SimulatorStats = sim.getStats();
    const numTurns = stats.roundsPlayed;
    const iters = sim.getIterations();

    stats.proposalSuccessRate = stats.proposalSuccess / numTurns;
    stats.proposalCardsNumAvg = stats.proposalCardsNum / numTurns;
    // stats.proposalContentDistribution?

    stats.wonVotesNumAvg = stats.wonVotesNum / numTurns;
    stats.wonVotesContentAvg = {};
    for(const [key,data] of Object.entries(stats.wonVotesContent))
    {
        stats.wonVotesContentAvg[key] = data / numTurns;
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

const SIMULATION_ENABLED = false;
const SIMULATION_ITERATIONS = 1000;
const SHOW_FULL_GAME = false;

const gen = new InteractiveExampleGenerator({
    id: "turn",
    callback: generate,
    config: CONFIG,
    itemSize: new Point(CONFIG.rulebook.cardSize),
    pickers: { card: CardPicker, vote: VotePicker },
    simulateConfig: {
        enabled: SIMULATION_ENABLED,
        iterations: SIMULATION_ITERATIONS,
        showFullGame: SHOW_FULL_GAME, // interactive examples show only 1 turn/round by default
        callbackInitStats,
        callbackFinishStats,
        custom: new SimulatorCustom()
    }
})