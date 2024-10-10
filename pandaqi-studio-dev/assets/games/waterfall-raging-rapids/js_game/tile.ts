import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig from "js/pq_games/layout/text/textConfig";
import StrokeAlign from "js/pq_games/layout/values/strokeAlign";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import Point from "js/pq_games/tools/geometry/point";
import { ACTIONS, DECORATION, GATES, GEMSTONES, MISC, TileType, WaterFlow } from "../js_shared/dict";
import CONFIG from "../js_shared/config";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import shuffle from "js/pq_games/tools/random/shuffle";
import Bounds from "js/pq_games/tools/numbers/bounds";
import Line from "js/pq_games/tools/geometry/line";
import Circle from "js/pq_games/tools/geometry/circle";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import fromArray from "js/pq_games/tools/random/fromArray";

export default class Tile
{
    type: TileType
    keyAction: string
    keyGate: string
    score: number
    water: WaterFlow
    gemstones: string[]

    constructor(type:TileType, score = 0, keyAction = "", keyGate = "")
    {
        this.type = type;
        this.score = score;
        this.keyAction = keyAction;
        this.keyGate = keyGate;
    }

    setScore(s:number) { this.score = s; }
    setAction(a:string) { this.keyAction = a; }
    setGate(g:string) { this.keyGate = g; }
    setWaterFlow(f:WaterFlow) { this.water = f; }
    setGemstones(g:string[]) { this.gemstones = g; }

    async drawForRules(vis:MaterialVisualizer)
    {
        return this.draw(vis);
    }

    async draw(vis:MaterialVisualizer)
    {
        const group = vis.renderer.prepareDraw();

        if(this.type == TileType.PAWN) {
            this.drawPawn(vis, group);
        } else {
            this.drawBackground(vis, group);
            this.drawScore(vis, group);
            this.drawActions(vis, group);
            this.drawGemstones(vis, group);
            this.drawWater(vis, group);
        }

        return vis.renderer.finishDraw({ group: group, size: vis.size })
    }

    // extremely simple function that just plasters an image at full size on tile
    // (the image contains two "pawns" side by side)
    drawPawn(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const res = vis.getResource("misc");
        const op = new LayoutOperation({
            size: vis.size,
            frame: MISC[this.keyAction].frame,
            effects: vis.inkFriendlyEffect
        });
        group.add(res, op);
    }

    // fixed template for card (which does most of the work)
    // overlaid by random dirt texture for much nicer look
    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(vis.inkFriendly) { return; }

        const templateKey = "template_" + this.type;
        const templateData = DECORATION[templateKey];
        if(!templateData) { return; }

        const resTemplate = vis.getResource("decoration");
        const opTemplate = new LayoutOperation({
            size: vis.size,
            frame: templateData.frame
        });
        group.add(resTemplate, opTemplate);

