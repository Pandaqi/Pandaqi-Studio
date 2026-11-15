import "./setup";

import { describe, expect, test } from "bun:test";
import { ASCENT, CHAR, cfg, draw, drawDirect, drawTextToCanvas, LayoutOperation, res } from "./helpers";
import { Color, drawTextFromResource, StrokeAlign, TextAlign, Vector2 } from "./lib";
import { measureWidth } from "./fakeCanvas";

// The drawing half: what actually reaches the canvas, in which order, at which position.

describe("draw calls", () => {
    test("a single line is one fillText, with no wasted stroke call", () => {
        const d = draw("aa", { size: new Vector2(100, 100) });
        expect(d.ctx.draws.length).toBe(1);
        expect(d.ctx.draws[0].method).toBe("fillText");
        expect(d.ctx.draws.some((x) => x.method === "strokeText")).toBe(false);
    });

    test("one fillText per word (rich text can only be split per run)", () => {
        const d = draw("aa bb cc", { size: new Vector2(1000, 100) });
        expect(d.ctx.draws.length).toBe(5); // 3 words + 2 spaces
        expect(d.ctx.draws.every((x) => x.method === "fillText")).toBe(true);
    });

    test("an empty chunk does not produce a draw call", () => {
        const d = draw("aa<b></b>bb", { size: new Vector2(1000, 100) });
        expect(d.ctx.draws.length).toBe(2);
        expect(d.draws.map((x) => x.text).join("")).toBe("aabb");
    });

    test("a stroked text does stroke and fill, outer stroke first", () => {
        const d = draw("aa", { size: new Vector2(100, 100), fill: "#000000", stroke: "#ffffff", strokeWidth: 4, strokeAlign: StrokeAlign.OUTSIDE });
        expect(d.ctx.draws.length).toBe(2);
        expect(d.ctx.draws[0].method).toBe("strokeText");
        expect(d.ctx.draws[1].method).toBe("fillText");
        // OUTSIDE strokes are doubled in width (half is clipped away by the fill)
        expect(d.ctx.draws[0].lineWidth).toBe(8);
    });

    test("a stroke without a fill only strokes", () => {
        const d = draw("aa", { size: new Vector2(100, 100), fill: "transparent", stroke: "#ffffff", strokeWidth: 4 });
        expect(d.ctx.draws.length).toBe(1);
        expect(d.ctx.draws[0].method).toBe("strokeText");
    });

    test("the operation's fill colour ends up on the canvas", () => {
        const d = draw("aa", { size: new Vector2(100, 100), fill: "#ff0000" });
        expect(d.ctx.draws[0].fillStyle).toBe(new Color("#ff0000").toString());
    });
});

describe("canvas state", () => {
    test("textAlign and textBaseline are restored after drawing", () => {
        const resource = res("aa bb");
        const d = drawDirect(resource, { size: new Vector2(1000, 100) });
        d.ctx.textAlign = "center";
        d.ctx.textBaseline = "middle";

        const ctx = d.ctx;
        const op = new LayoutOperation({ resource: resource, size: new Vector2(1000, 100) });
        op.calculateResultProperties();
        drawTextToCanvas(ctx, op);

        expect(ctx.textAlign).toBe("center");
        expect(ctx.textBaseline).toBe("middle");
    });
});

