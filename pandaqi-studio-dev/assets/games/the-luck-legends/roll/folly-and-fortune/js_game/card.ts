import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import fromArray from "js/pq_games/tools/random/fromArray";
import { ACTIONS, ACTION_PREFIXES, ACTION_REPLACEMENTS, ActionType } from "../js_shared/dict";

export default class Card
{
    num:number;
    health:number;
    keys:string[];
    actions:string[];
    shield:boolean;
    arrowRight:boolean;

    constructor(num:number, health:number, keys:string[])
    {
        this.num = num;
        this.health = health;
        this.arrowRight = Math.random() <= 0.5;
        this.keys = keys;

        this.fillInDynamicStrings();
    }

    fillInDynamicStrings()
    {
        this.actions = [];
        for(const key of this.keys)
        {
            const data = ACTIONS[key];
            let desc = data.desc;
            for(const [needle,options] of Object.entries(ACTION_REPLACEMENTS))
            {
                desc = desc.replace(needle, fromArray(options));
            }

            const prefix = ACTION_PREFIXES[data.type ?? ActionType.STOPPED];
            this.actions.push("<b>" + prefix + "</b>: " + desc);

            if(data.shield) { this.shield = true; }
        }
    }

    getFullActionString()
    {
        return this.actions.join("\n\n");
    }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        fillCanvas(ctx, "#FFFFFF");

        const group = new ResourceGroup();
        this.drawBackground(vis, group);
        this.drawNumbers(vis, group);
        this.drawSpecial(vis, group);

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // @TODO: draw background
        // @TODO: draw subtle arrow on left or right side (depending on `arrowRight`)
    }

    drawNumbers(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // @TODO: draw number of card + health of card (on opposite side, vertically or horizontally)
        
    }

    drawSpecial(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const action = this.getFullActionString();
        
        // @TODO: print action string + display unique icon for it (if I even do that/it fits)
        // @TODO: draw a shield marker + add "(Rotate sideways to remember this.)" if `shield` true
    }
}