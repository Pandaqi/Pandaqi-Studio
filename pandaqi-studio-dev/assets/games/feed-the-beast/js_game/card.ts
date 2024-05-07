import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import fillResourceGroup from "js/pq_games/layout/canvas/fillResourceGroup";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { CARD_TEMPLATES, MaterialType, Recipe } from "../js_shared/dict";

export default class Card
{
    type: MaterialType
    key: string
    recipes: Recipe[] = []

    constructor(type:MaterialType, key:string = "")
    {
        this.type = type;
        this.key = key;
    }

    getRecipes() { return this.recipes.slice(); }
    countRecipes() { return this.recipes.length; }
    addRecipe(cost:string|string[], actionKey = "")
    {
        const finalCost = Array.isArray(cost) ? cost : [cost];
        this.recipes.push({ cost: finalCost, reward: actionKey });
    }

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
        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // solid background color
        const col = "#FFFFFF";
        fillResourceGroup(vis.size, group, col);

        // fixed template for card (which does most of the work)
        const templateData = CARD_TEMPLATES[this.type];
        if(templateData)
        {
            const resTemplate = vis.getResource("card_templates");
            const opTemplate = new LayoutOperation({
                dims: vis.size,
                frame: templateData.frame
            });
            group.add(resTemplate, opTemplate);
        }

    }
}