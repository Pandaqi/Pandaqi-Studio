import { PACKS } from "./dictionary"
import Canvas from "js/pq_games/canvas/main"
import Point from "js/pq_games/tools/geometry/point"

export default class Card {
    constructor(params, config)
    {
        this.dark = params.dark || 0;
        this.type = params.type || "lionsyre";
        this.action = params.action;
        this.typeData = PACKS[this.type];
        this.config = config;
    }

    isDark() { return this.dark > 0; }
    draw()
    {
        this.setupCanvas();
        this.drawBackground();
        this.drawMainPart();
        this.drawEdgePart();
        this.drawOutline();
        this.drawGradientOverlay();
    }

    getColor(obj, key = "color")
    {
        if(this.isDark()) { return obj[key + "Dark"]; }
        return obj[key];
    }

    // setup + background
    getCanvas() { return this.ctx.canvas; }
    setupCanvas()
    {
        const dims = this.config.cards.size;
        this.ctx = Canvas.createNewContext({ width: dims.x, height: dims.y, alpha: true, willReadFrequently: false });
        this.dims = new Point(dims);
        this.minSize = Math.min(this.dims.x, this.dims.y);
        this.centerPos = new Point().fromXY(0.5*dims.x, 0.5*dims.y);
    }

    drawBackground()
    {
        const ctx = this.ctx;

        ctx.fillStyle = this.getColor(this.typeData.bg);
        ctx.fillRect(0, 0, this.dims.x, this.dims.y);

        if(this.typeData.bg.multicolor)
        {
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, this.dims.x, this.dims.y);

            const alpha = this.isDark() ? 0.5 : 1.0;

            const params = {
                id: "multicolor_bg",
                pos: this.centerPos.clone(),
                size: { width: this.dims.x, height: this.dims.y },
                alpha: alpha
            }
            Canvas.addResourceToContext(this.ctx, this.config.resLoader, params);
        }

