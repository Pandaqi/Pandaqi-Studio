import { MaterialVisualizer, createContext, ResourceGroup, LayoutOperation, fillResourceGroup, Vector2, LayoutEffect, DropShadowEffect, InvertEffect, ResourceShape, Line, TextConfig, TextAlign, ResourceText, ColorLike, Rectangle, BlurEffect } from "lib/pq-games";
import { ACTION_TYPES } from "../conquer/kaizerseat/shared/dict";
import { CardType, DarkAction, ActionType, CARD_TEMPLATES } from "./dictShared";

export default class CardThroneless
{
    cardType: CardType;   
    type: string;
    typeData: Record<string,any>
    dark: string|DarkAction; // empty if not a dark action, otherwise the action string itself
    disableAction: boolean

    constructor(cardType:CardType, type:string, typeData:Record<string,any>, dark = null)
    {
        this.cardType = cardType;
        this.type = type ?? "lionsyre";
        this.typeData = typeData ?? {};
        this.dark = dark;
    }

    hasAction() { return !this.disableAction && this.getAction() != null; }
    getAction()
    {
        if(this.isDark())
        {
            if(typeof this.dark == "string") { return { text: this.dark, type: ActionType.HANDLE }; }
            return this.dark;
        }
        if(!this.typeData) { return null; }
        return this.typeData.action;
    }

    isDark() { return this.dark != null; }
    getActionText()
    {
        if(!this.hasAction()) { return ""; }
        return this.getAction().text;
    }

    getActionType()
    {
        if(!this.hasAction()) { return ActionType.HANDLE; }
        return this.getAction().type;
    }

    getColor(obj, key = "color")
    {
        if(this.isDark()) { return obj[key + "Dark"]; }
        return obj[key];
    }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        const group = new ResourceGroup();

        this.drawBackground(vis, group);

        if(this.cardType == CardType.VOTE)
        {
            this.drawMainPart(vis, group);
            this.drawEdgePart(vis, group);
            this.drawGradientOverlay(vis, group);
        }

        if(this.cardType == CardType.THRONE || this.cardType == CardType.SEAT)
        {
            this.drawSpecialText(vis, group);
        }

