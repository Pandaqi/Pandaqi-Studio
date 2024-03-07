import drawBackgroundEaster from "games/easter-eggventures/js_shared/drawBackgroundEaster";
import drawIllustrationEaster from "games/easter-eggventures/js_shared/drawIllustrationEaster";
import drawPawnsEaster from "games/easter-eggventures/js_shared/drawPawnsEaster";
import MaterialEaster from "games/easter-eggventures/js_shared/materialEaster";
import createContext from "js/pq_games/layout/canvas/createContext";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { MATERIAL, TYPE_DATA, TileType } from "../js_shared/dict";
import drawEggToken from "games/easter-eggventures/js_shared/drawEggToken";
import Point from "js/pq_games/tools/geometry/point";

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
    getData() { return MATERIAL[this.type][this.key]; }
    needsText() { return false; }

    async draw(vis)
    {
        const ctx = createContext({ size: vis.size });
        const group = new ResourceGroup();

        if(this.type == TileType.PAWN) {
            drawPawnsEaster(this, vis, group);
        } else if(this.type == TileType.EGG) {
            drawEggToken(this, vis, group);
        } else if(this.type == TileType.OBSTACLE) {
            this.drawObstacle(vis, group);
        } else {
            this.drawRoom(vis, group);
        }

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawRoom(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // the actual room as background
        const data = this.getData();
        const res = vis.getResource(this.getTypeData().textureKey);
        const op = new LayoutOperation({
            translate: new Point(),
            dims: vis.size,
            frame: data.frame
        });

        group.add(res, op);
        
        // the actual spots to place stuff
        // @TODO
        const areas = data.areas;

        
    }

    drawObstacle(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const data = this.getData();
        const res = vis.getResource(this.getTypeData().textureKey);
        const obstacleDims = vis.get("tiles.objects.dims");
        const op = new LayoutOperation({
            translate: vis.center,
            dims: obstacleDims,
            frame: data.frame,
            pivot: Point.CENTER
        });
        group.add(res, op);
    }
}