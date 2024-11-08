import shuffle from "js/pq_games/tools/random/shuffle";
import InteractiveExampleGenerator from "js/pq_rulebook/examples/interactiveExampleGenerator";
import InteractiveExampleSimulator from "js/pq_rulebook/examples/interactiveExampleSimulator";
import Card from "../js_game/card";
import CardPicker from "../js_game/cardPicker";
import CONFIG from "../js_shared/config";
import Hand from "./hand";
import Player from "./player";
import { CardType } from "../js_shared/dict";

const callbackInitStats = () =>
{
    return {
        numPlayers: 0,
        numPlayersAvg: 0,
        numRounds: 0,
        numRoundsPerGame: 0,
        playersStopped: 0,
        winningComboSize: 0,
        winningScore: 0,
        winningComboColor: 0,
        winningComboNumber: 0,
    }
}

const callbackFinishStats = (sim:InteractiveExampleSimulator) =>
{
    const s = sim.getStats();
    const i = sim.getIterations();

    s.numPlayersAvg = s.numPlayers / i;
    s.numRoundsPerGame = s.numRounds / i;
    s.playersStoppedAvg = s.playersStopped / s.numRounds;
    s.winningComboSizeAvg = s.winningComboSize / s.numRounds;
    s.winningScore = s.winningScore / i;
}

