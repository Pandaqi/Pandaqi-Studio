import "../text/setup";

import { describe, expect, test } from "bun:test";
import { captureConsole, newCanvas, shapeRect } from "./helpers";
import { LayoutOperation, MaterialVisualizer, Rectangle, RendererPandaqi, ResourceShape, Vector2 } from "./lib";

// `_debug.layoutOperation` is the feature that makes this class debuggable: it should report what
// an operation calculated and draw where it thinks it is. Both halves are asserted here.

describe("debug logging", () =>
{
    test("debug:true logs one calculated record per apply", () =>
    {
        const op = new LayoutOperation({ pos: new Vector2(10, 20), size: new Vector2(100, 50), pivot: Vector2.ZERO, debug: true });

        const captured = captureConsole(() => op.calculateResultProperties());
        expect(captured.logs.length).toBe(1);

        const [message, data] = captured.logs[0];
        expect(String(message)).toContain("[LayoutOperation #");
        expect(data.pos).toEqual({ x: 10, y: 20 });
        expect(data.size).toEqual({ x: 100, y: 50 });
        expect(data.pivot).toEqual({ x: 0, y: 0 });
        expect(data.box.topLeft).toEqual({ x: 10, y: 20 });
        expect(data.matrix).toEqual([1, 0, 0, 1, 10, 20]);
    });

    test("renderer.debugLayoutOperation enables logging without touching every operation", () =>
    {
        const renderer = new RendererPandaqi();
        renderer.debugLayoutOperation = true;

        const op = new LayoutOperation({ renderer: renderer, pos: new Vector2(3, 4), size: new Vector2(10, 20), pivot: Vector2.ZERO });
        const captured = captureConsole(() => op.calculateResultProperties());

        expect(op.isDebugEnabled()).toBe(true);
        expect(captured.logs.length).toBe(1);
        expect(String(captured.logs[0][0])).toContain("LayoutOperation");
    });

    test("debug is off by default", () =>
    {
        const op = new LayoutOperation({ pos: new Vector2(1, 1), size: new Vector2(2, 2) });
        const captured = captureConsole(() => op.calculateResultProperties());

        expect(op.isDebugEnabled()).toBe(false);
        expect(captured.logs.length).toBe(0);
    });

    test("a debug operation describes its resource type and world box", () =>
    {
        const shape = shapeRect(100, 50);
        const op = new LayoutOperation({ resource: shape, pos: new Vector2(10, 20), size: new Vector2(100, 50), pivot: Vector2.ZERO, debug: true });
        const captured = captureConsole(() => op.calculateResultProperties());

        const data = captured.logs[0][1];
        expect(data.resource).toBe("ResourceShape");
        // shapes use their path as the origin, so an explicit top-left pivot adds half a size
        expect(data.box.topLeft).toEqual({ x: 60, y: 45 });
        expect(data.box.topRight.x).toBe(160);
        expect(data.box.bottomRight.y).toBe(95);
    });

    test("a centered shape reports its actual bounds (which start at -size/2)", () =>
    {
        const shape = new ResourceShape(new Rectangle({ center: new Vector2(), extents: new Vector2(100, 50) }));
        const op = new LayoutOperation({ resource: shape, pos: new Vector2(10, 20), size: new Vector2(100, 50), debug: true });
        const captured = captureConsole(() => op.calculateResultProperties());

        const data = captured.logs[0][1];
        expect(data.box.topLeft).toEqual({ x: -40, y: -5 });
        expect(data.box.bottomRight).toEqual({ x: 60, y: 45 });
        expect(data.box.pivot).toEqual({ x: 10, y: 20 });
    });
});

describe("visual debug overlay", () =>
{
    test("a debug draw adds a labelled outline and pivot marker", () =>
    {
        const renderer = new RendererPandaqi();
        renderer.debugLayoutOperation = true;

        const canv = newCanvas();
        const op = new LayoutOperation({
            renderer: renderer,
            resource: shapeRect(100, 50),
            pos: new Vector2(10, 20),
            size: new Vector2(100, 50),
            pivot: Vector2.ZERO,
            fill: "#ffffff",
        });

        const captured = captureConsole(() => op.applyToCanvas(canv));
        const ctx = canv.getContext("2d");

        expect(captured.logs.length).toBe(1);
        expect(ctx.draws.length).toBe(1); // the label (the shape itself draws with fill(), not text)
        expect(ctx.draws[0].text).toMatch(/^#\d+ ResourceShape 100x50 @ 60,45$/);
        expect(ctx.otherCalls).toContain("stroke");
        expect(ctx.otherCalls).toContain("fillRect");
    });

    test("debugging off draws no overlay", () =>
    {
        const canv = newCanvas();
        const op = new LayoutOperation({
            resource: shapeRect(100, 50),
            pos: new Vector2(10, 20),
            size: new Vector2(100, 50),
            pivot: Vector2.ZERO,
            fill: "#ffffff",
        });

        op.applyToCanvas(canv);
        expect(canv.getContext("2d").draws.length).toBe(0);
    });

    test("an inline operation logs but does not paint an absolute overlay into its parent", () =>
    {
        const canv = newCanvas();
        const op = new LayoutOperation({
            resource: shapeRect(10, 10),
            pos: new Vector2(10, 20),
            size: new Vector2(10, 10),
            pivot: Vector2.ZERO,
            fill: "#ffffff",
            inline: true,
            debug: true,
        });

        const captured = captureConsole(() => op.applyToCanvas(canv));
        expect(captured.logs.length).toBe(1);
        expect(canv.getContext("2d").draws.length).toBe(0);
    });
});

describe("config plumbing", () =>
{
    const makeConfig = (debug:Record<string, any>) => ({
        _debug: debug,
        _game: {},
        _settings: { defaults: {} },
        _translation: { dictionary: {} },
        _drawing: {},
    }) as any;

    test("_debug.layoutOperation is copied onto the visualizer's renderer", () =>
    {
        let visualizer:MaterialVisualizer;
        captureConsole(() => { visualizer = new MaterialVisualizer(makeConfig({ layoutOperation: true, text: true })); });

        expect(visualizer.renderer.debugLayoutOperation).toBe(true);
        expect(visualizer.renderer.debugText).toBe(true);
    });

    test("missing debug flags stay false", () =>
    {
        let visualizer:MaterialVisualizer;
        captureConsole(() => { visualizer = new MaterialVisualizer(makeConfig({})); });

        expect(visualizer.renderer.debugLayoutOperation).toBe(false);
        expect(visualizer.renderer.debugText).toBe(false);
    });
});
