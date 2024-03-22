import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { COLORS, MISC, TYPES } from "../js_shared/dict";
import fromArray from "js/pq_games/tools/random/fromArray";
import Point from "js/pq_games/tools/geometry/point";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import getRectangleCornersWithOffset from "js/pq_games/tools/geometry/paths/getRectangleCornersWithOffset";
import TextConfig from "js/pq_games/layout/text/textConfig";
import StrokeAlign from "js/pq_games/layout/values/strokeAlign";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TintEffect from "js/pq_games/layout/effects/tintEffect";
import fillResourceGroup from "js/pq_games/layout/canvas/fillResourceGroup";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import Bounds from "js/pq_games/tools/numbers/bounds";
import shuffle from "js/pq_games/tools/random/shuffle";

export default class Tile
{
    type:string
    num:number
    price:number
    action:string

    constructor(type:string, num:number = 0, price:number = 0, action:string = undefined)
    {
        this.type = type;
        this.num = num;
        this.price = price;
        this.action = action;
    }

    getTypeData() { return TYPES[this.type]; }
    getColorData() { return COLORS[this.getTypeData().color ?? "blue"]; }
    hasAction()
    {
        return this.action;
    }

    async drawForRules(vis:MaterialVisualizer)
    {
        return this.draw(vis);
    }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        fillCanvas(ctx, "#FFFFFF");
        const group = new ResourceGroup();

        this.drawBackground(vis, group);
        this.drawType(vis, group);
        this.drawNumbers(vis, group);
        this.drawAction(vis, group);

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // draw main bg color rect
        const colData = this.getColorData();
        fillResourceGroup(vis.size, group, colData.light);
        
        // draw audience
        const resMisc = vis.getResource("misc");
        const opAudience = new LayoutOperation({
            translate: vis.get("tiles.audience.pos"),
            dims: vis.get("tiles.audience.dims"),
            frame: MISC.audience.frame,
            alpha: vis.get("tiles.audience.alpha")
        });
        group.add(resMisc, opAudience);

