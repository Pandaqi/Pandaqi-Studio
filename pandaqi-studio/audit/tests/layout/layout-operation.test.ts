import "../text/setup";

import { describe, expect, test } from "bun:test";
import { captureConsole, makeImage, newContext, shapeRect, spyContext } from "./helpers";
import { Color, DropShadowEffect, LayoutOperation, Path, RendererPandaqi, ResourceShape, StrokeAlign, StrokeType, Vector2 } from "./lib";

// The public LayoutOperation API, pinned down independently of the text suite: defaults, the
// transform pipeline, resource-specific sizing, cloning and the small helpers every game uses.

const ZERO = Vector2.ZERO;
const CENTER = Vector2.CENTER;

describe("defaults and parameters", () =>
{
    test("a bare operation has the documented V2 defaults", () =>
    {
        const op = new LayoutOperation();

        expect(op.pos.x).toBe(0);
        expect(op.pos.y).toBe(0);
        expect(op.rot).toBe(0);
        expect(op.scale.x).toBe(1);
        expect(op.scale.y).toBe(1);
        expect(op.skew.x).toBe(0);
        expect(op.depth).toBe(0);
        expect(op.size.x).toBe(0);
        expect(op.size.y).toBe(0);
        expect(op.sizeAuto).toBe(false);
        expect(op.pivot.x).toBe(0.5);
        expect(op.pivot.y).toBe(0.5);
        expect(op.pivotExplicit).toBe(false);
        expect(op.flipX).toBe(false);
        expect(op.flipY).toBe(false);
        expect(op.alpha).toBe(1);
        expect(op.composite).toBe("source-over");
        expect(op.strokeWidth).toBe(0);
        expect(op.strokeAlign).toBe(StrokeAlign.MIDDLE);
        expect(op.strokeType).toBe(StrokeType.REGULAR);
        expect(op.frame).toBe(0);
        expect(op.inline).toBe(false);
        expect(op.clip).toBe(null);
        expect(op.mask).toBe(null);
        expect(op.resource).toBe(null);
        expect(op.effects).toEqual([]);
        expect(op.debug).toBe(false);
        expect(op.renderer).toBeInstanceOf(RendererPandaqi);
    });

    test("unknown transform/style state is not allocated", () =>
    {
        const op = new LayoutOperation();
        expect(op.posResult).toBeFalsy();
        expect(op.sizeResult).toBeFalsy();
        expect(op.transformResult).toBeFalsy();

        // reading the setting still returns a usable value
        expect(op.pivot.x).toBe(0.5);
        expect(op.fill.isTransparent()).toBe(true);
        expect(op.tint).toBeInstanceOf(Color);
    });

    test("a default operation shares the stateless default renderer", () =>
    {
        const a = new LayoutOperation();
        const b = new LayoutOperation();
        expect(a.renderer).toBe(b.renderer);
    });

    test("pos/position and rot/rotation are aliases", () =>
    {
        const op = new LayoutOperation({ position: new Vector2(3, 4), rotation: 1.5 });
        expect(op.pos.x).toBe(3);
        expect(op.pos.y).toBe(4);
        expect(op.rot).toBe(1.5);
    });

    test("an explicit pivot marks pivotExplicit", () =>
    {
        expect(new LayoutOperation({ pivot: ZERO }).pivotExplicit).toBe(true);
        expect(new LayoutOperation({}).pivotExplicit).toBe(false);
    });

    test("invalid values are reported, not thrown", () =>
    {
        const captured = captureConsole(() =>
        {
            new LayoutOperation({ pos: "nope" as any, rot: "nope" as any, scale: "nope" as any });
        });
        expect(captured.errors.length).toBeGreaterThan(0);
    });
});

