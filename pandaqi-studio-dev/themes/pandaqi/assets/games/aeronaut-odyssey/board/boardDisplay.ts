import BoardState from "./boardState";
import CONFIG from "./config";
import Route from "./route";
import { BLOCKS, BONUSES } from "./dict";
import { Vector2, shuffle, Color, Vector2Graph, Circle, LayoutOperation, TextConfig, TextAlign, ResourceText, Rectangle, rotatePath, bevelPath, calculateCenter, Path, Line, GrayScaleEffect, fromArray, calculateCentroid } from "lib/pq-games";
import Trajectory from "./trajectory";

export default class BoardDisplay
{
    game:any;
    graphics:any;
    blockSize: Vector2;
    outerMargin: Vector2;
    boardSize: Vector2;
    allTypes: string[];

    constructor(game:any)
    {
        this.game = game;
    }

    // prepare types + cache some values (such as color object)
    prepareTypes(board:BoardState)
    {
        const allBlocks = Object.keys(BLOCKS);
        for(let i = allBlocks.length-1; i >= 0; i--)
        {
            const data = BLOCKS[allBlocks[i]];
            let unpickable = data.unpickable || (CONFIG.expansions.bonusBalloons && data.unpickableBonus);
            if(!unpickable) { continue; }
            allBlocks.splice(i, 1);
        }
        shuffle(allBlocks);
        
        // if WildWinds enabled, we reserve one spot to forcibly insert the gray/wildcard type
        let numTypes = board.numBlockTypes;
        if(CONFIG.expansions.wildWinds) { numTypes--; }

        let types = allBlocks.slice(0, numTypes);
        if(CONFIG.expansions.wildWinds) { types.push("gray"); }
        
        // cache the colors as real color objects, is a bit faster and easier later on
        this.allTypes = types;
        for(let i = 0; i < types.length; i++)
        {
            const data = this.getDataForType(i);
            let color = new Color(data.color);
            if(CONFIG.inkFriendly) { color = new Color("#FFFFFF"); }
            data.color = color;
        }
    }

