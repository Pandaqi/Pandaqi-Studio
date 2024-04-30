import fromArray from "js/pq_games/tools/random/fromArray";
import Player from "./player";
import Sequence from "./sequence";
import shuffle from "js/pq_games/tools/random/shuffle";
import CardThroneless from "../cardThroneless";
import InteractiveExampleSimulator from "js/pq_rulebook/examples/interactiveExampleSimulator";
import Point from "js/pq_games/tools/geometry/point";
import TextConfig from "js/pq_games/layout/text/textConfig";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";

export default class GameState
{
    config: Record<string,any>;
    kingseat: number = -1;
    players: Player[] = [];
    cardsPlayed: Player;
    tell: Player;
    discard: Player;

    generate(playerNames:string[], cards:CardThroneless[], CONFIG:Record<string,any>)
    {
        let numPlayersNeedingCards = playerNames.length;
        if(CONFIG.rulebook.tellerIsPerson) { numPlayersNeedingCards--; }

        // fairly deal all cards amongst players (who start with them)
        const cardsPerPlayer = Math.floor(cards.length / numPlayersNeedingCards);
        for(let i = 0; i < playerNames.length; i++)
        {
            const p = new Player(playerNames[i]);
            if(CONFIG.rulebook.tellerIsPerson && i == 0) { p.teller = true; }

            const startsWithCards = !p.teller;
            if(startsWithCards)
            {
                p.addCards( cards.splice(0, cardsPerPlayer) );
            }
            this.players.push(p);
        }

        // they receive all remaining cards, if they exist
        if(CONFIG.rulebook.tellerIsPerson) { this.players[0].addCards(cards); }

        this.setRandomKingseat();

        this.tell = new Player("tell");
        this.discard = new Player("discard");
        this.config = CONFIG;
    }

    getMostOccurringElements(list:string[])
    {
        const stats:Record<string,number> = {};
        for(const elem of list)
        {
            if(!stats[elem]) { stats[elem] = 0; }
            stats[elem]++;
        }

        let maxNum = -Infinity;
        for(const freq of Object.values(stats))
        {
            maxNum = Math.max(maxNum, freq);
        }
        
        const arr = [];
        for(const [key,freq] of Object.entries(stats))
        {
            if(freq < maxNum) { continue; }
            arr.push(key);
        }

        return arr;
    }

    getMostOccurringTypesFromCards(cards:CardThroneless[])
    {
        const types = [];
        for(const card of cards)
        {
            types.push(card.type);
        }
        return this.getMostOccurringElements(types);
    }

    getMostOccurringVotes()
    {
        return this.getMostOccurringElements(this.cardsPlayed.getCardTypes())
    }

    getNeighborsOf(p: Player)
    {
        const numPlayers = this.countPlayers();
        const idx = this.getIndexOf(p);
        const nbLeft = (idx - 1 + numPlayers) % numPlayers;
        const nbRight = (idx + 1) % numPlayers;
        return [this.players[nbLeft], this.players[nbRight]];
    }

    // Round; Step 1) All players pick a valid vote
    castVotes(sim:InteractiveExampleSimulator)
    {
        const newRound = new Player("votes");

        let num = 0;
        for(const player of this.players)
        {
            let stats = this.getCards(true, [player]);

            if(this.config.rulebook.cantVoteMajorityNeighborsOnly)
            {
                stats = this.getCards(true, [], this.getNeighborsOf(player));
            }

            const mostOccurring = this.getMostOccurringTypesFromCards(stats);
            const tellerCard = this.cardsPlayed.getCardAtIndex( this.getIndexOf(this.getTeller()) );

            let typesAllowed = [];
            let allowDisobey = false;

            // @UNIQUE (QUEENSEAT): only picking what you DON'T see the most on other player's hands
            if(this.config.rulebook.cantVoteMajorityPublic || this.config.rulebook.cantVoteMajorityNeighborsOnly)
            {
                typesAllowed = mostOccurring;
            }

            // @UNIQUE (SMALLSEAT): must follow type played by Teller (if possible)
            const mustFollowTeller = this.config.rulebook.mustFollowTellerType && player != this.getTeller()
            if(mustFollowTeller)
            {
                typesAllowed = [tellerCard.type];
                allowDisobey = true;
            }

            const vote = player.getValidVote(sim, typesAllowed, this.config, true, allowDisobey);
            if(vote) { num++; }
            newRound.addCard(vote);

            // If they had to follow, but decided to disobey, this "costs" a card
            if(mustFollowTeller)
            {
                const didntFollow = vote && !typesAllowed.includes(vote.type);
                const couldHaveFollowed = player.hasAnyOfTypes(typesAllowed);
                if(didntFollow && couldHaveFollowed)
                {
                    const randomPlayer = this.getRandomPlayer([player]);
                    const randomCard = player.getRandomCards(1, true);
                    randomPlayer.addCard(randomCard);
                }
            }
        }
        sim.stats.numVotesCast += num;
        this.cardsPlayed = newRound;
    }

