
import { MaterialVisualizer, createContext, ResourceGroup, fillCanvas, LayoutOperation, TextConfig, TextAlign, ResourceText, Color, Vector2, DropShadowEffect, GrayScaleEffect, Rectangle, ResourceShape, shuffle, ColorOverlayEffect, lerp, BlurEffect, strokeCanvas, colorLighten } from "lib/pq-games";
import { CONFIG } from "../shared/config";
import { MISC, PType, ReqType, SETS, SUB_TYPES, SUSPECTS, Type } from "../shared/dict";

export default class Card
{
    type: Type; // CHARACTER or ACTION
    key: string;

    constructor(type:Type, key: string)
    {
        this.type = type;
        this.key = key;
    }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        const group = new ResourceGroup();

        if(this.type == Type.ACTION) {
            this.drawBackground(vis, ctx, group);
            this.drawPhotographs(vis, group);
            this.drawText(vis, group);
        } else if(this.type == Type.CHARACTER) {
            this.drawBackgroundSuspect(vis, ctx, group);
            this.drawSuspect(vis, group);
        }

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    // 
    // SUSPECTS
    //
    async drawBackgroundSuspect(vis:MaterialVisualizer, ctx, group:ResourceGroup)
    {
        // first solid color
        let color = vis.inkFriendly ? "#FFFFFF" : this.getDataSuspect().color;
        fillCanvas(ctx, color);

        if(vis.inkFriendly) { return; }

        // then fingerprint texture
        const res = vis.resLoader.getResource("fingerprints");
        const alpha = vis.get("suspects.bg.alpha");
        const op = new LayoutOperation({
            size: vis.size,
            alpha: alpha
        });
        group.add(res, op);
    }

