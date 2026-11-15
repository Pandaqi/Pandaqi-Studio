import "../text/setup";

import { describe, expect, test } from "bun:test";
import { captureConsole, FakeElement, newCanvas, shapeRect, spyAllContexts } from "./helpers";
import { Circle, Color, LayoutOperation, Path, ResourceGroup, ResourceShape, ResourceText, StrokeAlign, StrokeType, TextConfig, Vector2 } from "./lib";

// The canvas renderer is the default one, so the properties it used to ignore (depth, dashed
// strokes, several HTML-only properties) are pinned here next to the mask path.

const rectClip = () => new Path([
    new Vector2(0, 0), new Vector2(100, 0), new Vector2(100, 50), new Vector2(0, 50),
]);

describe("canvas masks", () =>
{
    test("a mask is drawn before the operation and constrains it with source-in", () =>
    {
        const maskEvents:string[] = [];
        const maskResource:any = {
            getSize: () => new Vector2(100, 50),
            getCSSUrl: () => "url(mask)",
            // a mask paints itself; a real ResourceImage draws its pixels here
            toCanvas: (ctx:any) => { maskEvents.push("mask"); ctx.fill(); },
        };

        const op = new LayoutOperation({
            resource: shapeRect(100, 50),
            size: new Vector2(100, 50),
            pivot: Vector2.ZERO,
            fill: "#ff0000",
            mask: {
                resource: maskResource,
                operation: new LayoutOperation({ size: new Vector2(100, 50), pivot: Vector2.ZERO }),
            },
        });

        const spy = spyAllContexts(() => op.applyToCanvas(newCanvas()));

        expect(maskEvents).toEqual(["mask"]);
        // first fill = the mask itself, second = the actual operation, composited source-in
        expect(spy.fills.length).toBe(2);
        expect(spy.fills[0].composite).toBe("source-over");
        expect(spy.fills[1].composite).toBe("source-in");
    });

    test("an operation without a mask never forces the temporary-canvas path", () =>
    {
        const op = new LayoutOperation({ resource: shapeRect(100, 50), size: new Vector2(100, 50), pivot: Vector2.ZERO, fill: "#ff0000" });
        const spy = spyAllContexts(() => op.applyToCanvas(newCanvas()));

        expect(op.hasMask()).toBeFalsy();
        expect(spy.fills.length).toBe(1);
        expect(spy.fills[0].composite).toBe("source-over");
    });
});

describe("canvas clipping", () =>
{
    test("an absolute clip is applied at the canvas origin", () =>
    {
        const op = new LayoutOperation({
            resource: shapeRect(100, 50),
            pos: new Vector2(10, 20),
            size: new Vector2(100, 50),
            pivot: Vector2.ZERO,
            fill: "#ff0000",
            clip: rectClip(),
            clipRelative: false,
        });

        const spy = spyAllContexts(() => op.applyToCanvas(newCanvas()));
        expect(spy.clips.length).toBe(1);
        expect(spy.clips[0].transform.e).toBe(0);
        expect(spy.clips[0].transform.f).toBe(0);
    });

    test("a circle clip works even though a Circle stores center/radius instead of points", () =>
    {
        const op = new LayoutOperation({
            resource: shapeRect(100, 50),
            size: new Vector2(100, 50),
            pivot: Vector2.ZERO,
            fill: "#ff0000",
            clip: new Circle({ center: new Vector2(50, 25), radius: 40 }),
        });

        const spy = spyAllContexts(() => op.applyToCanvas(newCanvas()));
        expect(spy.clips.length).toBe(1);
    });

    test("a relative clip is applied with the operation's transform active", () =>
    {
        const op = new LayoutOperation({
            resource: shapeRect(100, 50),
            pos: new Vector2(10, 20),
            size: new Vector2(100, 50),
            pivot: Vector2.ZERO,
            fill: "#ff0000",
            clip: rectClip(),
            clipRelative: true,
        });

        const spy = spyAllContexts(() => op.applyToCanvas(newCanvas()));
        expect(spy.clips.length).toBe(1);
        // shapes apply their -0.5 pivot correction, so the top-left pivot lands at pos + half a size
        expect(spy.clips[0].transform.e).toBe(60);
        expect(spy.clips[0].transform.f).toBe(45);
    });
});

describe("canvas depth", () =>
{
    test("group children are drawn from low to high depth", () =>
    {
        const group = new ResourceGroup();
        const order:string[] = [];
        const makeResource = (label:string) => ({ toCanvas: () => { order.push(label); } }) as any;

        group.add(makeResource("high"), new LayoutOperation({ depth: 10 }));
        group.add(makeResource("low"), new LayoutOperation({ depth: 0 }));
        group.add(makeResource("middle"), new LayoutOperation({ depth: 5 }));

        const op = new LayoutOperation({ resource: group, size: new Vector2(100, 100), pivot: Vector2.ZERO });
        op.applyToCanvas(newCanvas());

        expect(order).toEqual(["low", "middle", "high"]);
    });

    test("without depth the original insertion order is untouched", () =>
    {
        const group = new ResourceGroup();
        const order:string[] = [];
        const makeResource = (label:string) => ({ toCanvas: () => { order.push(label); } }) as any;

        group.add(makeResource("first"));
        group.add(makeResource("second"));

        const op = new LayoutOperation({ resource: group, size: new Vector2(100, 100), pivot: Vector2.ZERO });
        op.applyToCanvas(newCanvas());

        expect(order).toEqual(["first", "second"]);
    });
});

