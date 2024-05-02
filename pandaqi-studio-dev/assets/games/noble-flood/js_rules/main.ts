import fromArray from "js/pq_games/tools/random/fromArray";
import shuffle from "js/pq_games/tools/random/shuffle";
import InteractiveExampleGenerator from "js/pq_rulebook/examples/interactiveExampleGenerator";
import InteractiveExampleSimulator from "js/pq_rulebook/examples/interactiveExampleSimulator";
import CardPicker from "../js_game/cardPicker";
import CONFIG from "../js_shared/config";
import { CardType } from "../js_shared/dict";
import Board from "./board";
import Player from "./player";
import lerp from "js/pq_games/tools/numbers/lerp";
import clamp from "js/pq_games/tools/numbers/clamp";

const callbackInitStats = () =>
{
    return {
        numTurns: 0,
        numRounds: 0,
        winningScores: 0,
        scoreDistribution: {},
        numValidMoves: 0,
        numCardsPlayed: 0,
        numCardsDiscarded: 0,
        contractSuccessChance: 0,
        chanceNoContract: 0,
        numSuccessPerContract: {},
        numOccurrencesPerContract: {}
    }
}

const callbackFinishStats = (sim:InteractiveExampleSimulator) =>
{
    const s = sim.getStats();
    const i = sim.getIterations();
    const t = s.numTurns;
    const r = s.numRounds;

    s.winningScoreAvg = s.winningScores / i;
    s.numValidMovesAvg = s.numValidMoves / t;
    s.numCardsPlayedPerTurn = s.numCardsPlayed / t;
    s.numCardsDiscardedPerTurn = s.numCardsDiscarded / t;
    s.contractSuccessChancePerRound = s.contractSuccessChance / r;
    s.chanceNoContractPerRound = s.chanceNoContract / r;

    let num = 0;
    let scoresRegistered = 0;
    for(const [key,freq] of Object.entries(s.scoreDistribution as Record<string,number>))
    {
        num += parseInt(key) * freq;
        scoresRegistered += freq;
    }

    s.scoreAvg = num / scoresRegistered;

    s.successChancePerContract = {};
    s.proposedPointsPerContract = {};
    for(const [key,freq] of Object.entries(sim.stats.numSuccessPerContract as Record<string,number>))
    {
        const chance = freq / sim.stats.numOccurrencesPerContract[key];
        s.successChancePerContract[key] = chance;
        s.proposedPointsPerContract[key] = clamp(Math.round(lerp(10, 1, chance)), 1, 10);
    }
}

