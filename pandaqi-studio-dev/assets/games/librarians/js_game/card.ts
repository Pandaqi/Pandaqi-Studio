import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { CardType } from "../js_shared/dict";

export default class Card
{
    type:CardType
    title:string
    genre:string
    author:string
    age:string
    series:number // @NOTE: this is only > 0 if it's part of a series (in which case it's the precise index)
    action:string // @NOTE: this is only for the custom action cards; otherwise, action is taken from genre directly

    constructor(type:CardType = CardType.BOOK, title:string = "", genre:string = "", author:string = "", age: string = "", series:number = 0, action:string = "")
    {
        this.type = type;
        this.title = title;
        this.genre = genre;
        this.author = author;
        this.age = age;
        this.series = series;
        this.action = action;
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

        // Don't forget: if series > 0, append that number to title on drawing

        group.toCanvas(ctx);
        return ctx.canvas;
    }

}