import { LayoutOperation } from "../layoutOperation";
import { Vector2 } from "../../geometry/vector2";
import type { Vector2ParamValid } from "../../geometry/vector2";
import type { Path } from "../../geometry/path";
import type { Color } from "../color/color";
import type { ColorLikeValue } from "../color/colorLike";
import type { LayoutEffect } from "../effects/layoutEffect";
import type { Renderer } from "../../renderers/renderer";
import { StrokeAlign } from "../values";
import type { StrokeType } from "../values";
import type { LayoutOperationParams, MaskData, ResourceLike } from "./types";

// The chain-style alternative constructor:
//
//   const op = new LayoutOperationBuilder()
//       .pos(100, 50).rot(Math.PI).pivot(0.5, 0.5)
//       .size(200, 100).fill("#FF0000")
//       .build();
//
// It only collects params; nothing is cloned or drawn until `build()`. Every setter returns the
// builder, so calls can be split across lines or stored as a reusable template.
export class LayoutOperationBuilder
{
    private data: LayoutOperationParams

    constructor(params:LayoutOperationParams = {})
    {
        // copy the top-level object so building does not mutate a caller's params object
        this.data = { ...params };
    }

    // numbers: (x, y); vectors/dicts: a single argument
    pos(x:Vector2ParamValid, y:number = null) { this.data.pos = new Vector2(x, y ?? 0); return this; }
    position(x:Vector2ParamValid, y:number = null) { return this.pos(x, y); }

    rot(radians:number) { this.data.rot = radians; return this; }
    rotation(radians:number) { return this.rot(radians); }

    scale(x:Vector2ParamValid, y:number = null)
    {
        this.data.scale = new Vector2(x, y ?? (typeof x === "number" ? x : null));
        return this;
    }

    skew(x:Vector2ParamValid, y:number = null)
    {
        this.data.skew = new Vector2(x, y ?? (typeof x === "number" ? x : null));
        return this;
    }

    depth(z:number) { this.data.depth = z; return this; }

    size(w:Vector2ParamValid, h:number = null)
    {
        this.data.size = new Vector2(w, h ?? (typeof w === "number" ? w : null));
        return this;
    }
    sizeAuto(enabled = true) { this.data.sizeAuto = enabled; return this; }

    pivot(x:Vector2ParamValid, y:number = null)
    {
        this.data.pivot = new Vector2(x, y ?? (typeof x === "number" ? x : null));
        return this;
    }
    pivotCenter() { this.data.pivot = Vector2.CENTER; return this; }
    pivotTopLeft() { this.data.pivot = Vector2.ZERO; return this; }
    pivotBottomRight() { this.data.pivot = Vector2.ONE; return this; }

    flipX(enabled = true) { this.data.flipX = enabled; return this; }
    flipY(enabled = true) { this.data.flipY = enabled; return this; }

    alpha(a:number) { this.data.alpha = a; return this; }
    composite(c:GlobalCompositeOperation) { this.data.composite = c; return this; }

    fill(c:string|ColorLikeValue) { this.data.fill = c; return this; }
    stroke(s:string|ColorLikeValue) { this.data.stroke = s; return this; }
    strokeWidth(w:number) { this.data.strokeWidth = w; return this; }
    strokeAlign(a:StrokeAlign) { this.data.strokeAlign = a; return this; }
    strokeType(t:StrokeType) { this.data.strokeType = t; return this; }

    outerStroke(s:string|ColorLikeValue, w:number)
    {
        this.data.stroke = s;
        this.data.strokeWidth = w;
        this.data.strokeAlign = StrokeAlign.OUTSIDE;
        return this;
    }

    tint(c:string|Color) { this.data.tint = c; return this; }

    clip(path:Path) { this.data.clip = path; return this; }
    clipRelative(enabled = true) { this.data.clipRelative = enabled; return this; }
    mask(mask:MaskData) { this.data.mask = mask; return this; }

    resource(r:ResourceLike) { this.data.resource = r; return this; }

    effects(effs:LayoutEffect[]) { this.data.effects = effs.slice(); return this; }
    addEffect(fx:LayoutEffect)
    {
        this.data.effects = (this.data.effects ?? []).slice();
        this.data.effects.push(fx);
        return this;
    }

    frame(f:number) { this.data.frame = f; return this; }
    parentOperation(op:LayoutOperation) { this.data.parentOperation = op; return this; }
    renderer(r:Renderer) { this.data.renderer = r; return this; }
    inline(enabled = true) { this.data.inline = enabled; return this; }
    debug(enabled = true) { this.data.debug = enabled; return this; }

    build()
    {
        // Building twice must give two independent operations: clone the setting vectors so changing
        // one built operation's position cannot move the other.
        const data:LayoutOperationParams = { ...this.data };
        if(data.pos) { data.pos = data.pos.clone(); }
        if(data.scale) { data.scale = data.scale.clone(); }
        if(data.skew) { data.skew = data.skew.clone(); }
        if(data.size) { data.size = data.size.clone(); }
        if(data.pivot) { data.pivot = data.pivot.clone(); }
        if(data.effects) { data.effects = data.effects.slice(); }
        return new LayoutOperation(data);
    }
}