describe("result calculation", () =>
{
    test("position and size are rounded for drawing", () =>
    {
        const op = new LayoutOperation({ pos: new Vector2(10.4, 20.6), size: new Vector2(30.2, 40.5), pivot: ZERO });
        op.calculateResultProperties();

        expect(op.posResult.x).toBe(10);
        expect(op.posResult.y).toBe(21);
        expect(op.sizeResult.x).toBe(30);
        expect(op.sizeResult.y).toBe(41);
        expect(op.transformResult.applyToPoint(ZERO).x).toBe(10);
        expect(op.transformResult.applyToPoint(ZERO).y).toBe(21);
    });

    test("results are reused between applies instead of reallocated", () =>
    {
        const op = new LayoutOperation({ pos: new Vector2(1, 2), size: new Vector2(3, 4) });
        op.calculateResultProperties();
        const pos = op.posResult;
        const size = op.sizeResult;
        const matrix = op.transformResult;

        op.calculateResultProperties();
        expect(op.posResult).toBe(pos);
        expect(op.sizeResult).toBe(size);
        expect(op.transformResult).toBe(matrix);
    });

    test("flip mirrors scale and the pivot offset", () =>
    {
        const op = new LayoutOperation({ size: new Vector2(100, 50), pivot: ZERO, flipX: true, flipY: true });
        op.calculateResultProperties();

        expect(op.scaleResult.x).toBe(-1);
        expect(op.scaleResult.y).toBe(-1);
        // pivot X 0 becomes 1, pivot Y 0 becomes 1
        expect(op.pivotOffset.x).toBe(-100);
        expect(op.pivotOffset.y).toBe(-50);
    });

    test("the centre pivot offsets by half the size", () =>
    {
        const op = new LayoutOperation({ size: new Vector2(100, 50), pivot: CENTER });
        op.calculateResultProperties();
        expect(op.pivotOffset.x).toBe(-50);
        expect(op.pivotOffset.y).toBe(-25);
    });

    test("the top-left pivot has no offset", () =>
    {
        const op = new LayoutOperation({ size: new Vector2(100, 50), pivot: ZERO });
        op.calculateResultProperties();
        expect(op.pivotOffset.x).toBeCloseTo(0, 5);
        expect(op.pivotOffset.y).toBeCloseTo(0, 5);
    });

    test("a shape uses its own path size and scales to the requested size", () =>
    {
        const shape = shapeRect(100, 50);
        const op = new LayoutOperation({ resource: shape, size: new Vector2(200, 100), pivot: ZERO, sizeAuto: false });
        op.calculateResultProperties();

        // without sizeAuto the requested size is just the available space; the path's own size wins
        expect(op.sizeResult.x).toBe(100);
        expect(op.sizeResult.y).toBe(50);
        expect(op.scaleResult.x).toBe(1);
        expect(op.scaleResult.y).toBe(1);
    });

    test("a shape with sizeAuto fits inside the requested box and scales accordingly", () =>
    {
        const shape = shapeRect(100, 50);
        const op = new LayoutOperation({ resource: shape, size: new Vector2(200, 100), pivot: ZERO, sizeAuto: true });
        op.calculateResultProperties();

        expect(op.sizeResult.x).toBe(200);
        expect(op.sizeResult.y).toBe(100);
        expect(op.scaleResult.x).toBe(2);
        expect(op.scaleResult.y).toBe(2);
    });

    test("an image with sizeAuto keeps its aspect ratio", () =>
    {
        const image = makeImage(200, 100);
        const op = new LayoutOperation({ resource: image, size: new Vector2(100, 100), sizeAuto: true });
        op.calculateResultProperties();

        expect(op.sizeResult.x).toBe(100);
        expect(op.sizeResult.y).toBe(50);
    });

    test("an image without sizeAuto is drawn at the requested box size", () =>
    {
        const image = makeImage(200, 100);
        const op = new LayoutOperation({ resource: image, size: new Vector2(40, 30) });
        op.calculateResultProperties();

        expect(op.sizeResult.x).toBe(40);
        expect(op.sizeResult.y).toBe(30);
    });

    test("shape pivots are relative to the path, not the box", () =>
    {
        // shape default pivot (0.5) => no offset; an explicit top-left pivot moves it half a size
        const shape = shapeRect(100, 50);
        const op = new LayoutOperation({ resource: shape, pos: new Vector2(10, 10), size: new Vector2(100, 50), pivot: ZERO });
        op.calculateResultProperties();

        expect(op.pivotOffset.x).toBe(50);
        expect(op.pivotOffset.y).toBe(25);
        expect(op.transformResult.applyToPoint(ZERO).x).toBe(60);
        expect(op.transformResult.applyToPoint(ZERO).y).toBe(35);
    });

    test("a child operation composes its parent's transform", () =>
    {
        const parent = new LayoutOperation({ pos: new Vector2(10, 20), size: new Vector2(10, 10), pivot: ZERO, scale: new Vector2(2, 2) });
        parent.calculateResultProperties();

        const child = new LayoutOperation({ pos: new Vector2(5, 5), size: new Vector2(5, 5), pivot: ZERO, parentOperation: parent });
        child.calculateResultProperties();

        const origin = child.transformResult.applyToPoint(ZERO);
        expect(origin.x).toBe(20);
        expect(origin.y).toBe(30);
    });
});