    prepareCityNames(board:BoardState)
    {
        const unchecked = [board.pointsManager.getCapital()];
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

            for(const nb of p.getConnectionsByVector2())
            {
                // add at start of array to go "deep search" and create chains of alphabetical names
                unchecked.push(nb);
            }
        }
    }

    convertToRealVector2(pos:Vector2Graph|Vector2) : Vector2
    {
        const anchor = this.outerMargin.clone();
        const offset = this.convertToRealSize(pos);
        return anchor.add(offset);
    }

    convertToRealSize(pos:Vector2Graph|Vector2) : Vector2
    {
        return new Vector2(
            pos.x * this.blockSize.x,
            pos.y * this.blockSize.x
        )
    }

    draw(board:BoardState)
    {
        const canvSize = new Vector2(this.game.canvas.width, this.game.canvas.height);
        const canvUnit = Math.min(canvSize.x, canvSize.y);
        
        this.outerMargin = new Vector2(CONFIG.display.outerMargin * canvUnit);
        this.boardSize = new Vector2(canvSize.x - 2*this.outerMargin.x, canvSize.y - 2*this.outerMargin.y);

        const blockX = CONFIG.blockSizeOverride ?? this.boardSize.x / board.size.x;
        const blockY = CONFIG.generation.blockHeightRelativeToWidth*blockX;
        this.blockSize = new Vector2(blockX, blockY);
        
        // @NOTE: only used when debugging and redrawing different stages on top of each other
        if(this.graphics) { this.graphics.clear(); }

        const graphics = this.game.add.graphics();
        this.graphics = graphics;

        this.prepareTypes(board);
        this.prepareCityNames(board);

        this.drawRouteAreas(board);

        const points : Vector2Graph[] = board.getPoints()
        for(const point of points)
        {
            this.drawVector2(point);
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

    drawVector2(p:Vector2Graph)
    {
        const realPos = this.convertToRealVector2(p);
        const cityRadiusFactor = CONFIG.useRealMaterial ? 1.0 : CONFIG.display.cityDotRadius

        const radius = (CONFIG.generation.cityRadius*cityRadiusFactor) * this.blockSize.x;
        const circ = new Circle({ center: realPos, radius: radius });

        // draw visitor dots
        const drawVisitorDots = !CONFIG.useRealMaterial;

        if(drawVisitorDots)
        {
            let angles = this.getAnglesSortedByAvailability(p);

            const dotRadius = CONFIG.display.visitorSpotRadius * this.blockSize.x;
            const num = Math.min(p.metadata.numVisitorSpots, angles.length);
            const strokeWidth = CONFIG.display.visitorSpotStrokeWidth * this.blockSize.x;
    
            if(!CONFIG.display.arrangeVisitorSpotsForAvoidance) { angles = this.getEquidistantAngles(num); }

            const op = new LayoutOperation({ fill: "#FFFFFF", stroke: "#000000", strokeWidth: strokeWidth });
            for(let i = 0; i < num; i++)
            {
                const ang = angles[i].angle;
                const offset = new Vector2().fromAngle(ang).scaleFactor(0.75*radius + 0.75*dotRadius);
                const pos = realPos.clone().add(offset);
    
                const spot = new Circle({ center: pos, radius: dotRadius });
                circleToPhaser(spot, op, this.graphics);
            }
        }

        // draw actual city
        const cityColor = p.metadata.capital ? CONFIG.display.cityDotColorCapital : CONFIG.display.cityDotColor;
        const op = new LayoutOperation({ fill: cityColor });
        circleToPhaser(circ, op, this.graphics);

        // draw name
        const name : string = p.metadata.cityName;
        const textCfg = new TextConfig({
            font: CONFIG.fonts.heading,
            size: CONFIG.display.cityNameFontSize*2*radius*CONFIG.display.cityNameRadius,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE
        })
        const text = new ResourceText({ text: name, textConfig: textCfg });
        const textOp = new LayoutOperation({
            fill: "#FFFFFF",
            pos: circ.center
        })
        textToPhaser(text, textOp, this.game);
    }

    getEquidistantAngles(num:number)
    {
        const angleData = [];
        for(let i = 0; i < num; i++)
        {
            const ang = (i / num) * 2 * Math.PI;
            angleData.push({ angle: ang, available: true })
        }
        return angleData;
    }

    // @TODO: create PQ GAMES library function for this? "divideAnglesIntoBuckets"?
    getAnglesSortedByAvailability(p:Vector2Graph)
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
        if(!r.blockData) {
            return console.error("Can't display a route without block data", r);
        }

        const bl = this.blockSize.x;
        const blockLengthDisplayed = bl*0.9;

        // sample equidistant points along curve (that's precisely long enough to fit)
        const blockData = r.blockData;
        const blockTypeList = r.getTypes();
        const blockBonusList = r.getBonuses();
        const blockSize = new Vector2(blockLengthDisplayed, this.blockSize.y);

        const routeInverted = r.start.y > r.end.y;

        // used to get consistently colored bevels
        const lightVec = CONFIG.display.blocks.bevelLightVec; 
        const routeStrokeWidth = CONFIG.display.blocks.strokeWidth * blockSize.x;
        const writingSpaceStrokeWidth = CONFIG.display.blocks.writingSpaceStrokeWidth * blockSize.x;

        // draw the blocks at the combined positions (curvePos + offsetForSet)
        // first and last position aren't used for blocks but for getting the right vector/rotation 
        for(let i = 0; i < blockData.length; i++)
        {
            const type = blockTypeList[i];
            const color = this.getColorForType(type);
            const bonus = blockBonusList[i];
            const pos = this.convertToRealVector2(blockData[i].pos);
            const rot = blockData[i].rot;
            let rotAlwaysUp = rot;
            if(rotAlwaysUp < -0.5*Math.PI) { rotAlwaysUp += 0.5*Math.PI; }
            if(rotAlwaysUp > 0.5*Math.PI) { rotAlwaysUp -= 0.5*Math.PI; }

            // base rectangle + bevels
            const op = new LayoutOperation({
                fill: color,
                stroke: "#000000",
                strokeWidth: routeStrokeWidth,
                pivot: new Vector2(0.5),
                rot: rot
            })

            const rect = new Rectangle({ center: pos, extents: blockSize });
            const rectObj = rectToPhaserObject(rect, op, this.game);

            const graphics = this.game.add.graphics();
            const bevelOffset = CONFIG.display.blocks.bevelOffset * blockSize.x; 
            const rectRotatedPath = rotatePath(rect, rot);
            const bevels = bevelPath({ path: rectRotatedPath, offset: bevelOffset });
            const colorChangeVal = 30;

            const bevelOpDark = new LayoutOperation({
                fill: color.darken(colorChangeVal),
                pivot: new Vector2(0.5),
            })

            const bevelOpLight = new LayoutOperation({
                fill: color.lighten(colorChangeVal),
                pivot: new Vector2(0.5)
            })

            for(const bevel of bevels)
            {
                const center = calculateCenter(bevel.toPath());
                const vecToBevelCenter : Vector2 = rect.center.vecTo(center);
                const dot = vecToBevelCenter.normalize().dot(lightVec);

                const bevelOp = dot >= 0 ? bevelOpLight : bevelOpDark;
                pathToPhaser(bevel, bevelOp, graphics);
            }

            const numSubdivisions = 3;
            const subdivLength = blockSize.x / numSubdivisions;
            const vec = new Vector2().fromAngle(rot).scale(blockSize.x).scale(1.0 / numSubdivisions);
            const positions = [
                pos.clone().sub(vec),
                pos.clone(),
                pos.clone().add(vec)
            ];

            // this makes sure the order of icon>writingspace is generally consistent on the map
            // which looks less messy
            if(routeInverted) { positions.reverse(); }

            // type icon
            const img = CONFIG.resLoader.getResource("block_icons_filled");
            const imgPos = CONFIG.useRealMaterial ? positions[1] : positions[0];
            const iconSize = CONFIG.display.blocks.iconSize * Math.min(subdivLength, blockSize.y);
            const iconOp = new LayoutOperation({
                pos: imgPos,
                pivot: new Vector2(0.5),
                size: new Vector2(iconSize),
                frame: this.getFrameForType(type),
                rot: rotAlwaysUp,
            })
            imageToPhaser(img, iconOp, this.game);

            // bonus icon
            // @TODO: some bonuses might need more elements than this?
            if(bonus)
            {
                const bonusSprite = CONFIG.resLoader.getResource("bonus_icons")
                iconOp.pos = positions[1];
                iconOp.effects = [];

                imageToPhaser(bonusSprite, iconOp, this.game);
            }

            const drawWritingSpace = !CONFIG.useRealMaterial;

            if(drawWritingSpace)
            {
                // writing space
                const writingSpaceSize = new Vector2(subdivLength, blockSize.y).scaleFactor(CONFIG.display.blocks.writingSpaceScale);
                const writingRect = new Rectangle({ center: new Vector2(), extents: writingSpaceSize });
                const writingOp = new LayoutOperation({
                    pos: positions[2],
                    fill: "#FFFFFF",
                    stroke: "#000000",
                    strokeWidth: writingSpaceStrokeWidth,
                    pivot: new Vector2(0.5),
                    rot: rot
                })
                rectToPhaserObject(writingRect, writingOp, this.game);
            }
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
            path.push(this.convertToRealVector2(point));
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

    getFrameForType(tp:number) : number
    {
        return this.getDataForType(tp).frame;
    }

    drawTrajectoryBoard(board:BoardState)
    {
        if(!CONFIG.expansions.trajectories) { return; }
        
        // @TODO: draw background (HOW??)

        // draw all the trajectories
        const trajs = board.trajectories.get();
        const fullRectSize = this.convertToRealSize(CONFIG.generation.trajectorySize);
        const numSubdivisions = 6;
        
        const connLineStrokeWidth = CONFIG.display.trajectories.connLineStrokeWidth * fullRectSize.y;

        let anchor = this.convertToRealVector2(board.trajectories.getRectangle().getTopLeft());

        const textConfig = new TextConfig({
            font: CONFIG.fonts.heading,
            size: CONFIG.display.trajectories.cityNameFontSize*fullRectSize.y,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE
        })

        const bgColors = [new Color(0,0,0,0.1), new Color(0,0,0,0.3)];
        let counter = 0;

        for(const traj of trajs)
        {
            const bonus = traj.bonus;
            const cityNames = traj.getCityNamesAlphabetical();

            // background rectangle
            const rect = new Rectangle().fromTopLeft(anchor, fullRectSize);
            const bgColor = bgColors[counter % 2];
            const rectOp = new LayoutOperation({ fill: bgColor, pivot: new Vector2(0.5) });
            rectToPhaserObject(rect, rectOp, this.game);

            // determine subdivisions beforehand
            const tempAnchor = anchor.clone();
            const positions = [];
            const subdivSize = new Vector2(fullRectSize.x / numSubdivisions, fullRectSize.y);
            const subdivSizeUnit = new Vector2(Math.min(subdivSize.x, subdivSize.y));
            tempAnchor.add(subdivSize.clone().scaleFactor(0.5)); // subdivisions are anchored at center, that's what everything needs anyway
            for(let i = 0; i < numSubdivisions; i++)
            {
                const offset = new Vector2(subdivSize.x, 0).scaleFactor(i);
                positions.push(tempAnchor.clone().add(offset));
            }

            // now display subdivisions
            // 1) start city
            this.drawCityName(positions[0], cityNames[0], textConfig);

            // 2) connection line + dots
            const linePos = positions[1];
            const lineVec = positions[1].vecTo(positions[2]).scale(0.375);

            const line = new Line(linePos.clone().sub(lineVec), linePos.clone().add(lineVec));
            const lineOp = new LayoutOperation({ 
                stroke: "#000000", 
                strokeWidth: connLineStrokeWidth, 
                pivot: new Vector2(0), 
            })
            lineToPhaserObject(line, lineOp, this.game);

            const circRadius = connLineStrokeWidth*2;
            const circ1 = new Circle({ center: line.start, radius: circRadius });
            const circ2 = new Circle({ center: line.end, radius: circRadius });
            const circOp = new LayoutOperation({ fill: "#000000", pivot: new Vector2(0.5) });
            circleToPhaserObject(circ1, circOp, this.game);
            circleToPhaserObject(circ2, circOp, this.game);

            // 3) end city
            this.drawCityName(positions[2], cityNames[1], textConfig);

            // 4) bonus 1
            this.drawBonus(positions[3], subdivSizeUnit, traj, 0, textConfig);

            // 5) writing space 1 / bonus 2
            if(!this.getBonusData(bonus).singleSpace) {
                this.drawBonus(positions[4], subdivSizeUnit, traj, 1, textConfig);
            } else {
                this.drawWritingSpace(positions[4], subdivSizeUnit);
            }

            // 6) writing space 2
            this.drawWritingSpace(positions[5], subdivSizeUnit);

            anchor.move(new Vector2(0,fullRectSize.y));
            counter++;
        }
    }

    drawCityName(pos:Vector2, text:string, textConfig: TextConfig)
    {
        const textRes = new ResourceText({ text: text, textConfig: textConfig });
        const textOp = new LayoutOperation({
            fill: "#000000",
            pos: pos
        })
        textToPhaser(textRes, textOp, this.game);
    }

    drawWritingSpace(pos:Vector2, size:Vector2)
    {
        size = size.clone().scaleFactor(0.9); // just a bit of padding to make it nicer
        const rect = new Rectangle({ center: pos, extents: size });
        const op = new LayoutOperation({ fill: "#FFFFFF", stroke: "#000000", strokeWidth: 1, pivot: new Vector2(0.5) });
        rectToPhaserObject(rect, op, this.game);
    }

    getBonusData(bonus:string)
    {
        return BONUSES[bonus];
    }

    drawBonus(pos:Vector2, size:Vector2, traj:Trajectory, spaceIndex:number, textConfig:TextConfig)
    {
        const bonusType = traj.bonus;
        if(!bonusType) { return; }

        let img, text;
        const effects = [];
        if(CONFIG.inkFriendly)
        {
            effects.push(new GrayScaleEffect());
        }

        const op = new LayoutOperation({
            pos: pos,
            size: size.clone(),
            pivot: new Vector2(0.5),
            frame: BONUSES[bonusType].frame,
        })

        const numberTypes = ["points", "balloons", "inventory", "swap", "abilitySteal"];
        if(spaceIndex == 0 && numberTypes.includes(bonusType)) {
            text = traj.bonusNumber + "";
            op.size.x *= 2; // to prevent text wrapping because narrow width on double digits
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

            op.effects = effects;
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

        const strokeWidth = CONFIG.display.playerAreas.strokeWidth * this.blockSize.x;
        const op = new LayoutOperation({ stroke: "#000000", strokeWidth: strokeWidth, pivot: new Vector2(0.5) });

        const numRoutes = board.getRoutes().length;
        const numSpaces = Math.round(CONFIG.display.playerAreas.numSpacesPerRoute * numRoutes);
        const playerAreas = board.playerAreas.get();
        for(const playerArea of playerAreas)
        {
            const vec = playerArea.getVec();
            const extents = this.convertToRealSize(playerArea.rect.extents);
            const length = Math.abs(extents.dot(vec));
            const orthoLength = Math.abs(extents.dot(vec.clone().rotate(0.5*Math.PI)));
            
            const subRectSize = new Vector2(length / numSpaces, orthoLength);
            let anchor = this.convertToRealVector2(playerArea.anchor);
        
            const subRectangles = [];
            for(let i = 0; i < numSpaces; i++)
            {
                const subRect = new Rectangle().fromTopLeft(anchor, subRectSize);
                subRect.rotateFromPivot(new Vector2(0, 0.5), playerArea.getRotation());
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
        if(!CONFIG.display.debugDrawForbiddenAreas) { return; }

        for(const rect of board.forbiddenAreas.get())
        {
            const pos = this.convertToRealVector2(rect.getTopLeft());
            const size = this.convertToRealSize(rect.getSize());
    
            const op = new LayoutOperation({ fill: "#FF0000", pivot: new Vector2(0.5) });
            const rectShape = new Rectangle().fromTopLeft(pos, size);
            rectToPhaserObject(rectShape, op, this.game);
        }        
    }

    drawRouteAreas(board:BoardState)
    {
        const areas = board.routeAreas.get();
        console.log(areas);
        const graphics = this.game.add.graphics();
        let counter = 0;
        let inc = 360 / areas.length;
        for(const area of areas)
        {
            const path = this.convertRouteAreaToPath(area);
            const pathObj = new Path(path);
            const op = new LayoutOperation({ fill: new Color(counter * inc, 50, 50, 0.2) });
            pathToPhaser(pathObj, op, graphics);

            const midVector2 = calculateCentroid(path); // calculateCenter(path);
            const circ = new Circle({ center: midVector2, radius: 20 });
            const opCirc = new LayoutOperation({ fill: "#FFFFFF" });
            circleToPhaser(circ, opCirc, graphics);

            counter++;
        }
    }

    convertRouteAreaToPath(area:Vector2Graph[])
    {
        const path = [];
        for(let i = 0; i < area.length-1; i++)
        {
            const p1 = area[i];
            const p2 = area[i+1];

            let matchingRoute = null;
            for(const route of p1.metadata.routes)
            {
                if(route.getOther(p1) != p2) { continue; }
                matchingRoute = route;
                break;
            }

            path.push(this.convertToRealVector2(p1));

            const blockData = matchingRoute.blockData.slice();
            if(matchingRoute.start != p1) { blockData.reverse(); }
            for(const block of blockData)
            {
                path.push(this.convertToRealVector2(block.pos.clone()));
            }
        }
        return path;
    }
}