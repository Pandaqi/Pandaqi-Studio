import createContext from "lib/pq-games/layout/canvas/createContext";
import fillCanvas from "lib/pq-games/layout/canvas/fillCanvas";
import LayoutOperation from "lib/pq-games/layout/layoutOperation";
import ResourceGroup from "lib/pq-games/layout/resources/resourceGroup";
import ResourceText from "lib/pq-games/layout/resources/resourceText";
import TextConfig, { TextStyle } from "lib/pq-games/layout/text/textConfig";
import StrokeAlign from "lib/pq-games/layout/values/strokeAlign";
import MaterialVisualizer from "lib/pq-games/tools/generation/materialVisualizer";
import getRectangleCornersWithOffset from "lib/pq-games/tools/geometry/paths/getRectangleCornersWithOffset";
import Point from "lib/pq-games/tools/geometry/point";
import fromArray from "lib/pq-games/tools/random/fromArray";
import shuffle from "lib/pq-games/tools/random/shuffle";
import { CardMovement, CardType, FishType, MAP_SPECIAL, MISC, MOVEMENT_CARDS, MOVEMENT_SPECIAL, TILE_ACTIONS, TileAction } from "../js_shared/dict";
import DropShadowEffect from "lib/pq-games/layout/effects/dropShadowEffect";

export default class Card
{
    type: CardType;
    typeMovement: CardMovement;
    specialAction: string = "";
    pawnIndex: number;

    fishes: FishType[];
    tileAction: TileAction;
    tileActionNum: number;

    constructor(type:CardType)
    {
        this.type = type;
    }

    hasSpecialAction()
    {
        return this.specialAction != "" && this.specialAction != "regular";
    }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        fillCanvas(ctx, "#FFFFFF");
        
        const group = new ResourceGroup();
        if(this.type == CardType.PAWN) {
            this.drawPawn(vis, group);
        } else if(this.type == CardType.MOVEMENT) {
            this.drawMovementCard(vis, group);
        } else if(this.type == CardType.MAP) {
            this.drawMapTile(vis, group);
        }

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawPawn(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const resMisc = vis.getResource("misc");
        const op = new LayoutOperation({ 
            size: vis.size, 
            frame: MISC["pawn_" + this.pawnIndex].frame
        })
        group.add(resMisc, op);
    }

