import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import shuffle from "js/pq_games/tools/random/shuffle";
import { CardDisplayType, CardType, ColorType, DYNAMIC_STRINGS, FINISH_REQUIREMENTS, RULE_CARDS, ShapeType } from "../js_shared/dict";

export default class Card
{
    type: CardType;
    
    displayType:CardDisplayType;
    symbols:ShapeType[];
    colors:ColorType[];

    action:string;
    actionString:string;
    finishReq:string;
    finishReqString: string;

    constructor(type:CardType)
    {
        this.type = type;
    }

    getNumber() { return this.symbols.length; }
    setRegularProperties(dt:CardDisplayType, symbols:ShapeType[], cols:ColorType[])
    {
        this.displayType = dt;
        this.symbols = symbols;
        this.colors = cols;
    }

    getActionData() { return RULE_CARDS[this.action] ?? {}; }
    getFinishReqData() { return FINISH_REQUIREMENTS[this.finishReq] ?? {}; }
    setRuleProperties(actionKey:string, finishReq:string)
    {
        this.action = actionKey;
        this.actionString = this.replaceDynamicStrings(this.getActionData().desc);

        this.finishReq = finishReq;
        this.finishReqString = this.replaceDynamicStrings(this.getFinishReqData().desc);
    }

    replaceDynamicStrings(str:string)
    {
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

        return str;
    }

    async draw(vis:MaterialVisualizer)
    {
        const group = vis.renderer.prepareDraw();
        // @TODO
        // @TODO: regular card => display symbols in some random configuration (match shapes and colors by index)
        // @TODO: rules card => remember the final action is in `this.actionString` and final finishReqs in `this.finishReqString`
        return vis.renderer.finishDraw(group);
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        
    }

    drawSymbol(vis:MaterialVisualizer, group:ResourceGroup)
    {
        
    }
}