import { Vector2 } from "../../geometry/vector2";
import type { TransformationMatrix } from "../tools/transformationMatrix";
import type { LayoutOperation } from "../layoutOperation";
import type { ResourceShape } from "../resources/resourceShape";

// `_debug.layoutOperation` turns every operation into a source of feedback:
// - one structured console line with its inputs, its calculated results and the world-space box
// - a coloured outline + pivot marker drawn on the canvas, labelled with the operation's debug id
//
// This module only reads an operation, so it can be dropped in behind a boolean. Ids are handed out
// lazily and only for operations that are actually debugged.

let nextDebugId = 1;
const debugIds = new WeakMap<object, number>();

export const getLayoutOperationDebugId = (op:LayoutOperation) : number =>
{
    let id = debugIds.get(op);
    if(id === undefined)
    {
        id = nextDebugId++;
        debugIds.set(op, id);
    }
    return id;
}

export const isLayoutOperationDebugEnabled = (op:LayoutOperation) : boolean =>
{
    return op.debug === true || op.renderer?.debugLayoutOperation === true;
}

const DEBUG_COLORS = ["#00E5FF", "#FFEA00", "#FF3D71", "#00E676", "#FF8A00", "#B388FF"];
const DEBUG_COLOR_NUMBERS = DEBUG_COLORS.map((c) => parseInt(c.slice(1), 16));

const getColor = (op:LayoutOperation) =>
{
    const id = getLayoutOperationDebugId(op);
    return DEBUG_COLORS[(id - 1) % DEBUG_COLORS.length];
}

export const getLayoutOperationDebugColorNumber = (op:LayoutOperation) : number =>
{
    // numbers from the same palette, for renderers (Pixi) that cannot take a CSS string
    return DEBUG_COLOR_NUMBERS[(getLayoutOperationDebugId(op) - 1) % DEBUG_COLOR_NUMBERS.length];
}

export const describeLayoutOperationResource = (op:LayoutOperation) : string =>
{
    const resource:any = op.resource;
    if(!resource) { return "empty"; }
    if(op.isGroup()) { return `group(${resource.combos?.length ?? 0})`; }

    const name = resource.constructor?.name ?? "resource";

    if(op.isText())
    {
        const text = String(resource.text ?? "").replace(/\s+/g, " ").trim();
        const shortText = text.length > 24 ? text.slice(0, 24) + "..." : text;
        return `${name} "${shortText}"`;
    }

    if(op.isImage())
    {
        const key = resource.uniqueKey ? ` "${resource.uniqueKey}"` : "";
        return `${name}${key} frame ${op.frame}`;
    }

    return name;
}

// A shape's local (0,0) is its path origin, which is not necessarily the top-left of its bounds
// (most shapes are centered on 0,0). Images and text do start at their top-left.
const getLocalBoundsOrigin = (op:LayoutOperation) : Vector2 =>
{
    if(!op.isShape()) { return Vector2.ZERO; }
    return (op.resource as ResourceShape).shape.getDimensions().position;
}

export const getLayoutOperationBoxPoints = (op:LayoutOperation, matrix:TransformationMatrix = op.transformResult) : Vector2[] =>
{
    const size = op.sizeResult ?? new Vector2();
    if(!matrix) { return [new Vector2(), new Vector2(), new Vector2(), new Vector2()]; }

    const origin = getLocalBoundsOrigin(op);
    return [
        matrix.applyToPoint(new Vector2(origin.x, origin.y)),
        matrix.applyToPoint(new Vector2(origin.x + size.x, origin.y)),
        matrix.applyToPoint(new Vector2(origin.x + size.x, origin.y + size.y)),
        matrix.applyToPoint(new Vector2(origin.x, origin.y + size.y)),
    ];
}

export const getLayoutOperationPivotPoint = (op:LayoutOperation, matrix:TransformationMatrix = op.transformResult) : Vector2 =>
{
    const size = op.sizeResult ?? new Vector2();
    const pivot = op.pivot ?? Vector2.CENTER;
    if(!matrix) { return new Vector2(); }

    const origin = getLocalBoundsOrigin(op);
    return matrix.applyToPoint(new Vector2(origin.x + pivot.x * size.x, origin.y + pivot.y * size.y));
}

