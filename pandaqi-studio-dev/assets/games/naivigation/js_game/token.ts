import createContext from "js/pq_games/layout/canvas/createContext";
import { TokenType } from "../js_shared/dict";
import Visualizer from "./visualizer";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";

export default class Token
{
    type:TokenType
    key:string
    customData:Record<string,any>;
    
    constructor(t:TokenType, k:string = "")
    {
        this.type = t;
        this.key = k;
    }

    async draw(vis:Visualizer)
    {
        const ctx = createContext({ size: vis.size });
        const group = new ResourceGroup();
        
        this.drawBackground(vis, group, ctx);
        group.toCanvas(ctx);
        return ctx.canvas;
    }

    

    // @TODO: for TokenType.INSTRUCTION
    // place 2 of the same on the same "card"; this simplifies material generation without wasting space
    // They must be equally wide as the cards anyway
    
    drawBackground(vis:Visualizer, group: ResourceGroup, ctx)
    {
        
    }

}