import { MaterialVisualizer, createContext, fillCanvas, ResourceGroup, fillResourceGroup, LayoutOperation, ResourceShape, Rectangle, Vector2, TextConfig, ResourceText, fromArray, Bounds, shuffle, getRectangleCornersWithOffset, TintEffect, StrokeAlign } from "lib/pq-games"
import { TYPES, COLORS, MISC } from "../shared/dict"


export default class Tile
{
    type:string
    num:number
    price:number
    action:string
    simplified:boolean

    constructor(type:string, num:number = 0, price:number = 0, action:string = undefined)
    {
        this.type = type;
        this.num = num;
        this.price = price;
        this.action = action;
        this.simplified = false;
    }

    getTypeData() { return TYPES[this.type]; }
    getColorData(inkfriendly:boolean) 
    { 
        if(inkfriendly) { return COLORS.inkfriendly };
        return COLORS[this.getTypeData().color ?? "blue"]; 
    }

    hasAction()
    {
        if(this.simplified) { return false; }
        return this.action;
    }

    async drawForRules(vis:MaterialVisualizer)
    {
        this.simplified = true;
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
        const colData = this.getColorData(vis.inkFriendly);
        fillResourceGroup(vis.size, group, colData.light);
        
        // draw audience
        const resMisc = vis.getResource("misc");
        const opAudience = new LayoutOperation({
            pos: vis.get("tiles.audience.pos"),
            size: vis.get("tiles.audience.size"),
            frame: MISC.audience.frame,
            alpha: vis.get("tiles.audience.alpha")
        });
        group.add(resMisc, opAudience);

        // draw action rect at bottom
        const posY = vis.get("tiles.action.rectPosY");
        const rect = new ResourceShape( new Rectangle().fromTopLeft(new Vector2(0, posY), new Vector2(vis.size.x, vis.size.y - posY)) );
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
            pos: vis.get("tiles.podium.pos"),
            size: vis.get("tiles.podium.size"),
            frame: MISC.podium.frame,
            pivot: Vector2.CENTER,
            effects: vis.inkFriendlyEffect
        })
        group.add(resMisc, opPodium)

        // draw type illustration on top
        const spriteDims = vis.get("tiles.type.size");
        const spritePos = vis.get("tiles.type.pos");

        const opSprite = new LayoutOperation({
            pos: spritePos,
            size: spriteDims,
            frame: typeData.frame,
            pivot: Vector2.CENTER,
            effects: vis.inkFriendlyEffect
        });
        group.add(resTiles, opSprite);

        // draw product name on top
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("tiles.label.fontSize")
        }).alignCenter();
        const resNameText = new ResourceText({ text: this.getTypeData().label, textConfig: textConfig });
        const opNameText = new LayoutOperation({
            pos: vis.get("tiles.label.pos"),
            size: vis.get("tiles.label.size"),
            fill: vis.get("tiles.label.textColor"),
            pivot: Vector2.CENTER
        });
        group.add(resNameText, opNameText)

        // draws the price tag
        const tagData = fromArray(typeData.tags);
        const relPos = tagData.pos.clone().sub(new Vector2(512, 512)).div(new Vector2(1024, 1024))
        const finalPos = spritePos.clone().add( relPos.scale(spriteDims) );
        const shouldFlip = tagData.flip;
        let rot = vis.get("tiles.priceTag.rotBounds").random();
        if(shouldFlip) { rot += Math.PI; }

        const op = new LayoutOperation({
            pos: finalPos,
            size: vis.get("tiles.priceTag.size"),
            frame: MISC.price_tag.frame,
            pivot: new Vector2(0, 0.5),
            flipY: shouldFlip,
            rot: rot
        })
        group.add(resMisc, op);

        // draws the actual price text (about midway the price tag sprite, at correct rot)
        const textConfigPrice = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("tiles.priceTag.fontSize")
        }).alignCenter();
        const priceText = "$" + this.price.toString();

        const priceOffset = new Vector2(1,0).scale( vis.get("tiles.priceTag.offset") );
        priceOffset.rotate(rot);
        const priceTagPos = finalPos.clone().add(priceOffset);

        let rotComp = vis.get("tiles.priceTag.textRotationCompensation");
        if(shouldFlip) { rotComp *= -1; }

        const resPrice = new ResourceText({ text: priceText, textConfig: textConfigPrice  });
        const opPrice = new LayoutOperation({
            pos: priceTagPos,
            size: vis.get("tiles.priceTag.size"),
            fill: vis.get("tiles.priceTag.textColor"),
            pivot: Vector2.CENTER,
            flipX: shouldFlip,
            flipY: shouldFlip,
            rot: rot + rotComp
        });
        group.add(resPrice, opPrice);

        
        // draw random spotlights
        // (they go over everything else in this layer to really make an impact and light it up realistically)
        const drawSpotlights = !this.simplified && !vis.inkFriendly;

        if(drawSpotlights)
        {
            const allSpotlightPositions = [];
            const yBounds = new Bounds(0, spritePos.y);
            const xBounds = new Bounds(0.33*vis.size.x, 0);
            allSpotlightPositions.push(new Vector2(0, yBounds.random()));
            allSpotlightPositions.push(new Vector2(xBounds.random(), 0));
            allSpotlightPositions.push(new Vector2(xBounds.max + xBounds.random(), 0));
            allSpotlightPositions.push(new Vector2(2*xBounds.max + xBounds.random(), 0));
            allSpotlightPositions.push(new Vector2(vis.size.x, yBounds.random()));
            
            shuffle(allSpotlightPositions);
            const numSpotlights = vis.get("tiles.spotlight.numBounds").randomInteger();
            const spotlightPositions = allSpotlightPositions.slice(0, numSpotlights);
    
            for(const pos of spotlightPositions)
            {
                const angle = spritePos.clone().sub(pos).angle();
                const op = new LayoutOperation({
                    pos: pos,
                    size: vis.get("tiles.spotlight.size"),
                    frame: MISC.spotlight.frame,
                    pivot: new Vector2(0, 0.5),
                    rot: angle,
                    alpha: vis.get("tiles.spotlight.alpha"),
                    composite: vis.get("tiles.spotlight.composite")
                });
                group.add(resMisc, op);
            }
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

        const colData = this.getColorData(vis.inkFriendly);
        const effects = [new TintEffect(colData.main)];

        for(let i = 0; i < corners.length; i++)
        {
            if(i >= 2 && this.hasAction()) { break; }

            const pos = corners[i];
            const op = new LayoutOperation({
                pos: pos,
                size: starDims,
                frame: MISC.number_star.frame,
                pivot: Vector2.CENTER,
                effects: effects
            })

            group.add(resMisc, op);

            const opText = new LayoutOperation({
                pos: pos,
                size: starDims,
                pivot: Vector2.CENTER,
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
            pos: vis.get("tiles.action.pos"),
            size: vis.get("tiles.action.size"),
            fill: vis.get("tiles.action.textColor"),
            pivot: Vector2.CENTER
        });
        group.add(resText, opText);
    }
}