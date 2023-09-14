import BoardState from "./boardState";
import { Geom, Display } from "js/pq_games/phaser.esm"
import CONFIG from "./config";
import PointGraph from "js/pq_games/tools/geometry/pointGraph";
import Point from "js/pq_games/tools/geometry/point";
import Route from "./route";


export default class BoardDisplay
{
    game:any;
    graphics:any;
    blockSize: Point;

    constructor(game:any)
    {
        this.game = game;
    }

    convertToRealPoint(pos:PointGraph|Point) : Point
    {
        return new Point(
            pos.x * this.blockSize.x,
            pos.y * this.blockSize.x
        )
    }

    draw(board:BoardState)
    {
        const blockX = this.game.canvas.width / CONFIG.generation.numBlocksFullWidth;
        const blockY = 0.25*blockX;
        this.blockSize = new Point(blockX, blockY);

        if(this.graphics) { this.graphics.clear(); }

        const graphics = this.game.add.graphics();
        this.graphics = graphics;

        const points : PointGraph[] = board.getPoints()
        for(const point of points)
        {
            this.drawPoint(point);
        }

        const routes : Route[] = board.getRoutes();
        for(const route of routes)
        {
            this.drawRoute(route);
        }
    }

    drawPoint(p:PointGraph)
    {
        const realPos = this.convertToRealPoint(p);
        const radius = (CONFIG.generation.cityRadius*0.95) * this.blockSize.x;
        const circ = new Geom.Circle(realPos.x, realPos.y, radius);
        //let color = point.metadata.city ? 0xFF0000 : 0x000000;

        let color = 0x000000;
        this.graphics.fillStyle(color);
        this.graphics.fillCircleShape(circ);
    }

    drawRoute(r:Route)
    {
        const l = r.getAsLine();
        const rawLength = l.length() - 2*CONFIG.generation.cityRadius;
        const numBlocks = Math.round(rawLength);
        const vec = l.vector().normalize();
        const curPos = this.convertToRealPoint(l.start);
        const bl = this.blockSize.x;
        const blockLengthDisplayed = bl*0.9;
        const cityRadiusDisplayed = CONFIG.generation.cityRadius*bl;

        const emptySpace = (rawLength - numBlocks) * bl;

        // why +1? Add space at start and end => 2 blocks, for example, will have 3 spaces to fill
        const emptySpacePerBlock = emptySpace / (numBlocks + 1); 
        const offsetPerBlock = emptySpacePerBlock + bl;

        curPos.add(vec.clone().scaleFactor(emptySpacePerBlock + cityRadiusDisplayed + 0.5*bl));

        const routeTooLong = emptySpacePerBlock < 0; // @TODO: do something with this

        const hue = (r.type / CONFIG.generation.numBlockTypes);
        const colorObject = Display.Color.HSLToColor(hue, 0.95, 0.5);
        const color = colorObject.color;

        for(let i = 0; i < numBlocks; i++)
        {
            const rect = this.game.add.rectangle(curPos.x, curPos.y, blockLengthDisplayed, this.blockSize.y, color);
            rect.setOrigin(0.5);

            const angle = vec.angle();
            rect.setRotation(angle);
            curPos.add(vec.clone().scale(offsetPerBlock));
        }
    }
}