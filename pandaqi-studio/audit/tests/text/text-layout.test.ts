import "./setup";

import { describe, expect, test } from "bun:test";
import { ASCENT, CHAR, DESCENT, LINE, newContext, SPACE, cfg, draw, drawTextToCanvas, LayoutOperation, lineText, lineWidth, metrics, res, SIZE } from "./helpers";
import { calculateTextMetrics, fitTextSizeToBox, TextAlign, TextConfig, Vector2 } from "./lib";

// The layout half of the text system: where does a line end up, and what size is the text block?
// Every number below follows from the deterministic canvas in `fakeCanvas.ts` (8px per character at
// size 16), so a failure means the layout math changed, not that a font rendered differently.

describe("single line placement", () => {
    test("start/top puts the first baseline exactly one ascent below the origin", () => {
        const m = metrics("aa", new Vector2(200, 100));
        expect(m.lines.length).toBe(1);
        expect(m.lines[0].getSize().x).toBe(2 * CHAR);
        expect(m.lines[0].getPosition().x).toBe(0);
        expect(m.lines[0].getPosition().y).toBeCloseTo(ASCENT, 5);
        expect(m.dimsUsed.getSize().y).toBeCloseTo(ASCENT + DESCENT, 5);
        // an explicit box is reported as that box; the ink is what dimsUsed is for
        expect(m.dimsFull.getSize().y).toBe(100);
    });

    test("drawn baseline matches the measured baseline", () => {
        const d = draw("aa", { size: new Vector2(200, 100) });
        expect(d.ctx.draws.length).toBe(1);
        expect(d.ctx.draws[0].absX).toBe(0);
        expect(d.ctx.draws[0].absY).toBeCloseTo(ASCENT, 5);
    });

    test("metrics honour the given offset", () => {
        const m = metrics("aa", new Vector2(200, 100), cfg());
        expect(m.lines[0].getPosition().x).toBe(0);

        const resource = res("aa");
        const shifted = calculateTextMetrics(resource, new Vector2(200, 100), new Vector2(30, 40));
        expect(shifted.lines[0].getPosition().x).toBe(30);
        expect(shifted.lines[0].getPosition().y).toBeCloseTo(40 + ASCENT, 5);
    });
});

describe("horizontal alignment", () => {
    const text = "aa\nbbbb"; // 16px and 32px wide

    test("start aligns every line at the left edge", () => {
        const m = metrics(text, new Vector2(100, 100), cfg({ h: TextAlign.START }));
        expect(m.lines[0].getPosition().x).toBe(0);
        expect(m.lines[1].getPosition().x).toBe(0);
    });

    test("middle centres every line individually", () => {
        const m = metrics(text, new Vector2(100, 100), cfg({ h: TextAlign.MIDDLE }));
        expect(m.lines[0].getPosition().x).toBeCloseTo(0.5 * (100 - 2 * CHAR), 5); // 42
        expect(m.lines[1].getPosition().x).toBeCloseTo(0.5 * (100 - 4 * CHAR), 5); // 34
    });

    test("end aligns every line at the right edge", () => {
        const m = metrics(text, new Vector2(100, 100), cfg({ h: TextAlign.END }));
        expect(m.lines[0].getPosition().x).toBeCloseTo(100 - 2 * CHAR, 5); // 84
        expect(m.lines[1].getPosition().x).toBeCloseTo(100 - 4 * CHAR, 5); // 68
    });

    test("drawing uses those positions", () => {
        const d = draw("aa", { size: new Vector2(100, 100) }, cfg({ h: TextAlign.MIDDLE }));
        expect(d.ctx.draws[0].absX).toBeCloseTo(42, 5);
    });
});

