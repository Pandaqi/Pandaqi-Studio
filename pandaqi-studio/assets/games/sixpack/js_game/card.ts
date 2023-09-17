import Point from "js/pq_games/tools/geometry/point";
import { PACKS, PackData } from "./dict"
import Canvas from "js/pq_games/canvas/main"
import createContext from "js/pq_games/layout/canvas/createContext";
import CONFIG from "./config";
import LayoutOperation from "js/pq_games/layout/layoutOperation";

export default class Card 
{
    num: number;
    type: string;
    typeData: PackData;
    hand: boolean;
    config: any;
    ctx: CanvasRenderingContext2D;
    dims: Point;
    minSize: number;
    centerPos: Point;

    constructor(params)
    {
        this.num = params.num || 0;
        this.type = params.type || "blank";
        this.typeData = PACKS[this.type];
        this.hand = params.hand || false;
    }

    visualize()
    {
        this.setupCanvas();
        this.visualizeBackground();
        this.visualizeType();
        this.visualizeNumbers();
        this.visualizeHands();
        this.visualizeOutline();
    }

    getCanvas() { return this.ctx.canvas; }
    setupCanvas()
    {
        const dims = CONFIG.cards.size;
        this.ctx = createContext({ width: dims.x, height: dims.y, alpha: true, willReadFrequently: false });
        this.dims = Object.assign({}, dims);
        this.minSize = Math.min(this.dims.x, this.dims.y);
        this.centerPos = new Point(0.5*dims.x, 0.5*dims.y);
    }

    visualizeBackground()
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
        bgResource.toCanvas(this.ctx, canvOp);
    }

    visualizeType()
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
            composite: CONFIG.cards.hand.composite || "source-in",
            pivot: new Point(0.5)
        })
        typeResource.toCanvas(this.ctx, canvOp);
    }

    visualizeNumbers()
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

        ctx.font = fontSize  + "px " + fontFamily
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const offset = CONFIG.cards.mainNumber.bgOffset * this.minSize;

        const offsetCol = typeConfig.mainNumber.offsetColor || CONFIG.cards.mainNumber.offsetColor;
        const mainCol = typeConfig.mainNumber.color || CONFIG.cards.mainNumber.color;
        const mainStrokeCol = typeConfig.mainNumber.strokeColor || CONFIG.cards.mainNumber.strokeColor;
        const mainStrokeWidth = (typeConfig.mainNumber.strokeWidth || CONFIG.cards.mainNumber.strokeWidth) * this.minSize;
        
        let pos = Object.assign({}, this.centerPos);
        let positions = [pos];
        let texts = [text];
        const dualNumberOffset = { x: 0.15 * this.minSize, y: 0.15 * this.minSize }
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

        for(let i = 0; i < numbersToPlace; i++)
        {
            const text = texts[i];
            const numPos = positions[i];

            // somehow, the 1 is wrongly centered and must be pulled slightly to the left
            if(text == "1") { numPos.x -= 0.02*this.minSize; }

            ctx.fillStyle = offsetCol;
            numPos.y += offset;
            ctx.fillText(text, numPos.x, numPos.y);
    
            numPos.y -= offset;
            ctx.fillStyle = mainCol;
            ctx.fillText(text, numPos.x, numPos.y);
            
            ctx.strokeStyle = mainStrokeCol;
            ctx.lineWidth = mainStrokeWidth;
            ctx.strokeText(text, numPos.x, numPos.y);
        }

        // two numbers at edges
        const edgeNumPos = typeConfig.edgeNumber.pos || CONFIG.cards.edgeNumber.pos;
        const edgeNumOffset = CONFIG.cards.edgeNumber.bgOffset * this.minSize;
        const edgeStrokeWidth = (typeConfig.edgeNumber.strokeWidth || CONFIG.cards.edgeNumber.strokeWidth) * this.minSize;
        const edgeOffsetCol = (typeConfig.edgeNumber.offsetColor || CONFIG.cards.edgeNumber.offsetColor) || offsetCol;

        fontSize = CONFIG.font.smallSize * this.minSize;
        ctx.font = fontSize + "px " + fontFamily

        for(let i = 0; i < 2; i++)
        {
            let edgePos = { x: 0, y: 0 }
            if(i == 0) {
                edgePos.x = this.dims.x * (1.0 - edgeNumPos.x);
                edgePos.y = this.dims.y * edgeNumPos.y;
            } else {
                edgePos.x = this.dims.x * edgeNumPos.x;
                edgePos.y = this.dims.y * (1.0 - edgeNumPos.y);
            }

            edgePos.y += edgeNumOffset;
            ctx.fillStyle = edgeOffsetCol;
            ctx.fillText(text, edgePos.x, edgePos.y);

            edgePos.y -= edgeNumOffset;
            ctx.fillStyle = mainStrokeCol;
            ctx.fillText(text, edgePos.x, edgePos.y);

            ctx.strokeStyle = mainCol;
            ctx.lineWidth = edgeStrokeWidth;
            ctx.strokeText(text, edgePos.x, edgePos.y);
        }
    }

    visualizeHands()
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
            composite: CONFIG.cards.hand.composite || "source-in",
            pivot: new Point(0.5)
        })
        handResource.toCanvas(this.ctx, canvOp);
    }

    visualizeOutline()
    {
        const ctx = this.ctx;
        ctx.strokeStyle = this.typeData.outlineColor || CONFIG.cards.outlineColor;
        ctx.lineWidth = CONFIG.cards.outlineWidth * this.minSize;
        ctx.strokeRect(0, 0, this.dims.x, this.dims.y);
    }
}