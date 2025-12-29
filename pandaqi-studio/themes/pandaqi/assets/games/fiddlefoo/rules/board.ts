import { Vector2, shuffle, createContext, fillCanvas, ResourceImage, LayoutOperation, ResourceShape, Rectangle, StrokeAlign, convertCanvasToImage } from "lib/pq-games";
import { InteractiveExampleSimulator } from "lib/pq-rulebook";
import Card from "../game/card";
import { CONFIG } from "../shared/config";
import Pair from "./pair";

const NBS = [Vector2.RIGHT, Vector2.DOWN, Vector2.LEFT, Vector2.UP];

interface Move
{
    pos:Vector2,
    card:Card
}

export { Move };
export default class Board
{
    map: Card[][]
    size: Vector2
    highlightedPositions: Vector2[] = [];

    createGrid(size:Vector2)
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
        return new Vector2(
            idx % this.size.x,
            Math.floor(idx / this.size.x),
        )
    }

    getPositionAsIndex(pos:Vector2)
    {
        return pos.x + this.size.x * pos.y;
    }

    addStartingCards(cards:Card[])
    {
        const size = this.size.clone().scale(0.5);
        const positions = [
            new Vector2(Math.floor(size.x) - 1, Math.floor(size.y) - 1),
            new Vector2(Math.floor(size.x), Math.floor(size.y) - 1),
            new Vector2(Math.floor(size.x), Math.floor(size.y)),
            new Vector2(Math.floor(size.x) - 1, Math.floor(size.y))
        ]

        for(let i = 0; i < positions.length; i++)
        {
            this.addCard(positions[i], cards[i]);
        }
    }

    hasCardAt(pos:Vector2) { return this.getCard(pos) != null; }
    getCard(pos:Vector2)
    {
        if(this.outOfBounds(pos)) { return null; }
        return this.map[pos.x][pos.y];
    }

    outOfBounds(pos:Vector2)
    {
        return pos.x < 0 || pos.x >= this.size.x || pos.y < 0 || pos.y >= this.size.y;
    }

    addCard(pos:Vector2, c:Card)
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

    getAllPositions(hasCard = null) : Vector2[]
    {
        const arr = [];
        for(let x = 0; x < this.size.x; x++)
        {
            for(let y = 0; y < this.size.y; y++)
            {
                const pos = new Vector2(x,y);
                if(hasCard != null && this.hasCardAt(pos) != hasCard) { continue; }
                arr.push(pos);
            }
        }

        return arr;
    }

    getNeighborCardsOf(pos:Vector2) : Card[]
    {
        const nbPositions = this.getNeighborPositionsOf(pos, true);
        const arr = [];
        for(const nbPos of nbPositions)
        {
            arr.push(this.getCard(nbPos));
        }
        return arr;
    }

    getNeighborPositionsOf(pos:Vector2, hasCard = null) : Vector2[]
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

    highlight(pos:Vector2[])
    {
        this.highlightedPositions = pos.slice();
    }

    resetHighlight()
    {
        this.highlightedPositions = [];
    }

    isHighlighted(posTarget:Vector2)
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
        const cardSize = new Vector2(sizeX, sizeY);
        const cardSizeWithMargin = cardSize.clone().sub(new Vector2(10));

        const mapBounds = new Vector2(sizeX, sizeY).scale(this.size);

        // needed to neatly center the entire thing on the canvas
        const centeringOffset = canvSize.clone().scale(0.5).sub( mapBounds.clone().scale(0.5)).add( cardSize.clone().scale(0.5));

        // just loop through grid and draw each card with correct offset (if it exists, of course)
        for(let x = 0; x < this.size.x; x++)
        {
            for(let y = 0; y < this.size.y; y++)
            {
                const pos = new Vector2(x,y);
                const card = this.getCard(pos);

                const realPos = new Vector2(x * cardSize.x, y * cardSize.y);
                realPos.add(centeringOffset);

                if(!card) { continue; }

                // draw the resource to the canvas with the settings we just calculated
                const res = new ResourceImage( await card.drawForRules(sim.getVisualizer()) );
                const op = new LayoutOperation({
                    pos: realPos,
                    size: cardSizeWithMargin,
                    pivot: Vector2.CENTER
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
        sim.getOutputBuilder().addNode(img);
    }
}