const generate = async (sim:InteractiveExampleSimulator) =>
{
    const numPlayers = CONFIG.rulebook.numPlayerBounds.randomInteger() ?? 4;
    sim.stats.numPlayers += numPlayers;

    const players : Player[] = [];
    for(let i = 0; i < numPlayers; i++)
    {
        players.push(new Player(i));        
    }

    const allCards : Card[] = sim.getPicker("card").get().slice();
    for(let i = allCards.length - 1; i >= 0; i--)
    {
        if(allCards[i].type == CardType.SINT)
        {
            allCards.splice(i, 1);
        }
    }

    const numStartingCards = CONFIG.rulebook.numCardsPerPlayer ?? 6;
    const numCardsRevealed = CONFIG.rulebook.numCardsRevealed ?? 3;

    let continueTheGame = true;
    let sintIndex = Math.floor(Math.random() * numPlayers);
    while(continueTheGame)
    {
        sim.print("<b>Nieuwe ronde!</b> Speler " + (sintIndex + 1) + " is Sint. Iedereen pakt 3 kaarten uit eigen winst (als mogelijk), en trekt dan bij tot ze in totaal " + numStartingCards + " handkaarten hebben.");

        // reset all players and deal cards
        shuffle(allCards);
        for(const player of players)
        {
            /*if(player.num == sintIndex && CONFIG.rulebook.rules.sintUsesScoredCards)
            {
                const cards = [];
                while(cards.length < numStartingCards && player.score.count() > 0)
                {
                    cards.push(player.score.removeCardRandom());
                }
                while(cards.length < numStartingCards)
                {
                    cards.push(allCards.pop());
                }
                player.reset(cards);
                continue;
            }*/

            const numSelfCards = Math.min(player.score.count(), Math.floor(0.5*numStartingCards));
            const numDrawCards = numStartingCards - numSelfCards;

            const cards = [];
            for(let i = 0; i < numSelfCards; i++) { cards.push(player.score.removeCardRandom()); }
            for(let i = 0; i < numDrawCards; i++) { cards.push(allCards.pop()); }
            player.reset(cards);
        }

        // repeat the main loop a fixed number of times
        const pakjesKamer = new Hand();
        let highestBid = 0;
        for(let i = 0; i < numCardsRevealed; i++)
        {
            // reveal the next card
            sim.print("<hr>");
            sim.print("<b>Kaart onthuld!</b> De Pakjeskamer ziet er nu als volgt uit.");
            pakjesKamer.addCard(allCards.pop());
            await sim.listImages(pakjesKamer);

            // ask everybody to bid
            const fbList = [];
            let firstStopped = null;
            let playerAllIn = null;
            for(let a = 0; a < numPlayers; a++)
            {
                const playerIndex = (sintIndex + a) % numPlayers;
                const player = players[playerIndex];
                const fb = ["<b>Speler " + (playerIndex + 1) + "</b>"];
                fbList.push(fb);

                if(player.stopped) 
                {
                    fb.push(" is al gestopt.");
                    continue;
                }

                const mustRaise = player.getTotalBid() < highestBid;
                const wantsToRaise = Math.random() <= CONFIG.rulebook.raiseProbability;
                const canRaise = player.hand.count() > 1;
                const WILL_RAISE = mustRaise || (canRaise && wantsToRaise);

                const bidDiff = Math.max(highestBid - player.getTotalBid(), 0);
                const cantRaiseBidEnough = bidDiff > player.getTotalHandValue();

                const mustStop = mustRaise && cantRaiseBidEnough;
                const wantsToStop = Math.random() <= CONFIG.rulebook.stopProbability;
                const canStop = players.filter((p:Player) => !p.stopped).length > 1;
                const WILL_STOP = mustStop || (canStop && wantsToStop);
                
                if(WILL_STOP) 
                {
                    if(!mustRaise) 
                    {
                        fb.push(" hoeft niks te doen.");
                        continue;
                    }
                    
                    fb.push(" besluit te stoppen.");
                    player.stop();

                    if(CONFIG.rulebook.rules.sintChange == "first-stop")
                    {
                        const isFirstStopped = players.filter((p:Player) => p.stopped).length <= 1;
                        if(isFirstStopped) { firstStopped = player; }
                    }

                    continue;
                } 

                if(WILL_RAISE) 
                {
                    let newHighestBid = -1;
                    while(newHighestBid < highestBid && player.hand.count() > 0)
                    {
                        player.bid.addCard(player.hand.removeCardRandom());
                        newHighestBid = player.getTotalBid();
                    }

                    highestBid = newHighestBid;
                    const str = " besluit diens bod te verhogen tot " + newHighestBid + ".";
                    fb.push(str);

                    if(player.hand.count() <= 0)
                    {
                        playerAllIn = player;
                        if(CONFIG.rulebook.rules.allInStopsRound) { break; }
                    }

                    continue;
                }

                fb.push(" hoeft niks te doen.");
            }

            // this only changes AFTER the loop, otherwise we mess up its indexing
            if(firstStopped)
            {
                sintIndex = firstStopped.num;
            }

            sim.print("De spelers maken de volgende keuzes.");
            sim.printList( fbList.map((arr:string[]) => arr.join("")) );

            const playersLeft = players.filter((p:Player) => !p.stopped).length;
            const isLastRound = i == (numCardsRevealed-1)
            if(playersLeft <= 1)
            {
                if(!isLastRound) { sim.print("Er is nog maar één speler over, dus de ronde stopt meteen."); }
                break;
            }

            if(playerAllIn && CONFIG.rulebook.rules.allInStopsRound)
            {
                sim.print("Een speler is all-in (alle handkaarten ingezet), dus de ronde stopt meteen.");
                break;
            }
        }

        // decide the winner
        sim.print("<hr>");
        sim.print("De (geheime) kaarten van de overgebleven spelers zijn als volgt");
        for(const player of players)
        {
            if(player.stopped) { continue; }
            await sim.listImages(player.hand);
        }

        sim.print("Dit zijn de beste combinaties die alle overgebleven spelers kunnen maken:");
        
        // calculate results and add to player object
        const fbList = [];
        for(const player of players)
        {
            player.calculateBestCombo(pakjesKamer.cards);
            if(player.stopped) { continue; }
            fbList.push("<b>Speler " + (player.num + 1) + "</b> kan <b>" + player.bestCombo.toString() + "</b> maken.");
        }
        sim.printList(fbList);

        // sort to find the winner
        const playersCopy = players.slice();
        playersCopy.sort((a:Player, b:Player) => a.bestCombo.compareTo(b.bestCombo));

        // handle consequences
        const isTied = playersCopy[0].bestCombo.isEqualTo(playersCopy[1].bestCombo);
        const winningPlayer = playersCopy[0];
        if(isTied) {
            sim.print("Het is een <b>gelijkspel</b>! Niemand wint de inzet; alles gaat terug naar de stapel. Volgende ronde!");
            for(const player of players) { allCards.push(...player.bid.cards); }
        } else {
            sim.print("<b>Speler " + (winningPlayer.num + 1) + " wint!</b> Diegene krijgt alle inzet; alle andere kaarten gaan terug in de stapel. Volgende ronde!");
            for(const player of players) { winningPlayer.scoreCards(player.bid.cards); }
            if(CONFIG.rulebook.rules.sintChange == "winner") { sintIndex = winningPlayer.num; }

            if(winningPlayer.bestCombo.getComboType() == "color") { sim.stats.winningComboColor++; }
            else { sim.stats.winningComboNumber++; }
        }

        if(CONFIG.rulebook.rules.sintChange == "clockwise") 
        {
            sintIndex = (sintIndex + 1) % numPlayers;
        }

        // give unused cards back to deck
        for(const player of players)
        {
            allCards.push(...player.hand.cards);
        }

        sim.stats.numRounds++;
        sim.stats.playersStopped += players.filter((p:Player) => p.stopped).length;
        sim.stats.winningComboSize += isTied ? 0 : winningPlayer.bestCombo.count();

        const cardsLeft = allCards.length;
        let cardsNeeded = numCardsRevealed;
        for(const player of players)
        {
            cardsNeeded += numStartingCards - Math.min(player.score.count(), Math.floor(0.5*numStartingCards));
        }

        /*if(CONFIG.rulebook.rules.sintUsesScoredCards)
        {
            cardsNeeded -= Math.min(players[sintIndex].score.count(), numStartingCards);
        }*/

        continueTheGame = (cardsLeft >= cardsNeeded);
        if(sim.displaySingleTurn()) { continueTheGame = false; }
    }

    // calculate final winner
    players.sort((a:Player,b:Player) => {
        return b.getTotalScore() - a.getTotalScore() 
    })
    const winningPlayer = players[0];
    sim.stats.winningScore += winningPlayer.getTotalScore();
}

const SIMULATION_ENABLED = true;
const SIMULATION_ITERATIONS = 100;

const gen = new InteractiveExampleGenerator({
    id: "turn",
    buttonText: "Geef me een voorbeeldronde!",
    callback: generate,
    config: CONFIG,
    itemSize: CONFIG.rulebook.itemSize,
    pickers: { card: CardPicker },
    simulateConfig: {
        enabled: SIMULATION_ENABLED,
        iterations: SIMULATION_ITERATIONS,
        callbackInitStats,
        callbackFinishStats,
    }
})