        const bgDirtTextureKey = "bg_" + CONFIG.generation.bgDirtTextureBounds.randomInteger();
        const opDirt = new LayoutOperation({
            size: vis.size,
            frame: DECORATION[bgDirtTextureKey].frame,
            composite: "overlay",
            alpha: 0.2
        })
        group.add(resTemplate, opDirt);
    }

    // just a big chunky score number (which should overlay the yellow star at top of template)
    drawScore(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("tiles.score.fontSize")
        }).alignCenter();
        const resText = new ResourceText({ text: this.score.toString(), textConfig });
        const opText = new LayoutOperation({
            pos: vis.get("tiles.score.pos"),
            size: new Point(3*textConfig.size),
            fill: vis.inkFriendly ? "#000000" : vis.get("tiles.score.textColor"),
            stroke: vis.inkFriendly ? "#FFFFFF" : vis.get("tiles.score.strokeColor"),
            strokeWidth: vis.get("tiles.score.strokeWidth"),
            strokeAlign: StrokeAlign.OUTSIDE,
            pivot: Point.CENTER
        })
        group.add(resText, opText);
    }

    drawActions(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const hasActionAndGate = this.keyAction && this.keyGate;

        // the main action text (moved around if we need to make place for gate text)
        // (read from dictionary if it's just a standard action; if not found, assume custom string and use that)
        if(this.keyAction)
        {
            let actionData = ACTIONS[this.keyAction];
           
            // in this case, the tile picker concatenates a final string and puts it into .keyAction instead
            const isConditional = !actionData;
            if(isConditional)
            {
                actionData = { desc: this.keyAction, default: false };
            }

            const isDefaultAction = actionData.default;

            const drawIcon = isDefaultAction && CONFIG.useIconsForDefaultActions;
            const drawText = !drawIcon;
            
            const pos = hasActionAndGate ? vis.get("tiles.action.posWithGate") : vis.get("tiles.action.pos");
            const size = hasActionAndGate ? vis.get("tiles.action.textBoxDimsWithGate") : vis.get("tiles.action.textBoxDims");

            if(drawIcon)
            {
                // @TODO: probably some subtle drop-shadow
                const resIcon = vis.getResource("misc");
                const iconKey = "default_action_" + this.keyAction;
                const opIcon = new LayoutOperation({
                    pos: pos,
                    size: new Point(0.9*Math.min(size.x, size.y)),
                    frame: MISC[iconKey].frame,
                    pivot: Point.CENTER,
                    effects: vis.inkFriendlyEffect
                });
                group.add(resIcon, opIcon);
            }

            if(drawText)
            {
                const fontSize = hasActionAndGate ? vis.get("tiles.action.fontSizeWithGate") : vis.get("tiles.action.fontSize");
                const textConfig = new TextConfig({
                    font: vis.get("fonts.body"),
                    size: fontSize
                }).alignCenter();
    
                const resText = new ResourceText({ text: actionData.desc, textConfig });
                const opText = new LayoutOperation({
                    pos: pos,
                    size: size,
                    fill: vis.inkFriendly ? "#000000" : vis.get("tiles.action.textColor"),
                    pivot: Point.CENTER
                })
                group.add(resText, opText);
            }
        }

        // the smaller, optional gate text below
        if(this.keyGate)
        {
            const gateData = GATES[this.keyGate];

            const textConfig = new TextConfig({
                font: vis.get("fonts.body"),
                size: vis.get("tiles.gate.fontSize")
            }).alignCenter();

            const resText = new ResourceText({ text: gateData.desc, textConfig });
            const opText = new LayoutOperation({
                pos: vis.get("tiles.gate.pos"),
                size: vis.get("tiles.gate.textBoxDims"),
                fill: vis.inkFriendly ? "#000000" : vis.get("tiles.gate.textColor"),
                pivot: Point.CENTER
            })
            group.add(resText, opText);
        }
    }

    getInnerRect(vis:MaterialVisualizer) : Rectangle
    {
        const size = new Point(CONFIG.generation.innerRectangleSize * vis.sizeUnit);
        const pos = vis.size.clone().sub(size).scale(0.5);
        return new Rectangle().fromTopLeft(pos, size);
    }

    getGemstoneRect(vis:MaterialVisualizer) : Rectangle
    {
        const size = new Point(CONFIG.generation.gemstoneRectangleSize * vis.sizeUnit);
        const pos = vis.size.clone().sub(size).scale(0.5);
        return new Rectangle().fromTopLeft(pos, size);
    }

    getRandomPosOnLine(line:Line, forbiddenPos:Point[], size:Point)
    {
        const lineShrunk = line.clone(true);
        const minDist = 2 * size.length();
        lineShrunk.scale(new Point(0.8)); // to prevent overlapping with any diagonals

        let tooCloseToOthers = true;
        let pos:Point;
        let numTries = 0;
        const maxTries = 50;
        while(tooCloseToOthers && numTries < maxTries)
        {
            numTries++;
            pos = lineShrunk.getRandomPositionInside();

            tooCloseToOthers = false;
            for(const point of forbiddenPos)
            {
                if(point.distTo(pos) > minDist) { continue; }
                tooCloseToOthers = true;
                break;
            }
        }
        return pos;
    }

    drawGemstones(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const innerRect = this.getGemstoneRect(vis);
        const pos = innerRect.getTopLeft();
        const size = innerRect.getSize();

        // 4 lines for each side (left, right, top, bottom), precisely OUTSIDE of the inner rect
        // so we only need to place gemstones inside them (much more efficient, not a lot of "bad positions" and retries)
        const validLines = 
        [
            new Line(innerRect.getTopLeft(), innerRect.getTopRight()),
            new Line(innerRect.getTopRight(), innerRect.getBottomRight()),
            new Line(innerRect.getBottomRight(), innerRect.getBottomLeft()),
            new Line(innerRect.getBottomLeft(), innerRect.getTopLeft())
        ];
        shuffle(validLines);

        // randomize the number of gemstones, as long as it's above how many we surely need
        // some will appear multiple times and that's fine, as long as they all appear once
        const gemDims = vis.get("tiles.gemstones.iconDims").clone();
        const multiplier = CONFIG.generation.numGemstonesMultiplierBounds; 
        let numGemstones =  Math.round(multiplier.random() * this.gemstones.length)
        numGemstones = Math.max(Math.min(numGemstones, CONFIG.generation.maxGemstonesPerTile), CONFIG.generation.minGemstonesPerTile);
        shuffle(this.gemstones);

        const resMisc = vis.getResource("misc");
        const resGemstones = vis.getResource("gemstones");

        const positionsAlreadyUsed = [];
        positionsAlreadyUsed.push(vis.get("tiles.score.pos").clone()); // to prevent overlapping score at top

        const gemstoneList = this.gemstones.slice();
        while(gemstoneList.length < numGemstones)
        {
            gemstoneList.push(fromArray(this.gemstones));
        }
        shuffle(gemstoneList);

        for(let i = 0; i < numGemstones; i++)
        {
            const gemType = gemstoneList.pop();
            const lineForPlacement = validLines[i % validLines.length];
            const randPos = this.getRandomPosOnLine(lineForPlacement, positionsAlreadyUsed, gemDims);
            positionsAlreadyUsed.push(randPos);

            // the shadow behind it to make it blend in better
            const opShadow = new LayoutOperation({
                pos: randPos,
                size: gemDims.clone().scale(1.425),
                frame: MISC.gemstone_shadow_circle.frame,
                alpha: 0.875,
                pivot: Point.CENTER,
            });
            group.add(resMisc, opShadow);

            // the actual gemstone
            // @TODO: some subtle glow around them, make them shiny and stand out
            const opGem = new LayoutOperation({
                pos: randPos,
                size: gemDims,
                frame: GEMSTONES[gemType].frame,
                pivot: Point.CENTER,
                rot: Math.random() * 2 * Math.PI
            })
            group.add(resGemstones, opGem);
        }
    }

    drawWater(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const resMisc = vis.getResource("misc");
        const resDecoration = vis.getResource("decoration");
        const frameStraight = MISC.water_straight.frame;
        const frameDiagonal = MISC.water_diagonal.frame;

        const innerRect = this.getInnerRect(vis);
        const size = innerRect.getSize();
        const topLeft = innerRect.getTopLeft();
        const topRight = innerRect.getTopRight();
        const bottomLeft = innerRect.getBottomLeft();
        const bottomRight = innerRect.getBottomRight();

        const lines : Line[] = [];
        const subGroup = new ResourceGroup();

        const sizeDecoration = vis.get("tiles.decoration.iconDims");
        const sizeBoulder = vis.get("tiles.decoration.iconDimsBoulder");
        const boulderOffset = vis.get("tiles.decoration.boulderOffset");

        const placeDecorations = !vis.inkFriendly;

        // diagonal + straight down from top left
        if(this.water.topLeft)
        {
            const opDiag = new LayoutOperation({
                pos: topLeft,
                size: size,
                frame: frameDiagonal,
                pivot: new Point(1,1),
                effects: vis.inkFriendlyEffect
            });
            subGroup.add(resMisc, opDiag);
            lines.push(new Line(new Point(), topLeft));

            const opVert = new LayoutOperation({
                pos: topLeft,
                size: size,
                rot: 0.5*Math.PI,
                frame: frameStraight,
                pivot: new Point(0, 0.5),
                effects: vis.inkFriendlyEffect
            });
            subGroup.add(resMisc, opVert);
            lines.push(new Line(topLeft, bottomLeft));
        }

        // diagonal + straight down from top right
        if(this.water.topRight)
        {
            const opDiag = new LayoutOperation({
                pos: topRight,
                size: size,
                frame: frameDiagonal,
                flipX: true,
                pivot: new Point(0,1),
                effects: vis.inkFriendlyEffect
            });
            subGroup.add(resMisc, opDiag);
            lines.push(new Line(new Point(vis.size.x, 0), topRight));

            const opVert = new LayoutOperation({
                pos: topRight,
                size: size,
                rot: 0.5*Math.PI,
                frame: frameStraight,
                pivot: new Point(0, 0.5),
                effects: vis.inkFriendlyEffect
            });
            subGroup.add(resMisc, opVert);
            lines.push(new Line(topRight, bottomRight));
        }

        // horizontal straight cross over (if needed)
        // the DIRECTION is important, that's why we keep track and create two of them if needed
        const crossSides = { 
            leftToRight: (this.water.topLeft && this.water.bottomRight),
            rightToLeft: (this.water.topRight && this.water.bottomLeft) 
        }
        const crossesBothSides = crossSides.leftToRight && crossSides.rightToLeft;

        for(const [dir,used] of Object.entries(crossSides))
        {
            if(!used) { continue; }

            const alpha = (crossesBothSides && dir == "rightToLeft") ? 0.5 : 1.0;

            const opHoriz = new LayoutOperation({
                pos: bottomLeft,
                size: size,
                frame: frameStraight,
                flipX: (dir == "rightToLeft"),
                pivot: new Point(0, 0.5),
                alpha: alpha,
                effects: vis.inkFriendlyEffect
            });
            subGroup.add(resMisc, opHoriz);
            lines.push(new Line(bottomLeft, bottomRight));
        }

        // diagonals out of the tile
        if(this.water.bottomLeft)
        {
            const opDiag = new LayoutOperation({
                pos: bottomLeft.clone(),
                size: size,
                frame: frameDiagonal,
                flipX: true,
                pivot: new Point(1,0),
                effects: vis.inkFriendlyEffect
            });
            subGroup.add(resMisc, opDiag);
            lines.push(new Line(bottomLeft, new Point(0, vis.size.y)));
        }

        if(this.water.bottomRight)
        {
            const opDiag = new LayoutOperation({
                pos: bottomRight,
                size: size,
                frame: frameDiagonal,
                pivot: new Point(0,0),
                effects: vis.inkFriendlyEffect
            });
            subGroup.add(resMisc, opDiag);
            lines.push(new Line(bottomRight, vis.size.clone()));
        }

        // place decoration BEHIND its lines
        const boulderLineDownscale = 0.85; // to prevent the pretty large boulders from overlapping other incoming water streams
        if(placeDecorations)
        {
            for(const line of lines)
            {
                const placeBoulderBehind = Math.abs(line.angle()) <= 0.03 && Math.random() <= CONFIG.generation.boulderDecorationProbability;
                if(placeBoulderBehind)
                {
                    const op = new LayoutOperation({
                        pos: line.getRandomPositionInside(boulderLineDownscale).add(new Point(0, -boulderOffset)),
                        size: sizeBoulder,
                        frame: DECORATION.boulders_horizontal.frame,
                        pivot: Point.CENTER
                    })
                    group.add(resDecoration, op);
                }
    
                const placeDecoration = Math.random() <= CONFIG.generation.randomDecorationProbability;
                if(!placeDecoration) { continue; }
    
                const pos = line.getRandomPositionInside();
                let rotation = line.angle();
                if(Math.random() <= 0.5) { rotation += Math.PI; }
    
                const randKey = "decoration_" + CONFIG.generation.decorationFrameBounds.randomInteger();
                const op = new LayoutOperation({
                    pos: pos,
                    size: sizeDecoration,
                    frame: DECORATION[randKey].frame,
                    pivot: new Point(0.5, 1),
                     rotation
                })
                group.add(resDecoration, op);
            }
        }

        // actually add the water to overall tile
        // @TODO: add offset shadow for entire subGroup?
        group.add(subGroup);

        // add circles on line ends to make it look smoother
        const circ = new ResourceShape( new Circle({ center: new Point(), radius: vis.get("tiles.water.circleRadius") }) );
        for(const line of lines)
        {
            const positions = [line.start, line.end];
            for(const pos of positions)
            {
                const op = new LayoutOperation({
                    pos: pos,
                    fill: vis.get("tiles.water.fillColor"),
                    effects: vis.inkFriendlyEffect
                });
                group.add(circ, op);
            }
        }

        // place decoration BEFORE its lines (only horizontal low boulders, or vertical boulders any side)
        if(placeDecorations)
        {
            for(const line of lines)
            {
                const isHoriz = Math.abs(line.angle()) <= 0.03;
                const isVert = Math.abs(line.angle() - 0.5*Math.PI) <= 0.03;
                if(!isHoriz && !isVert) { continue; }
                
                const placeBoulder = Math.random() <= CONFIG.generation.boulderDecorationProbability;
                if(!placeBoulder) { continue; }
    
                if(isHoriz)
                {
                    const op = new LayoutOperation({
                        pos: line.getRandomPositionInside(boulderLineDownscale).add(new Point(0, boulderOffset)),
                        size: sizeBoulder,
                        frame: DECORATION.boulders_horizontal.frame,
                        pivot: Point.CENTER
                    })
                    group.add(resDecoration, op);
                }
    
                if(isVert)
                {
                    const leftPos = line.getRandomPositionInside(boulderLineDownscale).add(new Point(-boulderOffset, 0));
                    const rightPos = line.getRandomPositionInside(boulderLineDownscale).add(new Point(boulderOffset, 0));
    
                    let positions = Math.random() <= 0.5 ? [leftPos] : [rightPos];
                    if(Math.random() <= CONFIG.generation.boulderDoubleProbability) { positions = [leftPos, rightPos]; }
    
                    for(const position of positions)
                    {
                        const op = new LayoutOperation({
                            pos: position,
                            size: sizeBoulder,
                            frame: DECORATION.boulders_vertical.frame,
                            pivot: Point.CENTER
                        })
                        group.add(resDecoration, op);
                    }
    
                    
                }
            }
        }
    }
}