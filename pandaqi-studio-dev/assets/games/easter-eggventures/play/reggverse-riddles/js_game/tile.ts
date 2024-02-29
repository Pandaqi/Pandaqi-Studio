import createContext from "js/pq_games/layout/canvas/createContext";
import fillResourceGroup from "js/pq_games/layout/canvas/fillResourceGroup";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import GrayScaleEffect from "js/pq_games/layout/effects/grayScaleEffect";
import LayoutEffect from "js/pq_games/layout/effects/layoutEffect";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig, { TextWeight } from "js/pq_games/layout/text/textConfig";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import Point from "js/pq_games/tools/geometry/point";
import { MATERIAL, MISC, TYPE_DATA, TileType } from "../js_shared/dict";

export default class Tile
{
    type: TileType;
    key: string;
    customData: Record<string,any>

    constructor(t:TileType, k:string, cd:Record<string,any> = {})
    {
        this.type = t;
        this.key = k;
        this.customData = cd;
    }

    getTypeData() { return TYPE_DATA[this.type]; }
    getData() 
    { 
        if(this.type == TileType.RULE) { return this.customData.rulesDict[this.key]; }
        return MATERIAL[this.type][this.key]; 
    }


    needsText() { return this.type == TileType.RULE || this.type == TileType.OBJECTIVE }

    async draw(vis)
    {
        const ctx = createContext({ size: vis.size });
        const group = new ResourceGroup();

        if(this.type == TileType.PAWN) {
            this.drawPawns(vis, group);
        } else if(this.type == TileType.EGG) {
            this.drawEggToken(vis, group);
        } else {
            this.drawBackground(vis, group);
            this.drawIllustration(vis, group);
            this.drawSpecial(vis, group);
        }

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawPawns(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // the pawn is just a 1024x1024 texture of which the left column is completely predetermined
        // and it just places that + a copy to the right
        const res = vis.getResource("pawns");
        let pos = new Point();
        for(let i = 0; i < 2; i++)
        {
            const op = new LayoutOperation({
                translate: pos,
                frame: this.customData.playerNum,
                dims: vis.size
            })

            pos.x += 0.5*vis.size.x;
            group.add(res, op);
        }
    }

    // extremely simple, just the one egg sprite
    drawEggToken(vis:MaterialVisualizer, group: ResourceGroup)
    {
        const res = vis.getResource("eggs");
        const op = new LayoutOperation({
            dims: vis.size,
            frame: this.getData().frame
        })
        group.add(res, op);
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const typeData = this.getTypeData();
        const data = this.getData();

        // flat color
        let bgColor = data.color ?? this.getTypeData().color;
        bgColor = vis.inkFriendly ? "#FFFFFF" : bgColor;
        fillResourceGroup(vis.size, group, bgColor); 

        // pattern / texture
        const res = vis.getResource(typeData.backgroundKey);
        let frame = data.frame ?? 0;
        if(typeData.backgroundRandom) { frame = typeData.backgroundRandom.randomInteger(); }

        const op = new LayoutOperation({
            dims: vis.size,
            frame: frame
        })
        group.add(res, op);

        // gradient
        const resMisc = vis.getResource("misc");
        const opGrad = new LayoutOperation({
            dims: vis.size,
            frame: MISC.gradient.frame,
            alpha: vis.get("tiles.bg.gradientAlpha")
        });
        group.add(resMisc, opGrad);

        // light rays
        const opRays = new LayoutOperation({
            translate: vis.center,
            dims: vis.size,
            frame: MISC.lightrays.frame,
            pivot: Point.CENTER,
            alpha: vis.get("tiles.bg.lightraysAlpha"),
            composite: vis.get("tiles.bg.lightraysComposite")
        })
        group.add(resMisc, opRays);
    }

    drawIllustration(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const typeData = this.getTypeData();
        const data = this.getData();
        const res = vis.getResource(typeData.textureKey);
        const frame =  data.frame;

        const effects:LayoutEffect[] = [new DropShadowEffect({ 
            blurRadius: vis.get("tiles.illu.glowRadius"), 
            color: vis.get("tiles.illu.glowColor") 
        })]
        if(vis.inkFriendly) { effects.push(new GrayScaleEffect()); }

        let trans = vis.center.clone();
        if(this.needsText(vis))
        {
            trans.y += vis.get("tiles.illu.offsetWhenTextPresent");
        }

        const op = new LayoutOperation({
            translate: trans,
            dims: vis.size,
            frame: frame,
            pivot: Point.CENTER,
            effects: effects,
        })
        group.add(res, op);
    }

    drawSpecial(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const typeData = this.getTypeData();
        const data = this.getData();
        const resMisc = vis.getResource("misc");

        // display the tile type along top/bottom edge
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("tiles.typeText.fontSize"),
            weight: TextWeight.BOLD
        }).alignCenter();

        const resTypeText = new ResourceText({ text: typeData.label, textConfig: textConfig });
        const typeTextOffset = vis.get("tiles.typeText.edgeOffset");

        for(let i = 0; i < 2; i++)
        {
            if(this.needsText(vis) && i > 0) { break; } // if text at bottom, no space for this as well

            const pos = vis.center.clone();
            const dir = i == 0 ? 1 : -1;
            pos.add(typeTextOffset.clone().scale(dir));

            const op = new LayoutOperation({
                translate: pos,
                dims: new Point(vis.size.x, 2*textConfig.size),
                pivot: Point.CENTER,
                alpha: vis.get("tiles.typeText.alpha"),
                composite: vis.get("tiles.typeText.composite"),
                rotation: (i == 0 ? 0 : Math.PI)
            })
            group.add(resTypeText, op);
        }

        // displays the unique number used for bidding
        // @TODO: proper position + stroke + general design (need to do sketches first to find this)
        if(this.needsEggNumber())
        {
            const text = this.num == 0 ? "?" : this.num.toString();
            const fontSize = vis.get("tiles.eggNumber.fontSize");
            const textConfig = new TextConfig({
                font: vis.get("fonts.heading"),
                size: fontSize,
                weight: TextWeight.BOLD
            }).alignCenter();

            const textDims = new Point(3*fontSize, 2*fontSize);
            const pos = vis.center; // @TODO?

            const resText = new ResourceText({ text: text, textConfig: textConfig });
            const textOp = new LayoutOperation({
                translate: pos,
                dims: textDims,
                pivot: Point.CENTER
            })

            group.add(resText, textOp);
        }

        // displays the power/action text of the tile in a rectangle at the bottom
        if(this.needsText(vis))
        {
            // the background
            const bgOp = new LayoutOperation({
                translate: vis.get("tiles.text.translate"),
                frame: MISC.text_bg.frame,
                dims: vis.get("tiles.text.bgDims"),
                pivot: Point.CENTER
            })
            group.add(resMisc, bgOp);

            // the actual power text
            let text = data.desc;

            // special eggs prepend the _type_ of special they are
            // (which we can do directly because it's a string-based enum)
            if(this.type == TileType.SPECIAL)
            {
                text = this.getData().type.toUpperCase() + ": " + text; 
            }

            const textConfig = new TextConfig({
                font: vis.get("fonts.body"),
                size: vis.get("tiles.text.fontSize")
            }).alignCenter();

            const resText = new ResourceText({ text: text, textConfig: textConfig });
            const textOp = new LayoutOperation({
                translate: vis.get("tiles.text.translate"),
                dims: vis.get("tiles.text.dims"),
                pivot: Point.CENTER
            })

            group.add(resText, textOp);
        }
    }
}