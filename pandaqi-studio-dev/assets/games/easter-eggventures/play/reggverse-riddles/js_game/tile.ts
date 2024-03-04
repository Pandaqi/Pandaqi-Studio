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
import { MATERIAL, TYPE_DATA, TileType } from "../js_shared/dict";
import { MISC_SHARED } from "games/easter-eggventures/js_shared/dictShared";
import MaterialEaster from "games/easter-eggventures/js_shared/materialEaster";
import drawPawnsEaster from "games/easter-eggventures/js_shared/drawPawnsEaster";
import drawBackgroundEaster from "games/easter-eggventures/js_shared/drawBackgroundEaster";
import drawIllustrationEaster from "games/easter-eggventures/js_shared/drawIllustrationEaster";

export default class Tile extends MaterialEaster
{
    type: TileType;
    key: string;
    customData: Record<string,any>

    constructor(t:TileType, k:string, cd:Record<string,any> = {})
    {
        super();
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
            drawPawnsEaster(this, vis, group);
        } else if(this.type == TileType.EGG) {
            this.drawEggToken(vis, group);
        } else {
            drawBackgroundEaster(this, vis, group);
            drawIllustrationEaster(this, vis, group);
            this.drawSpecial(vis, group);
        }

        group.toCanvas(ctx);
        return ctx.canvas;
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

    drawSpecial(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // @TODO
    }
}