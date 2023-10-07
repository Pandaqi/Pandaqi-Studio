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
import { lineToPhaserObject, pathToPhaserObject, rectToPhaserObject } from "js/pq_games/phaser/shapeToPhaserObject";
import Path from "js/pq_games/tools/geometry/paths/path";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig, { TextAlign } from "js/pq_games/layout/text/textConfig";
import textToPhaser from "js/pq_games/phaser/textToPhaser";
import bevelPath from "js/pq_games/tools/geometry/effects/bevelPath";
import { BLOCKS, BONUSES } from "./dict";
import imageToPhaser from "js/pq_games/phaser/imageToPhaser";
import TintEffect from "js/pq_games/layout/effects/tintEffect";
import Line from "js/pq_games/tools/geometry/line";
import Trajectory from "./trajectory";
import fromArray from "js/pq_games/tools/random/fromArray";


export default class BoardDisplay
{
    game:any;
    graphics:any;
    blockSize: Point;
    outerMargin: Point;
    boardSize: Point;
    allTypes: string[];

    constructor(game:any)
    {
        this.game = game;
        this.prepareTypes();
    }

    // prepare types + cache some values (such as color object)
    prepareTypes()
    {
        const allBlocks = Object.keys(BLOCKS);
        for(let i = allBlocks.length-1; i >= 0; i--)
        {
            if(!BLOCKS[allBlocks[i]].unpickable) { continue; }
            allBlocks.splice(i, 1);
        }
        shuffle(allBlocks);

        let numTypes = CONFIG.generation.numBlockTypes;
        if(CONFIG.expansions.wildWinds) { numTypes--; }

        let types = allBlocks.slice(0, numTypes);
        if(CONFIG.expansions.wildWinds) { types.push("gray"); }
        
        this.allTypes = types;
        for(let i = 0; i < types.length; i++)
        {
            const data = this.getDataForType(i);
            data.color = new Color(data.color);
        }
    }

    prepareCityNames(board:BoardState)
    {
        const points = board.getPoints();
        const unchecked = [points[0]];
        const checked = [];

        const names = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let counter = 0;

        while(unchecked.length > 0)
        {
            const p = unchecked.pop();
            if(checked.includes(p)) { continue; }
            checked.push(p);
            p.metadata.cityName = names.charAt(counter);
            counter++;

            for(const nb of p.getConnectionsByPoint())
            {
                // add at start of array to go "deep search" and create chains of alphabetical names
                unchecked.unshift(nb);
            }
        }
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

        this.prepareCityNames(board);

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

        this.debugDrawForbiddenAreas(board);
        this.drawTrajectoryBoard(board);
        this.drawPlayerAreas(board);
    }

    drawPoint(p:PointGraph)
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
        const name : string = p.metadata.cityName;
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

            // base rectangle + bevels
            const op = new LayoutOperation({
                fill: color,
                stroke: "#000000",
                strokeWidth: 4,
                pivot: new Point(0.5),
                rotation: rot
            })

            const rect = new Rectangle().fromTopLeft(pos, blockSize);
            const rectObj = rectToPhaserObject(rect, op, this.game);

            // @TODO: probably wrong because pathToPhaserObject not correct
            const bevelOffset = CONFIG.display.blocks.bevelOffset * blockSize.x; 
            const bevels = bevelPath({ path: rect.toPath(), offset: bevelOffset });

            const bevelOp = new LayoutOperation({
                fill: color.darken(50),
                pivot: new Point(0.5),
                rotation: rot
            })

            for(const bevel of bevels)
            {
                pathToPhaserObject(bevel, bevelOp, this.game);
            }

            const numSubdivisions = 3;
            const subdivLength = blockSize.x / numSubdivisions;
            const vec = new Point().fromAngle(rot).scale(blockSize.x).scale(1.0 / (numSubdivisions - 1));
            const positions = [
                pos.clone().sub(vec),
                pos.clone(),
                pos.clone().add(vec)
            ];

            // type icon
            const img = CONFIG.resLoader.getResource("block_icons");
            const iconSize = CONFIG.display.blocks.iconSize * Math.min(subdivLength, blockSize.y);
            const iconOp = new LayoutOperation({
                translate: positions[0],
                pivot: new Point(0.5),
                dims: new Point(iconSize),
                rotation: rot,
                effects: [
                    new TintEffect({ color: color })
                ]
            })
            imageToPhaser(img, iconOp, this.game);

            // bonus icon
            // @TODO: some bonuses might need more elements than this?
            if(bonus)
            {
                const bonusSprite = CONFIG.resLoader.getResource("bonus_icons")
                iconOp.translate = positions[1];
                iconOp.effects = [];

                imageToPhaser(bonusSprite, iconOp, this.game);
            }

            // writing space
            const writingSpaceSize = new Point(subdivLength, blockSize.y).scaleFactor(CONFIG.display.blocks.writingSpaceScale);
            const writingRect = new Rectangle({ center: positions[2], extents: writingSpaceSize });
            const writingOp = new LayoutOperation({
                fill: "#FFFFFF",
                stroke: "#000000",
                strokeWidth: 2,
                pivot: new Point(0.5)
            })
            rectToPhaserObject(writingRect, writingOp, this.game);

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

