
import { Color, DropShadowEffect, GrayScaleEffect, LayoutOperation, MaterialVisualizer, Path, Rectangle, ResourceShape, ResourceText, StrokeAlign, TextAlign, TextConfig, Vector2, bevelCorners, colorDarken, colorLighten, createContext, fillCanvas, getRectangleCornersWithOffset, patternizeGrid, strokeCanvas } from "lib/pq-games";
import { CONFIG } from "../shared/config";
import { CATS, MISC, POWERS } from "../shared/dict";


const cacheVisualizerData = async (vis:MaterialVisualizer) =>
{  
    const alreadyCached = vis.custom && Object.keys(vis.custom).length > 0;
    if(alreadyCached) { return; }

    const shadowOffset = new Vector2(vis.get("cards.shared.shadowOffset")).clone().scale(vis.sizeUnit);
    const shadowColor = vis.get("cards.shared.shadowColor");

    const params = 
    {
        dims: (1.0 + vis.get("cards.bgCats.patternExtraMargin")) * vis.size.y,
        size: vis.get("cards.bgCats.patternIconSize"),
        num: vis.get("cards.bgCats.patternNumIcons"),
        resource: vis.getResource("misc"),
        frame: MISC.bg_cat.frame
    }

    vis.custom =
    {
        effects: [new DropShadowEffect({ offset: shadowOffset, color: shadowColor }), vis.inkFriendlyEffect].flat(),
        patternCat: await patternizeGrid(params),
    }
}

export default class Card
{
    suit: string
    num: number
    power: string

    constructor(suit:string, num:number)
    {
        this.suit = suit;
        this.num = num;
    }

    async drawForRules(vis:MaterialVisualizer)
    {
        await cacheVisualizerData(vis);

        const ctx = createContext({ size: vis.size });
        fillCanvas(ctx, "#FFFFFF");

        await this.drawCorners(vis, ctx);
        await this.drawMainIllustration(vis, ctx);

        this.drawOutline(vis, ctx);
        return ctx.canvas;
    }

    getData() { return CATS[this.suit]; }
    async draw(vis:MaterialVisualizer)
    {
        await cacheVisualizerData(vis);

        const ctx = createContext({ size: vis.size });

        await this.drawBackground(vis, ctx);
        await this.drawCorners(vis, ctx);
        await this.drawMainIllustration(vis, ctx);
        await this.drawPower(vis, ctx);

        this.drawOutline(vis, ctx);
        return ctx.canvas;
    }

    async drawBackground(vis:MaterialVisualizer, ctx)
    {
        // first solid color
        let color = vis.get("cards.shared.defaultBGColor");
        if(vis.inkFriendly) { color = "#FFFFFF"; }
        fillCanvas(ctx, color);

        // then the specific pattern
        let alpha = vis.get("cards.bgCats.patternAlpha");
        if(vis.inkFriendly) { return; }

        const pattern = vis.custom.patternCat;
        const rot = vis.get("cards.bgCats.patternRotation");
        const op = new LayoutOperation({
            pos: vis.center,
            alpha: alpha,
            rot: rot,
            pivot: Vector2.CENTER
        })
        await pattern.toCanvas(ctx, op);
    }

    async drawCorners(vis:MaterialVisualizer, ctx)
    {
        await this.drawCornerNumbers(vis, ctx);
        await this.drawCornerSuits(vis, ctx);
    }

