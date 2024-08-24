import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { ANIMALS, AnimalType, CardType, ZOO_CARDS } from "../js_shared/dict";
import shuffle from "js/pq_games/tools/random/shuffle";

export default class Card
{
    type:CardType;
    key:string;
    cycle: AnimalType[] = null;

    peopleIcon:boolean = false;
    specialPowers:boolean = false;
    scoreValue:number = 0;

    constructor(type:CardType, key:string = "")
    {
        this.type = type;
        this.key = key;
    }

    getData()
    {
        if(this.type == CardType.ZOO) {
            return ZOO_CARDS[this.key] ?? {};
        }
        return ANIMALS[this.key] ?? {};
    }

    getZooPower()
    {
        let desc = this.getData().desc;
        if(!desc) { return null; }

        const allAnimals = Object.keys(ANIMALS);
        shuffle(allAnimals);

        desc = desc.replace("%animal%", allAnimals.pop());
        desc = desc.replace("%animal%", allAnimals.pop());
        desc = desc.replace("%cyclesize%", this.cycle.length);
        return desc;
    }

    setCycle(c:AnimalType[])
    {
        this.cycle = shuffle(c);
    }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        fillCanvas(ctx, "#FFFFFF");

        const group = new ResourceGroup();

        if(this.type == CardType.ZOO) {
            this.drawZooCard(vis, group);
        } else if(this.type == CardType.ANIMAL) {
            this.drawAnimalCard(vis, group);
        }

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawZooCard(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // @TODO: draw background
        // @TODO: the cycle sprite with the right number of gaps (those are just baked in; far easier than drawing circular arrows in code)
        // @TODO: place animal sprites (from this.cycle) at the gap positions
        //  => if data.hideCycle = true, don't do any of that, display cycle_hidden from MISC
        // @TODO: display scoreValue
        // @TODO: if peopleIcon = true, draw that icon
        // @TODO: call this.getZooPower(); if available, display
    }

    drawAnimalCard(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // @TODO: just draw background + animal big in center
        // @TODO: if specialPowers = true, display data.desc
    }
    

}