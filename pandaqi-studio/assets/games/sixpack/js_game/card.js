import { PACKS } from "./gameDictionary"
import Canvas from "js/pq_games/canvas/main"

export default class Card {
    constructor(params, config)
    {
        this.num = params.num || 0;
        this.type = params.type || "blank";
        this.typeData = PACKS[this.type];
        this.hand = params.hand || false;
        this.config = config;
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
        const dims = this.config.cards.size;
        this.ctx = Canvas.createNewContext({ width: dims.x, height: dims.y, alpha: true, willReadFrequently: false });
        this.dims = Object.assign({}, dims);
        this.minSize = Math.min(this.dims.x, this.dims.y);
        this.centerPos = { x: 0.5*dims.x, y: 0.5*dims.y };
    }

    visualizeBackground()
    {
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.fillRect(0, 0, this.dims.width, this.dims.height);

        if(this.config.inkFriendly) { return; }

        const scaleFactor = this.config.cards.bgScale || 0.99;
        const params = {
            id: "card_backgrounds",
            frame: this.typeData.frame,
            pos: this.centerPos,
            size: { width: this.dims.x*scaleFactor, height: this.dims.y*scaleFactor }
        }
        Canvas.addResourceToContext(this.ctx, this.config.resLoader, params);
    }

    visualizeType()
    {
        if(this.type == "blank") { return; }

        const typePos = this.config.cards.type.pos;
        const pos = { x: typePos.x*this.dims.x, y: typePos.y*this.dims.y }
        const typeSize = this.config.cards.type.size;
        const size = { width: typeSize*this.minSize, height: typeSize*this.minSize }

        const params = {
            id: "card_types",
            frame: this.typeData.frame,
            pos: pos,
            size: size
        }

        this.ctx.save();
        this.ctx.globalCompositeOperation = this.config.cards.hand.composite || "source-in";
        Canvas.addResourceToContext(this.ctx, this.config.resLoader, params);
        this.ctx.restore();
    }

    visualizeNumbers()
    {
        let typeConfig = this.typeData;
        if(this.config.inkFriendly) { 
            typeConfig = structuredClone(typeConfig);
            typeConfig.mainNumber.color = null;
            typeConfig.mainNumber.offsetColor = null;
            typeConfig.mainNumber.strokeColor = null;
            typeConfig.edgeNumber.offsetColor = null;
        }

        // main number in center
        const ctx = this.ctx;
        const text = this.num.toString();
        let fontSize = this.config.font.size * this.minSize;
        const fontFamily = this.config.font.key;

        const numbersToPlace = (this.type == "superNumbers") ? 2 : 1;
        fontSize /= numbersToPlace

        ctx.font = fontSize  + "px " + fontFamily
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const offset = this.config.cards.mainNumber.bgOffset * this.minSize;

        const offsetCol = typeConfig.mainNumber.offsetColor || this.config.cards.mainNumber.offsetColor;
        const mainCol = typeConfig.mainNumber.color || this.config.cards.mainNumber.color;
        const mainStrokeCol = typeConfig.mainNumber.strokeColor || this.config.cards.mainNumber.strokeColor;
        const mainStrokeWidth = (typeConfig.mainNumber.strokeWidth || this.config.cards.mainNumber.strokeWidth) * this.minSize;
        
        let pos = Object.assign({}, this.centerPos);
        let positions = [pos];
        let texts = [text];
        const dualNumberOffset = { x: 0.15 * this.minSize, y: 0.15 * this.minSize }
        if(numbersToPlace == 2)
        {
            positions = [
                { x: pos.x - dualNumberOffset.x, y: pos.y - dualNumberOffset.y },
                { x: pos.x + dualNumberOffset.x, y: pos.y + dualNumberOffset.y }
            ]

            const numberList = this.config.numberList.slice();
            numberList.splice(this.config.numberList.indexOf(this.num), 1);
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
        const edgeNumPos = typeConfig.edgeNumber.pos || this.config.cards.edgeNumber.pos;
        const edgeNumOffset = this.config.cards.edgeNumber.bgOffset * this.minSize;
        const edgeStrokeWidth = (typeConfig.edgeNumber.strokeWidth || this.config.cards.edgeNumber.strokeWidth) * this.minSize;
        const edgeOffsetCol = (typeConfig.edgeNumber.offsetColor || this.config.cards.edgeNumber.offsetColor) || offsetCol;

        fontSize = this.config.font.smallSize * this.minSize;
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

        const handPos = this.config.cards.hand.pos;
        const pos = { x: handPos.x*this.dims.x, y: handPos.y*this.dims.y }
        const handSize = this.config.cards.hand.size;
        const size = { width: handSize*this.minSize, height: handSize*this.minSize }

        const params = {
            id: "hand_icon",
            pos: pos,
            size: size
        }

        this.ctx.save();
        this.ctx.globalCompositeOperation = this.config.cards.hand.composite || "source-in";
        Canvas.addResourceToContext(this.ctx, this.config.resLoader, params);
        this.ctx.restore();
    }

    visualizeOutline()
    {
        const ctx = this.ctx;
        ctx.strokeStyle = this.typeData.outlineColor || this.config.cards.outlineColor;
        ctx.lineWidth = this.config.cards.outlineWidth * this.minSize;
        ctx.strokeRect(0, 0, this.dims.x, this.dims.y);
    }
}