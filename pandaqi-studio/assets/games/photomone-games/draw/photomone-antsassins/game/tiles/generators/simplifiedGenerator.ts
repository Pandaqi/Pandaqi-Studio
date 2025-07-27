import Random from "js/pq_games/tools/random/main"
import Line from "../../shapes/line"

export default class SimplifiedGenerator
{
    visualType: string;
    pixels: any[];
    lines: any[];
    
    constructor() 
    { 
        this.visualType = "linesandpixels"
        this.pixels = [];
        this.lines = [];
    }

    generate(config)
    {
        this.generatePixels(config);
        this.generateLines(config);
    }

    getPixels() { return this.pixels; }
    generatePixels(config)
    {
        const rectangles = [];
        const pixelSize = config.sizeSquare / config.tiles.gridResolution;
        for(const p of config.gridPoints)
        {
            const randColor = Math.floor(Math.random() * config.simple.numColors);
            const obj = { width: pixelSize, height: pixelSize, x: p.x, y: p.y, colorNum: randColor }
            rectangles.push(obj);
        }

        this.pixels = rectangles;
    }

    getLines() { return this.lines; }
    generateLines(config)
    {
        const lines = [];
        const numLines = Math.floor(Math.random() * 5);
        const nonEdgePoints = [];
        for(const p of config.gridPoints)
        {
            if(p.isOnEdge()) { continue; }
            nonEdgePoints.push(p);
        }

        for(let i = 0; i < numLines; i++)
        {
            const p1 = Random.fromArray(nonEdgePoints);
            const p2 = p1.getRandomNeighbour({ orthogonal: true });

            const obj = new Line(p1, p2);
            lines.push(obj);
        }

        this.lines = lines;
    }

}