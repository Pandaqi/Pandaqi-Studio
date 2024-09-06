import fromArray from "js/pq_games/tools/random/fromArray";
import shuffle from "js/pq_games/tools/random/shuffle";
import InteractiveExampleGenerator from "js/pq_rulebook/examples/interactiveExampleGenerator";
import InteractiveExampleSimulator from "js/pq_rulebook/examples/interactiveExampleSimulator";
import Card from "../js_game/card";
import CardPicker from "../js_game/cardPicker";
import CONFIG from "../js_shared/config";
import Bid from "./bid";
import Hand from "./hand";
import Player from "./player";
import { BID_CARDS, CardType } from "../js_shared/dict";
import BidChecker from "./bidChecker";

enum ChallengeType
{
    SIMUL = "together",
    TURN = "turn-based"
}

const callbackInitStats = () =>
{
    return {
        numPlayers: 0,
        numPlayersAvg: 0,
        numTurns: 0,
        numTurnsPerGame: 0,
        numTurnsPerPlayerAvg: 0,
        playerBids: 0,
        playerBidsSuccess: 0,
        bidSuccessFreqs: {},
        bidUsedFreqs: {},
        bidScoreSuggested: {},
    }
}

const callbackFinishStats = (sim:InteractiveExampleSimulator) =>
{
    const s = sim.getStats();
    const i = sim.getIterations();

    s.numPlayersAvg = s.numPlayers / i;
    s.numTurnsPerGame = s.numTurns / i;
    s.numTurnsPerPlayerAvg = s.numTurnsPerGame / s.numPlayersAvg;
    s.bidSuccessRatio = {};
    for(const [key,data] of Object.entries(s.bidUsedFreqs))
    {
        s.bidSuccessRatio[key] = (s.bidSuccessFreqs[key] ?? 0) / (data as number);
    }

    s.bidScoreSuggested = {};
    for(const [key,data] of Object.entries(s.bidSuccessRatio))
    {
        const scoreRaw = 20 + (1.0 - (data as number)) * 180;
        const scoreNice = Math.floor(scoreRaw / 20.0) * 20;
        s.bidScoreSuggested[key] = scoreNice;
    }

    s.playerBidsSuccessRatio = s.playerBidsSuccess / s.playerBids;
}

