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
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig, { TextAlign } from "js/pq_games/layout/text/textConfig";
import textToPhaser from "js/pq_games/phaser/textToPhaser";


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

        const blockX = this.boardSize.x / board.dims.x;
        const blockY = CONFIG.generation.blockHeightRelativeToWidth*blockX;
        this.blockSize = new Point(blockX, blockY);
        
        if(this.graphics) { this.graphics.clear(); }

        const graphics = this.game.add.graphics();
        this.graphics = graphics;

        const points : PointGraph[] = board.getPoints()
        for(let i = 0; i < points.length; i++)
        {
            this.drawPoint(i, points[i]);
        }

        const routes : Route[] = board.getRoutes();
        for(const route of routes)
        {
            this.drawRoute(route);
        }

        this.debugDrawForbiddenAreas(board);
        this.drawTrajectoryBoard(board);
        this.drawPlayerAreas(board);
    }

    drawPoint(idx: number, p:PointGraph)
    {
        const realPos = this.convertToRealPoint(p);
        const radius = (CONFIG.generation.cityRadius*CONFIG.display.cityDotRadius) * this.blockSize.x;
        const circ = new Circle({ center: realPos, radius: radius });

        // draw visitor dots
        const angles = this.getAnglesSortedByAvailability(p);

        const dotRadius = CONFIG.display.visitorSpotRadius * this.blockSize.x;
        const num = Math.min(p.metadata.numVisitorSpots, angles.length);

        const op = new LayoutOperation({ fill: "#FFFFFF", stroke: "#000000", strokeWidth: 2 });
        for(let i = 0; i < num; i++)
        {
            const ang = angles[i].angle;
            const offset = new Point().fromAngle(ang).scaleFactor(0.75*radius + 0.75*dotRadius);
            const pos = realPos.clone().add(offset);

            const spot = new Circle({ center: pos, radius: dotRadius });
            circleToPhaser(spot, op, this.graphics);
        }

        // draw actual city
        op.fill = Color.BLACK;
        circleToPhaser(circ, op, this.graphics);

        // draw name
        const name = this.getCityName(idx);
        const textCfg = new TextConfig({
            font: "ArmWrestler",
            size: 2*radius*CONFIG.display.cityNameRadius,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE
        })
        const text = new ResourceText({ text: name, textConfig: textCfg });
        const textOp = new LayoutOperation({
            fill: "#FFFFFF",
            translate: circ.center
        })
        textToPhaser(text, textOp, this.game);
    }

    getCityName(idx:number)
    {
        return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charAt(idx);
    }

    // @TODO: create PQ GAMES library function for this? "divideAnglesIntoBuckets"?
    getAnglesSortedByAvailability(p:PointGraph)
    {
        const numAngles = CONFIG.display.numVisitorSpotAngles;
        const angleData = [];
        for(let i = 0; i < numAngles; i++)
        {
            const ang = (i / numAngles) * 2 * Math.PI;
            angleData.push({ angle: ang, available: true })
        }

        const routes : Route[] = p.metadata.routes;
        for(const route of routes)
        {
            let angle = p.vecTo(route.getOther(p)).angle();
            if(angle < 0) { angle += 2*Math.PI; }

            const val = angle / (2*Math.PI) * numAngles;
            const valLow = (Math.floor(val) + numAngles) % numAngles;
            const valHigh = (Math.ceil(val) + numAngles) % numAngles;

            angleData[valLow].available = false;
            angleData[valHigh].available = false;
        }

        shuffle(angleData);
        angleData.sort((a,b) => {
            if(a.available && !b.available) { return -1; }
            if(b.available && !a.available) { return 1; }
            return 0;
        })

        return angleData;
    }
    
    drawRoute(r:Route)
    {
        const bl = this.blockSize.x;
        const blockLengthDisplayed = bl*0.9;

        // sample equidistant points along curve (that's precisely long enough to fit)
        const blockData = r.blockData;
        const blockTypeList = r.getTypes();
        const blockBonusList = r.getBonuses();
        const blockSize = new Point(blockLengthDisplayed, this.blockSize.y);

        // draw the blocks at the combined positions (curvePos + offsetForSet)
        // first and last position aren't used for blocks but for getting the right vector/rotation 
        for(let i = 0; i < blockData.length; i++)
        {
            const color = this.getColorForType(blockTypeList[i]);
            const bonus = blockBonusList[i]; // @TODO: display
            const pos = this.convertToRealPoint(blockData[i].pos);
            const rot = blockData[i].rot;

            const op = new LayoutOperation({
                fill: color,
                stroke: "#000000",
                strokeWidth: 4,
                pivot: new Point(0.5),
                rotation: rot
            })

            const rect = new Rectangle().fromTopLeft(pos, blockSize);
            const rectObj = rectToPhaserObject(rect, op, this.game);
        }

        this.debugDrawRouteOverlapRectangle(r);
    }

    debugDrawRouteOverlapRectangle(r:Route)
    {
        if(!CONFIG.display.debugDrawOverlapRectangle) { return; }

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
        
        // Draw the background and all the trajectories
    }

    // subdivide player areas into number of squares, draw those
    drawPlayerAreas(board:BoardState)
    {
        if(!CONFIG.display.playerAreas.include) { return; }

        const op = new LayoutOperation({ stroke: "#000000", strokeWidth: 2 });

        const numSpaces = CONFIG.display.playerAreas.numSpaces;
        const playerAreas = board.playerAreas.get();
        for(const playerArea of playerAreas)
        {
            const vec = playerArea.getVec();
            const extents = this.convertToRealSize(playerArea.rect.extents);
            const length = Math.abs(extents.dot(vec));
            const orthoLength = Math.abs(extents.dot(vec.clone().rotate(0.5*Math.PI)));
            
            const subRectSize = new Point(length / numSpaces, orthoLength);
            let anchor = this.convertToRealPoint(playerArea.anchor);
        
            const subRectangles = [];
            for(let i = 0; i < numSpaces; i++)
            {
                const subRect = new Rectangle().fromTopLeft(anchor, subRectSize);
                subRect.rotateFromPivot(new Point(0, 0.5), playerArea.getRotation());
                subRectangles.push(subRect);

                let offset = vec.clone().scale(subRect.extents);
                anchor.add(offset);
            }

            for(const subRect of subRectangles)
            {
                rectToPhaserObject(subRect, op, this.game);
            }
        }

    }

    debugDrawForbiddenAreas(board:BoardState)
    {
        for(const rect of board.forbiddenAreas.get())
        {
            const pos = this.convertToRealPoint(rect.getTopLeft());
            const size = this.convertToRealSize(rect.getSize());
    
            const op = new LayoutOperation({ fill: "#FF0000" });
            const rectShape = new Rectangle().fromTopLeft(pos, size);
            rectToPhaserObject(rectShape, op, this.game);
        }        
    }
}