import "../text/setup";

import { describe, expect, test } from "bun:test";

import { copyMatrix, createMatrix, invertMatrix, multiplyMatrix, setEntityMatrix } from "../../../assets/lib/pq-games/draw/matrix";
import { createCanvasDrawer } from "../../../assets/lib/pq-games/draw/canvasDrawer";
import { FULL_PRESET, SHAPE_PRESET, SPRITE_PRESET } from "../../../assets/lib/pq-games/draw/presets";

/* The realtime drawer only talks to a canvas context through a handful of calls, so these tests use a
 * recording stand-in instead of the document renderer's fake canvas (which models fills and clips, not
 * instance draws). */

interface Call { name:string, args:any[] }

const makeContext = () =>
{
    const calls:Call[] = [];
    const assignments:Record<string, number> = {};

    const record = (name:string) => (...args:any[]) => { calls.push({ name, args }); };
    const target:any = {
        calls,
        assignments,
        setTransform: record("setTransform"),
        drawImage: record("drawImage"),
        fill: record("fill"),
        stroke: record("stroke"),
        clip: record("clip"),
        save: record("save"),
        restore: record("restore"),
        fillText: record("fillText"),
        strokeText: record("strokeText"),
        setLineDash: record("setLineDash"),
        canvas: { width: 800, height: 600 },
    };

    // property writes are what the state cache exists to avoid, so count them per property
    const tracked:Record<string, any> = {
        fillStyle: "#000000", strokeStyle: "#000000", lineWidth: 1, font: "10px sans-serif",
        textAlign: "start", textBaseline: "alphabetic", globalAlpha: 1,
        globalCompositeOperation: "source-over", filter: "none",
        shadowBlur: 0, shadowColor: "#000000", shadowOffsetX: 0, shadowOffsetY: 0,
        imageSmoothingEnabled: true,
    };
    for(const key of Object.keys(tracked))
    {
        assignments[key] = 0;
        let value = tracked[key];
        Object.defineProperty(target, key, {
            get: () => value,
            set: (next:any) => { value = next; assignments[key]++; },
        });
    }

    return target;
}

const image = (width = 64, height = 64) => ({ width: width, height: height });

// 0 + -0 is +0: a rotation of zero produces -0 in the matrix, which is not a difference worth testing
const values = (m:any) => Array.from(m as ArrayLike<number>).map((value) => value + 0);

describe("realtime matrix", () =>
{
    test("an anchor moves the top-left so the anchor lands on the position", () =>
    {
        const m = createMatrix();
        setEntityMatrix(m, 100, 50, 0, 1, 1, 0.5, 0.5, 40, 20);
        expect(values(m)).toEqual([1, 0, 0, 1, 80, 40]);
    });

    test("rotation is applied around the anchor", () =>
    {
        const m = createMatrix();
        setEntityMatrix(m, 0, 0, Math.PI / 2, 1, 1, 0, 0, 10, 10);
        expect(m[0]).toBeCloseTo(0, 6);
        expect(m[1]).toBeCloseTo(1, 6);
        expect(m[2]).toBeCloseTo(-1, 6);
        expect(m[3]).toBeCloseTo(0, 6);
    });

    test("parent * local composition puts a child inside its parent's space", () =>
    {
        const parent = createMatrix();
        const child = createMatrix();
        const world = createMatrix();

        setEntityMatrix(parent, 10, 20, 0, 1, 1, 0, 0, 0, 0);
        setEntityMatrix(child, 5, 5, 0, 1, 1, 0, 0, 0, 0);
        multiplyMatrix(world, parent, child);

        expect(world[4]).toBe(15);
        expect(world[5]).toBe(25);
    });

    test("the inverse maps a transformed point back", () =>
    {
        const m = createMatrix();
        const inv = createMatrix();
        setEntityMatrix(m, 30, -12, 0.7, 2, 3, 0.25, 0.75, 100, 50);
        invertMatrix(inv, m);

        const x = 12;
        const y = 34;
        const worldX = m[0] * x + m[2] * y + m[4];
        const worldY = m[1] * x + m[3] * y + m[5];
        expect(inv[0] * worldX + inv[2] * worldY + inv[4]).toBeCloseTo(x, 6);
        expect(inv[1] * worldX + inv[3] * worldY + inv[5]).toBeCloseTo(y, 6);
    });

    test("copying never shares the buffer", () =>
    {
        const a = createMatrix();
        const b = createMatrix();
        setEntityMatrix(a, 1, 2, 0, 1, 1, 0, 0, 0, 0);
        copyMatrix(b, a);
        b[4] = 99;
        expect(a[4]).toBe(1);
    });
});

