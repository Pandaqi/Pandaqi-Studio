import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { ANIMALS, AnimalType, CardType, MISC, TEMPLATES, ZOO_CARDS } from "../js_shared/dict";
import shuffle from "js/pq_games/tools/random/shuffle";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import Point from "js/pq_games/tools/geometry/point";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig from "js/pq_games/layout/text/textConfig";
import InvertEffect from "js/pq_games/layout/effects/invertEffect";
import fillResourceGroup from "js/pq_games/layout/canvas/fillResourceGroup";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";

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
        // background
        const data = this.getData();
        if(!vis.inkFriendly)
        {
            fillResourceGroup(vis.size, group, vis.get("cards.zooBackgroundColor"));
            this.placeTexture(vis, group);
        }

        const resBG = vis.getResource("card_templates");
        const opBG = new LayoutOperation({
            dims: vis.size,
            frame: TEMPLATES.zoo.frame,
            effects: vis.inkFriendlyEffect
        });
        group.add(resBG, opBG);

        // the all-important cycle + animals on it
        const resMisc = vis.getResource("misc");
        const resAnimal = vis.getResource("animals");

        // the cycle itself
        const startingAngle = vis.get("cards.cycle.startingAngle");
        const num = Math.max(this.cycle.length, 2);
        const frame = MISC["cycle_" + num].frame;
        const circleCenter = vis.get("cards.cycle.pos");
        const opCycle = new LayoutOperation({
            translate: circleCenter,
            dims: vis.get("cards.cycle.dims"),
            rotation: startingAngle,
            frame: frame,
            pivot: Point.CENTER,
            effects: vis.inkFriendlyEffect,
            alpha: data.hideCycle ? 0.2 : 1.0,
        })
        group.add(resMisc, opCycle);

        if(!data.hideCycle)
        {  
            // the animals within it
            const radius = vis.get("cards.cycle.animalRadius");
            const iconDims = vis.get("cards.cycle.iconDims");
            const glowEffect = new DropShadowEffect({ color: "#FFFFFF", blurRadius: 0.1*iconDims.x });

            for(let i = 0; i < num; i++)
            {
                const angle = startingAngle + (i/num) * 2 * Math.PI;
                const circleOffset = new Point(Math.cos(angle) * radius, Math.sin(angle) * radius);
                const pos = circleCenter.clone().add( circleOffset );
                const opAnimal = new LayoutOperation({
                    translate: pos,
                    dims: iconDims,
                    rotation: vis.get("cards.cycle.rotateAnimals") ? angle : 0,
                    frame: ANIMALS[this.cycle[i]].frame,
                    pivot: Point.CENTER,
                    effects: [vis.inkFriendlyEffect, glowEffect].flat()
                })
                group.add(resAnimal, opAnimal);
            }
        }

        // the people icon
        if(this.peopleIcon)
        {
            const opPeople = new LayoutOperation({
                translate: circleCenter,
                dims: vis.get("cards.cycle.peopleIconDims"),
                pivot: Point.CENTER,
                frame: MISC.people_icon.frame,
                effects: vis.inkFriendlyEffect
            });
            group.add(resMisc, opPeople);
        }

        // score
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.score.fontSize")
        }).alignCenter();
        const resText = new ResourceText({ text: this.scoreValue.toString(), textConfig: textConfig });
        const opText = new LayoutOperation({
            translate: vis.get("cards.score.textBoxPos"),
            dims: new Point(2.0 * textConfig.size),
            pivot: Point.CENTER,
            fill: vis.inkFriendly ? "#111111" : vis.get("cards.score.textColor")
        });
        group.add(resText, opText);

        // optional text box with special power inside
        const zooPower = this.getZooPower();
        if(zooPower)
        {
            const opTextBox = new LayoutOperation({
                translate: vis.get("cards.power.textBoxPos"),
                dims: vis.get("cards.power.textBoxDims"),
                pivot: Point.CENTER,
                frame: MISC.textbox_zoo.frame,
                effects: vis.inkFriendlyEffect
            });
            group.add(resMisc, opTextBox);

            const textConfig = new TextConfig({
                font: vis.get("fonts.body"),
                size: vis.get("cards.power.fontSize")
            }).alignCenter();
            const resText = new ResourceText({ text: zooPower, textConfig: textConfig });
            const opText = new LayoutOperation({
                translate: vis.get("cards.power.textBoxPos"),
                dims: vis.get("cards.power.textDims"),
                pivot: Point.CENTER,
                fill: vis.inkFriendly ? "#FFFFFF" : vis.get("cards.power.textColor")
            });
            group.add(resText, opText);
        }
    }

    drawAnimalCard(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // background
        const data = this.getData();
        if(!vis.inkFriendly)
        {
            fillResourceGroup(vis.size, group, vis.get("cards.animalBackgroundColor"));
            this.placeTexture(vis, group);
        }

        const resBG = vis.getResource("card_templates");
        const opBG = new LayoutOperation({
            dims: vis.size,
            frame: TEMPLATES.animal.frame,
            effects: vis.inkFriendlyEffect
        });
        group.add(resBG, opBG);

        // the animal itself
        const resAnimal = vis.getResource("animals");
        const iconDims = vis.get("cards.animal.iconDims");
        const shadowEffect = new DropShadowEffect({ color: "#000000", blurRadius: 0.1*iconDims.x });
        const opAnimal = new LayoutOperation({
            translate: vis.get("cards.animal.iconPos"),
            dims: iconDims,
            pivot: Point.CENTER,
            frame: data.frame,
            effects: [vis.inkFriendlyEffect, shadowEffect].flat()
        });
        group.add(resAnimal, opAnimal);

        // optional special powers
        if(this.specialPowers)
        {
            const resMisc = vis.getResource("misc");
            const opTextBox = new LayoutOperation({
                translate: vis.get("cards.power.textBoxPos"),
                dims: vis.get("cards.power.textBoxDims"),
                pivot: Point.CENTER,
                frame: MISC.textbox_animal.frame,
                effects: vis.inkFriendlyEffect
            });
            group.add(resMisc, opTextBox);

            const textConfig = new TextConfig({
                font: vis.get("fonts.body"),
                size: vis.get("cards.power.fontSize")
            }).alignCenter();
            const resText = new ResourceText({ text: data.desc, textConfig: textConfig });
            const opText = new LayoutOperation({
                translate: vis.get("cards.power.textBoxPos"),
                dims: vis.get("cards.power.textBoxDims"),
                pivot: Point.CENTER,
                fill: vis.inkFriendly ? "#FFFFFF" : "#000000"
            });
            group.add(resText, opText);
        } 
    }

    placeTexture(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const resTemp = vis.getResource("card_templates");
        const opTex = new LayoutOperation({
            translate: vis.center,
            dims: vis.size,
            flipX: Math.random() <= 0.5,
            flipY: Math.random() <= 0.5,
            pivot: Point.CENTER,
            composite: "overlay",
            alpha: vis.get("cards.backgroundTextureAlpha"),
            frame: TEMPLATES.texture.frame,
        })
        group.add(resTemp, opTex);
    }
}