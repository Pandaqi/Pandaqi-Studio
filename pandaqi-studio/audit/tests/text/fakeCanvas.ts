// A deterministic, dependency-free stand-in for the browser canvas that the pq-games text system needs.
//
// Why a fake instead of the real thing: the text system only ever asks the canvas for `measureText`
// (width + ascent/descent) and then `fillText`/`strokeText`. Those two answers are the entire input of
// the layout algorithm, so a fixed per-character width model makes every layout assertion exact instead
// of "roughly this many pixels in Arial". Every draw call is recorded, with its absolute position after
// whatever transform is active, so placement can be verified as well.

const NARROW_CHARS = "iIl1.,:;'!|()[]{}`\"-";
const WIDE_CHARS = "mwMW@%&";

const SPACE_FACTOR = 0.25;
const NARROW_FACTOR = 0.25;
const WIDE_FACTOR = 1.0;
const DEFAULT_FACTOR = 0.5;
const CAPITAL_FACTOR = 0.6; // uppercase is a little wider, so a case transform is measurable

// every glyph is a fraction of the font size, like a real (monospaced-ish) font
export const charWidthFactor = (ch:string) : number =>
{
    if(ch === " " || ch === "\t") { return SPACE_FACTOR; }
    if(NARROW_CHARS.includes(ch)) { return NARROW_FACTOR; }
    if(WIDE_CHARS.includes(ch)) { return WIDE_FACTOR; }
    if(ch >= "A" && ch <= "Z") { return CAPITAL_FACTOR; }
    return DEFAULT_FACTOR;
};

export const getFontSize = (font:string) : number =>
{
    const match = /(\d+(?:\.\d+)?)px/.exec(font ?? "");
    return match ? parseFloat(match[1]) : 10;
};

export const measureWidth = (text:string, size:number) : number =>
{
    let width = 0;
    for(const ch of text) { width += charWidthFactor(ch) * size; }
    return width;
};

export const ASCENT_FACTOR = 0.8;
export const DESCENT_FACTOR = 0.2;

// global, because the text system measures on one shared context and we may not hold that one
let totalMeasureCalls = 0;
export const resetMeasureCount = () => { totalMeasureCalls = 0; };
export const getMeasureCount = () => totalMeasureCalls;

export interface RecordedTextDraw
{
    method: "fillText" | "strokeText",
    text: string,
    x: number, // raw position, as passed to the canvas
    y: number,
    absX: number, // position after the transform that was active at the time
    absY: number,
    font: string,
    textBaseline: string,
    fillStyle: string,
    strokeStyle: string,
    lineWidth: number,
}

export interface RecordedImageDraw
{
    dx: number,
    dy: number,
    w: number,
    h: number,
    absX: number, // top-left after the transform that was active at the time
    absY: number,
}

interface Matrix { a:number, b:number, c:number, d:number, e:number, f:number }

const IDENTITY : Matrix = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };

export class FakeTextMetrics
{
    width:number
    actualBoundingBoxAscent:number
    actualBoundingBoxDescent:number
    actualBoundingBoxLeft = 0
    actualBoundingBoxRight:number

    constructor(text:string, size:number)
    {
        this.width = measureWidth(text, size);
        this.actualBoundingBoxRight = this.width;

        // spaces (and other invisible characters) report no ascent/descent in real browsers either,
        // and the line-layout code depends on that: a whitespace-only chunk must not raise a line
        const visible = text.trim().length > 0;
        this.actualBoundingBoxAscent = visible ? size * ASCENT_FACTOR : 0;
        this.actualBoundingBoxDescent = visible ? size * DESCENT_FACTOR : 0;
    }
}

export class FakeCanvasContext2D
{
    canvas:any
    font = "10px sans-serif"
    fillStyle:any = "#000000"
    strokeStyle:any = "#000000"
    lineWidth = 1
    textAlign:CanvasTextAlign = "start"
    textBaseline:CanvasTextBaseline = "alphabetic"
    globalAlpha = 1
    globalCompositeOperation:any = "source-over"
    filter = "none"
    imageSmoothingQuality = "low"
    imageSmoothingEnabled = true

    draws:RecordedTextDraw[] = []
    images:RecordedImageDraw[] = []
    measureCalls = 0
    otherCalls:string[] = []

    private matrix:Matrix = { ...IDENTITY };
    private stack:{ matrix:Matrix, state:Record<string,any> }[] = [];

    constructor(canvas:any)
    {
        this.canvas = canvas;
    }

    /* measuring */
    measureText(text:string) : FakeTextMetrics
    {
        this.measureCalls++;
        totalMeasureCalls++;
        return new FakeTextMetrics(text, getFontSize(this.font));
    }

    /* drawing (recorded) */
    fillText(text:string, x:number, y:number)
    {
        this.record("fillText", text, x, y);
    }

    strokeText(text:string, x:number, y:number)
    {
        this.record("strokeText", text, x, y);
    }

    private record(method:"fillText"|"strokeText", text:string, x:number, y:number)
    {
        const m = this.matrix;
        this.draws.push({
            method: method,
            text: text,
            x: x, y: y,
            absX: m.a * x + m.c * y + m.e,
            absY: m.b * x + m.d * y + m.f,
            font: this.font,
            textBaseline: this.textBaseline,
            fillStyle: String(this.fillStyle),
            strokeStyle: String(this.strokeStyle),
            lineWidth: this.lineWidth,
        });
    }

    getTextDraws() { return this.draws; }
    resetRecording() { this.draws = []; this.images = []; this.measureCalls = 0; }