    drawMovementCard(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // general background/template
        const resMisc = vis.getResource("misc");
        if(vis.inkFriendly) {  
            const opSonar = new LayoutOperation({
                pos: vis.get("cards.sonar.templatePos"),
                size: vis.get("cards.sonar.templateDims"),
                pivot: Point.CENTER,
                frame: MISC.sonar.frame,
            });
            group.add(resMisc, opSonar);
        } else {
            const resTemp = vis.getResource("card_templates");
            const opTemp = new LayoutOperation({
                size: vis.size,
                frame: this.hasSpecialAction() ? 1 : 0
            });
            group.add(resTemp, opTemp);
        }

        // main icon on sonar
        const resMove = vis.getResource("movements");
        const movementData = MOVEMENT_CARDS[this.typeMovement];
        const posMain = vis.get("cards.sonar.pos");
        const sizeMain = vis.get("cards.sonar.size");
        let opMain : LayoutOperation
        if(movementData.angled) {
            opMain = new LayoutOperation({
                pos: posMain,
                size: sizeMain.clone().scale(0.5),
                pivot: new Point(0, 0.5),
                rot: movementData.rot,
                frame: movementData.frame + 1, // the saved frame is the smaller icon, not sonar one
                effects: vis.inkFriendlyEffect
            });
        } else {
            opMain = new LayoutOperation({
                pos: posMain,
                size: sizeMain,
                pivot: Point.CENTER,
                frame: movementData.frame + 1,
                effects: vis.inkFriendlyEffect
            })
        }
        group.add(resMove, opMain);

        // smaller icons next to text
        const headingPos = vis.get("cards.heading.pos");
        const headingColor = this.hasSpecialAction() ? "#394700" : "#201600";
        const iconOffsetSmall = vis.get("cards.icons.offset");
        const positions = [
            new Point(iconOffsetSmall.x, headingPos.y),
            new Point(vis.size.x - iconOffsetSmall.x, headingPos.y)
        ];
        for(const pos of positions)
        {
            const opIcon = new LayoutOperation({
                pos: pos,
                size: vis.get("cards.icons.size"),
                pivot: Point.CENTER,
                frame: movementData.frame,
                effects: vis.inkFriendlyEffect
            });
            group.add(resMove, opIcon);
        }

        // the heading text
        const textConfigHeading = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.heading.fontSize")
        }).alignCenter();
        const resTextHeading = new ResourceText({ text: movementData.label, textConfig: textConfigHeading });
        const opTextHeading = new LayoutOperation({
            pos: headingPos,
            size: new Point(vis.size.x, 2.0*textConfigHeading.size),
            pivot: Point.CENTER,
            fill: vis.inkFriendly ? "#222222" : headingColor
        })
        group.add(resTextHeading, opTextHeading);

        // if special, show small name of action above it
        if(this.hasSpecialAction())
        {
            const offset = vis.get("cards.headingAction.offset"); // from the main heading
            const textConfigAction = new TextConfig({
                font: vis.get("fonts.heading"),
                size: vis.get("cards.headingAction.fontSize")
            }).alignCenter();
            const resTextAction = new ResourceText({ text: MOVEMENT_SPECIAL[this.specialAction].label, textConfig: textConfigAction });
            const opTextAction = new LayoutOperation({
                pos: headingPos.clone().sub(offset),
                size: new Point(vis.size.x, 2.0*textConfigHeading.size),
                pivot: Point.CENTER,
                fill: vis.inkFriendly ? "#222222" : headingColor
            })
            group.add(resTextAction, opTextAction);
        }

        // add a random extra icon for MATCH movements, which allow you to move to closest tile MATCHING that icon => this is added inside that sonar thingy
        if(this.typeMovement == CardMovement.MATCH)
        {
            const randFish = fromArray( Object.values(FishType) );
            const opFish = new LayoutOperation({
                pos: vis.get("cards.matchAction.pos"),
                size: vis.get("cards.matchAction.size"),
                pivot: Point.CENTER,
                frame: MISC[randFish].frame,
                effects: vis.inkFriendlyEffect
            });
            group.add(resMisc, opFish);
        }

        // the action explaining text
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("cards.text.fontSize"),
            style: TextStyle.ITALIC
        }).alignCenter();
        const specialData = MOVEMENT_SPECIAL[this.specialAction] ?? {};
        const text = this.hasSpecialAction() ? specialData.desc : movementData.desc;
        const resText = new ResourceText({ text: text, textConfig: textConfig });
        const opText = new LayoutOperation({
            pos: vis.get("cards.text.pos"),
            size: vis.get("cards.text.size"),
            pivot: Point.CENTER,
            fill: "#000000"
        })
        group.add(resText, opText);
    }

    drawMapTile(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // add background templae
        const resMisc = vis.getResource("misc");
        if(!vis.inkFriendly) 
        {
            const resTemp = vis.getResource("tile_templates");
            const opTemp = new LayoutOperation({
                size: vis.size,
                frame: this.hasSpecialAction() ? 1 : 0
            });
            group.add(resTemp, opTemp);
        }

        // draw randomly selected fishes, circling the center (without overlap)
        const anglesAvailable = [];
        const numAngles = vis.get("tiles.fishes.angleSubdivisions");
        for(let i = 0; i < numAngles; i++)
        {
            anglesAvailable.push(i);
        }
        shuffle(anglesAvailable);

        const fishDims = this.hasSpecialAction() ? vis.get("tiles.fishes.sizeSpecial") : vis.get("tiles.fishes.size");
        const fishRadiusBounds = this.hasSpecialAction() ? vis.get("tiles.fishes.radiusBoundsSpecial") : vis.get("tiles.fishes.radiusBounds");
        const glowEffect = new DropShadowEffect({ color: "#FFFFFF", blurRadius: 0.1*fishDims.x });
        for(const fish of this.fishes)
        {
            const angleRaw = anglesAvailable.pop();
            const angle = (angleRaw + Math.random()*0.5) * (2.0 * Math.PI / numAngles);
            const randRadius = fishRadiusBounds.random() * vis.size.x;
            const pos = vis.center.clone().add( new Point(Math.cos(angle), Math.sin(angle)).scaleFactor(randRadius) );

            // the fish outline
            const opOutline = new LayoutOperation({
                pos: pos,
                size: fishDims.clone().scale(1.035),
                pivot: Point.CENTER,
                rot: angle + 0.5 * Math.PI,
                frame: MISC[fish].frame + 4,
                composite: "overlay",
            });
            group.add(resMisc, opOutline);

            // the actual fish
            const opFish = new LayoutOperation({
                pos: pos,
                size: fishDims,
                pivot: Point.CENTER,
                rot: angle + 0.5 * Math.PI,
                frame: MISC[fish].frame,
                effects: [vis.inkFriendlyEffect, glowEffect].flat(),
            })
            group.add(resMisc, opFish);
        }
        
        // draw the tile actions in corners
        const textConfigAction = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("tiles.actions.fontSize")
        }).alignCenter();
        const resTextAction = new ResourceText({ text: (this.tileActionNum + 1).toString(), textConfig: textConfigAction });

        const corners = getRectangleCornersWithOffset(vis.size, vis.get("tiles.actions.offset"));
        const cornerIcons = getRectangleCornersWithOffset(vis.size, vis.get("tiles.actions.offsetIcons"));
        for(let i = 0; i < corners.length; i++)
        {
            // background
            const opCorner = new LayoutOperation({
                pos: corners[i],
                size: vis.get("tiles.actions.boxDims"),
                rot: i * 0.5 * Math.PI,
                pivot: Point.CENTER,
                frame: MISC.tile_corner.frame,
                composite: "overlay"
            });
            group.add(resMisc, opCorner);

            // actual icon
            const opCornerIcon = new LayoutOperation({
                pos: cornerIcons[i],
                size: vis.get("tiles.actions.iconDims"),
                rot: (i - 0.5) * 0.5 * Math.PI,
                frame: MISC["action_" + this.tileAction].frame,
                pivot: Point.CENTER,
                effects: vis.inkFriendlyEffect,
            })
            group.add(resMisc, opCornerIcon);

            // number
            // @NOTE: the number is offset a bit to fall exactly on the first card in every icon; in the center it's a bit confusing/ugly
            const numberOffset = new Point(0.2*opCornerIcon.size.x,0).rotate(opCornerIcon.rot);
            const opTextAction = new LayoutOperation({
                pos: opCornerIcon.pos.clone().sub(numberOffset),
                size: new Point(2.0 * textConfigAction.size),
                pivot: Point.CENTER,
                rot: opCornerIcon.rot,
                fill: "#FFFFFF",
                stroke: "#000000",
                strokeWidth: vis.get("tiles.actions.textStrokeWidth"),
                strokeAlign: StrokeAlign.OUTSIDE
            })
            group.add(resTextAction, opTextAction);
        }

        // draw the headings (one normal, one upside down)
        const tileActionData = TILE_ACTIONS[this.tileAction] ?? {};
        let middleText = tileActionData.label + " " + (this.tileActionNum + 1);
        if(this.hasSpecialAction())
        {
            middleText = MAP_SPECIAL[this.specialAction].label;
        }

        const textConfigHeading = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("tiles.heading.fontSize")
        }).alignCenter();
        const resTextHeading = new ResourceText({ text: middleText, textConfig: textConfigHeading });

        const offset = this.hasSpecialAction() ? vis.get("tiles.heading.offsetSpecial") : vis.get("tiles.heading.offsetRegular");
        const headingColor = this.hasSpecialAction() ? "#16416a" : "#57a1a7";
        const positions = [
            vis.center.clone().sub(offset),
            vis.center.clone().add(offset)
        ];

        for(let i = 0; i < 2; i++)
        {
            const opTextHeading = new LayoutOperation({
                pos: positions[i],
                size: vis.size,
                rot: (i == 0) ? 0 : Math.PI,
                pivot: Point.CENTER,
                fill: vis.inkFriendly ? "#888888" : headingColor
            });
            group.add(resTextHeading, opTextHeading);
        }

        // draw the special action text between the headings (if there is one)
        if(this.hasSpecialAction())
        {
            const textConfig = new TextConfig({
                font: vis.get("fonts.body"),
                size: vis.get("tiles.text.fontSize"),
                style: TextStyle.ITALIC
            }).alignCenter();
            
            const specialData = MAP_SPECIAL[this.specialAction] ?? {};
            let str = specialData.desc;
            // @NOTE: this just gets a random number between -3 and 3, while disallowing 0
            const randNum = (Math.random() <= 0.5 ? -1 : 1) * (Math.floor(Math.random() * 3) + 1);
            str = str.replace("%num%", randNum.toString());

            const resText = new ResourceText({ text: str, textConfig: textConfig });
            const opText = new LayoutOperation({
                pos: vis.get("tiles.text.pos"),
                size: vis.get("tiles.text.size"),
                pivot: Point.CENTER,
                fill: "#000000"
            })
            group.add(resText, opText);
        }

        // @TODO: perhaps add slight shadow to icons (on card and tile), and a slight glow to fishes?
    }
}