    // Round; Step 2) Find the winner
    getWinner(sim:InteractiveExampleSimulator, counterClockwise = false)
    {
        const numPlayers = this.countPlayers();
        const dir = counterClockwise ? -1 : 1;
        const typesIncluded = this.cardsPlayed.getUniqueTypes();

        // first try a simple vote count
        // if that has no ties (just one "most occurring"), return that
        const mostVotes = this.getMostOccurringVotes();
        if(this.config.rulebook.roundWinRule == "mostVotes")
        {
            if(mostVotes.length == 1) 
            {
                sim.stats.numRoundsDecidedByMajority++;
                return new Sequence(mostVotes[0]); 
            } 
        }

        // if turned on, just return whoever is closest
        if(this.config.rulebook.roundWinTieBreaker == "distToKingseat")
        {
            sim.stats.numRoundsWithTiedMajorities++;

            let winningType = null;
            for(let i = 0; i < numPlayers; i++)
            {
                const idx = (this.kingseat + i*dir + 2*numPlayers) % numPlayers;
                const cardPlayed = this.cardsPlayed.getCardAtIndex(idx);
                if(!cardPlayed || !mostVotes.includes(cardPlayed.type)) { continue; }
                winningType = cardPlayed.type;
                break;
            }
            return new Sequence(winningType);
        }

        sim.stats.numRoundsRequiringSequenceCheck++;

        // determine every sequence (and its metadata)
        const sequences : Sequence[] = [];
        
        for(const type of typesIncluded)
        {
            let curSequence : Sequence|null = null;
            for(let i = 0; i < numPlayers; i++)
            {
                const idx = (this.kingseat + i*dir + 2*numPlayers) % numPlayers;
                const cardPlayed = this.cardsPlayed.getCardAtIndex(idx);

                if(cardPlayed && cardPlayed.type == type)
                {
                    if(!curSequence) { curSequence = new Sequence(type, 0, i); }
                    curSequence.addLength(1);
                }

                if((!cardPlayed || cardPlayed.type != type) && curSequence)
                {
                    sequences.push(curSequence);
                    curSequence = null;
                }
            }

            if(curSequence) { sequences.push(curSequence); }
        }

        // now sort, first on length (LONGER = BETTER)
        // then break ties on distToSeat (SMALLER = BETTER, so reversed)
        sequences.sort((s1, s2) => 
        {
            if(s1.getLength() < s2.getLength()) { return 1; }
            if(s1.getLength() > s2.getLength()) { return -1; }
            
            if(s1.getDistToSeat() < s2.getDistToSeat()) { return -1; }
            if(s1.getDistToSeat() > s2.getDistToSeat()) { return 1; }
            return 0;
        });

        // @DEBUGGING
        //console.log(sequences);

        if(sequences.length > 1 && sequences[0].getLength() == sequences[1].getLength())
        {
            sim.stats.numRoundsWithTiedSequences++;
        }

        const winningSequence = sequences[0];
        return winningSequence;
    }

    getCardPlayedFor(p:Player)
    {
        return this.cardsPlayed.getCardAtIndex(this.getIndexOf(p));
    }

    getWinningPlayers(winningCards:CardThroneless[])
    {
        const arr : Player[] = [];
        for(const p of this.players)
        {
            const ourCard = this.getCardPlayedFor(p);
            if(!winningCards.includes(ourCard)) { continue; }
            arr.push(p);
        }
        return arr;
    }

    // Round; Step 3) Win/discard/handle cards
    getTeller() { return this.players[0]; } // teller status is fixed on player 0 for simplicity
    finishRound()
    {
        this.cardsPlayed.empty();
    }

    countCards(flipped = false) { return this.getCards(flipped).length; }
    getCards(flipped = false, exclude:Player[] = [], include:Player[] = []) : CardThroneless[]
    {
        let cards = [];
        for(const p of this.players)
        {
            if(include.length > 0 && !include.includes(p)) { continue; }
            if(exclude.includes(p)) { continue; }
            for(let i = 0; i < p.count(); i++)
            {
                if(p.flipped[i] != flipped) { continue; }
                if(!p.cards[i]) { continue; }
                cards.push(p.cards[i]);
            }
        }
        return cards;
    }

