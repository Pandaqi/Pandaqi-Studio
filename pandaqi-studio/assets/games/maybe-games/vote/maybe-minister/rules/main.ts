import convertCanvasToImageMultiple from "js/pq_games/layout/canvas/convertCanvasToImageMultiple";
import Bounds from "js/pq_games/tools/numbers/bounds";
import fromArray from "js/pq_games/tools/random/fromArray";
import shuffle from "js/pq_games/tools/random/shuffle";
import InteractiveExampleSimulator from "js/pq_rulebook/examples/interactiveExampleSimulator";
import Card from "../game/card";
import { CONFIG } from "../shared/config";
import { CardSubType, DYNAMIC_OPTIONS, DecreeType, LAWS, LawType, VoteType } from "../shared/dict";


class Hand
{
    cards: Card[] = []
    flipped: boolean[] = []
    storedVotes: Card[][] = []

    getCards() { return this.cards.slice(); }
    fill(num:number, options:Card[])
    {
        shuffle(options);
        this.addCards(options.splice(0, num));
        return this;
    }

    addCard(c:Card, flipped = false, storedVotes:Card[] = []) 
    { 
        if(!c)
        {
            console.error("Trying to add nonexisting card to hand", this, c);
            return this;
        }

        this.cards.push(c);
        this.flipped.push(flipped);
        this.storedVotes.push(storedVotes.slice());
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
        return this.getAtIndex(this.cards.indexOf(c), true);
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

        if(remove) 
        { 
            this.cards.splice(idx, 1); 
            this.flipped.splice(idx, 1);
            this.storedVotes.splice(idx, 1);
        }

        return card;
    }

