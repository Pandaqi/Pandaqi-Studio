import "./setup";

import { FakeCanvas, FakeCanvasContext2D, measureWidth, RecordedTextDraw } from "./fakeCanvas";
import { calculateTextMetrics, drawTextToCanvas, LayoutOperation, ResourceText, TextAlign, TextConfig, Vector2 } from "./lib";

export { LayoutOperation, calculateTextMetrics, drawTextToCanvas, ResourceText, TextConfig, Vector2 };

// One font size and one character model, so every expectation below is an exact number.
export const SIZE = 16;
export const CHAR = SIZE * 0.5; // 8
export const SPACE = SIZE * 0.25; // 4
export const ASCENT = SIZE * 0.8; // 12.8
export const DESCENT = SIZE * 0.2; // 3.2
export const LINE = SIZE * 1.2; // 19.2 (default lineHeight)

type AlignParams = { h?:TextAlign, v?:TextAlign, extra?:Record<string,any> };

export const cfg = (params:AlignParams = {}) : TextConfig =>
{
    return new TextConfig({
        size: SIZE,
        font: "Test",
        alignHorizontal: params.h ?? TextAlign.START,
        alignVertical: params.v ?? TextAlign.START,
        ...(params.extra ?? {}),
    });
};

export const res = (text:string, config:TextConfig = cfg()) : ResourceText =>
{
    return new ResourceText({ text: text, textConfig: config });
};

export const metrics = (text:string, box:Vector2 = new Vector2(1000, 1000), config:TextConfig = cfg()) =>
{
    return calculateTextMetrics(res(text, config), box);
};

export const newContext = () => new FakeCanvasContext2D(new FakeCanvas());

export interface DrawnText
{
    texts: string[],
    draws: RecordedTextDraw[], // fill calls only, in drawing order
    lines: RecordedTextDraw[][], // one array per baseline (one per text line)
    ctx: FakeCanvasContext2D,
}

// Draws through the real LayoutOperation + RendererPandaqi path, exactly like a game does.
// The pivot defaults to top-left here so "the box" and "the canvas" are the same rectangle.
export const draw = (text:string|ResourceText, opParams:Record<string,any> = {}, config:TextConfig = cfg()) : DrawnText =>
{
    const resource = typeof text === "string" ? res(text, config) : text;
    const ctx = newContext();
    const op = new LayoutOperation({ pos: new Vector2(), pivot: Vector2.ZERO, ...opParams, resource: resource });
    op.applyToCanvas(ctx);
    const draws = fillDraws(ctx);
    return { texts: draws.map((d) => d.text), draws: draws, lines: groupByBaseline(draws), ctx: ctx };
};

// Only the fill calls: one per text run. (Stroked text produces strokeText calls for the same runs.)
export const fillDraws = (ctx:FakeCanvasContext2D) => ctx.draws.filter((d) => d.method === "fillText");

// Groups recorded draws per text line by their absolute baseline.
export const groupByBaseline = (draws:RecordedTextDraw[]) : RecordedTextDraw[][] =>
{
    const groups:RecordedTextDraw[][] = [];
    for(const d of draws)
    {
        const last = groups[groups.length - 1];
        if(last && Math.abs(last[0].absY - d.absY) < 0.001) { last.push(d); }
        else { groups.push([d]); }
    }
    return groups;
};

export const lineText = (d:RecordedTextDraw[]) => d.map((x) => x.text).join("");

export const lineWidth = (d:RecordedTextDraw[]) => 
{
    if(d.length <= 0) { return 0; }
    const last = d[d.length - 1];
    const first = d[0];
    return (last.absX + textWidth(last.text, last.font)) - first.absX;
};

export const textWidth = (text:string, font:string) =>
{
    const size = parseFloat(/(\d+(?:\.\d+)?)px/.exec(font)[1]);
    return measureWidth(text, size);
};

// Draws plain text without going through the renderer (renderer applies transform/effects).
export const drawDirect = (resource:ResourceText, opParams:Record<string,any> = {}) =>
{
    const ctx = newContext();
    const op = new LayoutOperation({ pos: new Vector2(), ...opParams, resource: resource });
    op.calculateResultProperties();
    drawTextToCanvas(ctx, op);
    return { ctx: ctx, op: op, draws: ctx.draws };
}