describe("realtime drawer", () =>
{
    test("a sprite is drawn as a source rectangle into its own box", () =>
    {
        const ctx = makeContext();
        const drawer = createCanvasDrawer(ctx, SPRITE_PRESET);
        drawer.draw({ image: image(), x: 20, y: 10, width: 40, height: 30 });

        const setTransform = ctx.calls.find((call:Call) => call.name === "setTransform");
        expect(values(setTransform.args.slice(0, 6))).toEqual([1, 0, 0, 1, 20, 10]);

        const draw = ctx.calls.find((call:Call) => call.name === "drawImage");
        expect(draw.args[1]).toBe(0);   // sx
        expect(draw.args[2]).toBe(0);   // sy
        expect(draw.args[3]).toBe(64);  // source width
        expect(draw.args[4]).toBe(64);  // source height
        expect(draw.args[5]).toBe(0);   // dx (transform does the placing)
        expect(draw.args[6]).toBe(0);
        expect(draw.args[7]).toBe(40);
        expect(draw.args[8]).toBe(30);
    });

    test("a spritesheet frame offsets the source rectangle", () =>
    {
        const ctx = makeContext();
        const drawer = createCanvasDrawer(ctx, SPRITE_PRESET);
        drawer.draw({ image: image(96, 64), framesX: 3, framesY: 2, frame: 4, width: 16, height: 16 });

        const draw = ctx.calls.find((call:Call) => call.name === "drawImage");
        expect(draw.args[1]).toBe(32);  // frame 4 -> column 1
        expect(draw.args[2]).toBe(32);  //            row 1
        expect(draw.args[3]).toBe(32);
        expect(draw.args[4]).toBe(32);
    });

    test("sprite-only drawers never touch text or path state", () =>
    {
        const ctx = makeContext();
        const drawer = createCanvasDrawer(ctx, SPRITE_PRESET);
        drawer.drawAll([
            { image: image(), width: 10, height: 10 },
            { image: image(), width: 10, height: 10 },
        ]);

        expect(ctx.calls.some((call:Call) => call.name === "fillText")).toBe(false);
        expect(ctx.calls.some((call:Call) => call.name === "fill")).toBe(false);
    });

    test("context properties are written once, not once per entity", () =>
    {
        const ctx = makeContext();
        const drawer = createCanvasDrawer(ctx, FULL_PRESET);
        drawer.drawAll([
            { text: "a", font: "12px monospace", fill: "#ff0000" },
            { text: "b", font: "12px monospace", fill: "#ff0000" },
            { text: "c", font: "12px monospace", fill: "#ff0000" },
        ]);

        expect(ctx.assignments.font).toBe(1);
        expect(ctx.assignments.fillStyle).toBe(1);
        expect(ctx.calls.filter((call:Call) => call.name === "fillText").length).toBe(3);
    });

    test("invalidate re-applies every property once", () =>
    {
        const ctx = makeContext();
        const drawer = createCanvasDrawer(ctx, SHAPE_PRESET);
        const entity:any = { shape: {}, fill: "#00ff00", width: 10, height: 10 };

        drawer.draw(entity);
        drawer.draw(entity);
        expect(ctx.assignments.fillStyle).toBe(1);

        drawer.invalidate();
        drawer.draw(entity);
        expect(ctx.assignments.fillStyle).toBe(2);
    });

    test("children are drawn inside the parent transform", () =>
    {
        const ctx = makeContext();
        const drawer = createCanvasDrawer(ctx, FULL_PRESET);
        drawer.draw({
            x: 100, y: 100, rotation: Math.PI / 2,
            children: [{ image: image(), x: 10, y: 0, width: 10, height: 10 }],
        });

        const transforms = ctx.calls.filter((call:Call) => call.name === "setTransform");
        const child = transforms[transforms.length - 1].args;
        expect(child[0]).toBeCloseTo(0, 6);
        expect(child[1]).toBeCloseTo(1, 6);
        expect(child[4]).toBeCloseTo(100, 6);
        expect(child[5]).toBeCloseTo(110, 6);
    });

    test("invisible entities draw nothing", () =>
    {
        const ctx = makeContext();
        const drawer = createCanvasDrawer(ctx, SPRITE_PRESET);
        drawer.drawAll([{ image: image(), width: 10, height: 10, visible: false }, { image: null }]);
        expect(ctx.calls.some((call:Call) => call.name === "drawImage")).toBe(false);
    });

    test("alpha and blend mode are applied and reset for the next entity", () =>
    {
        const ctx = makeContext();
        const drawer = createCanvasDrawer(ctx, SPRITE_PRESET);
        drawer.drawAll([
            { image: image(), width: 10, height: 10, alpha: 0.5, composite: "lighter" },
            { image: image(), width: 10, height: 10 },
        ]);

        expect(ctx.calls.filter((call:Call) => call.name === "drawImage").length).toBe(2);
        expect(ctx.globalAlpha).toBe(1);
        expect(ctx.globalCompositeOperation).toBe("source-over");
    });
});