    getValidSwapTarget(p:Player, winningCards: CardThroneless[]) : Player
    {
        const leaderPlayer = this.getKingseatPlayer();

        // @UNIQUE (QUEENSEAT): swaps with leader are restricted, so either
        // exclude them if we're not allowed, or do it in the rare case we've achieved these conditions
        if(this.config.rulebook.leaderSwapHasRestrictions && p != leaderPlayer)
        {
            const leaderWon = this.cardsPlayed.getCardAtIndex(this.kingseat) == null;
            const winningType = winningCards[0].type;

            const leaderPublicCards = leaderPlayer.getCardsWithFlipped(true);
            const yourPublicCards = p.getCardsWithFlipped(true);

            const youHaveMoreOfWinningType = this.countTypeInList(leaderPublicCards, winningType) <= this.countTypeInList(yourPublicCards, winningType);

            if(youHaveMoreOfWinningType) {
                return leaderPlayer;
            } else {
                return this.getRandomPlayer([p, leaderPlayer]);
            }
        }

        return this.getRandomPlayer([p]);

    }

    countTypeInList(list:CardThroneless[], tp:string)
    {
        let freq = 0;
        for(const elem of list)
        {
            if(!elem) { continue; }
            if(elem.type != tp) { continue; }
            freq++;
        }
        return freq;
    }

    countPlayers() { return this.players.length; }
    setRandomKingseat() { this.kingseat = Math.floor(Math.random() * this.countPlayers()); }
    getKingseat() { return this.kingseat; }
    isPlayerKingseat(p:Player) { return this.getIndexOf(p) == this.kingseat; }
    getKingseatPlayer() { return this.players[this.kingseat]; }
    getIndexOf(player:Player) { return this.players.indexOf(player); }
    getRandomPlayer(exclude : Player[] = [])
    {
        const arr : Player[] = [];
        for(const p of this.players)
        {
            if(exclude.includes(p)) { continue; }
            arr.push(p);
        }
        return fromArray(arr);
    }

    swapPlayers(p1:Player, p2:Player)
    {
        const tempIndexP2 = this.getIndexOf(p2);
        this.players[this.getIndexOf(p1)] = p2;
        this.players[tempIndexP2] = p1;
    }

    getUnhandledPlayers(counterClockwise = false)
    {
        const arr : Player[] = [];
        const dir = counterClockwise ? -1 : 1;
        const numPlayers = this.countPlayers();
        const startingIndex = this.kingseat;
        for(let i = 0; i < numPlayers; i++)
        {
            const idx = (startingIndex + i*dir + numPlayers ) % numPlayers; 
            const noCardLeft = this.cardsPlayed.getCardAtIndex(idx) == null;
            if(noCardLeft) { continue; }
            arr.push(this.players[idx]);
        }
        return arr;
    }

    countPlayersAtSingleCard(exclude:Player[] = [])
    {
        let num = 0;
        for(const p of this.players)
        {
            if(exclude.includes(p)) { continue; }
            if(p.count() <= 1) { num++; }
        }
        return num;
    }

    async draw(sim:InteractiveExampleSimulator)
    {
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 512;
        
        const ctx : CanvasRenderingContext2D = canvas.getContext("2d");

        const circleCenter = new Point(0.5*canvas.width, 0.5*canvas.height);
        const circleRadius = 0.33*Math.min(canvas.width, canvas.height);
        const angleOffset = 2 * Math.PI / this.players.length;

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const textConfig = new TextConfig({
            font: sim.getVisualizer().get("fonts.textLegible"),
            size: 18
        }).alignCenter();

        const groupOp = new LayoutOperation({
            effects: [new DropShadowEffect({ blurRadius: 6 })]
        })

        let angle = 1.5 * Math.PI
        for(let i = 0; i < this.countPlayers(); i++)
        {
            const p = this.players[i];
            const x = Math.cos(angle)*circleRadius + circleCenter.x;
            const y = Math.sin(angle)*circleRadius + circleCenter.y;
            const params = 
            {
                pos: new Point(x,y),
                dims: new Point(80, 125),
                rotation: angle,
                drawSeat: this.isPlayerKingseat(p),
                cardToShow: this.cardsPlayed.getCardAtIndex(i),
                textConfig: textConfig
            }
            angle += angleOffset

            const group = await p.draw(sim, params);
            group.toCanvas(ctx, groupOp);
        }

        const container = document.createElement("div");
        container.style.textAlign = "center";
        container.appendChild(canvas);
        
        sim.outputBuilder.addNode(container);
    }
}