import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { BID_CARDS, CardType, MISC, NUMBER_ARRANGEMENTS, NUMBER_INDICES, Suit, TEMPLATES } from "../js_shared/dict";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import TextConfig from "js/pq_games/layout/text/textConfig";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import Point from "js/pq_games/tools/geometry/point";
import getRectangleCornersWithOffset from "js/pq_games/tools/geometry/paths/getRectangleCornersWithOffset";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";

export default class Card
{
    type: CardType;
    key: string;
    num: number;
    suit: Suit;

    constructor(type:CardType, num:number = 0, key:string = "")
    {
        this.num = num;
        this.key = key;
        this.type = type;
    }

    getTemplateKey()
    {
        if(this.type == CardType.REGULAR) { return "regular"; }
        if(this.type == CardType.BID) { return "bid"; }
        return "token";
    }

    getTintColor(vis:MaterialVisualizer)
    {
        if(vis.inkFriendly) { return "#111111"; }
        return MISC[this.suit].tint;
    }

    getBidData()
    {
        if(this.key == "") { return {}; }
        return BID_CARDS[this.key];
    }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        fillCanvas(ctx, "#FFFFFF");
        const group = new ResourceGroup();

        this.drawBackground(vis, group);

        if(this.type == CardType.REGULAR) {
            this.drawRegularCard(vis, group);
        } else if(this.type == CardType.BID) {
            this.drawBidCard(vis, group);
        } else if(this.type == CardType.TOKEN) {
            this.drawToken(vis, group);
        }

        this.drawOverlay(vis, group);

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const templateData = TEMPLATES[this.getTemplateKey()];
        if(vis.inkFriendly && templateData.inkFriendlyHide) { return; }

        const resTemp = vis.getResource("card_templates");
        const opBG = new LayoutOperation({
            dims: vis.size,
            frame: templateData.frame,
            effects: vis.inkFriendlyEffect,
        })
        group.add(resTemp, opBG);
    }

    drawRegularCard(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // the numbers in the corners
        // @TODO: SCALE DOWN DOUBLE DIGITS?
        const positions = getRectangleCornersWithOffset(vis.size, vis.get("cards.regular.numberOffset"));
        const scaleDown = this.num >= 10 ? vis.get("cards.regular.doubleDigitsScaleDown") : 1.0;
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.regular.fontSize") * scaleDown
        }).alignCenter();
        const resText = new ResourceText({ text: this.num.toString(), textConfig: textConfig });

        for(let i = 0; i < 2; i++)
        {
            const opText = new LayoutOperation({
                translate: positions[i*2], // we skip the top right and bottom left corner
                dims: new Point(2.0 * textConfig.size),
                pivot: Point.CENTER,
                fill: this.getTintColor(vis)
            });
            group.add(resText, opText);
        }

        // the suits neatly arranged
        const iconDims = vis.get("cards.regular.suitIconDims");
        const resMisc = vis.getResource("misc");
        const scalar = vis.get("cards.regular.suitIconArrangeScalar");
        const arrangementIndices = NUMBER_ARRANGEMENTS[this.num];
        for(let i = 0; i < this.num; i++)
        {
            const offset = NUMBER_INDICES[ arrangementIndices[i] ].clone().scale(scalar);
            const pos = vis.center.clone().add( offset );
            const opSuit = new LayoutOperation({
                translate: pos,
                dims: iconDims,
                pivot: Point.CENTER,
                frame: MISC[this.suit].frame,
            })
            group.add(resMisc, opSuit);
        }
    }

    getValue()
    {
        return this.getBidData().score ?? 0;
    }

    drawBidCard(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const data = this.getBidData();

        // score for this bid
        const textConfigScore = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.bid.score.fontSize")
        }).alignCenter();
        const resTextScore = new ResourceText({ text: data.score.toString(), textConfig: textConfigScore });
        const opTextScore = new LayoutOperation({
            translate: vis.get("cards.bid.score.pos"),
            dims: new Point(4.0 * textConfigScore.size),
            pivot: Point.CENTER,
            fill: "#FFFFFF"
        });
        group.add(resTextScore, opTextScore);

        // bonus bid marker, if it is one
        if(data.bonusBid)
        {
            const resMisc = vis.getResource("misc");
            const opBonusBid = new LayoutOperation({
                translate: vis.get("cards.bid.bonus.pos"),
                dims: vis.get("cards.bid.bonus.dims"),
                pivot: Point.CENTER,
                frame: MISC.bonus_bid.frame,
            })
            group.add(resMisc, opBonusBid);
        }

        // the unique icon visualizing what the bid does
        const resIcon = vis.getResource("bid_icons");
        const opIcon = new LayoutOperation({
            translate: vis.get("cards.bid.icon.pos"),
            dims: vis.get("cards.bid.icon.dims"),
            pivot: Point.CENTER,
            frame: data.frame
        })
        group.add(resIcon, opIcon);

        // the bid explanation text
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("cards.bid.textBox.fontSize")
        }).alignCenter();
        const resText = new ResourceText({ text: data.desc, textConfig: textConfig });
        const opText = new LayoutOperation({
            translate: vis.get("cards.bid.textBox.pos"),
            dims: vis.get("cards.bid.textBox.dims"),
            pivot: Point.CENTER,
            effects: [new DropShadowEffect({ color: "#FFFFFF", blurRadius: 0.3 * textConfig.size })],
            fill: "#000000"
        });
        group.add(resText, opText);
    }

    drawToken(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // the smaller numbers next to the heading
        const textConfigSmall = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.token.small.fontSize")
        }).alignCenter();
        const resTextSmall = new ResourceText({ text: this.num.toString(), textConfig: textConfigSmall });
        const anchorSmall = vis.get("cards.token.small.anchor")
        const offsetSmall = vis.get("cards.token.small.offset");
        const positions = [
            anchorSmall.clone().sub(offsetSmall),
            anchorSmall.clone().add(offsetSmall)
        ]

        for(const pos of positions)
        {
            const opTextSmall = new LayoutOperation({
                translate: pos,
                dims: new Point(2.0*textConfigSmall.size),
                pivot: Point.CENTER,
                fill: "#FFFFFF"
            })
            group.add(resTextSmall, opTextSmall);
        }

        // the big number in the center
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.token.fontSize")
        }).alignCenter();
        const resText = new ResourceText({ text: this.num.toString(), textConfig: textConfig });
        const opText = new LayoutOperation({
            translate: vis.get("cards.token.pos"),
            dims: vis.size,
            pivot: Point.CENTER,
            fill: vis.get("cards.token.fontColor")
        });
        group.add(resText, opText);
    }

    drawOverlay(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const templateData = TEMPLATES[this.getTemplateKey()];
        if(templateData.noOverlay) { return; }

        const resTemp = vis.getResource("card_templates");
        const opBG = new LayoutOperation({
            dims: vis.size,
            frame: TEMPLATES.overlay.frame,
            effects: vis.inkFriendlyEffect,
            flipX: Math.random() <= 0.5,
            flipY: Math.random() <= 0.5,
            composite: "overlay",
            alpha: vis.get("cards.overlay.alpha")
        })
        group.add(resTemp, opBG);
    }
    
}