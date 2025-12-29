
import { GridMapper, Vector2, createContext, Line, ResourceShape, LayoutOperation, ColorLike, Color, Circle, Rectangle } from "lib/pq-games"
import { CONFIG } from "../shared/config"
import Card from "./card"


export default class CodeCards {
    gridMapper: GridMapper
    cardsToGenerate: number
    images: HTMLImageElement[]
    cards: Card[]

    constructor()
    {
        this.setup();
        if(!CONFIG._settings.material.includeCodeCards.value) { return; }
        this.setupRoles();
        this.generate();
    }

    setup()
    {
        const numPages = CONFIG.cards.numPages;
        const tilesPerPage = CONFIG.cards.size.x * CONFIG.cards.size.y;
        this.cardsToGenerate = numPages * tilesPerPage;
    }

    setupPatterns()
    {
        const resolution = 3;
        const size = CONFIG.cards.sizeResult;
        const minSize = size.x;
        const centerPos = new Vector2(0.5*size.x, 0.5*size.y);
        const stepSize = minSize / resolution;
        const ctx0 = createContext({ width: size.x, height: size.y, alpha: true });
        const ctx1 = createContext({ width: size.x, height: size.y, alpha: true });
        const ctx2 = createContext({ width: size.x, height: size.y, alpha: true });
        const ctx3 = createContext({ width: size.x, height: size.y, alpha: true });

        const ctxAntsassin = createContext({ width: size.x, height: size.y, alpha: true });

        const strokeWidth = CONFIG.cards.patternData.strokeWidth * minSize;
        const radius = CONFIG.cards.patternData.circleRadius * minSize;

        // diagonal lines (for team0)
        // double diagonal (for antsassin)
        for(let i = -resolution; i <= resolution; i++)
        {
            const xStart = i * stepSize;
            const xEnd = xStart + size.x;
            const yStart = 0;
            const yEnd = size.y;
            const line = new Line(new Vector2(xStart, yStart), new Vector2(xEnd, yEnd));
            const lineInverted = new Line(new Vector2(xEnd, yStart), new Vector2(xStart, yEnd));

            const resLine = new ResourceShape({ shape: line });
            const canvOp = new LayoutOperation({
                stroke: CONFIG.cards.patternData.team0,
                strokeWidth: strokeWidth
            })
            resLine.toCanvas(ctx0, canvOp);

            canvOp.stroke = new ColorLike(new Color(CONFIG.cards.patternData.antsassin));
            resLine.toCanvas(ctxAntsassin, canvOp);

            resLine.shape = lineInverted;
            resLine.toCanvas(ctxAntsassin, canvOp);
        }

        // dots for team1
        // squares for team2
        for(let x = 0; x <= resolution; x++)
        {
            for(let y = 0; y <= resolution; y++)
            {
                const pos = new Vector2(x*stepSize, y*stepSize);
                const circ = new Circle({ center: pos, radius: radius });
                const res = new ResourceShape({ shape: circ });
                const canvOp = new LayoutOperation({
                    fill: CONFIG.cards.patternData.team1,
                })
                res.toCanvas(ctx1, canvOp);
            }
        }

        const squareResolution = Math.ceil(resolution * 0.5);
        const squareStepSize = minSize / squareResolution;
        const squareSize = 4*radius;
        for(let x = 0; x <= squareResolution; x++)
        {
            for(let y = 0; y <= squareResolution; y++)
            {
                const pos = new Vector2(x*squareStepSize, y*squareStepSize);
                const rect = new Rectangle({ center: pos, extents: new Vector2(squareSize) });
                const res = new ResourceShape({ shape: rect });
                const canvOp = new LayoutOperation({
                    fill: CONFIG.cards.patternData.team2,
                })
                res.toCanvas(ctx2, canvOp);
            }
        }

        // growing circles for team3
        const team3LineWidth = CONFIG.cards.patternData.team3StrokeWidth * minSize;
        for(let i = 0; i < resolution; i++)
        {
            const radius = (0.5 + i)*0.5*stepSize;
            const circ = new Circle({ center: centerPos, radius: radius });
            const res = new ResourceShape({ shape: circ });
            const canvOp = new LayoutOperation({
                stroke: CONFIG.cards.patternData.team3,
                strokeWidth: team3LineWidth
            })
            res.toCanvas(ctx3, canvOp);
        }

        // save all of those canvases
        CONFIG.cards.bgPatterns = {
            team0: ctx0.canvas,
            team1: ctx1.canvas,
            team2: ctx2.canvas,
            team3: ctx3.canvas,
            antsassin: ctxAntsassin.canvas
        }
    }

    setupRoles()
    {
        let gridDims = CONFIG.cards.grid;
        const tileShape = CONFIG._settings.tileShape.value;
        if(CONFIG.cards.varyGridPerShape) { 
            gridDims = CONFIG.cards.gridPerShape[tileShape]; 
            if(CONFIG.reducedTileSize) { gridDims = CONFIG.cards.gridPerShapeReduced[tileShape]; }
        }
        CONFIG.cards.grid = gridDims;
    }

    generate()
    {
        const arr : Card[] = [];
        for(let i = 0; i < this.cardsToGenerate; i++)
        {
            const t = new Card(i);
            if(this.cardAlreadyExists(t, arr)) { i--; continue; }
            arr.push(t);
        }
        this.cards = arr;
    }

    cardAlreadyExists(needle, haystack)
    {
        const needleTypes = needle.getCellTypes();
        for(const card of haystack)
        {
            if(this.listsAreEqual(needleTypes, card.getCellTypes())) { return true; }
        }
        return false;
    }

    listsAreEqual(a,b)
    {
        if(a.length <= 0 || b.length <= 0) { return false; }
        if(a.length != b.length) { return false; }
        for(let i = 0; i < a.length; i++)
        {
            if(a[i] != b[i]) { return false; }
        }
        return true;
    }
}