        group.toCanvas(ctx);
        return ctx.canvas;
    }


    // setup + background
    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const customCardType = this.cardType != CardType.VOTE;
        if(customCardType)
        {
            const frame = CARD_TEMPLATES[this.cardType].frame;
            const res = vis.getResource("card_templates");
            const canvOp = new LayoutOperation({
                size: vis.size,
                frame: frame,
                effects: vis.inkFriendlyEffect
            });
            group.add(res, canvOp);
            return;
        }

        const bgColor = vis.inkFriendly ? "#FFFFFF" : this.getColor(this.typeData.bg);

        fillResourceGroup(vis.size, group, bgColor);

        if(this.typeData.bg.multicolor)
        {
            fillResourceGroup(vis.size, group, "#000000");

            const alpha = this.isDark() ? 0.25 : 1.0;
            const res = vis.getResource("multicolor_bg");
            const canvOp = new LayoutOperation({
                pos: vis.center,
                size: vis.size,
                pivot: Vector2.CENTER,
                alpha: alpha,
                effects: vis.inkFriendlyEffect
            });
            group.add(res, canvOp);
        }

        const scaleFactor = this.typeData.bg.icon.scale;
        const alpha = this.typeData.bg.icon.alpha;
        const offset = this.typeData.bg.icon.offset.clone().scale(vis.sizeUnit);
        const pos = vis.center.clone().add(offset);
        const iconSize = vis.sizeUnit*scaleFactor;

        const res = vis.getResource("crests_full");
        const canvOp = new LayoutOperation({
            frame: this.typeData.frame,
            pos: pos,
            size: new Vector2(iconSize),
            pivot: Vector2.CENTER,
            alpha: alpha,
            effects: vis.inkFriendlyEffect
        })
        group.add(res, canvOp);
    }

    // main part
    drawMainPart(vis:MaterialVisualizer, group:ResourceGroup)
    {
        this.drawSigil(vis, group);
        this.drawActionText(vis, group);
        this.drawSeparator(vis, group);
        this.drawName(vis, group);
        this.drawSlogan(vis, group);
    }

    drawSigil(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const scaleFactor = this.typeData.sigil.scale;
        const offset = this.typeData.sigil.offset.clone().scale(vis.sizeUnit);
        const pos = vis.center.clone().add(offset);
        const iconSize = vis.sizeUnit*scaleFactor;

        const res = vis.getResource("crests_full");
        const effects:LayoutEffect[] = vis.inkFriendlyEffect.slice();
        if(vis.get("cards.addShadowToSigil"))
        {
            const blurRadius = this.typeData.sigil.shadowBlur * vis.sizeUnit;
            const blurColor = this.typeData.sigil.shadowColor;
            effects.push( new DropShadowEffect({ color: blurColor, blurRadius: blurRadius }) );
        }

        const canvOp = new LayoutOperation({
            frame: this.typeData.frame,
            pos: pos,
            size: new Vector2(iconSize),
            pivot: Vector2.CENTER,
            effects: effects
        });
        group.add(res, canvOp);
    }

    drawSeparator(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const offset = this.typeData.action.offset.clone().scale(vis.sizeUnit);
        const pos = vis.center.clone().add(offset);

        // draw separator line exactly between name and action + icon at its heart
        const iconSize = this.typeData.separator.iconSize * vis.sizeUnit;
        const sepPos = new Vector2(vis.center.x, pos.y - 0.33*iconSize);
        const sepColor = this.getColor(this.typeData.separator);
        const sepLineLength = this.typeData.separator.length * vis.sizeUnit;
        const sepLineWidth = this.typeData.separator.lineWidth * vis.sizeUnit;
        const sepFrame = this.isDark() ? 1 : 0;

        const effects = sepColor == "#FFFFFF" ? [new InvertEffect()] : [];

        const res = vis.getResource("decoration_icons");
        const canvOp = new LayoutOperation({
            pos: sepPos,
            frame: sepFrame,
            size: new Vector2(iconSize),
            pivot: Vector2.CENTER,
            effects: effects
        });
        group.add(res, canvOp);
        
        const opLine = new LayoutOperation({
            stroke: sepColor,
            strokeWidth: sepLineWidth
        })

        for(let i = 0; i < 2; i++)
        {
            var dir = i == 0 ? 1 : -1;
            const startPos = new Vector2(sepPos.x + dir * 0.5 * iconSize, sepPos.y);
            const endPos = new Vector2(sepPos.x + dir * sepLineLength, sepPos.y);
            const resLine = new ResourceShape( new Line(startPos, endPos) );
            group.add(resLine, opLine);
        }
    }

    drawName(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const offset = this.typeData.name.offset.clone().scale(vis.sizeUnit);
        const shadowOffset = this.typeData.name.shadowOffset.clone().scale(vis.sizeUnit);
        const pos = vis.center.clone().add(offset);
        pos.x = vis.center.x;

        const fontSize = vis.get("cards.name.fontSize");
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: fontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE
        })
        const text = this.typeData.name.text;
        const resText = new ResourceText({ text: text, textConfig: textConfig });
        const bottomColor = vis.inkFriendly ? "#CCCCCC" : this.getColor(this.typeData.name, "colorBottom")
        const opText = new LayoutOperation({
            pos: pos.clone().add(shadowOffset),
            size: new Vector2(vis.size.x, 2*fontSize),
            fill: bottomColor,
            pivot: Vector2.CENTER
        })

        group.add(resText, opText);

        const topColor = vis.inkFriendly ? "#111111" : this.getColor(this.typeData.name, "colorTop");
        const opTextCopy = opText.clone(true);
        opTextCopy.pos = pos;
        opTextCopy.fill = new ColorLike(topColor);

        group.add(resText, opTextCopy);
    }

    drawActionText(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.hasAction()) { return; }

        const offset = this.typeData.action.offset.clone().scale(vis.sizeUnit);
        const pos = vis.center.clone().add(offset);
        const edgeOffset = 0.035*vis.sizeUnit;
        const maxWidth = this.typeData.action.maxWidth * vis.sizeUnit;
        const sloganHeight = 2 * vis.get("cards.slogan.fontSize");
        const maxHeight = vis.size.y - pos.y - sloganHeight - edgeOffset;
        //pos.setX(0.5 * (vis.size.x - maxWidth));
        pos.x = 0.5*vis.size.x;
        pos.y += 0.5*maxHeight;

        // @UPDATE: add a rectangle behind the text for readability
        const rectExtents = new Vector2(maxWidth*1.1, maxHeight + sloganHeight);
        const rect = new Rectangle({ center: new Vector2(pos.x, pos.y+0.5*sloganHeight), extents: rectExtents });
        const resRect = new ResourceShape({ shape: rect });
        const composite = vis.inkFriendly ? "source-over" : "overlay";
        const rectOp = new LayoutOperation({
            fill: this.isDark() ? "#000000" : "#FFFFFF",
            alpha: 0.8,
            composite: composite,
            effects: [new BlurEffect(0.06*maxWidth)]
        })

        group.add(resRect, rectOp);
        group.add(resRect, rectOp);

        const text = this.getActionText();
        const fill = this.getColor(this.typeData.action);
        const fontUsed = vis.get("highLegibility") ? "textLegible" : "text";

        const fontSize = vis.get("cards.actionText.fontSize." + fontUsed);
        const textConfig = new TextConfig({
            font: vis.get("fonts." + fontUsed),
            size: fontSize,
            alignHorizontal: TextAlign.START,
            alignVertical: TextAlign.MIDDLE
        })

        const resText = new ResourceText({ text: text, textConfig: textConfig });
        const opText = new LayoutOperation({
            pos: pos,
            size: new Vector2(maxWidth, maxHeight),
            fill: fill,
            pivot: Vector2.CENTER
        })

        group.add(resText, opText);
    }

    drawSpecialText(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.hasAction()) { return; }

        const pos = vis.get("cards.specialText.pos");
        const text = this.getActionText();

        const fontSize = vis.get("cards.specialText.fontSize");
        const textConfig = new TextConfig({
            font: vis.get("fonts.textLegible"),
            size: fontSize,
        }).alignCenter();

        const resText = new ResourceText({ text: text, textConfig: textConfig });
        const opText = new LayoutOperation({
            pos: pos,
            size: vis.get("cards.specialText.textBoxDims"),
            fill: "#000000",
            pivot: Vector2.CENTER
        })

        group.add(resText, opText);
    }

    drawSlogan(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const offset = this.typeData.slogan.offset.clone().scale(vis.sizeUnit);
        const pos = new Vector2(0.5*vis.size.x, vis.size.y).add(offset);
        const maxWidth = this.typeData.slogan.maxWidth * vis.size.x;
        //pos.setX(0.5 * (vis.size.x - maxWidth));
        pos.x = 0.5 * vis.size.x;

        const text = '\u201C' + this.typeData.slogan.text + '\u201D'
        const fontSize = vis.get("cards.slogan.fontSize");
        const maxHeight = 2.5*fontSize

        const fill = this.getColor(this.typeData.slogan);
        const alpha = this.typeData.slogan.alpha

        const displayActionType = vis.get("cards.displayActionTypes");
        const displaySlogan = !displayActionType;

        if(displayActionType) {
            const resIcon = vis.getResource("action_types");
            const actionType = this.getActionType();
            const actionTypeData = ACTION_TYPES[actionType];

            const fontSize = vis.get("cards.actionType.fontSize");
            pos.y -= 0.68 * fontSize;

            let tempMaxWidth = 0.8*maxWidth;

            const textConfig = new TextConfig({
                font: vis.get("fonts.heading"),
                size: fontSize,
            }).alignCenter();
            const resText = new ResourceText({ text: actionTypeData.label, textConfig });
            const opText = new LayoutOperation({
                pos: pos,
                size: new Vector2(tempMaxWidth, 2*fontSize),
                fill: fill,
                pivot: Vector2.CENTER,
                alpha: vis.get("cards.actionType.alpha")
            });
            group.add(resText, opText);

            const iconPositions = [
                pos.clone().sub(new Vector2(0.5*tempMaxWidth, 0)),
                pos.clone().add(new Vector2(0.5*tempMaxWidth, 0))
            ]

            const glowEffect = new DropShadowEffect({ color: "#FFFFFFCC", blurRadius: 0.33*fontSize });

            for(const pos of iconPositions)
            {
                const opIcon = new LayoutOperation({
                    pos: pos,
                    size: new Vector2(1.075*fontSize),
                    frame: actionTypeData.frame,
                    pivot: Vector2.CENTER,
                    effects: [glowEffect]
                })
                group.add(resIcon, opIcon);
            }
        }

        if(displaySlogan) 
        {
            const textConfig = new TextConfig({
                font: vis.get("fonts.slogan"),
                size: fontSize,
                alignHorizontal: TextAlign.MIDDLE,
                alignVertical: TextAlign.END,
                lineHeight: 0.875
            })
    
            const resText = new ResourceText({ text: text, textConfig: textConfig });
            const opText = new LayoutOperation({
                pos: pos,
                size: new Vector2(maxWidth, maxHeight),
                fill: fill,
                alpha: alpha,
                pivot: new Vector2(0.5, 1.0)
            })
    
            group.add(resText, opText);    
        }

    }

    // edges, corners, decoration
    drawEdgePart(vis:MaterialVisualizer, group:ResourceGroup)
    {
        this.drawEdgeLines(vis, group);
        this.drawCornerIcons(vis, group);
    }

    drawEdgeLines(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const positions = [
            new Vector2(vis.size.x, 0.5*vis.size.y),
            new Vector2(0.5*vis.size.x, vis.size.y),
            new Vector2(0, 0.5*vis.size.y),
            new Vector2(0.5*vis.size.x, 0)
        ]

        const inset = [
            new Vector2(-1,0),
            new Vector2(0,-1),
            new Vector2(1,0),
            new Vector2(0,1)
        ]

        const extendDirs = {
            y: new Vector2(0,1).scale(vis.size.y),
            x: new Vector2(1,0).scale(vis.size.x)
        }

        const insetScale = this.typeData.edges.insetScale * vis.sizeUnit;
        const stroke = this.getColor(this.typeData.edges);
        const strokeWidth = this.typeData.edges.lineWidth * vis.sizeUnit;
        const opLine = new LayoutOperation({
            stroke: stroke,
            strokeWidth: strokeWidth
        })

        for(let i = 0; i < 4; i++)
        {
            const dir = i % 2 == 0 ? "y" : "x"
            const scale = this.typeData.edges.lineScale[dir];
            const offset = extendDirs[dir].clone().scale(0.5*scale)
            const finalInset = inset[i].scale(insetScale);
            const pos = positions[i].clone().add(finalInset);
            const startPos = pos.clone().add(offset);
            const endPos = pos.clone().sub(offset);

            const resLine = new ResourceShape( new Line(startPos, endPos) );
            group.add(resLine, opLine)
        }
    }

    drawCornerIcons(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const corners = [
            new Vector2(vis.size.x, vis.size.y),
            new Vector2(0, vis.size.y),
            new Vector2(0, 0),
            new Vector2(vis.size.x, 0)
        ]

        const offsets = [
            new Vector2(-1,-1),
            new Vector2(1,-1),
            new Vector2(1,1),
            new Vector2(-1,1)
        ]

        const data = [
            { flipX: true, flipY: true },
            { flipX: false, flipY: true },
            { flipX: false, flipY: false },
            { flipX: true, flipY: false }
        ]

        const offset = this.typeData.corner.offset.clone().scale(vis.sizeUnit);
        const scaleFactor = this.typeData.corner.scale;
        const iconSize = scaleFactor * vis.sizeUnit;
        const effects = [];

        if(this.isDark()) { effects.push(new InvertEffect()); }

        const res = vis.getResource("crests_simple");
        for(let i = 0; i < 4; i++)
        {
            const totalOffset = offsets[i].scale(offset);
            const pos = corners[i].add(totalOffset);

            const canvOp = new LayoutOperation({
                pos: pos,
                frame: this.typeData.frame,
                size: new Vector2(iconSize),
                flipX: data[i].flipX,
                flipY: data[i].flipY,
                effects: effects,
                pivot: Vector2.CENTER
            });

            group.add(res, canvOp);
        }
    }


    // gradient overlay = not sure where to put this
    drawGradientOverlay(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const res = vis.getResource("gradient_overlay");
        const canvOp = new LayoutOperation({
            pos: vis.center,
            size: vis.size,
            pivot: Vector2.CENTER
        })
        group.add(res, canvOp);
    }
}