import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { CardType, Color, DYNAMIC_STRINGS, SPECIAL_ACTIONS, Shape } from "../js_shared/dict";
import shuffle from "js/pq_games/tools/random/shuffle";

export default class Card
{
    type: CardType;
    shape: Shape;
    number: number;
    color: Color;
    ranking: string[];
    action: string = "";
    actionString: string = "";

    constructor(type:CardType, shp:Shape, num:number, col = Color.RED)
    {
        this.type = type;
        this.shape = shp;
        this.number = num;
        this.color = col;
    }

    hasSpecialAction()
    {
        return this.type == CardType.SPECIAL && this.action != "";
    }
    getActionData() { return SPECIAL_ACTIONS[this.action]; }
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

    async draw(vis:MaterialVisualizer)
    {
        const group = vis.renderer.prepareDraw();
        // @TODO
        // @TODO: remember our final actionText is in `this.actionString`
        // @TODO: remember to display the `this.ranking` on every card! Almost forgot!
        return vis.renderer.finishDraw(group);
    }

    drawMovementCard(vis:MaterialVisualizer, group:ResourceGroup)
    {
        
    }
}