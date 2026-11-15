import "./setup";

import { describe, expect, test } from "bun:test";
import { ASCENT, CHAR, cfg, newContext, res, textWidth } from "./helpers";
import { FakeCanvas } from "./fakeCanvas";
import {
    Color, DropShadowEffect, LayoutOperation, OutlineEffect, RendererPandaqi, ResourceGroup,
    ResourceImage, ResourceText, StrokeAlign, TextAlign, TextWeight, Vector2,
} from "./lib";

// The tests above exercise one call at a time. Real games do not: they build a ResourceGroup, put text
// in sub-groups, share one TextConfig across a whole deck, reuse an operation for different resources and
// add strokes/effects/drop shadows to the same text. Every one of those combinations has broken text
// placement at some point, so these tests replay that shape of drawing and check where the glyphs land.
//
// Everything goes through the real RendererPandaqi + LayoutOperation path (exactly like
// `MaterialVisualizer.finishDraw`), never through a hand-made context.

const scene = (size:Vector2, build:(group:ResourceGroup) => void) =>
{
    const canv = new FakeCanvas();
    canv.width = size.x;
    canv.height = size.y;

    const group = new ResourceGroup();
    build(group);
    group.toCanvas(canv, new LayoutOperation({ renderer: new RendererPandaqi() }));
    return canv;
};

const fills = (canv:any) => canv.getContext("2d").draws.filter((d:any) => d.method === "fillText");

// Where the operation's own transform says a glyph at local (x, y) must end up.
const absOf = (op:LayoutOperation, local:Vector2) => op.transformResult.applyToPoint(local);

const firstLine = (op:LayoutOperation) => op.textMetrics.lines[0].getPosition();

describe("an explicit text box is the box", () => {
    test("the operation's size is not replaced by the natural text width", () => {
        const config = cfg({ h: TextAlign.MIDDLE, v: TextAlign.MIDDLE });
        const resource = res("aa", config);
        const op = new LayoutOperation({
            pos: new Vector2(300, 300), size: new Vector2(200, 80), pivot: Vector2.ZERO, resource: resource,
        });
        op.calculateResultProperties();

        expect(op.sizeResult.x).toBe(200);
        expect(op.sizeResult.y).toBe(80);
        expect(op.textMetrics.dimsFull.getSize().x).toBe(200);
        expect(op.textMetrics.dimsFull.getSize().y).toBe(80);
        // centred inside the box we were given, not inside a box the size of the text
        expect(op.textMetrics.lines[0].getPosition().x).toBeCloseTo(0.5 * (200 - 2 * CHAR), 5);
    });

    test("a narrow text in a wide box is drawn in the middle of that box", () => {
        const config = cfg({ h: TextAlign.MIDDLE, v: TextAlign.MIDDLE });
        const op = new LayoutOperation({
            pos: new Vector2(0, 0), size: new Vector2(400, 100), pivot: Vector2.ZERO, resource: res("aa", config),
        });
        op.calculateResultProperties();

        const canv = scene(new Vector2(512, 512), (group) => group.add(res("aa", config), op));
        const drawn = fills(canv);
        expect(drawn.length).toBe(1);
        expect(drawn[0].absX).toBeCloseTo(0.5 * (400 - 2 * CHAR), 5);
        // not at the left edge of the text box, which is what the old auto-sizing did
        expect(drawn[0].absX).toBeGreaterThan(100);
    });

    test("a box smaller than the text clips by clipping, it does not shrink the box", () => {
        const config = cfg();
        const resource = new ResourceText({ text: "aaaa bbbb cccc dddd", textConfig: config });
        const op = new LayoutOperation({ size: new Vector2(60, 80), pivot: Vector2.ZERO, resource: resource });
        op.calculateResultProperties();
        expect(op.sizeResult.x).toBe(60);
        expect(op.sizeResult.y).toBe(80);
    });
});

