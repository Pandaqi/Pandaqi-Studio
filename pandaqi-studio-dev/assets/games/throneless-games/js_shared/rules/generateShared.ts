import shuffle from "js/pq_games/tools/random/shuffle";
import InteractiveExampleSimulator from "js/pq_rulebook/examples/interactiveExampleSimulator";
import GameState from "./gameState";
import fromArray from "js/pq_games/tools/random/fromArray";

export default async (sim:InteractiveExampleSimulator, CONFIG, PACKS) =>
{
    // because the number of types to include depends on player count
    // we have to re-generate and re-draw it every time we simulate
    // (we could do it on every ITERATION too, but that's just too heavy)
    const numPlayers = CONFIG.rulebook.numPlayerBounds.randomInteger();
    const playerNames = ["Anna", "Bert", "Claire", "Dennis", "Eric", "Fred"].slice(0, numPlayers);
    const packTypes = shuffle(Object.keys(PACKS)).slice(0, numPlayers);
    CONFIG.set = "none";
    for(const type of Object.keys(CONFIG.packs)) { CONFIG.packs[type] = false; }
    for(const type of packTypes) { CONFIG.packs[type] = true; }

    const cardPicker = sim.getPicker("card");
    await cardPicker.generate()
    const allCards = shuffle(cardPicker.get());

    // setup
    const board = new GameState();
    board.generate(playerNames, allCards, CONFIG);

    let continueTheGame = true;
    while(continueTheGame)
    {

        // @UNIQUE (KAIZERSEAT): Thronecards and Seatcards
        if(CONFIG.rulebook.drawThroneCard)
        {
            sim.print("A new Seatcard is drawn from this round. (A Thronecard should've already been drawn during setup.)");
        }

        // @UNIQUE (KAIZERSEAT): Direction decision before round
        let counterClockwise = false;
        if(CONFIG.rulebook.decideDirectionBeforeRound)
        {
            counterClockwise = Math.random() <= 0.5;
            const dirString = counterClockwise ? "counter-clockwise" : "clockwise";
            sim.print("The " + CONFIG.rulebook.leaderNaming + " decides this round will be in <strong>" + dirString + "</strong> direction.");
        }

        // vote
        if(CONFIG.rulebook.tellerGoesFirst) {
            // @UNIQUE (SMALLSEAT): Teller votes first. (It's important teller = index 0 in GameState, otherwise they're not first of course.)
            sim.print("The <strong>Teller votes first</strong>, publicly.");
            sim.print("Then all <strong>Candidates</strong> pick a secret card. (Remember they must follow the Teller's type if possible, or pay 1 card for the privilege to play anything.) Once revealed, the game looks as follows.");
        } else {
            sim.print("All Players pick a secret card. Once revealed, the game looks as follows.");
        }

        board.castVotes(sim);
        await sim.outputAsync(board, "draw");

        // winning votes => tell
        const leadingPlayer = board.getKingseatPlayer();
        const winningSequence = board.getWinner(sim, counterClockwise);
        const winningCards = board.cardsPlayed.getCardsOfType(winningSequence.getType());
        const numWinningCards = winningCards.length;
        const cardsStolen = [];

        sim.print("The (first) type with majority is <strong>" + winningSequence.getType() + "</strong>.");
        if(CONFIG.rulebook.tellerIsPerson) {
            sim.print("All cards of that type (" + numWinningCards + ") go into the Teller's hand, facing them.");
            board.getTeller().addCards(winningCards, false);
        } else if (CONFIG.rulebook.tellerIsLeader) {
            // @UNIQUE (QUEENSEAT): Queen picks any card to take for herself
            sim.print("The " + CONFIG.rulebook.leaderNaming + " takes one card into their Hand (facing away).");
            const cardStolen = fromArray(winningCards);
            leadingPlayer.addCard(cardStolen, true);
            cardsStolen.push(cardStolen);
        } else {
            sim.print("All cards of that type (" + numWinningCards + ") go into the Tell.");
            board.tell.addCards(winningCards);
        }

        // @UNIQUE (QUEENSEAT): winners decide who gets their card; the Queen decides this for losers.
        if(CONFIG.rulebook.winnersGiveAwayCards)
        {
            sim.print("All winners decide who gets their card (facing away).");

            const winningPlayers = board.getWinningPlayers(winningCards);
            for(const player of winningPlayers)
            {
                const receivingPlayer = board.getRandomPlayer([leadingPlayer]);
                const ourCard = board.getCardPlayedFor(player);
                if(cardsStolen.includes(ourCard)) { continue; }
                receivingPlayer.addCard(ourCard, true);
            }
        }

        sim.stats.numWinningCardsDist[numWinningCards]++;

        const leaderWins = winningCards.includes( board.cardsPlayed.getCardAtIndex(board.kingseat) );
        if(leaderWins) { sim.stats.leaderPartOfWinningSequence++; }

        board.cardsPlayed.nullifyCards(winningCards);
        await sim.outputAsync(board, "draw");

        // other players
        const feedbackList : string[] = [];
        const unhandledPlayers = board.getUnhandledPlayers(counterClockwise);
        const allCardsWon = (unhandledPlayers.length <= 0);
        const swapProb = CONFIG.rulebook.swapProbability;
        let somebodySwappedPlaces = false;
        let numSwaps = 0;
        let numActionsTaken = 0;

        sim.print("Now we handle all remaining cards.");
        while(unhandledPlayers.length > 0)
        {
            const p = unhandledPlayers.shift();
            const ourCard = board.getCardPlayedFor(p);
            const p2 = board.getValidSwapTarget(p, winningCards);

            const unfavorableLeaderSwap = (CONFIG.rulebook.leaderSwapHasRestrictions && board.isPlayerKingseat(p));
            const hasSwapTarget = p2 != null;
            const swapPlaces = Math.random() <= swapProb && hasSwapTarget && !CONFIG.rulebook.swappingForbidden && !unfavorableLeaderSwap;

            let str = "<strong>" + p.getName() + "</strong> executes the action on their card.";

            if(swapPlaces) {
                str = "<strong>" + p.getName() + "</strong> swaps places with <strong>" + p2.getName() + "</strong>.";
                if(board.isPlayerKingseat(p2)) { sim.stats.numSwapsWithLeader++; }
                
                board.swapPlayers(p, p2);
                somebodySwappedPlaces = true;

                if(CONFIG.rulebook.swapPlacesAlsoSwapsCards)
                {
                    str += " And swaps 1 Hand card with them.";
                    p.swapCardsWith(p2, 1);
                } 

                numSwaps++;
            } else {
                numActionsTaken++;
            }

            if(CONFIG.rulebook.discardGoesToPlayer) {
                const receivingPlayer = board.getRandomPlayer([leadingPlayer]);
                str += " The " + CONFIG.rulebook.leaderNaming + " decides to give their card to <strong>" + receivingPlayer.getName() + "</strong>, facing away.";
                receivingPlayer.addCard(ourCard, true);
            } else {
                board.discard.addCard(ourCard);
            }
            board.cardsPlayed.nullifyCards([ourCard]);

            feedbackList.push(str);
        }

        board.finishRound();

        if(allCardsWon || feedbackList.length <= 0) {
            sim.print("But there are none! All cards were of the winning type.");
        } else {
            sim.printList(feedbackList);
        }

        sim.stats.numSwaps += numSwaps;
        sim.stats.numActionsTaken += numActionsTaken;
        sim.stats.numRounds++;

        // @TODO: track how often a player could not vote?

        // final state
        let specificGameTerms = CONFIG.rulebook.seatNaming + " (and is " + CONFIG.rulebook.leaderNaming + ").";
        sim.print("The round is over! <strong>" + board.getKingseatPlayer().getName() + "</strong> currently sits in the " + specificGameTerms);

        if(somebodySwappedPlaces)
        {
            sim.print("The game now looks as follows.");
            await sim.outputAsync(board, "draw");
        }

        const endTrigger = CONFIG.rulebook.endGameTrigger;
        if(endTrigger == "noVotes") {
            // false = the cards must be secret, flipped = false
            continueTheGame = board.countCards(false) > 0;
        } else if(endTrigger == "lastVotesExceptTeller") {
            continueTheGame = board.countPlayersAtSingleCard([board.getTeller()]) < (board.countPlayers() - 1);
        }

        if(sim.displaySingleTurn()) { continueTheGame = false; }
    }

    sim.stats.tellerHandSizeEnd += board.players[0].count();
    sim.stats.leaderHandSizeEnd += board.getKingseatPlayer().count();

}
