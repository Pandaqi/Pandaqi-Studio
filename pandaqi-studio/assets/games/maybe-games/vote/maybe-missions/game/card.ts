import createContext from "js/pq_games/layout/canvas/createContext";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { CARD_TEMPLATES, CardGadgetData, CardPowerData, CardResourceData, CardSubType, CardType, IdentityCardType, MASTER_CARDS, MISC, MissionType, RESOURCES, VoteType } from "../shared/dict";
import Point from "js/pq_games/tools/geometry/point";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import getPositionsCenteredAround from "js/pq_games/tools/geometry/paths/getPositionsCenteredAround";
import TextConfig from "js/pq_games/layout/text/textConfig";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import StrokeAlign from "js/pq_games/layout/values/strokeAlign";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import BlurEffect from "js/pq_games/layout/effects/blurEffect";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";

export default class Card
{
    type: CardType;
    subType: CardSubType;
    num: number;
    rule: string;
    resources: CardResourceData;
    gadgets: CardGadgetData;
    powers: CardPowerData;

    randomText: string;
    masterIconFrame: number;

    constructor(t:CardType, s:CardSubType)
    {
        this.type = t;
        this.subType = s;
    }

    setRule(r:string) { this.rule = r; }
    setResources(d:CardResourceData) { this.resources = d; }
    setPowers(p:CardPowerData) { this.powers = p; }
    setRandomText(t:string) { this.randomText = t; }
    setMasterIcon(f:number) { this.masterIconFrame = f; }
    setGadgets(g:CardGadgetData) { this.gadgets = g; }

    isVote() { return this.type == CardType.VOTE; }
    hasRandomText() { return this.randomText != undefined; }
    hasRule() { return this.rule != undefined; }
    hasResources() { return this.resources != undefined; }
    hasPowers() { return this.powers != undefined; }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        const group = new ResourceGroup();

        this.drawBackground(vis, group);
        this.drawResources(vis, group);
        this.drawSpecial(vis, group);

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // card template (does most of the heavy lifting)
        const res = vis.getResource("card_templates");
        let key = "";
        if(this.type == CardType.MISSION) {
            if(this.subType == MissionType.MISSION) { key = "mission"; }
            else { key = "master"; }
        } else if(this.type == CardType.IDENTITY) {
            if(this.subType == IdentityCardType.PRIVATE) { key = "identity_private"; }
            else { key = "identity_public"; }
        } else if(this.type == CardType.VOTE) {
            if(this.subType == VoteType.YES) { key = "vote_yes"; }
            else { key = "vote_no"; }
        } else if(this.type == CardType.SHOP) {
            key = "shop";
        }

