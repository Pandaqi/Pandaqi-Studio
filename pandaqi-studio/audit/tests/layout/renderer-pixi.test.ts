import "../text/setup";

import { describe, expect, test } from "bun:test";
import { captureConsoleAsync, shapeRect } from "./helpers";
import { Circle, Container, Graphics, LayoutOperation, Path, RendererPixi, ResourceGroup, ResourceShape, Sprite, Vector2 } from "./lib";

// Pixi has different rules from canvas (masks must be in the display tree, containers have no
// anchor, zIndex is real). These tests exercise the renderer headless, without a GPU render pass.

const makeMaskResource = (width = 80, height = 40) => ({
    getSize: () => new Vector2(width, height),
    getPixiObject: (_frame:number, SpriteConstructor:any) => new SpriteConstructor(),
}) as any;

const rectClip = () => new Path([
    new Vector2(0, 0), new Vector2(100, 0), new Vector2(100, 50), new Vector2(0, 50),
]);

describe("Pixi transforms", () =>
{
    test("a Graphics shape is positioned at its local origin, including the shape pivot", async () =>
    {
        const renderer = new RendererPixi();
        const parent = new Container();
        const op = new LayoutOperation({
            renderer: renderer,
            resource: shapeRect(100, 50),
            pos: new Vector2(10, 20),
            size: new Vector2(100, 50),
            pivot: Vector2.ZERO,
            fill: "#ffffff",
        });

        await op.applyToPixi(null, parent);

        const obj:any = parent.children[0];
        expect(obj).toBeInstanceOf(Graphics);
        // shapes get a -0.5 pivot correction, so an explicit top-left pivot adds half a size
        expect(obj.position.x).toBe(60);
        expect(obj.position.y).toBe(45);
    });

    test("a group container honours an explicit pivot", async () =>
    {
        const renderer = new RendererPixi();
        const parent = new Container();

        const group = new ResourceGroup();
        group.add(shapeRect(10, 10), new LayoutOperation({ pos: new Vector2(0, 0), size: new Vector2(10, 10), pivot: Vector2.ZERO, fill: "#ffffff" }));

        const op = new LayoutOperation({
            renderer: renderer,
            resource: group,
            pos: new Vector2(10, 10),
            size: new Vector2(100, 50),
            pivot: new Vector2(0.5, 0.5),
        });

        await op.applyToPixi(null, parent);

        const obj:any = parent.children[0];
        expect(obj).toBeInstanceOf(Container);
        expect(obj.position.x).toBe(-40);
        expect(obj.position.y).toBe(-15);
        // the child stays local to the group and is placed relative to it
        expect(obj.children[0].position.x).toBe(5);
        expect(obj.children[0].position.y).toBe(5);
    });

    test("depth becomes a real zIndex", async () =>
    {
        const renderer = new RendererPixi();
        const parent = new Container();
        const op = new LayoutOperation({ renderer: renderer, resource: shapeRect(10, 10), size: new Vector2(10, 10), pivot: Vector2.ZERO, fill: "#ffffff", depth: 7 });

        await op.applyToPixi(null, parent);

        expect(parent.children[0].zIndex).toBe(7);
        expect(parent.sortableChildren).toBe(true);
    });
});

describe("Pixi masks", () =>
{
    test("a resource mask is placed in the display tree and follows mask.operation", async () =>
    {
        const renderer = new RendererPixi();
        const parent = new Container();
        const maskResource = makeMaskResource(80, 40);
        const maskOp = new LayoutOperation({ pos: new Vector2(5, 6), size: new Vector2(80, 40), pivot: Vector2.ZERO });

        const op = new LayoutOperation({
            renderer: renderer,
            resource: shapeRect(100, 50),
            size: new Vector2(100, 50),
            pivot: Vector2.ZERO,
            fill: "#ffffff",
            mask: { resource: maskResource, operation: maskOp },
        });

        await op.applyToPixi(null, parent);

        const wrapper:any = parent.children[0];
        expect(wrapper).toBeInstanceOf(Container);
        expect(wrapper.mask).toBeInstanceOf(Sprite);
        expect(wrapper.children).toContain(wrapper.mask);
        expect(wrapper.children.length).toBe(2);
        expect(wrapper.mask.position.x).toBe(5);
        expect(wrapper.mask.position.y).toBe(6);
    });

    test("a mask without an operation covers the image at its natural size (centre pivot)", async () =>
    {
        const renderer = new RendererPixi();
        const parent = new Container();
        const maskResource = makeMaskResource(80, 40);

        const op = new LayoutOperation({
            renderer: renderer,
            resource: shapeRect(100, 50),
            size: new Vector2(100, 50),
            pivot: Vector2.ZERO,
            fill: "#ffffff",
            mask: { resource: maskResource, operation: null },
        });

        await op.applyToPixi(null, parent);

        const wrapper:any = parent.children[0];
        expect(wrapper.mask).toBeInstanceOf(Sprite);
        expect(wrapper.mask.anchor.x).toBe(0.5);
        expect(wrapper.mask.anchor.y).toBe(0.5);
        expect(wrapper.mask.position.x).toBe(0);
        expect(wrapper.mask.position.y).toBe(0);
    });

    test("clip and resource mask can be active at the same time", async () =>
    {
        const renderer = new RendererPixi();
        const parent = new Container();
        const maskResource = makeMaskResource(80, 40);

        const op = new LayoutOperation({
            renderer: renderer,
            resource: shapeRect(100, 50),
            size: new Vector2(100, 50),
            pivot: Vector2.ZERO,
            fill: "#ffffff",
            clip: rectClip(),
            mask: { resource: maskResource, operation: new LayoutOperation({ size: new Vector2(80, 40), pivot: Vector2.ZERO }) },
        });

        await op.applyToPixi(null, parent);

        const outer:any = parent.children[0];
        const inner:any = outer.children[0];

        expect(outer.mask).toBeInstanceOf(Graphics);
        expect(inner.mask).toBeInstanceOf(Sprite);
        expect(outer.children).toContain(outer.mask);
        expect(inner.children).toContain(inner.mask);
    });

    test("a clip alone is a Graphics mask in the tree", async () =>
    {
        const renderer = new RendererPixi();
        const parent = new Container();
        const op = new LayoutOperation({
            renderer: renderer,
            resource: shapeRect(100, 50),
            size: new Vector2(100, 50),
            pivot: Vector2.ZERO,
            fill: "#ffffff",
            clip: rectClip(),
        });

        await op.applyToPixi(null, parent);

        const wrapper:any = parent.children[0];
        expect(wrapper.mask).toBeInstanceOf(Graphics);
        expect(wrapper.children).toContain(wrapper.mask);
    });
});

