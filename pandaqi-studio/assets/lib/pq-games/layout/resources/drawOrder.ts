import type { LayoutCombo } from "./resourceGroup";
import { isZero } from "../../tools/numbers/checks";

// Decides the order in which a group hands its children to a renderer.
//
// Three rules, in this order:
//  1. A group may supply its own `order` hook, which returns a reordered array (or the same one).
//  2. `depth` sorts children from low to high. This is the default behaviour and costs nothing when no
//     child uses depth.
//  3. With `batching` enabled, children with the same draw style are drawn consecutively, so the canvas
//     keeps one fill/stroke/alpha state instead of switching per element. That genuinely reorders the
//     elements (an element with a lower batch key paints earlier), so it is opt-in: only turn it on for
//     groups whose children do not overlap.
//
// Everything here is pure: no renderer, no DOM, no globals. The input array is never mutated.

export interface DrawOrderHook
{
    (combos:LayoutCombo[]) : LayoutCombo[];
}

export interface DrawOrderOptions
{
    order?: DrawOrderHook | null,
    batching?: boolean,
}

// The canvas state a batch would keep alive between two elements. Two children with the same key only
// differ in where they are drawn, which is a transform, not a state change.
export const getComboBatchKey = (combo:LayoutCombo) : string =>
{
    if(combo.batchKey) { return combo.batchKey; }

    const op = combo.operation;
    if(!op) { return ""; }

    const kind = op.isGroup() ? "g" : op.isText() ? "t" : op.isImage() ? "i" : op.isShape() ? "s" : "?";
    return [
        kind,
        op.hasFill() ? op.fill.toCSS() : "-",
        op.hasStroke() ? op.stroke.toCSS() : "-",
        op.strokeWidth,
        op.strokeType,
        op.strokeAlign,
        op.alpha,
        op.composite,
        op.getTint(),
        op.hasEffects() ? op.effects.length : 0,
    ].join("|");
}

const usesDepth = (combos:LayoutCombo[]) =>
{
    for(const combo of combos)
    {
        if(combo.operation && !isZero(combo.operation.depth)) { return true; }
    }
    return false;
}

export const orderCombosForDrawing = (combos:LayoutCombo[], options:DrawOrderOptions = {}) : LayoutCombo[] =>
{
    const batch = options.batching ?? false;
    const ordered = (options.order ? options.order(combos) : combos) ?? combos;

    // the common case: insertion order, no allocation, no sort
    if(!batch && !usesDepth(ordered)) { return ordered; }

    const depthOf = (combo:LayoutCombo) => combo.operation?.depth ?? 0;
    const keyed = ordered.map((combo, index) => ({
        combo,
        index,
        depth: depthOf(combo),
        key: batch ? getComboBatchKey(combo) : "",
    }));

    keyed.sort((a, b) =>
    {
        if(a.depth !== b.depth) { return a.depth - b.depth; }
        if(a.key !== b.key) { return a.key < b.key ? -1 : 1; }
        return a.index - b.index; // stable: same depth + same style keeps insertion order
    });

    return keyed.map((entry) => entry.combo);
}
