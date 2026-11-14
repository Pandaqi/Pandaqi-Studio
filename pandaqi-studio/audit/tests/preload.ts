// `bun test` has no DOM, and parts of pq-games build a `new DOMMatrix()` at module scope (canvas state).
// The library tests only exercise pure geometry/settings code, so a stub that exists is enough.
if(typeof (globalThis as any).DOMMatrix == "undefined")
{
    (globalThis as any).DOMMatrix = class DOMMatrixStub
    {
        a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
        constructor(_init?: any) {}
        translate() { return this; }
        scale() { return this; }
        rotate() { return this; }
        multiply() { return this; }
        clone() { return this; }
    };
}

if(typeof (globalThis as any).self == "undefined") { (globalThis as any).self = globalThis; }
