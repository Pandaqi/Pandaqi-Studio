import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { CardType } from "../js_shared/dict";

export default class Card
{
    type: CardType;
    key: string;
    pakjesWanted: string[];
    set: string;

    constructor(type:CardType, key:string, set:string = "base")
    {
        this.type = type;
        this.key = key;
        this.set = set;
        this.pakjesWanted = [];
    }

    addPakje(p:string)
    {
        this.pakjesWanted.push(p);
    }

    async draw(vis:MaterialVisualizer)
    {
        const group = vis.renderer.prepareDraw();
        // @TODO
        // @TODO: only display action text on pakje cards if set != base
        return vis.renderer.finishDraw(group);
    }

    drawPawn(vis:MaterialVisualizer, group:ResourceGroup)
    {
        
    }
}