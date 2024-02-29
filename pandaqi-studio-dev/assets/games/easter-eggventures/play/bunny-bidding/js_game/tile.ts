import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import { MATERIAL, MISC, TYPE_DATA, TileType } from "../js_shared/dict";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import fillResourceGroup from "js/pq_games/layout/canvas/fillResourceGroup";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import GrayScaleEffect from "js/pq_games/layout/effects/grayScaleEffect";
import LayoutEffect from "js/pq_games/layout/effects/layoutEffect";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import Point from "js/pq_games/tools/geometry/point";
import TextConfig, { TextWeight } from "js/pq_games/layout/text/textConfig";
import getRectangleCornersWithOffset from "js/pq_games/tools/geometry/paths/getRectangleCornersWithOffset";

export default class Tile
{
    type: TileType;
    key: string;
    num: number;

    constructor(t:TileType, k:string, num = 0)
    {
        this.type = t;
        this.key = k;
        this.num = num;
    }

    getData()
    {
        return MATERIAL[this.type][this.key];
    }

    getTypeData()
    {
        return TYPE_DATA[this.type];
    }

    needsEggNumber() { return (this.type == TileType.REGULAR || this.type == TileType.SPECIAL); }
    needsText() { return (this.type == TileType.POWER || this.type == TileType.HANDICAP || this.type == TileType.SPECIAL); }
    
    async draw(vis)
    {
        const ctx = createContext({ size: vis.size });
        const group = new ResourceGroup();
        this.drawBackground(vis, group);
        this.drawIllustration(vis, group);
        this.drawSpecial(vis, group);
        group.toCanvas(ctx);
        return ctx.canvas;
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
        if(this.needsText())
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
            if(this.needsText() && i > 0) { break; } // if text at bottom, no space for this as well

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
        if(this.needsEggNumber())
        {
            const text = this.num.toString();
            const fontSize = vis.get("tiles.eggNumber.fontSize");
            const textConfig = new TextConfig({
                font: vis.get("fonts.heading"),
                size: fontSize,
                weight: TextWeight.BOLD
            }).alignCenter();

            const offset = vis.get("tiles.eggNumber.edgeOffset");
            const corners = getRectangleCornersWithOffset(vis.size, offset);
            const textDims = new Point(3*fontSize, 2*fontSize);

            const dimsSprite = vis.get("tiles.eggNumber.spriteDims");

            for(let i = 0; i < corners.length; i++)
            {
                if(this.needsText() && i >= 2) { break; } // with text at bottom only the top gets egg numbers
                
                const pos = corners[i];
                const rotation = i < 2 ? 0 : Math.PI;
                const flipX = i % 2 == 1;
                
                // egg sprite behind it
                const posSprite = pos.clone().add(vis.get("tiles.eggNumber.spriteOffset"));
                const spriteOp = new LayoutOperation({
                    translate: posSprite,
                    dims: dimsSprite,
                    frame: MISC.number_bg.frame,
                    pivot: Point.CENTER,
                    rotation: rotation,
                    flipX: flipX
                });
                group.add(resMisc, spriteOp);

                // the actual number
                const resText = new ResourceText({ text: text, textConfig: textConfig });
                const textOp = new LayoutOperation({
                    translate: pos,
                    rotation: rotation,
                    dims: textDims,
                    pivot: Point.CENTER
                })
    
                group.add(resText, textOp);
            }
        }

        // displays the power/action text of the tile in a rectangle at the bottom
        if(this.needsText())
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
            const text = data.desc;
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

        // @TODO: some unique icon to instantly differentiate tile types (especially useful for Goal Egg / Regular Egg)
    }
}