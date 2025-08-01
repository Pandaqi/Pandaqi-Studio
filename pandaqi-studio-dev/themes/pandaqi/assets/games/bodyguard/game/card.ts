import { COLORS, CardData, Type } from "../shared/dict";
import { CONFIG } from "../shared/config";
import { Vector2, signRandom, createContext, TextConfig, TextAlign, ResourceText, LayoutOperation, convertCanvasToImage, fillCanvas, strokeCanvas } from "lib/pq-games";

interface EliminationData
{
    eliminated: boolean,
    perpetrator: Card,
    index: number
}

export { EliminationData }
export default class Card
{
    person: string;
    type: Type;
    dir: number;
    data: CardData;

    eliminationData: EliminationData;
    immune: boolean;
    convertedShooter: boolean;

    ctx: CanvasRenderingContext2D;
    size: Vector2;
    sizeUnit: number;
    colorMain: string;

    constructor(p:string, data:CardData)
    {
        this.person = p;
        this.data = data;
    }

    clone() : Card
    {
        const newCard = new Card(this.person, this.data);
        newCard.fill();
        newCard.dir = this.dir;        
        return newCard;
    }

    fill()
    {
        this.type = this.data.type;
        this.dir = signRandom();
        this.eliminationData = {
            eliminated: false,
            perpetrator: null,
            index: -1
        }
        this.immune = false;
        this.convertedShooter = false;
    }

    isEliminated() { return this.eliminationData.eliminated; }

    eliminate(cards:Card[], perpetrator:Card)
    {
        if(this.data.cantDie) { return false; }
        this.eliminationData.eliminated = true;
        this.eliminationData.perpetrator = perpetrator;
        this.eliminationData.index = cards.indexOf(perpetrator);
        return true;
    }

    setImmune(v)
    {
        this.immune = v;
    }

    makeShooter()
    {
        if(this.type == Type.MONSTER) { return; } // already a shooter
        this.convertedShooter = true;
    }

    flip()
    {
        this.dir *= -1;
    }

    async drawForRules(cfg)
    {
        const size = cfg.cardSize.clone();
        const sizeUnit = Math.min(size.x, size.y);
        const ctx = createContext({ size: size });

        //const colorMain = COLORS[ cfg.possibleCards[this.person].color ];
        const colorMain = "#FFFFFF";

        // background + stroke
        ctx.fillStyle = colorMain;
        ctx.fillRect(0, 0, size.x, size.y);

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 20;
        ctx.strokeRect(0, 0, size.x, size.y);

        // @DEBUGGING: some easy way to indicate direction
        const rectWidth = 0.2*size.x;
        const positions = [new Vector2(0,0), new Vector2(size.x-rectWidth, 0)];
        const pos = this.dir == 1 ? positions[1] : positions[0];

        ctx.fillStyle = "#333333";
        ctx.fillRect(pos.x, pos.y, rectWidth, size.y);

        // text
        const fontSize = 0.2*sizeUnit;
        ctx.textAlign = "center";
        ctx.font = fontSize + "px " + cfg.fontFamily;
        ctx.fillStyle = "#000000";

        // > person type
        const textPos = new Vector2(0.5*size.x, 0.5*size.y + 0.33*fontSize);
        ctx.fillText(this.person, textPos.x, textPos.y);

        // desc
        const descFontSize = 0.66 * fontSize;
        const textConfig = new TextConfig({
            font: cfg.fontFamily,
            size: descFontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE,
            lineHeight: 1.1
        })

        let desc = this.data.desc;
        const res = new ResourceText({ text: desc, textConfig: textConfig });
        const descPos = new Vector2(0.5*size.x, 0.75*size.y);
        const descDims = new Vector2(0.9*size.x, 0.4*size.y);
        const op = new LayoutOperation({
            pos: descPos,
            size: descDims,
            pivot: new Vector2(0.5),
            fill: "#000000"
        })
        await res.toCanvas(ctx, op);

        // turn the whole thing into an image
        const img = await convertCanvasToImage(ctx.canvas);
        img.classList.add("playful-example");
        return img;
    }

    getCanvas() { return this.ctx.canvas; }
    async draw()
    {
        const size = CONFIG.cards.size;
        const ctx = createContext({ size: size });
        this.ctx = ctx;
        this.size = size;
        this.sizeUnit = Math.min(size.x, size.y);
        this.colorMain = COLORS[this.data.color];

        this.drawBackground();
        await this.drawMainIllustration();
        await this.drawPower();
        await this.drawMetaData();
        this.drawOutline();

        return this.getCanvas();
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

    async drawMainIllustration()
    {
        
    }

    async drawMetaData()
    {
        // @TODO
    }

    async drawPower()
    {
        // @TODO
    }
}