describe("transformation matrix", () =>
{
    test("rotation rotates local points around the origin", () =>
    {
        const op = new LayoutOperation({ pos: new Vector2(100, 200), size: new Vector2(100, 50), pivot: ZERO, rot: Math.PI / 2 });
        op.calculateResultProperties();

        const point = op.transformResult.applyToPoint(new Vector2(10, 0));
        expect(point.x).toBeCloseTo(100, 5);
        expect(point.y).toBeCloseTo(210, 5);
    });

    test("scale multiplies local points", () =>
    {
        const op = new LayoutOperation({ pos: new Vector2(0, 0), size: new Vector2(100, 50), pivot: ZERO, scale: new Vector2(2, 3) });
        op.calculateResultProperties();

        const point = op.transformResult.applyToPoint(new Vector2(10, 10));
        expect(point.x).toBeCloseTo(20, 5);
        expect(point.y).toBeCloseTo(30, 5);
    });

    test("skew is applied after the scale", () =>
    {
        const op = new LayoutOperation({ pos: new Vector2(0, 0), size: new Vector2(100, 50), pivot: ZERO, skew: new Vector2(0.1, 0) });
        op.calculateResultProperties();

        const point = op.transformResult.applyToPoint(new Vector2(0, 10));
        expect(point.x).toBeCloseTo(Math.tan(0.1) * 10, 5);
        expect(point.y).toBeCloseTo(10, 5);
    });

    test("calculateTransformationMatrix returns the same matrix as apply", () =>
    {
        const op = new LayoutOperation({ pos: new Vector2(3, 4), size: new Vector2(10, 10), pivot: ZERO });
        op.calculateResultProperties();
        const matrix = op.calculateTransformationMatrix();

        expect(matrix).toBe(op.transformResult);
        expect(matrix.applyToPoint(ZERO).x).toBe(3);
        expect(matrix.applyToPoint(ZERO).y).toBe(4);
    });

    test("a local matrix excludes the parent transform", () =>
    {
        const parent = new LayoutOperation({ pos: new Vector2(100, 100), pivot: ZERO });
        parent.calculateResultProperties();
        const child = new LayoutOperation({ pos: new Vector2(5, 5), pivot: ZERO, parentOperation: parent });
        child.calculateResultProperties();

        const local = child.calculateLocalTransformationMatrix();
        const origin = local.applyToPoint(ZERO);
        expect(origin.x).toBe(5);
        expect(origin.y).toBe(5);
        expect(child.transformResult.applyToPoint(ZERO).x).toBe(105);
    });
});

