import createContext from "js/pq_games/layout/canvas/createContext";
import { MISC, SPECIAL_ACTIONS, TILES } from "../js_shared/dict";
import CONFIG from "../js_shared/config";
import strokeCanvas from "js/pq_games/layout/canvas/strokeCanvas";
import Point from "js/pq_games/tools/geometry/point";
import Visualizer from "./visualizer";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import getRectangleCornersWithOffset from "js/pq_games/tools/geometry/paths/getRectangleCornersWithOffset";
import TextConfig, { TextAlign } from "js/pq_games/layout/text/textConfig";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import ColorLike from "js/pq_games/layout/color/colorLike";
import getPositionsCenteredAround from "js/pq_games/tools/geometry/paths/getPositionsCenteredAround";
import clamp from "js/pq_games/tools/numbers/clamp";
import StrokeAlignValue from "js/pq_games/layout/values/strokeAlignValue";
import Color from "js/pq_games/layout/color/color";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";

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

    async drawForRules(vis:Visualizer) : Promise<HTMLCanvasElement>
    {
        return this.draw(vis); // @TODO; optionally add a paramter to "simplify" the draw, removing effects and stuff
    }

    async draw(vis:Visualizer) : Promise<HTMLCanvasElement>
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
        await group.toCanvas(ctx);
        this.drawOutline(vis, ctx);
        return ctx.canvas;
    }

    drawBackground(vis:Visualizer, ctx:CanvasRenderingContext2D, group)
    {
        // first solid color
        const tileData = TILES[this.getFirstType()];
        let color = tileData.color ?? CONFIG.tiles.shared.defaultBGColor;
        if(vis.inkFriendly) { color = "#FFFFFF"; }
        fillCanvas(ctx, color);

        // then the knitted BG pattern (the right one for the color)
        const res = vis.resourceLoader.getResource("misc");
        const frame = (tileData.bgLight || vis.inkFriendly) ? MISC.bg_hole.frame : MISC.bg_hole_inverse.frame;
        const op = new LayoutOperation({
            frame: frame,
            translate: vis.center,
            dims: vis.size,
            pivot: Point.CENTER
        });
        group.add(res, op);
    }

    drawNumbers(vis:Visualizer, group)
    {
        const tileData = TILES[this.getFirstType()]
        const isWildcard = this.isWildcardNumber();

        const offset = CONFIG.tiles.numbers.offset.clone().scale(vis.sizeUnit);
        const positions = getRectangleCornersWithOffset(vis.size, offset);
        const offsetsForSmall = [
            Point.DOWN,
            Point.DOWN,
            Point.UP,
            Point.UP,
        ]

        const fontSize = CONFIG.tiles.numbers.fontSize * vis.sizeUnit;
        const textConfigBig = new TextConfig({
            font: CONFIG.fonts.heading,
            size: fontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE
        })

        const fontSizeSmall = CONFIG.tiles.numbers.fontSizeTiny * vis.sizeUnit;
        const textConfigSmall = textConfigBig.clone();
        textConfigSmall.size = fontSizeSmall;
        textConfigSmall.font = CONFIG.fonts.body;

        const resTiles = vis.resourceLoader.getResource("tiles");

        const isLightBG = (tileData.bgLight || vis.inkFriendly);

        const textSmallAlpha = CONFIG.tiles.numbers.fontAlphaTiny;
        const textColor = isLightBG ? "#000000" : "#FFFFFF";
        //const strokeColor = isLightBG ? Color.TRANSPARENT : CONFIG.tiles.numbers.stroke;
        //const strokeWidth = CONFIG.tiles.numbers.strokeWidth * fontSize;
        const numberIconSizeFactor = CONFIG.tiles.numbers.numberIconSizeFactor;

        for(let i = 0; i < positions.length; i++)
        {
            const currentNumber = this.num[i % this.num.length];
            const text = currentNumber.toString();
            const resTextBig = new ResourceText({ text: text, textConfig: textConfigBig });
            const resTextSmall = new ResourceText({ text: text, textConfig: textConfigSmall });

            const pos = positions[i];
            const op = new LayoutOperation({
                translate: pos,
                dims: new Point(0.5*vis.size.x, fontSize),
                pivot: Point.CENTER,
                //stroke: strokeColor,
                //strokeWidth: strokeWidth,
                strokeAlign: StrokeAlignValue.OUTSIDE
            })

            // wildcard = an IMAGE (same dims as number otherwise)
            if(isWildcard) {
                op.dims = new Point(fontSize * numberIconSizeFactor);
                op.frame = TILES.wildcard.frame;
                group.add(resTiles, op.clone());
            
            // otherwise just the text
            } else {
                op.fill = new ColorLike(textColor);
                group.add(resTextBig, op.clone());
            }

            // the small text stays at all times (for consistency and its purpose of clarity)
            op.translate = pos.clone().move(offsetsForSmall[i].clone().scale(0.5*(fontSize + fontSizeSmall)));
            op.alpha = textSmallAlpha;
            op.strokeWidth = 0;
            op.effects = [];
            group.add(resTextSmall, op.clone());
        }
    }

    drawMainIllustration(vis:Visualizer, group)
    {
        const type = this.getFirstType();
        const tileData = TILES[type]
        const isCustom = tileData.custom || this.specialAction;

        const numSprites = this.type.length;
        const positions = [
            [vis.center], 
            [vis.center.clone().scale(0.5), vis.center.clone().scale(1.5)]
        ]
        const dims = new Point(CONFIG.tiles.main.iconSize * vis.sizeUnit);
        const sizes = [
            [dims],
            [dims.clone().scale(0.5), dims.clone().scale(0.5)]
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
                const res = vis.resourceLoader.getResource("tiles");
                const frame = tileData.frame;
                
                const op = new LayoutOperation({
                    frame: frame,
                    translate: positions[numSprites - 1][i],
                    dims: sizes[numSprites - 1][i],
                    pivot: Point.CENTER,
                    effects: vis.effects
                })
    
                group.add(res, op);
            }
        }
    }

    drawSpecialAction(vis:Visualizer, group)
    {
        const fontSize = CONFIG.tiles.specialAction.fontSize * vis.sizeUnit;
        const textConfig = new TextConfig({
            font: CONFIG.fonts.body,
            size: fontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE
        })

        const textDims = CONFIG.tiles.specialAction.textDims.clone().scale(vis.size);
        const textOp = new LayoutOperation({
            translate: vis.center,
            dims: textDims,
            pivot: Point.CENTER,
            fill: CONFIG.tiles.specialAction.textColor
        })

        const action = SPECIAL_ACTIONS[this.specialAction].desc;
        const resText = new ResourceText({ text: action, textConfig: textConfig });

        group.add(resText, textOp);
    }

    drawHouse(vis:Visualizer, group)
    {
        // draw the big house on the left
        const res = vis.resourceLoader.getResource("tiles");
        const frame = TILES.house.frame;
        const xPosLeft = CONFIG.tiles.main.house.xPosLeft * vis.size.x;
        const dims = new Point(CONFIG.tiles.main.iconSize * CONFIG.tiles.main.house.iconSizeFactor * vis.sizeUnit);
        const op = new LayoutOperation({
            frame: frame,
            translate: new Point(xPosLeft, vis.center.y),
            dims: dims,
            pivot: Point.CENTER,
            effects: vis.effects
        })
        group.add(res, op);

        // draw the presents it wants in a centered (column) list on the right
        const xPosRight = CONFIG.tiles.main.house.xPosRight * vis.size.x;
        const posRight = new Point(xPosRight, vis.center.y);
        const dimsPresentWithSpace = new Point(CONFIG.tiles.main.house.iconSizePresent * vis.sizeUnit);
        const dimsPresent = dimsPresentWithSpace.clone().scale(1.0 - CONFIG.tiles.main.house.iconPresentEmptySpace);
        const numPresents = this.reqs.length;
        const positions = getPositionsCenteredAround({ 
            pos: posRight, 
            num: numPresents, 
            dims: dimsPresentWithSpace, 
            dir: Point.DOWN
        });

        for(let i = 0; i < numPresents; i++)
        {
            const present = this.reqs[i];
            const pos = positions[i];
            const framePresent = TILES[present].frame;
            const resPresent = res;

            const op = new LayoutOperation({
                frame: framePresent,
                translate: pos,
                dims: dimsPresent,
                pivot: Point.CENTER,
                effects: vis.effects
            });
            group.add(resPresent, op);
        }

        // draw the house score at the top
        // (a horizontal centered list of star icons)
        const score = this.calculateScore();
        const dimsStar = new Point(CONFIG.tiles.main.house.iconSizeStar * vis.sizeUnit);
        const yPos = CONFIG.tiles.main.house.yPosStar * vis.size.y;
        const positionsScore = getPositionsCenteredAround({
            pos: new Point(vis.center.x, yPos),
            dims: dimsStar,
            num: score,
            dir: Point.RIGHT
        })

        const resMisc = vis.resourceLoader.getResource("misc");
        const frameStar = MISC.points_star.frame;
        for(let i = 0; i < score; i++)
        {
            const pos = positionsScore[i];
            const op = new LayoutOperation({
                frame: frameStar,
                translate: pos,
                dims: dimsStar,
                pivot: Point.CENTER,
                //effects: vis.effects
            });
            group.add(resMisc, op);
        }
    }

    drawOutline(vis:Visualizer, ctx)
    {
        const outlineSize = CONFIG.tiles.outline.size * vis.sizeUnit;
        strokeCanvas(ctx, CONFIG.tiles.outline.color, outlineSize);
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