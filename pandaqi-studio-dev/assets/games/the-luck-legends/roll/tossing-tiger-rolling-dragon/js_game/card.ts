import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { AnimalType, DAWN_ACTIONS, MISC, MOVES, ROOSTER_CHANGES, TEMPLATES } from "../js_shared/dict";
import Point from "js/pq_games/tools/geometry/point";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import InvertEffect from "js/pq_games/layout/effects/invertEffect";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig from "js/pq_games/layout/text/textConfig";
import getPositionsCenteredAround from "js/pq_games/tools/geometry/paths/getPositionsCenteredAround";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import Circle from "js/pq_games/tools/geometry/circle";

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

    getData(animal:AnimalType = this.animal)
    {
        return MOVES[animal] ?? {};
    }

    getActionData()
    {
        return this.getData();
    }

    getRoosterActionData()
    {
        if(!this.isRooster()) { return {}; }
        return {
            overall: DAWN_ACTIONS[this.key1],
            action: ROOSTER_CHANGES[this.key2]
        }; 
    }

    isRooster()
    {
        return this.animal == AnimalType.ROOSTER;
    }

    getTintColor(vis:MaterialVisualizer, animal:AnimalType = this.animal)
    {
        if(vis.inkFriendly) { return this.getData(animal).dark ? "#333333" : "#FFFFFF"; }
        return this.getData(animal).color;
    }

    // if true, this animal needs a dark background
    isDark(animal = this.animal)
    {
        return this.getData(animal).dark;
    }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        fillCanvas(ctx, this.getTintColor(vis));

        const group = new ResourceGroup();
        this.drawBackground(vis, group);
        this.drawMain(vis, group);
        this.drawStrengths(vis, group);
        this.drawAction(vis, group);

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // the bamboo at the bottom
        const resTemp = vis.getResource("card_templates");
        const opBamboo = new LayoutOperation({
            dims: vis.size,
            composite: "multiply",
            alpha: vis.get("cards.bg.bambooAlpha"),
            frame: TEMPLATES.bamboo.frame,
        })
        group.add(resTemp, opBamboo);

        // the patterns at the edge
        const patternComp = this.isDark() ? "overlay" : "luminosity"
        const opPatterns = new LayoutOperation({
            dims: vis.size,
            composite: patternComp,
            alpha: vis.get("cards.bg.patternsAlpha"),
            frame: TEMPLATES.patterns.frame,
        })
        group.add(resTemp, opPatterns);

        // paper texture
        const opTexture = new LayoutOperation({
            dims: vis.size,
            composite: "overlay",
            alpha: vis.get("cards.bg.textureAlpha"),
            frame: TEMPLATES.texture.frame,
        })
        group.add(resTemp, opTexture);

        // border outline
        const outlineEffects = this.isDark() ? [new InvertEffect()] : [];
        const opOutline = new LayoutOperation({
            dims: vis.size,
            composite: "overlay",
            alpha: vis.get("cards.bg.outlineAlpha"),
            frame: TEMPLATES.outline.frame,
            effects: outlineEffects
        })
        group.add(resTemp, opOutline);

        // spiral rays
        const opSpiral = new LayoutOperation({
            dims: vis.size,
            composite: "overlay",
            alpha: vis.get("cards.bg.spiralAlpha"),
            frame: TEMPLATES.spiral.frame,
        })
        group.add(resTemp, opSpiral);

        // cherry blossoms
        const opBlossom = new LayoutOperation({
            dims: vis.size,
            composite: "luminosity",
            alpha: vis.get("cards.bg.blossomAlpha"),
            frame: TEMPLATES.cherry_blossom.frame,
        })
        group.add(resTemp, opBlossom);
    }

    drawMain(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // main illustration of card
        const shadowColor = this.isDark() ? "#000000" : "#FFFFFF";
        const shadowEffect = new DropShadowEffect({ color: shadowColor, blurRadius: vis.get("cards.main.shadowBlur") }); 

        const textureKey = vis.get("cards.main.useSimplified") ? "animals_simplified" : "animals";
        const res = vis.getResource(textureKey);
        const op = new LayoutOperation({
            translate: vis.get("cards.main.pos"),
            dims: vis.get("cards.main.dims"),
            pivot: Point.CENTER,
            effects: [vis.inkFriendlyEffect, shadowEffect].flat()
        })
        group.add(res, op);
    }

    drawStrengths(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(this.strengths.length <= 0) { return; }

        const textureKey = vis.get("cards.strengths.useSimplified") ? "animals_simplified" : "animals";
        const res = vis.getResource(textureKey);
        const resMisc = vis.getResource("misc");

        const dims = vis.get("cards.strengths.iconDims");
        const dimsAnimal = vis.get("cards.strengths.iconAnimalDims");
        const anchorOffset = vis.get("cards.strengths.anchorPos");
        let anchorPos = anchorOffset;
        if(vis.get("cards.strengths.placeAtBottom"))
        {
            anchorPos = new Point(anchorOffset.x, vis.size.y - anchorOffset.y)
        }

        const positions = getPositionsCenteredAround({
            pos: anchorPos,
            dims: dims,
            num: this.strengths.length
        })

        const effects = this.isDark() ? [] : [new InvertEffect()];
        for(let i = 0; i < positions.length; i++)
        {
            const pos = positions[i];

            // the colored circle
            const circ = new ResourceShape(new Circle({
                center: pos, 
                radius: 0.45*dims.x
            }));
            const opCirc = new LayoutOperation({
                fill: this.getTintColor(vis, this.strengths[i])
            })
            group.add(circ, opCirc);

            // the box behind the animal
            const opBox = new LayoutOperation({
                translate: pos,
                dims: dims,
                pivot: Point.CENTER,
                frame: MISC.strength_circle.frame,
                effects: effects
            })
            group.add(resMisc, opBox);

            // the animal itself
            const shadowColor = this.isDark() ? "#000000" : "#FFFFFF";
            const shadowEffect = new DropShadowEffect({ color: shadowColor, blurRadius: vis.get("cards.strengths.shadowBlur") }); 

            const opAnimal = new LayoutOperation({
                translate: pos,
                dims: dimsAnimal,
                effects: [vis.inkFriendlyEffect, shadowEffect].flat()
            });
            group.add(res, opAnimal);
        }
    }

    drawAction(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const data = this.getActionData();

        // add heading (box + text)
        const resMisc = vis.getResource("misc");
        const effectsHeading = this.isDark() ? [] : [new InvertEffect()];
        const textColorHeading = this.isDark() ? "#000000" : "#FFFFFF";
        const posHeading = this.isRooster() ? vis.get("cards.action.heading.posRooster") : vis.get("cards.action.heading.pos")
        const opHeadingBox = new LayoutOperation({
            translate: posHeading,
            dims: vis.get("cards.action.heading.dims"),
            frame: MISC.heading_box.frame,
            effects: effectsHeading
        })
        group.add(resMisc, opHeadingBox);

        const textConfigHeading = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.action.heading.fontSize")
        }).alignCenter();
        const resTextHeading = new ResourceText({ text: this.animal, textConfig: textConfigHeading });
        const opTextHeading = new LayoutOperation({
            translate: opHeadingBox.translate,
            dims: opHeadingBox.dims,
            pivot: Point.CENTER,
            fill: textColorHeading
        })
        group.add(resTextHeading, opTextHeading);

        // add action (box + text)
        const effects = this.isDark() ? [new InvertEffect()] : []; // precisely inverse from heading
        const textColor = this.isDark() ? "#FFFFFF" : "#000000";
        const opBox = new LayoutOperation({
            translate: vis.get("cards.action.pos"),
            dims: vis.get("cards.action.dims"),
            frame: MISC.text_box.frame,
            effects: effects,
            composite: "overlay"
        })
        group.add(resMisc, opBox);

        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("cards.action.fontSize")
        }).alignCenter();

        const strMain = this.isRooster() ? this.getRoosterActionData().overall.desc : data.desc;
        const resText = new ResourceText({ text: strMain, textConfig: textConfig });
        const opText = new LayoutOperation({
            translate: opBox.translate,
            dims: opBox.dims,
            pivot: Point.CENTER,
            fill: textColor
        })
        group.add(resText, opText);

        // on Rooster cards, we push the HEADING to the bottom of the card
        // so we have space for two action texts above it
        if(this.isRooster())
        {
            // @TODO: might need to shrink the rooster icon itself if it looks weird with overlap now
            // add this second text box (we use ACTION here, and OVERALL on the default one)
            const effects = this.isDark() ? [new InvertEffect()] : []; 
            const textColor = this.isDark() ? "#FFFFFF" : "#000000";
            const opBox = new LayoutOperation({
                translate: vis.get("cards.action.posRooster"),
                dims: vis.get("cards.action.dims"),
                frame: MISC.text_box.frame,
                effects: effects,
                composite: "overlay"
            })
            group.add(resMisc, opBox);

            const textConfig = new TextConfig({
                font: vis.get("fonts.body"),
                size: vis.get("cards.action.fontSize")
            }).alignCenter();

            const strSub = "<i>Rooster Change</i>:" + this.getRoosterActionData().action.desc;
            const resText = new ResourceText({ text: strSub, textConfig: textConfig });
            const opText = new LayoutOperation({
                translate: opBox.translate,
                dims: opBox.dims,
                pivot: Point.CENTER,
                fill: textColor
            })
            group.add(resText, opText);

            // place dawn icon to the side of heading
            const opDawnIcon = new LayoutOperation({
                translate: new Point(0.1*vis.size.x, posHeading.y),
                dims: new Point(textConfigHeading.size),
                pivot: Point.CENTER,
                frame: MISC.sun_icon.frame,
            })
            group.add(resMisc, opDawnIcon);
        }
    }
}