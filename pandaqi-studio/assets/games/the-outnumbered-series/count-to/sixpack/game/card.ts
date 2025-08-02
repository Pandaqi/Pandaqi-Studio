import Point from "js/pq_games/tools/geometry/point";
import { PACKS, PackData } from "../shared/dict"
import createContext from "js/pq_games/layout/canvas/createContext";
import { CONFIG } from "./config";
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
    size: Point;
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
        const ctx = this.setupCanvas();
        this.visualizeBackground(ctx);
        this.visualizeType(ctx);
        this.visualizeNumbers(ctx);
        this.visualizeHands(ctx);
        this.visualizeOutline(ctx);
        return ctx.canvas;
    }

    setupCanvas()
    {
        const size = CONFIG.cards.sizeResult;
        this.size = size.clone();
        this.minSize = Math.min(this.size.x, this.size.y);
        this.centerPos = new Point(0.5*size.x, 0.5*size.y);

        return createContext({ size: size });

    }

    visualizeBackground(ctx)
    {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, this.size.x, this.size.y);

        if(CONFIG.inkFriendly) { return; }

        const scaleFactor = CONFIG.cards.bgScale ?? 0.99;
        const bgResource = CONFIG.resLoader.getResource("card_backgrounds");
        const canvOp = new LayoutOperation({
            frame: this.typeData.frame,
            pos: this.centerPos,
            size: new Point(this.size.x*scaleFactor, this.size.y*scaleFactor),
            pivot: new Point(0.5)
        })
        bgResource.toCanvas(ctx, canvOp);
    }

    visualizeType(ctx)
    {
        if(this.type == "blank") { return; }

        const typePos = CONFIG.cards.type.pos;
        const pos = new Point(typePos.x*this.size.x, typePos.y*this.size.y);
        const typeSize = CONFIG.cards.type.size;
        const size = new Point(typeSize*this.minSize, typeSize*this.minSize);

        const typeResource = CONFIG.resLoader.getResource("card_types");
        const canvOp = new LayoutOperation({
            frame: this.typeData.frame,
            pos: pos,
            size: size,
            composite: (CONFIG.cards.hand.composite as GlobalCompositeOperation) || "source-in",
            pivot: new Point(0.5)
        })
        typeResource.toCanvas(ctx, canvOp);
    }

    visualizeNumbers(ctx)
    {
        let typeConfig = this.typeData;
        
        if(CONFIG.inkFriendly) 
        { 
            typeConfig = structuredClone(typeConfig);
            typeConfig.mainNumber.color = null;
            typeConfig.mainNumber.offsetColor = null;
            typeConfig.mainNumber.strokeColor = null;
            typeConfig.edgeNumber.offsetColor = null;
        }

        // main number in center
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

        const textDims = this.size;
        const textRes = new ResourceText({ text: "", textConfig: textConfig });

        for(let i = 0; i < numbersToPlace; i++)
        {
            const text = texts[i];
            const numPos = positions[i];

            // somehow, the 1 is wrongly centered and must be pulled slightly to the left
            if(text == "1") { numPos.x -= 0.02*this.minSize; }

            textRes.text = text;
            const textOp = new LayoutOperation({
                pos: numPos,
                size: textDims,
                pivot: Point.CENTER,
                fill: offsetCol
            })

            textOp.pos.y += offset;
            textRes.toCanvas(ctx, textOp);

            textOp.pos.y -= offset;
            textOp.fill = new ColorLike(mainCol);
            textOp.strokeWidth = mainStrokeWidth;
            textOp.stroke = new ColorLike(mainStrokeCol);
            textRes.toCanvas(ctx, textOp);
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
                edgePos.x = this.size.x * (1.0 - edgeNumPos.x);
                edgePos.y = this.size.y * edgeNumPos.y;
            } else {
                edgePos.x = this.size.x * edgeNumPos.x;
                edgePos.y = this.size.y * (1.0 - edgeNumPos.y);
            }

            const textOp = new LayoutOperation({
                pos: edgePos,
                size: edgeTextDims,
                fill: edgeOffsetCol,
                pivot: Point.CENTER
            });

            textOp.pos.y += edgeNumOffset;
            textRes.toCanvas(ctx, textOp);

            textOp.pos.y -= edgeNumOffset;
            textOp.fill = new ColorLike(mainStrokeCol)
            textOp.stroke = new ColorLike(mainCol);
            textOp.strokeWidth = edgeStrokeWidth;
            textRes.toCanvas(ctx, textOp);
        }
    }

    visualizeHands(ctx)
    {
        if(!this.hand) { return; }

        const handPos = CONFIG.cards.hand.pos;
        const pos = new Point(handPos.x*this.size.x, handPos.y*this.size.y);
        const handSize = CONFIG.cards.hand.size;
        const size = new Point(handSize*this.minSize, handSize*this.minSize);
        const handResource = CONFIG.resLoader.getResource("hand_icon");
        const canvOp = new LayoutOperation({
            pos: pos,
            size: size,
            composite: (CONFIG.cards.hand.composite as GlobalCompositeOperation) ?? "source-in",
            pivot: new Point(0.5)
        })
        handResource.toCanvas(ctx, canvOp);
    }

    visualizeOutline(ctx)
    {
        ctx.strokeStyle = this.typeData.outlineColor || CONFIG.cards.outlineColor;
        ctx.lineWidth = CONFIG.cards.outlineWidth * this.minSize;
        ctx.strokeRect(0, 0, this.size.x, this.size.y);
    }
}