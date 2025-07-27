import drawBackgroundEaster from "games/easter-eggventures/shared/drawBackgroundEaster";
import drawIllustrationEaster from "games/easter-eggventures/shared/drawIllustrationEaster";
import drawPawnsEaster from "games/easter-eggventures/shared/drawPawnsEaster";
import MaterialEaster from "games/easter-eggventures/shared/materialEaster";
import createContext from "js/pq_games/layout/canvas/createContext";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { MATERIAL, TYPE_DATA, TileType } from "../shared/dict";
import drawEggToken from "games/easter-eggventures/shared/drawEggToken";
import Point from "js/pq_games/tools/geometry/point";
import { Area } from "games/easter-eggventures/shared/dictShared";

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

    async draw(vis:MaterialVisualizer)
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
            pos: new Point(),
            size: vis.size,
            frame: data.frame,
            effects: vis.inkFriendlyEffect
        });

        group.add(res, op);
        
        // the actual spots to place stuff
        const areas = data.areas;
        for(const area of areas)
        {
            this.drawHidingSlot(area, vis, group);
        }
    }

    drawHidingSlot(areaData:Area, vis:MaterialVisualizer, group:ResourceGroup)
    {
        const posRel = areaData.pos.clone().div(1024.0);
        const posFinal = posRel.clone().scale(vis.size);
        const res = vis.getResource("objects");
        const op = new LayoutOperation({
            pos: posFinal,
            size: vis.get("tiles.rooms.hidingSlotDims"),
            pivot: Point.CENTER,
            frame: vis.get("tiles.rooms.hidingSlotFrame"),
            effects: vis.inkFriendlyEffect
        });
        group.add(res, op);
    }

    drawObstacle(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const data = this.getData();
        const res = vis.getResource(this.getTypeData().textureKey);
        const obstacleDims = vis.get("tiles.objects.size");
        const op = new LayoutOperation({
            pos: vis.center,
            size: obstacleDims,
            frame: data.frame,
            pivot: Point.CENTER,
            effects: vis.inkFriendlyEffect
        });
        group.add(res, op);
    }
}