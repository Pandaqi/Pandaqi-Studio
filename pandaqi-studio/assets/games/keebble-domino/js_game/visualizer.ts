import createContext from "js/pq_games/layout/canvas/createContext";
import { LETTERS, CELLS, DOMINO_COLORS } from "./dict" 
import Color from "js/pq_games/layout/color/color"
import convertCanvasToImageMultiple from "js/pq_games/layout/canvas/convertCanvasToImageMultiple";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import strokeCanvas from "js/pq_games/layout/canvas/strokeCanvas";
import ResourceImage from "js/pq_games/layout/resources/resourceImage";
import TintEffect from "js/pq_games/layout/effects/tintEffect";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import Point from "js/pq_games/tools/geometry/point";
import CONFIG from "./config";

export default class Visualizer
{
    
    constructor() {}

    async start(params)  
    {  
        await this.visualizeDominoContents(params);
        await this.downloadPDF();
    }

    async downloadPDF()
    {
        // turn into images, then pdf, then download
        const images = await convertCanvasToImageMultiple(CONFIG.gridMapper.getCanvases());
        if(CONFIG.debugWithoutPDF) { 
            for(const img of images)
            {
                document.body.appendChild(img);
            }
            return;
        }

        CONFIG.pdfBuilder.addImages(images);

        let fileName = "[Keebble; Domino] Material";
        const pdfConfig = { customFileName: fileName }
        CONFIG.pdfBuilder.downloadPDF(pdfConfig);
    }

    async visualizeDominoContents(params)
    {
        const promises = [];
        const canvases = [];
        for(let i = 0; i < params.numDominoes; i++)
        {
            const ctx = createContext({ size: params.cardSize });
            const paramsCopy = structuredClone(params);
            paramsCopy.ctx = ctx;
            paramsCopy.domino = params.dominoContents[i];
            promises.push( this.createDomino(paramsCopy) );
            canvases.push( ctx.canvas );
        }

        await Promise.all(promises);

        for(const canv of canvases)
        {
            CONFIG.gridMapper.addElement(canv);
        }
    }

    async createDomino(params)
    {
        // the basics
        params.background.colorIndex = Math.floor(Math.random() * DOMINO_COLORS.length);
        params.background.color = DOMINO_COLORS[params.background.colorIndex];
        if(params.inkFriendly) { params.background.color = new Color(0, 0, 100); }

        const ctx = params.ctx
        fillCanvas(ctx, params.background.color);

        const centers = [
            new Point(0.25 * params.cardSize.x, 0.5 * params.cardSize.y),
            new Point(0.75 * params.cardSize.x, 0.5 * params.cardSize.y)
        ];

        for(let i = 0; i < 2; i++)
        {
            params.side = i;
            params.center = centers[i];
            params.dominoPart = params.domino.getSide(i);
            await this.createDominoPart(params);
        }

        // the separator line between parts
        if(params.dominoPartSeparator.include)
        {
            const margin = params.dominoPartSeparator.margin;
            ctx.strokeStyle = params.dominoPartSeparator.color;
            ctx.lineWidth = params.dominoPartSeparator.width;
        
            ctx.beginPath();
            ctx.moveTo(0.5*params.cardSize.x, margin);
            ctx.lineTo(0.5*params.cardSize.x, params.cardSize.y - margin);
            ctx.stroke();
        }

        // finally, add outline on top of everything
        strokeCanvas(ctx, params.outlineColor, params.outlineWidth);
    }