describe("the transform is never lost", () => {
    test("a text at a position is not drawn at the origin with an identity transform", () => {
        const op = new LayoutOperation({
            pos: new Vector2(120, 240), size: new Vector2(100, 50), pivot: Vector2.ZERO, resource: res("aa"),
        });
        const canv = scene(new Vector2(512, 512), (group) => group.add(res("aa"), op));
        op.calculateResultProperties();

        const drawn = fills(canv)[0];
        expect(drawn.absX).toBeCloseTo(120, 5);
        expect(drawn.absY).toBeCloseTo(240 + ASCENT, 5);
        // the identity transform would put the first baseline at y = ascent, not at 240 + ascent
        expect(drawn.absY).not.toBeCloseTo(ASCENT, 1);
    });

    test("rotation, scale and pivot all reach the glyph", () => {
        const op = new LayoutOperation({
            pos: new Vector2(400, 400), size: new Vector2(200, 100), pivot: Vector2.CENTER,
            rot: 0.3, scale: new Vector2(1.5, 1.5), resource: res("aaaa"),
        });
        const canv = scene(new Vector2(1024, 1024), (group) => group.add(res("aaaa"), op));
        op.calculateResultProperties();

        const drawn = fills(canv)[0];
        const expected = absOf(op, firstLine(op));
        expect(drawn.absX).toBeCloseTo(expected.x, 4);
        expect(drawn.absY).toBeCloseTo(expected.y, 4);
        expect(drawn.font).toContain("16px"); // the glyph itself is scaled by the canvas transform, not re-rendered
    });

    test("flipping the operation flips the drawn text position", () => {
        const config = cfg();
        const op = new LayoutOperation({
            pos: new Vector2(300, 300), size: new Vector2(100, 50), pivot: Vector2.ZERO, flipX: true,
            resource: res("aa", config),
        });
        const canv = scene(new Vector2(512, 512), (group) => group.add(res("aa", config), op));
        op.calculateResultProperties();

        const expected = absOf(op, firstLine(op));
        expect(fills(canv)[0].absX).toBeCloseTo(expected.x, 4);
        expect(fills(canv)[0].absY).toBeCloseTo(expected.y, 4);
    });

    test("the same text drawn twice lands in the same place", () => {
        const config = cfg();
        const resource = res("aa bb", config);
        const op = new LayoutOperation({ pos: new Vector2(50, 60), size: new Vector2(300, 100), pivot: Vector2.ZERO, resource: resource });

        const first = fills(scene(new Vector2(512, 512), (group) => group.add(resource, op)));
        const second = fills(scene(new Vector2(512, 512), (group) => group.add(resource, op)));
        expect(second.length).toBe(first.length);
        for(let i = 0; i < first.length; i++)
        {
            expect(second[i].absX).toBeCloseTo(first[i].absX, 5);
            expect(second[i].absY).toBeCloseTo(first[i].absY, 5);
        }
    });

    test("moving an operation after it was measured moves the glyph", () => {
        const resource = res("aa");
        const op = new LayoutOperation({ pos: new Vector2(10, 20), size: new Vector2(100, 50), pivot: Vector2.ZERO, resource: resource });

        scene(new Vector2(512, 512), (group) => group.add(resource, op)); // draw once, so the op holds metrics
        op.pos = new Vector2(220, 140);
        const moved = fills(scene(new Vector2(512, 512), (group) => group.add(resource, op)))[0];

        expect(moved.absX).toBeCloseTo(220, 5);
        expect(moved.absY).toBeCloseTo(140 + ASCENT, 5);
    });
});

