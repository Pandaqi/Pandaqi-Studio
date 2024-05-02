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

const NBS = [Point.RIGHT, Point.DOWN, Point.LEFT, Point.UP];

interface Move
{
    pos:Point,
    card:Card
}

interface RowData
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
    }

    getAllCards() : Card[]
    {
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
        return arr;
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

    getAllPositions(hasCard = null) : Point[]
    {
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

    isAdjacentToCard(pos:Point)
    {
        const nbs = this.getNeighborPositionsOf(pos);
        for(const nb of nbs)
        {
            if(this.hasCardAt(nb)) { return true; }
        }
        return false;
    }

    getNeighborData(pos:Point)
    {
        const nbs = this.getNeighborPositionsOf(pos);
        const data = { suits: [], numbers: [] };
        for(const nb of nbs)
        {
            if(!this.hasCardAt(nb)) { continue; }
            const card = this.getCard(nb);
            data.suits.push(card.suit);
            data.numbers.push(card.number);
        }
        return data;
    }

    getValidPositions(card:Card)
    {
        const allPosNoCard = this.getAllPositions(false);
        const validPositions = [];

        for(const pos of allPosNoCard)
        {
            const nbData = this.getNeighborData(pos);
            const hasNoNeighbor = nbData.suits.length <= 0;
            if(hasNoNeighbor) { continue; }

            const noMatchingSuit = !nbData.suits.includes(card.suit);
            let maxNumberDist = 0;
            for(const number of nbData.numbers)
            {
                maxNumberDist = Math.max(Math.abs(card.number - number), maxNumberDist);
            }
            const numbersTooFarApart = maxNumberDist > 1;
            if(noMatchingSuit && numbersTooFarApart) { continue; }

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

    getPropStats(prop:string) : Record<string, number>
    {
        const stats = {};
        const cards = this.getAllCards();
        for(const card of cards)
        {
            const val = card[prop];
            if(!stats[val]) { stats[val] = 0; }
            stats[val]++;
        }
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
        const set : Set<any> = new Set();
        for(const card of this.getAllCards())
        {
            set.add(card[prop]);
        }
        return Array.from(set);
    }

    getRowStats() : RowData[]
    {
        const stats = [];
        for(let x = 0; x < this.map.length; x++)
        {
            const row = this.map[x];
            const data : RowData = { 
                suits: [], 
                suitFreqs: {},
                numbers: [], 
                numberFreqs: {}
            };

            for(const card of row)
            {
                if(!card) { continue; }
                
                data.suits.push(card.suit);
                if(!data.suitFreqs[card.suit]) { data.suitFreqs[card.suit] = 0; }
                data.suitFreqs[card.suit]++;

                data.numbers.push(card.number);
                if(!data.numberFreqs[card.number]) { data.numberFreqs[card.number] = 0; }
                data.numberFreqs[card.number]++;
            }

            data.suitsUnique = Object.keys(data.suitFreqs);
            data.numbersUnique = Object.keys(data.numberFreqs).map((x) => parseInt(x));
            stats.push(data);
        }
        return stats;
    }

    hasSequenceOfLength(callback:Function, maxLength:number)
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
                nbPositions = allPositions;
            } else {
                const lastPos = option[option.length - 1];
                nbPositions = this.getNeighborPositionsOf(lastPos, true);
            }

            // @TODO: this is REALLY EXPENSIVE to recalculate all the time; but I see no cleaner/easier way to keep the original lists nice positions, but give cards to callback function?
            const optionAsCards = [];
            for(const pos of option)
            {
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