    popCard()
    {
        return this.getAtIndex(this.count() - 1, true);
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
        if(CONFIG.rulebook.equalityWinsProposal) { return freqs[VoteType.YES] >= freqs[VoteType.NO]; }
        return freqs[VoteType.YES] > freqs[VoteType.NO];
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

    getVotersWith(t:VoteType)
    {
        const arr = [];
        for(let i = 0; i < this.count(); i++)
        {
            if(this.cards[i].subType != t) { continue; }
            arr.push(i);
        }
        return arr;
    }

    getCardsOfSubType(st:CardSubType) : Card[]
    {
        const arr = [];
        for(const card of this.cards)
        {
            if(card.subType != st) { continue; }
            arr.push(card);
        }
        return arr;
    }

    countSupportIcons()
    {
        const supportCards = this.getCardsOfSubType(DecreeType.SUPPORT);
        
        let num = 0;
        for(const card of supportCards)
        { 
            const idx = this.cards.indexOf(card);
            const isFlipped = this.flipped[idx];
            const dir = isFlipped ? -1 : 1;
            num += dir * card.getSideIfFlipped(isFlipped).length;
        }
        return num;
    }

    getAllStoredVotes()
    {
        const arr = [];
        for(let i = 0; i < this.count(); i++)
        {
            arr.push(this.storedVotes[i]);
        }
        return arr.flat();
    }

    countStoredVotes()
    {
        return this.getAllStoredVotes().length;
    }

    getRandomVote(remove = false)
    {
        const allVotes = this.getAllStoredVotes();
        if(allVotes.length <= 0) { return null; }

        const randVote = fromArray(allVotes);

        if(remove)
        {
            for(let i = 0; i < this.count(); i++)
            {
                const sv = this.storedVotes[i];
                if(!sv.includes(randVote)) { continue; }
                const idx = sv.indexOf(randVote);
                sv.splice(idx, 1);
                break;
            }
        }

        return randVote;
    }

    getVoteStorageLeftDistribution()
    {
        const dict:Record<number, number> = {};
        for(let i = 0; i < this.count(); i++)
        {
            const storage = this.cards[i].voteStorage;
            const votesHeld = this.storedVotes[i];
            dict[i] = (storage - votesHeld.length);
        }
        return dict;
    }

    storeVote(vote:Card)
    {
        const dict = this.getVoteStorageLeftDistribution();
        for(const [idx,spaceLeft] of Object.entries(dict))
        {
            if(spaceLeft <= 0) { continue; }
            this.storedVotes[idx].push(vote);
        }
    }

    countVoteStorageLeft()
    {
        const dict = this.getVoteStorageLeftDistribution();
        let num = 0;
        for(const spaceLeft of Object.values(dict))
        {
            num += spaceLeft;
        }
        return num;
    }

    getPlayerOrder(descending = false)
    {
        const players = this.getVotersAll();

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

    getPlayerOrderString(descending = false)
    {
        const order = this.getPlayerOrder(descending);
        const arr = [];
        for(const idx of order)
        {
            arr.push("Player " + (idx + 1));
        }
        return arr.join(" > ");
    }

    getResourceDistribution() : Record<string,number>
    {
        const dict = {};
        for(let i = 0; i < this.count(); i++)
        {
            const card = this.cards[i];
            const isFlipped = this.flipped[i];
            const icons = card.getSideIfFlipped(isFlipped);
            const change = isFlipped ? -1 : 1;
            for(const icon of icons)
            {
                if(!dict[icon]) { dict[icon] = 0; }
                dict[icon] += change;
            }
        }
        return dict;
    }

    getScore(lawsEnacted:Hand, isActivePlayer:boolean = false) : number
    {
        // collect only laws that matter
        const scoringLaws = [];
        for(const law of lawsEnacted.getCards())
        {
            const data = law.getLawData();
            if(LAWS[data.key].type != LawType.SCORING) { continue; }
            scoringLaws.push(law);
        }

        const imageStringToKey = (s:string) =>
        {
            const idx = DYNAMIC_OPTIONS["%resourceImageStrings%"].indexOf(s);
            return DYNAMIC_OPTIONS["%resource%"][idx];
        }

        const imageStringsToKeys = (s:string[]) =>
        {
            const arr = [];
            for(const elem of s) { arr.push(imageStringToKey(elem)); }
            return arr;
        }

        const dict = this.getResourceDistribution();
        let score = 0;

        //console.log(this, lawsEnacted, isActivePlayer);

        for(const law of scoringLaws)
        {
            const data = law.getLawData();
            const key = data.key;
            const values = data.replacements;
            
            if(key == "support_scoring") {
                score += this.getCardsOfSubType(DecreeType.SUPPORT).length;
            } else if(key == "support_total_scoring") {
                score += this.countSupportIcons();
            } else if(key == "vote_storage_scoring") {
                let num = 0;
                const comp = values["%comparison%"][0];
                const numCutoff = values["%numlow%"][0];
                for(const card of this.cards)
                {
                    if(comp == "at least" && card.voteStorage >= numCutoff) { num++; }
                    if(comp == "at most" && card.voteStorage <= numCutoff) { num++; }
                }
                score += num;
            } else if(key == "vote_stored_scoring") {
                let num = 0;
                const comp = values["%comparison%"][0];
                const numCutoff = values["%numlow%"][0];
                for(let i = 0; i < this.count(); i++)
                {
                    const storedVotes = this.storedVotes[i].length;
                    if(comp == "at least" && storedVotes >= numCutoff) { num++; }
                    if(comp == "at most" && storedVotes <= numCutoff) { num++; }
                }
                score += num;
            } else if(key == "vote_stored_none_scoring") {
                const sign = parseInt(values["%sign%"][0]);
                for(let i = 0; i < this.count(); i++)
                {
                    const storedVotes = this.storedVotes[i].length;
                    if(storedVotes <= 0) { score += sign; }
                }
            } else if(key == "num_cards_scoring") {
                const comp = values["%comparison%"][0];
                const numCutoff = values["%nummid%"][0];
                if(comp == "at least") { score += (this.count() >= numCutoff) ? 5 : 0; }
                if(comp == "at most") { score += (this.count() <= numCutoff) ? 5 : 0; }
            } else if(key == "active_player_scoring_bonus") {
                score += isActivePlayer ? 3 : 0;
            } else if(key == "active_player_scoring_penalty") {
                score += isActivePlayer ? -2 : 0;
            } else if(key == "resource_total_bonus") {
                const dict = this.getResourceDistribution();
                const comp = values["%comparison%"][0];
                const numCutoff = values["%numhigh%"][0];

                let total = 0;
                for(const [key,freq] of Object.entries(dict))
                {
                    total += freq;
                }

                if(comp == "at least") { score += (total >= numCutoff) ? 5 : 0; }
                if(comp == "at most") { score += (total <= numCutoff) ? 5 : 0; }
            } else if(key == "resource_diversity_bonus") {
                const diversity = Object.keys(dict).length;
                const totalNumIcons = DYNAMIC_OPTIONS["%resource%"].length;
                score += (diversity >= totalNumIcons) ? 5 : 0;
            } else if(key == "resource_diversity_penalty") {
                const numCutoff = values["%numlow%"][0];
                const diversity = Object.keys(dict).length;
                score += (diversity <= numCutoff) ? -3 : 0;
            } else if(key == "resource_trio_reward") {
                const resources = imageStringsToKeys(values["%resource%"]);
                const numTrios = Math.max( Math.min(dict[resources[0]] ?? 0, dict[resources[1]] ?? 0, dict[resources[2]] ?? 0), 0);
                const change = parseInt(values["%sign%"][0]);
                score += (numTrios * change); 
            } else if(key == "resource_pair_bonus") {
                const resources = imageStringsToKeys(values["%resource%"]);
                const numPairs = Math.max(Math.min(dict[resources[0]] ?? 0, dict[resources[1]] ?? 0), 0);
                score += (numPairs * 2);
            } else if(key == "resource_pair_penalty") {
                const resources = imageStringsToKeys(values["%resource%"]);
                const numPairs = Math.max(Math.min(dict[resources[0]] ?? 0, dict[resources[1]] ?? 0), 0);
                score += (numPairs * -1);
            } else if(key == "resource_points_bonus") {
                const resource = imageStringsToKeys(values["%resource%"])[0];
                const freq = Math.max(dict[resource] ?? 0, 0);
                score += (freq * 2);
            } else if(key == "resource_points_penalty") {
                const resource = imageStringsToKeys(values["%resource%"])[0];
                const freq = Math.max(dict[resource] ?? 0, 0);
                score += (freq * -1);
            } else if(key == "resource_total_specific_bonus") {
                const comp = values["%comparison%"][0];
                const numCutoff = values["%nummid%"][0];
                const resource = imageStringsToKeys(values["%resource%"])[0];
                const freq = dict[resource] ?? 0;
                if(comp == "at most") { score += (freq >= numCutoff) ? 5 : 0; }
                if(comp == "at least") { score += (freq <= numCutoff) ? 5 : 0; }
            }
            
            
            /* THIS ONE is near impossible to code this way, skip it; 
            } else if(key == "resource_exclusion") {
                const resources = imageStringsToKeys(values["%resource%"]);
                score += 
            }*/
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
    roundsPlayed: number,
    roundsPlayedPerGame?: number,

    numPlayers: number,
    numPlayersAvg?: number,

    proposalSuccess: number,
    proposalCardsNum: number,
    proposalContent: { good: Record<string,number>, bad: Record<string,number> },

    cardsRanOutDecree: number,
    cardsRanOutVotes: number,

    finalNumCards: number,
    finalNumCardsAvg?: number,
    finalNumVotes: number,
    finalNumVotesAvg?: number,
    finalNumLaws: number,
    finalNumLawsAvg?: number,

    wonCardsNum: number,
    wonCardsContent: Record<string,number>,
    wonVotesNum: number,
    wonVotesContent: Record<string,number>,
    
    scoreResourceDistribution: Record<string, number>,
    scoreDistribution: Record<number, number>,

    proposalSuccessRate?: number,
    proposalAllNegativesRate?: number,
    proposalCardsNumAvg?: number,
    proposalContentDistribution?: Record<string, string>,
    
    wonCardsNumAvg?: number,
    wonCardsContentAvg?: Record<string, number>,
    wonVotesNumAvg?: number,
    wonVotesContentAvg?: number,
    
    scoreAvg?: number,
    
}

class SimulatorCustom
{
    registerInDict(dict, type, num = 1)
    {
        if(!dict[type]) { dict[type] = 0; }
        dict[type] += num;
    }

    trackGameEnd(sim:InteractiveExampleSimulator, rounds:number, playerScores:Hand[], lawsEnacted:Hand)
    {
        const numPlayers = playerScores.length;
        const stats:SimulatorStats = sim.getStats();

        stats.roundsPlayed += rounds;
        stats.numPlayers += numPlayers;
        
        let numCards = 0;
        let numVotes = 0;
        for(const scoredCards of playerScores)
        {
            numCards += scoredCards.count();
            numVotes += scoredCards.countStoredVotes();
        }

        stats.finalNumCards += numCards / numPlayers;
        stats.finalNumVotes += numVotes / numPlayers;
        stats.finalNumLaws += lawsEnacted.count();

        for(const scoringCards of playerScores)
        {
            const resourceDist = scoringCards.getResourceDistribution();
            for(const [key,freq] of Object.entries(resourceDist))
            {
                this.registerInDict(stats.scoreResourceDistribution, key, freq / numPlayers);
            }

            const scoreFinal = scoringCards.getScore(lawsEnacted);
            this.registerInDict(stats.scoreDistribution, scoreFinal);
        }
    }

    // @NOTE: this is per ROUND
    trackResultStats(sim:InteractiveExampleSimulator, playerScores:Hand[])
    {
        const stats:SimulatorStats = sim.getStats();
        let totalWon = 0;

        const wonCardsContent:Record<string,number> = {};
        for(const hand of playerScores)
        {
            totalWon += hand.count();

            for(let i = 0; i < hand.count(); i++)
            {
                const card = hand.cards[i];
                const icons = card.getSideIfFlipped( hand.flipped[i] );
                let change = hand.flipped[i] ? -1 : 1;
                for(const icon of icons)
                {
                    this.registerInDict(wonCardsContent, icon, change);
                }
            }
        }

        for(const [key,data] of Object.entries(wonCardsContent))
        {
            this.registerInDict(stats.wonCardsContent, key, data / playerScores.length);
        }
        stats.wonVotesNum += totalWon / playerScores.length;
    }

    trackProposalStats(sim:InteractiveExampleSimulator, success:boolean, proposal:Hand)
    {
        const stats:SimulatorStats = sim.getStats();
        stats.proposalSuccess += success ? 1 : 0;
        stats.proposalCardsNum += proposal.count();

        for(const card of proposal.cards)
        {
            const iconsGood = card.getSideIfFlipped(false);
            for(const icon of iconsGood)
            {
                this.registerInDict(stats.proposalContent.good, icon, 1);
            }

            const iconsBad = card.getSideIfFlipped(true);
            for(const icon of iconsBad)
            {
                this.registerInDict(stats.proposalContent.bad, icon, -1);
            }
        }
    }

    trackStartingState(sim:InteractiveExampleSimulator, playerHands:Hand[])
    {
        // ??
    }
}

async function generate(sim:InteractiveExampleSimulator)
{
    await sim.loadMaterialCustom(getMaterialDataForRulebook(CONFIG));

    // prepare all options and settings (random cards, 5/5 vote split YES/NO)
    const numPlayers = CONFIG.rulebook.numPlayerBounds.randomInteger();
    let allCards : Card[] = shuffle(sim.getPicker("cards")());
    let allCardsDiscarded : Card[] = [];

    // @TODO: for now, we just select 1 Support card with exactly 1 Good icon
    // I probably need to ENSURE these exist, or create a better rule for starting cards! => just ensure we have 6 Support-1 cards at least, and they all have the same VoteStorage number, and we're good right?
    const startingCards = [];
    for(const card of allCards)
    {
        if(card.subType != DecreeType.SUPPORT) { continue; }
        if(card.sides.goodIcons.length > 1) { continue; }
        startingCards.push(card);
    }
    shuffle(startingCards);
    
    const allVotes : Card[] = shuffle(sim.getPicker("votes")());
    const playerHands : Hand[] = [];
    for(let i = 0; i < numPlayers; i++)
    {
        const hand = new Hand();
        hand.addCards( allCards.splice(0, CONFIG.rulebook.numHandCards) );
        playerHands.push(hand);
    }

    // for this game, the Hand object also tracks if 
    // cards are FLIPPED and which VOTES they contain (in separate lists)
    const playerScores : Hand[] = [];
    for(let i = 0; i < numPlayers; i++)
    {
        const h = new Hand();
        playerScores.push(h);
        const card = startingCards.pop();
        const startingVotes = allVotes.splice(0, CONFIG.rulebook.numStartingVotesPerPlayer);
        h.addCard(card, false, startingVotes);
    }

    const lawsEnacted = new Hand();

    sim.callCustom("trackStartingState", [playerHands]);

    // actually play the game; repeat rounds until done
    let activePlayer = 0;
    let round = 0;
    let playerReachedPointsTarget = false;
    while(!playerReachedPointsTarget)
    {
        const activeHand = playerHands[activePlayer];

        // refill your hand
        const numNeeded = CONFIG.rulebook.numHandCards - activeHand.count();
        let cardsRanOut = false;
        for(let i = 0; i < numNeeded; i++)
        {
            const deckEmpty = allCards.length <= 0;
            if(deckEmpty) 
            { 
                allCards = shuffle(allCardsDiscarded.slice()); 
                allCardsDiscarded = []; 
            }
    
            const deckStillEmpty = allCards.length <= 0;
            if(deckStillEmpty)
            {
                cardsRanOut = true;
                break;
            }
    
            activeHand.addCard( allCards.pop() );
        }

        if(cardsRanOut)
        {
            sim.stats.cardsRanOutDecree++;
            break;
        }

        // display state of game at round start
        sim.print("In this example, assume we are player " + (activePlayer + 1) + ". It's our turn and it's round " + (round + 1) + " of the game.");
        sim.print("Your <strong>hand</strong> contains the following cards:");
        await sim.listImages(activeHand);

        // PHASE 1) display mission proposal
        sim.print("You use them to make the <strong>following proposal</strong>."); 
        const proposalBounds = new Bounds(CONFIG.rulebook.minProposalSize, CONFIG.rulebook.maxProposalSize);
        const proposal = new Hand();
        proposal.addCards( activeHand.getRandomMultiple(proposalBounds.randomInteger(), true) );
        await sim.listImages(proposal);

        // PHASE 2) display voting
        sim.print("Everyone <strong>votes</strong> on it. The results are:");
        const votes = new Hand();
        for(const scoredCards of playerScores)
        {
            const randVote = scoredCards.getRandomVote(true);
            if(!randVote) { continue; }
            votes.addCard(randVote);
        }
        await sim.listImages(votes);

        // calculate, display, and handle the results
        const isSuccess = votes.isSuccess();
        sim.callCustom("trackProposalStats", [isSuccess, proposal]);

        let cardsDiscarded = [];
        const lawCards = proposal.getCardsOfSubType(DecreeType.LAW);
        const hasLawCards = lawCards.length > 0;
        if(isSuccess) {
            sim.print("There is <strong>no</strong> majority for NO, so the proposal is <strong>ACCEPTED!</strong>");
            if(hasLawCards) { sim.print("Its laws are enacted."); }
            lawsEnacted.addCards(lawCards);
            cardsDiscarded = [];
        } else {
            sim.print("There is a <strong>majority for NO</strong>, so the proposal is <strong>REJECTED.</strong>");
            if(hasLawCards) { sim.print("Its laws are discarded."); }
            cardsDiscarded = lawCards;
        }

        for(const lawCard of lawCards)
        {
            proposal.removeCard(lawCard);
        }
        const cardsRemain = proposal.count() > 0;

        if(!cardsRemain) {
            sim.print("This means no cards remain, so we instantly go to the final phase.");
        } else {
            const whichSideUp = isSuccess ? "green side up" : "red side up";
            const whichOrder = isSuccess ? "ascending" : "descending";
            const playerOrder = votes.getPlayerOrder(!isSuccess);
            const playerOrderString = votes.getPlayerOrderString(!isSuccess); // all players grab cards in this game
            sim.print("All voters grab cards in " + whichOrder + " numerical order: <strong>" + playerOrderString + "</strong>. They place the card before them with the " + whichSideUp + ".");
    
            let orderCounter = 0;
            while(proposal.count() > 0 && playerOrder.length > 0)
            {
                const playerIndex = playerOrder[orderCounter];
                const scoredCardsForPlayer = playerScores[playerIndex];
                scoredCardsForPlayer.addCard( proposal.popCard(), !isSuccess );
                orderCounter = (orderCounter + 1) % playerOrder.length;
            }

            // @EXCEPTION: if all players are out of votes, nobody actually draws anything, so we don't loop and we just discard all cards
            if(playerOrder.length <= 0) { cardsDiscarded.push(...proposal.getCards()); }
        }

        // give back discarded cards and votes
        allVotes.unshift(...votes.getCards());
        allCardsDiscarded.push(...cardsDiscarded);

        // PHASE 3) Collect new votes
        sim.print("Finally, all players <strong>draw/lose Votes</strong> based on how many <strong>SUPPORT icons</strong> they have. (Remember: you can also discard Resource cards to get more Votes.)");
        let ranOutOfVotes = false;
        const votesGivenBack = [];
        for(let i = 0; i < numPlayers; i++)
        {
            const scoredCardsForPlayer = playerScores[i];
            const supportIcons = playerScores[i].countSupportIcons(); 
            const numVotes = scoredCardsForPlayer.countStoredVotes();
            const losingVotes = supportIcons < 0 && numVotes > 1;
            let feedbackString = "";
            if(losingVotes) {
                const numVotesLost = Math.min(Math.abs(supportIcons), numVotes - 1);
                for(let v = 0; v < numVotesLost; v++)
                {
                    votesGivenBack.push(scoredCardsForPlayer.getRandomVote(true));
                }

                feedbackString = "You lost " + numVotesLost + " stored votes, because you have negative support!";
            } else {
                const storageLeft = playerScores[i].countVoteStorageLeft();
                let newVotes = Math.min(supportIcons, storageLeft);
                if(newVotes <= 0 && storageLeft > 0) { newVotes = 1; }
    
                if(allVotes.length < newVotes)
                {
                    ranOutOfVotes = true;
                    break;
                }
    
                for(let v = 0; v < newVotes; v++)
                {
                    playerScores[i].storeVote( allVotes.pop() );
                }

                feedbackString = "You drew " + newVotes + " votes.";
                if(storageLeft < supportIcons) { feedbackString += " (You couldn't draw more because you couldn't store them on your cards.)"; }
                if(supportIcons < 1) { feedbackString += " (If below 1, you always draw at least 1 new vote.)"; }
            }

            const giveFeedback = (i == activePlayer);
            if(giveFeedback) { sim.print(feedbackString); }
        }

        if(ranOutOfVotes)
        {
            sim.stats.cardsRanOutVotes++;
            break;
        }
        allVotes.unshift(...votesGivenBack);

        // @DEBUGGING; disabled because it just makes code too difficult and meh
        // make the temporary scores final (they're only temporary for simulation stat tracking)
        // sim.callCustom("trackResultStats", [tempPlayerScores]);

        // report back how the round ends for our active player
        const weScoredSomething = playerScores[activePlayer].count();
        if(weScoredSomething) {
            sim.print("Your final scored cards look as follows:");
            await sim.listImages(playerScores[activePlayer]);
        } else {
            sim.print("You scored nothing this round. Next round!");
        }

        // continue to next player
        // (if not simulating, just stop after one iteration)
        activePlayer = (activePlayer + 1) % numPlayers;
        round++;
        
        playerReachedPointsTarget = false;
        for(let i = 0; i < numPlayers; i++)
        {
            const scoredCards = playerScores[i];
            const isActivePlayer = (i == activePlayer);
            const score = scoredCards.getScore(lawsEnacted, isActivePlayer);
            //console.log("Player Score: " + i, score);
            if(score < CONFIG.rulebook.winningPointsTarget) { continue; }
            playerReachedPointsTarget = true;
            break;
        }
        
        if(sim.displaySingleTurn()) { playerReachedPointsTarget = true; } 
    }

    sim.callCustom("trackGameEnd", [round, playerScores, lawsEnacted]);
}


const callbackInitStats = () =>
{
    return {
        numPlayers: 0,
        proposalSuccess: 0,
        proposalCardsNum: 0,
        proposalContent: { good: {}, bad: {} },
        wonVotesNum: 0, // per player, per round
        wonVotesContent: {},
        cardsRanOutDecree: 0,
        cardsRanOutVotes: 0,
        roundsPlayed: 0,
        scoreResourceDistribution: {},
        scoreDistribution: {},
        finalNumCards: 0,
        finalNumVotes: 0,
        finalNumLaws: 0,
    } as SimulatorStats
}

const callbackFinishStats = (sim:InteractiveExampleSimulator) =>
{
    const stats:SimulatorStats = sim.getStats();
    const numTurns = stats.roundsPlayed;
    const iters = sim.getIterations();

    stats.proposalSuccessRate = stats.proposalSuccess / numTurns;
    stats.proposalCardsNumAvg = stats.proposalCardsNum / numTurns;
    // stats.proposalContentDistribution? What to do with that?

    stats.wonCardsNumAvg = stats.wonVotesNum / numTurns;
    stats.wonCardsContentAvg = {};
    for(const [key,data] of Object.entries(stats.wonVotesContent))
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

    stats.finalNumCardsAvg = stats.finalNumCards / iters;
    stats.finalNumVotesAvg = stats.finalNumVotes / iters;
    stats.finalNumLawsAvg = stats.finalNumLaws / iters;
}

const SIMULATION_ENABLED = false;
const SIMULATION_ITERATIONS = 1000;
const SHOW_FULL_GAME = false;

const CONFIG_RULEBOOK =
{
    examples:
    {
        turn:
        {
            callback: generate,
            simulator: {
                enabled: SIMULATION_ENABLED,
                iterations: SIMULATION_ITERATIONS,
                showFullGame: SHOW_FULL_GAME,
                callbackInitStats,
                callbackFinishStats,
                custom: new SimulatorCustom() // @TODO: ???
            }
        }
    }
}

loadRulebook(CONFIG_RULEBOOK);