import createContext from "js/pq_games/layout/canvas/createContext";
import { MISC, ReqType, SETS, SUB_TYPES, SUSPECTS, Type } from "../js_shared/dict";
import CONFIG from "../js_shared/config";
import strokeCanvas from "js/pq_games/layout/canvas/strokeCanvas";
import Point from "js/pq_games/tools/geometry/point";
import Visualizer from "./visualizer";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import Color from "js/pq_games/layout/color/color";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig, { TextAlign } from "js/pq_games/layout/text/textConfig";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import range from "js/pq_games/tools/random/range";
import ColorOverlayEffect from "js/pq_games/layout/effects/colorOverlayEffect";
import BlurEffect from "js/pq_games/layout/effects/blurEffect";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import shuffle from "js/pq_games/tools/random/shuffle";
import lerp from "js/pq_games/tools/numbers/lerp";

export default class Card
{
    type: Type; // CHARACTER or ACTION
    key: string;

    constructor(type:Type, key: string)
    {
        this.type = type;
        this.key = key;
    }

    async drawForRules(vis:Visualizer)
    {
        const ctx = createContext({ size: vis.size });

        let color = "#FFFFFF";
        fillCanvas(ctx, color);

        // @TODO => not even sure if an interactive example is possible here
        this.drawOutline(vis, ctx);
        return ctx.canvas;
    }

    async draw(vis:Visualizer)
    {
        const ctx = createContext({ size: vis.size });

        if(this.type == Type.ACTION) {
            await this.drawBackground(vis, ctx);
            await this.drawPhotographs(vis, ctx);
            await this.drawText(vis, ctx);
        } else if(this.type == Type.CHARACTER) {
            await this.drawBackgroundSuspect(vis, ctx);
            await this.drawSuspect(vis, ctx);
        }

        this.drawOutline(vis, ctx);
        return ctx.canvas;
    }

    // 
    // SUSPECTS
    //
    async drawBackgroundSuspect(vis:Visualizer, ctx)
    {
        // first solid color
        let color = vis.inkFriendly ? "#FFFFFF" : this.getDataSuspect().color;
        fillCanvas(ctx, color);

        // then fingerprint texture
        const res = vis.resLoader.getResource("fingerprints");
        const alpha = CONFIG.suspects.bg.alpha;
        const op = new LayoutOperation({
            dims: vis.size,
            alpha: alpha
        });
        await res.toCanvas(ctx, op);
    }

    async drawSuspect(vis:Visualizer, ctx)
    {
        // texts on the side
        const fontSize = CONFIG.suspects.illustration.fontSize * vis.sizeUnit;
        const textConfig = new TextConfig({
            font: CONFIG.fonts.heading,
            size: fontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE
        })
        let text = "Suspect";
        if(this.key == "loupe") { text = "Loupe"; }
        else if(this.key == "traitor") { text = "Traitor!"; }
        const textRes = new ResourceText({ text: text, textConfig: textConfig });

        const color = this.getDataSuspect().color;
        const colorLighten = new Color(color).lighten(CONFIG.suspects.illustration.textColorLighten);
        const positions = [
            new Point(fontSize, vis.center.y),
            new Point(vis.size.x - fontSize, vis.center.y)
        ]

        const shadowRadius = CONFIG.suspects.illustration.shadowRadius * vis.sizeUnit;
        const effects = [new DropShadowEffect({ blurRadius: shadowRadius })];
        const textDims = new Point(vis.size.y, 2*fontSize);

        for(let i = 0; i < 2; i++)
        {
            const rot = i == 0 ? -0.5 * Math.PI : 0.5 * Math.PI;
            const textOp = new LayoutOperation({
                translate: positions[i],
                dims: textDims,
                fill: colorLighten,
                rotation: rot,
                pivot: Point.CENTER,
                effects: effects
            })

            await textRes.toCanvas(ctx, textOp);
        }

        // main illustration in the center
        const res = vis.resLoader.getResource("suspects");
        const frame = this.getDataSuspect().frame;
        const illuDims = new Point(CONFIG.suspects.illustration.scaleFactor * vis.sizeUnit);
        const op = new LayoutOperation({
            frame: frame,
            translate: vis.center,
            dims: illuDims,
            pivot: Point.CENTER,
            effects: effects
        })
        await res.toCanvas(ctx, op);

        // paperclip at the top
        const resClip = vis.resLoader.getResource("misc");
        const frameClip = MISC.paperclip.frame;
        const dimsClip = new Point(CONFIG.suspects.illustration.paperClipScale * vis.sizeUnit);
        const opClip = new LayoutOperation({
            frame: frameClip,
            dims: dimsClip,
            translate: new Point(vis.center.x, 0),
            pivot: Point.CENTER
        })

        await resClip.toCanvas(ctx, opClip);
    }

    // 
    // PLAYING CARDS
    //
    async drawBackground(vis:Visualizer, ctx:CanvasRenderingContext2D)
    {
        // first solid color
        let color = vis.inkFriendly ? "#FFFFFF" : CONFIG.cards.shared.bgColor;
        fillCanvas(ctx, color);

        // then those stacked papers
        const res = vis.resLoader.getResource("papers");
        const op = new LayoutOperation({
            dims: vis.size,
        })
        await res.toCanvas(ctx, op);
    }