describe("Pixi robustness", () =>
{
    test("a dashed shape renders without the normal solid stroke crash", async () =>
    {
        const renderer = new RendererPixi();
        const parent = new Container();
        const op = new LayoutOperation({
            renderer: renderer,
            resource: shapeRect(100, 50),
            size: new Vector2(100, 50),
            pivot: Vector2.ZERO,
            stroke: "#000000",
            strokeWidth: 4,
            strokeType: "dashed" as any,
        });

        await op.applyToPixi(null, parent);

        const obj:any = parent.children[0];
        expect(obj).toBeInstanceOf(Graphics);
        expect(obj.context.instructions.some((i:any) => i.action === "stroke")).toBe(true);
    });

    test("a dashed circle does not destroy a cached shape path between draws", async () =>
    {
        const renderer = new RendererPixi();
        const parent = new Container();
        const resource = new ResourceShape(new Circle({ center: new Vector2(), radius: 50 }));

        const makeOp = () => new LayoutOperation({
            renderer: renderer,
            resource: resource,
            size: new Vector2(100, 100),
            stroke: "#000000",
            strokeWidth: 4,
            strokeType: "dashed" as any,
        });

        await makeOp().applyToPixi(null, parent);
        await makeOp().applyToPixi(null, parent);

        expect(parent.children.length).toBe(2);
        expect(parent.children[0]).not.toBe(parent.children[1]);
    });

    test("a circle clip can be converted to a Pixi Graphics mask", async () =>
    {
        const renderer = new RendererPixi();
        const parent = new Container();
        const op = new LayoutOperation({
            renderer: renderer,
            resource: shapeRect(100, 50),
            size: new Vector2(100, 50),
            pivot: Vector2.ZERO,
            fill: "#ffffff",
            clip: new Circle({ center: new Vector2(50, 25), radius: 40 }),
        });

        await op.applyToPixi(null, parent);

        const wrapper:any = parent.children[0];
        expect(wrapper.mask).toBeInstanceOf(Graphics);
        expect(wrapper.children).toContain(wrapper.mask);
    });

    test("an operation with no Pixi-capable resource warns and returns null", async () =>
    {
        const renderer = new RendererPixi();
        const parent = new Container();
        const op = new LayoutOperation({ renderer: renderer });

        let result:any;
        const captured = await captureConsoleAsync(async () => { result = await op.applyToPixi(null, parent); });

        expect(result).toBe(null);
        expect(captured.warns.length).toBe(1);
        expect(String(captured.warns[0][0])).toContain("no Pixi implementation");
        expect(parent.children.length).toBe(0);
    });

    test("debugging adds a box overlay to the parent without changing the drawn object", async () =>
    {
        const renderer = new RendererPixi();
        renderer.debugLayoutOperation = true;
        const parent = new Container();

        const op = new LayoutOperation({
            renderer: renderer,
            resource: shapeRect(100, 50),
            pos: new Vector2(10, 20),
            size: new Vector2(100, 50),
            pivot: Vector2.ZERO,
            fill: "#ffffff",
        });

        await captureConsoleAsync(async () => { await op.applyToPixi(null, parent); });

        expect(parent.children.length).toBe(2);
        const overlay = parent.children.find((c:any) => c.zIndex === 1000000);
        expect(overlay).toBeInstanceOf(Graphics);
    });
});
