import BoardState from "./boardState";
import CONFIG from "./config";
import PointGraph from "js/pq_games/tools/geometry/pointGraph";
import Point from "js/pq_games/tools/geometry/point";
import Route from "./route";
import shuffle from "js/pq_games/tools/random/shuffle";
import Color from "js/pq_games/layout/color/color";
import Circle from "js/pq_games/tools/geometry/circle";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import { circleToPhaser, pathToPhaser } from "js/pq_games/phaser/shapeToPhaser";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import { pathToPhaserObject, rectToPhaserObject } from "js/pq_games/phaser/shapeToPhaserObject";
import Path from "js/pq_games/tools/geometry/paths/path";


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
        const blockY = CONFIG.generation.blockHeightRelativeToWidth*blockX;
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
        const circ = new Circle({ center: realPos, radius: radius });

        let color = "#0000000";
        const op = new LayoutOperation({ fill: color });
        circleToPhaser(circ, op, this.graphics);

        // draw visitor dots
        const freeAngles = this.getFreeAnglesAroundPoint(p);

        const dotRadius = CONFIG.display.visitorSpotRadius * this.blockSize.x;
        const num = Math.min(p.metadata.numVisitorSpots, freeAngles.length);
        shuffle(freeAngles);

        for(let i = 0; i < num; i++)
        {
            const ang = freeAngles[i];
            const offset = new Point().fromAngle(ang).scaleFactor(radius + 0.5*dotRadius);
            const pos = realPos.clone().add(offset);

            const spot = new Circle({ center: pos, radius: dotRadius });
            op.fill = new Color("#00FF00");
            circleToPhaser(spot, op, this.graphics);
        }
    }

    getFreeAnglesAroundPoint(p:PointGraph)
    {
        const numAngles = 12;
        const anglesTaken = new Array(numAngles).fill(false);
        const routes : Route[] = p.metadata.routes;
        for(const route of routes)
        {
            let angle = p.vecTo(route.getOther(p)).angle();
            if(angle < 0) { angle += 2*Math.PI; }

            const val = angle / (2*Math.PI) * numAngles;
            const valLow = (Math.floor(val) + numAngles) % numAngles;
            const valHigh = (Math.ceil(val) + numAngles) % numAngles;

            anglesTaken[valLow] = true;
            anglesTaken[valHigh] = true;
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
        const bl = this.blockSize.x;
        const blockLengthDisplayed = bl*0.9;

        // sample equidistant points along curve (that's precisely long enough to fit)
        const blockData = r.blockData;
        const blockTypeList = r.getTypes();
        const blockSize = new Point(blockLengthDisplayed, this.blockSize.y);

        // calculate offset vectors for doubled routes
        const partOfSet = r.set;
        const marginBetweenSameSet = 0.1*blockSize.y;
        let offsetForSet = 0;
        if(partOfSet)
        {
            const idx = r.set.indexOf(r)
            const num = r.set.count()
            const baseOffset = -0.5*(num - 1);
            offsetForSet = baseOffset + idx;
        }

        // draw the blocks at the combined positions (curvePos + offsetForSet)
        // first and last position aren't used for blocks but for getting the right vector/rotation 
        for(let i = 0; i < blockData.length; i++)
        {
            const color = this.getColorForType(blockTypeList[i]);
            const pos = this.convertToRealPoint(blockData[i].pos);
            const rot = blockData[i].rot;

            const op = new LayoutOperation({
                fill: color,
                stroke: "#000000",
                strokeWidth: 4,
                pivot: new Point(0.5),
                rotation: rot
            })

            const vecForSet = new Point().fromAngle(rot);
            vecForSet.rotate(0.5*Math.PI).scale(blockSize.y + marginBetweenSameSet);
            vecForSet.scale(offsetForSet);

            const tempPos = pos.clone();
            const finalPos = tempPos.add(vecForSet);
            const rect = new Rectangle().fromTopLeft(finalPos, blockSize);
            const rectObj = rectToPhaserObject(rect, op, this.game);
        }


        // @DEBUGGING
        const op = new LayoutOperation({
            stroke: "#FF0000",
            strokeWidth: 6,
        })
        const path = [];
        for(const point of r.pathSimple)
        {
            path.push(this.convertToRealPoint(point));
        }

        const graphics = this.game.add.graphics();
        const pathObject = new Path({ points: path });
        pathToPhaser(pathObject, op, graphics);
    }

    getColorForType(tp:number) : Color
    {
        const hue = (tp / CONFIG.generation.numBlockTypes)*360;
        const colorObject = new Color(hue, 95, 50);
        return colorObject;
    }

    drawTrajectoryBoard(board:BoardState)
    {
        if(!CONFIG.expansions.trajectories) { return; }

        const rect = board.trajectories.rectangle;
        const pos = this.convertToRealPoint(rect.getTopLeft());
        const size = this.convertToRealSize(rect.getSize());

        const op = new LayoutOperation({ fill: "#FF0000" });
        const rectShape = new Rectangle().fromTopLeft(pos, size);
        rectToPhaserObject(rectShape, op, this.game);
        
        // Draw the background and all the trajectories
    }

    drawPlayerAreas()
    {
        if(!CONFIG.display.playerAreas.include) { return; }

        // @TODO: just place a row of squares in the margin of the paper
    }
}