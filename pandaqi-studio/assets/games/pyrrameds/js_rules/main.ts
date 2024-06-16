import InteractiveExampleGenerator from "js/pq_rulebook/examples/interactiveExampleGenerator";
import CardPicker from "../js_game/cardPicker";
import CONFIG from "../js_shared/config";
import shuffle from "js/pq_games/tools/random/shuffle";
import InteractiveExampleSimulator from "js/pq_rulebook/examples/interactiveExampleSimulator";
import Card from "../js_game/card";
import fromArray from "js/pq_games/tools/random/fromArray";
import Point from "js/pq_games/tools/geometry/point";
import { CardType } from "../js_shared/dict";
import Bounds from "js/pq_games/tools/numbers/bounds";
import convertCanvasToImageMultiple from "js/pq_games/layout/canvas/convertCanvasToImageMultiple";
import createContext from "js/pq_games/layout/canvas/createContext";
import ResourceImage from "js/pq_games/layout/resources/resourceImage";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import convertCanvasToImage from "js/pq_games/layout/canvas/convertCanvasToImage";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import Rectangle from "js/pq_games/tools/geometry/rectangle";

type BoardRow = Card[]
type CardPath = Point[] // might make this an interface with more data attached

const callbackInitStats = () =>
{
    return {
        numTurns: 0,
        possibleMoves: 0,
        possiblePatientMoves: 0,
        possibleMedicineMoves: 0,
        turnsWithoutPossibleMoves: 0,
        winnerStartedWithMostlyMedicine: 0,
        winnerStartedWithMostlyPatients: 0,
        sizeOfPatientPlayed:
        {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
            6: 0
        },
        numSwapTurns: 0,
        numEndlessGames: 0, // it appears to be impossible to win this game, so I just cut it off at some point and register it as an endless game
    }
}

const callbackFinishStats = (sim:InteractiveExampleSimulator) =>
{
    const s = sim.getStats();
    const numTurns = s.numTurns;
    const numIters = sim.getIterations();

    s.numTurnsAvg = s.numTurns / numIters;
    s.possibleMovesPerTurn = s.possibleMoves / numTurns;
    s.possiblePatientMovesPerTurn = s.possiblePatientMoves / numTurns;
    s.possibleMedicineMovesPerTurn = s.possibleMedicineMoves / numTurns;
    s.numEndlessGamesChance = s.numEndlessGames / numIters;
    s.turnsWithoutPossibleMovesChance = s.turnsWithoutPossibleMoves / numTurns;

    s.probabilityOfPlayingPatientOfSize = {};

    const data:Record<number, number> = s.sizeOfPatientPlayed;
    for(const [key,freq] of Object.entries(data))
    {
        const compensateForRarity = CONFIG.generation.patientNumNeedsDistribution[parseInt(key)];
        if(compensateForRarity <= 0.0) { continue; }
        s.probabilityOfPlayingPatientOfSize[parseInt(key)] = freq / compensateForRarity / numTurns;
    }
}

interface Move
{
    card: Card
    pos: Point
}

class Board
{
    rows: BoardRow[]
    possibleMoves: Move[]

    setup(cards:Card[])
    {
        this.rows = [];

        const maxRows = 2*cards.length - 1;
        const centerRow = Math.floor(0.5 * maxRows);
        for(let y = 0; y < maxRows; y++)
        {
            this.rows[y] = [];
            if(y == centerRow) { 
                this.rows[y] = cards.slice(); 
            } else {
                for(let x = 0; x < cards.length; x++)
                {
                    this.rows[y][x] = null;
                }
            }
        }
    }

    outOfBounds(pos:Point)
    {
        return pos.x < 0 || pos.x >= this.rows[0].length || pos.y < 0 || pos.y >= this.rows.length;
    }

    getCardAt(pos:Point) { if(this.outOfBounds(pos)) { return null; } return this.rows[pos.y][pos.x]; }
    hasCardAt(pos:Point) { return this.getCardAt(pos) != null; }
    setCardAt(pos:Point, c:Card) { if(this.outOfBounds(pos)) { return; } this.rows[pos.y][pos.x] = c; }

    // a direct `.include()` call will FAIL 
    // because the points might have the same content, they're unique OBJECTS still
    // hence this helper function
    listHasMatchingPoint(list:Point[], needle:Point)
    {
        for(const elem of list)
        {
            if(elem.matches(needle)) { return true; }
        }
        return false;
    }

