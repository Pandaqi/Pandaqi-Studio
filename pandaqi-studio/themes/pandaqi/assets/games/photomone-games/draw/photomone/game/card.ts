import WordPhotomone from "games/photomone-games/shared/wordPhotomone";
import { CONFIG } from "./config";

export default class Card
{
    words:WordPhotomone[];

    constructor(words:WordPhotomone[])
    {
        this.words = words;
    }

    async draw(vis:MaterialVisualizer) : Promise<HTMLCanvasElement>
    {
        const cardSize = vis.size;
        const fontSize = 0.085 * cardSize.x;

        const margin = new Vector2(0.05 * cardSize.x, 0);

        const ctx = createContext({ size: cardSize });
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, cardSize.x, cardSize.y);
    
        ctx.font = fontSize + "px geldotica";
        ctx.textBaseline = 'middle';
    
        const wordsToPutOnCard = Math.min(CONFIG.wordsPerCard, this.words.length);
    
        // add background rectangles (colored, per word, save for reuse later)
        const randColorOffset = Math.floor(Math.random() * 4);
        const rectangles = [];
        for(let a = 0; a < wordsToPutOnCard; a++)
        {
            const rectWidth = cardSize.x;
            const rectHeight = cardSize.y / CONFIG.wordsPerCard;
            const rectX = 0;
            const rectY = a * rectHeight;
            rectangles.push({ x: rectX, y: rectY, width: rectWidth, height: rectHeight });
    
            const bgColorIdx = (a + randColorOffset) % 4;
            ctx.fillStyle = CONFIG.wordColors[bgColorIdx];
            if(vis.inkFriendly) { ctx.fillStyle = (a % 2 == 0) ? "#FFFFFF" : "#DDDDDD"; }
            ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
        }
    
        // add ants at the top and bottom edge, random distances (as if walking in a row/line)
        const spriteSize = 0.06*cardSize.x;
        const antSpriteAlpha = 0.45;
        const antMarginY = 0.475*spriteSize;
        ctx.globalAlpha = antSpriteAlpha;
    
        const res = vis.getResource("grayscale_ant");
        const spriteParams = {
            size: new Vector2(spriteSize, spriteSize),
            rot: Math.PI,
            pivot: new Vector2(0.5)
        }
        const canvOp = new LayoutOperation(spriteParams);
    
        // top row
        let antX = 0.5*cardSize.x + Math.random()*0.5*cardSize.x;
        while(antX > 0)
        {
            canvOp.pos = new Vector2(antX, antMarginY);
            res.toCanvas(ctx, canvOp);
            antX -= Math.random() * (cardSize.x - antX) + 1.25*spriteSize;
        }
    
        // bottom row
        antX = Math.random()*0.5*cardSize.x;
        canvOp.rot = 0;
        while(antX < cardSize.x)
        {
            canvOp.pos = new Vector2(antX, cardSize.y - antMarginY);
            res.toCanvas(ctx, canvOp);
            antX += Math.random() * (cardSize.x - antX) + 1.25*spriteSize;
        }
    
        ctx.globalAlpha = 1.0;
    
        // add a random background network
        const bgNetworkAlpha = 0.066;
        const subCanvas = document.createElement("canvas");
        subCanvas.width = cardSize.x;
        subCanvas.height = cardSize.y;
        const subCtx = subCanvas.getContext("2d");
    
        const numPoints = Math.floor(Math.random() * 20) + 10;
        const pointRadius = 0.025*cardSize.x;
        const bgPoints = [];
        for(let ii = 0; ii < numPoints; ii++)
        {
            const p = new Vector2Graph();
            let tooClose = false;
            let numTries = 0;
            do 
            {
                let distToClosestPoint = Infinity;
                p.x = Math.random() * cardSize.x;
                p.y = Math.random() * cardSize.y;
                for(const otherPoint of bgPoints)
                {
                    distToClosestPoint = Math.min(p.distTo(otherPoint), distToClosestPoint);
                }
                tooClose = (distToClosestPoint <= pointRadius*4.25);
                numTries++;
            } while(tooClose && numTries <= 100);
            
            bgPoints.push(p);
        }
    
        const bgLines = [];
        subCtx.lineWidth = 0.5*pointRadius;
        subCtx.strokeStyle = "#000000";
        subCtx.fillStyle = "#000000";
        for(const p1 of bgPoints)
        {
            let closestPoint = null;
            let closestDist = Infinity;
            for(const p2 of bgPoints)
            {
                if(p1 == p2) { continue; }
                if(p1.isConnectedTo(p2)) { continue; }
                const dist = p1.distTo(p2);
                if(dist >= closestDist) { continue; }
                closestPoint = p2;
                closestDist = dist;
            }
    
            const l = new Line(p1, closestPoint);
            p1.addConnectionByPoint(closestPoint);
            bgLines.push(l);
    
            subCtx.beginPath();
            subCtx.lineTo(p1.x, p1.y);
            subCtx.lineTo(closestPoint.x, closestPoint.y);
            subCtx.stroke();
        }
    
        for(const p of bgPoints)
        {
            subCtx.beginPath();
            subCtx.arc(p.x, p.y, pointRadius, 0, 2*Math.PI);
            subCtx.fill();
        }
    
        ctx.globalAlpha = bgNetworkAlpha;
        ctx.drawImage(subCanvas, 0, 0);
        ctx.globalAlpha = 1.0;
    
        // actually put words + data on the card
        const iconPoints = vis.getResource("icon_points");
        const iconLines = vis.getResource("icon_lines");
    
        for(let a = 0; a < wordsToPutOnCard; a++)
        {
            const rect = rectangles[a];
            const word = this.words[a];
    
            const x = margin.x;
            const y = margin.y + a * rect.height + 0.5*CONFIG.spaceAroundWord;
    
            ctx.fillStyle = "#000000";
            ctx.globalAlpha = 0.77;
            ctx.textAlign = 'left';
            ctx.fillText(word.getWord(), x, y);
    
            // we work backwards from the RIGHT for lines/points
            let dataX = cardSize.x - margin.x;
            const iconSize = 0.4*rect.height;
            const dataTextWidth = 1.5*fontSize;
    
            ctx.textAlign = 'right';
            ctx.fillText(word.getPoints(), dataX, y);
            dataX -= dataTextWidth;
    
            const resParams = {
                size: new Vector2(iconSize),
                pos: new Vector2(dataX, y),
                pivot: new Vector2(0.5)
            }
            const canvOp = new LayoutOperation(resParams);
            iconPoints.toCanvas(ctx, canvOp);
    
            dataX -= iconSize;
            ctx.fillText(word.getLines(), dataX, y);
    
            dataX -= dataTextWidth;
            canvOp.pos.x = dataX;
            iconLines.toCanvas(ctx, canvOp);
    
            ctx.globalAlpha = 1.0;
        }
    
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 0.025*cardSize.x;
        ctx.strokeRect(0, 0, cardSize.x, cardSize.y);
    
        return ctx.canvas;
    }
}