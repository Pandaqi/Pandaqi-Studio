import { MaterialVisualizer, createContext, fillCanvas, ResourceGroup, DropShadowEffect, LayoutOperation, Vector2, TintEffect, TextConfig, ResourceText, ResourceShape, Circle, StrokeAlign } from "lib/pq-games";
import { ACTIONS, ActionSpecific, COLORS, ColorType, MISC, TYPES, TileType } from "../shared/dict";

export default class Tile
{
    type:TileType
    color:ColorType
    actions:ActionSpecific[]

    constructor(type:TileType, color:ColorType, actions:ActionSpecific[] = [])
    {
        this.type = type ?? TileType.KRAKEN;
        this.color = color ?? ColorType.RED;
        this.actions = actions ?? [];
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

        if(!vis.custom)
        {
            const effect = new DropShadowEffect({ blurRadius: vis.get("tiles.shared.shadowRadius"), color: vis.get("tiles.shared.shadowColor") });
            vis.custom = { shadowEffect: effect };
        } 

        this.drawBackground(vis, group);
        this.drawType(vis, group);
        this.drawActions(vis, group);
        this.drawColor(vis, group);

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const resMisc = vis.getResource("misc");
        const opWave = new LayoutOperation({
            pos: new Vector2(),
            size: vis.size,
            frame: MISC.wave_bg.frame,
        })

        if(!vis.inkFriendly)
        {
            group.add(resMisc, opWave)
        }

        const hasOneAction = this.actions.length > 0;
        if(hasOneAction)
        {
            const color = vis.get("tiles.bg.colors." + this.actions[0].type);
            const opAction = opWave.clone();
            opAction.frame = MISC.wave_above.frame;
            opAction.effects = [new TintEffect(color), vis.inkFriendlyEffect].flat();
            group.add(resMisc, opAction);
        }

        const hasTwoActions = this.actions.length > 1;
        if(hasTwoActions)
        {
            const color = vis.get("tiles.bg.colors." + this.actions[1].type);
            const opAction = opWave.clone();
            opAction.frame = MISC.wave_below.frame;
            opAction.effects = [new TintEffect(color), vis.inkFriendlyEffect].flat();
            group.add(resMisc, opAction);
        }
    }

    drawType(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const typeData = TYPES[this.type];
        const resType = vis.getResource("tile_types");
        const opType = new LayoutOperation({
            pos: vis.center,
            size: vis.get("tiles.type.size"),
            pivot: Vector2.CENTER,
            frame: typeData.frame,
            effects: [vis.custom.shadowEffect, vis.inkFriendlyEffect].flat()
        });
        group.add(resType, opType);

        const text = typeData.points.toString();
        const fontSize = vis.get("tiles.type.fontSize");
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: fontSize
        }).alignCenter();
        const resText = new ResourceText({ text: text, textConfig: textConfig });

        const centerOffset = vis.get("tiles.type.numberOffsetFromCenter");
        const positions = [
            new Vector2(vis.center.x - centerOffset, vis.center.y),
            new Vector2(vis.center.x + centerOffset, vis.center.y)
        ]

        // to easily differentiate the 6 and 9 from any angle, we add a dot to their bottom right corner
        const needsDot = [6,9].includes( Math.abs(typeData.points) );
        const circleRadius = 0.05 * fontSize;
        const resCircle = new ResourceShape(new Circle({ center: new Vector2(), radius: circleRadius }));
        const opCircle = new LayoutOperation({
            fill: vis.get("tiles.type.textColor"),
            stroke: vis.get("tiles.type.textStrokeColor"),
            strokeWidth: vis.get("tiles.type.textStrokeWidth"),
            strokeAlign: StrokeAlign.OUTSIDE
        });

        for(let i = 0; i < positions.length; i++)
        {
            const pos = positions[i];
            const rot = i == 0 ? 0 : Math.PI;
            const opText = new LayoutOperation({
                pos: pos,
                size: new Vector2(2*textConfig.size),
                pivot: Vector2.CENTER,
                fill: vis.get("tiles.type.textColor"),
                stroke: vis.get("tiles.type.textStrokeColor"),
                strokeWidth: vis.get("tiles.type.textStrokeWidth"),
                strokeAlign: StrokeAlign.OUTSIDE,
                rot: rot,
                effects: [vis.custom.shadowEffect]
            })
            group.add(resText, opText);

            if(needsDot)
            {
                const opCircleTemp = opCircle.clone();
                let dotOffset = new Vector2(fontSize).scale(0.2);
                if(typeData.points < 0) { dotOffset.add(new Vector2(0.125*fontSize, 0)); }
                if(i == 1) { dotOffset.negate(); }
                opCircleTemp.pos = pos.clone().add(dotOffset);
                group.add(resCircle, opCircleTemp);
            }
        }
    }

    drawActions(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(this.actions.length <= 0) { return; }

        const resMisc = vis.getResource("misc");
        
        // @NOTE: we calculate everything according to the icon size ( = "full size we can take up")
        // but the actual icon is displayed at a scaled down size, so we get whitespace/padding between it and text/edges
        const spriteDims = vis.get("tiles.action.iconDims");
        const realSpriteDims = spriteDims.clone().scale(vis.get("tiles.action.iconScaleFactor"));
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("tiles.action.fontSize"),
            lineHeight: vis.get("tiles.action.lineHeight")
        }).alignCenter();

        const edgeOffset = vis.get("tiles.action.edgeOffsetForColor");
        const availableWidth = vis.size.x - 2*edgeOffset;
        const textColor = vis.get("tiles.action.textColor");

        // @NOTE: this is the anchor position of the type icon
        const positions = [
            new Vector2(edgeOffset + 0.5*spriteDims.x, edgeOffset + 0.5*spriteDims.y),
            new Vector2(edgeOffset + 0.5*spriteDims.x, vis.size.y - edgeOffset - 0.5*spriteDims.y)
        ];

        for(let i = 0; i < this.actions.length; i++)
        {
            const action = this.actions[i];
            const type = action.type;
            const data = ACTIONS[action.key];
            const pos = positions[i];

            // the action type icon
            const opMisc = new LayoutOperation({
                pos: pos,
                size: realSpriteDims,
                pivot: Vector2.CENTER,
                frame: MISC[type + "_icon"].frame,
                effects: [vis.custom.shadowEffect, vis.inkFriendlyEffect].flat()
            });
            group.add(resMisc, opMisc)

            // the actual power text
            const resText = new ResourceText({ text: data.desc, textConfig: textConfig });
            const textBoxDims = new Vector2(availableWidth - spriteDims.x, spriteDims.y);
            const opText = new LayoutOperation({
                pos: pos.clone().add(new Vector2(0.5*realSpriteDims.x + 0.5*textBoxDims.x, 0)),
                size: textBoxDims,
                pivot: Vector2.CENTER,
                fill: textColor
            });
            group.add(resText, opText);
        }
    }

    drawColor(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const resCol = vis.getResource("patterns");
        const opCol = new LayoutOperation({
            pos: new Vector2(),
            size: vis.size,
            frame: COLORS[this.color].frame
        })
        group.add(resCol, opCol);
    }
}