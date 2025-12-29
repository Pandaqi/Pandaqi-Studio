
import { clamp, ColorLike, createContext, DropShadowEffect, fillCanvas, getPositionsCenteredAround, getRectangleCornersWithOffset, LayoutOperation, MaterialVisualizer, ResourceGroup, ResourceText, StrokeAlign, TextAlign, TextConfig, Vector2 } from "lib/pq-games";
import { MISC, SPECIAL_ACTIONS, TILES } from "../shared/dict";

const getVisualizerEffects = (vis:MaterialVisualizer) =>
{
    const glowRadius = vis.get("tiles.shared.glowRadius") * vis.sizeUnit;
    const glowColor = vis.get("tiles.shared.glowColor");
    return [new DropShadowEffect({ blurRadius: glowRadius, color: glowColor }), vis.inkFriendlyEffect].flat();
}

export default class Tile
{
    type: string[]; // "wildcard" = wildcard
    num: number[];
    numWildcard: boolean;
    reqs: string[];
    specialAction: string;

    constructor(type:string|string[], num:number|number[])
    {
        this.type = Array.isArray(type) ? type : [type];
        this.num = Array.isArray(num) ? num : [num];
        this.numWildcard = false;
        this.specialAction = "";
        this.reqs = [];
    }

    isWildcardNumber() { return this.numWildcard; }
    isWildcard() { return this.type.includes("wildcard"); }
    getFirstType() { return this.type[0]; }
    getFirstNumber() { return this.num[0]; }

    async draw(vis:MaterialVisualizer) : Promise<HTMLCanvasElement>
    {
        const ctx = createContext({ size: vis.size });
        const group = new ResourceGroup();

        if(this.reqs)
        {
            this.reqs.sort((a, b) => {
                return a.localeCompare(b);
            })
        }
        
        this.drawBackground(vis, ctx, group);
        this.drawNumbers(vis, group);
        this.drawMainIllustration(vis, group);
        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawBackground(vis:MaterialVisualizer, ctx:CanvasRenderingContext2D, group)
    {
        // first solid color
        const tileData = TILES[this.getFirstType()];
        let color = tileData.color ?? vis.get("tiles.shared.defaultBGColor");
        if(vis.inkFriendly) { color = "#FFFFFF"; }
        fillCanvas(ctx, color);

        // then the knitted BG pattern (the right one for the color)
        const res = vis.getResource("misc");
        const frame = (tileData.bgLight || vis.inkFriendly) ? MISC.bg_hole.frame : MISC.bg_hole_inverse.frame;
        const op = new LayoutOperation({
            frame: frame,
            pos: vis.center,
            size: vis.size,
            pivot: Vector2.CENTER
        });
        group.add(res, op);
    }

    drawNumbers(vis:MaterialVisualizer, group)
    {
        const tileData = TILES[this.getFirstType()]
        const isWildcard = this.isWildcardNumber();

        const offset = vis.get("tiles.numbers.offset").clone().scale(vis.sizeUnit);
        const positions = getRectangleCornersWithOffset(vis.size, offset);
        const offsetsForSmall = [
            Vector2.DOWN,
            Vector2.DOWN,
            Vector2.UP,
            Vector2.UP,
        ]

        const fontSize = vis.get("tiles.numbers.fontSize") * vis.sizeUnit;
        const textConfigBig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: fontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE
        })

        const fontSizeSmall = vis.get("tiles.numbers.fontSizeTiny") * vis.sizeUnit;
        const textConfigSmall = textConfigBig.clone();
        textConfigSmall.size = fontSizeSmall;
        textConfigSmall.font = vis.get("fonts.body");

        const resTiles = vis.getResource("tiles");

        const isLightBG = (tileData.bgLight || vis.inkFriendly);

        const textSmallAlpha = vis.get("tiles.numbers.fontAlphaTiny");
        const textColor = isLightBG ? "#000000" : "#FFFFFF";
        const numberIconSizeFactor = vis.get("tiles.numbers.numberIconSizeFactor");

