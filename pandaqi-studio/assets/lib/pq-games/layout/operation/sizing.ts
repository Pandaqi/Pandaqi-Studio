import { Vector2 } from "../../geometry/vector2";
import { fitSizeAndKeepRatio } from "../../tools/numbers/bounds";
import type { ResourceImage } from "../resources/resourceImage";
import type { ResourceShape } from "../resources/resourceShape";
import type { ResourceText } from "../resources/resourceText";
import { TextBoxMetrics, calculateTextMetrics } from "../text/metrics";
import type { ResourceLike } from "./types";

// Shapes, images and text each have their own idea of "what size am I?".
// This lives in its own module so LayoutOperation's calculation is a short, readable pipeline:
// reset -> resource sizing -> matrix. It mutates the given result vectors (no allocations).
export const applyResourceSizing = (
    resource:ResourceLike,
    size:Vector2,
    scale:Vector2,
    sizeAuto:boolean,
    isShape:boolean,
    isImage:boolean,
    isText:boolean
) : TextBoxMetrics | null =>
{
    if(isShape)
    {
        // used to use calculateBoundingBox which is correct in all cases (just checks all raw points), but also way slower
        // @TODO: check if this change is correct!
        const rawSize = (resource as ResourceShape).shape.getDimensions().size;
        size.set(sizeAuto ? fitSizeAndKeepRatio(rawSize, size) : rawSize);

        // it's much easier to just use scale than to implement a proper "scale" function on ALL POSSIBLE SHAPES
        // @TODO: though I guess I could call my scalePath() tool func on any shape's path?
        const scaleFactor = size.x / rawSize.x;
        scale.x *= scaleFactor;
        scale.y *= scaleFactor;
    }

    if(isImage && sizeAuto)
    {
        const rawSize = (resource as ResourceImage).getSize();
        size.set(fitSizeAndKeepRatio(rawSize, size));
    }

    if(!isText) { return null; }

    // (a text with neither fill nor stroke used to get `fill = BLACK` assigned right here, which MUTATED
    // the operation: an operation shared between a text and an image/shape kept that black fill and drew
    // a black box behind the image on its next use. Drawing now falls back to black without touching it.)

    // A box axis of 0 means "the text decides". Such an axis must not be measured inside a
    // fake 2048px box and then aligned within it, or the text is drawn far outside itself.
    const autoX = sizeAuto || size.x <= 0.0001;
    const autoY = sizeAuto || size.y <= 0.0001;

    const textMetrics = calculateTextMetrics(
        resource as ResourceText,
        new Vector2(autoX ? 2048 : size.x, autoY ? 2048 : size.y),
        Vector2.ZERO,
        true,
        (autoX || autoY) ? { width: autoX, height: autoY } : null
    );

    if(autoX || autoY)
    {
        if(!textMetrics) { size.setXY(0, 0); }
        else
        {
            const dims = textMetrics.dimsFull.getSize();
            if(autoX) { size.x = dims.x + 1; } // to prevent silly rounding errors making text boxes JUUUST too small
            if(autoY) { size.y = dims.y + 1; }
        }
    }

    return textMetrics;
}