describe("clone", () =>
{
    test("a shallow clone shares setting vectors (historical behaviour) but not results", () =>
    {
        const op = new LayoutOperation({ pos: new Vector2(1, 2), size: new Vector2(10, 20), pivot: ZERO, fill: "#ff0000" });
        op.calculateResultProperties();

        const clone = op.clone();
        expect(clone.pos).toBe(op.pos);
        expect(clone.size).toBe(op.size);
        expect(clone.fill).toBe(op.fill);
        expect(clone.posResult).not.toBe(op.posResult);
        expect(clone.sizeResult).not.toBe(op.sizeResult);
        expect(clone.transformResult).not.toBe(op.transformResult);
        expect(clone.posResult.x).toBe(1);
    });

    test("a deep clone gets its own transform and resource", () =>
    {
        const op = new LayoutOperation({ pos: new Vector2(1, 2), size: new Vector2(10, 20), pivot: ZERO, resource: shapeRect(10, 10) });
        op.calculateResultProperties();

        const clone = op.clone(true);
        expect(clone.pos).not.toBe(op.pos);
        expect(clone.pos.x).toBe(1);
        expect(clone.size).not.toBe(op.size);
        expect(clone.resource).not.toBe(op.resource);
        expect(clone.resource).toBeInstanceOf(ResourceShape);
    });

    test("effects are shared by a shallow clone and cloned by a deep one", () =>
    {
        const fx = new DropShadowEffect({ blur: 4 });
        const op = new LayoutOperation({ effects: [fx] });

        expect(op.clone().effects).toBe(op.effects);
        const deep = op.clone(true);
        expect(deep.effects).not.toBe(op.effects);
        expect(deep.effects[0]).not.toBe(fx);
    });

    test("ad-hoc properties survive cloning", () =>
    {
        const op = new LayoutOperation() as any;
        op.customTag = "hello";
        expect((op.clone() as any).customTag).toBe("hello");
    });
});

describe("effects", () =>
{
    test("addEffect and removeEffect maintain the list", () =>
    {
        const a = new DropShadowEffect();
        const b = new DropShadowEffect();
        const op = new LayoutOperation();

        op.addEffect(a);
        op.addEffect(b);
        expect(op.effects.length).toBe(2);

        op.removeEffect(a);
        expect(op.effects).toEqual([b]);
    });

    test("removing an effect that is not in the list does not remove the last one", () =>
    {
        const a = new DropShadowEffect();
        const op = new LayoutOperation();
        op.addEffect(a);

        op.removeEffect(new DropShadowEffect());
        expect(op.effects).toEqual([a]);
    });
});

