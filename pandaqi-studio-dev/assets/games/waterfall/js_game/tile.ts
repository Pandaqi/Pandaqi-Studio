import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig from "js/pq_games/layout/text/textConfig";
import StrokeAlign from "js/pq_games/layout/values/strokeAlign";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import Point from "js/pq_games/tools/geometry/point";
import CONFIG from "../js_shared/config";
import { ACTIONS, GEMSTONES, MISC, TileType } from "../js_shared/dict";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";

export default class Tile
{
    type: TileType
    keyAction: string
    score: number
    gemstone: string

    constructor(type:TileType, score = 0, keyAction = "")
    {
        this.type = type;
        this.score = score;
        this.keyAction = keyAction;
    }

    setScore(s:number) { this.score = s; }
    setAction(a:string) { this.keyAction = a; }
    setGemstone(g:string) { this.gemstone = g; }

    getAsString()
    {
        return "(SCORE = " + this.score + " / GEM = " + this.gemstone + " / ACTION = " + this.keyAction + ")";
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
            vis.custom = {
                glowEffect: [new DropShadowEffect({ color: vis.get("tiles.shared.shadow.color"), blurRadius: vis.get("tiles.shared.shadow.blur")})]
            }
        }

        if(this.type == TileType.PAWN) {
            this.drawPawn(vis, group);
        } else {
            this.drawBackground(vis, group);
            this.drawScore(vis, group);
            this.drawAction(vis, group);
            this.drawGemstone(vis, group);
        }

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    // extremely simple function that just plasters an image at full size on tile
    // (the image contains two "pawns" side by side)
    drawPawn(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const res = vis.getResource("misc");
        const op = new LayoutOperation({
            dims: vis.size,
            frame: MISC[this.keyAction].frame,
            effects: vis.inkFriendlyEffect
        });
        group.add(res, op);
    }

    // fixed template for card (which does most of the work)
    // overlaid by random dirt texture for much nicer look
    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(this.type != TileType.REGULAR) { return; }

        const resTemplate = vis.getResource("misc");
        const opTemplate = new LayoutOperation({
            dims: vis.size,
            frame: MISC.card_template.frame,
            effects: vis.inkFriendlyEffect
        });
        group.add(resTemplate, opTemplate);

        const bgDirtTextureKey = "bg_" + CONFIG.generation.bgDirtTextureBounds.randomInteger();
        const opDirt = new LayoutOperation({
            dims: vis.size,
            frame: MISC[bgDirtTextureKey].frame,
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
            translate: vis.get("tiles.score.pos"),
            dims: new Point(3*textConfig.size),
            fill: vis.inkFriendly ? "#000000" : vis.get("tiles.score.textColor"),
            stroke: vis.inkFriendly ? "#FFFFFF" : vis.get("tiles.score.strokeColor"),
            strokeWidth: vis.get("tiles.score.strokeWidth"),
            strokeAlign: StrokeAlign.OUTSIDE,
            pivot: Point.CENTER
        })
        group.add(resText, opText);
    }

    drawAction(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.keyAction) { return; }
        
        const resIcon = vis.getResource("actions");
        const opIcon = new LayoutOperation({
            translate: vis.get("tiles.action.pos"),
            dims: vis.get("tiles.action.dims"),
            frame: ACTIONS[this.keyAction].frame,
            pivot: Point.CENTER,
            effects: [vis.custom.glowEffect, vis.inkFriendlyEffect].flat()
        });
        group.add(resIcon, opIcon);
    }

    drawGemstone(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // the actual gemstone
        const res = vis.getResource("gemstones");
        const opGem = new LayoutOperation({
            translate: vis.get("tiles.gemstones.pos"),
            dims: vis.get("tiles.gemstones.dims"),
            frame: GEMSTONES[this.gemstone].frame,
            pivot: Point.CENTER,
            rotation: Math.random() * 2 * Math.PI,
            effects: vis.custom.glowEffect
        })
        group.add(res, opGem);
    }
}