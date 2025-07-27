import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import fromArray from "js/pq_games/tools/random/fromArray";
import { ACTIONS, ACTION_PREFIXES, ACTION_REPLACEMENTS, ActionType, MISC, NUMBERS_WRITTEN } from "../shared/dict";
import Point from "js/pq_games/tools/geometry/point";
import TextConfig from "js/pq_games/layout/text/textConfig";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import StrokeAlign from "js/pq_games/layout/values/strokeAlign";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";

export default class Card
{
    num:number;
    health:number;
    keys:string[]; // these are the original KEYS for the actions
    actions:string[]; // these are the FINAL STRINGS
    shield:boolean;
    arrowRight:boolean;

    constructor(num:number, health:number, keys:string[])
    {
        this.num = num;
        this.health = health;
        this.arrowRight = Math.random() <= 0.5;
        this.keys = keys;

        this.fillInDynamicStrings();
    }

    isUnseen()
    {
        return this.actions.length > 1;
    }

    fillInDynamicStrings()
    {
        this.actions = [];
        for(const key of this.keys)
        {
            if(key == "no_action") { this.actions.push(""); continue; }

            const data = ACTIONS[key];
            let desc = data.desc;
            for(const [needle,options] of Object.entries(ACTION_REPLACEMENTS))
            {
                desc = desc.replace(needle, fromArray(options));
            }

            const prefix = ACTION_PREFIXES[data.type ?? ActionType.STOPPED];
            this.actions.push("<b>" + prefix + "</b> " + desc);

            if(data.shield) { this.shield = true; }
        }
    }

    getFullActionString()
    {
        return this.actions.join("\n");
    }

    getShadowEffect(vis:MaterialVisualizer)
    {
        if(vis.inkFriendly) { return []; }
        return new DropShadowEffect({ color: "#999999", offset: vis.get("cards.shared.shadowOffset") });
    }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        fillCanvas(ctx, "#FFFFFF");

        const group = new ResourceGroup();
        this.drawBackground(vis, group);
        this.drawNumbers(vis, group);
        this.drawSpecial(vis, group);

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // the scribbly background texture
        if(!vis.inkFriendly)
        {
            const res = vis.getResource("card_templates");
            const op = new LayoutOperation({
                size: vis.size,
                alpha: vis.get("cards.bg.alpha")
            })
            group.add(res, op);
        }

