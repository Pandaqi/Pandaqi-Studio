import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import InvertEffect from "js/pq_games/layout/effects/invertEffect";
import TintEffect from "js/pq_games/layout/effects/tintEffect";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig from "js/pq_games/layout/text/textConfig";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import getRectangleCornersWithOffset from "js/pq_games/tools/geometry/paths/getRectangleCornersWithOffset";
import Point from "js/pq_games/tools/geometry/point";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import { MISC, SPECIAL_BIDS, SUITS, Suit, TEMPLATES } from "../shared/dict";

export default class Card
{
    num:number;
    suit:Suit;
    key:string; // only used for special cards/actions

    constructor(num:number = -1, suit:Suit = Suit.RED, key = "")
    {
        this.num = num;
        this.suit = suit;
        this.key = key;
    }

    isWildCard()
    {
        return this.num <= 0 && !this.hasSpecialPower();
    }

    getSpecialData()
    {
        if(!this.key) { return {}; }
        return SPECIAL_BIDS[this.key] ?? {};
    }

    hasSpecialPower()
    {
        return Object.keys(this.getSpecialData()).length > 0;
    }

    getSuitData(suit = this.suit)
    {
        return SUITS[suit] ?? {};
    }

    getTintColor(vis:MaterialVisualizer, suit = this.suit, ignoreWildcard = false)
    {
        if(vis.inkFriendly) { return "#FFFFFF"; }
        if(this.hasSpecialPower()) { return vis.get("cards.bids.bgColor"); }
        if(this.isWildCard() && !ignoreWildcard) { return vis.get("cards.wildcard.tint"); }
        return this.getSuitData(suit).tint;
    }

    getTintColorLight(vis:MaterialVisualizer)
    {
        if(vis.inkFriendly) { return "#000000"; }
        if(this.hasSpecialPower()) { return vis.get("cards.bids.tintColor"); }
        if(this.isWildCard()) { return "#FFFFFF"; }
        return this.getSuitData().tintLight;
    }

