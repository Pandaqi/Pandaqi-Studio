import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import Color from "js/pq_games/layout/color/color";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import TintEffect from "js/pq_games/layout/effects/tintEffect";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig from "js/pq_games/layout/text/textConfig";
import StrokeAlign from "js/pq_games/layout/values/strokeAlign";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import Point from "js/pq_games/tools/geometry/point";
import Bounds from "js/pq_games/tools/numbers/bounds";
import { DICE_ARRANGEMENTS, DICE_POSITIONS, MISC, POWER_CARDS, WILDCARD_DATA } from "../js_shared/dict";

export default class Card
{
    num:number;
    key:string; // only used for special powers
    wildCard:boolean;

    constructor(num:number, key:string = "", wc:boolean = false)
    {
        this.num = num;
        this.key = key;
        this.wildCard = wc;
    }

    getPowerData()
    {
        if(this.wildCard) { return WILDCARD_DATA; }
        if(!this.key) { return {}; }
        return POWER_CARDS[this.key] ?? {};
    }

    hasPower()
    {
        return Object.keys(this.getPowerData()).length > 0;
    }

    async drawForRules(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        fillCanvas(ctx, "#FFFFFF");
       
        const group = new ResourceGroup();
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: 256
        }).alignCenter();
        const resText = new ResourceText({ text: this.num.toString(), textConfig: textConfig });
        const opText = new LayoutOperation({
            translate: vis.center,
            dims: new Point(2.0 * textConfig.size),
            fill: "#010101",
            pivot: Point.CENTER,
        })
        group.add(resText, opText);

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        fillCanvas(ctx, "#FFFFFF");

        const group = new ResourceGroup();
        this.drawBackground(vis, group);
        this.drawNumbers(vis, group);
        this.drawPower(vis, group);

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(vis.inkFriendly) { return; }

        const res = vis.getResource("misc");
        const op = new LayoutOperation({
            translate: vis.center,
            dims: new Point(1.75*vis.sizeUnit),
            alpha: vis.get("cards.bg.alpha"),
            pivot: Point.CENTER,
            frame: MISC.bg.frame
        });
        group.add(res, op);
    }

    getTintColor(vis:MaterialVisualizer, num = this.num)
    {
        if(!MISC["dice_" + num]) { return "#EEEEEE"; } // for wildcards
        return vis.inkFriendly ? "#555555" : MISC["dice_" + num].tint;
    }

    getDiceArrangement()
    {
        return this.wildCard ? DICE_ARRANGEMENTS[6] : DICE_ARRANGEMENTS[this.num];
    }

    drawNumbers(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // draw the main number(s) in the center
        const tintColor = this.getTintColor(vis);
        const needsSmall = this.num >= 8;
        const fontSize = needsSmall ? vis.get("cards.mainNumber.fontSizeSmall") : vis.get("cards.mainNumber.fontSize");
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: fontSize,
        }).alignCenter();
        const txt = this.wildCard ? "?" : this.num.toString();
        const resText = new ResourceText({ text: txt, textConfig: textConfig });
        
        const offsetMainNum = needsSmall ? vis.get("cards.mainNumber.offsetSmall") : vis.get("cards.mainNumber.offset");
        const positions = [vis.center.clone().sub(offsetMainNum)];
        if(!this.hasPower())
        {
            positions.push(vis.center.clone().add(offsetMainNum));
        }

        const strokeColor = new Color(tintColor).darken(vis.get("cards.mainNumber.strokeDarken"));
        for(let i = 0; i < positions.length; i++)
        {
            const shadowDir = (i == 0) ? 1 : -1;
            const shadowEffect = new DropShadowEffect({ color: "#00000088", offset: vis.get("cards.mainNumber.shadowOffset").clone().scaleFactor(shadowDir) });
            const opText = new LayoutOperation({
                translate: positions[i],
                dims: new Point(2.0 * textConfig.size),
                rotation: (shadowDir == 1) ? 0 : Math.PI,
                fill: tintColor,
                stroke: strokeColor,
                strokeWidth: vis.get("cards.mainNumber.strokeWidth"),
                strokeAlign: StrokeAlign.OUTSIDE,
                pivot: Point.CENTER,
                effects: [shadowEffect]
            })
            group.add(resText, opText);
        }


        // draw the edge numbers/dice
        const res = vis.getResource("misc");
        const boxDims = vis.get("cards.numbers.wackyBoxDims");
        let tintEffect = new TintEffect(tintColor);
        const offset = vis.get("cards.numbers.offsetFromCenter");
        const arrangement = this.getDiceArrangement();
        for(let i = 0; i < arrangement.length; i++)
        {
            // @EXCEPTION: wildcard has all numbers, colored, in 6-arrangement
            let num = this.num;
            if(this.wildCard)
            {
                num = (i+1);
                tintEffect = new TintEffect(this.getTintColor(vis, num));
            }

            // first the box behind it
            const index = arrangement[i];
            const randBox = new Bounds(1,4).randomInteger();
            const pos = vis.center.clone().add( DICE_POSITIONS[index].clone().scale(offset) );
            const opBox = new LayoutOperation({
                translate: pos,
                dims: boxDims,
                rotation: Math.floor(Math.random() * 4) * 0.5 * Math.PI,
                frame: MISC["wacky_box_" + randBox].frame,
                effects: [tintEffect],
                pivot: Point.CENTER,
            });
            group.add(res, opBox);

            // then the actual dots of the dice
            const opDots = new LayoutOperation({
                translate: pos,
                dims: vis.get("cards.numbers.wackyBoxDotDims"),
                frame: MISC["dice_" + num].frame,
                pivot: Point.CENTER,
            })
            group.add(res, opDots);
        }
    }

    drawPower(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.hasPower()) { return; }

        const data = this.getPowerData();
        const tintColor = this.getTintColor(vis);

        // draw two icons in corners
        // @NOTE: this depends on whether there's dice there are not? (If no dice in top corners, it looks weird if icon is at lower position?) => just check the INDICES in the arrangement
        const resPowers = vis.getResource("powers");
        const arrangement = this.getDiceArrangement();
        const offset = vis.get("cards.numbers.offsetFromCenter");
        const boxDims = vis.get("cards.numbers.wackyBoxDims");
        const positions = [
            vis.center.clone().add( DICE_POSITIONS[0].clone().scale(offset) ),
            vis.center.clone().add( DICE_POSITIONS[2].clone().scale(offset) ),
        ];

        const topLeftUsed = arrangement.includes(0);
        if(topLeftUsed)
        {
            positions[0].add(new Point(0, boxDims.y));
        }

        const topRightUsed = arrangement.includes(2);
        if(topRightUsed)
        {
            positions[1].add(new Point(0, boxDims.y));
        }

        //const shadowEffect = new DropShadowEffect({ color: "#000000BB", offset: vis.get("cards.power.shadowOffset") });
        for(let i = 0; i < positions.length; i++)
        {
            const opPowerIcon = new LayoutOperation({
                translate: positions[i],
                dims: vis.get("cards.power.iconDims"),
                frame: data.frame,
                pivot: Point.CENTER,
                effects: vis.inkFriendlyEffect
            });
            group.add(resPowers, opPowerIcon);
        }

        // draw text box + power text at lower position
        const offsetMainNum = vis.get("cards.power.offset");
        const position = vis.center.clone().add(offsetMainNum);

        const resMisc = vis.getResource("misc");
        const opBox = new LayoutOperation({
            translate: position,
            dims: vis.get("cards.power.textBoxDims"),
            pivot: Point.CENTER,
            frame: MISC.text_box.frame,
            effects: [new TintEffect(tintColor)]
        })
        group.add(resMisc, opBox);

        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("cards.power.fontSize")
        }).alignCenter();
        const resText = new ResourceText({ text: data.desc, textConfig: textConfig });
        const opText = new LayoutOperation({
            translate: position,
            dims: vis.get("cards.power.textDims"),
            pivot: Point.CENTER,
            fill: "#FFFFFF"
        })
        group.add(resText, opText);
    }
}