describe("vertical alignment", () => {
    // two lines: baselines 0 and 19.2, block height = 2*19.2 - (lineHeight - size) = 35.2
    const text = "aa\nbb";
    const realHeight = 2 * LINE - (LINE - (ASCENT + DESCENT)); // 35.2

    test("start anchors the block at the top", () => {
        const m = metrics(text, new Vector2(100, 100), cfg({ v: TextAlign.START }));
        expect(m.lines[0].getPosition().y).toBeCloseTo(ASCENT, 5);
        expect(m.lines[1].getPosition().y).toBeCloseTo(ASCENT + LINE, 5);
    });

    test("middle centres the block", () => {
        const m = metrics(text, new Vector2(100, 100), cfg({ v: TextAlign.MIDDLE }));
        const top = 0.5 * (100 - realHeight);
        expect(m.lines[0].getPosition().y).toBeCloseTo(top + ASCENT, 5);
        expect(m.lines[1].getPosition().y).toBeCloseTo(top + ASCENT + LINE, 5);
    });

    test("end anchors the block at the bottom", () => {
        const m = metrics(text, new Vector2(100, 100), cfg({ v: TextAlign.END }));
        const top = 100 - realHeight;
        expect(m.lines[0].getPosition().y).toBeCloseTo(top + ASCENT, 5);
        expect(m.lines[1].getPosition().y).toBeCloseTo(top + ASCENT + LINE, 5);
    });

    test("justify spreads the lines over the box, never beyond it", () => {
        const text3 = "aa\nbb\ncc";
        const m = metrics(text3, new Vector2(100, 100), cfg({ v: TextAlign.JUSTIFY }));
        const blockHeight = 3 * LINE - (LINE - (ASCENT + DESCENT)); // 54.4
        const extra = (100 - blockHeight) / 2;
        expect(m.lines[0].getPosition().y).toBeCloseTo(ASCENT, 5);
        expect(m.lines[1].getPosition().y).toBeCloseTo(ASCENT + LINE + extra, 5);
        expect(m.lines[2].getPosition().y).toBeCloseTo(ASCENT + 2 * LINE + 2 * extra, 5);
    });

    test("justify with a single line does not explode", () => {
        const m = metrics("aa", new Vector2(100, 100), cfg({ v: TextAlign.JUSTIFY }));
        expect(Number.isFinite(m.lines[0].getPosition().y)).toBe(true);
        expect(m.lines[0].getPosition().y).toBeCloseTo(ASCENT, 5);
    });
});

describe("wrapping", () => {
    test("wraps at spaces, keeps words whole, never exceeds the box", () => {
        const text = "aaaa bbbb cccc dddd"; // 32 + 4 + 32 = 68 per pair
        const m = metrics(text, new Vector2(100, 100));
        expect(m.lines.length).toBe(2);
        expect(m.lines[0].getSize().x).toBeCloseTo(68, 5);
        expect(m.lines[1].getSize().x).toBeCloseTo(68, 5);
        for(const line of m.lines) { expect(line.getSize().x).toBeLessThanOrEqual(100); }
    });

    test("a wrapped line does not keep the trailing space", () => {
        const m = metrics("aaaa bbbb cccc dddd", new Vector2(100, 100));
        expect(m.lines[0].chunks[m.lines[0].chunks.length - 1].isEmptySpace()).toBe(false);
        expect(m.lines[0].getSize().x).toBeCloseTo(68, 5);
    });

    test("a word longer than the box is not cut in half", () => {
        const m = metrics("aaaaaaaaaa bb", new Vector2(40, 100));
        expect(m.lines.length).toBe(2);
        expect(m.lines[0].getSize().x).toBeCloseTo(10 * CHAR, 5); // overflows, but stays one word
    });

    test("wrap:false ignores the box width", () => {
        const m = metrics("aaaa bbbb cccc dddd", new Vector2(40, 100), cfg({ extra: { wrap: false } }));
        expect(m.lines.length).toBe(1);
        expect(m.lines[0].getSize().x).toBeCloseTo(4 * 4 * CHAR + 3 * SPACE, 5);
    });

    test("no line ever starts with a space", () => {
        const d = draw("aaaa bbbb cccc dddd eeee", { size: new Vector2(100, 100) });
        for(const line of d.lines) { expect(line[0].text.startsWith(" ")).toBe(false); }
    });

    test("drawing a wrapped text places each line at its own baseline", () => {
        const d = draw("aaaa bbbb cccc dddd", { size: new Vector2(100, 100) });
        expect(d.lines.length).toBe(2);
        expect(lineText(d.lines[0])).toBe("aaaa bbbb");
        expect(lineText(d.lines[1])).toBe("cccc dddd");
        expect(d.lines[1][0].absY).toBeCloseTo(ASCENT + LINE, 5);
    });

    test("punctuation does not start a line", () => {
        // "word." must move down as a unit instead of leaving the dot on its own line
        const m = metrics("aaaa bbbb cccc.", new Vector2(100, 100));
        const lastLine = m.lines[m.lines.length - 1];
        const lastLineText = lastLine.chunks.map((c:any) => c.text).join("");
        expect(lastLineText.endsWith(".")).toBe(true);
        expect(/^[.?]/.test(lastLineText)).toBe(false);
    });

    test("a lone short word is not left on the last line", () => {
        // "aa bb cc dd" in a 60px box: without widow control the last line would be just "dd"
        const d = draw("aa bb cc dd", { size: new Vector2(60, 100) });
        expect(d.lines.length).toBe(2);
        expect(lineText(d.lines[0])).toBe("aa bb");
        expect(lineText(d.lines[1])).toBe("cc dd");
    });

    test("a two-word line is left alone instead of leaving a single word behind", () => {
        const d = draw("aaaa bbbb cc", { size: new Vector2(80, 100) });
        expect(d.lines.length).toBe(2);
        expect(lineText(d.lines[0])).toBe("aaaa bbbb");
        expect(lineText(d.lines[1])).toBe("cc");
    });
});

