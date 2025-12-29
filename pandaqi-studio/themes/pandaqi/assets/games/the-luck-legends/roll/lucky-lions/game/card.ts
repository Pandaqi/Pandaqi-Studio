
import { shuffle, MaterialVisualizer, createContext, fillCanvas, ResourceGroup, fillResourceGroup, LayoutOperation, InvertEffect, Vector2, DropShadowEffect, TextConfig, ResourceText } from "lib/pq-games";
import { ANIMALS, AnimalType, CardType, MISC, TEMPLATES, ZOO_CARDS } from "../shared/dict";

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
            size: vis.size,
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
        const invertEffect = vis.inkFriendly ? new InvertEffect() : [];
        const opCycle = new LayoutOperation({
            pos: circleCenter,
            size: vis.get("cards.cycle.size"),
            rot: startingAngle,
            frame: frame,
            pivot: Vector2.CENTER,
            effects: [vis.inkFriendlyEffect, invertEffect].flat(),
            alpha: data.hideCycle ? 0.2 : 1.0,
        })
        group.add(resMisc, opCycle);

        if(!data.hideCycle)
        {  
            // the animals within it
            const radius = vis.get("cards.cycle.animalRadius");
            const iconDims = vis.get("cards.cycle.iconDims");
            const glowEffect = vis.inkFriendly ? [] : new DropShadowEffect({ color: "#FFFFFF", blurRadius: 0.1*iconDims.x });

            for(let i = 0; i < num; i++)
            {
                const angle = startingAngle + (i/num) * 2 * Math.PI;
                const circleOffset = new Vector2(Math.cos(angle) * radius, Math.sin(angle) * radius);
                const pos = circleCenter.clone().add( circleOffset );
                const opAnimal = new LayoutOperation({
                    pos: pos,
                    size: iconDims,
                    rot: vis.get("cards.cycle.rotateAnimals") ? angle : 0,
                    frame: ANIMALS[this.cycle[i]].frame,
                    pivot: Vector2.CENTER,
                    effects: [vis.inkFriendlyEffect, glowEffect].flat()
                })
                group.add(resAnimal, opAnimal);
            }
        }

        // the people icon
        if(this.peopleIcon)
        {
            const opPeople = new LayoutOperation({
                pos: circleCenter,
                size: vis.get("cards.cycle.peopleIconDims"),
                pivot: Vector2.CENTER,
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
            pos: vis.get("cards.score.textBoxPos"),
            size: new Vector2(2.0 * textConfig.size),
            pivot: Vector2.CENTER,
            fill: vis.inkFriendly ? "#111111" : vis.get("cards.score.textColor")
        });
        group.add(resText, opText);

        // optional text box with special power inside
        const zooPower = this.getZooPower();
        if(zooPower)
        {
            const opTextBox = new LayoutOperation({
                pos: vis.get("cards.power.textBoxPos"),
                size: vis.get("cards.power.textBoxDims"),
                pivot: Vector2.CENTER,
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
                pos: vis.get("cards.power.textBoxPos"),
                size: vis.get("cards.power.textDims"),
                pivot: Vector2.CENTER,
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
            size: vis.size,
            frame: TEMPLATES.animal.frame,
            effects: vis.inkFriendlyEffect
        });
        group.add(resBG, opBG);

        // the animal itself
        const resAnimal = vis.getResource("animals");
        const iconDims = vis.get("cards.animal.iconDims");
        const shadowEffect = vis.inkFriendly ? [] : new DropShadowEffect({ color: "#000000", blurRadius: 0.1*iconDims.x });
        const opAnimal = new LayoutOperation({
            pos: vis.get("cards.animal.iconPos"),
            size: iconDims,
            pivot: Vector2.CENTER,
            frame: data.frame,
            effects: [vis.inkFriendlyEffect, shadowEffect].flat()
        });
        group.add(resAnimal, opAnimal);

        // optional special powers
        if(this.specialPowers)
        {
            const resMisc = vis.getResource("misc");
            const opTextBox = new LayoutOperation({
                pos: vis.get("cards.power.textBoxPos"),
                size: vis.get("cards.power.textBoxDims"),
                pivot: Vector2.CENTER,
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
                pos: vis.get("cards.power.textBoxPos"),
                size: vis.get("cards.power.textBoxDims"),
                pivot: Vector2.CENTER,
                fill: vis.inkFriendly ? "#FFFFFF" : "#000000"
            });
            group.add(resText, opText);
        } 
    }

    placeTexture(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const resTemp = vis.getResource("card_templates");
        const opTex = new LayoutOperation({
            pos: vis.center,
            size: vis.size,
            flipX: Math.random() <= 0.5,
            flipY: Math.random() <= 0.5,
            pivot: Vector2.CENTER,
            composite: "overlay",
            alpha: vis.get("cards.backgroundTextureAlpha"),
            frame: TEMPLATES.texture.frame,
        })
        group.add(resTemp, opTex);
    }

    getDistanceBetween(a:AnimalType, b:AnimalType)
    {
        let idxA = this.cycle.indexOf(a);
        let idxB = this.cycle.indexOf(b);
        if(idxA < 0) { return 0; }
        if(idxB < 0) { return this.cycle.length; } // just some high number to say "if other one isn't present on cycle, I awlays"

        if(idxA < idxB) { return idxB - idxA; }
        return idxB + this.cycle.length - idxA;
    }
}