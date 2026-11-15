import "./setup";

import { describe, expect, test } from "bun:test";
import { ASCENT, CHAR, cfg, draw, drawDirect, metrics, res, textWidth } from "./helpers";
import { Color, TextAlign, TextConfig, TextTransform, TextVariant, TextWeight, Vector2 } from "./lib";
import { measureWidth } from "./fakeCanvas";

// Rich text: the tags that the parser understands, and whether measuring and drawing agree.
// A mismatch here is the classic bug: text is measured with one font/size and drawn with another,
// so it overflows, wraps too early/late, or a `<upper>` run is drawn wider than it was measured.

const fontOf = (d:any[]) => d.map((x) => x.font);

describe("inline styling", () => {
    test("bold applies to the following text and stops at the closing tag", () => {
        const d = draw("aa<b>bb</b>cc", { size: new Vector2(1000, 100) });
        const fonts = fontOf(d.draws);
        const bold = fonts.findIndex((f) => f.includes("700"));
        expect(bold).toBeGreaterThan(0);
        expect(fonts[bold]).toBe("normal normal 700 16px 'Test'");
        // the text after the closing tag is back to regular
        const lastDraw = d.draws[d.draws.length - 1];
        expect(lastDraw.text).toBe("cc");
        expect(lastDraw.font).toBe("normal normal 500 16px 'Test'");
    });

    test("nested styles restore in the right order", () => {
        const d = draw("<b>aa<em>bb</em>cc</b>dd", { size: new Vector2(1000, 100) });
        const fonts = d.draws.map((x) => x.font);
        expect(fonts[0]).toBe("normal normal 700 16px 'Test'"); // bold
        expect(fonts[1]).toBe("italic normal 700 16px 'Test'"); // bold + italic
        expect(fonts[2]).toBe("normal normal 700 16px 'Test'"); // bold again
        expect(fonts[3]).toBe("normal normal 500 16px 'Test'"); // regular again
    });

    test("<size> changes the font size and is measured with that size", () => {
        const d = draw("aa<size num=\"32\">bb</size>cc", { size: new Vector2(1000, 200) });
        const sizes = d.draws.map((x) => /(\d+)px/.exec(x.font)[1]);
        expect(sizes).toEqual(["16", "32", "16"]);

        // the middle run is twice as wide, and the layout must know that
        const wide = d.draws[1];
        expect(textWidth(wide.text, wide.font)).toBe(2 * CHAR * 2);
    });

    test("<col> changes the fill colour of the run", () => {
        const red = new Color("#ff0000").toString();
        const black = new Color("#000000").toString();
        const d = draw("aa<col hex=\"#ff0000\">bb</col>cc", { size: new Vector2(1000, 100), fill: "#000000" });
        const styles = d.draws.map((x) => x.fillStyle);
        expect(styles[0]).toBe(black);
        expect(styles[1]).toBe(red);
        expect(styles[2]).toBe(black);
    });

    test("<font> switches the font family", () => {
        const d = draw("aa<font id=\"Other\">bb</font>cc", { size: new Vector2(1000, 100) });
        const fonts = d.draws.map((x) => x.font);
        expect(fonts[1]).toContain("'Other'");
        expect(fonts[2]).toContain("'Test'");
    });

    test("<sc> switches to small caps", () => {
        const d = draw("aa<sc>bb</sc>", { size: new Vector2(1000, 100) });
        expect(d.draws[1].font).toContain("small-caps");
    });
});

describe("text transform (case)", () => {
    test("UPPERCASE measures and draws the uppercase text", () => {
        const config = cfg({ extra: { transform: TextTransform.UPPERCASE } });
        const m = metrics("abc", new Vector2(1000, 100), config);
        expect(m.dimsFull.getSize().x).toBeCloseTo(measureWidth("ABC", 16), 5);

        const d = draw("abc", { size: new Vector2(1000, 100) }, config);
        expect(d.draws[0].text).toBe("ABC");
    });

    test("<upper> and <lower> apply per run", () => {
        const upper = draw("<upper>abc</upper>", { size: new Vector2(1000, 100) });
        expect(upper.ctx.draws[0].text).toBe("ABC");

        const lower = draw("<lower>ABC</lower>", { size: new Vector2(1000, 100) });
        expect(lower.ctx.draws[0].text).toBe("abc");
    });

    test("the measured width of an uppercase run matches its drawn width", () => {
        const config = cfg({ extra: { transform: TextTransform.UPPERCASE } });
        const m = metrics("abc", new Vector2(1000, 100), config);
        const d = draw("abc", { size: new Vector2(1000, 100) }, config);
        const drawnWidth = textWidth(d.draws[0].text, d.draws[0].font);
        expect(m.dimsFull.getSize().x).toBeCloseTo(drawnWidth, 5);
    });
});