    async createDominoPart(params)
    {
        const ctx = params.ctx;
        const res = CONFIG.resLoader;
        const part = params.dominoPart;
        const c = params.center.clone();
        const cs = params.cardSize;
        const isLetter = (part.getType() == "letter")

        let dict:any = LETTERS;
        if(!isLetter) { dict = CELLS; }

        const randRotationInt = Math.floor(Math.random() * 4);
        const randRotation = randRotationInt * 0.5 * Math.PI;
        const partSize = cs.y;

        // add heightened block on all sides that mean something
        if(params.ramps.include)
        {
            let letters = ["A", "B", "C", "D"]; 
            if(isLetter && part.getValue() != "") { letters = LETTERS[part.getValue()].letters; }
            for(let i = 0; i < 4; i++)
            {
                // must compensate for the fact we might be rotated, and thus the side is actually somewhere else 
                const offsetIndex = (randRotationInt - i + 4) % 4;
                const hasNoValue = letters[offsetIndex] == null;
                if(hasNoValue) { continue; }
                
                let col = params.background.color.lighten(-40);
                if(i == 1 || i == 3) { col = col.lighten(-15); }

                const blockResource = res.getResource("decorations");
                const canvOp = new LayoutOperation({
                    translate: params.center,
                    rotation: i*0.5*Math.PI,
                    effects: [
                        new TintEffect({ color: col.toString() }),
                    ],
                    dims: new Point(partSize),
                    alpha: 0.66,
                    pivot: new Point(0.5)
                });
                blockResource.toCanvas(ctx, canvOp);
            }
        }

        // add background image
        const randRotationBG = Math.floor(Math.random() * 4) * 0.5 * Math.PI;
        if(!params.inkFriendly && params.background.include)
        {
            const bgResource = res.getResource("decorations");
            const canvOp = new LayoutOperation({
                frame: 1,
                translate: params.center,
                rotation: randRotationBG,
                dims: new Point(partSize),
                alpha: params.background.alpha,
                composite: params.background.composite,
                pivot: new Point(0.5)
            })
            bgResource.toCanvas(ctx, canvOp);
        }

        let innerSquareColor = params.background.color.lighten(-10);
        if(params.inkFriendly) { innerSquareColor.lighten(-7); }

        // for some reason, green and blue need to be darker to look like the others?
        // (obviously not needed if all colors are the same grayscale; inkfriendly)
        if(!params.inkFriendly)
        {
            if(params.background.colorIndex == 0) { innerSquareColor = innerSquareColor.lighten(-18).saturate(-40);}
            if(params.background.colorIndex == 1) { innerSquareColor = innerSquareColor.lighten(-12).saturate(-35);}
        }
        
        if(params.innerSquare.include)
        {
            const randRotationInnerSquare = Math.floor(Math.random() * 4) * 0.5 * Math.PI;
            const randBGFrame = 2 + Math.floor(Math.random() * 2);
            const squareSize = partSize * params.innerSquare.scale;
            const decorationResource = res.getResource("decorations") as ResourceImage;
            const canvOp = new LayoutOperation({
                frame: randBGFrame,
                translate: params.center.clone(),
                rotation: randRotationInnerSquare,
                effects: [
                    new TintEffect({ color: innerSquareColor }),
                ],
                dims: new Point(squareSize),
                pivot: new Point(0.5)
            })
            await decorationResource.toCanvas(ctx, canvOp);
        }

        let letterValueColor = params.background.color.lighten(12.5).toString();
        if(params.inkFriendly) { letterValueColor = params.background.color.lighten(-55).toString(); }

        const points = [
            new Point(c.x, c.y + 0.5*cs.y),
            new Point(c.x - 0.5*partSize, c.y),
            new Point(c.x, 0),
            new Point(c.x + 0.5*partSize, c.y)
        ]

        const wallPositions = [];
        for(let i = 0; i < params.walls.max; i++)
        {
            if(Math.random() > params.walls.prob) { break; }
            let randIndex = Math.floor(Math.random() * 4);
            wallPositions.push(randIndex);
        }

        ctx.strokeStyle = innerSquareColor;
        ctx.lineWidth = params.letterValues.width;

        let letters = [null, null, null, null];
        if(isLetter && part.getValue() != "") { letters = LETTERS[part.getValue()].letters; }

        for(let i = 0; i < 4; i++)
        {
            const offsetIndex = (randRotationInt - i + 4) % 4;
            const hasAValue = letters[offsetIndex];

            const p1 = params.center.clone();
            const p2 = points[i].clone();

            if(hasAValue)
            {
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }

            const sideHasWall = wallPositions.includes(i);
            let wallAdded = false;
            if(params.walls.include && sideHasWall)
            {
                const wallRotation = (i + 1) * 0.5 * Math.PI;
                const squareSize = partSize * params.walls.scale;
                const fac = params.walls.positionFactor;
                const posX = p1.x + fac * (p2.x - p1.x);
                const posY = p1.y + fac * (p2.y - p1.y);

                const wallResource = res.getResource("cell");
                const canvOp = new LayoutOperation({
                    frame: 9,
                    translate: new Point(posX, posY),
                    rotation: wallRotation,
                    dims: new Point(squareSize),
                    pivot: new Point(0.5)
                })

                wallResource.toCanvas(ctx, canvOp);
                wallAdded = true;
            }

            if(hasAValue && params.letterValues.include && params.letterValues.printLetterText)
            {                
                const textPositionFactor = params.letterValues.textPositionFactor;
                const textX = p1.x + textPositionFactor * (p2.x - p1.x);
                const textY = p1.y + textPositionFactor * (p2.y - p1.y);
                const textString = letters[offsetIndex] + "";

                ctx.save();
                ctx.translate(textX, textY);
                ctx.rotate(i * 0.5 * Math.PI);

                ctx.font = params.letterValues.fontSize + "px 'Arbutus Slab'";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = letterValueColor;
                if(wallAdded) { ctx.fillStyle = "#111111"; }
                ctx.fillText(textString, 0, 0);
                ctx.restore();
            }
        }

        // add actual symbol
        let sizeMax = 0.67*cs.y;
        if(params.walls.include) { sizeMax = 0.6*cs.y; } // @NOTE: need a little more space if walls included
        const addSymbol = !(isLetter && part.getValue() == "");
        
        let symbolColor = params.background.color.lighten(-70);
        if(params.inkFriendly) { symbolColor = symbolColor.lighten(-12); }
        if(!isLetter) { symbolColor = params.background.color.lighten(20); }

        if(addSymbol)
        {
            const symbolResource = res.getResource(part.getType()) as ResourceImage;
            const canvOp = new LayoutOperation({
                frame: dict[part.getValue()].frame,
                translate: params.center,
                rotation: randRotation,
                pivot: new Point(0.5),
                effects: [
                    new TintEffect({ color: symbolColor }),
                ],
                dims: new Point(sizeMax)
            });
            await symbolResource.toCanvas(ctx, canvOp);
        }


        if(params.emptySide.include)
        {
            // indicators for sides that mean nothing
            const scalar = 0.9;
            const corners = [
                { x: c.x + scalar*0.25*cs.x, y: c.y + scalar*0.5*cs.y },
                { x: c.x - scalar*0.25*cs.x, y: c.y + scalar*0.5*cs.y },
                { x: c.x - scalar*0.25*cs.x, y: c.y - scalar*0.5*cs.y },
                { x: c.x + scalar*0.25*cs.x, y: c.y - scalar*0.5*cs.y }
            ]

            let col = params.emptySide.color;
            if(col == "dynamic") { col = params.background.color.lighten(-30).toString(); }

            ctx.strokeStyle = col;
            ctx.lineWidth = params.emptySide.width;

            let letters = ["A", "B", "C", "D"];
            if(isLetter && part.getValue() != "") { letters = LETTERS[part.getValue()].letters; }
            for(let i = 0; i < 4; i++)
            {
                const offsetIndex = (randRotationInt - i + 4) % 4;
                const hasNoValue = !letters[offsetIndex];
                if(hasNoValue) { continue; }

                const p1 = corners[i];
                const p2 = corners[(i + 1) % 4];

                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
        
    }
}