const generate = async (sim:InteractiveExampleSimulator) =>
{
    const numPlayers = CONFIG.rulebook.numPlayerBounds.randomInteger() ?? 4;
    const numContractCardsPerRound = numPlayers + (CONFIG.rulebook.surplusContractCards ?? 2);
    const startingRowSize = CONFIG.rulebook.startingRowSize ?? 4;
    const numCardsPerPlayer = CONFIG.rulebook.numCardsPerPlayer ?? 4;

    const allCards = shuffle(sim.getPicker("card").get().slice());
    const cardsRegular = [];
    const cardsContract = [];
    for(const card of allCards)
    {
        if(card.type == CardType.CONTRACT) { cardsContract.push(card); }
        else { cardsRegular.push(card); }
    }
    
    const board = new Board();
    const players : Player[] = [];
    for(let i = 0; i < numPlayers; i++)
    {
        const p = new Player(i);
        players.push(p);
    }

    let continueTheGame = true;
    let counterGame = 0;
    let numRounds = 0;
    let numTurns = 0;

    while(continueTheGame)
    {
        // setup new map for the game
        board.createGrid(CONFIG.rulebook.maxMapSize);
        board.addStartingCards(cardsRegular.splice(0, startingRowSize));

        sim.print("The starting board looks as follows.");
        await sim.outputAsync(board, "draw");

        const contractsDrawn = shuffle(cardsContract.splice(0, numContractCardsPerRound));

        // deal player cards + pick a contract
        let withoutContractChance = 0;
        for(const player of players)
        {
            player.addCards(cardsRegular.splice(0, numCardsPerPlayer));
            const drawContract = Math.random() <= (CONFIG.rulebook.drawContractProb ?? 0.8);
            if(!drawContract) 
            { 
                player.addContract(null); 
                withoutContractChance++;
                continue; 
            }

            player.addContract(contractsDrawn.pop());
        }
        sim.stats.chanceNoContract += withoutContractChance / numPlayers;

        // play "turns" until this round is over
        let continueTheRound = true;
        let counterRound = 0;
        const cardsDiscarded = [];
        const curDealer = players[counterGame % numPlayers];

        while(continueTheRound)
        {
            const curPlayer = players[counterRound];
            
            sim.print("It's <strong>Player " + (curPlayer.num + 1) + "'s</strong> turn.");
            sim.print("You have these cards in your hands.");
            await sim.listImages(curPlayer, "draw");

            const validMoves = board.getValidMovesFor(curPlayer);
            sim.stats.numValidMoves += validMoves.length;

            if(curPlayer == curDealer)
            {
                sim.print("You are Dealer, so you first reveal a facedown card from the map.");
                // @TODO: write logic for this??
            }

            const mustDiscard = validMoves.length <= 0;
            const canPlay = !mustDiscard;
            if(mustDiscard)
            {
                const card = curPlayer.removeCardRandom();
                cardsDiscarded.push(card);
                sim.print("You have no valid moves. You reveal and discard a card.");

                sim.stats.numCardsDiscarded++;
            }

            if(canPlay) 
            {
                const randMove = fromArray(validMoves);
                board.doMove(randMove);
                curPlayer.removeCard(randMove.card);

                sim.print("You have " + validMoves.length + " valid moves. You decide to play <strong>" + randMove.card.toRulesString() + "</strong>.");

                sim.stats.numCardsPlayed++;
            }

            counterRound = (counterRound + 1) % numPlayers;
            numTurns++;

            let playersStillHaveCards = false;
            for(const player of players)
            {
                if(player.count() <= 0) { continue; }
                playersStillHaveCards = true; 
                break;
            }
            continueTheRound = playersStillHaveCards;

            sim.print("At the end of your turn, the board looks as follows.");
            await sim.outputAsync(board, "draw");
        }

        // cleanup; give everything back to decks + validate contracts
        const allCardsInMap = board.getAllCards();
        cardsRegular.push(...shuffle(allCardsInMap));
        cardsRegular.push(...shuffle(cardsDiscarded));

        let contractSuccesses = 0;
        for(const player of players)
        {
            const success = player.validateContract(board);
            const num = success ? 1 : 0;
            contractSuccesses += num;

            const lastContract = player.getLastContract();
            if(lastContract)
            {
                const k = lastContract.contractKey;

                if(!sim.stats.numSuccessPerContract[k]) { sim.stats.numSuccessPerContract[k] = 0; }
                sim.stats.numSuccessPerContract[k] += num;

                if(!sim.stats.numOccurrencesPerContract[k]) { sim.stats.numOccurrencesPerContract[k] = 0; }
                sim.stats.numOccurrencesPerContract[k]++;
            }
        }
        sim.stats.contractSuccessChance += contractSuccesses / numPlayers;
        
        numRounds++;
        counterGame++;

        continueTheGame = cardsContract.length > 0;
        if(sim.displaySingleTurn()) { continueTheGame = false; }
    }

    let winningPlayer = null;
    let winningScore = -Infinity;
    const playerScores = [];
    for(const player of players)
    {
        const score = player.scoreContracts();
        playerScores.push(score);
        if(score < winningScore) { continue; }
        winningScore = score;
        winningPlayer = player;
    }

    sim.stats.numRounds += numRounds;
    sim.stats.numTurns += numTurns;
    sim.stats.winningScores += winningScore;

    for(const score of playerScores)
    {
        if(!sim.stats.scoreDistribution[score]) { sim.stats.scoreDistribution[score] = 0; }
        sim.stats.scoreDistribution[score]++;
    }
}

const SIMULATION_ENABLED = true;
const SIMULATION_ITERATIONS = 500;
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