const generate = async (sim:InteractiveExampleSimulator) =>
{
    const numPlayers = CONFIG.rulebook.numPlayerBounds.randomInteger() ?? 4;
    sim.stats.numPlayers += numPlayers;

    // separate allCards into bid and regular (throw away token)
    const allCards : Card[] = shuffle(sim.getPicker("card").get().slice());
    const regularCards : Card[] = [];
    const bidCards : Card[] = []; 
    for(const card of allCards)
    {
        if(card.type == CardType.REGULAR) { regularCards.push(card); }
        else if(card.type == CardType.BID) { bidCards.push(card); }
    }

    // prepare players + cards in table center
    const tableHand = new Hand(); // the cards faceup on the table
    const players : Player[] = [];
    for(let i = 0; i < numPlayers; i++)
    {
        const p = new Player(i);
        players.push(p);        
        const h = new Hand();
        p.hand = h;
    }

    const curDealer = fromArray(players);
    
    // PHASE 1) PREPARE
    sim.print("This example is for a <b>" + numPlayers + " player game</b>.");
    sim.print("<b>Phase 1: PREPARE.</b> Put 6 Bid Cards and the 6 Bid Tokens up for grabs.");

    // PHASE 2) DEALING
    sim.print("<b>Phase 2: DEALING.</b> The Dealer is <b>Player " + (curDealer.num + 1) + "</b>. One at a time, give players a card and place one faceup on the table.");

    const feedbackList = [];
    const numHandCards = CONFIG.rulebook.numCardsPerPlayer ?? 6;
    for(let i = 0; i < numHandCards; i++)
    {
        tableHand.addCard(regularCards.pop());

        const handSize = (i+1);
        const playersBidding : number[] = []; // @NOTE: number is offset +1; do -1 for array indexing first
        for(let i = 0; i < numPlayers; i++)
        {
            const player = players[(curDealer.num + i) % numPlayers];
            player.hand.addCard(regularCards.pop());
            
            const canBid = !player.hasBid();
            const wannaBid = Math.random() <= CONFIG.rulebook.bidProb;
            if(!(canBid && wannaBid)) { continue; }
            playersBidding.push(player.num + 1);
        }

        let str = "<b>Card " + handSize + ":</b> ";
        if(playersBidding.length <= 0) 
        {
            str += "Nothing happens.";
        } 
        else 
        {
            if(playersBidding.length <= 1) 
            {
                str += "<b>Player " + playersBidding[0] + "</b> decided to bid.";
            }
            else
            {
                str += "The following players wanted to bid: " + playersBidding.join(", ") + ". Only <b>Player " + playersBidding[0] + "</b> bids, because they are closest to Dealer.";
            }

            const newBidCard = bidCards.pop();
            str += " They grab their desired <i>Bid Card</i> (<i>" + newBidCard.getLabel() + "</i>) and <i>Bid Token " + handSize + "</i>.";
            players[ playersBidding[0] - 1] .bid = new Bid(newBidCard, handSize);
        }

        feedbackList.push(str);
    }
    sim.printList(feedbackList);

    // PHASE 3) SCORING
    sim.print("<b>Phase 3: SCORING.</b> With all cards revealed, players check if their bid is present (between their cards and the faceup cards).");

    // only show for few players, otherwise overwhelming
    if(numPlayers <= 4)
    {
        sim.print("Below are the cards open on the table.");
        await sim.listImages(tableHand, "draw");

        sim.print("The cards in each player's hand (respectively) are as follows.");
        for(const player of players)
        {
            await sim.listImages(player.hand, "draw");
        }
    }

    // behind the scenes, we check ALL possible bids in ALL configurations, to get the best overview of average probability per bid
    for(const [key,data] of Object.entries(BID_CARDS))
    {
        for(const player of players)
        {
            const success = new BidChecker().check(key, player, players, tableHand);
            sim.stats.bidUsedFreqs[key] = (sim.stats.bidUsedFreqs[key] ?? 0) + 1;
            if(success)
            {
                sim.stats.bidSuccessFreqs[key] = (sim.stats.bidSuccessFreqs[key] ?? 0) + 1;
            }
        }
    }
    
    // but for the interactive example, we just score the visible bids/players present and that's it
    const scoreList = [];
    for(const player of players)
    {
        player.calculateAndSaveScore(tableHand, players);

        let str = "<b>Player " + (player.num + 1) + "</b> ";
        if(!player.hasBid()) { 
            str += "did not bid and thus scores no points.";
        } else {
            const bidCard = player.bid.bidCard;
            sim.stats.playerBids++;

            if(player.bid.success) { 
                sim.stats.playerBidsSuccess++;
                str += "successfully made their bid (<i>worth $" + bidCard.getValue() + "</i>). They score " + bidCard.getValue() + " / " + player.bid.handSize + " = " + player.score + " points."; 
            } else {
                str += "failed their bid (<i>worth $" + bidCard.getValue() + "</i>). They score -10 points.";
            }
        }

        scoreList.push(str);
    }
    sim.printList(scoreList);

}

const SIMULATION_ENABLED = false;
const SIMULATION_ITERATIONS = 100;
const SHOW_FULL_GAME = false;

const gen = new InteractiveExampleGenerator({
    id: "turn",
    buttonText: "Give me an example round!",
    callback: generate,
    config: CONFIG,
    itemSize: CONFIG.rulebook.itemSize,
    pickers: { card: CardPicker },
    simulateConfig: {
        enabled: SIMULATION_ENABLED,
        iterations: SIMULATION_ITERATIONS,
        showFullGame: SHOW_FULL_GAME,
        callbackInitStats,
        callbackFinishStats,
    }
})