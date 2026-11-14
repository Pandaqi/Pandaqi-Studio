import { MaterialVisualizer, createContext, Color, Vector2, ResourceGroup, LayoutOperation, TintEffect, Rectangle, ResourceShape, Line, ResourceText, TextConfig } from "lib/pq-games";
import { CONFIG } from "./config";
import { CELLS, DOMINO_COLORS, LETTERS } from "./dict";
import DominoPart from "./dominoPart";

// V2 Color has plain HSL getters/setters; these keep the old "lighten(-18).saturate(-40)" calls readable
const lighten = (c:Color, amount:number) => c.clone().setLightness(clampPercent(c.getLightness() + amount));
const saturate = (c:Color, amount:number) => c.clone().setSaturation(clampPercent(c.getSaturation() + amount));
const clampPercent = (n:number) => Math.max(0, Math.min(100, n));

export default class Domino 
{
    sides: DominoPart[];

    constructor()
    {
        this.sides = [null,null];
    }

    getSide(idx: number)
    {
        return this.sides[idx];
    }

    sideEmpty(idx: number)
    {
        return !this.sides[idx];
    }

    setSideTo(idx: number, type: string, value: string)
    {
        this.sides[idx] = new DominoPart(type, value);
    }

    isFull()
    {
        return !this.sideEmpty(0) && !this.sideEmpty(1);
    }

    setEmptySideTo(type: any, value: any)
    {
        let idx = Math.floor(Math.random() * 2);
        if(this.sideEmpty(idx))
        {
            this.setSideTo(idx, type, value);
            return true;
        }

        idx = (idx + 1) % 2;
        if(this.sideEmpty(idx))
        {
            this.setSideTo(idx, type, value);
            return true;
        }

        return false;
    }

    async draw(vis:MaterialVisualizer) : Promise<HTMLCanvasElement>
    {
        const params = this.createDrawParams(vis);
        const group = vis.prepareDraw();
        this.drawDomino(vis, group, params);
        return await vis.finishDraw(group);
    }

    createDrawParams(vis:MaterialVisualizer)
    {
        const cardSize = vis.size;
        return {
            cardSize,
            inkFriendly: vis.inkFriendly,

            background: 
            { 
                include: false,
                color: new Color("#FFFFFF"),
                alpha: 0.5,
                composite: "multiply", // "source-over" for default
                colorIndex: 0
            },
    
            walls: 
            {
                include: CONFIG._settings.expansions.wereWalls.value,
                scale: 0.825, // looks best if the same as positionFactor, and near textPositionFactor (see below)
                max: 2,
                prob: 0.35,
                positionFactor: 0.825,
            },
    
            letterValues: 
            {
                include: true,
                color: "dynamic",
                fontSize: 0.075*cardSize.y,
                width: 0.2*0.5*cardSize.x,
                textPositionFactor: 0.85,
                printLetterText: CONFIG._settings.showLetters.value
            },
    
            ramps: 
            {
                include: false
            },
            
            outlineColor: "#000000",
            outlineWidth: 0.05*cardSize.y,
    
            innerSquare: 
            {
                include: true,
                color: "dynamic",
                width: 0.01*cardSize.y,
                scale: 0.95
            },
    
            dominoPartSeparator: 
            {
                include: false,
                margin: 0.1*cardSize.y,
                color: "#AAAAAA",
                width: 0.01*cardSize.x
            },
    
            emptySide: 
            {
                include: false,
                color: "#FF0000",
                width: 0.01*cardSize.x,
                pickProb: 0.25
            },
        }
    }

