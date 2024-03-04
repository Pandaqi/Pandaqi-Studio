import { MISC_SHARED } from "games/easter-eggventures/js_shared/dictShared";
import drawBackgroundEaster from "games/easter-eggventures/js_shared/drawBackgroundEaster";
import drawIllustrationEaster from "games/easter-eggventures/js_shared/drawIllustrationEaster";
import drawTextEaster from "games/easter-eggventures/js_shared/drawTextEaster";
import drawTypeTextEaster from "games/easter-eggventures/js_shared/drawTypeTextEaster";
import createContext from "js/pq_games/layout/canvas/createContext";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig, { TextWeight } from "js/pq_games/layout/text/textConfig";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import getRectangleCornersWithOffset from "js/pq_games/tools/geometry/paths/getRectangleCornersWithOffset";
import Point from "js/pq_games/tools/geometry/point";
import { MATERIAL, TYPE_DATA, TileType } from "../js_shared/dict";
import MaterialEaster from "games/easter-eggventures/js_shared/materialEaster";

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
            const textDims = new Point(3*fontSize, 2*fontSize);

            const dimsSprite = vis.get("tiles.eggNumber.spriteDims");

            for(let i = 0; i < corners.length; i++)
            {
                if(this.needsText() && i >= 2) { break; } // with text at bottom only the top gets egg numbers
                
                const pos = corners[i];
                const rotation = i < 2 ? 0 : Math.PI;
                const flipX = i % 2 == 1;
                
                // egg sprite behind it
                const offset = vis.get("tiles.eggNumber.spriteOffset").clone();
                if(i == 1 || i == 2) { offset.x *= -1; }
                if(i == 2 || i == 3) { offset.y *= -1; }

                const posSprite = pos.clone().add(offset);
                const spriteOp = new LayoutOperation({
                    translate: posSprite,
                    dims: dimsSprite,
                    frame: MISC_SHARED.number_bg.frame,
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
                    pivot: Point.CENTER,
                    fill: "#000000"
                })
    
                group.add(resText, textOp);
            }
        }
    }
}