    async drawCornerNumbers(vis:MaterialVisualizer, ctx)
    {
        // first the text (number of the card)
        const fontSize = vis.get("cards.corners.fontSize") * vis.sizeUnit;
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: fontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE
        });

        const text = this.num.toString();
        const resText = new ResourceText({ text: text, textConfig: textConfig });

        const offset = new Vector2(fontSize * 0.5 * vis.get("cards.corners.offsetText"));
        const positions = getRectangleCornersWithOffset(vis.size, offset);
        const color = this.getData().color;
        const lighten = this.getData().colorLighten ?? vis.get("cards.shared.colorLighten");
        const darken = this.getData().colorDarken ?? vis.get("cards.shared.colorDarken");
        const colorDark = vis.inkFriendly ? "#111111" : colorDarken(new Color(color), darken);
        const colorLight = colorLighten(new Color(color), lighten);
        const strokeWidth = vis.get("cards.corners.strokeWidth") * fontSize;

        for(let i = 0; i < positions.length; i++)
        {
            const rot = i <= 1 ? 0 : Math.PI;
            const pos = positions[i];
            const op = new LayoutOperation({
                pos: pos,
                size: new Vector2(vis.size.x, fontSize),
                fill: colorDark,
                stroke: colorLight,
                strokeWidth: strokeWidth,
                strokeAlign: StrokeAlign.OUTSIDE,
                pivot: Vector2.CENTER,
                rot: rot,
                effects: vis.custom.effects
            })

            await resText.toCanvas(ctx, op);
        }
    }

    async drawCornerSuits(vis:MaterialVisualizer, ctx)
    {
        const fontSize = vis.get("cards.corners.fontSize") * vis.sizeUnit;
        const offset = new Vector2(fontSize * 0.5 * vis.get("cards.corners.offsetText"));
        const positions = getRectangleCornersWithOffset(vis.size, offset);

        // then the suit icon below
        const resIcon = vis.resLoader.getResource("suits");
        const sizeIcon = vis.get("cards.corners.iconSize") * fontSize;
        const offsetIcon = (0.5 * fontSize + 0.5*sizeIcon) * vis.get("cards.corners.offsetIcon");
        const frame = this.getData().frame;
        const effects = vis.inkFriendly ? [new GrayScaleEffect()] : [];

        // the icon draws its outline dynamically; this is an experiment, could've just baked those into the original images
        //const effectsIcon = vis.effects.slice();
        //effectsIcon.unshift(new OutlineEffect({ color: colorLight, thickness: strokeWidth }));

        for(let i= 0; i < positions.length; i++)
        {
            const rot = i <= 1 ? 0 : Math.PI;
            const offsetDir = i <= 1 ? 1 : -1;
            const pos = positions[i].clone().move(new Vector2(0, offsetDir * offsetIcon));
            const op = new LayoutOperation({
                frame: frame,
                size: new Vector2(sizeIcon),
                pos: pos,
                rot: rot,
                pivot: Vector2.CENTER,
                effects: effects,
            })

            await resIcon.toCanvas(ctx, op);
        }
    }

    async drawMainIllustration(vis:MaterialVisualizer, ctx)
    {
        const extentsRect = vis.get("cards.powers.rectSize").clone().scale(vis.size);
        const offsetFactor = CONFIG._settings.includePowers.value ? vis.get("cards.illustration.offset") : 0.0;
        const offset = 0.5 * offsetFactor * extentsRect.y;
        const size = new Vector2(vis.get("cards.illustration.size") * vis.sizeUnit);
        const res = vis.resLoader.getResource("cats");
        const frame = this.getData().frame;
        const effects = vis.inkFriendly ? [new GrayScaleEffect()] : [];

        for(let i = 0; i < 2; i++)
        {
            const dir = (i == 0) ? -1 : 1;
            const rot = (i == 0) ? 0 : Math.PI;
            const pos = vis.center.clone().move(new Vector2(0, dir * offset));
            const op = new LayoutOperation({
                frame: frame,
                pos: pos,
                size: size,
                rot: rot,
                pivot: new Vector2(0.5, 1),
                effects: effects
            })

            await res.toCanvas(ctx, op);
        }
    }

    async drawPower(vis:MaterialVisualizer, ctx)
    {
        if(!CONFIG._settings.includePowers.value) { return; }

        // the background rectangle
        const extents = vis.get("cards.powers.rectSize").clone().scale(vis.size);
        const extentsUnit = Math.min(extents.x, extents.y);;
        const rect = new Rectangle({ center: vis.center, extents: extents });
        const bevelSize = vis.get("cards.powers.rectBevel") * extentsUnit;
        const rectBeveled = bevelCorners(rect.toPathArray(), bevelSize);
        const pathObj = new Path(rectBeveled, true);
        const shape = new ResourceShape({ shape: pathObj });
                
        const color = this.getData().color;
        const lighten = this.getData().colorLighten ?? vis.get("cards.shared.colorLighten");
        const colorLight = vis.inkFriendly ? "#FFFFFF" : colorLighten(new Color(color), lighten);
        const strokeWidth = vis.get("cards.powers.rectStrokeWidth") * vis.sizeUnit;

        const op = new LayoutOperation({
            fill: colorLight,
            stroke: "#000000",
            strokeWidth: strokeWidth,
            strokeAlign: StrokeAlign.OUTSIDE,
            effects: vis.custom.effects
        })
        shape.toCanvas(ctx, op);

        // the text inside
        const fontSize = vis.get("cards.powers.fontSize") * vis.sizeUnit;
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: fontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE
        });

        const text = this.power ? POWERS[this.power].desc : "-";
        const resText = new ResourceText({ text: text, textConfig: textConfig });
        const padding = vis.get("cards.powers.textPadding").clone().scale(extentsUnit);
        const extentsText = new Vector2(extents.x - 2*padding.x, extents.y - 2*padding.y);

        const opText = new LayoutOperation({
            size: extentsText,
            pos: vis.center,
            fill: "#000000",
            pivot: Vector2.CENTER
        })
        await resText.toCanvas(ctx, opText);
    }

    drawOutline(vis:MaterialVisualizer, ctx)
    {
        const outlineSize = vis.get("cards.outline.size") * vis.sizeUnit;
        strokeCanvas(ctx, vis.get("cards.outline.color"), outlineSize);
    }
}