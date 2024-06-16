import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import fillResourceGroup from "js/pq_games/layout/canvas/fillResourceGroup";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { CARD_TEMPLATES, CONTRACTS, CardType, DYNAMIC_OPTIONS, ICON_ARRANGEMENTS, MISC, NUMBERS_AS_STRINGS, SPECIAL_CARDS, SUITS } from "../js_shared/dict";
import Point from "js/pq_games/tools/geometry/point";
import TextConfig, { TextStyle } from "js/pq_games/layout/text/textConfig";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import BlurEffect from "js/pq_games/layout/effects/blurEffect";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import drawDynamicContract from "./drawDynamicContract";
import LayoutEffect from "js/pq_games/layout/effects/layoutEffect";

export default class Card
{
    type:CardType
    suit: string
    number: number
    contractKey: string;
    specialKey: string;
    dynamicDetails: any[];

    constructor(type:CardType)
    {
        this.type = type;
    }

    toRulesString()
    {
        return "NUM = " + this.getNumberAsString() + " / SUIT = " + this.suit;
    }

    setSpecial(s:string) { this.specialKey = s; }
    setContract(c:string, dynDetails:any[]) { this.contractKey = c; this.dynamicDetails = dynDetails; }
    setSuitAndNumber(s:string, n:number)
    {
        this.suit = s;
        this.number = n;
    }

    getDynamicDetails() { return this.dynamicDetails; }
    getNumberAsString()
    {
        return NUMBERS_AS_STRINGS[(this.number - 1)];
    }

    getScore(success = false)
    {
        const score = CONTRACTS[this.contractKey].score ?? 1;
        if(success) { return score; }
        return -Math.ceil(0.6 * (10 - score));
    }

    async drawForRules(vis:MaterialVisualizer)
    {
        return this.draw(vis);
    }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        fillCanvas(ctx, "#FFFFFF");
        const group = new ResourceGroup();

        this.drawBackground(vis, group);
        this.drawSuitAndNumber(vis, group);
        this.drawAction(vis, group);
        this.drawContractCard(vis, group);

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // solid background color
        const col = "#FFFFFF";
        fillResourceGroup(vis.size, group, col);

        // fixed template for card (which does most of the work)
        const resTemplate = vis.getResource("card_templates");
        const templateData = CARD_TEMPLATES[this.type];
        const alpha = vis.inkFriendly ? 0.5 : 1.0;

