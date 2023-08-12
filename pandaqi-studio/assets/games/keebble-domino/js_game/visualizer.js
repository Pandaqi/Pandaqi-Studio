import { LETTERS, CELLS, DOMINO_COLORS } from "./gameDictionary" 
import Color from "js/pq_games/canvas/color"
import Canvas from "js/pq_games/canvas/main"

export default class Visualizer
{
    constructor(gm, pdf) 
    {
        this.gridMapper = gm;
        this.pdfBuilder = pdf;
    }

    async start(params)  
    {  
        this.visualizeDominoContents(params);
        await this.downloadPDF();
    }

    async downloadPDF()
    {
        // turn into images, then pdf, then download
        const images = await Canvas.convertCanvasesToImage(this.gridMapper.getCanvases());
        this.pdfBuilder.addImages(images);

        let fileName = "[Keebble; Domino] Material";
        const pdfConfig = { customFileName: fileName }
        this.pdfBuilder.downloadPDF(pdfConfig);
    }

    visualizeDominoContents(params)
    {
        for(let i = 0; i < params.numDominoes; i++)
        {
            const ctx = Canvas.createNewContext(params.cardSize);
            params.ctx = ctx;
            params.domino = params.dominoContents[i];
            this.createDomino(params);
            params.gridMapper.addElement(ctx.canvas);
        }
    }

    async createDomino(params)
    {
        // the basics
        params.background.colorIndex = Math.floor(Math.random() * DOMINO_COLORS.length);
        params.background.color = DOMINO_COLORS[params.background.colorIndex];
        if(params.inkFriendly) { params.background.color = new Color(0, 0, 100); }

        const ctx = params.ctx
        Canvas.addBackground(ctx, params.background.color);

        const centers = [
            { x: 0.25 * params.cardSize.width, y: 0.5 * params.cardSize.height },
            { x: 0.75 * params.cardSize.width, y: 0.5 * params.cardSize.height }
        ];

        for(let i = 0; i < 2; i++)
        {
            params.side = i;
            params.center = centers[i];
            params.dominoPart = params.domino.getSide(i);
            this.createDominoPart(params);
        }

        // the separator line between parts
        if(params.dominoPartSeparator.include)
        {
            const margin = params.dominoPartSeparator.margin;
            ctx.strokeStyle = params.dominoPartSeparator.color;
            ctx.lineWidth = params.dominoPartSeparator.width;
        
            ctx.beginPath();
            ctx.moveTo(0.5*params.cardSize.width, margin);
            ctx.lineTo(0.5*params.cardSize.width, params.cardSize.height - margin);
            ctx.stroke();
        }

        // finally, add outline on top of everything
        Canvas.addOutline(ctx, params.outlineColor, params.outlineWidth);
    }

    async createDominoPart(params)
    {
        const ctx = params.ctx;
        const res = params.resLoader;
        const part = params.dominoPart;
        const c = params.center;
        const cs = params.cardSize;
        const isLetter = (part.getType() == "letter")

        let dict = LETTERS;
        if(!isLetter) { dict = CELLS; }

        const randRotationInt = Math.floor(Math.random() * 4);
        const randRotation = randRotationInt * 0.5 * Math.PI;
        const partSize = cs.height;

        // add heightened block on all sides that mean something
        if(params.ramps.include)
        {
            let letters = ["A", "B", "C", "D"]; 
            if(isLetter && part.getValue() != "") { letters = LETTERS[part.getValue()].letters; }
            ctx.globalAlpha = 0.66;
            for(let i = 0; i < 4; i++)
            {
                // must compensate for the fact we might be rotated, and thus the side is actually somewhere else 
                const offsetIndex = (randRotationInt - i + 4) % 4;
                const hasNoValue = letters[offsetIndex] == null;
                if(hasNoValue) { continue; }
                
                let col = params.background.color.lighten(-40);
                if(i == 1 || i == 3) { col = col.lighten(-15); }
        
                const blockConfig = {
                    id: "decorations",
                    frame: 0,
                    pos: params.center,
                    rotation: i*0.5*Math.PI,
                    tint: col.toString(),
                    size: { width: partSize, height: partSize }
                }
        
                Canvas.addResourceToContext(ctx, res, blockConfig);
            }
            ctx.globalAlpha = 1.0;
        }

        // add background image
        const randRotationBG = Math.floor(Math.random() * 4) * 0.5 * Math.PI;
        const bgConfig = {
            id: "decorations",
            frame: 1,
            pos: params.center,
            rotation: randRotationBG,
            size: { width: partSize, height: partSize }
        }

        if(!params.inkFriendly && params.background.include)
        {
            ctx.save();
            ctx.globalCompositeOperation = params.background.composite;
            ctx.globalAlpha = params.background.alpha;
            Canvas.addResourceToContext(ctx, res, bgConfig);
            ctx.restore();
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
            const resConfig = {
                id: "decorations",
                frame: randBGFrame,
                pos: params.center,
                rotation: randRotationInnerSquare,
                tint: innerSquareColor.toString(),
                size: { width: squareSize, height: squareSize }
            }
        
            Canvas.addResourceToContext(ctx, res, resConfig);
        }

        let letterValueColor = params.background.color.lighten(12.5).toString();
        if(params.inkFriendly) { letterValueColor = params.background.color.lighten(-55).toString(); }

        const points = [
            { x: c.x, y: c.y + 0.5*cs.height },
            { x: c.x - 0.5*partSize, y: c.y },
            { x: c.x, y: 0 },
            { x: c.x + 0.5*partSize, y: c.y }
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

            const p1 = params.center;
            const p2 = points[i];

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
                const resConfig = {
                    id: "cell",
                    frame: 9,
                    pos: { x: posX, y: posY },
                    rotation: wallRotation,
                    size: { width: squareSize, height: squareSize }
                }
            
                Canvas.addResourceToContext(ctx, res, resConfig);
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
        let sizeMax = 0.67*cs.height;
        if(params.walls.include) { sizeMax = 0.6*cs.height; } // @NOTE: need a little more space if walls included
        const addSymbol = !(isLetter && part.getValue() == "");
        
        let symbolColor = params.background.color.lighten(-70);
        if(params.inkFriendly) { symbolColor = symbolColor.lighten(-12); }
        if(!isLetter) { symbolColor = params.background.color.lighten(20); }

        if(addSymbol)
        {
            const resConfig = {
                id: part.getType(),
                frame: dict[part.getValue()].frame,
                pos: params.center,
                rotation: randRotation,
                tint: symbolColor.toString(),
                size: { width: sizeMax, height: sizeMax }
            }
        
            Canvas.addResourceToContext(ctx, res, resConfig)
        }


        if(params.emptySide.include)
        {
            // indicators for sides that mean nothing
            const scalar = 0.9;
            const corners = [
                { x: c.x + scalar*0.25*cs.width, y: c.y + scalar*0.5*cs.height },
                { x: c.x - scalar*0.25*cs.width, y: c.y + scalar*0.5*cs.height },
                { x: c.x - scalar*0.25*cs.width, y: c.y - scalar*0.5*cs.height },
                { x: c.x + scalar*0.25*cs.width, y: c.y - scalar*0.5*cs.height }
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
