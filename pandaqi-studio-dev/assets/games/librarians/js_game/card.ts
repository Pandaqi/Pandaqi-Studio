import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { CardType } from "../js_shared/dict";

export default class Card
{
    type:CardType
    genre:string
    author:string
    action:string
    age:string

    constructor(type:CardType, genre:string, action:string, author:string, age: string)
    {
        this.type = type;
        this.genre = genre;
        this.action = action;
        this.author = author;
        this.age = age;
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

        // @TODO

        group.toCanvas(ctx);
        return ctx.canvas;
    }

}