    async drawSuspect(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const dataSuspect = this.getDataSuspect();

        // texts on the side
        const fontSize = vis.get("suspects.illustration.fontSize") * vis.sizeUnit;
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: fontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE
        })
        let text = "Suspect";
        if(this.key == "loupe") { text = "Loupe"; }
        else if(this.key == "traitor") { text = "Traitor!"; }
        const textRes = new ResourceText({ text: text, textConfig: textConfig });

        const color = dataSuspect.color;
        const colorLightened = colorLighten(new Color(color), vis.get("suspects.illustration.textColorLighten"));
        const positions = [
            new Vector2(fontSize, vis.center.y),
            new Vector2(vis.size.x - fontSize, vis.center.y)
        ]

        const shadowRadius = vis.get("suspects.illustration.shadowRadius") * vis.sizeUnit;
        const effects = [new DropShadowEffect({ blurRadius: shadowRadius })];
        const textDims = new Vector2(vis.size.y, 2*fontSize);

        for(let i = 0; i < 2; i++)
        {
            const rot = i == 0 ? -0.5 * Math.PI : 0.5 * Math.PI;
            const textOp = new LayoutOperation({
                pos: positions[i],
                size: textDims,
                fill: colorLightened,
                rot: rot,
                pivot: Vector2.CENTER,
                effects: effects
            })

            group.add(textRes, textOp);
        }

        const grayScaleEffects = vis.inkFriendly ? [new GrayScaleEffect()] : []

        // special powers further inward
        const hasSpecialPower = dataSuspect.type && dataSuspect.power;
        if(hasSpecialPower)
        {
            const extraOffset = vis.get("suspects.power.extraEdgeOffset") * vis.sizeUnit;
            const powerIconDims = new Vector2(vis.get("suspects.power.iconSize") * vis.sizeUnit);
            const offset = new Vector2(0.5 * fontSize + 0.5 * powerIconDims.x + extraOffset, 0);
            const positionsPower = [
                positions[0].clone().move(offset),
                positions[1].clone().move(offset.negate())
            ]
    
            for(let i = 0; i < 2; i++)
            {
                // first icon is general type (when power triggers), second is suspect-specific power
                const res = (i == 0) ? vis.resLoader.getResource("misc") : vis.resLoader.getResource("suspect_powers");
                let frame = dataSuspect.type == PType.DEATH ? MISC.power_skull.frame : MISC.power_card.frame;
                if(i == 1) { frame = dataSuspect.frame; }
    
                const iconOp = new LayoutOperation({
                    frame: frame,
                    pos: positionsPower[i],
                    size: powerIconDims,
                    effects: grayScaleEffects,
                    pivot: Vector2.CENTER
                })

                group.add(res, iconOp);
            }
        }

        // main illustration in the center
        const res = vis.resLoader.getResource("suspects");
        const frame = dataSuspect.frame;
        const illuDims = new Vector2(vis.get("suspects.illustration.scaleFactor") * vis.sizeUnit);
        const op = new LayoutOperation({
            frame: frame,
            pos: vis.center,
            size: illuDims,
            pivot: Vector2.CENTER,
            effects: [effects, grayScaleEffects].flat()
        })
        group.add(res, op);

        // paperclip at the top
        const resClip = vis.resLoader.getResource("misc");
        const frameClip = MISC.paperclip.frame;
        const sizeClip = new Vector2(vis.get("suspects.illustration.paperClipScale") * vis.sizeUnit);
        const opClip = new LayoutOperation({
            frame: frameClip,
            size: sizeClip,
            pos: new Vector2(vis.center.x, 0),
            pivot: Vector2.CENTER
        })

        group.add(resClip, opClip);
    }

    // 
    // PLAYING CARDS
    //
    drawBackground(vis:MaterialVisualizer, ctx, group:ResourceGroup)
    {
        // first solid color
        let color = vis.inkFriendly ? "#FFFFFF" : vis.get("cards.shared.bgColor");
        fillCanvas(ctx, color);

        // then those stacked papers
        const res = vis.resLoader.getResource("papers");
        const effects = vis.inkFriendly ? [new GrayScaleEffect()] : []
        const op = new LayoutOperation({
            size: vis.size,
            effects: effects
        })
        group.add(res, op);
    }

    getCurrentSet() : string
    {
        for(const [key,data] of Object.entries(SETS))
        {
            if(Object.keys(data).includes(this.key)) { return key }
        }
        return "base"
    }

    getDataPlay() { return SETS[this.getCurrentSet()][this.key]; }
    getDataSuspect() { return SUSPECTS[this.key]; }
    getMainColor() { return new Color(SUB_TYPES[this.getDataPlay().subType].color); }

    async drawPhotographs(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const numPhotographs = vis.get("cards.photographs.numPerCard").randomInteger();
        const photographCenter = new Vector2(vis.center.x, vis.get("cards.photographs.yPos") * vis.size.y);

        // the basic rectangles to make up the photograph
        const rectSize = vis.get("cards.photographs.rectSize").clone().scale(vis.sizeUnit);
        const rectSizeUnit = Math.min(rectSize.x, rectSize.y);
        const rect = new Rectangle({ extents: rectSize });
        const shadowRadius = vis.get("cards.photographs.shadowRadius") * rectSizeUnit;
        const shadowOffset = new Vector2(vis.get("cards.photographs.shadowOffset") * rectSizeUnit);
        const shadowColor = vis.get("cards.shared.shadowColor");
        const effects = [new DropShadowEffect({ blurRadius: shadowRadius, offset: shadowOffset, color: shadowColor })];
        const rectOp = new LayoutOperation({
            fill: "#000000",
            effects: effects
        })

        const padding = vis.get("cards.photographs.padding").clone().scale(rectSizeUnit);

        const titleHeight = vis.get("cards.photographs.rectHeightTitle") * rectSize.y;
        const rectSizeTitle = new Vector2(rectSize.x - padding.x*2, titleHeight);
        const rectTitlePos = new Vector2(0, 0.5*rectSize.y-padding.y-0.5*rectSizeTitle.y);
        const rectTitle = new Rectangle({ center: rectTitlePos, extents: rectSizeTitle });
        const rectTitleOp = new LayoutOperation({
            fill: this.getMainColor()
        })

        const rectInnerSize = new Vector2(rectSize.x - padding.x*2, rectSize.y - padding.y*(2 + 0.5) - rectSizeTitle.y);
        const rectInnerSizeUnit = Math.min(rectInnerSize.x, rectInnerSize.y);
        const rectInnerPos = new Vector2(0, -0.5*rectSize.y + padding.y + 0.5*rectInnerSize.y);
        const rectInner = new Rectangle({ center: rectInnerPos, extents: rectInnerSize });
        const rectInnerTopLeft = rectInner.getTopLeft();
        const rectInnerOp = new LayoutOperation({
            fill: "#FFEFE6"
        })

        // the title/heading of the card
        const text = this.getDataPlay().label.toString();
        let fontSize = vis.get("cards.photographs.titleFontSize") * rectSizeUnit;
        if(text.length >= 15) { fontSize *= 0.75; }

        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: fontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE
        })
        const titleText = new ResourceText({ text: text, textConfig: textConfig });
        const titleTextCol = colorLighten(this.getMainColor(), vis.get("cards.photographs.titleColorLighten"));
        const titleShadowRadius = vis.get("cards.photographs.titleShadowRadius") * fontSize;
        const titleTextOp = new LayoutOperation({
            fill: titleTextCol,
            size: rectSizeTitle,
            pos: rectTitlePos,
            pivot: Vector2.CENTER,
            effects: [new DropShadowEffect({ blurRadius: titleShadowRadius })]
        });

        // the optional requirements
        let loupe, suspect, loupeOp, suspectOp;
        const reqsPadding = vis.get("cards.photographs.requirementPadding").clone().scale(rectSizeUnit);
        const reqsPaddingBetween = vis.get("cards.photographs.requirementPaddingBetween") * Math.min(reqsPadding.x, reqsPadding.y);
        let reqsPos = new Vector2(rectInnerTopLeft.x + reqsPadding.x, rectInnerTopLeft.y + reqsPadding.y);
        const reqsDims = new Vector2(vis.get("cards.photographs.requirementDims") * rectSizeUnit);
        const reqEffects = [new DropShadowEffect({ blurRadius: vis.get("cards.photographs.requirementShadowRadius") * reqsDims.x })];
        const dataPlay = this.getDataPlay();
        if(dataPlay.triggers && dataPlay.triggers != ReqType.ALWAYS)
        {
            const frame = dataPlay.triggers == ReqType.PLAY ? MISC.loupe_cant.frame : MISC.loupe.frame;
            loupe = vis.resLoader.getResource("misc");
            loupeOp = new LayoutOperation({
                frame: frame,
                pos: reqsPos,
                size: reqsDims,
                effects: reqEffects,
            })

            reqsPos = reqsPos.clone().move(new Vector2(0, reqsDims.y + reqsPaddingBetween));
        }

        /*
        if(dataPlay.suspect && dataPlay.suspect != ReqType.NEUTRAL)
        {
            const frame = dataPlay.suspect == ReqType.CANT ? MISC.suspect_cant.frame : MISC.suspect.frame;
            suspect = vis.resLoader.getResource("misc");
            suspectOp = new LayoutOperation({
                frame: frame,
                pos: reqsPos,
                size: reqsDims,
                effects: reqEffects
            })
        }
        */

        // the main illustration
        const illustration = vis.resLoader.getResource(this.getCurrentSet());
        const frame = this.getDataPlay().frame;
        const illuDims = new Vector2(rectInnerSizeUnit * vis.get("cards.illustration.scaleFactor"));
        const grayScaleEffects = vis.inkFriendly ? [new GrayScaleEffect()] : []
        const illustrationOp = new LayoutOperation({
            frame: frame,
            pos: rectInnerPos,
            size: illuDims,
            pivot: Vector2.CENTER,
            effects: grayScaleEffects
        });


        // create one group ( = set of instructions), then repeat it several times with different settings (such as rot)
        const groupSub = new ResourceGroup();
        groupSub.add(new ResourceShape({ shape: rect }), rectOp);
        groupSub.add(new ResourceShape({ shape: rectInner }), rectInnerOp);
        groupSub.add(new ResourceShape({ shape: rectTitle }), rectTitleOp);

        const maxPhotoRotation = vis.get("cards.photographs.maxRotation");
        const alphaJumps = (1.0 / numPhotographs);
        let topPhotoRotation = 0;
        const rots = shuffle(this.createPhotoRotations(vis, numPhotographs));

        for(let i = 0; i < numPhotographs; i++)
        {
            const randRotation = rots.pop();
            const overlay = Color.BLACK.clone();
            const alpha = (i + 1) * alphaJumps;
            overlay.a = alpha;

            const isTopPhoto = i == numPhotographs - 1;
            if(isTopPhoto)
            {
                topPhotoRotation = randRotation;
                groupSub.add(titleText, titleTextOp);
                groupSub.add(illustration, illustrationOp);
                if(loupe) { groupSub.add(loupe, loupeOp); }
                if(suspect) { groupSub.add(suspect, suspectOp); }
            }

            const groupOp = new LayoutOperation({
                pos: photographCenter,
                rot: randRotation,
                size: illuDims,
                effects: [
                    new ColorOverlayEffect(overlay)
                ],
                alpha: alpha
            })

            group.add(groupSub, groupOp);
        }

        // paperclip at the top
        const resClip = vis.resLoader.getResource("misc");
        const frameClip = MISC.paperclip.frame;
        const sizeClip = new Vector2(vis.get("cards.illustration.paperClipScale") * vis.sizeUnit);
        const offsetClip = vis.get("cards.illustration.paperClipOffset").clone().scale(vis.sizeUnit);
        const offsetDir = topPhotoRotation > 0 ? -1 : 1;
        const opClip = new LayoutOperation({
            frame: frameClip,
            size: sizeClip,
            pos: new Vector2(vis.center.x + offsetDir * offsetClip.x, offsetClip.y),
            flipX: offsetDir < 0,
            pivot: Vector2.CENTER
        })

        group.add(resClip, opClip);
    }

    createPhotoRotations(vis:MaterialVisualizer, num:number)
    {
        const bounds = vis.get("cards.photographs.maxRotation");
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

    async drawText(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // the faded background rect for more legibility/contrast
        const pos = new Vector2(vis.center.x, vis.get("cards.text.yPos") * vis.size.y);
        const size = vis.get("cards.text.rectSize").clone().scale(vis.size);
        const rect = new Rectangle({ center: pos, extents: size });
        const rectColor = vis.get("cards.text.rectColor");
        const rectBlur = vis.get("cards.text.rectBlur") * Math.min(size.x, size.y);
        const rectOp = new LayoutOperation({
            fill: rectColor,
            effects: [
                new BlurEffect(rectBlur)
            ]
        })

        const resShape = new ResourceShape({ shape: rect });
        group.add(resShape, rectOp);

        // then the actual text
        const fontSize = vis.get("cards.text.fontSize") * vis.sizeUnit;
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: fontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE,
            resLoader: vis.resLoader
        })
        const text = this.getDataPlay().desc.toString();
        const textRes = new ResourceText({ text: text, textConfig: textConfig });
        const effects = [new DropShadowEffect({ offset: new Vector2(vis.get("cards.text.hardShadowOffset") * fontSize) })];
        const op = new LayoutOperation({
            fill: "#000000",
            pos: pos,
            size: size,
            pivot: Vector2.CENTER,
            effects: effects
        })
        group.add(textRes, op);
    }
}