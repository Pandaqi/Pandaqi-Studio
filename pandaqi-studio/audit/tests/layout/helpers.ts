import "../text/setup";

import { FakeCanvas, FakeCanvasContext2D, FakeElement } from "../text/fakeCanvas";
import { Rectangle, ResourceImage, ResourceShape, Vector2 } from "./lib";

export { FakeCanvas, FakeCanvasContext2D, FakeElement };

export const newCanvas = (width = 512, height = 512) =>
{
    const canv = new FakeCanvas();
    canv.width = width;
    canv.height = height;
    return canv;
}

export const newContext = (width = 512, height = 512) => newCanvas(width, height).getContext("2d");

export const shapeRect = (width = 100, height = 50, x = 0, y = 0) =>
{
    const rect = new Rectangle().fromTopLeft(new Vector2(x, y), new Vector2(width, height));
    return new ResourceShape({ shape: rect });
}

export const makeImage = (width = 200, height = 100) =>
{
    const canv = newCanvas(width, height);
    return new ResourceImage(canv);
}

export interface CapturedConsole
{
    logs: any[][],
    warns: any[][],
    errors: any[][],
}

export const captureConsole = (fn:() => void) : CapturedConsole =>
{
    const oldLog = console.log;
    const oldWarn = console.warn;
    const oldError = console.error;

    const captured:CapturedConsole = { logs: [], warns: [], errors: [] };
    console.log = (...args:any[]) => { captured.logs.push(args); };
    console.warn = (...args:any[]) => { captured.warns.push(args); };
    console.error = (...args:any[]) => { captured.errors.push(args); };

    try { fn(); }
    finally {
        console.log = oldLog;
        console.warn = oldWarn;
        console.error = oldError;
    }
    return captured;
}

// Patches the fake context prototype so calls made on ANY context (the renderer often draws on a
// temporary canvas, not the one handed in) can be inspected.
export const spyAllContexts = (fn:() => void) =>
{
    const proto:any = FakeCanvasContext2D.prototype;
    const original = {
        fill: proto.fill,
        stroke: proto.stroke,
        clip: proto.clip,
        setLineDash: proto.setLineDash,
    };

    const fills:{ composite:any, transform:any }[] = [];
    const strokes:{ transform:any }[] = [];
    const clips:{ transform:any }[] = [];
    const dashes:any[][] = [];

    proto.fill = function() { fills.push({ composite: this.globalCompositeOperation, transform: this.getTransform() }); return original.fill.call(this); };
    proto.stroke = function() { strokes.push({ transform: this.getTransform() }); return original.stroke.call(this); };
    proto.clip = function(path?:any) { clips.push({ transform: this.getTransform() }); return original.clip.call(this, path); };
    proto.setLineDash = function(segments:number[]) { dashes.push(segments.slice()); return original.setLineDash.call(this, segments); };

    try { fn(); }
    finally {
        proto.fill = original.fill;
        proto.stroke = original.stroke;
        proto.clip = original.clip;
        proto.setLineDash = original.setLineDash;
    }

    return { fills, strokes, clips, dashes };
}

// Same spies as spyAllContexts, for a draw call that has to be awaited first (the renderers' draw
// methods are async even when the canvas work itself is not).
export const spyAllContextsAsync = async (fn: () => Promise<void>) =>
{
    const proto:any = FakeCanvasContext2D.prototype;
    const originalFill = proto.fill;
    const fills:{ composite:any, transform:any }[] = [];

    proto.fill = function() { fills.push({ composite: this.globalCompositeOperation, transform: this.getTransform() }); return originalFill.call(this); };
    try { await fn(); }
    finally { proto.fill = originalFill; }

    return { fills };
}

export const captureConsoleAsync = async (fn: () => Promise<void>) : Promise<CapturedConsole> =>
{
    const oldLog = console.log;
    const oldWarn = console.warn;
    const oldError = console.error;

    const captured:CapturedConsole = { logs: [], warns: [], errors: [] };
    console.log = (...args:any[]) => { captured.logs.push(args); };
    console.warn = (...args:any[]) => { captured.warns.push(args); };
    console.error = (...args:any[]) => { captured.errors.push(args); };

    try { await fn(); }
    finally {
        console.log = oldLog;
        console.warn = oldWarn;
        console.error = oldError;
    }
    return captured;
}

// Wraps the canvas calls the renderer uses with recording versions that also keep the transform /
// composite that was active at that moment.
export const spyContext = (ctx:FakeCanvasContext2D) =>
{
    const calls:string[] = [];
    const fills:{ transform:any, composite:any }[] = [];
    const strokes:{ transform:any }[] = [];
    const clips:{ transform:any }[] = [];
    const dashes:any[][] = [];
    const images:{ source:any, dx:number, dy:number, w:number, h:number, transform:any }[] = [];

    const originalFill = ctx.fill.bind(ctx);
    const originalStroke = ctx.stroke.bind(ctx);
    const originalClip = ctx.clip.bind(ctx);
    const originalDash = ctx.setLineDash.bind(ctx);

    ctx.fill = () => { fills.push({ transform: ctx.getTransform(), composite: ctx.globalCompositeOperation }); calls.push("fill"); originalFill(); };
    ctx.stroke = () => { strokes.push({ transform: ctx.getTransform() }); calls.push("stroke"); originalStroke(); };
    ctx.clip = (path?:any) => { clips.push({ transform: ctx.getTransform() }); calls.push("clip"); return originalClip(path); };
    ctx.setLineDash = (segments:number[]) => { dashes.push(segments.slice()); calls.push("setLineDash"); return originalDash(segments); };

    // FakeCanvasContext2D.drawImage also copies recorded draws from a source canvas; recording the
    // call itself is enough to know when and where an image was stamped.
    const originalDrawImage = (ctx as any).drawImage.bind(ctx);
    (ctx as any).drawImage = (source:any, dx = 0, dy = 0, dw?:number, dh?:number) =>
    {
        images.push({ source: source, dx: dx, dy: dy, w: dw, h: dh, transform: ctx.getTransform() });
        calls.push("drawImage");
        return originalDrawImage(source, dx, dy, dw, dh);
    };

    return { calls, fills, strokes, clips, dashes, images, ctx };
}