describe("superscript and subscript", () => {
    test("<sup> uses a smaller font and sits above the baseline", () => {
        const d = draw("x<sup>2</sup>", { size: new Vector2(1000, 200) });
        const sup = d.draws[1];
        expect(/(\d+(?:\.\d+)?)px/.exec(sup.font)[1]).toBe("10.56");
        expect(sup.textBaseline).toBe("bottom");
        // the following text is back on the normal baseline
        if(d.draws[2]) { expect(d.draws[2].textBaseline).toBe("alphabetic"); }
    });

    test("<sub> uses a smaller font and hangs below the baseline", () => {
        const d = draw("x<sub>2</sub>", { size: new Vector2(1000, 200) });
        const sub = d.draws[1];
        expect(/(\d+(?:\.\d+)?)px/.exec(sub.font)[1]).toBe("10.56");
        expect(sub.textBaseline).toBe("top");
    });

    test("a subscript increases the line height it needs", () => {
        const plain = metrics("xx", new Vector2(1000, 500));
        const withSub = metrics("x<sub>2</sub>", new Vector2(1000, 500));
        expect(withSub.dimsFull.getSize().y).toBeGreaterThan(plain.dimsFull.getSize().y);
    });
});

describe("format toggle", () => {
    test("format:false draws the tags literally", () => {
        const config = cfg({ extra: { format: false } });
        const d = draw("<b>aa</b>", { size: new Vector2(1000, 100) }, config);
        expect(d.draws.map((x) => x.text).join("")).toBe("<b>aa</b>");
        expect(d.draws[0].font).toBe("normal normal 500 16px 'Test'");
    });

    test("newlines still break with format:false", () => {
        const config = cfg({ extra: { format: false } });
        const d = draw("aa\nbb", { size: new Vector2(1000, 200) }, config);
        expect(d.lines.length).toBe(2);
    });
});

describe("style state is not sticky", () => {
    test("drawing the same resource twice produces identical output", () => {
        const resource = res("<b>aa</b> <size num=\"24\">bb</size> <col hex=\"#00ff00\">cc</col>", cfg());
        const first = drawDirect(resource, { size: new Vector2(1000, 200) });
        const second = drawDirect(resource, { size: new Vector2(1000, 200) });

        expect(second.draws.length).toBe(first.draws.length);
        for(let i = 0; i < first.draws.length; i++)
        {
            expect(second.draws[i].text).toBe(first.draws[i].text);
            expect(second.draws[i].font).toBe(first.draws[i].font);
            expect(second.draws[i].fillStyle).toBe(first.draws[i].fillStyle);
            expect(second.draws[i].absX).toBe(first.draws[i].absX);
        }
    });

    test("cloning a config does not touch the original's style history", () => {
        const config = cfg();
        const copy = config.clone();

        copy.updateProperty("size", 24);
        expect(copy.size).toBe(24);
        copy.rollbackProperty("size");

        expect(copy.size).toBe(16);
        expect(config.size).toBe(16);
        expect(Object.keys(config.history).length).toBe(0);
    });

    test("the config itself is not mutated by drawing", () => {
        const config = cfg();
        const before = JSON.stringify({ weight: config.weight, size: config.size, color: config.color, transform: config.transform });
        draw("<b>aa</b>", { size: new Vector2(1000, 100) }, config);
        const after = JSON.stringify({ weight: config.weight, size: config.size, color: config.color, transform: config.transform });
        expect(after).toBe(before);
        expect(config.weight).toBe(TextWeight.REGULAR);
        expect(config.variant).toBe(TextVariant.NORMAL);
    });
});
