// V1 -> V2 flipped two defaults: pivot (top-left -> centre) and text alignment (left -> centre).
// Code that never sets them now draws in a different place, silently. These reports turn that into
// facts, but only under `_debug.strict`, because using a default is also perfectly fine on purpose.

let strictMode = false;

export const setStrictWarnings = (enabled:boolean) => { strictMode = enabled === true; }
export const strictWarningsEnabled = () : boolean => { return strictMode; }

const describeVector = (v:any) => { return v ? { x: v.x, y: v.y } : null; }

export const reportDefaultPivot = (op:any) =>
{
    if(!strictMode) { return; }
    console.warn("[strict] LayoutOperation uses the default (centre) pivot; a V1 `pos` meant the top-left corner. Set the pivot explicitly, or convert the pos.", {
        resource: op.resource?.constructor?.name ?? null,
        pos: describeVector(op.posResult ?? op.pos),
        size: describeVector(op.sizeResult ?? op.size),
        rot: op.rot,
    });
}

export const reportDefaultTextAlignment = (textConfig:any, explicit:Record<string,boolean>) =>
{
    if(!strictMode) { return; }
    console.warn("[strict] TextConfig uses the default (centre) alignment instead of setting it explicitly", {
        font: textConfig.font,
        size: textConfig.size,
        horizontal: explicit.horizontal ? "explicit" : "default",
        vertical: explicit.vertical ? "explicit" : "default",
    });
}