    getDataPlay() { return SETS[CONFIG.cardSet][this.key]; }
    getDataSuspect() { return SUSPECTS[this.key]; }
    getMainColor() { return new Color(SUB_TYPES[this.getDataPlay().subType].color); }

    async drawPhotographs(vis:Visualizer, ctx:CanvasRenderingContext2D)
    {
        const numPhotographs = CONFIG.cards.photographs.numPerCard.randomInteger();
        const photographCenter = new Point(vis.center.x, CONFIG.cards.photographs.yPos * vis.size.y);

        // the basic rectangles to make up the photograph
        const rectSize = CONFIG.cards.photographs.rectSize.clone().scale(vis.sizeUnit);
        const rectSizeUnit = Math.min(rectSize.x, rectSize.y);
        const rect = new Rectangle({ extents: rectSize });
        const shadowRadius = CONFIG.cards.photographs.shadowRadius * rectSizeUnit;
        const shadowOffset = new Point(CONFIG.cards.photographs.shadowOffset * rectSizeUnit);
        const shadowColor = CONFIG.cards.shared.shadowColor;
        const effects = [new DropShadowEffect({ blurRadius: shadowRadius, offset: shadowOffset, color: shadowColor })];
        const rectOp = new LayoutOperation({
            fill: "#000000",
            effects: effects
        })

        const padding = CONFIG.cards.photographs.padding.clone().scale(rectSizeUnit);

        const titleHeight = CONFIG.cards.photographs.rectHeightTitle * rectSize.y;
        const rectSizeTitle = new Point(rectSize.x - padding.x*2, titleHeight);
        const rectTitlePos = new Point(0, 0.5*rectSize.y-padding.y-0.5*rectSizeTitle.y);
        const rectTitle = new Rectangle({ center: rectTitlePos, extents: rectSizeTitle });
        const rectTitleOp = new LayoutOperation({
            fill: this.getMainColor()
        })

        const rectInnerSize = new Point(rectSize.x - padding.x*2, rectSize.y - padding.y*(2 + 0.5) - rectSizeTitle.y);
        const rectInnerSizeUnit = Math.min(rectInnerSize.x, rectInnerSize.y);
        const rectInnerPos = new Point(0, -0.5*rectSize.y + padding.y + 0.5*rectInnerSize.y);
        const rectInner = new Rectangle({ center: rectInnerPos, extents: rectInnerSize });
        const rectInnerTopLeft = rectInner.getTopLeft();
        const rectInnerOp = new LayoutOperation({
            fill: "#FFEFE6"
        })

        // the title/heading of the card
        const text = this.getDataPlay().label.toString();
        let fontSize = CONFIG.cards.photographs.titleFontSize * rectSizeUnit;
        if(text.length >= 15) { fontSize *= 0.75; }

        const textConfig = new TextConfig({
            font: CONFIG.fonts.heading,
            size: fontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE
        })
        const titleText = new ResourceText({ text: text, textConfig: textConfig });
        const titleTextCol = this.getMainColor().clone().lighten(CONFIG.cards.photographs.titleColorLighten);
        const titleShadowRadius = CONFIG.cards.photographs.titleShadowRadius * fontSize;
        const titleTextOp = new LayoutOperation({
            fill: titleTextCol,
            dims: rectSizeTitle,
            translate: rectTitlePos,
            pivot: Point.CENTER,
            effects: [new DropShadowEffect({ blurRadius: titleShadowRadius })]
        });

        // the optional requirements
        let loupe, suspect, loupeOp, suspectOp;
        const reqsPadding = CONFIG.cards.photographs.requirementPadding.clone().scale(rectSizeUnit);
        const reqsPaddingBetween = CONFIG.cards.photographs.requirementPaddingBetween * Math.min(reqsPadding.x, reqsPadding.y);
        let reqsPos = new Point(rectInnerTopLeft.x + reqsPadding.x, rectInnerTopLeft.y + reqsPadding.y);
        const reqsDims = new Point(CONFIG.cards.photographs.requirementDims * rectSizeUnit);
        const reqEffects = [new DropShadowEffect({ blurRadius: CONFIG.cards.photographs.requirementShadowRadius * reqsDims.x })];
        const dataPlay = this.getDataPlay();
        if(dataPlay.loupe && dataPlay.loupe != ReqType.NEUTRAL)
        {
            const frame = dataPlay.loupe == ReqType.CANT ? MISC.loupe_cant.frame : MISC.loupe.frame;
            loupe = vis.resLoader.getResource("misc");
            loupeOp = new LayoutOperation({
                frame: frame,
                translate: reqsPos,
                dims: reqsDims,
                effects: reqEffects,
            })

            reqsPos = reqsPos.clone().move(new Point(0, reqsDims.y + reqsPaddingBetween));
        }

        if(dataPlay.suspect && dataPlay.suspect != ReqType.NEUTRAL)
        {
            const frame = dataPlay.suspect == ReqType.CANT ? MISC.suspect_cant.frame : MISC.suspect.frame;
            suspect = vis.resLoader.getResource("misc");
            suspectOp = new LayoutOperation({
                frame: frame,
                translate: reqsPos,
                dims: reqsDims,
                effects: reqEffects
            })
        }

        // the main illustration
        const illustration = vis.resLoader.getResource(CONFIG.cardSet);
        const frame = this.getDataPlay().frame;
        const illuDims = new Point(rectInnerSizeUnit * CONFIG.cards.illustration.scaleFactor);
        const illustrationOp = new LayoutOperation({
            frame: frame,
            translate: rectInnerPos,
            dims: illuDims,
            pivot: Point.CENTER
        });


        // create one group ( = set of instructions), then repeat it several times with different settings (such as rotation)
        const group = new ResourceGroup();
        group.add(new ResourceShape({ shape: rect }), rectOp);
        group.add(new ResourceShape({ shape: rectInner }), rectInnerOp);
        group.add(new ResourceShape({ shape: rectTitle }), rectTitleOp);

        const maxPhotoRotation = CONFIG.cards.photographs.maxRotation;
        const alphaJumps = (1.0 / numPhotographs);
        let topPhotoRotation = 0;
        const rotations = shuffle(this.createPhotoRotations(numPhotographs));

        for(let i = 0; i < numPhotographs; i++)
        {
            const randRotation = rotations.pop();
            const overlay = Color.BLACK.clone();
            const alpha = (i + 1) * alphaJumps;
            overlay.a = alpha;

            const isTopPhoto = i == numPhotographs - 1;
            if(isTopPhoto)
            {
                topPhotoRotation = randRotation;
                group.add(titleText, titleTextOp);
                group.add(illustration, illustrationOp);
                if(loupe) { group.add(loupe, loupeOp); }
                if(suspect) { group.add(suspect, suspectOp); }
            }

            const groupOp = new LayoutOperation({
                translate: photographCenter,
                rotation: randRotation,
                dims: illuDims, // @TODO: checking the best way to give dims to layoutoperation
                effects: [
                    new ColorOverlayEffect(overlay)
                ],
                alpha: alpha
            })

            await group.toCanvas(ctx, groupOp);
        }

        // paperclip at the top
        const resClip = vis.resLoader.getResource("misc");
        const frameClip = MISC.paperclip.frame;
        const dimsClip = new Point(CONFIG.cards.illustration.paperClipScale * vis.sizeUnit);
        const offsetClip = CONFIG.cards.illustration.paperClipOffset.clone().scale(vis.sizeUnit);
        const offsetDir = topPhotoRotation > 0 ? -1 : 1;
        const opClip = new LayoutOperation({
            frame: frameClip,
            dims: dimsClip,
            translate: new Point(vis.center.x + offsetDir * offsetClip.x, offsetClip.y),
            flipX: offsetDir < 0,
            pivot: Point.CENTER
        })

        await resClip.toCanvas(ctx, opClip);
    }

