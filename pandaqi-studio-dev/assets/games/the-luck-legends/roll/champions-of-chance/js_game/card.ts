import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { MISC, SPECIAL_CARDS, TEMPLATES } from "../js_shared/dict";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import TintEffect from "js/pq_games/layout/effects/tintEffect";
import getRectangleCornersWithOffset from "js/pq_games/tools/geometry/paths/getRectangleCornersWithOffset";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig from "js/pq_games/layout/text/textConfig";
import Point from "js/pq_games/tools/geometry/point";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import getPositionsCenteredAround from "js/pq_games/tools/geometry/paths/getPositionsCenteredAround";

export default class Card
{
    num:number;
    numIcons:number;
    key:string; // only used for special cards/actions

    constructor(num:number, numIcons:number, key:string = "")
    {
        this.num = num;
        this.numIcons = numIcons;
        this.key = key;
    }

    isSpecial()
    {
        return this.key != "";
    }

    getData()
    {
        return MISC[this.num];
    }

    getSpecialData()
    {
        if(!this.isSpecial()) { return {}; }
        return SPECIAL_CARDS[this.key] ?? {};
    }

    getTintColor(vis:MaterialVisualizer)
    {
        if(vis.inkFriendly) { return "#111111"; }
        return this.getData().tint;
    }

    hasIcons()
    {
        return this.numIcons > 0;
    }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        fillCanvas(ctx, "#FFFFFF");

        const group = new ResourceGroup();
        this.drawBackground(vis, group);
        this.drawNumbers(vis, group);
        this.drawIcons(vis, group);
        this.drawSpecial(vis, group);

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const keySuffix = this.isSpecial() ? "_special" : "_regular";
        const resTemp = vis.getResource("card_templates");
        const opBG = new LayoutOperation({
            size: vis.size,
            frame: TEMPLATES["bg" + keySuffix].frame,
            alpha: vis.get("cards.bg.alpha")
        });
        group.add(resTemp, opBG);

        if(!vis.inkFriendly)
        {
            const opTint = new LayoutOperation({
                size: vis.size,
                frame: TEMPLATES["tint" + keySuffix].frame,
                effects: [new TintEffect(this.getTintColor(vis))]
            });
            group.add(resTemp, opTint)
        }
    }

    drawNumbers(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // numbers in corners
        const positions = getRectangleCornersWithOffset(vis.size, vis.get("cards.numbers.offset"));
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.numbers.fontSize")
        }).alignCenter();
        const resText = new ResourceText({ text: this.num.toString(), textConfig: textConfig });
        for(let i = 0; i < 2; i++)
        {
            const pos = positions[i*2];
            const opNumber = new LayoutOperation({
                pos: pos,
                size: new Point(2.0 * textConfig.size),
                pivot: Point.CENTER,
                fill: this.getTintColor(vis)
            });
            group.add(resText, opNumber);
        }

        // number in center
        const resMisc = vis.getResource("misc");
        const centerIconDims = vis.get("cards.numbers.centerDims");
        const shadowEffect = new DropShadowEffect({ color: "#000000", blurRadius: 0.025*centerIconDims.x });
        const opCenterNumber = new LayoutOperation({
            pos: vis.get("cards.numbers.centerPos"),
            size: centerIconDims,
            pivot: Point.CENTER,
            frame: this.getData().frame,
            effects: [shadowEffect, vis.inkFriendlyEffect].flat()
        })
        group.add(resMisc, opCenterNumber);

        // number in written text below that
        const textConfigWritten = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.numbers.writtenFontSize")
        }).alignCenter();
        const resTextWritten = new ResourceText({ text: this.getData().label, textConfig: textConfigWritten });
        const opTextWritten = new LayoutOperation({
            pos: vis.get("cards.numbers.writtenPos"),
            size: new Point(8.0 * textConfigWritten.size),
            pivot: Point.CENTER,
            fill: this.getTintColor(vis)
        })
        group.add(resTextWritten, opTextWritten);
    }

    drawIcons(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.hasIcons()) { return; }

        const edgeOffset = vis.get("cards.icons.offset");
        const iconDims = vis.get("cards.icons.size");

        const anchorPositions = [
            new Point(edgeOffset.x, vis.size.y - edgeOffset.y),
            new Point(vis.size.x - edgeOffset.x, edgeOffset.y)
        ]

        const shadowEffect = new DropShadowEffect({ color: "#333333", blurRadius: 0.04*iconDims.x });
        const resMisc = vis.getResource("misc");

        for(let i = 0; i < anchorPositions.length; i++)
        {
            const anchorPos = anchorPositions[i];
            const isTopRightSide = i == 1;
            const shouldDisplayCupInstead = isTopRightSide && this.isSpecial();
            if(shouldDisplayCupInstead)
            {
                const opIcon = new LayoutOperation({
                    pos: anchorPos,
                    size: iconDims,
                    frame: MISC.cup_icon.frame,
                    rot: (-0.075 + 0.15*Math.random()) * 2 * Math.PI,
                    pivot: Point.CENTER,
                    effects: [shadowEffect, vis.inkFriendlyEffect].flat()
                });
                group.add(resMisc, opIcon);
                continue;
            }

            const positions = getPositionsCenteredAround({ pos: anchorPos, size: iconDims, num: this.numIcons, dir: Point.DOWN });
            for(const pos of positions)
            {
                const opIcon = new LayoutOperation({
                    pos: pos,
                    size: iconDims,
                    flipY: isTopRightSide,
                    frame: MISC.dice_icon.frame,
                    pivot: Point.CENTER,
                    effects: [shadowEffect]
                })
                group.add(resMisc, opIcon);
            }
        }
        
    }

    drawSpecial(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.isSpecial()) { return; }

        const data = this.getSpecialData();
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("cards.power.fontSize")
        }).alignCenter();
        const resText = new ResourceText({ text: data.desc, textConfig: textConfig });
        const opText = new LayoutOperation({
            pos: vis.get("cards.power.textPos"),
            size: vis.get("cards.power.textBoxDims"),
            fill: vis.get("cards.power.textColor"),
            pivot: Point.CENTER
        })
        group.add(resText, opText);
    }
}