import Point from "./shapes/point"
import Card from "./card"
import GridMapper from "js/pq_games/canvas/gridMapper"
import Canvas from "js/pq_games/canvas/main"

export default class CodeCards {
    constructor(config)
    {
        this.setupGridMapper(config);
        if(!config.includeCodeCards) { return; }
        this.setupPatterns(config);
        this.setupRoles(config);
        this.generate(config);
    }

    setupGridMapper(config)
    {
        const gridConfig = { pdfBuilder: config.pdfBuilder, dims: config.cards.dims };
        this.gridMapper = new GridMapper(gridConfig);

        const numPages = config.cards.numPages;
        const tilesPerPage = config.cards.dims.x * config.cards.dims.y;
        this.cardsToGenerate = numPages * tilesPerPage;

        let size = this.gridMapper.getMaxElementSizeAsSquare().width;
        config.cards.size = new Point(0.5 * size, 0.5 * size);
    }

    setupPatterns(config)
    {
        const resolution = 3;
        const size = config.cards.size;
        const minSize = size.x;
        const centerPos = { x: 0.5*size.x, y: 0.5*size.y };
        const stepSize = minSize / resolution;
        const ctx0 = Canvas.createNewContext({ width: size.x, height: size.y, alpha: true });
        const ctx1 = Canvas.createNewContext({ width: size.x, height: size.y, alpha: true });
        const ctx2 = Canvas.createNewContext({ width: size.x, height: size.y, alpha: true });
        const ctx3 = Canvas.createNewContext({ width: size.x, height: size.y, alpha: true });

        const ctxAntsassin = Canvas.createNewContext({ width: size.x, height: size.y, alpha: true });

        const strokeWidth = config.cards.patternData.strokeWidth * minSize;
        const radius = config.cards.patternData.circleRadius * minSize;

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
                strokeWidth: strokeWidth,
            }

            params.stroke = config.cards.patternData.team0;
            Canvas.drawLine(ctx0, params);

            params.stroke = config.cards.patternData.antsassin;
            Canvas.drawLine(ctxAntsassin, params);
            params.points = pointsInverted;
            Canvas.drawLine(ctxAntsassin, params);
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
                    color: config.cards.patternData.team1
                }
                Canvas.drawCircle(ctx1, params);
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
                    color: config.cards.patternData.team2
                }
                Canvas.drawRectangle(ctx2, params);
            }
        }

        // growing circles for team3
        const team3LineWidth = config.cards.patternData.team3StrokeWidth * minSize;
        for(let i = 0; i < resolution; i++)
        {
            const radius = (0.5 + i)*0.5*stepSize;
            const params = {
                pos: centerPos,
                radius: radius,
                stroke: config.cards.patternData.team3,
                strokeWidth: team3LineWidth
            }
            Canvas.drawCircle(ctx3, params);
        }

        // save all of those canvases
        config.cards.bgPatterns = {
            team0: ctx0.canvas,
            team1: ctx1.canvas,
            team2: ctx2.canvas,
            team3: ctx3.canvas,
            antsassin: ctxAntsassin.canvas
        }
    }

    setupRoles(config)
    {
        let gridDims = config.cards.grid;
        if(config.cards.varyGridPerShape) { 
            gridDims = config.cards.gridPerShape[config.tileShape]; 
            if(config.reducedTileSize) { gridDims = config.cards.gridPerShapeReduced[config.tileShape]; }
        }
        config.cards.grid = gridDims;
    }

    generate(config)
    {
        const arr = [];
        for(let i = 0; i < this.cardsToGenerate; i++)
        {
            const t = new Card(config, i);
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
        this.images = await Canvas.convertCanvasesToImage(this.gridMapper.getCanvases());
    }
}