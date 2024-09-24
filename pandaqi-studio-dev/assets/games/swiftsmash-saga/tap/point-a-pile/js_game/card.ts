import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { CardType, ColorType, DYNAMIC_STRINGS, MATERIAL } from "../js_shared/dict";
import shuffle from "js/pq_games/tools/random/shuffle";

export default class Card
{
    type: CardType;
    action: string;
    actionString: string;
    color: ColorType;

    constructor(type:CardType)
    {
        this.type = type;
    }

    setColor(c:ColorType)
    {
        this.color = c;
    }

    setAction(key:string)
    {
        this.action = key;

        let str = this.getActionData().desc;
        const replacements = structuredClone(DYNAMIC_STRINGS);
        
        let replacedSomething = true;
        while(replacedSomething)
        {
            replacedSomething = false;

            for(const [needle,options] of Object.entries(replacements))
            {
                if(!str.includes(needle)) { continue; }

                const option = shuffle(options).pop().toString();
                str = str.replace(needle, option);
                replacedSomething = true;
            }
        }

        this.actionString = str;
    }

    getActionData()
    {
        return MATERIAL[this.type][this.action] ?? {};
    }

    hasSpecialAction()
    {
        return Object.keys(this.getActionData()).length > 0;
    }

    async draw(vis:MaterialVisualizer)
    {
        const group = vis.renderer.prepareDraw();
        // @TODO
        // @TODO: remember the final action is in `this.actionString`
        return vis.renderer.finishDraw(group);
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        
    }

    drawSymbol(vis:MaterialVisualizer, group:ResourceGroup)
    {
        
    }

    drawAction(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.hasSpecialAction()) { return; }
    }
}