describe("canvas stroke type", () =>
{
    test("a dashed circle stroke has a point path to walk", () =>
    {
        const op = new LayoutOperation({
            resource: new ResourceShape(new Circle({ center: new Vector2(50, 25), radius: 40 })),
            size: new Vector2(100, 50),
            pivot: Vector2.ZERO,
            stroke: "#000000",
            strokeWidth: 4,
            strokeType: StrokeType.DASHED,
        });

        const spy = spyAllContexts(() => op.applyToCanvas(newCanvas()));
        expect(spy.dashes[spy.dashes.length - 1]).toEqual([8, 8]);
        expect(spy.strokes.length).toBeGreaterThan(0);
    });

    test("a dashed shape sets a dash pattern on the context", () =>
    {
        const op = new LayoutOperation({
            resource: shapeRect(100, 50),
            size: new Vector2(100, 50),
            pivot: Vector2.ZERO,
            stroke: "#000000",
            strokeWidth: 4,
            strokeType: StrokeType.DASHED,
        });

        const spy = spyAllContexts(() => op.applyToCanvas(newCanvas()));
        expect(spy.dashes[spy.dashes.length - 1]).toEqual([8, 8]);
    });

    test("a regular shape clears the dash", () =>
    {
        const op = new LayoutOperation({
            resource: shapeRect(100, 50),
            size: new Vector2(100, 50),
            pivot: Vector2.ZERO,
            stroke: "#000000",
            strokeWidth: 4,
            strokeType: StrokeType.REGULAR,
        });

        const spy = spyAllContexts(() => op.applyToCanvas(newCanvas()));
        expect(spy.dashes[spy.dashes.length - 1]).toEqual([]);
    });
});

describe("HTML properties", () =>
{
    test("position, rotation, scale, skew and pivot all reach the element", async () =>
    {
        const node:any = new FakeElement("div");
        node.style.transform = "";

        const op = new LayoutOperation({
            pos: new Vector2(10, 20),
            rot: 0.5,
            scale: new Vector2(2, 3),
            skew: new Vector2(0.1, 0.2),
            size: new Vector2(100, 50),
            pivot: new Vector2(0, 1),
            fill: "#ff0000",
            stroke: "#000000",
            strokeWidth: 3,
            strokeType: StrokeType.DASHED,
        });

        await op.applyToHTML(node);

        expect(node.style.opacity).toBe("1");
        expect(node.style.backgroundColor).toBe(new Color("#ff0000").toCSS());
        expect(node.style.borderStyle).toBe(StrokeType.DASHED);
        expect(node.style.borderWidth).toBe("3px");
        expect(node.style.borderColor).toBe(new Color("#000000").toCSS());
        expect(node.style.transformOrigin).toBe("0% 100%");

        expect(node.style.transform).toContain("rotate(0.5rad)");
        expect(node.style.transform).toContain("translate(10, 20)");
        expect(node.style.transform).toContain("scale(2, 3)");
        expect(node.style.transform).toContain("skew(0.1rad, 0.2rad)");
    });

    test("a mask element gets its url, size and no-repeat", async () =>
    {
        const node:any = new FakeElement("div");
        node.style.transform = "";

        const maskResource:any = {
            getCSSUrl: () => "url(mask.png)",
            getSize: () => new Vector2(40, 20),
        };

        const op = new LayoutOperation({
            size: new Vector2(100, 50),
            pivot: Vector2.ZERO,
            fill: "#ff0000",
            mask: { resource: maskResource, operation: new LayoutOperation({ size: new Vector2(40, 20) }) },
        });

        await op.applyToHTML(node);

        expect(node.style.maskImage).toBe("url(mask.png)");
        expect(node.style.webkitMaskImage).toBe("url(mask.png)");
        expect(node.style.maskRepeat).toBe("no-repeat");
        expect(node.style.maskSize).toBe("40px 20px");
    });

    test("text uses a real HTML text stroke instead of the SVG-only property", async () =>
    {
        const node:any = new FakeElement("span");
        node.style.transform = "";

        const text = new ResourceText({ text: "hello", textConfig: new TextConfig({}) });
        const op = new LayoutOperation({ fill: "#ff0000", stroke: "#000000", strokeWidth: 2, size: new Vector2(100, 50), pivot: Vector2.ZERO });

        await op.applyToHTML(node, text);

        expect(node.style.color).toBe(new Color("#ff0000").toCSS());
        expect(node.style.webkitTextStroke).toBe("2px " + new Color("#000000").toCSS());
        expect(node.style.stroke).toBe(new Color("#000000").toCSS());
    });

    test("an unmasked element does not get mask properties", async () =>
    {
        const node:any = new FakeElement("div");
        node.style.transform = "";

        const op = new LayoutOperation({ size: new Vector2(10, 10), pivot: Vector2.ZERO, fill: "#ff0000" });
        await op.applyToHTML(node);

        expect(node.style.maskImage).toBe(undefined);
        expect(node.style.maskSize).toBe(undefined);
    });
});