        const opTemplate = new LayoutOperation({
            dims: vis.size,
            frame: templateData.frame,
            alpha: alpha,
            effects: vis.inkFriendlyEffect
        });
        group.add(resTemplate, opTemplate);
    }

    drawSuitAndNumber(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.suit || !this.number) { return; }

        const suitData = SUITS[this.suit];

        //
        // first, draw them at the corners
        //
        const offset = vis.get("cards.suitNumber.offsetFromEdge");
        const positions = [
            offset.clone(),
            vis.size.clone().sub(offset)
        ]

        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.suitNumber.fontSize")
        }).alignCenter();

        const resText = new ResourceText({ text: this.getNumberAsString(), textConfig });
        const resSuits = vis.getResource("suits");
        const iconDims = vis.get("cards.suitNumber.iconDims");
        const suitFrame = SUITS[this.suit].frame;
        const offsetBetweenTextAndIcon = 1.1 * (0.5*textConfig.size + 0.5*iconDims.y);

        for(let i = 0; i < positions.length; i++)
        {
            const pos = positions[i];
            const rot = (i == 0) ? 0 : Math.PI;
            const dir = (i == 0) ? 1 : -1;
            const textColor = vis.inkFriendly ? "#333333" : suitData.color;

            // place the number
            const opText = new LayoutOperation({
                translate: pos,
                dims: iconDims.clone().scale(2),
                fill: textColor,
                rotation: rot,
                pivot: Point.CENTER
            })
            group.add(resText, opText);

            // place the suit icon below
            const posIcon = pos.clone().add(new Point(0, dir * offsetBetweenTextAndIcon));
            const opIcon = new LayoutOperation({
                translate: posIcon,
                dims: iconDims,
                frame: suitFrame,
                rotation: rot,
                pivot: Point.CENTER,
                effects: vis.inkFriendlyEffect
            });
            group.add(resSuits, opIcon);
        }

        //
        // then create the correct arrangement for them in the middle
        //
        const drawArrangement = !this.specialKey;
        if(!drawArrangement) { return; }

        const arrangement = ICON_ARRANGEMENTS[this.number];
        const anchorPos = vis.center.clone();
        let iconDimsCenter = vis.get("cards.suitNumber.iconDimsCenter");
        if(this.number == 1) { iconDimsCenter = vis.get("cards.suitNumber.iconDimsCenterSingle"); }

        const iconArrangeScalar = vis.get("cards.suitNumber.iconArrangeScalar");

        const finalPositions = [];
        for(const pos of arrangement)
        {
            const finalPos = anchorPos.clone().add(pos.clone().scale(iconArrangeScalar));
            finalPositions.push(finalPos);
        }

        const shadowEnabled = vis.get("cards.suitNumber.iconShadow.enabled");
        const effects:LayoutEffect[] = shadowEnabled ? [new DropShadowEffect({ 
            offset: vis.get("cards.suitNumber.iconShadow.offset"),
            color: vis.get("cards.suitNumber.iconShadow.color"),
            blurRadius: vis.get("cards.suitNumber.iconShadow.blur"),
        })] : [];
        effects.push(...vis.inkFriendlyEffect);

        for(const pos of finalPositions)
        {
            const opIcon = new LayoutOperation({
                translate: pos,
                dims: iconDimsCenter,
                pivot: Point.CENTER,
                frame: suitFrame,
                effects
            });
            group.add(resSuits, opIcon);
        }
    }

    drawAction(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.specialKey) { return; }

        const actionData = SPECIAL_CARDS[this.specialKey];

        // draw the actual text
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("cards.action.fontSize"),
            style: TextStyle.ITALIC,
        }).alignCenter();

        const resText = new ResourceText({ text: actionData.desc, textConfig });
        const opText = new LayoutOperation({
            translate: vis.get("cards.action.textBoxPos"),
            dims: vis.get("cards.action.textBoxDims"),
            fill: "#000000",
            pivot: Point.CENTER
        });
        group.add(resText, opText);

        this.addBannerToBox(vis, group, opText.translate.clone(), opText.dims.clone(), actionData.label)
    }

    addBannerToBox(vis: MaterialVisualizer, group:ResourceGroup, boxCenter:Point, boxSize:Point, txt:string, scaleFactor = 1.0)
    {
        // draw the banner (which supports the text over it)
        const resMisc = vis.getResource("misc");
        const bannerPos = boxCenter.clone().add(new Point(0, -0.5*boxSize.y));
        const bannerDims = vis.get("cards.shared.bannerDims").clone().scale(scaleFactor);

        const opBanner = new LayoutOperation({
            translate: bannerPos,
            dims: bannerDims,
            frame: MISC.banner.frame,
            pivot: Point.CENTER
        });
        group.add(resMisc, opBanner);

        // draw the text on top
        const textConfigAction = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.shared.bannerFontSize") * scaleFactor
        }).alignCenter();

        const resTextAction = new ResourceText({ text: txt, textConfig: textConfigAction });
        const opTextAction = new LayoutOperation({
            translate: bannerPos,
            dims: bannerDims,
            fill: "#FFFFFF",
            pivot: Point.CENTER
        });
        group.add(resTextAction, opTextAction);
    }

    drawContractCard(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.contractKey) { return; }

        const contractData = CONTRACTS[this.contractKey];
        const contractHasRule = contractData.rule;
        const dynDetails = this.dynamicDetails;

        const rectBlur = vis.get("cards.contract.rectBlur");
        const rectAlpha = vis.get("cards.contract.rectAlpha");

        const scores = [this.getScore(true), this.getScore(false)];
        const scoreOffset = vis.get("cards.contract.score.offset");
        const scorePositions = [
            scoreOffset.clone(),
            new Point(vis.size.x - scoreOffset.x, scoreOffset.y)
        ];

        // draw the (colored) numbers for positive and negative score
        const textConfigScore = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.contract.score.fontSize")
        }).alignCenter();

        for(let i = 0; i < 2; i++)
        {
            const side = ["good", "bad"][i];
            const pos = scorePositions[i];
            const resText = new ResourceText({ text: scores[i].toString(), textConfig: textConfigScore });
            const textColor = vis.inkFriendly ? "#FFFFFF" : vis.get("cards.contract.score.textColor." + side);
            const opText = new LayoutOperation({
                translate: pos,
                dims: new Point(textConfigScore.size*4),
                fill: textColor,
                pivot: Point.CENTER
            })
            group.add(resText, opText);
        }

        // (dynamically) draw image of the specific contract
        this.drawContractVisualization(vis, group);

        // draw the contract text
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("cards.contract.fontSize"),
            resLoader: vis.resLoader,
        }).alignCenter();

        const pos = contractHasRule ? vis.get("cards.contract.textBoxPosAlt") : vis.get("cards.contract.textBoxPos");
        const dims = contractHasRule ? vis.get("cards.contract.textBoxDimsAlt") : vis.get("cards.contract.textBoxDims");
        let offsetFromBanner = contractHasRule ? 0.066 : 0.1;

        this.drawBlurredRect(group, pos, dims, rectBlur, rectAlpha);

        const bannerDims = vis.get("cards.shared.bannerDims").clone();
        const str = this.fillInDynamically(contractData.desc, dynDetails);
        const resText = new ResourceText({ text: str, textConfig })
        const opText = new LayoutOperation({
            translate: pos.clone().add(new Point(0, offsetFromBanner*bannerDims.y)),
            dims,
            fill: "#000000",
            pivot: Point.CENTER
        });
        group.add(resText, opText);

        this.addBannerToBox(vis, group, pos, dims, "CONTRACT");

        // draw the special rule text, if enabled
        if(contractHasRule)
        {
            const scaleFactor = vis.get("cards.contract.rule.scaleFactor");
            const textConfigRule = textConfig.clone(true);
            textConfigRule.size *= scaleFactor;
            textConfigRule.style = TextStyle.ITALIC; // let's use that really nice italic font for the unique rules then; they should have no italic formatting inside themselves

            const posRule = vis.get("cards.contract.rule.textBoxPos");
            const dimsRule = vis.get("cards.contract.rule.textBoxDims");

            this.drawBlurredRect(group, posRule, dimsRule, rectBlur, rectAlpha);

            const resText = new ResourceText({ text: contractData.rule, textConfig: textConfigRule })
            const opText = new LayoutOperation({
                translate: posRule.clone().add(new Point(0, offsetFromBanner*bannerDims.y*scaleFactor)),
                dims: dimsRule,
                fill: "#000000",
                pivot: Point.CENTER
            });
            group.add(resText, opText);

            this.addBannerToBox(vis, group, posRule, dimsRule, "RULE", scaleFactor);
        }
    }

    // @TODO: should probably make this a core function of PQ GAMES
    drawBlurredRect(group:ResourceGroup, pos:Point, dims:Point, blur:number, alpha:number)
    {
        const rect = new Rectangle({ center: pos, extents: dims });
        const opRect = new LayoutOperation({
            fill: "#FFFFFF",
            alpha: 0.9,
            effects: [new BlurEffect(blur)]
        })
        group.add(new ResourceShape(rect), opRect);
    }

    fillInDynamically(s:string, options:any[]) : string
    {
        if(options.length <= 0) { return s; }

        const needles = Object.keys(DYNAMIC_OPTIONS);
        const needleOptionsWithIndex = [];

        // discover the right order of replacements
        let furthestIndexForNeedle = {};
        while(needleOptionsWithIndex.length < options.length)
        {
            for(const needle of needles)
            {
                if(!s.includes(needle)) { continue; }

                const fromIndex = (furthestIndexForNeedle[needle] ?? 0) + 1; // to ensure we don't just keep re-finding the same one over and over
                const position = s.indexOf(needle, fromIndex);
                if(position < 0) { continue; }

                needleOptionsWithIndex.push({ idx: position, val: needle });
                furthestIndexForNeedle[needle] = position;
            }
        }
        needleOptionsWithIndex.sort((a,b) => { return a.idx - b.idx; });

        // then simply substitute in that order
        for(let i = 0; i < options.length; i++)
        {
            const needle = needleOptionsWithIndex[i].val;
            let rep = options[i];

            // suits are replaced by their ICON / IMAGE equivalent
            if(needle == "%suit%")
            {
                const idx = DYNAMIC_OPTIONS["%suit%"].indexOf(rep);
                rep = DYNAMIC_OPTIONS["%suitImageStrings%"][idx];
            }

            // numbers are replaced by their STRING equivalent (mostly needed for 1 = Ace)
            if(needle == "%number%")
            {
                rep = NUMBERS_AS_STRINGS[rep - 1];
            }

            s = s.replace(needle, rep);
        }

        return s;
    }

    drawContractVisualization(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const contractData = CONTRACTS[this.contractKey];

        const hasStaticImage = contractData.frame || !contractData.drawDetails;
        const dims = vis.get("cards.contract.illustration.dims").clone();
        if(contractData.rule) { dims.scale(0.9); }
        if(hasStaticImage) { dims.scale(0.85); }
        
        let res;
        const op = new LayoutOperation({
            translate: vis.get("cards.contract.illustration.pos"),
            dims: dims,
            pivot: Point.CENTER,
            effects: vis.inkFriendlyEffect
        })

        if(hasStaticImage) {
            res = vis.getResource("custom_illustrations");
            op.frame = contractData.frame ?? 0;
            op.translate = op.translate.clone().sub(new Point(0, 0.115*op.dims.y));

            const shadowEnabled = vis.get("cards.contractDraw.shadow.enabled");
            const shadowEffects = shadowEnabled ? [new DropShadowEffect({ 
                offset: vis.get("cards.contractDraw.shadow.offset"),
                color: vis.get("cards.contractDraw.shadow.color"),
                blurRadius: vis.get("cards.contractDraw.shadow.blur"),
            })] : [];
            op.effects = shadowEffects;
        } else {
            res = drawDynamicContract(vis, contractData.drawDetails, this.dynamicDetails);

            // @NOTE: nasty exception, but saw no better way to make certain (vertical) layouts look just as good/centered on these cards
            const isVerticalLayout = contractData.drawDetails && contractData.drawDetails.length >= 3;
            if(isVerticalLayout)
            {
                op.translate = op.translate.clone().sub(new Point(0, 0.05*op.dims.y));
            }
        }

        group.add(res, op);
    }
}