const round = (v:number) => { return Math.round(v * 100) / 100; };

export const reportLayoutOperation = (op:LayoutOperation) =>
{
    const matrix = op.transformResult;
    const size = op.sizeResult;
    const box = getLayoutOperationBoxPoints(op, matrix);
    const pivotPoint = getLayoutOperationPivotPoint(op, matrix);

    const data:Record<string, any> =
    {
        resource: describeLayoutOperationResource(op),
        pos: { x: op.pos.x, y: op.pos.y },
        size: { x: size.x, y: size.y },
        rotation: round(op.rot),
        scale: { x: round(op.scaleResult.x), y: round(op.scaleResult.y) },
        skew: { x: round(op.skew.x), y: round(op.skew.y) },
        pivot: { x: op.pivot.x, y: op.pivot.y },
        flip: { x: op.flipX, y: op.flipY },
        depth: op.depth,
        alpha: op.alpha,
        composite: op.composite,
        pivotOffset: { x: round(op.pivotOffset.x), y: round(op.pivotOffset.y) },
        box: {
            topLeft: { x: round(box[0].x), y: round(box[0].y) },
            topRight: { x: round(box[1].x), y: round(box[1].y) },
            bottomRight: { x: round(box[2].x), y: round(box[2].y) },
            bottomLeft: { x: round(box[3].x), y: round(box[3].y) },
            pivot: { x: round(pivotPoint.x), y: round(pivotPoint.y) },
        },
        matrix: matrix ? matrix.m.map(round) : null,
    };

    if(op.hasMask()) { data.mask = op.mask.resource?.constructor?.name ?? "mask"; }
    if(op.hasClip()) { data.clip = "yes"; data.clipRelative = op.clipRelative; }

    console.log(`[LayoutOperation #${getLayoutOperationDebugId(op)}] ${data.resource}`, data);
}

export const drawLayoutOperationDebug = (ctx:CanvasRenderingContext2D, op:LayoutOperation) =>
{
    if(!isLayoutOperationDebugEnabled(op)) { return; }

    // An inline operation draws in the middle of another one, in that operation's coordinate space.
    // Its absolute transform is not the transform of this context, so an overlay would land in the
    // wrong place (and be transformed a second time by the parent). Logs still cover it.
    if(op.inline || !op.transformResult) { return; }

    const matrix = op.transformResult;
    const box = getLayoutOperationBoxPoints(op, matrix);
    const pivot = getLayoutOperationPivotPoint(op, matrix);
    const color = getColor(op);
    const id = getLayoutOperationDebugId(op);
    const size = op.sizeResult;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.filter = "none";
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;
    ctx.shadowBlur = 0;
    ctx.shadowColor = "rgba(0, 0, 0, 0)";
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // full box
    ctx.beginPath();
    ctx.moveTo(box[0].x, box[0].y);
    ctx.lineTo(box[1].x, box[1].y);
    ctx.lineTo(box[2].x, box[2].y);
    ctx.lineTo(box[3].x, box[3].y);
    ctx.closePath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.stroke();

    // pivot marker (a small cross)
    const arm = 6;
    ctx.beginPath();
    ctx.moveTo(pivot.x - arm, pivot.y);
    ctx.lineTo(pivot.x + arm, pivot.y);
    ctx.moveTo(pivot.x, pivot.y - arm);
    ctx.lineTo(pivot.x, pivot.y + arm);
    ctx.stroke();

    // label at the box's top-left corner
    const label = `#${id} ${describeLayoutOperationResource(op)} ${Math.round(size.x)}x${Math.round(size.y)} @ ${Math.round(box[0].x)},${Math.round(box[0].y)}`;
    ctx.font = "12px monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    const metrics = ctx.measureText(label);
    const labelWidth = (metrics?.width ?? label.length * 7) + 6;
    const labelHeight = 16;
    const labelY = box[0].y - labelHeight - 2;

    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(box[0].x, labelY, labelWidth, labelHeight);
    ctx.fillStyle = color;
    ctx.fillText(label, box[0].x + 3, labelY + 12);

    ctx.restore();
}
