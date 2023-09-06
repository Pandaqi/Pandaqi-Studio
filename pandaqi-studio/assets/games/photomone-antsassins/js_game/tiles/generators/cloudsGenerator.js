import Point from "../../shapes/point"
import PixelCell from "../../tools/pixelCell"
import Random from "js/pq_games/tools/random/main"

export default class CloudsGenerator
{
    constructor() 
    { 
        this.visualType = "pixelgrid"
    }

    setupGrid(config)
    {
        const size = config.sizeGenerator;
        const scaleDownFactor = 2.0;

        this.gridSize = { x: size.x / scaleDownFactor, y: size.y / scaleDownFactor }
        this.gridSizeSquare = Math.min(this.gridSize.x, this.gridSize.y);
        this.amountFilled = 0.0;
        this.amountFilledTotal = this.gridSize.x * this.gridSize.y;

        this.grid = [];
        for(let x = 0; x < this.gridSize.x; x++)
        {
            this.grid[x] = [];
            for(let y = 0; y < this.gridSize.y; y++)
            {
                this.grid[x][y] = new PixelCell(x,y);
            }
        }
    }

    getBackgroundColor() { return this.backgroundColor; }
    getGridSize() { return this.gridSize; }
    getGridFlat() { return this.grid.flat(); }

    generate(config)
    {
        this.setupGrid(config);

        this.backgroundColor = config.clouds.backgroundColor || "#3388EE";

        const cells = this.getGridFlat();
        Random.shuffle(cells);

        const cellColor = config.clouds.color;
        for(const cell of cells)
        {
            cell.setColor(cellColor);
        }

        const cloudBounds = config.clouds.numClouds;
        const numClouds = Random.rangeInteger(cloudBounds.min, cloudBounds.max);
        const radiusBounds = config.clouds.radius;
        const strengthBounds = config.clouds.strength;
        const eraseProb = config.clouds.eraseProb;

        const percentageBounds = config.clouds.percentageBounds;

        for(let i = 0; i < numClouds; i++)
        {
            let shouldErase = Math.random() <= eraseProb;
            const percentageFilled = this.amountFilled / this.amountFilledTotal;
            if(percentageFilled <= percentageBounds.min) { shouldErase = false; }
            if(percentageFilled >= percentageBounds.max) { shouldErase = true; }

            const pos = cells.pop();
            let radius = Random.range(radiusBounds.min, radiusBounds.max) * this.gridSizeSquare;
            let strength = Random.range(strengthBounds.min, strengthBounds.max);

            // wide, soft erasing looks ugly most of the time
            // so, prefer making them smaller and stronger in general
            if(shouldErase) { 
                radius *= 0.5; 
                strength *= 2.0;
            }

            const params = {
                pos: new Point(pos.x, pos.y),
                radius: radius,
                strength: strength,
                erase: shouldErase
            }
            this.stampCloud(params);
        }
    }

    stampCloud(params = {})
    {
        const pos = params.pos || new Point(0,0);
        const radius = Math.ceil(params.radius || 10);
        const strength = params.strength || 0.5;
        const erase = params.erase || false;

        const xBounds = { min: Math.max(pos.x - radius, 0), max: Math.min(pos.x + radius, this.gridSize.x-1) }
        const yBounds = { min: Math.max(pos.y - radius, 0), max: Math.min(pos.y + radius, this.gridSize.y-1) }

        for(let x = xBounds.min; x <= xBounds.max; x++)
        {
            for(let y = yBounds.min; y <= yBounds.max; y++)
            {
                const cell = this.grid[x][y];
                const dist = pos.distTo(cell);
                if(dist > radius) { continue; }

                const oldAlpha = cell.getAlpha();
                this.amountFilled -= oldAlpha;
                let alphaChange = 1.0 - dist/radius;
                if(erase) { alphaChange *= -1; }
                alphaChange *= strength;

                cell.changeAlpha(alphaChange);
                const newAlpha = cell.getAlpha();
                this.amountFilled += newAlpha;
            }
        }
    }
}