        // the arrow (only used in variant/expansion) at left or right
        const placeArrow = !this.shield && !this.isUnseen();
        if(placeArrow)
        {
            const arrowPos = this.arrowRight ? vis.get("cards.power.shieldPos") : vis.get("cards.power.unseenPos");
            const arrowDims = vis.get("cards.arrow.size");
            const opArrow = new LayoutOperation({
                pos: arrowPos,
                rot: this.arrowRight ? 0 : Math.PI,
                size: arrowDims,
                pivot: Point.CENTER,
                frame: MISC.arrow.frame,
                composite: vis.get("cards.arrow.composite"),
                alpha: vis.get("cards.arrow.alpha")
            });
            const resMisc = vis.getResource("misc");
            group.add(resMisc, opArrow);
        }
    }

    drawNumbers(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const resMisc = vis.getResource("misc");
        const offset = vis.get("cards.numbers.boxOffset");
        const size = vis.get("cards.numbers.boxDims");
        const strokeWidth = vis.get("cards.numbers.strokeWidth");

        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.numbers.fontSize")
        }).alignCenter();

        // number box + number
        const textInBoxOffset = vis.get("cards.numbers.textInBoxOffset");
        const opNumberBox = new LayoutOperation({
            pos: offset,
            size: size,
            pivot: Point.CENTER,
            frame: MISC.number_box.frame,
            effects: [vis.inkFriendlyEffect, this.getShadowEffect(vis)].flat()
        })
        group.add(resMisc, opNumberBox);

        const resTextNumber = new ResourceText({ text: this.num.toString(), textConfig: textConfig });
        const opTextNumber = new LayoutOperation({
            pos: opNumberBox.pos.clone().sub(textInBoxOffset),
            size: size,
            pivot: Point.CENTER,
            fill: "#FFFFFF",
            stroke: "#222222",
            strokeWidth: strokeWidth,
            strokeAlign: StrokeAlign.OUTSIDE
        })
        group.add(resTextNumber, opTextNumber);

        // health box + number
        const opHealthBox = new LayoutOperation({
            pos: new Point(vis.size.x - offset.x, offset.y),
            size: size,
            pivot: Point.CENTER,
            frame: MISC.health_box.frame,
            effects: [vis.inkFriendlyEffect, this.getShadowEffect(vis)].flat()
        })
        group.add(resMisc, opHealthBox);

        const resTextHealth = new ResourceText({ text: this.health.toString(), textConfig: textConfig });
        const opTextHealth = new LayoutOperation({
            pos: opHealthBox.pos.clone().add(new Point(textInBoxOffset.x, -textInBoxOffset.y)),
            size: size,
            pivot: Point.CENTER,
            fill: "#FFFFFF",
            stroke: "#222222",
            strokeWidth: strokeWidth,
            strokeAlign: StrokeAlign.OUTSIDE,
        })
        group.add(resTextHealth, opTextHealth);

        // draw main number
        const textConfigMain = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.mainNumber.fontSize")
        }).alignCenter();

        const resText = new ResourceText({ text: this.num.toString(), textConfig: textConfigMain });
        const opText = new LayoutOperation({
            pos: vis.get("cards.mainNumber.pos"),
            size: new Point(1.5 * textConfigMain.size),
            pivot: Point.CENTER,
            fill: "#000000",
            stroke: "#FFFFFF",
            strokeWidth: vis.get("cards.mainNumber.strokeWidth"),
            strokeAlign: StrokeAlign.OUTSIDE
        })
        group.add(resText, opText);

        // draw it written out too
        if(vis.get("cards.mainNumber.addWrittenVersion"))
        {
            // the line below it
            const opLine = new LayoutOperation({
                pos: vis.get("cards.mainNumber.written.linePos"),
                size: vis.get("cards.mainNumber.written.lineDims"),
                frame: MISC.stripes.frame,
                pivot: Point.CENTER,
                alpha: vis.get("cards.mainNumber.written.lineAlpha")
            });
            group.add(resMisc, opLine);

            // the written text
            const textConfigWritten = new TextConfig({
                font: vis.get("fonts.body"),
                size: vis.get("cards.mainNumber.written.fontSize")
            }).alignCenter();
            const resTextWritten = new ResourceText({ text: NUMBERS_WRITTEN[this.num+1], textConfig: textConfigWritten });
            const opTextWritten = new LayoutOperation({
                pos: vis.get("cards.mainNumber.written.pos"),
                size: new Point(vis.size.x, 1.5 * textConfigWritten.size),
                pivot: Point.CENTER,
                fill: "#000000",
            })
            group.add(resTextWritten, opTextWritten);
        }
    }

    drawSpecial(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const action = this.getFullActionString();

        // the box to outline text
        const resMisc = vis.getResource("misc");
        const opBox = new LayoutOperation({
            pos: vis.get("cards.power.textPos"),
            size: vis.get("cards.power.textBoxDims"),
            pivot: Point.CENTER,
            frame: MISC.power_box.frame,
            effects: [vis.inkFriendlyEffect, this.getShadowEffect(vis)].flat()
        });
        group.add(resMisc, opBox);

        // the actual power text
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("cards.power.fontSize")
        }).alignCenter();

        const resText = new ResourceText({ text: action, textConfig: textConfig});
        const opText = new LayoutOperation({
            pos: vis.get("cards.power.textPos"),
            size: vis.get("cards.power.textDims"),
            pivot: Point.CENTER,
            fill: "#000000",
        })
        group.add(resText, opText);

        // the icons for the actions
        // (just duplicate the same one if we have a single action; otherwise use both different ones)
        const actionsCopy = this.keys.slice();
        if(actionsCopy.length <= 1) { actionsCopy.push(actionsCopy[0]); }
        const resActions = vis.getResource("actions");
        const actionOffset = vis.get("cards.power.iconOffset");
        const iconDims = vis.get("cards.power.iconDims");
        const positions = [
            actionOffset,
            new Point(vis.size.x - actionOffset.x, actionOffset.y)
        ]

        for(let i = 0; i < positions.length; i++)
        {
            const data = ACTIONS[actionsCopy[i]];
            const opIcon = new LayoutOperation({
                pos: positions[i],
                size: iconDims,
                frame: data.frame,
                pivot: Point.CENTER,
                alpha: vis.get("cards.power.iconAlpha")
            });
            group.add(resActions, opIcon);
        }

        if(this.shield)
        {
            const opShield = new LayoutOperation({
                pos: vis.get("cards.power.shieldPos"),
                size: iconDims,
                frame: MISC.shield_icon.frame,
                pivot: Point.CENTER
            });
            group.add(resMisc, opShield);
        }

        if(this.isUnseen())
        {
            const opEye = new LayoutOperation({
                pos: vis.get("cards.power.unseenPos"),
                size: iconDims,
                frame: MISC.unseen_icon.frame,
                pivot: Point.CENTER
            });
            group.add(resMisc, opEye);
        }
    }
}