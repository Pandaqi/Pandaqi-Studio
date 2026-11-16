import type { Vector2 } from "../../geometry/vector2";
import type { Path } from "../../geometry/path";
import type { Renderer } from "../../renderers/renderer";
import type { ColorLikeValue } from "../color/colorLike";
import type { Color } from "../color/color";
import type { LayoutEffect } from "../effects/layoutEffect";
import type { ResourceBox } from "../resources/resourceBox";
import type { ResourceGroup } from "../resources/resourceGroup";
import type { ResourceImage } from "../resources/resourceImage";
import type { ResourceShape } from "../resources/resourceShape";
import type { ResourceText } from "../resources/resourceText";
import type { StrokeAlign, StrokeType } from "../values";
import type { LayoutOperation } from "../layoutOperation";

export type ResourceLike = ResourceImage|ResourceShape|ResourceText|ResourceBox|ResourceGroup

export interface MaskData
{
    resource: ResourceImage,
    operation: LayoutOperation
}

export interface LayoutOperationParams
{
    debug?: boolean,

    fill?:string|ColorLikeValue,
    stroke?:string|ColorLikeValue,
    strokeWidth?:number,
    strokeType?:StrokeType,
    strokeAlign?:StrokeAlign,

    pos?: Vector2,
    position?: Vector2,
    rot?:number,
    rotation?:number,
    scale?:Vector2,
    skew?:Vector2,
    depth?:number

    alpha?:number,
    composite?:GlobalCompositeOperation,

    size?:Vector2,
    sizeAuto?: boolean,

    pivot?:Vector2,
    flipX?:boolean,
    flipY?:boolean,

    clip?:Path,
    clipRelative?: boolean,
    mask?:MaskData,

    resource?:ResourceLike,
    effects?:LayoutEffect[],
    tint?:string|Color,

    frame?:number,
    parentOperation?: LayoutOperation,
    renderer?: Renderer,
    inline?: boolean,
}