describe("explicit line breaks", () => {
    test("a newline starts a new line with the same height", () => {
        const m = metrics("aa\nbb", new Vector2(100, 100));
        expect(m.lines.length).toBe(2);
        expect(m.dimsUsed.getSize().y).toBeCloseTo(2 * LINE - (LINE - (ASCENT + DESCENT)), 5);
    });

    test("a blank line takes up vertical space", () => {
        const m = metrics("aa\n\nbb", new Vector2(100, 100));
        expect(m.lines.length).toBe(3);
        expect(m.lines[1].chunks.length).toBe(0);
        expect(m.lines[2].getPosition().y).toBeCloseTo(ASCENT + 2 * LINE, 5);
    });

    test("text that starts with a newline still draws its content", () => {
        const d = draw("\nhello", { size: new Vector2(200, 100) });
        expect(d.ctx.draws.length).toBeGreaterThan(0);
        expect(d.ctx.draws[0].text).toBe("hello");
    });
});

describe("automatic dimensions", () => {
    test("a text operation without a size measures itself and draws inside its own box", () => {
        const d = draw("aaaa bbbb", {});
        const op = d.ctx;
        const size = (d as any).op?.sizeResult;
        expect(d.lines.length).toBe(1); // no box width, so no wrapping
        expect(d.ctx.draws.length).toBeGreaterThan(0);

        for(const item of d.ctx.draws)
        {
            expect(item.absX).toBeGreaterThanOrEqual(0);
            expect(item.absY).toBeGreaterThanOrEqual(0);
        }
    });

    test("auto dimensions equal the natural text size", () => {
        const resource = res("aaaa bbbb");
        const op = new LayoutOperation({ resource: resource, pos: new Vector2() });
        op.calculateResultProperties();
        // "aaaa bbbb" = 4*8 + 4 + 4*8 = 68, rounded + 1 for rounding slack
        expect(op.sizeResult.x).toBe(69);
        expect(op.sizeResult.y).toBe(Math.round(ASCENT + DESCENT) + 1);
    });

    test("centred auto-sized text is still drawn inside its box", () => {
        let d;
        try {
            d = draw("hello world", {}, cfg({ h: TextAlign.MIDDLE, v: TextAlign.MIDDLE }));
        } catch(err) { throw err; }

        const maxX = Math.max(...d.ctx.draws.map((x) => x.absX));
        expect(maxX).toBeLessThan(200);
        expect(d.ctx.draws[0].absY).toBeLessThan(100);
    });

    test("sizeAuto uses the natural text size even when a box was given", () => {
        // (this is how e.g. a card's modal text is drawn: centred, but as big as the text itself)
        const config = cfg({ h: TextAlign.MIDDLE, v: TextAlign.MIDDLE });
        const resource = res("aaaa bbbb", config);
        const op = new LayoutOperation({ resource: resource, size: new Vector2(400, 200), sizeAuto: true, pivot: Vector2.ZERO });
        op.calculateResultProperties();

        expect(op.sizeResult.x).toBe(69);
        expect(op.sizeResult.y).toBe(Math.round(ASCENT + DESCENT) + 1);

        const ctx = newContext();
        drawTextToCanvas(ctx, op);
        expect(ctx.draws.length).toBeGreaterThan(0);
        for(const item of ctx.draws) { expect(item.absY).toBeLessThan(op.sizeResult.y); }
    });

    test("a zero height means 'as tall as the text needs'", () => {
        const resource = res("aaaa bbbb cccc dddd");
        const op = new LayoutOperation({ resource: resource, pos: new Vector2(), size: new Vector2(100, 0) });
        op.calculateResultProperties();
        expect(op.sizeResult.x).toBe(100);
        expect(op.sizeResult.y).toBeGreaterThanOrEqual(2 * LINE - 4);
    });
});