describe("fill, stroke and effects do not move the text", () => {
    const plain = () =>
    {
        const config = cfg();
        const resource = res("aaaa", config);
        const op = new LayoutOperation({ pos: new Vector2(120, 160), size: new Vector2(200, 80), pivot: Vector2.ZERO, resource: resource });
        return { op, canv: scene(new Vector2(512, 512), (group) => group.add(resource, op)) };
    };

    test("a stroke does not shift the glyphs", () => {
        const base = plain();
        const config = cfg();
        const resource = res("aaaa", config);
        const op = new LayoutOperation({
            pos: new Vector2(120, 160), size: new Vector2(200, 80), pivot: Vector2.ZERO, resource: resource,
            fill: "#ffffff", stroke: "#000000", strokeWidth: 6, strokeAlign: StrokeAlign.OUTSIDE,
        });
        const canv = scene(new Vector2(512, 512), (group) => group.add(resource, op));

        const a = fills(base.canv)[0];
        const b = fills(canv)[0];
        expect(b.absX).toBeCloseTo(a.absX, 5);
        expect(b.absY).toBeCloseTo(a.absY, 5);
    });

    test("a drop shadow does not shift the glyphs", () => {
        const base = plain();
        const resource = res("aaaa");
        const op = new LayoutOperation({
            pos: new Vector2(120, 160), size: new Vector2(200, 80), pivot: Vector2.ZERO, resource: resource,
            effects: [new DropShadowEffect({ blurRadius: 6 })],
        });
        const canv = scene(new Vector2(512, 512), (group) => group.add(resource, op));
        expect(fills(canv)[0].absX).toBeCloseTo(fills(base.canv)[0].absX, 5);
    });

    test("an outline (which draws through a temporary canvas) does not shift the glyphs", () => {
        const base = plain();
        const resource = res("aaaa");
        const op = new LayoutOperation({
            pos: new Vector2(120, 160), size: new Vector2(200, 80), pivot: Vector2.ZERO, resource: resource,
            effects: [new OutlineEffect({ color: new Color("#ff0000"), thickness: 3 })],
        });
        const canv = scene(new Vector2(512, 512), (group) => group.add(resource, op));

        // the outline redraws the text at every offset; the original copy must stay exactly where it was
        const drawn = fills(canv);
        const baseDraw = fills(base.canv)[0];
        const exact = drawn.find((d:any) => Math.abs(d.absX - baseDraw.absX) < 0.01 && Math.abs(d.absY - baseDraw.absY) < 0.01);
        expect(exact).toBeDefined();
    });

    test("an outlined text inside a sub-group is not stamped with the sub-group transform twice", () => {
        const resource = res("aaaa");
        const textOp = new LayoutOperation({
            pos: new Vector2(200, 300), size: new Vector2(200, 80), pivot: Vector2.CENTER, resource: resource,
            effects: [new OutlineEffect({ color: new Color("#ff0000"), thickness: 3 })],
        });

        const canv = scene(new Vector2(1024, 1024), (group) =>
        {
            const sub = new ResourceGroup();
            sub.add(resource, textOp);
            group.add(sub, new LayoutOperation({ pos: new Vector2(100, 100), pivot: Vector2.ZERO }));
        });

        textOp.calculateResultProperties();
        const expected = absOf(textOp, firstLine(textOp));
        const exact = fills(canv).find((d:any) => Math.abs(d.absX - expected.x) < 0.01 && Math.abs(d.absY - expected.y) < 0.01);
        expect(exact).toBeDefined();
    });

    test("a text with neither fill nor stroke is drawn black (and stays that way)", () => {
        const d = new LayoutOperation({ pos: new Vector2(), size: new Vector2(100, 50), pivot: Vector2.ZERO, resource: res("aa") });
        const canv = scene(new Vector2(512, 512), (group) => group.add(res("aa"), d));
        expect(fills(canv)[0].fillStyle).toBe(new Color("#000000").toString());
        expect(d.hasFill()).toBe(false); // the fallback is not written back onto the operation
    });
});

