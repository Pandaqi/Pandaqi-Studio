import Point from "js/pq_games/tools/geometry/point"
import createContext from "js/pq_games/layout/canvas/createContext";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import TintEffect from "js/pq_games/layout/effects/tintEffect";
import TextConfig, { TextAlign } from "js/pq_games/layout/text/textConfig";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import ColorLike from "js/pq_games/layout/color/colorLike";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import BlurEffect from "js/pq_games/layout/effects/blurEffect";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import fillResourceGroup from "js/pq_games/layout/canvas/fillResourceGroup";
import Line from "js/pq_games/tools/geometry/line";
import InvertEffect from "js/pq_games/layout/effects/invertEffect";
import { CardType, DarkAction } from "./dictShared";

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

    hasAction() { return !this.disableAction && this.typeData.action != undefined; }
    isDark() { return this.dark != null; }
    getActionText()
    {
        if(!this.hasAction()) { return ""; }
        if(this.isDark()) { 
            if(typeof this.dark === "string") { return this.dark }
            return this.dark.text;
        }
        return this.typeData.action.text;
    }

    // @TODO: this is an iffy system, rewrite to something better before using it too much?
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
        this.drawMainPart(vis, group);
        this.drawEdgePart(vis, group);
        this.drawGradientOverlay(vis, group);

        group.toCanvas(ctx);
        return ctx.canvas;
    }


    // setup + background
    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        fillResourceGroup(vis.size, group, this.getColor(this.typeData.bg));

        if(this.typeData.bg.multicolor)
        {
            fillResourceGroup(vis.size, group, "#000000");

            const alpha = this.isDark() ? 0.25 : 1.0;
            const res = vis.getResource("multicolor_bg");
            const canvOp = new LayoutOperation({
                translate: vis.center,
                dims: vis.size,
                pivot: Point.CENTER,
                alpha: alpha
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
            translate: pos,
            dims: new Point(iconSize),
            pivot: Point.CENTER,
            alpha: alpha
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
        const effects = [];
        if(vis.get("cards.addShadowToSigil"))
        {
            const blurRadius = this.typeData.sigil.shadowBlur * vis.sizeUnit;
            const blurColor = this.typeData.sigil.shadowColor;
            effects.push( new DropShadowEffect({ color: blurColor, blurRadius: blurRadius }) );
        }

        const canvOp = new LayoutOperation({
            frame: this.typeData.frame,
            translate: pos,
            dims: new Point(iconSize),
            pivot: Point.CENTER,
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
        const sepPos = new Point(vis.center.x, pos.y - 0.33*iconSize);
        const sepColor = this.getColor(this.typeData.separator);
        const sepLineLength = this.typeData.separator.length * vis.sizeUnit;
        const sepLineWidth = this.typeData.separator.lineWidth * vis.sizeUnit;
        const sepFrame = this.isDark() ? 1 : 0;

        const effects = sepColor == "#FFFFFF" ? [new InvertEffect()] : [];

        const res = vis.getResource("decoration_icons");
        const canvOp = new LayoutOperation({
            translate: sepPos,
            frame: sepFrame,
            dims: new Point(iconSize),
            pivot: Point.CENTER,
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
            const startPos = new Point(sepPos.x + dir * 0.5 * iconSize, sepPos.y);
            const endPos = new Point(sepPos.x + dir * sepLineLength, sepPos.y);
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
        const opText = new LayoutOperation({
            translate: pos.clone().add(shadowOffset),
            dims: new Point(vis.size.x, fontSize),
            fill: this.getColor(this.typeData.name, "colorBottom"),
            pivot: Point.CENTER
        })

        group.add(resText, opText);

        const opTextCopy = opText.clone(true);
        opTextCopy.translate = pos;
        opTextCopy.fill = new ColorLike(this.getColor(this.typeData.name, "colorTop"));

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
        const rectExtents = new Point(maxWidth*1.1, maxHeight + sloganHeight);
        const rect = new Rectangle({ center: new Point(pos.x, pos.y+0.5*sloganHeight), extents: rectExtents });
        const resRect = new ResourceShape({ shape: rect });
        const rectOp = new LayoutOperation({
            fill: this.isDark() ? "#000000" : "#FFFFFF",
            alpha: 0.8,
            composite: "overlay",
            effects: [new BlurEffect(0.06*maxWidth)]
        })

        group.add(resRect, rectOp);
        group.add(resRect, rectOp);

        // @TODO: print the TYPE of action, if not a regular one (which we get from an OBJECT in the .dark config array)

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
            translate: pos,
            dims: new Point(maxWidth, maxHeight),
            fill: fill,
            pivot: Point.CENTER
        })

        group.add(resText, opText);
    }

    drawSlogan(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const offset = this.typeData.slogan.offset.clone().scale(vis.sizeUnit);
        const pos = new Point(0.5*vis.size.x, vis.size.y).add(offset);
        const maxWidth = this.typeData.slogan.maxWidth * vis.size.x;
        //pos.setX(0.5 * (vis.size.x - maxWidth));
        pos.x = 0.5 * vis.size.x;

        const text = '\u201C' + this.typeData.slogan.text + '\u201D'
        const fontSize = vis.get("fonts.slogan.size");
        const maxHeight = fontSize

        const fill = this.getColor(this.typeData.slogan);
        const alpha = this.typeData.slogan.alpha
        const textConfig = new TextConfig({
            font: vis.get("fonts.slogan"),
            size: fontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.END,
            lineHeight: 0.875
        })

        const resText = new ResourceText({ text: text, textConfig: textConfig });
        const opText = new LayoutOperation({
            translate: pos,
            dims: new Point(maxWidth, maxHeight),
            fill: fill,
            alpha: alpha,
            pivot: new Point(0.5, 1.0)
        })

        group.add(resText, opText);
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
            new Point(vis.size.x, 0.5*vis.size.y),
            new Point(0.5*vis.size.x, vis.size.y),
            new Point(0, 0.5*vis.size.y),
            new Point(0.5*vis.size.x, 0)
        ]

        const inset = [
            new Point(-1,0),
            new Point(0,-1),
            new Point(1,0),
            new Point(0,1)
        ]

        const extendDirs = {
            y: new Point(0,1).scale(vis.size.y),
            x: new Point(1,0).scale(vis.size.x)
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
            new Point(vis.size.x, vis.size.y),
            new Point(0, vis.size.y),
            new Point(0, 0),
            new Point(vis.size.x, 0)
        ]

        const offsets = [
            new Point(-1,-1),
            new Point(1,-1),
            new Point(1,1),
            new Point(-1,1)
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
                translate: pos,
                frame: this.typeData.frame,
                dims: new Point(iconSize),
                flipX: data[i].flipX,
                flipY: data[i].flipY,
                effects: effects,
                pivot: Point.CENTER
            });

            group.add(res, canvOp);
        }
    }


    // gradient overlay = not sure where to put this
    drawGradientOverlay(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const res = vis.getResource("gradient_overlay");
        const canvOp = new LayoutOperation({
            translate: vis.center,
            dims: vis.size,
            pivot: Point.CENTER
        })
        group.add(res, canvOp);
    }
}