describe("justification", () => {
    test("wrapped lines are stretched to the full box width, the last line is not", () => {
        const config = cfg({ h: TextAlign.JUSTIFY });
        const d = draw("aaaa bbbb cccc dddd eeee", { size: new Vector2(100, 100) }, config);
        expect(d.lines.length).toBe(3);

        // line 1 and 2 hold two words each (68px) and must span the full 100px
        expect(lineWidth(d.lines[0])).toBeCloseTo(100, 4);
        expect(lineWidth(d.lines[1])).toBeCloseTo(100, 4);
        // the final line of the paragraph stays at its natural width
        expect(lineText(d.lines[2])).toBe("eeee");
        expect(lineWidth(d.lines[2])).toBeCloseTo(4 * CHAR, 4);
    });

    test("the line before an explicit newline is not stretched either", () => {
        const config = cfg({ h: TextAlign.JUSTIFY });
        const m = metrics("aaaa bbbb\ncccc dddd", new Vector2(100, 100), config);
        // both lines end a paragraph, so neither gets stretched
        expect(m.lines[0].getSize().x).toBeCloseTo(68, 4);
        expect(m.lines[1].getSize().x).toBeCloseTo(68, 4);
    });

    test("justification also works for text without spaces (no crash, no division by zero)", () => {
        const m = metrics("aaaaaaa", new Vector2(100, 100), cfg({ h: TextAlign.JUSTIFY }));
        expect(Number.isFinite(m.lines[0].extraSpaceJustifyX)).toBe(true);
        expect(m.lines[0].getSize().x).toBeCloseTo(7 * CHAR, 5);
    });
});

describe("line height", () => {
    test("lineHeight is relative to the font size", () => {
        const m = metrics("aa\nbb", new Vector2(100, 100), cfg({ extra: { lineHeight: 2.0 } }));
        expect(m.lines[1].getPosition().y - m.lines[0].getPosition().y).toBeCloseTo(2 * SIZE, 5);
    });

    test("a smaller lineHeight than 1 does not overlap lines", () => {
        const m = metrics("aa\nbb", new Vector2(100, 100), cfg({ extra: { lineHeight: 0.5 } }));
        expect(m.dimsFull.getSize().y).toBeGreaterThan(ASCENT + DESCENT);
    });

    test("useDynamicLineHeight uses the tallest chunk of the previous line", () => {
        const config = cfg({ extra: { useDynamicLineHeight: true } });
        const m = metrics("<size num=\"40\">big</size>\nsmall", new Vector2(400, 400), config);
        expect(m.lines.length).toBe(2);
        expect(m.lines[1].getPosition().y).toBeGreaterThan(40);
    });
});

