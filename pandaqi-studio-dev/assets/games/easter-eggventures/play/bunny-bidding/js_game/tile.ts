import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import { MATERIAL, TYPE_DATA, TileType } from "../js_shared/dict";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import fillResourceGroup from "js/pq_games/layout/canvas/fillResourceGroup";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import GrayScaleEffect from "js/pq_games/layout/effects/grayScaleEffect";
import LayoutEffect from "js/pq_games/layout/effects/layoutEffect";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import Point from "js/pq_games/tools/geometry/point";
import TextConfig from "js/pq_games/layout/text/textConfig";

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
        if(typeData.backgroundRandom) { frame = rangeInteger(0,typeData.backgroundRandom-1); }

        const op = new LayoutOperation({
            dims: vis.size,
            frame: frame
        })
        group.add(res, op);
    }

    drawIllustration(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const typeData = this.getTypeData();
        const data = this.getData();
        const res = vis.getResource(typeData.textureKey);
        const frame =  data.frame;

        const effects:LayoutEffect[] = [new DropShadowEffect()] // @TODO: drop shadow config params
        if(vis.inkFriendly) { effects.push(new GrayScaleEffect()); }

        const op = new LayoutOperation({
            dims: vis.size,
            frame: frame,
            effects: effects,
        })
        group.add(res, op);
    }

    drawSpecial(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const typeData = this.getTypeData();
        const data = this.getData();

        // displays the unique number used for bidding
        const addEggNumber = (this.type == TileType.REGULAR || this.type == TileType.SPECIAL);
        if(addEggNumber)
        {
            const text = this.num.toString();
            const fontSize = vis.get("tiles.eggNumber.fontSize");
            const textConfig = new TextConfig({
                font: vis.get("fonts.heading"),
                size: fontSize
            }).alignCenter();

            const resText = new ResourceText({ text: text, textConfig: textConfig });
            const textOp = new LayoutOperation({
                translate: vis.get("tiles.eggNumber.translate"),
                dims: new Point(3*fontSize, 2*fontSize),
                pivot: Point.CENTER
            })

            group.add(resText, textOp);
        }

        // displays the power/action text of the tile in a rectangle at the bottom
        const addText = (this.type == TileType.POWER || this.type == TileType.HANDICAP || this.type == TileType.SPECIAL);
        if(addText)
        {
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
        // @TODO: and perhaps display the NAME/TYPE of the egg inside some nice banner or something
    }
}