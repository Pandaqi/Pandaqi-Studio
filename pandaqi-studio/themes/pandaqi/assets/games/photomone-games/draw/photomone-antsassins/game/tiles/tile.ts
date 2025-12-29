import Hexagon from "../shapes/hexagon"
import Rectangle from "../shapes/rectangle"
import Triangle from "../shapes/triangle"
import Point from "../shapes/point"
import TileGenerator from "./tileGenerator"
import TileVisualizer from "./tileVisualizer"
import { createContext, MaterialVisualizer } from "lib/pq-games"

type Shape = Hexagon|Rectangle|Triangle

export default class Tile 
{
    ctx: CanvasRenderingContext2D
    shape: Shape
    size: Point
    sizeSquare: number
    sizeGenerator: any
    sizeGeneratorSquare: number
    gridPoints: Point[]
    generator: TileGenerator
    visualizer: TileVisualizer
    config: any

    getCanvas() { return this.ctx.canvas; }
    constructor(config, num)
    {
        this.config = Object.assign({}, config);

        this.createShape(this.config, num);
        this.createGenerator(this.config);
        this.createVisualizer(this.config);
    }

    createShape(config, num)
    {
        const size = config.tiles.tileSize;
        const centerPos = config.tiles.tileCenter;
        this.ctx = createContext({ size: size, alpha: true, willReadFrequently: false });

        this.shape = null;
        const smallerSize = config.tiles.tileSizeOffset;
        if(config.tileShape == "hexagon") {
            const hexRadius = 0.5*smallerSize.x;
            this.shape = new Hexagon(centerPos, hexRadius);
        } else if(config.tileShape == "rectangle") {
            this.shape = new Rectangle(centerPos, smallerSize);
        } else if(config.tileShape == "triangle") {
            const pointyTop = (num % 2 == 1);
            const triangleRadius = 0.5*smallerSize.x;
            this.shape = new Triangle(centerPos, triangleRadius, pointyTop);
        }

        this.shape.gridPos = new Point(0,0);
        this.size = size;
        this.sizeSquare = Math.min(size.x, size.y);
        this.sizeGenerator = size.clone().scaleFactor(config.generatorReductionFactor);
        this.sizeGeneratorSquare = Math.min(this.sizeGenerator.x, this.sizeGenerator.y);
        
        this.gridPoints = this.createGridPoints(config);
        
        // @IMPROV: in the future, I need a cleaner way to pass around data like this, instead of pushing it all onto one big config file
        config.shape = this.shape;
        config.size = this.size;
        config.sizeGenerator = this.sizeGenerator;
        config.sizeSquare = this.sizeSquare;
        config.sizeGeneratorSquare = this.sizeGeneratorSquare;
        config.gridPoints = this.gridPoints;
    }

    createGenerator(config)
    {
        this.generator = new TileGenerator(config);
        config.generator = this.generator.generator;
    }

    createVisualizer(config)
    {
        this.visualizer = new TileVisualizer(config);
        config.visualizer = this.visualizer.visualizer;
        config.ctx = this.ctx;
    }

    async draw(vis:MaterialVisualizer) : Promise<HTMLCanvasElement>
    {
        const config = this.config;

        this.clipShape();
        this.drawBackground(vis, config);
        this.visualizer.draw(config);
        this.undoClipShape();
        this.drawOutline(config);

        if(config.tiles.debug) { document.body.appendChild(this.ctx.canvas); }
        
        return this.getCanvas();
    }

    drawBackground(vis:MaterialVisualizer, config)
    {
        const bgCol = (vis.inkFriendly ? config.tiles.bgColorInkfriendly : config.tiles.bgColor) || "#EBEBEB";
        this.ctx.fillStyle = bgCol;
        this.ctx.fillRect(0, 0, this.size.x, this.size.y);
    }

    clipShape()
    {
        const edgePoints = this.shape.getEdgePoints();
        const ctx = this.ctx;

        // first add a clip, so nothing is drawn outside of the hexagon
        ctx.save();
        ctx.beginPath();
        for(const p of edgePoints)
        {
            ctx.lineTo(p.x, p.y);
        }
        ctx.closePath();
        ctx.clip();
    }

    undoClipShape()
    {
        this.ctx.restore();
    }

    drawOutline(config)
    {
        const edgePoints = this.shape.getEdgePoints();
        const ctx = this.ctx;

        ctx.strokeStyle = config.tiles.outlineStyle;
        ctx.lineWidth = config.tiles.outlineWidth;

        ctx.beginPath();
        for(const p of edgePoints) 
        {
            ctx.lineTo(p.x, p.y);
        }
        ctx.closePath();
        ctx.stroke();
    }

    createGridPoints(config)
    {
        return this.shape.getGridPoints(config.tiles.gridResolution);
    }
}