        for(let i = 0; i < positions.length; i++)
        {
            const currentNumber = this.num[i % this.num.length];
            const text = currentNumber.toString();
            const resTextBig = new ResourceText({ text: text, textConfig: textConfigBig });
            const resTextSmall = new ResourceText({ text: text, textConfig: textConfigSmall });

            const pos = positions[i];
            const op = new LayoutOperation({
                pos: pos,
                size: new Vector2(0.5*vis.size.x, fontSize),
                pivot: Vector2.CENTER,
                //stroke: strokeColor,
                //strokeWidth: strokeWidth,
                strokeAlign: StrokeAlign.OUTSIDE
            })

            // wildcard = an IMAGE (same size as number otherwise)
            if(isWildcard) {
                op.size = new Vector2(fontSize * numberIconSizeFactor);
                op.frame = TILES.wildcard.frame;
                group.add(resTiles, op.clone());
            
            // otherwise just the text
            } else {
                op.fill = new ColorLike(textColor);
                group.add(resTextBig, op.clone());
            }

            // the small text stays at all times (for consistency and its purpose of clarity)
            op.pos = pos.clone().move(offsetsForSmall[i].clone().scale(0.5*(fontSize + fontSizeSmall)));
            op.alpha = textSmallAlpha;
            op.strokeWidth = 0;
            op.effects = [];
            group.add(resTextSmall, op.clone());
        }
    }

    drawMainIllustration(vis:MaterialVisualizer, group)
    {
        const type = this.getFirstType();
        const tileData = TILES[type]
        const isCustom = tileData.custom || this.specialAction;

        const numSprites = this.type.length;
        const positions = [
            [vis.center], 
            [vis.center.clone().scale(0.75), vis.center.clone().scale(1.33)]
        ]
        const size = new Vector2(vis.get("tiles.main.iconSize") * vis.sizeUnit);
        const sizes = [
            [size],
            [size.clone().scale(0.5), size.clone().scale(0.5)]
        ]

        if(isCustom) 
        {
            if(type == "house") { this.drawHouse(vis, group); }
            if(this.specialAction) { this.drawSpecialAction(vis, group); }
        } 
        else 
        {            
            for(let i = 0; i < numSprites; i++)
            {
                const res = vis.getResource("tiles");
                const frame = tileData.frame;
                
                const op = new LayoutOperation({
                    frame: frame,
                    pos: positions[numSprites - 1][i],
                    size: sizes[numSprites - 1][i],
                    pivot: Vector2.CENTER,
                    effects: getVisualizerEffects(vis)
                })
    
                group.add(res, op);
            }
        }
    }

    drawSpecialAction(vis:MaterialVisualizer, group)
    {
        const fontSize = vis.get("tiles.specialAction.fontSize") * vis.sizeUnit;
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: fontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE
        })

        const textDims = vis.get("tiles.specialAction.textDims").clone().scale(vis.size);
        const textOp = new LayoutOperation({
            pos: vis.center,
            size: textDims,
            pivot: Vector2.CENTER,
            fill: vis.get("tiles.specialAction.textColor")
        })

        const action = SPECIAL_ACTIONS[this.specialAction].desc;
        const resText = new ResourceText({ text: action, textConfig: textConfig });

        group.add(resText, textOp);
    }

    drawHouse(vis:MaterialVisualizer, group)
    {
        // draw the big house on the left
        const res = vis.getResource("tiles");
        const frame = TILES.house.frame;
        const xPosLeft = vis.get("tiles.main.house.xPosLeft") * vis.size.x;
        const size = new Vector2(vis.get("tiles.main.iconSize") * vis.get("tiles.main.house.iconSizeFactor") * vis.sizeUnit);
        const op = new LayoutOperation({
            frame: frame,
            pos: new Vector2(xPosLeft, vis.center.y),
            size: size,
            pivot: Vector2.CENTER,
            effects: getVisualizerEffects(vis)
        })
        group.add(res, op);

        // draw the presents it wants in a centered (column) list on the right
        const xPosRight = vis.get("tiles.main.house.xPosRight") * vis.size.x;
        const posRight = new Vector2(xPosRight, vis.center.y);
        const sizePresentWithSpace = new Vector2(vis.get("tiles.main.house.iconSizePresent") * vis.sizeUnit);
        const sizePresent = sizePresentWithSpace.clone().scale(1.0 - vis.get("tiles.main.house.iconPresentEmptySpace"));
        const numPresents = this.reqs.length;
        const positions = getPositionsCenteredAround({ 
            pos: posRight, 
            num: numPresents, 
            size: sizePresentWithSpace, 
            dir: Vector2.DOWN
        });

        for(let i = 0; i < numPresents; i++)
        {
            const present = this.reqs[i];
            const pos = positions[i];
            const framePresent = TILES[present].frame;
            const resPresent = res;

            const op = new LayoutOperation({
                frame: framePresent,
                pos: pos,
                size: sizePresent,
                pivot: Vector2.CENTER,
                effects: getVisualizerEffects(vis)
            });
            group.add(resPresent, op);
        }

        // draw the house score at the top
        // (a horizontal centered list of star icons)
        const score = this.calculateScore();
        const sizeStar = new Vector2(vis.get("tiles.main.house.iconSizeStar") * vis.sizeUnit);
        const yPos = vis.get("tiles.main.house.yPosStar") * vis.size.y;
        const positionsScore = getPositionsCenteredAround({
            pos: new Vector2(vis.center.x, yPos),
            size: sizeStar,
            num: score,
            dir: Vector2.RIGHT
        })

        const resMisc = vis.getResource("misc");
        const frameStar = MISC.points_star.frame;
        for(let i = 0; i < score; i++)
        {
            const pos = positionsScore[i];
            const op = new LayoutOperation({
                frame: frameStar,
                pos: pos,
                size: sizeStar,
                pivot: Vector2.CENTER,
            });
            group.add(resMisc, op);
        }
    }

    calculateScore()
    {
        let sum = 0;
        for(const req of this.reqs)
        {
            const isWildcard = (req == "wildcard");
            if(isWildcard) { sum += 0.5; }
            else { sum++; }
        }

        return clamp(Math.ceil(sum), 1, 3);
    }
}