describe("text in nested ResourceGroups", () => {
    // A game that draws a card panel sub-group at an offset: the text inside it is placed relative to
    // that panel. The panel is a temporary canvas, and its transform must not be applied a second time
    // when that canvas is stamped back onto the parent.
    test("text inside a sub-group keeps its position", () => {
        const config = cfg();
        const resource = res("aa", config);
        const textOp = new LayoutOperation({ pos: new Vector2(200, 300), size: new Vector2(100, 50), pivot: Vector2.CENTER, resource: resource });

        const canv = scene(new Vector2(1024, 1024), (group) =>
        {
            const sub = new ResourceGroup();
            sub.add(resource, textOp);
            group.add(sub, new LayoutOperation({ pos: new Vector2(100, 100), pivot: Vector2.ZERO }));
        });

        textOp.calculateResultProperties();
        const expected = absOf(textOp, firstLine(textOp));
        const drawn = fills(canv)[0];
        expect(drawn.absX).toBeCloseTo(expected.x, 4);
        expect(drawn.absY).toBeCloseTo(expected.y, 4);
    });

    test("a stroked text inside a sub-group keeps its position", () => {
        const resource = res("aa");
        const textOp = new LayoutOperation({
            pos: new Vector2(200, 300), size: new Vector2(100, 50), pivot: Vector2.CENTER, resource: resource,
            fill:             "#ffffff", stroke: "#000000", strokeWidth: 6, strokeAlign: StrokeAlign.OUTSIDE,
        });

        const canv = scene(new Vector2(1024, 1024), (group) =>
        {
            const sub = new ResourceGroup();
            sub.add(resource, textOp);
            group.add(sub, new LayoutOperation({ pos: new Vector2(100, 100), pivot: Vector2.ZERO }));
        });


        textOp.calculateResultProperties();
        const expected = absOf(textOp, firstLine(textOp));
        const drawn = fills(canv)[0];
        expect(drawn.absX).toBeCloseTo(expected.x, 4);
        expect(drawn.absY).toBeCloseTo(expected.y, 4);
    });

    test("a stroked text two groups deep keeps its position", () => {
        const resource = res("aa");
        const textOp = new LayoutOperation({
            pos: new Vector2(200, 300), size: new Vector2(100, 50), pivot: Vector2.CENTER, resource: resource,
            fill: "#ffffff", stroke: "#000000", strokeWidth: 6, strokeAlign: StrokeAlign.OUTSIDE,
        });

        const canv = scene(new Vector2(1024, 1024), (group) =>
        {
            const inner = new ResourceGroup();
            inner.add(resource, textOp);

            const middle = new ResourceGroup();
            middle.add(inner, new LayoutOperation({ pos: new Vector2(60, 80), pivot: Vector2.ZERO }));
            group.add(middle, new LayoutOperation({ pos: new Vector2(100, 100), pivot: Vector2.ZERO }));
        });

        textOp.calculateResultProperties();
        const expected = absOf(textOp, firstLine(textOp));
        const drawn = fills(canv)[0];
        expect(drawn.absX).toBeCloseTo(expected.x, 4);
        expect(drawn.absY).toBeCloseTo(expected.y, 4);
    });

    test("a sub-group with its own size and centred pivot still places its text exactly", () => {
        const resource = res("aa");
        const textOp = new LayoutOperation({ pos: new Vector2(0, 0), size: new Vector2(80, 40), pivot: Vector2.ZERO, resource: resource });

        const canv = scene(new Vector2(1024, 1024), (group) =>
        {
            const sub = new ResourceGroup();
            sub.add(resource, textOp);
            group.add(sub, new LayoutOperation({ pos: new Vector2(400, 400), size: new Vector2(120, 120), pivot: Vector2.CENTER }));
        });

        textOp.calculateResultProperties();
        const expected = absOf(textOp, firstLine(textOp));
        expect(fills(canv)[0].absX).toBeCloseTo(expected.x, 4);
        expect(fills(canv)[0].absY).toBeCloseTo(expected.y, 4);
    });

    test("a stroked text followed by a plain sibling: both keep their own position", () => {
        const stroked = new LayoutOperation({
            pos: new Vector2(100, 100), size: new Vector2(100, 50), pivot: Vector2.ZERO, resource: res("aa"),
            fill: "#ffffff", stroke: "#000000", strokeWidth: 6, strokeAlign: StrokeAlign.OUTSIDE,
        });
        const plain = new LayoutOperation({ pos: new Vector2(100, 300), size: new Vector2(100, 50), pivot: Vector2.ZERO, resource: res("bb") });

        const canv = scene(new Vector2(512, 512), (group) =>
        {
            group.add(res("aa"), stroked);
            group.add(res("bb"), plain);
        });
        stroked.calculateResultProperties();
        plain.calculateResultProperties();

        const drawn = fills(canv);
        expect(drawn[0].absY).toBeCloseTo(absOf(stroked, firstLine(stroked)).y, 4);
        expect(drawn[drawn.length - 1].absY).toBeCloseTo(absOf(plain, firstLine(plain)).y, 4);
    });

    test("a rotated sub-group rotates its text around the sub-group", () => {
        const resource = res("aa");
        const textOp = new LayoutOperation({ pos: new Vector2(40, 30), size: new Vector2(60, 30), pivot: Vector2.ZERO, resource: resource });

        const canv = scene(new Vector2(1024, 1024), (group) =>
        {
            const sub = new ResourceGroup();
            sub.add(resource, textOp);
            group.add(sub, new LayoutOperation({ pos: new Vector2(300, 300), rot: 0.5 * Math.PI, pivot: Vector2.CENTER }));
        });

        textOp.calculateResultProperties();
        const expected = absOf(textOp, firstLine(textOp));
        expect(fills(canv)[0].absX).toBeCloseTo(expected.x, 4);
        expect(fills(canv)[0].absY).toBeCloseTo(expected.y, 4);
    });
});