    drawDomino(vis:MaterialVisualizer, group:ResourceGroup, params)
    {
        // the basics
        params.background.colorIndex = Math.floor(Math.random() * DOMINO_COLORS.length);
        params.background.color = DOMINO_COLORS[params.background.colorIndex].clone();
        if(params.inkFriendly) { params.background.color = new Color(0, 0, 100); }

        const background = new ResourceShape(new Rectangle().fromTopLeft(Vector2.ZERO, params.cardSize));
        group.add(background, new LayoutOperation({ fill: params.background.color.toHEXA() }));

        const centers = [
            new Vector2(0.25 * params.cardSize.x, 0.5 * params.cardSize.y),
            new Vector2(0.75 * params.cardSize.x, 0.5 * params.cardSize.y)
        ];

        for(let i = 0; i < 2; i++)
        {
            params.side = i;
            params.center = centers[i];
            params.dominoPart = this.getSide(i);
            this.drawDominoPart(vis, group, params);
        }

        // the separator line between parts
        if(params.dominoPartSeparator.include)
        {
            const margin = params.dominoPartSeparator.margin;
            const separator = new ResourceShape(new Line(
                new Vector2(0.5*params.cardSize.x, margin),
                new Vector2(0.5*params.cardSize.x, params.cardSize.y - margin)
            ));
            group.add(separator, new LayoutOperation({
                stroke: params.dominoPartSeparator.color,
                strokeWidth: params.dominoPartSeparator.width
            }));
        }

        // finally, add outline on top of everything
        const outline = new ResourceShape(new Rectangle().fromTopLeft(Vector2.ZERO, params.cardSize));
        group.add(outline, new LayoutOperation({
            stroke: params.outlineColor,
            strokeWidth: params.outlineWidth
        }));
    }

