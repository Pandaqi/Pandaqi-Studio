import drawBackgroundEaster from "games/easter-eggventures/shared/drawBackgroundEaster";
import drawIllustrationEaster from "games/easter-eggventures/shared/drawIllustrationEaster";
import drawPawnsEaster from "games/easter-eggventures/shared/drawPawnsEaster";
import drawTextEaster from "games/easter-eggventures/shared/drawTextEaster";
import drawTypeTextEaster from "games/easter-eggventures/shared/drawTypeTextEaster";
import MaterialEaster from "games/easter-eggventures/shared/materialEaster";
import createContext from "js/pq_games/layout/canvas/createContext";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig, { TextWeight } from "js/pq_games/layout/text/textConfig";
import StrokeAlign from "js/pq_games/layout/values/strokeAlign";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import Point from "js/pq_games/tools/geometry/point";
import { MATERIAL, TYPE_DATA, TileType } from "../shared/dict";

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

    getText()
    {
        let text = this.getData().desc;

        // special eggs prepend the _type_ of special they are
        // (which we can do directly because it's a string-based enum)
        if(this.type == TileType.SPECIAL)
        {
            text = "<b>" + this.getData().type.toUpperCase() + ":</b> " + text; 
        }

        return text;
    }

    needsText(vis:MaterialVisualizer)
    {
        return this.getData().desc && (this.type != TileType.OBSTACLE || vis.get("addTextOnObstacles"));
    }

    invertColors()
    {
        const eggContrast = this.type == TileType.EGG && this.getData().invertContrast;
        return eggContrast;
    }

    needsEggNumber() { return this.type == TileType.EGG; }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        const group = new ResourceGroup();

        if(this.type == TileType.PAWN) {
            drawPawnsEaster(this, vis, group);
        } else {
            drawBackgroundEaster(this, vis, group);
            drawIllustrationEaster(this, vis, group);
            this.drawSpecial(vis, group);
        }

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawSpecial(vis:MaterialVisualizer, group:ResourceGroup)
    {
        drawTypeTextEaster(this, vis, group);
        drawTextEaster(this, vis, group);

        // displays the unique number used for bidding
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
            const pos = vis.get("tiles.eggNumber.position")

            const resText = new ResourceText({ text: text, textConfig: textConfig });
            const fillColor = vis.inkFriendly ? "#000000" : vis.get("tiles.eggNumber.fillColor");
            const strokeColor = vis.inkFriendly ? "#FFFFFF" : vis.get("tiles.eggNumber.strokeColor");
            const textOp = new LayoutOperation({
                pos: pos,
                size: textDims,
                pivot: Point.CENTER,
                fill: fillColor,
                stroke: strokeColor,
                strokeWidth: vis.get("tiles.eggNumber.strokeWidth"),
                strokeAlign: StrokeAlign.OUTSIDE,
                alpha: vis.get("tiles.eggNumber.alpha"),
                composite: vis.get("tiles.eggNumber.composite")
            })

            group.add(resText, textOp);
        }
    }
}