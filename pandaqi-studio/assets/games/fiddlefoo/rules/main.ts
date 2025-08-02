import Point from "js/pq_games/tools/geometry/point";
import shuffle from "js/pq_games/tools/random/shuffle";
import InteractiveExampleSimulator from "js/pq_rulebook/examples/interactiveExampleSimulator";
import Card from "../game/card";
import { CONFIG } from "../shared/config";
import Board, { Move } from "./board";
import Player from "./player";

const callbackInitStats = () =>
{
    return {
        numTurns: 0,
        numTurnsWithCardsGiven: 0,
        totalCardsGiven: 0,
        totalSafeTurns: 0,
    }
}

const callbackFinishStats = (sim:InteractiveExampleSimulator) =>
{
    const s = sim.getStats();
    const i = sim.getIterations();
    
    s.numTurnsPerGame = s.numTurns / i;
    s.cardsGivenPerTurn = s.totalCardsGiven / s.numTurnsWithCardsGiven;
    s.numTurnsWithGivingRatio = s.numTurnsWithCardsGiven / s.numTurns;
    s.safeTurnsRatio = s.totalSafeTurns / s.numTurns;
}

const generate = async (sim:InteractiveExampleSimulator) =>
{
    await sim.loadMaterialCustom(getMaterialDataForRulebook(CONFIG));

    const numPlayers = CONFIG.rulebook.numPlayerBounds.randomInteger() ?? 4;
    const numCardsPerPlayer = CONFIG.rulebook.numCardsPerPlayer ?? 8;

    const allCards : Card[] = shuffle(sim.getPicker("cards")());
    const cardsPerType = {};
    for(const card of allCards)
    {
        if(!cardsPerType[card.color]) { cardsPerType[card.color] = []; }
        cardsPerType[card.color].push(card);
    }

    // setup the board
    const boardSize = CONFIG.rulebook.maxBoardSize ?? new Point(8,8);
    const startingCards = [];
    for(const cards of Object.values(cardsPerType))
    {
        startingCards.push(cards[0])
    };
    for(const card of startingCards)
    {
        allCards.splice(allCards.indexOf(card), 1);
    }

    const board = new Board();
    board.createGrid(boardSize);
    board.addStartingCards(startingCards);

    // setup the players (including starting hand)
    const players : Player[] = [];
    for(let i = 0; i < numPlayers; i++)
    {
        const p = new Player(i);
        p.addCards(allCards.splice(0, numCardsPerPlayer));
        players.push(p);
    }

    // now simply keep playing turns
    let continueTheGame = true;
    let numTurns = 0;
    let winningPlayer : Player = null;
    let counterPlayer = Math.floor(Math.random() * numPlayers);

    // pre-fill some moves for a more interesting interactive example
    // we ignore anything we don't need here (for simplicity and speed), such as throwing cards to others
    if(!sim.isHeadless())
    {
        const numPreMoves = CONFIG.rulebook.preMoveNumBounds.randomInteger();
        for(let i = 0; i < numPreMoves; i++)
        {
            counterPlayer = (counterPlayer + 1) % numPlayers;
            const move = players[counterPlayer].pickMove(board);
            if(!move) { continue; }
            players[counterPlayer].removeCard(move.card);
            board.doMove(move);
        }
    }

    while(continueTheGame)
    {
        const curPlayer = players[counterPlayer];
        sim.print("<b>Turn = Player " + (counterPlayer + 1) + "</b>. You have the following hand cards.");
        await sim.listImages(curPlayer, "draw");

        // make your move
        const move : Move = curPlayer.pickMove(board);
        if(!move) {
            sim.print("You have no valid move. Draw 1 card from deck.");
            curPlayer.addCard(allCards.pop());
        } else {
            const posNice = "<i>(" + (move.pos.x+1) + ", " + (move.pos.y+1) + ")</i>";
            sim.print("You decide to play " + move.card.toString() + " to position " + posNice + ".");
            curPlayer.removeCard(move.card);
            board.doMove(move);

            const pair = board.getPair(move);
            board.highlight([pair.posPlayed, pair.posOther]);

            sim.print("The board now looks as follows.");
            await sim.outputAsync(board, "draw");
            board.resetHighlight();

            // allow others to react
            
            const dist = pair.getDistance();
            sim.print("The closest card of the same color is " + pair.cardOther.toString() + ". This means your pair has <b>range " + pair.getRange().join(", ") + "</b> and <b>distance " + dist + "</b>.");

            const isSafeDistance = dist > 3;
            if(isSafeDistance) {
                sim.stats.totalSafeTurns++;
                sim.print("Your distance is greater than 3, so nobody may give you any cards! Instead, merely draw 1 card from deck.");
                curPlayer.addCard(allCards.pop());
            } else {
                const cards = curPlayer.receiveThrownCardsForPair(pair, players);
                let str = "They end up giving you the following cards.";
                if(cards.count() <= 0) { str = " But nobody can (or wants to) give you anything."; }

                sim.print("Other players now <b>give</b> you hand cards (with a <i>number in range</i> or <i>music notes equal to distance</i>). " + str);
                if(cards.count() > 0)
                {
                    sim.stats.numTurnsWithCardsGiven++;
                    sim.stats.totalCardsGiven += cards.count();
                    await sim.listImages(cards, "draw");
                }
            }
        }

        sim.print("Next turn!");

        // check if game should end; otherwise, continue
        numTurns++;
        counterPlayer = (counterPlayer + 1) % numPlayers;

        let playerOutOfCards = false;
        for(const player of players)
        {
            if(player.count() > 0) { continue; }
            playerOutOfCards = true;
            winningPlayer = player;
            break;
        }

        continueTheGame = !playerOutOfCards;
        if(sim.displaySingleTurn()) { continueTheGame = false; }
    }

    sim.stats.numTurns += numTurns;
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
            buttonText: "Give me an example turn!",
            callback: generate,
            simulator: {
                enabled: SIMULATION_ENABLED,
                iterations: SIMULATION_ITERATIONS,
                showFullGame: SHOW_FULL_GAME,
                callbackInitStats,
                callbackFinishStats,
            }
        }
    }
}

loadRulebook(CONFIG_RULEBOOK);