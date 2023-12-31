import Point from "js/pq_games/tools/geometry/point";
import { PACKS, PackData } from "./dict"
import createContext from "js/pq_games/layout/canvas/createContext";
import CONFIG from "./config";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import TextConfig, { TextAlign } from "js/pq_games/layout/text/textConfig";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import ColorLike from "js/pq_games/layout/color/colorLike";

export default class Card 
{
    num: number;
    type: string;
    typeData: PackData;
    hand: boolean;
    ctx: CanvasRenderingContext2D;
    dims: Point;
    minSize: number;
    centerPos: Point;

    constructor(params)
    {
        this.num = params.num ?? 0;
        this.type = params.type ?? "blank";
        this.typeData = PACKS[this.type];
        this.hand = params.hand ?? false;
    }

    async visualize() : Promise<HTMLCanvasElement>
    {
        this.setupCanvas();
        await this.visualizeBackground();
        await this.visualizeType();
        await this.visualizeNumbers();
        await this.visualizeHands();
        this.visualizeOutline();
        return this.getCanvas();
    }

    getCanvas() { return this.ctx.canvas; }
    setupCanvas()
    {
        const dims = CONFIG.cards.size;
        this.ctx = createContext({ size: dims, alpha: true, willReadFrequently: false });
        this.dims = dims.clone();
        this.minSize = Math.min(this.dims.x, this.dims.y);
        this.centerPos = new Point(0.5*dims.x, 0.5*dims.y);
    }

    async visualizeBackground()
    {
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.fillRect(0, 0, this.dims.x, this.dims.y);

        if(CONFIG.inkFriendly) { return; }

        const scaleFactor = CONFIG.cards.bgScale || 0.99;
        const bgResource = CONFIG.resLoader.getResource("card_backgrounds");
        const canvOp = new LayoutOperation({
            frame: this.typeData.frame,
            translate: this.centerPos,
            dims: new Point(this.dims.x*scaleFactor, this.dims.y*scaleFactor),
            pivot: new Point(0.5)
        })
        await bgResource.toCanvas(this.ctx, canvOp);
    }

    async visualizeType()
    {
        if(this.type == "blank") { return; }

        const typePos = CONFIG.cards.type.pos;
        const pos = new Point(typePos.x*this.dims.x, typePos.y*this.dims.y);
        const typeSize = CONFIG.cards.type.size;
        const size = new Point(typeSize*this.minSize, typeSize*this.minSize);

        const typeResource = CONFIG.resLoader.getResource("card_types");
        const canvOp = new LayoutOperation({
            frame: this.typeData.frame,
            translate: pos,
            dims: size,
            composite: (CONFIG.cards.hand.composite as GlobalCompositeOperation) || "source-in",
            pivot: new Point(0.5)
        })
        await typeResource.toCanvas(this.ctx, canvOp);
    }