describe("operation placement", () => {
    test("a top-left pivot draws at the operation's position", () => {
        const d = draw("aa", { pos: new Vector2(100, 200), size: new Vector2(200, 100), pivot: Vector2.ZERO });
        expect(d.ctx.draws[0].absX).toBeCloseTo(100, 5);
        expect(d.ctx.draws[0].absY).toBeCloseTo(200 + ASCENT, 5);
    });

    test("a centred pivot draws around the operation's position", () => {
        const d = draw("aa", { pos: new Vector2(100, 200), size: new Vector2(200, 100), pivot: Vector2.CENTER });
        expect(d.ctx.draws[0].absX).toBeCloseTo(100 - 100, 5);
        expect(d.ctx.draws[0].absY).toBeCloseTo(200 - 50 + ASCENT, 5);
    });

    test("alignment works relative to the operation's box, not the canvas", () => {
        const config = cfg({ h: TextAlign.MIDDLE, v: TextAlign.MIDDLE });
        const d = draw("aa", { pos: new Vector2(100, 200), size: new Vector2(200, 100), pivot: Vector2.ZERO }, config);
        expect(d.ctx.draws[0].absX).toBeCloseTo(100 + 0.5 * (200 - 2 * CHAR), 5);
        expect(d.ctx.draws[0].absY).toBeCloseTo(200 + 0.5 * (100 - (ASCENT + 3.2)) + ASCENT, 5);
    });

    test("rotation and scale transform the drawn position", () => {
        const d = draw("aa", { pos: new Vector2(0, 0), size: new Vector2(100, 100), pivot: Vector2.ZERO, scale: new Vector2(2, 2) });
        expect(d.ctx.draws[0].absX).toBeCloseTo(0, 5);
        expect(d.ctx.draws[0].absY).toBeCloseTo(2 * ASCENT, 5);
    });
});

describe("text as an image", () => {
    test("drawTextFromResource sizes the canvas to the text and draws inside it", () => {
        const canv:any = drawTextFromResource(res("aaaa bbbb"));
        expect(canv.width).toBeGreaterThan(0);
        expect(canv.height).toBeGreaterThan(0);

        const draws = canv.getContext("2d").draws;
        expect(draws.length).toBeGreaterThan(0);
        for(const item of draws)
        {
            expect(item.absX).toBeGreaterThanOrEqual(0);
            expect(item.absY).toBeGreaterThanOrEqual(0);
            expect(item.absX).toBeLessThanOrEqual(canv.width);
            expect(item.absY).toBeLessThanOrEqual(canv.height);
        }
    });
});

describe("inline images", () => {
    const makeLoader = () => {
        const calls:any[] = [];
        const imageResource:any = {
            getSizeKeepRatio: (y:number) => y, // square icon
            // goes through the real operation path, like ResourceImage.toCanvas does: that path sets the
            // image's fill/stroke/lineWidth on the shared canvas and then draws the image
            toCanvas: (ctx:any, op:any) => { calls.push({ pos: op.pos.clone(), size: op.size.clone() }); op.resource = imageResource; op.applyToCanvas(ctx); },
        };
        const loader:any = {
            getResource: () => ({ getImageFrameAsResource: () => imageResource }),
        };
        return { loader, calls };
    };

    test("an inline image is drawn on the line and the text continues after it", () => {
        const { loader, calls } = makeLoader();
        const config = cfg({ extra: { resLoader: loader } });
        const d = draw('aa<img id="icon" frame="0">bb', { size: new Vector2(1000, 200) }, config);

        expect(calls.length).toBe(1);
        const expectedHeight = 16 * 1.35; // heightToSizeRatio default
        expect(calls[0].size.y).toBeCloseTo(expectedHeight, 5);
        expect(calls[0].size.x).toBeCloseTo(expectedHeight, 5);

        // text before the image, then text after it, which must start behind the image
        const before = d.ctx.draws[0];
        const after = d.ctx.draws[d.ctx.draws.length - 1];
        expect(after.text).toBe("bb");
        expect(after.absX).toBeCloseTo(before.absX + measureWidth("aa", 16) + expectedHeight, 5);

        // the image may set its own fill/stroke/lineWidth on the shared context, but the text after it
        // must still be drawn as this text run, not as the image
        expect(after.fillStyle).toBe(before.fillStyle);
        expect(after.strokeStyle).toBe(before.strokeStyle);
        expect(after.lineWidth).toBe(before.lineWidth);
        expect(after.font).toBe(before.font);

        // the image is vertically centred on the line box (which is as tall as the image)
        expect(calls[0].pos.y).toBeCloseTo(0.5 * expectedHeight, 4);
    });
});
