import Point from "js/pq_games/tools/geometry/point";
import Card from "../js_game/card";
import Player from "./player";
import InteractiveExampleSimulator from "js/pq_rulebook/examples/interactiveExampleSimulator";
import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import ResourceImage from "js/pq_games/layout/resources/resourceImage";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import convertCanvasToImage from "js/pq_games/layout/canvas/convertCanvasToImage";
import CONFIG from "../js_shared/config";
import { DYNAMIC_OPTIONS } from "../js_shared/dict";
import fromArray from "js/pq_games/tools/random/fromArray";

const NBS = [Point.RIGHT, Point.DOWN, Point.LEFT, Point.UP];

interface Move
{
    pos:Point,
    card:Card
}

interface AggregateCardData
{
    suits:string[],
    numbers:number[],
    suitFreqs:Record<string,number>,
    numberFreqs:Record<number, number>,
    suitsUnique?:string[],
    numbersUnique?:number[]
}

export default class Board
{
    map: Card[][]
    cache: Record<string,any> = {}
    useCache: boolean = false
    suitWildcard: string;
    numberWildcard: number;

    createGrid(size:Point)
    {
        const map = [];
        for(let x = 0; x < size.x; x++)
        {
            map[x] = [];
            for(let y = 0; y < size.y; y++)
            {
                map[x][y] = null;
            }
        }
        this.map = map;
        this.resetCache();
    }

    enableCache() 
    { 
        // call all functions to be cached once
        this.getAllPositions(true);
        this.getAllCards();
        this.getPropStats("number");
        this.getPropStats("suit");
        this.getAllUniqueOfProp("number");
        this.getAllUniqueOfProp("suit");
        this.getRowStats();

        // from now on, we just use those results
        this.useCache = true; 
    }
    
    addToCache(key:string, val:any) { this.cache[key] = val; }
    readFromCache(key:string) { return this.cache[key]; }
    resetCache() 
    { 
        this.useCache = false;
        this.cache = 
        {
            propStats: {},
            uniqueOfProp: {}
        }; 
    }

    addStartingCards(cards:Card[])
    {
        const offsetX = Math.floor(0.5*(this.map.length - cards.length));
        const offsetY = Math.floor(0.5*this.map[0].length);

        let counter = 0;
        for(const card of cards)
        {
            const pos = new Point(offsetX + counter, offsetY);
            this.addCard(pos, card);
            counter++;
        }
    }

    hasCardAt(pos:Point) { return this.getCard(pos) != null; }
    getCard(pos:Point)
    {
        if(this.outOfBounds(pos)) { return null; }
        return this.map[pos.x][pos.y];
    }

    outOfBounds(pos:Point)
    {
        return pos.x < 0 || pos.x >= this.map.length || pos.y < 0 || pos.y >= this.map[0].length;
    }

    addCard(pos:Point, c:Card)
    {
        this.map[pos.x][pos.y] = c;
    }

    doMove(move:Move)
    {
        this.addCard(move.pos, move.card);
    }

    getAllCards() : Card[]
    {
        if(this.useCache) { return this.readFromCache("allCards"); }

        const arr = [];
        for(let x = 0; x < this.map.length; x++)
        {
            for(let y = 0; y < this.map[x].length; y++)
            {
                const pos = new Point(x,y);
                const card = this.getCard(pos);
                if(!card) { continue; }
                arr.push(card);
            }
        }
        this.addToCache("allCards", arr);
        return arr;
    }

    getAllPositions(hasCard = null) : Point[]
    {
        if(this.useCache) { return this.readFromCache("allPositions"); }

        const arr = [];
        for(let x = 0; x < this.map.length; x++)
        {
            for(let y = 0; y < this.map[x].length; y++)
            {
                const pos = new Point(x,y);
                if(hasCard != null && this.hasCardAt(pos) != hasCard) { continue; }
                arr.push(pos);
            }
        }
        this.addToCache("allPositions", arr);
        return arr;
    }

    getNeighborCardsOf(pos:Point) : Card[]
    {
        const nbPositions = this.getNeighborPositionsOf(pos, true);
        const arr = [];
        for(const nbPos of nbPositions)
        {
            arr.push(this.getCard(nbPos));
        }
        return arr;
    }

