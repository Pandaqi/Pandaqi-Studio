import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { AnimalType, DAWN_ACTIONS, MISC, MOVES, ROOSTER_CHANGES, TEMPLATES } from "../shared/dict";
import Point from "js/pq_games/tools/geometry/point";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import InvertEffect from "js/pq_games/layout/effects/invertEffect";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig from "js/pq_games/layout/text/textConfig";
import getPositionsCenteredAround from "js/pq_games/tools/geometry/paths/getPositionsCenteredAround";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import Circle from "js/pq_games/tools/geometry/circle";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import StrokeAlign from "js/pq_games/layout/values/strokeAlign";

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

    hasAction()
    {
        if(this.isRooster()) { return true; }
        return this.getActionData().desc != "";
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
        fillCanvas(ctx, "#FFFFFF");

        const group = new ResourceGroup();
        this.drawBackground(vis, group);
        this.drawMain(vis, group);
        this.drawAction(vis, group);
        this.drawStrengths(vis, group);

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const resTemp = vis.getResource("card_templates");
        if(vis.inkFriendly)
        {
            const opOutline = new LayoutOperation({
                size: vis.size,
                frame: TEMPLATES.outline.frame,
                alpha: 0.66,
                effects: [new InvertEffect()]
            })
            group.add(resTemp, opOutline);
            return;
        }

        // the colored bg rect
        // (don't do this with fillCanvas, as then overlay effects and stuff don't work, because it's considered a different canvas/group)
        const rect = new ResourceShape(new Rectangle().fromTopLeft(new Point(), vis.size));
        const opRect = new LayoutOperation({
            fill: this.getTintColor(vis)
        });
        group.add(rect, opRect);

        // the bamboo at the bottom
        const opBamboo = new LayoutOperation({
            size: vis.size,
            composite: "multiply",
            alpha: vis.get("cards.bg.bambooAlpha"),
            frame: TEMPLATES.bamboo.frame,
        })
        group.add(resTemp, opBamboo);

        // the patterns at the edge
        const patternComp = this.isDark() ? "overlay" : "luminosity"
        const opPatterns = new LayoutOperation({
            size: vis.size,
            composite: patternComp,
            alpha: vis.get("cards.bg.patternsAlpha"),
            frame: TEMPLATES.patterns.frame,
        })
        group.add(resTemp, opPatterns);

        // paper texture
        const opTexture = new LayoutOperation({
            size: vis.size,
            composite: "overlay",
            alpha: vis.get("cards.bg.textureAlpha"),
            frame: TEMPLATES.texture.frame,
        })
        group.add(resTemp, opTexture);

        // border outline
        const outlineEffects = this.isDark() ? [] : [new InvertEffect()];
        const opOutline = new LayoutOperation({
            size: vis.size,
            composite: "overlay",
            alpha: vis.get("cards.bg.outlineAlpha"),
            frame: TEMPLATES.outline.frame,
            effects: outlineEffects
        })
        group.add(resTemp, opOutline);

        // spiral rays
        const opSpiral = new LayoutOperation({
            size: vis.size,
            composite: "overlay",
            alpha: vis.get("cards.bg.spiralAlpha"),
            frame: TEMPLATES.spiral.frame,
        })
        group.add(resTemp, opSpiral);

        // cherry blossoms
        const opBlossom = new LayoutOperation({
            size: vis.size,
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
            pos: vis.get("cards.main.pos"),
            size: vis.get("cards.main.size"),
            pivot: Point.CENTER,
            frame: this.getData().frame,
            effects: [vis.inkFriendlyEffect, shadowEffect].flat()
        })
        group.add(res, op);
    }

    drawStrengths(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(this.strengths.length <= 0) { return; }

        // some preparation numbers
        const textureKey = vis.get("cards.strengths.useSimplified") ? "animals_simplified" : "animals";
        const res = vis.getResource(textureKey);
        const resMisc = vis.getResource("misc");

        const size = vis.get("cards.strengths.iconDims");
        const sizeAnimal = vis.get("cards.strengths.iconAnimalDims");
        const anchorOffset = vis.get("cards.strengths.anchorPos");
        const textOffset = vis.get("cards.strengths.textPos");
        let anchorPos = anchorOffset;
        let textPos = textOffset;
        if(vis.get("cards.strengths.placeAtBottom"))
        {
            anchorPos = new Point(anchorOffset.x, vis.size.y - anchorOffset.y);
            textPos = new Point(textOffset.x, vis.size.y - textOffset.y);
        }

        // the small text label stating these are your strengths
        const textConfigHeading = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.strengths.fontSize")
        }).alignCenter();
        const resTextHeading = new ResourceText({ text: "strengths", textConfig: textConfigHeading });
        const opTextHeading = new LayoutOperation({
            pos: textPos,
            size: new Point(vis.size.x, 2.0*textConfigHeading.size),
            pivot: Point.CENTER,
            fill: "#FFFFFF",
            stroke: "#000000",
            strokeWidth: 0.1*textConfigHeading.size,
            strokeAlign: StrokeAlign.OUTSIDE
        })
        group.add(resTextHeading, opTextHeading);

        // the actual list of strengths
        const positions = getPositionsCenteredAround({
            pos: anchorPos,
            size: size,
            num: this.strengths.length
        })

        const shadowEffectBox = new DropShadowEffect({ color: "#000000", blur: vis.get("cards.strengths.shadowBlur") });
        const effects = this.isDark() ? [shadowEffectBox] : [new InvertEffect(), shadowEffectBox];
        for(let i = 0; i < positions.length; i++)
        {
            const pos = positions[i];

            // the colored circle
            const circ = new ResourceShape(new Circle({
                center: pos, 
                radius: 0.45*size.x
            }));
            const opCirc = new LayoutOperation({
                fill: this.getTintColor(vis, this.strengths[i])
            })
            group.add(circ, opCirc);

            // the box behind the animal
            const opBox = new LayoutOperation({
                pos: pos,
                size: size,
                pivot: Point.CENTER,
                frame: MISC.strength_circle.frame,
                effects: effects
            })
            group.add(resMisc, opBox);

            // the animal itself
            const shadowColor = this.isDark(this.strengths[i]) ? "#000000" : "#FFFFFF";
            const shadowEffect = new DropShadowEffect({ color: shadowColor, blurRadius: vis.get("cards.strengths.shadowBlur") }); 

            const opAnimal = new LayoutOperation({
                pos: pos,
                size: sizeAnimal,
                frame: MOVES[this.strengths[i]].frame,
                effects: [vis.inkFriendlyEffect, shadowEffect].flat(),
                pivot: Point.CENTER
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
            pos: posHeading,
            size: vis.get("cards.action.heading.size"),
            frame: MISC.heading_box.frame,
            effects: effectsHeading,
            alpha: vis.inkFriendly ? 0.8 : 1.0,
            pivot: Point.CENTER
        })
        group.add(resMisc, opHeadingBox);

        const textConfigHeading = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.action.heading.fontSize")
        }).alignCenter();
        const resTextHeading = new ResourceText({ text: data.label, textConfig: textConfigHeading });
        const opTextHeading = new LayoutOperation({
            pos: opHeadingBox.pos,
            size: opHeadingBox.size,
            pivot: Point.CENTER,
            fill: textColorHeading
        })
        group.add(resTextHeading, opTextHeading);

        const fontSize = this.isRooster() ? vis.get("cards.action.fontSizeRooster") : vis.get("cards.action.fontSize");
        if(this.hasAction())
        {
            // add action (box + text)
            const effects = this.isDark() ? [new InvertEffect()] : []; // precisely inverse from heading
            const textColor = this.isDark() ? "#FFFFFF" : "#000000";
            const opBox = new LayoutOperation({
                pos: vis.get("cards.action.pos"),
                size: vis.get("cards.action.size"),
                frame: MISC.text_box.frame,
                effects: effects,
                composite: "overlay",
                alpha: vis.inkFriendly ? 0.8 : 1.0,
                pivot: Point.CENTER
            })
            group.add(resMisc, opBox);

            const textConfig = new TextConfig({
                font: vis.get("fonts.body"),
                size: fontSize
            }).alignCenter();

            const strMain = this.isRooster() ? this.getRoosterActionData().overall.desc : data.desc;
            const resText = new ResourceText({ text: strMain, textConfig: textConfig });
            const opText = new LayoutOperation({
                pos: vis.get("cards.action.posText"),
                size: vis.get("cards.action.textDims"),
                pivot: Point.CENTER,
                fill: textColor
            })
            group.add(resText, opText);
        }


        // on Rooster cards, we push the HEADING to the bottom of the card
        // so we have space for two action texts above it
        if(this.isRooster())
        {
            // @TODO: might need to shrink the rooster icon itself if it looks weird with overlap now
            // add this second text box (we use ACTION here, and OVERALL on the default one)
            const effects = this.isDark() ? [new InvertEffect()] : []; 
            const textColor = this.isDark() ? "#FFFFFF" : "#000000";
            const opBox = new LayoutOperation({
                pos: vis.get("cards.action.posRooster"),
                size: vis.get("cards.action.size"),
                frame: MISC.text_box.frame,
                effects: effects,
                pivot: Point.CENTER,
                composite: "overlay"
            })
            group.add(resMisc, opBox);

            const textConfig = new TextConfig({
                font: vis.get("fonts.body"),
                size: fontSize
            }).alignCenter();

            const strSub = "<i>Rooster Change</i>: " + this.getRoosterActionData().action.desc;
            const resText = new ResourceText({ text: strSub, textConfig: textConfig });
            const opText = new LayoutOperation({
                pos: vis.get("cards.action.textPosRooster"),
                size: vis.get("cards.action.textDims"),
                pivot: Point.CENTER,
                fill: textColor,
            })
            group.add(resText, opText);

            // place dawn icon to the side of heading
            const opDawnIcon = new LayoutOperation({
                pos: new Point(0.15*vis.size.x, posHeading.y),
                size: new Point(1.5*textConfigHeading.size),
                pivot: Point.CENTER,
                frame: MISC.sun_icon.frame,
            })
            group.add(resMisc, opDawnIcon);
        }
    }
}