    getAllPositions(hasCard = false, exclude = []) : Point[]
    {
        const positions = [];
        for(let y = 0; y < this.rows.length; y++)
        {
            const rowBounds = this.getRowBounds(new Point(0,y));
            for(let x = 0; x < this.rows[y].length; x++)
            {
                const pos = new Point(x,y);
                if(x < rowBounds.min || x > rowBounds.max) { continue; }
                if(hasCard && !this.hasCardAt(pos)) { continue; }
                if(this.listHasMatchingPoint(exclude, pos)) { continue; } 
                positions.push(pos);
            }
        }
        return positions;
    }

    getRandomPosition(hasCard = false, exclude = []) : Point
    {
        return fromArray( this.getAllPositions(hasCard, exclude) );
    }

    swapCardsAt(pos1:Point, pos2:Point)
    {
        const tempCardPos1 = this.getCardAt(pos1);
        this.setCardAt(pos1, this.getCardAt(pos2));
        this.setCardAt(pos2, tempCardPos1);
    }

    getCenterY()
    {
        return Math.floor(0.5 * this.rows.length);
    }

    isBelowCenter(pos:Point)
    {
        return pos.y >= this.getCenterY();
    }

    getRowOffsetFromLeft(y:number)
    {
        const centerY = this.getCenterY();
        const distToCenterY = Math.abs(y - centerY);
        if(distToCenterY % 2 == 1) { return 0.5; }
        return 0;
    }

    getRowBounds(pos:Point)
    {
        const centerY = this.getCenterY();
        const distToCenterY = Math.abs(pos.y - centerY);

        const leftBound = Math.floor(0.5*distToCenterY);
        const rightBound = this.rows[0].length - 1 - Math.ceil(0.5*distToCenterY);

        return new Bounds(leftBound, rightBound);
    }

    getAllNeighborsOf(pos:Point) : Point[]
    {
        const offsetLeft = Math.round(this.getRowOffsetFromLeft(pos.y));

        // @TODO: not sure if this is correct or needs to be different based on direction
        const offsets = [
            new Point(1,0), new Point(-1 + offsetLeft,1), new Point(0 + offsetLeft,1), 
            new Point(-1,0), new Point(-1 + offsetLeft,-1), new Point(0 + offsetLeft,-1)
        ];

        const nbs = [];
        for(const offset of offsets)
        {
            const nbPos = pos.clone().add(offset);
            if(!this.hasCardAt(nbPos)) { continue; }
            nbs.push(nbPos);
        }
        
        return nbs;
    }
    
    getLowerNeighborsOf(pos:Point)
    {
        const offsetLeft = Math.round(this.getRowOffsetFromLeft(pos.y));

        let offsets = [ new Point(-1+offsetLeft,1), new Point(0 + offsetLeft,1) ];
        if(this.isBelowCenter(pos))
        {
            offsets = [ new Point(-1+offsetLeft,-1), new Point(0 + offsetLeft,-1) ];
        }

        const rowBounds = this.getRowBounds(pos);

        const positions = [];
        for(const offset of offsets)
        {
            const newPos = pos.clone().add(offset);
            if(newPos.x < rowBounds.min || newPos.x > rowBounds.max) { continue; }
            if(this.outOfBounds(newPos)) { continue; } // @TODO: shouldn't be necessary, right?
            positions.push(newPos);
        }

        return positions;
    }

    getOpenLocations() : Point[]
    {
        const allPositions = this.getAllPositions();

        const arr = [];
        for(const pos of allPositions)
        {
            if(this.hasCardAt(pos)) { continue; }

            const neighbors = this.getLowerNeighborsOf(pos);

            let hasNeighborWithCard = false;
            for(const nb of neighbors)
            {
                if(this.hasCardAt(nb)) { hasNeighborWithCard = true; }
            }

            if(!hasNeighborWithCard) { continue; }

            arr.push(pos);
        }
        return arr;
    }

    applyMove(m:Move) { this.setCardAt(m.pos, m.card); }
    getValidMovesFor(p:Player) : Move[]
    {
        const cards = p.getCards();
        const openLocations = this.getOpenLocations();
        const validMoves = [];
        for(const card of cards)
        {
            // build list of valid locations for this card
            const validLocations = [];
            for(const pos of openLocations)
            {
                if(!this.isValidMove(card, pos)) { continue; }
                validLocations.push(pos);
            }

            // add as correct moves to list
            for(const pos of validLocations)
            {
                validMoves.push({ card: card, pos: pos });
            }
        }

        return validMoves;
    }