    getNeighborPositionsOf(pos:Point, hasCard = null) : Point[]
    {
        const arr = [];
        for(const NB_OFFSET of NBS)
        {
            const nbPos = pos.clone().add(NB_OFFSET);
            if(this.outOfBounds(nbPos)) { continue; }
            if(hasCard != null && !this.hasCardAt(nbPos)) { continue; }
            arr.push(nbPos);
        }
        return arr;
    }

    getNeighborData(pos:Point) : AggregateCardData
    {
        const nbs = this.getNeighborPositionsOf(pos);
        const data = this.createNewAggregateData();
        for(const nb of nbs)
        {
            if(!this.hasCardAt(nb)) { continue; }
            const card = this.getCard(nb);
            this.trackCardInAggregateData(data, card);
        }
        this.finishAggregateData(data);
        return data;
    }

    pickRandomWildcard()
    {
        const suitsInGame = DYNAMIC_OPTIONS["%suit%"];
        const numbersInGame = DYNAMIC_OPTIONS["%number%"];

        this.suitWildcard = null;
        this.numberWildcard = null;
        
        const pickSuit = Math.random() <= 0.66;
        if(pickSuit)
        {
            this.suitWildcard = fromArray(suitsInGame);
            return this.suitWildcard;
        }

        this.numberWildcard = fromArray(numbersInGame);
        return this.numberWildcard;
    }

    getValidPositions(card:Card)
    {
        const allPosNoCard = this.getAllPositions(false);
        const validPositions = [];

        const useWildcards = CONFIG.rulebook.validMoves.allowPickingWildcard;
        for(const pos of allPosNoCard)
        {
            const nbData = this.getNeighborData(pos);
            const hasNoNeighbor = nbData.suits.length <= 0;
            if(hasNoNeighbor) { continue; }

            // check the suit situation
            let matchingSuits = false;
            const neighborSuits = nbData.suitsUnique.slice();
            let ourSuit = card.suit;
            
            // pretend the wildcard cards aren't there
            // and update our suit to match first neighbor if needed
            // this SHOULD automatically make the checks below work too (regardless of wildcard enabled or not)
            if(useWildcards && this.suitWildcard)
            {
                const wildcard = this.suitWildcard;
                if(ourSuit == wildcard) { ourSuit = neighborSuits[0]; }
                while(neighborSuits.includes(wildcard))
                {
                    neighborSuits.splice(neighborSuits.indexOf(wildcard), 1);
                }
            }

            if(CONFIG.rulebook.validMoves.ifAnySuitMatch) 
            {
                matchingSuits = nbData.suits.includes(ourSuit);
            }

            if(CONFIG.rulebook.validMoves.ifAllSuitsMatch)
            {
                matchingSuits = neighborSuits.length <= 0 || ((neighborSuits.length == 1) && neighborSuits[0] == ourSuit);
            }
            
            // check the number situation
            let maxNumberDist = 0;
            const ourNumber = card.number;
            for(const number of nbData.numbers)
            {
                maxNumberDist = Math.max(Math.abs(card.number - number), maxNumberDist);
                
                if(useWildcards && this.numberWildcard) 
                { 
                    if(ourNumber == this.numberWildcard || number == this.numberWildcard) 
                    {
                        maxNumberDist = 0; 
                    }
                }
            }
            const matchingNumbers = maxNumberDist <= CONFIG.rulebook.validMoves.ifDistToNumberAtMost;
            
            if(!(matchingSuits || matchingNumbers)) { continue; }

            validPositions.push(pos);
        }
        return validPositions;
    }

    getValidMovesFor(player:Player) : Move[]
    {
        const arr = [];
        for(const card of player.getCards())
        {
            const validPositions = this.getValidPositions(card);
            for(const pos of validPositions)
            {
                arr.push({ pos, card });
            }
        }
        return arr;
    }

    countCardsWith(prop:string, val:any) { return this.getPositionsWith(prop, val).length; }
    getPositionsWith(prop:string, val:any) : Point[]
    {
        const allPositions = this.getAllPositions(true);
        const arr = [];
        for(const pos of allPositions)
        {
            const card = this.getCard(pos);
            if(card[prop] != val) { continue; }
            arr.push(pos);
        }
        return arr;
    }

    getCardsWith(prop:string, val:any)
    {
        const allPositions = this.getAllPositions(true);
        const arr = [];
        for(const pos of allPositions)
        {
            const card = this.getCard(pos);
            if(card[prop] != val) { continue; }
            arr.push(card);
        }
        return arr;
    }