describe("reuse between draws", () => {
    test("a TextConfig reused for a second resource keeps its style", () => {
        const config = cfg();
        const first = res("<b>aa</b>", config);
        const second = res("bb", config);

        const a = fills(scene(new Vector2(512, 512), (group) => group.add(first, new LayoutOperation({ size: new Vector2(200, 50), pivot: Vector2.ZERO }))));
        const b = fills(scene(new Vector2(512, 512), (group) => group.add(second, new LayoutOperation({ size: new Vector2(200, 50), pivot: Vector2.ZERO }))));

        expect(a[0].font).toContain("700");
        expect(b[0].font).toContain("500"); // regular, no leftover bold
        expect(config.weight).toBe(TextWeight.REGULAR);
        expect(Object.keys(config.history).length).toBe(0);
    });

    test("a TextConfig reused with a different fill uses the new fill (and still restores <col>)", () => {
        const config = cfg();
        const text = res('aa<col hex="#ff0000">bb</col>', config);

        const first = fills(scene(new Vector2(512, 512), (group) =>
            group.add(text, new LayoutOperation({ size: new Vector2(300, 50), pivot: Vector2.ZERO, fill: "#00ff00" }))));
        const second = fills(scene(new Vector2(512, 512), (group) =>
            group.add(text, new LayoutOperation({ size: new Vector2(300, 50), pivot: Vector2.ZERO, fill: "#0000ff" }))));

        const red = new Color("#ff0000").toString();
        expect(first[0].fillStyle).toBe(new Color("#00ff00").toString());
        expect(first[1].fillStyle).toBe(red);
        expect(second[0].fillStyle).toBe(new Color("#0000ff").toString());
        expect(second[1].fillStyle).toBe(red);
    });

    test("a TextConfig reused with a different box does not remember the old layout", () => {
        const config = cfg();
        const text = res("aaaa bbbb cccc", config);

        const wide = fills(scene(new Vector2(1024, 512), (group) =>
            group.add(text, new LayoutOperation({ size: new Vector2(800, 100), pivot: Vector2.ZERO }))));
        const narrow = fills(scene(new Vector2(1024, 512), (group) =>
            group.add(text, new LayoutOperation({ size: new Vector2(60, 400), pivot: Vector2.ZERO }))));

        expect(new Set(wide.map(d => d.absY)).size).toBe(1); // one line
        expect(narrow.length).toBe(3); // one word per line
        expect(new Set(narrow.map(d => d.absY)).size).toBe(3); // three wrapped lines
    });

    test("one operation used for an image and then for a text does not pollute either", () => {
        const image = new ResourceImage(new FakeCanvas());
        const resource = res("aa");
        const op = new LayoutOperation({ pos: new Vector2(20, 30), size: new Vector2(100, 60), pivot: Vector2.ZERO });

        const imageCanvas = scene(new Vector2(512, 512), (group) => group.add(image, op));
        expect(imageCanvas.getContext("2d").otherCalls.includes("fillRect")).toBe(false);

        const textCanvas = scene(new Vector2(512, 512), (group) => group.add(resource, op));
        expect(fills(textCanvas)[0].fillStyle).toBe(new Color("#000000").toString());
        expect(op.hasFill()).toBe(false);

        // drawing the image again with that same operation must not put a black box behind it
        const again = scene(new Vector2(512, 512), (group) => group.add(image, op));
        expect(again.getContext("2d").otherCalls.includes("fillRect")).toBe(false);
    });

    test("a text resource shared by two groups is drawn at both positions", () => {
        const config = cfg();
        const resource = res("aa", config);
        const opA = new LayoutOperation({ pos: new Vector2(40, 50), size: new Vector2(100, 50), pivot: Vector2.ZERO, resource: resource });
        const opB = new LayoutOperation({ pos: new Vector2(240, 250), size: new Vector2(100, 50), pivot: Vector2.ZERO, resource: resource });

        const canv = scene(new Vector2(512, 512), (group) =>
        {
            group.add(resource, opA);
            group.add(resource, opB);
        });

        const drawn = fills(canv);
        expect(drawn.length).toBe(2);
        expect(drawn[0].absX).toBeCloseTo(40, 5);
        expect(drawn[1].absX).toBeCloseTo(240, 5);
        expect(drawn[1].absY).toBeCloseTo(250 + ASCENT, 5);
    });
});