    isValidMove(card:Card, pos:Point)
    {
        // A MEDICINE card ...
        if(card.type == CardType.MEDICINE) 
        {
            const nbs = this.getLowerNeighborsOf(pos);
            const nbCards = [];
            for(const nb of nbs)
            {
                if(!this.hasCardAt(nb)) { continue; }
                nbCards.push(this.getCardAt(nb));
            }

            if(nbCards.length <= 0) { return false; }

            // ... needs to be higher if it's a single neighbor below
            const reqsAsNum = CONFIG.rulebook.reqsOnCardFunctionAsItsNumber;
            const myNum = card.getNumber();
            const num1 = nbCards[0].getNumber(reqsAsNum);
            if(nbCards.length == 1)
            {
                if(CONFIG.rulebook.ifSingleNeighborMustBeHigher) { return myNum > num1; }
                return myNum < num1 || myNum > num1;
            }

            // ... otherwise needs to be higher OR lower than both numbers
            const num2 = nbCards[1].getNumber(reqsAsNum);
            return (myNum > num1 && myNum > num2) || (myNum < num1 && myNum < num2);
        }
        
        // A PATIENT card ...
        if(card.type == CardType.PATIENT) 
        {
            // ... generates all paths through medicine (no backtracking)
            const maxPathLength = card.requirements.length;
            const paths = this.getAllPathsFrom(pos, maxPathLength, card.requirements);

            // ... to check if any matches our requirements
            const validPaths = [];
            for(const path of paths)
            {
                const types = [];
                for(const pos of path) { types.push(this.getCardAt(pos).key); }
                if(!this.listMatches(card.requirements, types)) { continue; }
                validPaths.push(path);
            }

            return validPaths.length > 0;
        }
    }

    // this ensures arr1 contains all elements from arr2,
    // regardless of order or any noise in between
    listMatches(arr1:string[], arr2:string[])
    {
        const arr = arr1.slice();
        for(const elem of arr2)
        {
            const idx = arr.indexOf(elem);
            if(idx < 0) { continue; }
            arr.splice(idx, 1);
        }
        return arr.length <= 0;
    }

    getAllPathsFrom(pos:Point, maxLength:number, typesAllowed:string[]) : CardPath[]
    {
        const paths = [];
        const pathsToExtend = [[pos]];
        while(pathsToExtend.length > 0)
        {
            const path = pathsToExtend.pop();
            const lastPos = path[path.length - 1];
            const nbs = this.getAllNeighborsOf(lastPos);

            const dirs = [];
            for(let i = 1; i < path.length; i++)
            {
                dirs.push(new Point(path[i].x - path[i-1].x, path[i].y - path[i-1].y));
            }

            for(const nb of nbs)
            {
                const nbCard = this.getCardAt(nb);
                if(nbCard.type != CardType.MEDICINE) { continue; }
                
                if(CONFIG.rulebook.forbidSuperfluousTypesOnPaths)
                {
                    if(!typesAllowed.includes(nbCard.key)) { continue; }
                }

                if(CONFIG.rulebook.forbidBackwardMovesOnPaths)
                {
                    let isBackwardMove = false;
                    const newDir = new Point(nb.x - lastPos.x, nb.y - lastPos.y);
                    for(const dir of dirs)
                    {
                        if(newDir.x != dir.x && !(dir.x == 0 || newDir.x == 0)) { isBackwardMove = true; break; }
                        if(newDir.y != dir.y && !(dir.y == 0 || newDir.y == 0)) { isBackwardMove = true; break; }
                    }
                    if(isBackwardMove) { continue; }
                }

                // create duplicated version of path with new element added to end
                const newPath = path.slice();
                newPath.push(nb);

                // if path has reached maximum length, save it definitively, but cut off starting card
                // otherwise, just add it to the list of paths we still need to extend later
                if(newPath.length >= (maxLength+1)) { paths.push(newPath.slice(1)); }
                else { pathsToExtend.push(newPath); }
            }
        }

        return paths;
    }