    /* state */
    save()
    {
        this.stack.push({ 
            matrix: { ...this.matrix },
            state: { 
                font: this.font, fillStyle: this.fillStyle, strokeStyle: this.strokeStyle,
                lineWidth: this.lineWidth, textAlign: this.textAlign, textBaseline: this.textBaseline,
                globalAlpha: this.globalAlpha, globalCompositeOperation: this.globalCompositeOperation,
                filter: this.filter,
            }
        });
    }

    restore()
    {
        const entry = this.stack.pop();
        if(!entry) { return; }
        this.matrix = entry.matrix;
        Object.assign(this, entry.state);
    }

    getTransform() : Matrix { return { ...this.matrix }; }

    setTransform(a?:any, b?:number, c?:number, d?:number, e?:number, f?:number)
    {
        if(typeof a === "object" && a != null)
        {
            this.matrix = { a: a.a, b: a.b, c: a.c, d: a.d, e: a.e, f: a.f };
        } else {
            this.matrix = { a: a, b: b, c: c, d: d, e: e, f: f };
        }
    }

    resetTransform() { this.matrix = { ...IDENTITY }; }

    translate(x:number, y:number)
    {
        this.matrix.e += this.matrix.a * x + this.matrix.c * y;
        this.matrix.f += this.matrix.b * x + this.matrix.d * y;
    }

    scale(x:number, y:number)
    {
        this.matrix.a *= x; this.matrix.b *= x;
        this.matrix.c *= y; this.matrix.d *= y;
    }

    rotate(rad:number)
    {
        const cos = Math.cos(rad), sin = Math.sin(rad);
        const m = this.matrix;
        const a = m.a * cos + m.c * sin;
        const b = m.b * cos + m.d * sin;
        const c = -m.a * sin + m.c * cos;
        const d = -m.b * sin + m.d * cos;
        m.a = a; m.b = b; m.c = c; m.d = d;
    }

    /* everything else the renderer may touch; not relevant for text layout */
    beginPath() { this.otherCalls.push("beginPath"); }
    closePath() { this.otherCalls.push("closePath"); }
    moveTo() { this.otherCalls.push("moveTo"); }
    lineTo() { this.otherCalls.push("lineTo"); }
    rect() { this.otherCalls.push("rect"); }
    roundRect() { this.otherCalls.push("roundRect"); }
    arc() { this.otherCalls.push("arc"); }
    quadraticCurveTo() { this.otherCalls.push("quadraticCurveTo"); }
    bezierCurveTo() { this.otherCalls.push("bezierCurveTo"); }
    fill() { this.otherCalls.push("fill"); }
    stroke() { this.otherCalls.push("stroke"); }
    clip() { this.otherCalls.push("clip"); }
    fillRect() { this.otherCalls.push("fillRect"); }
    strokeRect() { this.otherCalls.push("strokeRect"); }
    // A cleared surface has no content left, and the records are what models that content (drawImage
    // copies them from the source). The renderer reuses temporary surfaces, so without this a cleared
    // canvas kept reporting everything that was ever drawn on it.
    clearRect() { this.otherCalls.push("clearRect"); this.draws.length = 0; this.images.length = 0; }
    // when the renderer draws a temporary canvas onto the real one, keep the recorded text AND images visible
    drawImage(img:any, dx = 0, dy = 0, dw?:number, dh?:number)
    {
        this.otherCalls.push("drawImage");

        const m = this.matrix;
        this.images.push({
            dx: dx, dy: dy,
            w: dw ?? (img && img.width) ?? 0,
            h: dh ?? (img && img.height) ?? 0,
            absX: m.a * dx + m.c * dy + m.e,
            absY: m.b * dx + m.d * dy + m.f,
        });

        const sourceCtx = img && img.getContext ? img.getContext("2d") : null;
        if(!sourceCtx) { return; }

        if(sourceCtx.draws)
        {
            for(const d of sourceCtx.draws)
            {
                this.draws.push({
                    ...d,
                    x: d.absX + dx,
                    y: d.absY + dy,
                    absX: m.a * (d.absX + dx) + m.c * (d.absY + dy) + m.e,
                    absY: m.b * (d.absX + dx) + m.d * (d.absY + dy) + m.f,
                });
            }
        }

        if(sourceCtx.images)
        {
            for(const si of sourceCtx.images)
            {
                this.images.push({
                    dx: si.dx + dx, dy: si.dy + dy,
                    w: si.w, h: si.h,
                    absX: m.a * (si.absX + dx) + m.c * (si.absY + dy) + m.e,
                    absY: m.b * (si.absX + dx) + m.d * (si.absY + dy) + m.f,
                });
            }
        }
    }
    setLineDash() { this.otherCalls.push("setLineDash"); }
    getLineDash() { return []; }
}

export class FakeCanvas
{
    width = 512
    height = 512
    style:Record<string,any> = {}
    private ctx:FakeCanvasContext2D = null;

    constructor() {}

    getContext(_type:string) : FakeCanvasContext2D
    {
        if(!this.ctx) { this.ctx = new FakeCanvasContext2D(this); }
        return this.ctx;
    }

    toDataURL() { return "data:,"; }
}

export class FakeElement
{
    tagName:string
    style:Record<string,any> = {}
    children:FakeElement[] = []
    innerHTML = ""
    textContent = ""

    constructor(tagName:string) { this.tagName = tagName; }
    appendChild(child:FakeElement) { this.children.push(child); return child; }
    setAttribute() {}
    removeAttribute() {}
}