    createPhotoRotations(num:number)
    {
        const bounds = CONFIG.cards.photographs.maxRotation;
        const leftMax = -bounds.random();
        const rightMax = bounds.random();
        const numSlots = num + 2;
        const arr = [];
        for(let i = 0; i < numSlots; i++)
        {
            const factor = i / (numSlots - 1);
            arr.push(lerp(leftMax, rightMax, factor));
        }
        return arr;
    }

    async drawText(vis:Visualizer, ctx:CanvasRenderingContext2D)
    {
        // the faded background rect for more legibility/contrast
        const pos = new Point(vis.center.x, CONFIG.cards.text.yPos * vis.size.y);
        const size = CONFIG.cards.text.rectSize.clone().scale(vis.size);
        const rect = new Rectangle({ center: pos, extents: size });
        const rectColor = CONFIG.cards.text.rectColor;
        const rectBlur = CONFIG.cards.text.rectBlur * Math.min(size.x, size.y);
        const rectOp = new LayoutOperation({
            fill: rectColor,
            effects: [
                new BlurEffect(rectBlur)
            ]
        })

        const resShape = new ResourceShape({ shape: rect });
        await resShape.toCanvas(ctx, rectOp);

        // then the actual text
        const fontSize = CONFIG.cards.text.fontSize * vis.sizeUnit;
        const textConfig = new TextConfig({
            font: CONFIG.fonts.body,
            size: fontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE,
            resLoader: vis.resLoader
        })
        const text = this.getDataPlay().desc.toString();
        const textRes = new ResourceText({ text: text, textConfig: textConfig });
        const effects = [new DropShadowEffect({ offset: new Point(CONFIG.cards.text.hardShadowOffset * fontSize) })];
        const op = new LayoutOperation({
            fill: "#000000",
            translate: pos,
            dims: size,
            pivot: Point.CENTER,
            effects: effects
        })
        await textRes.toCanvas(ctx, op);
    }

    drawOutline(vis:Visualizer, ctx:CanvasRenderingContext2D)
    {
        const outlineSize = CONFIG.cards.outline.size * vis.sizeUnit;
        strokeCanvas(ctx, CONFIG.cards.outline.color, outlineSize);
    }
}