    async draw(sim:InteractiveExampleSimulator)
    {
        const canvSize = CONFIG.rulebook.boardCanvasSize;
        const ctx = createContext({ size: canvSize, alpha: false });
        fillCanvas(ctx, "#FFFFFF");

        const maxSizeX = canvSize.x / this.rows[0].length;
        const maxSizeY = canvSize.y / this.rows.length;
        const validSizeX = Math.min(maxSizeX, maxSizeY / 1.4)
        const validSizeY = Math.min(maxSizeX * 1.4, maxSizeY);

        let cardSize = new Point(validSizeX, validSizeX * 1.4);
        if(validSizeX > validSizeY/1.4)
        {
            cardSize = new Point(validSizeY / 1.4, validSizeY);
        }

        // needed to neatly center the entire thing on the canvas
        const margin = 4;
        const cardSizeWithMargin = cardSize.clone().sub(new Point(margin));
        const cardSizePossibleMove = cardSizeWithMargin.clone().sub(new Point(2*margin));
        const pyramidBounds = new Point(
            (this.rows[0].length-0.5) * cardSize.x,
            (this.rows.length-0.5) * cardSize.y
        )
        const centeringOffset = canvSize.clone().scale(0.5).sub( pyramidBounds.clone().scale(0.5));

        // just loop through grid and draw each card with correct offset (if it exists, of course)
        for(let y = 0; y < this.rows.length; y++)
        {
            const offsetX = this.getRowOffsetFromLeft(y);
            for(let x = 0; x < this.rows[y].length; x++)
            {
                const pos = new Point(x,y);
                const card = this.getCardAt(pos);
                const realPos = new Point((offsetX + x) * cardSize.x, y * cardSize.y);
                realPos.add(centeringOffset);

                if(!card)
                {
                    let isPossibleMove = false;
                    for(const move of this.possibleMoves)
                    {
                        if(move.pos.matches(pos)) { isPossibleMove = true; break; }
                    }

                    if(isPossibleMove)
                    {
                        const rect = new ResourceShape( new Rectangle({ center: realPos, extents: cardSizePossibleMove }) );
                        const opRect = new LayoutOperation({
                            fill: "#FFAAAA"
                        });
                        rect.toCanvas(ctx, opRect);
                    }

                    continue; 
                }

                // draw the resource to the canvas with the settings we just calculated
                const res = new ResourceImage( await card.drawForRules(sim.getVisualizer()) );
                const op = new LayoutOperation({
                    translate: realPos,
                    dims: cardSizeWithMargin,
                    pivot: Point.CENTER
                })
                res.toCanvas(ctx, op);
            }
        }

        // don't forget to actually add the result back into example builder, Tiamo!
        const img = await convertCanvasToImage(ctx.canvas);
        img.style.maxHeight = "none";
        sim.outputBuilder.addNode(img);
    }
}

class Player
{
    num = -1
    cards: Card[] = []

    constructor(n:number)
    {
        this.num = n;
    }

    getCards() { return this.cards.slice(); }
    count() { return this.cards.length; }
    addCard(c:Card) { this.cards.push(c); }
    addCards(cards:Card[])
    {
        for(const card of cards) { this.addCard(card); }
    }

    removeCard(c:Card)
    {
        const idx = this.cards.indexOf(c);
        if(idx < 0) { return; }
        return this.cards.splice(idx,1)[0];
    }

    pickMove(validMoves:Move[], board:Board) : Move
    {
        const move = fromArray(validMoves);
        this.removeCard(move.card);
        board.applyMove(move);
        return move;
    }

    swapCards(board:Board)
    {
        const pos1 = board.getRandomPosition(true);
        const pos2 = board.getRandomPosition(true, [pos1]);
        board.swapCardsAt(pos1, pos2);
        return [pos1, pos2];
    }

    async draw(sim:InteractiveExampleSimulator)
    {
        const canvases = [];
        for(const card of this.cards)
        {
            canvases.push(await card.drawForRules(sim.getVisualizer()));
        }
        return convertCanvasToImageMultiple(canvases);
    }
}


