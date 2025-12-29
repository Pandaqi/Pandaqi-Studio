
import { PACKS, PackData } from "../shared/dict"
import { CONFIG } from "../shared/config";
import { Vector2, MaterialVisualizer, createContext, LayoutOperation, TextConfig, TextAlign, ResourceText, ColorLike } from "lib/pq-games";

export default class Card 
{
    num: number;
    type: string;
    typeData: PackData;
    hand: boolean;
    ctx: CanvasRenderingContext2D;
    size: Vector2;
    minSize: number;
    centerPos: Vector2;

    constructor(params)
    {
        this.num = params.num ?? 0;
        this.type = params.type ?? "blank";
        this.typeData = PACKS[this.type];
        this.hand = params.hand ?? false;
    }

    async draw(vis:MaterialVisualizer) : Promise<HTMLCanvasElement>
    {
        const ctx = this.setupCanvas(vis);
        this.visualizeBackground(vis, ctx);
        this.visualizeType(vis, ctx);
        this.visualizeNumbers(vis, ctx);
        this.visualizeHands(vis, ctx);
        return ctx.canvas;
    }

    setupCanvas(vis:MaterialVisualizer)
    {
        const size = vis.size;
        this.size = size.clone();
        this.minSize = Math.min(this.size.x, this.size.y);
        this.centerPos = new Vector2(0.5*size.x, 0.5*size.y);
        return createContext({ size: size });
    }

    visualizeBackground(vis:MaterialVisualizer, ctx)
    {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, this.size.x, this.size.y);

        if(vis.inkFriendly) { return; }

        const scaleFactor = vis.get("cards.bgScale") ?? 0.99;
        const bgResource = vis.getResource("card_backgrounds");
        const canvOp = new LayoutOperation({
            frame: this.typeData.frame,
            pos: this.centerPos,
            size: new Vector2(this.size.x*scaleFactor, this.size.y*scaleFactor),
            pivot: new Vector2(0.5)
        })
        bgResource.toCanvas(ctx, canvOp);
    }

    visualizeType(vis:MaterialVisualizer, ctx)
    {
        if(this.type == "blank") { return; }

        const typePos = vis.get("cards.type.pos");
        const pos = new Vector2(typePos.x*this.size.x, typePos.y*this.size.y);
        const typeSize = vis.get("cards.type.size");
        const size = new Vector2(typeSize*this.minSize, typeSize*this.minSize);

        const typeResource = vis.getResource("card_types");
        const canvOp = new LayoutOperation({
            frame: this.typeData.frame,
            pos: pos,
            size: size,
            composite: (vis.get("cards.hand.composite") as GlobalCompositeOperation) || "source-in",
            pivot: new Vector2(0.5)
        })
        typeResource.toCanvas(ctx, canvOp);
    }

    visualizeNumbers(vis:MaterialVisualizer, ctx)
    {
        let typeConfig = this.typeData;
        
        if(vis.inkFriendly) 
        { 
            typeConfig = structuredClone(typeConfig);
            typeConfig.mainNumber.color = null;
            typeConfig.mainNumber.offsetColor = null;
            typeConfig.mainNumber.strokeColor = null;
            typeConfig.edgeNumber.offsetColor = null;
        }

        // main number in center
        const text = this.num.toString();
        let fontSize = vis.get("fonts.size") * this.minSize;
        const fontFamily = vis.get("fonts.heading");

        const numbersToPlace = (this.type == "superNumbers") ? 2 : 1;
        fontSize /= numbersToPlace

        const offset = vis.get("cards.mainNumber.bgOffset") * this.minSize;

        const offsetCol = typeConfig.mainNumber.offsetColor ?? vis.get("cards.mainNumber.offsetColor");
        const mainCol = typeConfig.mainNumber.color ?? vis.get("cards.mainNumber.color");
        const mainStrokeCol = typeConfig.mainNumber.strokeColor ?? vis.get("cards.mainNumber.strokeColor");
        const mainStrokeWidth = typeConfig.mainNumber.strokeWidth ?? vis.get("cards.mainNumber.strokeWidth") * this.minSize;
        
        let pos = this.centerPos.clone();
        let positions = [pos];
        let texts = [text];
        const dualNumberOffset = new Vector2(0.15 * this.minSize);
        if(numbersToPlace == 2)
        {
            positions = [
                new Vector2(pos.x - dualNumberOffset.x, pos.y - dualNumberOffset.y),
                new Vector2(pos.x + dualNumberOffset.x, pos.y + dualNumberOffset.y)
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
                pivot: Vector2.CENTER,
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
        const edgeNumPos = typeConfig.edgeNumber.pos || vis.get("cards.edgeNumber.pos");
        const edgeNumOffset = vis.get("cards.edgeNumber.bgOffset") * this.minSize;
        const edgeStrokeWidth = (typeConfig.edgeNumber.strokeWidth || vis.get("cards.edgeNumber.strokeWidth")) * this.minSize;
        const edgeOffsetCol = (typeConfig.edgeNumber.offsetColor || vis.get("cards.edgeNumber.offsetColor")) || offsetCol;

        const smallFontSize = vis.get("fonts.smallSize") * this.minSize;
        textConfig.size = smallFontSize;

        const edgeTextDims = new Vector2(3*smallFontSize);

        for(let i = 0; i < 2; i++)
        {
            let edgePos = new Vector2();
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
                pivot: Vector2.CENTER
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

    visualizeHands(vis:MaterialVisualizer, ctx)
    {
        if(!this.hand) { return; }

        const handPos = vis.get("cards.hand.pos");
        const pos = new Vector2(handPos.x*this.size.x, handPos.y*this.size.y);
        const handSize = vis.get("cards.hand.size");
        const size = new Vector2(handSize*this.minSize, handSize*this.minSize);
        const handResource = vis.getResource("hand_icon");
        const canvOp = new LayoutOperation({
            pos: pos,
            size: size,
            composite: (vis.get("cards.hand.composite") as GlobalCompositeOperation) ?? "source-in",
            pivot: new Vector2(0.5)
        })
        handResource.toCanvas(ctx, canvOp);
    }
}