    async visualizeNumbers()
    {
        let typeConfig = this.typeData;
        if(CONFIG.inkFriendly) { 
            typeConfig = structuredClone(typeConfig);
            typeConfig.mainNumber.color = null;
            typeConfig.mainNumber.offsetColor = null;
            typeConfig.mainNumber.strokeColor = null;
            typeConfig.edgeNumber.offsetColor = null;
        }

        // main number in center
        const ctx = this.ctx;
        const text = this.num.toString();
        let fontSize = CONFIG.font.size * this.minSize;
        const fontFamily = CONFIG.font.key;

        const numbersToPlace = (this.type == "superNumbers") ? 2 : 1;
        fontSize /= numbersToPlace

        const offset = CONFIG.cards.mainNumber.bgOffset * this.minSize;

        const offsetCol = typeConfig.mainNumber.offsetColor ?? CONFIG.cards.mainNumber.offsetColor;
        const mainCol = typeConfig.mainNumber.color ?? CONFIG.cards.mainNumber.color;
        const mainStrokeCol = typeConfig.mainNumber.strokeColor ?? CONFIG.cards.mainNumber.strokeColor;
        const mainStrokeWidth = (typeConfig.mainNumber.strokeWidth ?? CONFIG.cards.mainNumber.strokeWidth) * this.minSize;
        
        let pos = this.centerPos.clone();
        let positions = [pos];
        let texts = [text];
        const dualNumberOffset = new Point(0.15 * this.minSize);
        if(numbersToPlace == 2)
        {
            positions = [
                new Point(pos.x - dualNumberOffset.x, pos.y - dualNumberOffset.y),
                new Point(pos.x + dualNumberOffset.x, pos.y + dualNumberOffset.y)
            ]

            const numberList = CONFIG.numberList.slice();
            numberList.splice(CONFIG.numberList.indexOf(this.num), 1);
            const otherNum = numberList[Math.floor(Math.random() * numberList.length)];
            texts = [
                text,
                otherNum.toString()
            ]
        }

        const textConfig = new TextConfig({
            font: fontFamily,
            size: fontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE
        })

        const textDims = this.dims;
        const textRes = new ResourceText({ text: "", textConfig: textConfig });

        for(let i = 0; i < numbersToPlace; i++)
        {
            const text = texts[i];
            const numPos = positions[i];

            // somehow, the 1 is wrongly centered and must be pulled slightly to the left
            if(text == "1") { numPos.x -= 0.02*this.minSize; }

            textRes.text = text;
            const textOp = new LayoutOperation({
                translate: numPos,
                dims: textDims,
                pivot: Point.CENTER,
                fill: offsetCol
            })

            textOp.translate.y += offset;
            await textRes.toCanvas(ctx, textOp);

            textOp.translate.y -= offset;
            textOp.fill = new ColorLike(mainCol);
            textOp.strokeWidth = mainStrokeWidth;
            textOp.stroke = new ColorLike(mainStrokeCol);
            await textRes.toCanvas(ctx, textOp);
        }

        // two numbers at edges
        const edgeNumPos = typeConfig.edgeNumber.pos || CONFIG.cards.edgeNumber.pos;
        const edgeNumOffset = CONFIG.cards.edgeNumber.bgOffset * this.minSize;
        const edgeStrokeWidth = (typeConfig.edgeNumber.strokeWidth || CONFIG.cards.edgeNumber.strokeWidth) * this.minSize;
        const edgeOffsetCol = (typeConfig.edgeNumber.offsetColor || CONFIG.cards.edgeNumber.offsetColor) || offsetCol;

        const smallFontSize = CONFIG.font.smallSize * this.minSize;
        textConfig.size = smallFontSize;

        const edgeTextDims = new Point(3*smallFontSize);

        for(let i = 0; i < 2; i++)
        {
            let edgePos = new Point();
            if(i == 0) {
                edgePos.x = this.dims.x * (1.0 - edgeNumPos.x);
                edgePos.y = this.dims.y * edgeNumPos.y;
            } else {
                edgePos.x = this.dims.x * edgeNumPos.x;
                edgePos.y = this.dims.y * (1.0 - edgeNumPos.y);
            }

            const textOp = new LayoutOperation({
                translate: edgePos,
                dims: edgeTextDims,
                fill: edgeOffsetCol,
                pivot: Point.CENTER
            });

            textOp.translate.y += edgeNumOffset;
            await textRes.toCanvas(ctx, textOp);

            textOp.translate.y -= edgeNumOffset;
            textOp.fill = new ColorLike(mainStrokeCol)
            textOp.stroke = new ColorLike(mainCol);
            textOp.strokeWidth = edgeStrokeWidth;
            await textRes.toCanvas(ctx, textOp);
        }
    }

    async visualizeHands()
    {
        if(!this.hand) { return; }

        const handPos = CONFIG.cards.hand.pos;
        const pos = new Point(handPos.x*this.dims.x, handPos.y*this.dims.y);
        const handSize = CONFIG.cards.hand.size;
        const size = new Point(handSize*this.minSize, handSize*this.minSize);
        const handResource = CONFIG.resLoader.getResource("hand_icon");
        const canvOp = new LayoutOperation({
            translate: pos,
            dims: size,
            composite: (CONFIG.cards.hand.composite as GlobalCompositeOperation) ?? "source-in",
            pivot: new Point(0.5)
        })
        await handResource.toCanvas(this.ctx, canvOp);
    }

    visualizeOutline()
    {
        const ctx = this.ctx;
        ctx.strokeStyle = this.typeData.outlineColor || CONFIG.cards.outlineColor;
        ctx.lineWidth = CONFIG.cards.outlineWidth * this.minSize;
        ctx.strokeRect(0, 0, this.dims.x, this.dims.y);
    }
}