        const scaleFactor = this.typeData.bg.icon.scale;
        const alpha = this.typeData.bg.icon.alpha;
        const offset = this.typeData.bg.icon.offset.clone().scaleFactor(this.minSize);
        const pos = this.centerPos.clone().add(offset);
        const iconSize = this.minSize*scaleFactor;
        const params = {
            id: "crests_full",
            frame: this.typeData.frame,
            pos: pos,
            size: { width: iconSize, height: iconSize },
            alpha: alpha
        }
        Canvas.addResourceToContext(ctx, this.config.resLoader, params);
    }

    // main part
    drawMainPart()
    {
        this.drawSigil();
        this.drawSeparator();
        this.drawName();
        this.drawActionText();
        this.drawSlogan()
    }

    drawSigil()
    {
        const scaleFactor = this.typeData.sigil.scale;
        const offset = this.typeData.sigil.offset.clone().scaleFactor(this.minSize);
        const pos = this.centerPos.clone().add(offset);
        const iconSize = this.minSize*scaleFactor;

        const params = {
            id: "crests_full",
            frame: this.typeData.frame,
            pos: pos,
            size: { width: iconSize, height: iconSize },
        }

        if(this.config.cards.addShadowToSigil)
        {
            params.dropShadow = {
                color: "rgba(0,0,0,0.5)",
                blur: 24
            }
        }

        Canvas.addResourceToContext(this.ctx, this.config.resLoader, params);
    }

    drawSeparator()
    {
        const ctx = this.ctx;
        const offset = this.typeData.action.offset.clone().scaleFactor(this.minSize);
        const pos = this.centerPos.clone().add(offset);

        // draw separator line exactly between name and action + icon at its heart
        const iconSize = this.typeData.separator.iconSize * this.minSize;
        const sepPos = new Point({ x: 0.5*this.dims.x, y: pos.y - 0.33*iconSize })
        const sepColor = this.getColor(this.typeData.separator);
        const sepLineLength = this.typeData.separator.length * this.minSize;
        const sepLineWidth = this.typeData.separator.lineWidth * this.minSize;
        const sepFrame = this.isDark() ? 1 : 0;

        const spriteParams = {
            id: "decoration_icons",
            pos: sepPos,
            frame: sepFrame,
            size: { width: iconSize, height: iconSize },
            tint: sepColor
        }
        Canvas.addResourceToContext(ctx, this.config.resLoader, spriteParams);
        
        for(let i = 0; i < 2; i++)
        {
            var dir = i == 0 ? 1 : -1;
            ctx.moveTo(sepPos.x + dir * 0.5 * iconSize, sepPos.y);
            ctx.lineTo(sepPos.x + dir * sepLineLength, sepPos.y);
            ctx.strokeStyle = sepColor;
            ctx.lineWidth = sepLineWidth;
            ctx.stroke();
        }
    }

    drawName()
    {
        const offset = this.typeData.name.offset.clone().scaleFactor(this.minSize);
        const shadowOffset = this.typeData.name.shadowOffset.clone().scaleFactor(this.minSize);
        const pos = this.centerPos.clone().add(offset);
        pos.setX(0);

        const textParams = {
            text: this.typeData.name.text,
            fontFamily: this.config.fonts.heading.key,
            fontSize: this.config.fonts.heading.size * this.minSize,
            color: this.getColor(this.typeData.name, "colorBottom"),
            pos: pos.clone().add(shadowOffset),
            maxWidth: this.dims.x
        }

        Canvas.addTextToContext(this.ctx, textParams);

        textParams.pos = pos;
        textParams.color = this.getColor(this.typeData.name, "colorTop");
        Canvas.addTextToContext(this.ctx, textParams)

        this.namePos = pos.clone();
    }

    getDarkText()
    {
        if(!this.isDark()) { return null; }
        
        let data = this.typeData.dark[this.dark-1];
        if(typeof data == "object") { return data.text; }
        return data;
    }

    drawActionText()
    {
        if(!this.action) { return; }

        const offset = this.typeData.action.offset.clone().scaleFactor(this.minSize);
        const pos = this.centerPos.clone().add(offset);
        const maxWidth = this.typeData.action.maxWidth * this.minSize;
        pos.setX(0.5 * (this.dims.x - maxWidth));

        // @TODO: print the type of action, if not a regular one (which we get from an OBJECT in the .dark config array)

        let text = this.getDarkText() || this.typeData.action.text;

        const textParams = {
            text: text,
            fontFamily: this.config.fonts.text.key,
            fontSize: this.config.fonts.text.size * this.minSize,
            color: this.getColor(this.typeData.action),
            pos: pos,
            maxWidth: maxWidth,
            align: "left"
        }

        Canvas.addTextToContext(this.ctx, textParams);
    }

    drawSlogan()
    {
        const offset = this.typeData.slogan.offset.clone().scaleFactor(this.minSize);
        const pos = new Point().fromXY(0.5*this.dims.x, this.dims.y).add(offset);
        const maxWidth = this.typeData.slogan.maxWidth * this.dims.x;
        pos.setX(0.5 * (this.dims.x - maxWidth));

        const text = '\u201C' + this.typeData.slogan.text + '\u201D'
        const fontSize = this.config.fonts.slogan.size * this.minSize
        const maxHeight = 2 * fontSize

        const textParams = {
            text: text,
            fontFamily: this.config.fonts.slogan.key,
            fontSize: fontSize,
            color: this.getColor(this.typeData.slogan),
            alpha: this.typeData.slogan.alpha,
            pos: pos,
            maxWidth: maxWidth,
            maxHeight: maxHeight,
            alignVertical: "bottom"
        }

        Canvas.addTextToContext(this.ctx, textParams);
    }

    // edges, corners, decoration
    drawEdgePart()
    {
        this.drawEdgeLines();
        this.drawCornerIcons();
    }

    drawEdgeLines()
    {
        const positions = [
            new Point().fromXY(this.dims.x, 0.5*this.dims.y),
            new Point().fromXY(0.5*this.dims.x, this.dims.y),
            new Point().fromXY(0, 0.5*this.dims.y),
            new Point().fromXY(0.5*this.dims.x, 0)
        ]

        const inset = [
            new Point().fromXY(-1,0),
            new Point().fromXY(0,-1),
            new Point().fromXY(1,0),
            new Point().fromXY(0,1)
        ]

        const extendDirs = {
            y: new Point().fromXY(0,1).scaleFactor(this.dims.y),
            x: new Point().fromXY(1,0).scaleFactor(this.dims.x)
        }

        const insetScale = this.typeData.edges.insetScale * this.minSize;
        const ctx = this.ctx;

        ctx.save();
        ctx.strokeStyle = this.getColor(this.typeData.edges);
        ctx.lineWidth = this.typeData.edges.lineWidth * this.minSize;

        for(let i = 0; i < 4; i++)
        {
            const dir = i % 2 == 0 ? "y" : "x"
            const scale = this.typeData.edges.lineScale[dir];
            const offset = extendDirs[dir].clone().scaleFactor(0.5*scale)
            const finalInset = inset[i].scaleFactor(insetScale);
            const pos = positions[i].clone().add(finalInset);
            const startPos = pos.clone().add(offset);
            const endPos = pos.clone().sub(offset);

            ctx.beginPath();
            ctx.moveTo(startPos.x, startPos.y);
            ctx.lineTo(endPos.x, endPos.y);
            ctx.stroke();
        }

        ctx.restore();
    }

    drawCornerIcons()
    {
        const corners = [
            new Point().fromXY(this.dims.x, this.dims.y),
            new Point().fromXY(0, this.dims.y),
            new Point().fromXY(0, 0),
            new Point().fromXY(this.dims.x, 0)
        ]

        const offsets = [
            new Point().fromXY(-1,-1),
            new Point().fromXY(1,-1),
            new Point().fromXY(1,1),
            new Point().fromXY(-1,1)
        ]

        const data = [
            { flipX: true, flipY: true },
            { flipX: false, flipY: true },
            { flipX: false, flipY: false },
            { flipX: true, flipY: false }
        ]

        const offset = this.typeData.corner.offset.clone().scaleFactor(this.minSize);
        const scaleFactor = this.typeData.corner.scale;
        const iconSize = scaleFactor * this.minSize;
        const params = {
            id: "crests_simple",
            frame: this.typeData.frame,
            size: { width: iconSize, height: iconSize },
        }

        if(!this.isDark())
        {
            params.tint = "#000000";
        }

        for(let i = 0; i < 4; i++)
        {
            const totalOffset = offsets[i].scale(offset);
            const pos = corners[i].add(totalOffset);

            params.pos = pos;
            params.flipX = data[i].flipX;
            params.flipY = data[i].flipY;

            Canvas.addResourceToContext(this.ctx, this.config.resLoader, params);
        }
    }

    // outline
    drawOutline()
    {
        const ctx = this.ctx;
        ctx.strokeStyle = this.getColor(this.typeData.outline);
        ctx.lineWidth = this.typeData.outline.width * this.minSize;
        ctx.strokeRect(0, 0, this.dims.x, this.dims.y);
    }

    // gradient overlay = not sure where to put this
    drawGradientOverlay()
    {
        const params = {
            id: "gradient_overlay",
            pos: this.centerPos.clone(),
            size: { width: this.dims.x, height: this.dims.y },
        }
        Canvas.addResourceToContext(this.ctx, this.config.resLoader, params);
    }
}