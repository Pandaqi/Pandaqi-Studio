import convertCanvasToImage from "js/pq_games/layout/canvas/convertCanvasToImage";
import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceImage from "js/pq_games/layout/resources/resourceImage";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import Point from "js/pq_games/tools/geometry/point";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import InteractiveExampleSimulator from "js/pq_rulebook/examples/interactiveExampleSimulator";
import Card from "../game/card";
import { CONFIG } from "../shared/config";
import Player from "./player";
import Pair from "./pair";
import shuffle from "js/pq_games/tools/random/shuffle";
import StrokeAlign from "js/pq_games/layout/values/strokeAlign";

const NBS = [Point.RIGHT, Point.DOWN, Point.LEFT, Point.UP];

interface Move
{
    pos:Point,
    card:Card
}

export { Move };
export default class Board
{
    map: Card[][]
    size: Point
    highlightedPositions: Point[] = [];

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
        this.size = size;
    }

    getIndexAsPosition(idx:number)
    {
        return new Point(
            idx % this.size.x,
            Math.floor(idx / this.size.x),
        )
    }

    getPositionAsIndex(pos:Point)
    {
        return pos.x + this.size.x * pos.y;
    }

    addStartingCards(cards:Card[])
    {
        const size = this.size.clone().scale(0.5);
        const positions = [
            new Point(Math.floor(size.x) - 1, Math.floor(size.y) - 1),
            new Point(Math.floor(size.x), Math.floor(size.y) - 1),
            new Point(Math.floor(size.x), Math.floor(size.y)),
            new Point(Math.floor(size.x) - 1, Math.floor(size.y))
        ]

        for(let i = 0; i < positions.length; i++)
        {
            this.addCard(positions[i], cards[i]);
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
        return pos.x < 0 || pos.x >= this.size.x || pos.y < 0 || pos.y >= this.size.y;
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
        return this.map.flat().filter((x) => x != null);
    }

    getAllPositions(hasCard = null) : Point[]
    {
        const arr = [];
        for(let x = 0; x < this.size.x; x++)
        {
            for(let y = 0; y < this.size.y; y++)
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

    getPair(move:Move) : Pair
    {
        const pairs : Pair[] = [];
        const cardPlayed = move.card;
        const posPlayed = move.pos;
        for(const posOther of this.getAllPositions())
        {
            if(!(posOther.x == move.pos.x || posOther.y == move.pos.y)) { continue; }
            if(!this.hasCardAt(posOther)) { continue; }
            
            const cardOther = this.getCard(posOther)
            if(cardOther == cardPlayed) { continue; }
            if(cardOther.color != cardPlayed.color) { continue; }
            const p = new Pair(cardPlayed, posPlayed, cardOther, posOther);
            pairs.push(p);
        }

        if(pairs.length <= 0) 
        {
            console.error("Could not pair, that's always a MISTAKE!");
            return null;
        }

        shuffle(pairs); // @NOTE: to prevent any inherent fixed order when picking pairs (from left->right, up->down)

        // pick only the one with the largest range
        // @NOTE: DISTANCE doesn't matter! I chose this because "large range" is interesting, uses more of the board, and increases the chance of distance > 3 (mostly in the end-game)
        let largestRange = -Infinity;
        let bestPair = null;
        for(const pair of pairs)
        {
            const rangeSize = pair.getRangeSize();
            if(rangeSize <= largestRange) { continue; }
            largestRange = rangeSize;
            bestPair = pair;
        }

        return bestPair;
    }

    getValidPositions(card:Card)
    {
        const allPosNoCard = this.getAllPositions(false);
        const validPositions = [];

        for(const pos of allPosNoCard)
        {
            const cards = this.getNeighborCardsOf(pos);
            const notAdjacent = cards.length <= 0;
            if(notAdjacent) { continue; }

            const sameColorAdjacent = cards.filter((c:Card) => c.color == card.color).length > 0;
            if(sameColorAdjacent) { continue; }

            const hasCardInSameRowCol = [this.getColumn(pos.x), this.getRow(pos.y)].flat().filter((c:Card) => 
            {
                if(!c) { return false; }
                return c.color == card.color;
            }).length > 0;
            if(!hasCardInSameRowCol) { continue; }

            validPositions.push(pos);
        }
        return validPositions;
    }

    getColumn(x:number) { return this.map[x]; }
    getRow(y:number)
    {
        const arr = [];
        for(let x = 0; x < this.size.x; x++)
        {
            arr.push(this.map[x][y]);
        }
        return arr;
    }

    highlight(pos:Point[])
    {
        this.highlightedPositions = pos.slice();
    }

    resetHighlight()
    {
        this.highlightedPositions = [];
    }

    isHighlighted(posTarget:Point)
    {
        for(const pos of this.highlightedPositions)
        {
            if(posTarget.matches(pos)) { return true; }
        }
        return false;
    }

    async draw(sim:InteractiveExampleSimulator)
    {
        const canvSize = CONFIG.rulebook.boardCanvasSize;
        const ctx = createContext({ size: canvSize, alpha: false });
        fillCanvas(ctx, "#FFFFFF");

        const sizeY = canvSize.y / this.size.y;
        const sizeX = sizeY / 1.4;
        const cardSize = new Point(sizeX, sizeY);
        const cardSizeWithMargin = cardSize.clone().sub(new Point(10));

        const mapBounds = new Point(sizeX, sizeY).scale(this.size);

        // needed to neatly center the entire thing on the canvas
        const centeringOffset = canvSize.clone().scale(0.5).sub( mapBounds.clone().scale(0.5)).add( cardSize.clone().scale(0.5));

        // just loop through grid and draw each card with correct offset (if it exists, of course)
        for(let x = 0; x < this.size.x; x++)
        {
            for(let y = 0; y < this.size.y; y++)
            {
                const pos = new Point(x,y);
                const card = this.getCard(pos);

                const realPos = new Point(x * cardSize.x, y * cardSize.y);
                realPos.add(centeringOffset);

                if(!card) { continue; }

                // draw the resource to the canvas with the settings we just calculated
                const res = new ResourceImage( await card.drawForRules(sim.getVisualizer()) );
                const op = new LayoutOperation({
                    pos: realPos,
                    size: cardSizeWithMargin,
                    pivot: Point.CENTER
                })
                res.toCanvas(ctx, op);

                const isHighlight = this.isHighlighted(pos);
                if(isHighlight)
                {
                    const resRect = new ResourceShape( new Rectangle({ center: realPos, extents: cardSize }) );
                    const opRect = new LayoutOperation({ stroke: "#FF0000", strokeWidth: 0.035*cardSize.x, strokeAlign: StrokeAlign.OUTSIDE });
                    resRect.toCanvas(ctx, opRect);
                }
            }
        }

        // don't forget to actually add the result back into example builder, Tiamo!
        const img = await convertCanvasToImage(ctx.canvas);
        img.style.maxHeight = "none";
        sim.outputBuilder.addNode(img);
    }
}