    async drawForRules(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        fillCanvas(ctx, this.getTintColor(vis));
       
        const group = new ResourceGroup();
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: 256
        }).alignCenter();
        const resText = new ResourceText({ text: this.num.toString(), textConfig: textConfig });
        const opText = new LayoutOperation({
            pos: vis.center,
            size: new Point(2.0 * textConfig.size),
            fill: "#FCFCFC",
            pivot: Point.CENTER,
        })
        group.add(resText, opText);

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        fillCanvas(ctx, this.getTintColor(vis));

        const group = new ResourceGroup();
        this.drawBackground(vis, group);
        this.drawNumberAndSuit(vis, group);
        this.drawCenterNumber(vis, group);
        this.drawSpecial(vis, group);
        this.drawOverlay(vis, group);

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(vis.inkFriendly) { return; } // no sense drawing white outlines if the entire card is white

        // wildcard shows a rainbow with all suits covering background
        if(this.isWildCard())
        {
            const yOffset = 0.25*vis.size.y;
            const rect = new ResourceShape( new Rectangle().fromTopLeft(new Point(), new Point(vis.size.x, yOffset)) );
            let counter = 0;
            for(const key of Object.keys(SUITS))
            {
                
                const opRect = new LayoutOperation({
                    pos: new Point(0, yOffset*counter),
                    fill: this.getTintColor(vis, key as Suit, true)
                })
                counter++;
                group.add(rect, opRect);
                console.log(rect, opRect);
            }
        }

        const res = vis.getResource("card_templates");
        const opOutlineInner = new LayoutOperation({
            size: vis.size,
            frame: TEMPLATES.outline_inner.frame,
            composite: "overlay",
            alpha: vis.get("cards.bg.outlineAlpha")
        });
        group.add(res, opOutlineInner);

        const opOutline = new LayoutOperation({
            size: vis.size,
            frame: TEMPLATES.outline.frame
        });
        group.add(res, opOutline);
    }

    drawNumberAndSuit(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const positions = getRectangleCornersWithOffset(vis.size, vis.get("cards.numbers.offset"));
        const boxDims = vis.get("cards.numbers.boxDims");
        const suitDims = vis.get("cards.numbers.suitDims");
        const resMisc = vis.getResource("misc");
        const tintEffect = new TintEffect(this.getTintColor(vis));

        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.numbers.fontSize")
        }).alignCenter();
        let txt = this.isWildCard() ? "?" : this.num.toString();
        if(this.hasSpecialPower())
        {
            txt = this.getSpecialData().value.toString();
        }

        const resText = new ResourceText({ text: txt, textConfig: textConfig });

        for(let i = 0; i < positions.length; i++)
        {
            const isSuit = i % 2 == 1;
            if(this.hasSpecialPower() && isSuit) { continue; }

            // @NOTE: repeat all suits if wildCard
            // Otherwise it just defaults to one (one suit/one number)
            const drawAllSuits = (this.isWildCard() && isSuit) && vis.get("cards.wildcard.drawAllSuits");
            let suitsToDraw:string[] = [this.suit];
            if(drawAllSuits) { suitsToDraw = Object.keys(SUITS); }
            const drawDir = i <= 1 ? -1 : 1;

            const anchorPos = positions[i];
            for(let s = 0; s < suitsToDraw.length; s++)
            {
                const opMain = new LayoutOperation({
                    pos: anchorPos.clone().add(new Point(drawDir * suitDims.x * s * 1.1, 0)),
                    size: isSuit ? suitDims : boxDims,
                    rot: (i <= 1) ? 0 : Math.PI,
                    pivot: Point.CENTER,
                    frame: isSuit ? this.getSuitData(suitsToDraw[s] as Suit).frame : MISC.number_box.frame,
                });

                const needsTint = !isSuit;
                if(needsTint) { opMain.effects = [tintEffect]; }
                if(isSuit && vis.inkFriendly) { opMain.effects = [new InvertEffect()]; }
                group.add(resMisc, opMain);
            }

            // Number boxes need the actual number text on top
            if(!isSuit)
            {
                const opText = new LayoutOperation({
                    pos: anchorPos,
                    size: new Point(3.0 * textConfig.size),
                    rot: (i <= 1) ? 0 : Math.PI,
                    pivot: Point.CENTER,
                    fill: this.getTintColorLight(vis)
                });
                group.add(resText, opText);
            }
        }
    }

    drawCenterNumber(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(this.hasSpecialPower()) { return; }

        // the circle in the middle that the numbers revolve around
        const resMisc = vis.getResource("misc");
        const opCircle = new LayoutOperation({
            pos: vis.center,
            size: vis.get("cards.mainNumber.circleDims"),
            frame: MISC.center_circle.frame,
            rot: Math.floor(Math.random() * 4) * 0.5 * Math.PI,
            pivot: Point.CENTER
        });
        group.add(resMisc, opCircle);

        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.mainNumber.fontSize")
        }).alignCenter();

        // the actual numbers
        const offset = vis.get("cards.mainNumber.circleRadius");

        const groupNums = new ResourceGroup();
        const groupNumsShadow = new ResourceGroup();
        for(let i = 0; i < 8; i++)
        {
            const angle = (i/8.0) * 2 * Math.PI;
            const circlePos = new Point(Math.cos(angle), Math.sin(angle)).scaleFactor(offset);
            const circleIndex = (i + 2) % 8; // the circle starts changing alpha from TOP to BOTTOM
            const circleFraction = Math.abs(circleIndex - 4) / 4.0; // so this calculates distance and lerps alpha accordingly
            const circleAlpha = 0.2 + circleFraction*(1.0 - 0.2);
            const txt = this.isWildCard() ? (circleIndex+1).toString() : this.num.toString();
            const resText = new ResourceText({ text: txt, textConfig: textConfig });
            const opText = new LayoutOperation({
                pos: circlePos,
                rot: angle + 0.5*Math.PI,
                size: new Point(2.0*textConfig.size),
                pivot: Point.CENTER,
                fill: this.getTintColorLight(vis),
                composite: this.isWildCard() ? "overlay" : "source-over", // source-over is default drawing mode of canvas
                alpha: circleAlpha,
            })
            groupNums.add(resText, opText);

            const opTextShadow = opText.clone();
            opTextShadow.setFill("#000000");
            groupNumsShadow.add(resText, opTextShadow);
        }

        if(!vis.inkFriendly)
        {
            const off = vis.get("cards.mainNumber.shadowOffset");
            const opGroupShadow = new LayoutOperation({ 
                pos: vis.center.clone().add(off),
                composite: "overlay" 
            });
            group.add(groupNumsShadow, opGroupShadow);
        }

        const opGroup = new LayoutOperation({ pos: vis.center })
        group.add(groupNums, opGroup);
    }

    drawSpecial(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.hasSpecialPower()) { return; }

        const data = this.getSpecialData();

        // the heading(s) saying it's a power card
        // @NOTE: I left out the bid names from the original sketch, because it was a bit crowded AND it could easily be abused to catch someone lying ("oh, then tell me the name of your bid!")
        const headingOffset = vis.get("cards.bids.headingOffset");
        const headingPositions = [
            headingOffset,
            vis.size.clone().sub(headingOffset)
        ];

        for(let i = 0; i < headingPositions.length; i++)
        {
            const textConfigHeading = new TextConfig({
                font: vis.get("fonts.heading"),
                size: vis.get("cards.bids.fontSizeHeading")
            }).alignCenter();
            const shadowEffect = new DropShadowEffect({ color: "#000000", offset: new Point(0,0.05).scale(textConfigHeading.size) })
            const resTextHeading = new ResourceText({ text: "Power Card", textConfig: textConfigHeading });
            const opTextHeading = new LayoutOperation({
                pos: headingPositions[i],
                size: vis.get("cards.bids.headingDims"),
                rot: (i == 0) ? 0 : Math.PI,
                pivot: Point.CENTER,
                fill: vis.inkFriendly ? "#000000" : "#FFFFFF",
                effects: [shadowEffect]
            });
            group.add(resTextHeading, opTextHeading);
        }

        // the icon illustrating the bid
        const resIcon = vis.getResource("bids");
        const effects = vis.inkFriendly ? [new InvertEffect()] : []
        const opIcon = new LayoutOperation({
            pos: vis.get("cards.bids.iconPos"),
            size: vis.get("cards.bids.iconDims"),
            pivot: Point.CENTER,
            effects: effects,
            frame: data.frame
        });
        group.add(resIcon, opIcon);

        // the text explaining the bid
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("cards.bids.fontSize")
        }).alignCenter();
        const resText = new ResourceText({ text: data.desc, textConfig: textConfig });
        const opText = new LayoutOperation({
            pos: vis.get("cards.bids.textPos"),
            size: vis.get("cards.bids.textDims"),
            pivot: Point.CENTER,
            fill: vis.inkFriendly ? "#000000" : "#FFFFFF",
        });
        group.add(resText, opText);
    }

    drawOverlay(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(vis.inkFriendly) { return; }

        const res = vis.getResource("card_templates");
        const op = new LayoutOperation({
            size: vis.size,
            frame: TEMPLATES.texture_overlay.frame,
            composite: "overlay",
            alpha: vis.get("cards.overlay.alpha")
        })
        group.add(res, op);
    }
}