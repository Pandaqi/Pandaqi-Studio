import Point from "./shapes/point"
import Card from "./card"
import GridMapper from "js/pq_games/layout/gridMapper"
import Canvas from "js/pq_games/canvas/main"
import CONFIG from "./config"
import drawRectangle from "js/pq_games/canvas/shapes/drawRectangle"
import drawCircle from "js/pq_games/canvas/shapes/drawCircle"
import convertCanvasToImageMultiple from "js/pq_games/layout/canvas/convertCanvasToImageMultiple"
import createContext from "js/pq_games/layout/canvas/createContext"
import drawLine from "js/pq_games/canvas/shapes/drawLine"

export default class CodeCards {
    gridMapper: GridMapper
    cardsToGenerate: number
    images: HTMLImageElement[]

    constructor()
    {
        this.setupGridMapper();
        if(!CONFIG.includeCodeCards) { return; }
        this.setupPatterns();
        this.setupRoles();
        this.generate();
    }

    setupGridMapper()
    {
        const gridConfig = { pdfBuilder: CONFIG.pdfBuilder, dims: CONFIG.cards.dims };
        this.gridMapper = new GridMapper(gridConfig);

        const numPages = CONFIG.cards.numPages;
        const tilesPerPage = CONFIG.cards.dims.x * CONFIG.cards.dims.y;
        this.cardsToGenerate = numPages * tilesPerPage;

        let size = this.gridMapper.getMaxElementSizeAsSquare().x;
        CONFIG.cards.size = new Point(0.5 * size, 0.5 * size);
    }

    setupPatterns()
    {
        const resolution = 3;
        const size = CONFIG.cards.size;
        const minSize = size.x;
        const centerPos = { x: 0.5*size.x, y: 0.5*size.y };
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
            const points = [{ x: xStart, y: yStart}, { x: xEnd, y: yEnd}];
            const pointsInverted = [{ x: xEnd, y: yStart}, { x: xStart, y: yEnd }];

            const params = {
                points: points,
                stroke: null,
                strokeWidth: strokeWidth,
            }

            params.stroke = CONFIG.cards.patternData.team0;
            drawLine(ctx0, params);

            params.stroke = CONFIG.cards.patternData.antsassin;
            drawLine(ctxAntsassin, params);
            params.points = pointsInverted;
            drawLine(ctxAntsassin, params);
        }

        // dots for team1
        // squares for team2
        for(let x = 0; x <= resolution; x++)
        {
            for(let y = 0; y <= resolution; y++)
            {
                const xPos = x*stepSize;
                const yPos = y*stepSize;
                let params = {
                    pos: { x: xPos, y: yPos },
                    radius: radius,
                    color: CONFIG.cards.patternData.team1
                }
                drawCircle(ctx1, params);
            }
        }

        const squareResolution = Math.ceil(resolution * 0.5);
        const squareStepSize = minSize / squareResolution;
        const squareSize = 4*radius;
        for(let x = 0; x <= squareResolution; x++)
        {
            for(let y = 0; y <= squareResolution; y++)
            {
                const xPos = x*squareStepSize;
                const yPos = y*squareStepSize;
                const params = {
                    pos: { x: xPos, y: yPos },
                    extents: { x: squareSize, y: squareSize },
                    color: CONFIG.cards.patternData.team2
                }
                drawRectangle(ctx2, params);
            }
        }

        // growing circles for team3
        const team3LineWidth = CONFIG.cards.patternData.team3StrokeWidth * minSize;
        for(let i = 0; i < resolution; i++)
        {
            const radius = (0.5 + i)*0.5*stepSize;
            const params = {
                pos: centerPos,
                radius: radius,
                stroke: CONFIG.cards.patternData.team3,
                strokeWidth: team3LineWidth
            }
            drawCircle(ctx3, params);
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
        const arr = [];
        for(let i = 0; i < this.cardsToGenerate; i++)
        {
            const t = new Card(i);
            if(this.cardAlreadyExists(t, arr)) { i--; continue; }
            arr.push(t);
            this.gridMapper.addElement(t.getCanvas());
        }
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

    getImages() { return this.images; }
    async convertToImages()
    {
        this.images = await convertCanvasToImageMultiple(this.gridMapper.getCanvases());
    }
}