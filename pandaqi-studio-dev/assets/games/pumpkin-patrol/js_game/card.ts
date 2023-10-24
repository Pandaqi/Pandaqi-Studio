import createContext from "js/pq_games/layout/canvas/createContext";
import { Type } from "../js_shared/dict";
import CONFIG from "../js_shared/config";
import strokeCanvas from "js/pq_games/layout/canvas/strokeCanvas";
import Point from "js/pq_games/tools/geometry/point";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import SideData from "./sideData";

export default class Card
{
    type: Type; // PERSON or HAND
    score: number; // for a person card, their score
    decorations: string[]; // for a person card, the decoration requirements
    treats: string[]; // for a person card, the treat requirements
    sides: SideData[]; // for a hand card, top (0) and bottom (1)

    ctx: CanvasRenderingContext2D;
    size: Point;
    sizeUnit: number;
    colorMain: string;

    constructor(type:Type)
    {
        this.type = type;
        this.score = 0;
        this.decorations = [];
        this.treats = [];
        this.sides = [];
    }

    setScore(n) { this.score = n; }
    setDecorations(d) { this.decorations = d; }
    setTreats(t) { this.treats = t; }
    setSides(a,b) { this.sides = [a,b]; }

    async drawForRules(cfg)
    {
        // @TODO
    }

    getCanvas() { return this.ctx.canvas; }
    async draw()
    {
        const size = CONFIG.cards.size;
        const ctx = createContext({ size: size });
        this.ctx = ctx;
        this.size = size;
        this.sizeUnit = Math.min(size.x, size.y);

        if(this.type == Type.PERSON) {
            await this.drawPerson();
        } else {
            await this.drawHandCard();
        }

        return this.getCanvas();
    }

    async drawPerson()
    {
        // draw purple background
        // draw gradient
        // draw beam of light

        // draw main illustration on top
        // draw person name left + right (rotated, white)
        // draw set ID in top left (use SET_ORDER from dict, convert to roman numerals)
        // draw score star + score text
        
        // draw purple background (underneath main illustration, all the way to bottom)
        // draw wonky rectangle + treat icon + requirements => TREAT FIRST, for overlap + shadow
        // draw wonky rectangle + door icon + requirements
        // @NOTE: always draw requirements SORTED by type!
        
        // if power, draw power icon + text
        // otherwise, draw tagline (smaller, more alpha)
    }

    async drawHandCard()
    {
        // draw the two sides independently, one simply rotated by PI

        // per side,
        // draw the wonky rectangle background
        // (clipped), draw door/treat icon as a faded pattern
        
        // draw main illustration
        // add text for type along slanted line

        // finally, draw set ID
    }

    drawBackground()
    {
        const bgColor = CONFIG.cards.bg.color;
        fillCanvas(this.ctx, bgColor);
    }

    drawOutline()
    {
        const outlineSize = CONFIG.cards.outline.size * this.sizeUnit;
        strokeCanvas(this.ctx, CONFIG.cards.outline.color, outlineSize);
    }

    
}