        const frame = CARD_TEMPLATES[key].frame;
        const alpha = vis.inkFriendly ? 0.5 : 1.0;
        const op = new LayoutOperation({
            pos: new Point(),
            size: vis.size,
            frame: frame,
            effects: vis.inkFriendlyEffect,
            alpha: alpha
        });
        group.add(res, op);
    }

    drawResources(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.hasResources()) { return; }

        const offsetY = vis.get("cards.resources.iconOffset").y;
        const iconDims = vis.get("cards.resources.iconDims");

        const iconOffsetCross = new Point(0, iconDims.y * vis.get("cards.resources.iconCrossOffsetY"));
        const iconDimsCross = iconDims.clone().scale(vis.get("cards.resources.iconDimsCrossFactor"));
        const resIcon = vis.getResource("misc");

        const dropShadowEffect = new DropShadowEffect({ blurRadius: vis.get("cards.shared.dropShadowRadius")});
        const effects = [dropShadowEffect, vis.inkFriendlyEffect].flat();

        for(let i = 0; i < 2; i++)
        {
            const type = i == 0 ? "good" : "bad";
            const resources = this.resources[type];
            const rot = i == 0 ? 0 : Math.PI;
            const anchor = new Point(vis.center.x, offsetY);
            if(type == "bad") { anchor.y = vis.size.y - offsetY; }

            const pos = getPositionsCenteredAround({ 
                pos: anchor,
                num: resources.length,
                size: iconDims,
            });

            for(let a = 0; a < pos.length; a++)
            {
                const data = resources[a];
                const tempPos = pos[a];
                const opIcon = new LayoutOperation({
                    pos: tempPos,
                    frame: RESOURCES[data.type].frame,
                    size: iconDims,
                    pivot: Point.CENTER,
                    rot: rot,
                    effects: effects
                });
                group.add(resIcon, opIcon);

                if(!data.cross) { continue; }

                let crossPos = tempPos.clone().sub(iconOffsetCross);
                if(i == 0) { crossPos = tempPos.clone().add(iconOffsetCross); }

                const opCross = new LayoutOperation({
                    pos: crossPos,
                    size: iconDimsCross,
                    frame: MISC.cross.frame,
                    rot: rot,
                    pivot: Point.CENTER,
                    effects: effects
                })
                group.add(resIcon, opCross);
            }
        }
    }

    drawSpecial(vis:MaterialVisualizer, group:ResourceGroup)
    {
        this.drawRandomText(vis, group);
        this.drawVoteNumber(vis, group);
        this.drawRule(vis, group);
        this.drawPowers(vis, group);
        this.drawGadgets(vis, group);
    }

    drawRandomText(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.hasRandomText()) { return; }

        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.randomText.fontSize"),
        }).alignCenter();

        const textColor = vis.get("cards.randomText.color");
        const strokeColor = vis.get("cards.randomText.colorStroke");
        const dropShadowEffect = new DropShadowEffect({ blurRadius: vis.get("cards.shared.dropShadowRadius")});

        const resText = new ResourceText({ text: this.randomText, textConfig: textConfig });
        const textBoxDims = new Point(vis.size.x*0.925, vis.size.y);
        const opText = new LayoutOperation({
            pos: vis.center,
            size: textBoxDims,
            fill: textColor,
            stroke: strokeColor,
            strokeWidth: vis.get("cards.randomText.strokeWidth"),
            strokeAlign: StrokeAlign.OUTSIDE,
            pivot: Point.CENTER,
            effects: [dropShadowEffect]
        });
        group.add(resText, opText);
    }

    drawVoteNumber(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.isVote()) { return; }

        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("votes.number.fontSize"),
        }).alignCenter();

        const side = (this.subType == VoteType.YES) ? "green" : "red";
        const textColor = vis.inkFriendly ? "#000000" : vis.get("cards.shared.textColor." + side);
        const strokeColor = vis.inkFriendly ? "#FFFFFF" : vis.get("votes.number.colorStroke");
        const pos = vis.get("votes.number.pos");
        const dropShadowEffect = new DropShadowEffect({ blurRadius: vis.get("cards.shared.dropShadowRadius")});

        const str = this.num.toString();
        const resText = new ResourceText({ text: str, textConfig: textConfig });
        const opText = new LayoutOperation({
            pos: pos,
            size: vis.size,
            fill: textColor,
            stroke: strokeColor,
            strokeWidth: vis.get("votes.number.strokeWidth"),
            strokeAlign: StrokeAlign.OUTSIDE,
            pivot: Point.CENTER,
            effects: [dropShadowEffect]
        });
        group.add(resText, opText);
    }

    drawBlurredRect(pos:Point, size:Point, blur:number, group:ResourceGroup)
    {
        const rect = new Rectangle({ center: pos, extents: size });
        const opRect = new LayoutOperation({
            fill: "#FFFFFF",
            alpha: 0.9,
            effects: [new BlurEffect(blur)]
        })
        group.add(new ResourceShape(rect), opRect);
    }

    drawRule(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.hasRule()) { return; }
        
        // draw the icon of the thing we're breaking into at the top
        const resMisc = vis.getResource("misc");
        const opIcon = new LayoutOperation({
            pos: vis.get("cards.master.iconPos"),
            size: vis.get("cards.master.iconDims"),
            frame: this.masterIconFrame,
            pivot: Point.CENTER,
        });
        group.add(resMisc, opIcon);

        // then the actual rule slightly below (with rect behind)
        const rectPos = vis.get("cards.master.rectPos");
        const rectDims = vis.get("cards.master.rectDims");
        this.drawBlurredRect(rectPos, rectDims, vis.get("cards.master.rectBlur"), group);

        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("cards.master.fontSize"),
            resLoader: vis.resLoader
        }).alignCenter();

        const textColor = vis.inkFriendly ? "#000000" : vis.get("cards.master.textColor");
        const ruleString = MASTER_CARDS[this.rule].desc;
        const resText = new ResourceText({ text: ruleString, textConfig: textConfig });
        const opText = new LayoutOperation({
            pos: rectPos,
            size: rectDims,
            fill: textColor,
            pivot: Point.CENTER
        });
        group.add(resText, opText);
    }

    drawPowers(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.hasPowers()) { return; }

        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("cards.identity.fontSize"),
            resLoader: vis.resLoader
        }).alignCenter();

        const textColor = vis.inkFriendly ? "#000000" : vis.get("cards.identity.textColor");
        for(let i = 0; i < 2; i++)
        {
            const type = (i == 0) ? "good" : "bad";
            const data = this.powers[type];

            const rectPos = vis.get("cards.identity.rectPos." + type);
            const rectDims = vis.get("cards.identity.rectDims");
            this.drawBlurredRect(rectPos, rectDims, vis.get("cards.identity.rectBlur"), group);

            const textDims = new Point(rectDims.x*0.95, rectDims.y);
            const resText = new ResourceText({ text: data, textConfig: textConfig });
            const opText = new LayoutOperation({
                pos: rectPos,
                size: textDims,
                fill: textColor,
                pivot: Point.CENTER
            });
            group.add(resText, opText);
        }
    }

    drawGadgets(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(this.type != CardType.SHOP) { return; }

        const resIcon = vis.getResource("misc");

        const offsetY = vis.get("cards.resources.iconOffset").y;
        const iconDims = vis.get("cards.resources.iconDims");

        const dropShadowEffect = new DropShadowEffect({ blurRadius: vis.get("cards.shared.dropShadowRadius")});
        const effects = [dropShadowEffect, vis.inkFriendlyEffect].flat();

        const offsetLabelY = vis.get("cards.shop.labelOffset").y;

        const offsetTextY = vis.get("cards.shop.textOffset").y;
        const textDims = vis.get("cards.shop.textBoxDims");
        const strokeWidthLabel = vis.get("cards.shop.strokeWidthLabel");

        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("cards.shop.fontSize"),
        }).alignCenter();

        const textConfigLabel = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.shop.fontSizeLabel"),
        }).alignCenter();

        for(let i = 0; i < 2; i++)
        {
            const type = i == 0 ? "green" : "red";
            const data = this.gadgets[type];
            const rot = i == 0 ? 0 : Math.PI;

            const textColor = vis.inkFriendly ? "#000000" : vis.get("cards.shared.textColor." + type);
            
            const anchor = new Point(vis.center.x, offsetY);
            const anchorText = new Point(vis.center.x, offsetTextY);
            const anchorLabel = new Point(vis.center.x, offsetLabelY);
            if(type == "red") 
            { 
                anchor.y = vis.size.y - anchor.y;
                anchorText.y = vis.size.y - anchorText.y;
                anchorLabel.y = vis.size.y - anchorLabel.y;
            }
            
            // draw the gadget name
            const resTextLabel = new ResourceText({ text: data.label, textConfig: textConfigLabel });
            const opTextLabel = new LayoutOperation({
                pos: anchorLabel,
                size: textDims,
                rot: rot,
                fill: textColor,
                stroke: "#FFFFFF",
                strokeWidth: strokeWidthLabel,
                strokeAlign: StrokeAlign.OUTSIDE,
                composite: vis.get("cards.shop.compositeLabel"),
                pivot: Point.CENTER
            });
            group.add(resTextLabel, opTextLabel);

            // draw the icons = cost of the gadget
            const positions = getPositionsCenteredAround({ 
                pos: anchor,
                num: data.cost.length,
                size: iconDims,
            });

            for(let a = 0; a < positions.length; a++)
            {
                const icon = data.cost[a];
                const pos = positions[a];
                const opIcon = new LayoutOperation({
                    pos: pos,
                    frame: RESOURCES[icon].frame,
                    size: iconDims,
                    pivot: Point.CENTER,
                    effects: effects,
                    rot: rot
                });
                group.add(resIcon, opIcon);
            }

            // draw the text = actual reward
            const str = data.reward;
            const resText = new ResourceText({ text: str, textConfig: textConfig });
            const opText = new LayoutOperation({
                pos: anchorText,
                size: textDims,
                rot: rot,
                fill: textColor,
                pivot: Point.CENTER,
            });
            group.add(resText, opText);
        }
    }
}