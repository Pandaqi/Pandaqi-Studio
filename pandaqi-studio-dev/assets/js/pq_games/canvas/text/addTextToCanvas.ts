import canvasTxt from "./canvasText"
import Point from "js/pq_games/tools/geometry/point"

export default (ctx:CanvasRenderingContext2D|HTMLCanvasElement, params:Record<string,any> = {}) =>
{
    if(ctx instanceof HTMLCanvasElement) { ctx = ctx.getContext("2d"); }

    const text = params.text ?? "?";
    const pos = params.pos ?? new Point().fromXY(0, 0);
    const fontFamily = params.fontFamily ?? "Dosis";
    const fontSize = params.fontSize ?? 16;
    const alpha = params.alpha ?? 1;
    const color = params.color ?? "#000000";
    const align = params.align ?? "center"; // left, center, right
    const verticalAlign = params.alignVertical ?? "top"; // top, middle, bottom
    const maxWidth = params.maxWidth ?? 10000;
    const maxHeight = params.maxHeight ?? 10000;

    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    //ctx.textAlign = align;
    //ctx.font = fontSize + "px '" + fontFamily + "'"
    //ctx.fillText(text, 0, 0);

    canvasTxt.fontSize = fontSize;
    canvasTxt.font = fontFamily;
    canvasTxt.align = align;
    canvasTxt.vAlign = verticalAlign;
    canvasTxt.drawText(ctx, text, 0, 0, maxWidth, maxHeight)

    ctx.restore();
}