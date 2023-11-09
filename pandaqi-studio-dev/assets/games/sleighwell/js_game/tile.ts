import createContext from "js/pq_games/layout/canvas/createContext";
import { MISC, TILES } from "../js_shared/dict";
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

export default class Tile
{
    type: string; // "wildcard" = wildcard
    num: number; // -1 = wildcard
    reqs: string[];
    ctx: CanvasRenderingContext2D;

    constructor(type:string, num:number)
    {
        this.type = type;
        this.num = num;
    }

    isWildcardNumber() { return this.num <= -1; }
    isWildcard() { return this.type == "wildcard"; }

    async drawForRules(cfg)
    {
        // @TODO
    }

    getCanvas() { return this.ctx.canvas; }
    async draw(visualizer:Visualizer)
    {
        const ctx = createContext({ size: visualizer.size });
        this.ctx = ctx;

        this.reqs.sort((a, b) => {
            return a.localeCompare(b);
        })

        await this.drawBackground(visualizer);
        await this.drawNumbers(visualizer);
        await this.drawMainIllustration(visualizer);
        this.drawOutline(visualizer);

        return this.getCanvas();
    }

    async drawBackground(vis:Visualizer)
    {
        // first solid color
        const tileData = TILES[this.type]
        let color = tileData.color ?? CONFIG.tiles.shared.defaultBGColor;
        if(vis.inkFriendly) { color = "#FFFFFF"; }
        fillCanvas(this.ctx, color);

        // then the knitted BG pattern (the right one for the color)
        const res = vis.resourceLoader.getResource("misc");
        const frame = (tileData.bgLight || vis.inkFriendly) ? MISC.bg_hole.frame : MISC.bg_hole_inverse.frame;
        const op = new LayoutOperation({
            frame: frame,
            translate: vis.center,
            dims: vis.size,
            pivot: Point.CENTER
        });
        await res.toCanvas(this.ctx, op);
    }

    async drawNumbers(vis:Visualizer)
    {
        const tileData = TILES[this.type]
        const isWildcard = this.num <= -1;

        const offset = CONFIG.tiles.numbers.offset.scale(vis.sizeUnit);
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

        const text = this.num.toString();
        const resTextBig = new ResourceText({ text: text, textConfig: textConfigBig });
        const resTextSmall = new ResourceText({ text: text, textConfig: textConfigSmall });
        const resMisc = vis.resourceLoader.getResource("misc");

        const textSmallAlpha = CONFIG.tiles.numbers.fontAlphaTiny;
        const textColor = (tileData.bgLight || vis.inkFriendly) ? "#000000" : "#FFFFFF";

        for(let i = 0; i < positions.length; i++)
        {
            const pos = positions[i];
            const op = new LayoutOperation({
                translate: pos,
                dims: new Point(0.5*vis.size.x, fontSize),
                pivot: Point.CENTER,
                effects: vis.effects
            })

            // wildcard = an IMAGE (same dims as number otherwise)
            if(isWildcard) {
                op.dims = new Point(fontSize);
                op.frame = MISC.wildcard.frame;
                await resMisc.toCanvas(this.ctx, op);
            
            // otherwise just the text
            } else {
                op.fill = new ColorLike(textColor);
                await resTextBig.toCanvas(this.ctx, op);
            }

            // the small text stays at all times (for consistency and its purpose of clarity)
            op.translate = pos.clone().move(offsetsForSmall[i].clone().scale(fontSize + fontSizeSmall));
            op.alpha = textSmallAlpha;
            op.effects = [];
            await resTextSmall.toCanvas(this.ctx, op);
        }
    }

    async drawMainIllustration(vis:Visualizer)
    {
        const tileData = TILES[this.type]
        const isCustom = tileData.custom;

        if(isCustom) {
            if(this.type == "house") { await this.drawHouse(vis); }
        } else {

            const res = vis.resourceLoader.getResource("tiles");
            const frame = tileData.frame;
            const dims = new Point(CONFIG.tiles.main.iconSize * vis.sizeUnit);
            const op = new LayoutOperation({
                frame: frame,
                translate: vis.center,
                dims: dims,
                pivot: Point.CENTER,
                effects: vis.effects
            })

            await res.toCanvas(this.ctx, op);
        }
    }

    async drawHouse(vis:Visualizer)
    {
        // draw the big house on the left
        const res = vis.resourceLoader.getResource("tiles");
        const frame = TILES.house.frame;
        const xPosLeft = CONFIG.tiles.main.house.xPosLeft * vis.size.x;
        const dims = new Point(CONFIG.tiles.main.iconSize * vis.sizeUnit);
        const op = new LayoutOperation({
            frame: frame,
            translate: new Point(xPosLeft, vis.center.y),
            dims: dims,
            pivot: Point.CENTER,
            effects: vis.effects
        })
        await res.toCanvas(this.ctx, op);

        // draw the presents it wants in a centered (column) list on the right
        const xPosRight = CONFIG.tiles.main.house.xPosRight * vis.size.x;
        const posRight = new Point(xPosRight, vis.center.y);
        const dimsPresent = new Point(CONFIG.tiles.main.house.iconSizePresent * vis.sizeUnit);
        const numPresents = this.reqs.length;
        const positions = getPositionsCenteredAround({ 
            pos: posRight, 
            num: numPresents, 
            dims: dimsPresent, 
            dir: Point.DOWN
        });

        const resMisc = vis.resourceLoader.getResource("misc");
        for(let i = 0; i < numPresents; i++)
        {
            const present = this.reqs[i];
            const isWildcard = (present == "wildcard");
            const pos = positions[i];
            const framePresent = isWildcard ? MISC.wildcard.frame : TILES[present].frame;
            const resPresent = isWildcard ? resMisc : res;

            const op = new LayoutOperation({
                frame: framePresent,
                translate: pos,
                dims: dimsPresent,
                pivot: Point.CENTER,
                effects: vis.effects
            });
            await resPresent.toCanvas(this.ctx, op);
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

        const frameStar = MISC.points_star.frame;
        for(let i = 0; i < score; i++)
        {
            const pos = positionsScore[i];
            const op = new LayoutOperation({
                frame: frameStar,
                translate: pos,
                dims: dimsStar,
                pivot: Point.CENTER,
                effects: vis.effects
            });
            await resMisc.toCanvas(this.ctx, op);
        }
    }

    drawOutline(vis:Visualizer)
    {
        const outlineSize = CONFIG.tiles.outline.size * vis.sizeUnit;
        strokeCanvas(this.ctx, CONFIG.tiles.outline.color, outlineSize);
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