        // draw action rect at bottom
        const posY = vis.get("tiles.action.rectPosY");
        const rect = new ResourceShape( new Rectangle().fromTopLeft(new Point(0, posY), new Point(vis.size.x, vis.size.y - posY)) );
        const rectOp = new LayoutOperation({
            fill: vis.get("tiles.action.bgColor"),
            stroke: vis.get("tiles.action.rectStrokeColor"),
            strokeWidth: vis.get("tiles.action.rectStrokeWidth")
        });
        group.add(rect, rectOp);
    }

    drawType(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const resMisc = vis.getResource("misc");
        const resTiles = vis.getResource("types");
        const typeData = this.getTypeData();

        // draw the base podium
        const opPodium = new LayoutOperation({
            translate: vis.get("tiles.podium.pos"),
            dims: vis.get("tiles.podium.dims"),
            frame: MISC.podium.frame,
            pivot: Point.CENTER
        })
        group.add(resMisc, opPodium)

        // draw type illustration on top
        const spriteDims = vis.get("tiles.type.dims");
        const spritePos = vis.get("tiles.type.pos");

        const opSprite = new LayoutOperation({
            translate: spritePos,
            dims: spriteDims,
            frame: typeData.frame,
            pivot: Point.CENTER
        });
        group.add(resTiles, opSprite);

        // draw product name on top
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("tiles.label.fontSize")
        }).alignCenter();
        const resNameText = new ResourceText({ text: this.getTypeData().label, textConfig: textConfig });
        const opNameText = new LayoutOperation({
            translate: vis.get("tiles.label.pos"),
            dims: vis.get("tiles.label.dims"),
            fill: vis.get("tiles.label.textColor"),
            pivot: Point.CENTER
        });
        group.add(resNameText, opNameText)

        // draws the price tag
        const tagData = fromArray(typeData.tags);
        const relPos = tagData.pos.clone().sub(new Point(512, 512)).div(new Point(1024, 1024))
        const finalPos = spritePos.clone().add( relPos.scale(spriteDims) );
        const shouldFlip = tagData.flip;
        let rotation = vis.get("tiles.priceTag.rotationBounds").random();
        if(shouldFlip) { rotation += Math.PI; }

        const op = new LayoutOperation({
            translate: finalPos,
            dims: vis.get("tiles.priceTag.dims"),
            frame: MISC.price_tag.frame,
            pivot: new Point(0, 0.5),
            flipY: shouldFlip,
            rotation: rotation
        })
        group.add(resMisc, op);

        // draws the actual price text (about midway the price tag sprite, at correct rotation)
        const textConfigPrice = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("tiles.priceTag.fontSize")
        }).alignCenter();
        const priceText = "$" + this.price.toString();

        const priceOffset = new Point(1,0).scale( vis.get("tiles.priceTag.offset") );
        priceOffset.rotate(rotation);
        const priceTagPos = finalPos.clone().add(priceOffset);

        let rotComp = vis.get("tiles.priceTag.textRotationCompensation");
        if(shouldFlip) { rotComp *= -1; }

        const resPrice = new ResourceText({ text: priceText, textConfig: textConfigPrice  });
        const opPrice = new LayoutOperation({
            translate: priceTagPos,
            dims: vis.get("tiles.priceTag.dims"),
            fill: vis.get("tiles.priceTag.textColor"),
            pivot: Point.CENTER,
            flipX: shouldFlip,
            flipY: shouldFlip,
            rotation: rotation + rotComp
        });
        group.add(resPrice, opPrice);

        
        // draw random spotlights
        // (they go over everything else in this layer to really make an impact and light it up realistically)
        const allSpotlightPositions = [];
        const yBounds = new Bounds(0, spritePos.y);
        const xBounds = new Bounds(0.33*vis.size.x, 0);
        allSpotlightPositions.push(new Point(0, yBounds.random()));
        allSpotlightPositions.push(new Point(xBounds.random(), 0));
        allSpotlightPositions.push(new Point(xBounds.max + xBounds.random(), 0));
        allSpotlightPositions.push(new Point(2*xBounds.max + xBounds.random(), 0));
        allSpotlightPositions.push(new Point(vis.size.x, yBounds.random()));
        
        shuffle(allSpotlightPositions);
        const numSpotlights = vis.get("tiles.spotlight.numBounds").randomInteger();
        const spotlightPositions = allSpotlightPositions.slice(0, numSpotlights);

        for(const pos of spotlightPositions)
        {
            const angle = spritePos.clone().sub(pos).angle();
            const op = new LayoutOperation({
                translate: pos,
                dims: vis.get("tiles.spotlight.dims"),
                frame: MISC.spotlight.frame,
                pivot: new Point(0, 0.5),
                rotation: angle,
                alpha: vis.get("tiles.spotlight.alpha"),
                composite: vis.get("tiles.spotlight.composite")
            });
            group.add(resMisc, op);
        }
    }

    drawNumbers(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const starDims = vis.get("tiles.numbers.starDims");
        const offset = starDims.clone().scale(0.585);
        const corners = getRectangleCornersWithOffset(vis.size, offset);
        
        const resMisc = vis.getResource("misc");
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("tiles.numbers.fontSize")
        }).alignCenter();
        const resText = new ResourceText({ text: this.num.toString(), textConfig: textConfig });

        const colData = this.getColorData();
        const effects = [new TintEffect(colData.main)];

        for(let i = 0; i < corners.length; i++)
        {
            if(i >= 2 && this.hasAction()) { break; }

            const pos = corners[i];
            const op = new LayoutOperation({
                translate: pos,
                dims: starDims,
                frame: MISC.number_star.frame,
                pivot: Point.CENTER,
                effects: effects
            })

            group.add(resMisc, op);

            const opText = new LayoutOperation({
                translate: pos,
                dims: starDims,
                pivot: Point.CENTER,
                fill: vis.get("tiles.numbers.textColor"),
                stroke: vis.get("tiles.numbers.strokeColor"),
                strokeWidth: vis.get("tiles.numbers.strokeWidth"),
                strokeAlign: StrokeAlign.OUTSIDE
            });
            group.add(resText, opText);

        }
    }

    drawAction(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.hasAction()) { return; }

        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("tiles.action.fontSize")
        }).alignCenter();
        const resText = new ResourceText({ text: this.action, textConfig: textConfig });
        const opText = new LayoutOperation({
            translate: vis.get("tiles.action.pos"),
            dims: vis.get("tiles.action.dims"),
            fill: vis.get("tiles.action.textColor"),
            pivot: Point.CENTER
        });
        group.add(resText, opText);
    }
}