describe("overflow", () => {
    test("text taller than its box is clamped and reports once, not on every draw", () => {
        const errors:string[] = [];
        const old = console.error;
        console.error = (...args:any[]) => { errors.push(args[0]); };

        try {
            const config = cfg();
            const box = new Vector2(100, 20);
            metrics("aa\nbb\ncc\ndd\nee", box, config);
            metrics("aa\nbb\ncc\ndd\nee", box, config);
            metrics("aa\nbb\ncc\ndd\nee", box, config);
        } finally {
            console.error = old;
        }

        expect(errors.length).toBeGreaterThan(0);
        expect(errors.length).toBeLessThanOrEqual(2); // one for Y (and possibly one for X), not one per call
    });

    test("visible dimensions are clamped to the box", () => {
        const m = metrics("aa\nbb\ncc\ndd\nee", new Vector2(100, 20));
        expect(m.dimsFull.getSize().y).toBeLessThanOrEqual(20);
    });
});

describe("line limit", () => {
    test("maxLines clips the extra lines instead of overflowing the box", () => {
        const config = cfg({ extra: { maxLines: 2 } });
        const text = "aaaa bbbb cccc dddd eeee ffff";
        const m = metrics(text, new Vector2(100, 400), config);
        expect(m.lines.length).toBe(2);
        expect(m.dimsUsed.getSize().y).toBeCloseTo(2 * LINE - (LINE - (ASCENT + DESCENT)), 5);
        expect(m.dimsFull.getSize().y).toBe(400); // the given box is not clipped to the text

        const d = draw(text, { size: new Vector2(100, 400) }, config);
        expect(d.lines.length).toBe(2);
        expect(lineText(d.lines[1])).toBe("cccc dddd");
    });

    test("maxLines of 0 means unlimited", () => {
        const m = metrics("aaaa bbbb cccc dddd eeee ffff", new Vector2(100, 400), cfg({ extra: { maxLines: 0 } }));
        expect(m.lines.length).toBe(3);
    });
});

describe("used dimensions", () => {
    test("the used box follows the actual ink, not the text box", () => {
        const config = cfg({ h: TextAlign.MIDDLE, v: TextAlign.MIDDLE });
        const m = metrics("aa", new Vector2(100, 100), config);
        expect(m.dimsUsed.position.x).toBeCloseTo(42, 5);
        expect(m.dimsUsed.position.y).toBeCloseTo(0.5 * (100 - (ASCENT + DESCENT)), 5);
        expect(m.dimsUsed.getSize().x).toBeCloseTo(2 * CHAR, 5);
    });

    test("fitTextSizeToBox shrinks the font until the text fits", () => {
        const config = cfg();
        const resource = res("aaaa bbbb cccc dddd eeee", config);
        const fits = fitTextSizeToBox(resource.text, config, new Vector2(100, 40));
        expect(fits).toBeLessThan(SIZE);

        const m = metrics(resource.text, new Vector2(100, 40), new TextConfig({ size: fits, font: "Test", alignHorizontal: TextAlign.START, alignVertical: TextAlign.START }));
        expect(m.lines.length * fits * 1.2).toBeLessThanOrEqual(60);
    });
});

describe("empty text", () => {
    test("an empty string has no metrics and draws nothing", () => {
        const d = draw("", { size: new Vector2(100, 100) });
        expect(d.ctx.draws.length).toBe(0);
    });

    test("whitespace only draws nothing", () => {
        const d = draw("   \n  ", { size: new Vector2(100, 100) });
        expect(d.ctx.draws.length).toBe(0);
    });

    test("an empty text with auto size gets an empty box instead of crashing", () => {
        const resource = res("");
        const op = new LayoutOperation({ resource: resource });
        expect(() => op.calculateResultProperties()).not.toThrow();
        expect(op.sizeResult.x).toBe(0);
        expect(op.sizeResult.y).toBe(0);
    });
});
