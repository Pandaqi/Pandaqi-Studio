import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { DinoType, DominoType, TerrainType } from "../js_shared/dict";
import DominoSide from "./dominoSide";

export default class Domino
{
    type:DominoType;
    pawnIndex:number = -1; // just a quick hack to also reuse this class for drawing the pawns/claim cubes
    sides:{ top:DominoSide, bottom:DominoSide }

    constructor(type:DominoType)
    {
        this.type = type;
        this.sides = { top: new DominoSide(), bottom: new DominoSide() };
    }

    setPawnIndex(i:number)
    {
        this.pawnIndex = i;
    }

    setTerrains(a:TerrainType, b:TerrainType)
    {
        this.sides.top.setTerrain(a);
        this.sides.bottom.setTerrain(b);
    }

    setDinosaurs(a:DinoType, b:DinoType)
    {
        this.sides.top.setDinosaur(a);
        this.sides.bottom.setDinosaur(b)
    }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        fillCanvas(ctx, "#FFFFFF");
        const group = new ResourceGroup();

        // @TODO

        group.toCanvas(ctx);
        return ctx.canvas;
    }

}