    hasNumberSetWithSuits(freq:number, suitsAllowed:string[], suitsForbidden:string[] = [], numNeeded = 1)
    {
        const stats = this.getPropStats("number");

        // first find all numbers that appear (at least) this often
        const sets = [];
        for(const [key,freq] of Object.entries(stats))
        {
            if(freq < freq) { continue; }
            sets.push(parseInt(key));
        }

        // filter the ones with the wrong suit
        let numFound = 0;
        for(const set of sets)
        {
            const allOfNumber = this.getCardsWith("number", set);
            const valid = [];
            for(const card of allOfNumber)
            {
                if(suitsForbidden.includes(card.suit)) { continue; }
                if(suitsAllowed.length > 0 && !suitsAllowed.includes(card.suit)) { continue; }
                valid.push(card);
            }
            if(valid.length < freq) { continue; }
            numFound++;
            if(numFound >= numNeeded) { return true; }
        }
        return false;
    }

    getPropStats(prop:string) : Record<string, number>
    {
        if(this.useCache) { return this.cache.propStats[prop]; }

        const stats = {};
        const cards = this.getAllCards();
        for(const card of cards)
        {
            const val = card[prop];
            if(!stats[val]) { stats[val] = 0; }
            stats[val]++;
        }

        this.cache.propStats[prop] = stats;
        return stats;
    }

    countDuplicatesOf(prop:string, threshold:number)
    {
        const stats = this.getPropStats(prop);
        for(const [key,freq] of Object.entries(stats))
        {
            if(freq >= threshold) { return true; }
        }
        return false;
    }

    countDuplicateSetsOf(prop:string, setSize:number, threshold:number)
    {
        const stats = this.getPropStats(prop);
        let numSets = 0;
        for(const [key,freq] of Object.entries(stats))
        {
            if(freq >= setSize) { numSets++; }
        }
        return numSets >= threshold;
    }

    getAllUniqueOfProp(prop:string)
    {
        if(this.useCache) { return this.cache.uniqueOfProp[prop]; }

        const set : Set<any> = new Set();
        for(const card of this.getAllCards())
        {
            set.add(card[prop]);
        }
        const arr = Array.from(set);
        this.cache.uniqueOfProp[prop] = arr;
        return arr;
    }

    createNewAggregateData() : AggregateCardData
    {
        return { 
            suits: [], 
            suitFreqs: {},
            numbers: [], 
            numberFreqs: {}
        };
    }

    trackCardInAggregateData(data:AggregateCardData, card:Card)
    {
        if(!card) { return; }

        data.suits.push(card.suit);
        if(!data.suitFreqs[card.suit]) { data.suitFreqs[card.suit] = 0; }
        data.suitFreqs[card.suit]++;

        data.numbers.push(card.number);
        if(!data.numberFreqs[card.number]) { data.numberFreqs[card.number] = 0; }
        data.numberFreqs[card.number]++;
    }

    finishAggregateData(data:AggregateCardData)
    {
        data.suitsUnique = Object.keys(data.suitFreqs);
        data.numbersUnique = Object.keys(data.numberFreqs).map((x) => parseInt(x));
    }

    getColumn(x:number) { return this.map[x]; }
    getRow(y:number)
    {
        const arr = [];
        for(let x = 0; x < this.map.length; x++)
        {
            arr.push(this.map[x][y]);
        }
        return arr;
    }

    getRowStats() : AggregateCardData[]
    {
        if(this.useCache) { return this.readFromCache("rowStats"); }

        const lists = [];
        for(let x = 0; x < this.map.length; x++)
        {
            lists.push( this.getColumn(x) );
        }

        for(let y = 0; y < this.map[0].length; y++)
        {
            lists.push( this.getRow(y) );
        }

        const stats = [];
        for(const list of lists)
        {
            const data : AggregateCardData = this.createNewAggregateData();

            for(const card of list)
            {
                this.trackCardInAggregateData(data, card);
            }

            this.finishAggregateData(data);
            stats.push(data);
        }

        this.addToCache("rowStats", stats);
        return stats;
    }

