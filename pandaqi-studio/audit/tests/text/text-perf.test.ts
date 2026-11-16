import "./setup";

import { describe, expect, test } from "bun:test";
import { cfg, drawDirect, res } from "./helpers";
import { Vector2 } from "./lib";
import { getMeasureCount, resetMeasureCount } from "./fakeCanvas";

// Guards for the two things that made text slow: measuring the same chunk more than once, and
// re-walking the whole chunk list for every chunk (which made wrapping quadratic).

const words = ["attack", "defend", "move", "place", "reveal", "hide", "discard", "draw"];
const paragraph = (n:number) => Array.from({ length: n }, (_, i) => words[i % words.length]).join(" ");

describe("measurement work", () => {
    test("each distinct chunk is measured at most once per draw", () => {
        // unique words, so nothing can be served from the cache of an earlier test
        const text = "zqa zqb zqc zqd zqe zqf";
        const resource = res(text, cfg());
        resetMeasureCount();
        drawDirect(resource, { size: new Vector2(1000, 400) });

        const numChunks = text.split(" ").length * 2 - 1; // words + spaces
        expect(getMeasureCount()).toBeGreaterThan(0);
        expect(getMeasureCount()).toBeLessThanOrEqual(numChunks);
    });

    test("a second draw of the same text does not measure anything again", () => {
        const resource = res("qwa qwb qwc qwd", cfg());
        drawDirect(resource, { size: new Vector2(1000, 400) });

        resetMeasureCount();
        drawDirect(resource, { size: new Vector2(1000, 400) });
        expect(getMeasureCount()).toBe(0);
    });

    test("measuring does not allocate a canvas per text box", () => {
        // the shared measuring context means repeated measurement cannot leak 2048x2048 surfaces
        const start = (globalThis as any).document.createElement;
        let canvasCount = 0;
        (globalThis as any).document.createElement = (tag:string) => { if(tag === "canvas") { canvasCount++; } return start(tag); };
        try {
            for(let i = 0; i < 20; i++)
            {
                const resource = res("wrap " + i + " a short paragraph that needs wrapping onto several lines", cfg());
                const op = { size: new Vector2(120, 400) };
                drawDirect(resource, op);
            }
        } finally {
            (globalThis as any).document.createElement = start;
        }
        expect(canvasCount).toBeLessThanOrEqual(4); // canvases for drawing, not for measuring
    });
});

describe("scaling", () => {
    // Every word is unique, so no measurement can come from the chunk cache: these samples measure
    // the actual layout pass. A shared set of repeated words made the larger sample artificially
    // cheap as soon as the cache was warm, which is what let the ratio flap below 1x.
    let uniqueWord = 0;
    const uniqueParagraph = (n:number) => Array.from({ length: n }, () => `w${uniqueWord++}`).join(" ");
    const timeLayout = (n:number, runs:number) =>
    {
        const start = performance.now();
        for(let i = 0; i < runs; i++)
        {
            const resource = res(uniqueParagraph(n), cfg());
            drawDirect(resource, { size: new Vector2(160, 1000) });
        }
        return (performance.now() - start) / runs;
    };

    const median = (values:number[]) => values.slice().sort((a, b) => a - b)[Math.floor(values.length / 2)];

    test("layout is linear in the amount of text, not quadratic", () => {
        // Take the median of several samples: one scheduler hiccup during a 0.1ms baseline used to
        // turn a linear result into an apparent 13x blow-up. The median ignores that noise while a
        // genuinely quadratic layout (16x) still fails every sample. Warm both sizes once so the
        // measured samples are not dominated by first-call JIT work.
        timeLayout(300, 1);
        timeLayout(1200, 1);

        const ratios:number[] = [];
        for(let i = 0; i < 5; i++)
        {
            // large enough that a scheduler hiccup is a small fraction of the sample
            const small = timeLayout(300, 3);
            const big = timeLayout(1200, 3);
            ratios.push(big / Math.max(small, 0.001));
        }
        const ratio = median(ratios);
        console.log(`[text perf] linear-layout ratios: ${ratios.map(r => r.toFixed(1)).join(", ")}x (median ${ratio.toFixed(1)}x)`);
        expect(ratio).toBeLessThan(10); // 4x the text; anything near 16x means quadratic behaviour
    });

    test("a deck-sized batch of paragraph text stays fast", () => {
        const text = paragraph(50);
        const start = performance.now();
        for(let i = 0; i < 100; i++)
        {
            const resource = res(text + " " + i, cfg()); // slightly different each time, like real cards
            drawDirect(resource, { size: new Vector2(180, 400) });
        }
        const total = performance.now() - start;
        console.log(`[text perf] 100 paragraph draws: ${total.toFixed(1)}ms (${(total / 100).toFixed(2)}ms each)`);
        expect(total).toBeLessThan(4000);
    });
});