    getDataForType(tp:number)
    {
        return BLOCKS[this.allTypes[tp]];
    }

    getColorForType(tp:number) : Color
    {
        return this.getDataForType(tp).color as Color;
    }

    drawTrajectoryBoard(board:BoardState)
    {
        if(!CONFIG.expansions.trajectories) { return; }
        
        // draw background (HOW??)

        // draw all the trajectories
        const trajs = board.trajectories.get();
        const fullRectSize = this.convertToRealSize(CONFIG.generation.trajectorySize);
        const numSubdivisions = 6;

        let anchor = this.convertToRealPoint(board.trajectories.getRectangle().getTopLeft());

        const textConfig = new TextConfig({
            font: "ArmWrestler",
            size: 0.8*fullRectSize.y,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE
        })

        for(const traj of trajs)
        {
            const bonus = traj.bonus;

            // background rectangle
            const rect = new Rectangle().fromTopLeft(anchor, fullRectSize);
            const rectOp = new LayoutOperation({ fill: "#CCCCCC" });
            rectToPhaserObject(rect, rectOp, this.game);

            // determine subdivisions beforehand
            const positions = [];
            const subdivSize = new Point(fullRectSize.x / numSubdivisions, fullRectSize.y);
            anchor.add(subdivSize.clone().scaleFactor(0.5)); // subdivisions are anchored at center, that's what everything needs anyway
            for(let i = 0; i < numSubdivisions; i++)
            {
                const offset = new Point(subdivSize.x, 0).scaleFactor(i);
                positions.push(anchor.clone().add(offset));
            }

            // now display subdivisions
            // 1) start city
            this.drawCityName(positions[0], traj.start.metadata.cityName, textConfig);

            // 2) connection line
            const line = new Line(positions[0], positions[2]);
            const lineOp = new LayoutOperation({ 
                stroke: "#000000", 
                strokeWidth: 4, 
                pivot: new Point(0.5, 0.5), 
            })
            lineToPhaserObject(line, lineOp, this.game);

            // 3) end city
            this.drawCityName(positions[2], traj.end.metadata.cityName, textConfig);

            // 4) bonus 1
            this.drawBonus(positions[3], subdivSize, traj, 0, textConfig);

            // 5) writing space 1 / bonus 2
            if(!this.getBonusData(bonus).singleSpace) {
                this.drawBonus(positions[4], subdivSize, traj, 1, textConfig);
            } else {
                this.drawWritingSpace(positions[4], subdivSize);
            }

            // 6) writing space 2
            this.drawWritingSpace(positions[5], subdivSize);
        }
    }

    drawCityName(pos:Point, text:string, textConfig: TextConfig)
    {
        const textRes = new ResourceText({ text: text, textConfig: textConfig });
        const textOp = new LayoutOperation({
            fill: "#000000",
            translate: pos
        })
        textToPhaser(textRes, textOp, this.game);
    }

    drawWritingSpace(pos:Point, size:Point)
    {
        const rect = new Rectangle({ center: pos, extents: size });
        const op = new LayoutOperation({ fill: "#FFFFFF", stroke: "#000000", strokeWidth: 1, pivot: new Point(0.5) });
        rectToPhaserObject(rect, op, this.game);
    }

    getBonusData(bonus:string)
    {
        return BONUSES[bonus];
    }

    drawBonus(pos:Point, size:Point, traj:Trajectory, spaceIndex:number, textConfig:TextConfig)
    {
        const bonusType = traj.bonus;
        if(!bonusType) { return; }

        let img, text;
        const op = new LayoutOperation({
            translate: pos,
            dims: size,
            pivot: new Point(0.5),
            frame: BONUSES[bonusType].frame
        })

        const numberTypes = ["points", "balloons", "inventory", "swap", "abilitySteal"];
        if(spaceIndex == 0 && numberTypes.includes(bonusType)) {
            text = traj.bonusNumber + "";
        } else {
            // if balloons, use the block_icons spritesheet instead, 
            // with a randomly selected frame (that is IN the game!)
            if(bonusType == "balloons") {
                img = CONFIG.resLoader.getResource("block_icons");

                let type = fromArray(this.allTypes);
                if(type == "gray") { type = "wildcard"; }
                op.frame = BLOCKS[type].frame;
            
            // otherwise, use bonus_icons spritesheet
            } else {
                img = CONFIG.resLoader.getResource("bonus_icons");
            }
        }

        if(img) { imageToPhaser(img, op, this.game); }
        if(text) { 
            text = new ResourceText({ text: text, textConfig: textConfig });
            textToPhaser(text, op, this.game); 
        }
    }

    // subdivide player areas into number of squares, draw those
    drawPlayerAreas(board:BoardState)
    {
        if(!CONFIG.display.playerAreas.include) { return; }

        const op = new LayoutOperation({ stroke: "#000000", strokeWidth: 2 });

        const numRoutes = board.getRoutes().length;
        const numSpaces = Math.round(CONFIG.display.playerAreas.numSpacesPerRoute * numRoutes);
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