// naivigation's instruction token, replayed: a sub-group holding an icon image AND a stroked text with a
// drop shadow, added to the card once as-is and once offset. Both copies must land at their own position,
// and the shared sub-group must not remember the transform of the copy before it.
describe("a group with a stroked, shadowed text, drawn twice", () => {
    test("both copies of the text and of the icon land at their own offset", () => {
        const config = cfg({ h: TextAlign.MIDDLE, v: TextAlign.MIDDLE });
        const resource = res("3", config);
        const icon = new ResourceImage(new FakeCanvas());

        const textOp = new LayoutOperation({
            pos: new Vector2(120, 90), size: new Vector2(160, 120), pivot: Vector2.ZERO, resource: resource,
            fill: "#000000", stroke: "#ffffff", strokeWidth: 8, strokeAlign: StrokeAlign.OUTSIDE,
            effects: [new DropShadowEffect({ color: "#000000AA", offset: new Vector2(0, 4) })],
        });
        const iconOp = new LayoutOperation({ pos: new Vector2(20, 20), size: new Vector2(60, 60), pivot: Vector2.ZERO });

        const canv = scene(new Vector2(400, 700), (group) =>
        {
            const sub = new ResourceGroup();
            sub.add(icon, iconOp);
            sub.add(resource, textOp);
            group.add(sub);
            group.add(sub, new LayoutOperation({ pos: new Vector2(0, 350), pivot: Vector2.ZERO }));
        });

        const drawn = fills(canv);
        expect(drawn.length).toBe(2);

        const line = textOp.textMetrics.lines[0].getPosition();
        expect(drawn[0].absX).toBeCloseTo(120 + line.x, 4);
        expect(drawn[0].absY).toBeCloseTo(90 + line.y, 4);
        expect(drawn[1].absX).toBeCloseTo(drawn[0].absX, 4);
        expect(drawn[1].absY).toBeCloseTo(drawn[0].absY + 350, 4);

        // the text is still the text: its own fill/stroke, not the shadow's
        expect(drawn[0].fillStyle).toBe(new Color("#000000").toString());
        expect(drawn[1].strokeStyle).toBe(new Color("#ffffff").toString());

        // the icon (an image in the same sub-group) goes through its own transform in both copies too
        const icons = canv.getContext("2d").images.filter((i:any) => i.w === 60 && i.h === 60);
        expect(icons.length).toBe(2);
        expect(icons[0].absX).toBeCloseTo(20, 4);
        expect(icons[0].absY).toBeCloseTo(20, 4);
        expect(icons[1].absX).toBeCloseTo(20, 4);
        expect(icons[1].absY).toBeCloseTo(370, 4);
    });
});

describe("inline images in transformed text", () => {
    const makeLoader = (recorded:any[]) =>
    {
        const imageResource:any = {
            getSizeKeepRatio: () => 24,
            toCanvas: (_ctx:any, op:any) =>
            {
                op.calculateResultProperties();
                recorded.push({
                    abs: op.transformResult.applyToPoint(new Vector2()),
                    local: op.pos.clone(),
                    size: op.size.clone(),
                    hasParent: !!op.parentOperation,
                    inline: op.inline,
                });
            },
        };
        return { getResource: () => ({ getImageFrameAsResource: () => imageResource }) };
    };

    test("an inline image inside a rotated, translated text stays on the line", () => {
        const recorded:any[] = [];
        const config = cfg({ extra: { resLoader: makeLoader(recorded) } });
        const resource = res('aa<img id="icon" frame="0">bb', config);
        const op = new LayoutOperation({
            pos: new Vector2(300, 200), size: new Vector2(400, 200), pivot: Vector2.ZERO, rot: 0.4, resource: resource,
        });

        const canv = scene(new Vector2(1024, 1024), (group) => group.add(resource, op));
        op.calculateResultProperties();

        expect(recorded.length).toBe(1);
        expect(recorded[0].hasParent).toBe(true);
        expect(recorded[0].inline).toBe(true);

        // the image is placed in the text's own coordinate space: right after "aa", on the line's centre
        const line = op.textMetrics.lines[0];
        const before = fills(canv)[0];
        expect(recorded[0].local.x).toBeCloseTo(line.getPosition().x + textWidth("aa", before.font), 4);
        expect(recorded[0].local.y).toBeCloseTo(line.getCenter().y, 4);

        // ... and the text's transform (position + rotation) must be part of where it ends up.
        // The image's own pivot is (0, 0.5), so its top-left is half its height above the line centre;
        // positions are rounded to whole pixels before transforming.
        const expected = op.transformResult.applyToPoint(new Vector2(recorded[0].local.x, recorded[0].local.y - 0.5 * recorded[0].size.y));
        expect(Math.abs(recorded[0].abs.x - expected.x)).toBeLessThan(1);
        expect(Math.abs(recorded[0].abs.y - expected.y)).toBeLessThan(1);
        expect(recorded[0].abs.x).not.toBeCloseTo(recorded[0].local.x, 0);
    });
});
