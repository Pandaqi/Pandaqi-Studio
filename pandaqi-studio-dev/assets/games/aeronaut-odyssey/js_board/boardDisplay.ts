import BoardState from "./boardState";
// @ts-ignore
import { Geom, Display } from "js/pq_games/phaser.esm"
import CONFIG from "./config";
import PointGraph from "js/pq_games/tools/geometry/pointGraph";
import Point from "js/pq_games/tools/geometry/point";
import Route from "./route";
import shuffle from "js/pq_games/tools/random/shuffle";


export default class BoardDisplay
{
    game:any;
    graphics:any;
    blockSize: Point;
    outerMargin: Point;
    boardSize: Point;

    constructor(game:any)
    {
        this.game = game;
    }

    convertToRealPoint(pos:PointGraph|Point) : Point
    {
        const anchor = this.outerMargin.clone();
        const offset = this.convertToRealSize(pos);
        return anchor.add(offset);
    }

    convertToRealSize(pos:PointGraph|Point) : Point
    {
        return new Point(
            pos.x * this.blockSize.x,
            pos.y * this.blockSize.x
        )
    }

    draw(board:BoardState)
    {
        const canvSize = new Point(this.game.canvas.width, this.game.canvas.height);
        const canvUnit = Math.min(canvSize.x, canvSize.y);
        
        this.outerMargin = new Point(CONFIG.display.outerMargin * canvUnit);
        this.boardSize = new Point(canvSize.x - 2*this.outerMargin.x, canvSize.y - 2*this.outerMargin.y);

        const blockX = this.boardSize.x / CONFIG.generation.numBlocksFullWidth;
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

        this.drawTrajectoryBoard(board);
        this.drawPlayerAreas();
    }

    drawPoint(p:PointGraph)
    {
        const realPos = this.convertToRealPoint(p);
        const radius = (CONFIG.generation.cityRadius*0.95) * this.blockSize.x;
        const circ = new Geom.Circle(realPos.x, realPos.y, radius);
        //let color = point.metadata.city ? 0xFF0000 : 0x000000;

        // draw basic point/sprite
        let color = 0x000000;
        this.graphics.fillStyle(color);
        this.graphics.fillCircleShape(circ);

        // draw visitor dots
        const freeAngles = this.getFreeAnglesAroundPoint(p);
        const dotRadius = CONFIG.display.visitorSpotRadius * this.blockSize.x;
        const num = p.metadata.numVisitorSpots;
        shuffle(freeAngles);
        for(let i = 0; i < num; i++)
        {
            const ang = freeAngles.pop();
            const offset = new Point(Math.cos(ang), Math.sin(ang)).scaleFactor(radius + 0.5*dotRadius);
            const pos = realPos.clone().add(offset);
            const spot = new Geom.Circle(pos.x, pos.y, dotRadius);

            this.graphics.fillStyle(0x00FF00);
            this.graphics.fillCircleShape(spot);
        }
    }

    getFreeAnglesAroundPoint(p:PointGraph)
    {
        const numAngles = 9;
        const anglesTaken = new Array(numAngles).fill(false);
        const routes : Route[] = p.metadata.routes;
        for(const route of routes)
        {
            let angle = Point.RIGHT.angleTo(route.getOther(p));
            if(angle < 0) { angle += 2*Math.PI; }

            const bucket = Math.round(angle / (2*Math.PI) * numAngles) % numAngles;
            anglesTaken[bucket] = true;
        }

        const anglesFree = [];
        for(let i = 0; i < numAngles; i++)
        {
            if(anglesTaken[i]) { continue; }
            anglesFree.push((i / numAngles) * 2 * Math.PI);
        }

        return anglesFree;
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

        const routeTooLong = emptySpacePerBlock < 0; // @TODO: do something with this, probably add CURVE

        const blockTypeList = r.getTypes();
        for(let i = 0; i < numBlocks; i++)
        {
            const color = this.getColorForType(blockTypeList[i]);

            const rect = this.game.add.rectangle(curPos.x, curPos.y, blockLengthDisplayed, this.blockSize.y, color);
            rect.setOrigin(0.5);

            const angle = vec.angle();
            rect.setRotation(angle);
            curPos.add(vec.clone().scale(offsetPerBlock));
        }
    }

    getColorForType(tp:number)
    {
        const hue = (tp / CONFIG.generation.numBlockTypes);
        const colorObject = Display.Color.HSLToColor(hue, 0.95, 0.5);
        return colorObject.color;
    }

    drawTrajectoryBoard(board:BoardState)
    {
        if(!CONFIG.expansions.trajectories) { return; }

        const rect = board.trajectories.rectangle;
        const pos = this.convertToRealPoint(rect.getTopLeft());
        const size = this.convertToRealSize(rect.getSize());
        
        const rectDisplayed = this.game.add.rectangle(pos.x, pos.y, size.x, size.y);
        rectDisplayed.setFillStyle(0xFF0000, 1.0);

        // Draw the background and all the trajectories
    }

    drawPlayerAreas()
    {
        if(!CONFIG.display.playerAreas.include) { return; }

        // @TODO: just place a row of squares in the margin of the paper
    }
}