// Installs just enough of the DOM for the text system to run headless under `bun test`.
// Import this module FIRST in a test file: ES module evaluation follows import order, and pq-games
// touches `DOMMatrix` at module scope.

import { FakeCanvas, FakeCanvasContext2D, FakeElement } from "./fakeCanvas";

const g = globalThis as any;

if(typeof g.document === "undefined")
{
    g.document = {
        createElement: (tag:string) => tag === "canvas" ? new FakeCanvas() : new FakeElement(tag),
        fonts: { add: () => {} },
    };
}

if(typeof g.HTMLCanvasElement === "undefined") { g.HTMLCanvasElement = FakeCanvas; }
if(typeof g.CanvasRenderingContext2D === "undefined") { g.CanvasRenderingContext2D = FakeCanvasContext2D; }

// `layout/canvas/operations.ts` builds a `new DOMMatrix()` at module scope
if(typeof g.DOMMatrix === "undefined")
{
    g.DOMMatrix = class DOMMatrixStub
    {
        a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
        constructor(_init?:any) {}
        translate() { return this; }
        scale() { return this; }
        rotate() { return this; }
        multiply() { return this; }
        clone() { return this; }
    };
}

if(typeof g.Path2D === "undefined")
{
    g.Path2D = class Path2DStub
    {
        moveTo() {}
        lineTo() {}
        quadraticCurveTo() {}
        bezierCurveTo() {}
        closePath() {}
        arc() {}
        rect() {}
        roundRect() {}
        addPath() {}
    };
}

if(typeof g.self === "undefined") { g.self = globalThis; }
