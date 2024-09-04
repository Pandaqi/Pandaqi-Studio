import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { ANIMALS } from "../../lucky-lions/js_shared/dict";
import { AnimalType, DAWN_ACTIONS, ROOSTER_CHANGES } from "../js_shared/dict";

export default class Card
{
    animal:AnimalType;
    strengths:AnimalType[];
    key1:string; // only used for special Rooster actions
    key2:string;

    constructor(a:AnimalType = AnimalType.DRAGON, s:AnimalType[] = [], k1:string = "", k2:string = "")
    {
        this.animal = a;
        this.strengths = s;
        this.key1 = k1;
        this.key2 = k2;
    }

    getData()
    {
        return ANIMALS[this.animal] ?? {};
    }

    getActionData()
    {
        if(this.animal == AnimalType.ROOSTER) 
        { 
            return {
                overall: DAWN_ACTIONS[this.key1],
                action: ROOSTER_CHANGES[this.key2]
            }; 
        }
        return this.getData();
    }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        fillCanvas(ctx, "#FFFFFF");

        const group = new ResourceGroup();
        this.drawBackground(vis, group);
        this.drawMain(vis, group);
        this.drawAction(vis, group);

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // @TODO: some background color, texture, random martial arts decos
    }

    drawMain(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // @TODO: main illustration of card
    }

    drawAction(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const data = this.getActionData();
        // @TODO: write action text
        // @TODO: add "dawn" icon on Rooster cards + add "communicate" icon on Parrot cards
        // @TODO: on Rooster cards, we draw 2 sets of text (overall action + what Rooster does), and second part starts with "<i>Rooster Change:</i> "
    }
}