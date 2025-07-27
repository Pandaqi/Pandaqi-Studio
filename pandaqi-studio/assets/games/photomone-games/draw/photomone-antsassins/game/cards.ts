import Card from "./card"
import GridMapper from "js/pq_games/layout/gridMapper"
import CONFIG from "./config"

import convertCanvasToImageMultiple from "js/pq_games/layout/canvas/convertCanvasToImageMultiple"
import createContext from "js/pq_games/layout/canvas/createContext"

import Circle from "js/pq_games/tools/geometry/circle"
import Point from "js/pq_games/tools/geometry/point"
import ResourceShape from "js/pq_games/layout/resources/resourceShape"
import LayoutOperation from "js/pq_games/layout/layoutOperation"
import Rectangle from "js/pq_games/tools/geometry/rectangle"
import Line from "js/pq_games/tools/geometry/line"
import Color from "js/pq_games/layout/color/color"
import ColorLike from "js/pq_games/layout/color/colorLike"

export default class CodeCards {
    gridMapper: GridMapper
    cardsToGenerate: number
    images: HTMLImageElement[]
    cards: Card[]

    constructor()
    {
        this.setupGridMapper();
        if(!CONFIG.includeCodeCards) { return; }
        this.setupRoles();
        this.generate();
    }

    setupGridMapper()
    {
        const gridConfig = { pdfBuilder: CONFIG.pdfBuilder, size: CONFIG.cards.size };
        this.gridMapper = new GridMapper(gridConfig);

        const numPages = CONFIG.cards.numPages;
        const tilesPerPage = CONFIG.cards.size.x * CONFIG.cards.size.y;
        this.cardsToGenerate = numPages * tilesPerPage;

        let size = this.gridMapper.getMaxElementSizeAsSquare().x;
        CONFIG.cards.sizeResult = new Point(0.5 * size, 0.5 * size);
    }

    setupPatterns()
    {
        const resolution = 3;
        const size = CONFIG.cards.sizeResult;
        const minSize = size.x;
        const centerPos = new Point(0.5*size.x, 0.5*size.y);
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
            const line = new Line(new Point(xStart, yStart), new Point(xEnd, yEnd));
            const lineInverted = new Line(new Point(xEnd, yStart), new Point(xStart, yEnd));

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
                const pos = new Point(x*stepSize, y*stepSize);
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
                const pos = new Point(x*squareStepSize, y*squareStepSize);
                const rect = new Rectangle({ center: pos, extents: new Point(squareSize) });
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
        if(CONFIG.cards.varyGridPerShape) { 
            gridDims = CONFIG.cards.gridPerShape[CONFIG.tileShape]; 
            if(CONFIG.reducedTileSize) { gridDims = CONFIG.cards.gridPerShapeReduced[CONFIG.tileShape]; }
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

    async draw()
    {
        if(!this.cards) { return; }

        await this.setupPatterns();

        const promises = [];
        for(const card of this.cards)
        {
            promises.push(card.draw());
        }
        const canvases = await Promise.all(promises);
        this.gridMapper.addElements(canvases);
        await this.convertToImages();
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

    getImages() { return this.images ?? []; }
    async convertToImages()
    {
        this.images = await convertCanvasToImageMultiple(this.gridMapper.getCanvases());
    }
}