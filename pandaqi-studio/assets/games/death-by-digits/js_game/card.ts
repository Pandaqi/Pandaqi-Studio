import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { EXPANSION } from "../js_shared/dict";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import TintEffect from "js/pq_games/layout/effects/tintEffect";
import Color from "js/pq_games/layout/color/color";
import getRectangleCornersWithOffset from "js/pq_games/tools/geometry/paths/getRectangleCornersWithOffset";
import TextConfig from "js/pq_games/layout/text/textConfig";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import Point from "js/pq_games/tools/geometry/point";
import lerp from "js/pq_games/tools/numbers/lerp";
import clamp from "js/pq_games/tools/numbers/clamp";

export default class Card
{
    key: string;
    num: number;
    color: Color;

    constructor(num:number = 1, key:string = "", col:Color = Color.WHITE)
    {
        this.num = num;
        this.key = key;
        this.color = col;
    }

    async drawForRules(vis:MaterialVisualizer)
    {
        return this.draw(vis);
    }

    getNumber()
    {
        if(this.key) { return EXPANSION[this.key].num; }
        return this.num ?? 1;
    }

    getActionText()
    {
        return EXPANSION[this.key].desc;
    }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        fillCanvas(ctx, "#FFFFFF");
        const group = new ResourceGroup();

        this.drawBackground(vis, group);
        this.drawNumbers(vis, group);
        this.drawExtra(vis, group);

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // the random smudges and fingerprints to overlay it
        const res = vis.getResource("card_templates");
        const opTexture = new LayoutOperation({
            size: vis.size.clone().scale(1.66),
            pos: vis.center,
            frame: 2,
            pivot: Point.CENTER,
            rot: Math.random() * 2 * Math.PI,
        })
        group.add(res, opTexture);

        // the tinted background (that leaves a white space/gap in center)
        const tintEffect = new TintEffect({ color: this.color });
        const op = new LayoutOperation({
            size: vis.size,
            effects: [tintEffect],
            frame: 0
        }) 

        if(!vis.inkFriendly)
        {
            group.add(res, op);
        }
        
        // the two hooks around it (with darkened tint)
        const opHooks = new LayoutOperation({
            size: vis.size,
            effects: [new TintEffect({ color: this.getColorDarkened(vis) })],
            frame: 1
        })
        group.add(res, opHooks);
    }

    getColorDarkened(vis:MaterialVisualizer) 
    {
        // @NOTE: colors like blue and purple seem darker by default to our eyes (while yellow seems very light) => as such, vary the darkening factor based on hue
        const baseHue = this.color.h;
        let dist = baseHue - 240.0;
        if(dist < 0) { dist += 360.0; }
        if(dist > 180) { dist -= 360.0; }
        const lerpFactor = clamp(1.0 - Math.abs(dist)/180.0, 0.0, 1.0);
        const darkenFactor = lerp(vis.get("cards.colors.darkenFactor"), 15, lerpFactor);
        return vis.inkFriendly ? "#AAAAAA" : this.color.clone().darken(darkenFactor);
    }

    getColorDarkenedMore(vis:MaterialVisualizer)
    {
        if(vis.inkFriendly) { return "#111111"; }
        return this.color.clone().darken(75);
    }

    drawNumbers(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // draw the number of this card top-left and bottom-right
        const offset = vis.get("cards.numbers.offset");
        const positions = getRectangleCornersWithOffset(vis.size, offset);
        const numDisplay = this.getNumber().toString();

        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.numbers.fontSize")
        }).alignCenter();

        // modification for minus numbers because the minus symbol is SO BIG in this font.
        if(this.getNumber() < 0)
        {
            textConfig.size *= vis.get("cards.numbers.minusSignScaleFactor");
        }

        const resText = new ResourceText({ text: numDisplay, textConfig: textConfig });
        const fontColor = this.getColorDarkenedMore(vis);
        const textDims = new Point(3.0 * textConfig.size);

        for(let i = 0; i < 2; i++)
        {
            const opText = new LayoutOperation({
                pos: positions[i * 2],
                rot: i * Math.PI,
                size: textDims,
                fill: fontColor,
                pivot: Point.CENTER
            })
            group.add(resText, opText);
        }

        // draw a bigger number in the center
        const textConfigBig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: this.isExpansionCard() ? vis.get("cards.numberCenter.fontSizeSpecial") : vis.get("cards.numberCenter.fontSize")
        }).alignCenter();

        if(this.getNumber() < 0)
        {
            textConfigBig.size *= vis.get("cards.numbers.minusSignScaleFactor");
        }

        const resTextBig = new ResourceText({ text: numDisplay, textConfig: textConfigBig });
        const posBig = this.isExpansionCard() ? vis.get("cards.numberCenter.textPosSpecial") : vis.get("cards.numberCenter.textPos");
        const opTextBig = new LayoutOperation({
            pos: posBig,
            size: vis.size,
            fill: fontColor,
            pivot: Point.CENTER
        })
        group.add(resTextBig, opTextBig);

        // draw the card's special icon below
        const resIcon = vis.getResource("number_icons");
        const iconOffset = vis.get("cards.icons.offsetFromNumber");
        const iconFrame = 2 + (this.num - 1); // that 2 is just for the expansion cards with numbers BELOW 1; as the frames in this spritesheet are in numerical order completely
        for(let i = 0; i < 2; i++)
        {
            const dir = i == 0 ? 1 : -1;
            const opIcon = new LayoutOperation({
                pos: positions[i * 2].clone().add(iconOffset.clone().scale(dir)),
                rot: i * Math.PI,
                size: vis.get("cards.icons.size"),
                frame: iconFrame,
                pivot: Point.CENTER
            })
            group.add(resIcon, opIcon);
        }
    }

    isExpansionCard()
    {
        return this.key && this.getActionText();
    }

    drawExtra(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.isExpansionCard()) { return; }

        // add the icons (for the special action) on top-right and bottom-left, offset inward
        const offset = vis.get("cards.special.iconOffset");
        const positions = getRectangleCornersWithOffset(vis.size, offset);
        const resIcon = vis.getResource("expansion_icons");
        for(let i = 0; i < 2; i++)
        {
            const opIcon = new LayoutOperation({
                pos: positions[1 + i * 2],
                frame: EXPANSION[this.key].frame,
                size: vis.get("cards.special.iconDims"),
                rot: i * Math.PI,
                effects: vis.inkFriendlyEffect,
                pivot: Point.CENTER
            })
            group.add(resIcon, opIcon);
        }

        // add the text explaining the card below middle number
        const pos = vis.get("cards.special.textPos");
        const size = vis.get("cards.special.textDims");

        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("cards.special.fontSize")
        }).alignCenter();

        const resText = new ResourceText({ text: this.getActionText(), textConfig: textConfig });
        const opText = new LayoutOperation({
            pos: pos,
            fill: this.getColorDarkenedMore(vis),
            size: size,
            pivot: Point.CENTER,
        })
        group.add(resText, opText);
    }
}