const generate = async (sim:InteractiveExampleSimulator) =>
{
    const numPlayers = CONFIG.rulebook.numPlayerBounds.randomInteger() ?? 4;
    const maxNumCards = CONFIG.rulebook.numCardsInDeck ?? 36;
    const allCards = shuffle(sim.getPicker("card").get().slice()).splice(0, maxNumCards);

    const startingRowSize = CONFIG.rulebook.startingRowSize ?? 6;

    // setup
    const board = new Board();
    board.setup(allCards.splice(0, startingRowSize));

    const players = [];
    const numCardsPerPlayer = Math.floor(allCards.length / numPlayers);
    for(let i = 0; i < numPlayers; i++)
    {
        const p = new Player(i);
        p.addCards(allCards.splice(0, numCardsPerPlayer));
        players.push(p);
    }

    // we keep a copy for tracking some stats about "luck" in starting hands at the end
    const startingHandsCopy = [];
    for(const p of players)
    {
        startingHandsCopy.push(p.getCards());
    }

    // if we only display a single turn, "simulate ahead" to get a random board that's already semi-filled
    if(sim.displaySingleTurn())
    {
        const numTurnsAhead = CONFIG.rulebook.preSimulateTurnsBounds.randomInteger();
        let counter = 0;
        let player0HasTooManyCards = true;
        while(player0HasTooManyCards)
        {
            const player = players[counter];
            const validMoves = board.getValidMovesFor(player);
            if(validMoves.length > 0) {
                player.pickMove(validMoves, board);
            } else {
                player.swapCards(board);
            }
            counter = (counter + 1) % numPlayers;

            player0HasTooManyCards = players[0].count() > 5;
        }
    }

    let continueTheGame = true;
    let counter = 0;
    let winningPlayer : Player = null;
    const maxTurns = 100;
    let numTurns = 0;
    while(continueTheGame)
    {
        // PHASE 1) display current state
        const player : Player = players[counter];
        numTurns++;
        sim.print("You have these cards in your hands.");
        await sim.listImages(player, "draw");

        const validMoves = board.getValidMovesFor(player);
        sim.stats.possibleMoves += validMoves.length;
        if(validMoves.length <= 0) { sim.stats.turnsWithoutPossibleMoves++; }

        let numMedicine = 0;
        let numPatient = 0;
        for(const move of validMoves)
        {
            if(move.card.type == CardType.MEDICINE) { numMedicine++; }
            if(move.card.type == CardType.PATIENT) { numPatient++; }
        }
        sim.stats.possibleMedicineMoves += numMedicine;
        sim.stats.possiblePatientMoves += numPatient;

        sim.print("The board looks as follows. You have " + validMoves.length + " possible moves (marked with red rectangles).");
        board.possibleMoves = validMoves;
        await sim.outputAsync(board, "draw");

        // PHASE 2) decide: play a card or swap 2 cards?
        const playCard = validMoves.length > 0;
        if(playCard) {
            const move = player.pickMove(validMoves, board);
            sim.print("You decide to play <strong>" + move.card.toRulesString() + "</strong>.");

            if(move.card.type == CardType.PATIENT) 
            { 
                const numReqs = move.card.requirements.length;
                sim.stats.sizeOfPatientPlayed[numReqs]++; 
                sim.print("Great! You played a patient with " + numReqs + " requirements. You may ask another player to reveal a card to you that many times.");
            }
        } else {            
            const positions = player.swapCards(board);
            const card1 = board.getCardAt(positions[0]);
            const card2 = board.getCardAt(positions[1]);
            sim.print("You decide to swap cards.");
            sim.print("You reveal a hand card to all players that matches one of the cards you swap: <strong>" + card1.toRulesString() + "</strong> <-> <strong>" + card2.toRulesString() + "</strong>.");
            sim.stats.numSwapTurns++;
        }

        // PHASE 3) display the results of that
        sim.print("At the end of your turn, the board looks as follows.");
        board.possibleMoves = [];
        await sim.outputAsync(board, "draw");
        
        // PHASE 4) check if game should continue
        counter = (counter + 1) % numPlayers;
        continueTheGame = true;
        for(const p of players)
        {
            if(p.count() > 0) { continue; }
            winningPlayer = p;
            continueTheGame = false;
            break;
        }

        if(sim.displaySingleTurn()) { continueTheGame = false; }
        if(numTurns > maxTurns) { continueTheGame = false; sim.stats.numEndlessGames++; numTurns = 0; } // don't register these games as they skew the data
    }

    if(winningPlayer)
    {
        const startingHand = startingHandsCopy[winningPlayer.num];
        const numPerType = { [CardType.MEDICINE]: 0, [CardType.PATIENT]: 0, [CardType.SPECIAL]: 0 };
        for(const card of startingHand)
        {
            numPerType[card.type]++;
        }

        if(numPerType[CardType.MEDICINE] > numPerType[CardType.PATIENT]) { 
            sim.stats.winnerStartedWithMostlyMedicine++;
        } else {
            sim.stats.winnerStartedWithMostlyPatients++;
        }
    }

    sim.stats.numTurns += numTurns;
}

const SIMULATION_ENABLED = false;
const SIMULATION_ITERATIONS = 500;
const SHOW_FULL_GAME = false;

const gen = new InteractiveExampleGenerator({
    id: "turn",
    buttonText: "Give me an example turn!",
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