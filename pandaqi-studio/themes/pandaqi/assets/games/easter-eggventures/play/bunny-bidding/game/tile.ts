import { MISC_SHARED } from "games/easter-eggventures/shared/dictShared";
import drawBackgroundEaster from "games/easter-eggventures/shared/drawBackgroundEaster";
import drawIllustrationEaster from "games/easter-eggventures/shared/drawIllustrationEaster";
import drawTextEaster from "games/easter-eggventures/shared/drawTextEaster";
import drawTypeTextEaster from "games/easter-eggventures/shared/drawTypeTextEaster";
import { MATERIAL, TYPE_DATA, TileType } from "../shared/dict";
import MaterialEaster from "games/easter-eggventures/shared/materialEaster";
import { createContext, ResourceGroup, MaterialVisualizer, TextConfig, TextWeight, getRectangleCornersWithOffset, Vector2, LayoutOperation, ResourceText } from "lib/pq-games";

export default class Tile extends MaterialEaster
{
    type: TileType;
    key: string;
    num: number;

    constructor(t:TileType, k:string, num = 0)
    {
        super();
        this.type = t;
        this.key = k;
        this.num = num;
    }

    getData() { return MATERIAL[this.type][this.key]; }
    getTypeData() { return TYPE_DATA[this.type]; }
    getText() { return this.getData().desc; }

    needsEggNumber() { return (this.type == TileType.REGULAR || this.type == TileType.SPECIAL); }
    needsText() { return (this.type == TileType.POWER || this.type == TileType.HANDICAP || this.type == TileType.SPECIAL); }
    
    swapGlowForShadow() { return this.type == TileType.POWER; }
    invertColors()
    {
        const eggContrast = (this.type == TileType.REGULAR || this.type == TileType.GOAL) && this.getData().invertContrast;
        return (this.type == TileType.HANDICAP) || eggContrast;
    }

    async draw(vis)
    {
        const ctx = createContext({ size: vis.size });
        const group = new ResourceGroup();

        drawBackgroundEaster(this, vis, group);
        drawIllustrationEaster(this, vis, group);

        this.drawSpecial(vis, group);
        group.toCanvas(ctx);
        return ctx.canvas;
    }


    drawSpecial(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // display the tile type along top/bottom edge
        drawTypeTextEaster(this, vis, group);

        // displays the power/action text of the tile in a rectangle at the bottom
        drawTextEaster(this, vis, group);

        // displays the unique number used for bidding
        const resMisc = vis.getResource("misc");
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
            const textDims = new Vector2(3*fontSize, 2*fontSize);

            const sizeSprite = vis.get("tiles.eggNumber.spriteDims");

            for(let i = 0; i < corners.length; i++)
            {
                if(this.needsText() && i >= 2) { break; } // with text at bottom only the top gets egg numbers
                
                const pos = corners[i];
                const rot = i < 2 ? 0 : Math.PI;
                const flipX = i % 2 == 1;
                
                // egg sprite behind it
                const offset = vis.get("tiles.eggNumber.spriteOffset").clone();
                if(i == 1 || i == 2) { offset.x *= -1; }
                if(i == 2 || i == 3) { offset.y *= -1; }

                const posSprite = pos.clone().add(offset);
                const spriteOp = new LayoutOperation({
                    pos: posSprite,
                    size: sizeSprite,
                    frame: MISC_SHARED.number_bg.frame,
                    pivot: Vector2.CENTER,
                    rot: rot,
                    flipX: flipX
                });
                group.add(resMisc, spriteOp);

                // the actual number
                const resText = new ResourceText({ text: text, textConfig: textConfig });
                const textOp = new LayoutOperation({
                    pos: pos,
                    rot: rot,
                    size: textDims,
                    pivot: Vector2.CENTER,
                    fill: "#000000"
                })
    
                group.add(resText, textOp);
            }
        }
    }
}