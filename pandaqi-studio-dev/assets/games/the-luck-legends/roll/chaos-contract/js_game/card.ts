import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { CARD_ACTIONS, CardType } from "../js_shared/dict";
import Contract from "./contracts/contract";
import fromArray from "js/pq_games/tools/random/fromArray";

export default class Card
{
    type: CardType
    contract: Contract
    num: number = -1;
    action: string = "";
    actionText: string = "";
    specialType:string = ""; // only for wildcard / duo dice cards

    constructor(type:CardType)
    {
        this.type = type;
    }

    setContract(c:Contract) { this.contract = c; }
    setDiceData(n:number, a:string)
    {
        this.num = n;
        this.action = a;
        
        if(this.hasAction())
        {
            let str = CARD_ACTIONS[this.action].desc; 
            str = str.replace("%numlow%", fromArray([1,2]).toString());
            str = str.replace("%numhigh%", fromArray([5,6]).toString());
            str = str.replace("%rank%", fromArray(["lowest", "highest"]));
            this.actionText = str;
        }
    }

    hasAction()
    {
        return this.action != "";
    }

    setSpecialType(st:string)
    {
        this.specialType = st;
    }

    isSpecialType()
    {
        return this.specialType != "";
    }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        fillCanvas(ctx, "#FFFFFF");

        const group = new ResourceGroup();
        if(this.type == CardType.DICE) {
            this.drawBackground(vis, group);
            this.drawNumbers(vis, group);
            this.drawAction(vis, group);
        } else if(this.type == CardType.CONTRACT) {
            this.drawContract(vis, group);
        }

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    getOtherNumber()
    {
        const options = [1,2,3,4,5,6]
        options.splice(options.indexOf(this.num), 1);
        return fromArray(options);
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // @TODO
    }

    drawNumbers(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // @TODO   
        // If specialType == wildcard, draw no numbers but a general "wildcard" icon or question mark
        // If specialType == duo, switch half the numbers for a `const numB = this.getOtherNumber()` and display some duo icon
    }

    drawAction(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(this.isSpecialType()) { return; }
        // @TODO => use `this.actionText`; it has the final string with values dynamically filled in
    }

    drawContract(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // @TODO => we can simply get all final strings from `contract.property.toString()`
        // @TODO: display stars = difficulty of contract (use `contract.getStars()`)
        // @TODO: display BATTLE or FORCED, if needed
            // If FORCED, display contract.minTurnout
        // @TODO: display reward/penalty (green/red zone top/bottom?) using `contract.rewards` and `contract.penalties` arrays
    }
}