describe("style helpers", () =>
{
    test("fill/stroke/tint predicates follow their values", () =>
    {
        const op = new LayoutOperation();
        expect(op.hasFill()).toBe(false);
        expect(op.hasStroke()).toBe(false);
        expect(op.hasTint()).toBe(false);
        expect(op.getTint()).toBe(0xFFFFFF);

        op.setFill("#ff0000");
        expect(op.hasFill()).toBe(true);

        op.setOuterStroke("#000000", 4);
        expect(op.hasStroke()).toBe(true);
        expect(op.strokeWidth).toBe(4);
        expect(op.strokeAlign).toBe(StrokeAlign.OUTSIDE);

        op.tint = new Color("#FF0000");
        expect(op.hasTint()).toBe(true);
        expect(op.getTint()).toBe(0xFF0000);
    });

    test("a transparent fill is not a fill", () =>
    {
        const op = new LayoutOperation({ fill: "transparent" });
        expect(op.hasFill()).toBe(false);
    });

    test("setFillAndStroke sets both and returns the operation", () =>
    {
        const op = new LayoutOperation();
        expect(op.setFillAndStroke("#ff0000", "#000000")).toBe(op);
        expect(op.hasFill()).toBe(true);
        expect(op.strokeWidth).toBe(0); // stroke still needs a width
        expect(op.stroke.toCSS()).toBe(new Color("#000000").toCSS());
    });

    test("setFillAndStrokeOnContext writes the colours, doubled width and dash", () =>
    {
        const ctx = newContext();
        const spy = spyContext(ctx);

        const op = new LayoutOperation({ fill: "#ff0000", stroke: "#000000", strokeWidth: 5, strokeAlign: StrokeAlign.OUTSIDE, strokeType: StrokeType.DASHED });
        op.setFillAndStrokeOnContext(ctx);

        expect(ctx.fillStyle).toBe(new Color("#ff0000").toString());
        expect(ctx.strokeStyle).toBe(new Color("#000000").toString());
        expect(ctx.lineWidth).toBe(10);
        expect(spy.dashes[spy.dashes.length - 1]).toEqual([20, 20]);
    });

    test("a regular stroke clears a previous dash", () =>
    {
        const ctx = newContext();
        const spy = spyContext(ctx);

        const op = new LayoutOperation({ stroke: "#000000", strokeWidth: 2, strokeType: StrokeType.REGULAR });
        op.setFillAndStrokeOnContext(ctx);

        expect(spy.dashes[spy.dashes.length - 1]).toEqual([]);
        expect(ctx.lineWidth).toBe(2);
    });

    test("applyFillAndStrokeToPath orders the calls for each stroke alignment", () =>
    {
        const calls:string[] = [];
        const ctx:any = {
            save: () => calls.push("save"),
            restore: () => calls.push("restore"),
            clip: () => calls.push("clip"),
            fill: () => calls.push("fill"),
            stroke: () => calls.push("stroke"),
        };
        const callback = () => calls.push("callback");
        const path = {} as any;

        const outside = new LayoutOperation({ fill: "#fff", stroke: "#000", strokeWidth: 2, strokeAlign: StrokeAlign.OUTSIDE });
        outside.applyFillAndStrokeToPath(ctx, path, callback);
        expect(calls).toEqual(["stroke", "fill", "callback"]);

        calls.length = 0;
        const inside = new LayoutOperation({ fill: "#fff", stroke: "#000", strokeWidth: 2, strokeAlign: StrokeAlign.INSIDE });
        inside.applyFillAndStrokeToPath(ctx, path, callback);
        expect(calls).toEqual(["save", "clip", "fill", "callback", "stroke", "restore"]);

        calls.length = 0;
        const middle = new LayoutOperation({ fill: "#fff", stroke: "#000", strokeWidth: 2, strokeAlign: StrokeAlign.MIDDLE });
        middle.applyFillAndStrokeToPath(ctx, path, callback);
        expect(calls).toEqual(["fill", "callback", "stroke"]);
    });

    test("an operation without style still runs the path callback", () =>
    {
        const calls:string[] = [];
        const ctx:any = { fill: () => calls.push("fill"), stroke: () => calls.push("stroke") };
        new LayoutOperation().applyFillAndStrokeToPath(ctx, {} as any, () => calls.push("callback"));
        expect(calls).toEqual(["callback"]);
    });
});

describe("small helpers", () =>
{
    test("hasDepth, hasClip, hasMask and setFrame", () =>
    {
        const op = new LayoutOperation();
        expect(op.hasDepth()).toBe(false);
        expect(op.hasClip()).toBe(false);
        expect(op.hasMask()).toBeFalsy();

        op.depth = 5;
        expect(op.hasDepth()).toBe(true);

        op.clip = new Path([new Vector2(0, 0), new Vector2(10, 0), new Vector2(10, 10)]);
        expect(op.hasClip()).toBe(true);

        const mask:any = { resource: {}, operation: new LayoutOperation() };
        op.mask = mask;
        expect(op.hasMask()).toBeTruthy();

        expect(op.setFrame(3)).toBe(op);
        expect(op.frame).toBe(3);
    });

    test("pivot presets set the corresponding pivots", () =>
    {
        const op = new LayoutOperation();
        expect(op.setPivotTopLeft()).toBe(op);
        expect(op.pivot.x).toBe(0);
        expect(op.pivot.y).toBe(0);

        op.setPivotBottomRight();
        expect(op.pivot.x).toBe(1);
        expect(op.pivot.y).toBe(1);

        op.setPivotCenter();
        expect(op.pivot.x).toBe(0.5);
        expect(op.pivot.y).toBe(0.5);
    });
});
