import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import fillResourceGroup from "js/pq_games/layout/canvas/fillResourceGroup";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { CardType } from "../js_shared/dict";

export default class Card
{
    type:CardType
    key: string;
    num: number;
    requirements: string[];

    constructor(type:CardType, key:string = "")
    {
        this.type = type;
        this.key = key;
    }

    setNumber(n:number) { this.num = n; }
    setRequirements(reqs:string[]) { this.requirements = reqs; }

    async drawForRules(vis:MaterialVisualizer)
    {
        return this.draw(vis);
    }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        fillCanvas(ctx, "#FFFFFF");
        const group = new ResourceGroup();

        this.drawBackground(vis, group);
        this.drawMedicine(vis, group);
        this.drawPatient(vis, group);
        this.drawSpecial(vis, group);

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // @TODO
        // solid background color
        const col = "#462A00";
        fillResourceGroup(vis.size, group, col);
    }

    drawMedicine(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // @TODO
    }

    drawPatient(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // @TODO
    }

    drawSpecial(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // @TODO
    }
}