    drawDominoPart(vis:MaterialVisualizer, group:ResourceGroup, params)
    {
        const part = params.dominoPart;
        if(!part) { return; }

        const c = params.center.clone();
        const cs = params.cardSize;
        const isLetter = (part.getType() == "letter")

        const dict:any = isLetter ? LETTERS : CELLS;

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
                
                let col = lighten(params.background.color, -40);
                if(i == 1 || i == 3) { col = lighten(col, -15); }

                const blockResource = vis.getResource("decorations");
                const blockOp = new LayoutOperation({
                    pos: params.center,
                    rot: i*0.5*Math.PI,
                    effects: [
                        new TintEffect({ color: col.toHEXA() }),
                    ],
                    size: new Vector2(partSize),
                    alpha: 0.66,
                });
                group.add(blockResource, blockOp);
            }
        }

        // add background image
        const randRotationBG = Math.floor(Math.random() * 4) * 0.5 * Math.PI;
        if(!params.inkFriendly && params.background.include)
        {
            const bgResource = vis.getResource("decorations");
            const bgOp = new LayoutOperation({
                frame: 1,
                pos: params.center,
                rot: randRotationBG,
                size: new Vector2(partSize),
                alpha: params.background.alpha,
                composite: params.background.composite,
            })
            group.add(bgResource, bgOp);
        }

        let innerSquareColor = lighten(params.background.color, -10);
        if(params.inkFriendly) { innerSquareColor = lighten(innerSquareColor, -7); }

        // for some reason, green and blue need to be darker to look like the others?
        // (obviously not needed if all colors are the same grayscale; inkfriendly)
        if(!params.inkFriendly)
        {
            if(params.background.colorIndex == 0) { innerSquareColor = saturate(lighten(innerSquareColor, -18), -40); }
            if(params.background.colorIndex == 1) { innerSquareColor = saturate(lighten(innerSquareColor, -12), -35); }
        }
        
        if(params.innerSquare.include)
        {
            const randRotationInnerSquare = Math.floor(Math.random() * 4) * 0.5 * Math.PI;
            const randBGFrame = 2 + Math.floor(Math.random() * 2);
            const squareSize = partSize * params.innerSquare.scale;
            const decorationResource = vis.getResource("decorations");
            const squareOp = new LayoutOperation({
                frame: randBGFrame,
                pos: params.center.clone(),
                rot: randRotationInnerSquare,
                effects: [
                    new TintEffect({ color: innerSquareColor.toHEXA() }),
                ],
                size: new Vector2(squareSize),
            })
            group.add(decorationResource, squareOp);
        }

        let letterValueColor = lighten(params.background.color, 12.5).toHEXA();
        if(params.inkFriendly) { letterValueColor = lighten(params.background.color, -55).toHEXA(); }

        const points = [
            new Vector2(c.x, c.y + 0.5*cs.y),
            new Vector2(c.x - 0.5*partSize, c.y),
            new Vector2(c.x, 0),
            new Vector2(c.x + 0.5*partSize, c.y)
        ]

        const wallPositions = [];
        for(let i = 0; i < params.walls.max; i++)
        {
            if(Math.random() > params.walls.prob) { break; }
            let randIndex = Math.floor(Math.random() * 4);
            wallPositions.push(randIndex);
        }

        let letters = [null, null, null, null];
        if(isLetter && part.getValue() != "") { letters = LETTERS[part.getValue()].letters; }

        const letterTextConfig = new TextConfig({
            font: "arbutus",
            size: params.letterValues.fontSize
        }).alignCenter();

        for(let i = 0; i < 4; i++)
        {
            const offsetIndex = (randRotationInt - i + 4) % 4;
            const hasAValue = letters[offsetIndex];

            const p1 = params.center.clone();
            const p2 = points[i].clone();

            if(hasAValue)
            {
                const line = new ResourceShape(new Line(p1, p2));
                group.add(line, new LayoutOperation({
                    stroke: innerSquareColor.toHEXA(),
                    strokeWidth: params.letterValues.width
                }));
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

                const wallResource = vis.getResource("cell");
                const wallOp = new LayoutOperation({
                    frame: 9,
                    pos: new Vector2(posX, posY),
                    rot: wallRotation,
                    size: new Vector2(squareSize),
                })

                group.add(wallResource, wallOp);
                wallAdded = true;
            }

            if(hasAValue && params.letterValues.include && params.letterValues.printLetterText)
            {                
                const textPositionFactor = params.letterValues.textPositionFactor;
                const textX = p1.x + textPositionFactor * (p2.x - p1.x);
                const textY = p1.y + textPositionFactor * (p2.y - p1.y);
                const textString = letters[offsetIndex] + "";

                const text = new ResourceText({ text: textString, textConfig: letterTextConfig });
                group.add(text, new LayoutOperation({
                    pos: new Vector2(textX, textY),
                    rot: i * 0.5 * Math.PI,
                    pivot: Vector2.CENTER,
                    fill: wallAdded ? "#111111" : letterValueColor
                }));
            }
        }

        // add actual symbol
        let sizeMax = 0.67*cs.y;
        if(params.walls.include) { sizeMax = 0.6*cs.y; } // @NOTE: need a little more space if walls included
        const addSymbol = !(isLetter && part.getValue() == "");
        
        let symbolColor = lighten(params.background.color, -70);
        if(params.inkFriendly) { symbolColor = lighten(symbolColor, -12); }
        if(!isLetter) { symbolColor = lighten(params.background.color, 20); }

        if(addSymbol)
        {
            const symbolResource = vis.getResource(part.getType());
            const symbolOp = new LayoutOperation({
                frame: dict[part.getValue()].frame,
                pos: params.center,
                rot: randRotation,
                effects: [
                    new TintEffect({ color: symbolColor.toHEXA() }),
                ],
                size: new Vector2(sizeMax)
            });
            group.add(symbolResource, symbolOp);
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
            if(col == "dynamic") { col = lighten(params.background.color, -30).toHEXA(); }

            let letters = ["A", "B", "C", "D"];
            if(isLetter && part.getValue() != "") { letters = LETTERS[part.getValue()].letters; }
            for(let i = 0; i < 4; i++)
            {
                const offsetIndex = (randRotationInt - i + 4) % 4;
                const hasNoValue = !letters[offsetIndex];
                if(hasNoValue) { continue; }

                const p1 = corners[i];
                const p2 = corners[(i + 1) % 4];

                const line = new ResourceShape(new Line(new Vector2(p1.x, p1.y), new Vector2(p2.x, p2.y)));
                group.add(line, new LayoutOperation({
                    stroke: col,
                    strokeWidth: params.emptySide.width
                }));
            }
        }
    }
}