    hasStraightOfLength(targetLength:number)
    {
        const stats = this.getPropStats("number");
        const numbersOnBoard = Object.keys(stats).map((x) => parseInt(x)).sort();
        
        let curSequenceLength = 1;
        let prevNum = null;
        for(const num of numbersOnBoard)
        {
            if(prevNum != null && num == (prevNum+1)) { curSequenceLength++; } // add to existing sequence
            else { curSequenceLength = 1; } // or reset to a new one
            prevNum = num;

            if(curSequenceLength >= targetLength) { return true; }
        }
        return false;
    }

    hasRoyalFlush(targetLength:number, mustBeAdjacent = false)
    {
        const allNumbersInGame = DYNAMIC_OPTIONS["%number%"].slice();
        const highestNumberInGame = allNumbersInGame[allNumbersInGame.length - 1];

        const inNumericalOrder = (pathSoFar:Card[], newOption:Card) =>
        {
            if(pathSoFar.length <= 0) { return true; }
            return newOption.number == (pathSoFar[pathSoFar.length-1].number + 1);
        }

        const callback = (pathSoFar:Card[], newOption:Card) =>
        {
            const numOrd = inNumericalOrder(pathSoFar, newOption);
            const sameSuit = pathSoFar.length > 0 ? pathSoFar[0].suit == newOption.suit : true;
            const lastCardHighest = pathSoFar.length == (targetLength - 1) ? newOption.number == highestNumberInGame : true;
            return numOrd && sameSuit && lastCardHighest;
        }
        return this.hasSequenceOfLength(callback, targetLength, mustBeAdjacent);
    }

    indexPointInList(list:Point[], pos:Point)
    {
        for(let i = 0; i < list.length; i++)
        {
            if(pos.matches(list[i])) { return i; }
        }
        return  -1;
    }

    hasSequenceOfLength(callback:Function, maxLength:number, mustBeAdjacent = false)
    {
        const allPositions = this.getAllPositions(true);
        const optionsToExtend : Point[][] = [[]];
        while(optionsToExtend.length > 0)
        {
            const option = optionsToExtend.pop();
            let nbPositions = [];

            // the first "empty sequence" starts by adding all possible cards in the game
            // afterwards, when we DO already have a previous card, we only add neighbors
            if(option.length <= 0) {
                nbPositions = allPositions.slice();
            } else {
                const lastPos = option[option.length - 1];

                if(mustBeAdjacent) {
                    nbPositions = this.getNeighborPositionsOf(lastPos, true);
                } else {
                    nbPositions = allPositions.slice();
                }
            }

            // @TODO: this is REALLY EXPENSIVE to recalculate all the time; but I see no cleaner/easier way to keep the original lists nice positions, but give cards to callback function?
            const optionAsCards = [];
            for(const pos of option)
            {
                const idxInPathAlready = this.indexPointInList(nbPositions, pos);
                if(idxInPathAlready >= 0) { nbPositions.splice(idxInPathAlready, 1); }
                optionAsCards.push(this.getCard(pos));
            }

            for(const nbPos of nbPositions)
            {
                const valid = callback(optionAsCards, this.getCard(nbPos)); 
                if(!valid) { continue; }

                const newOption = option.slice();
                newOption.push(nbPos);

                if(newOption.length >= maxLength) { return true; }
                optionsToExtend.push(newOption);
            }
        }
        return false;
    }

    async draw(sim:InteractiveExampleSimulator)
    {
        const canvSize = CONFIG.rulebook.boardCanvasSize;
        const ctx = createContext({ size: canvSize, alpha: false });
        fillCanvas(ctx, "#FFFFFF");

        const sizeY = canvSize.y / this.map[0].length;
        const sizeX = sizeY / 1.4;
        const cardSize = new Point(sizeX, sizeY);
        const cardSizeWithMargin = cardSize.clone().sub(new Point(4));

        const mapBounds = new Point(sizeX * this.map.length, sizeY * this.map[0].length);

        // needed to neatly center the entire thing on the canvas
        const centeringOffset = canvSize.clone().scale(0.5).sub( mapBounds.clone().scale(0.5)).add( cardSize.clone().scale(0.5));

        // just loop through grid and draw each card with correct offset (if it exists, of course)
        for(let x = 0; x < this.map.length; x++)
        {
            for(let y = 0; y < this.map[x].length; y++)
            {
                const pos = new Point(x,y);
                const card = this.getCard(pos);
                if(!card) { continue; }

                const realPos = new Point(x * cardSize.x, y * cardSize.y);
                realPos.add(centeringOffset);

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