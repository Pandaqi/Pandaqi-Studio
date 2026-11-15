import "../text/setup";

import { describe, expect, test } from "bun:test";
import { LayoutOperation, Vector2 } from "./lib";

// LayoutOperation is created/calculated for every item of every page, so the cheap paths must stay
// cheap. The budgets are deliberately loose: they only catch a structural regression (an operation
// allocating a renderer again, result objects being reallocated, something turning quadratic).

describe("LayoutOperation performance", () =>
{
    test("creating many default operations stays cheap", () =>
    {
        const count = 200_000;
        const start = performance.now();
        for(let i = 0; i < count; i++) { new LayoutOperation(); }
        const total = performance.now() - start;

        console.log(`[layout perf] ${count} default operations: ${total.toFixed(1)}ms`);
        expect(total).toBeLessThan(2000);
    });

    test("calculating many positioned operations stays cheap", () =>
    {
        const count = 100_000;
        const start = performance.now();
        for(let i = 0; i < count; i++)
        {
            const op = new LayoutOperation({ pos: new Vector2(i % 100, i % 50), size: new Vector2(10, 10), pivot: Vector2.ZERO });
            op.calculateResultProperties();
        }
        const total = performance.now() - start;

        console.log(`[layout perf] ${count} creations + calculations: ${total.toFixed(1)}ms`);
        expect(total).toBeLessThan(3000);
    });

    test("recalculating an existing operation stays cheap", () =>
    {
        const op = new LayoutOperation({ size: new Vector2(10, 10), pivot: Vector2.ZERO });
        const count = 200_000;
        const start = performance.now();
        for(let i = 0; i < count; i++)
        {
            op.pos.x = i % 100;
            op.pos.y = i % 50;
            op.calculateResultProperties();
        }
        const total = performance.now() - start;

        console.log(`[layout perf] ${count} recalculations: ${total.toFixed(1)}ms`);
        expect(total).toBeLessThan(2000);
    });
});
