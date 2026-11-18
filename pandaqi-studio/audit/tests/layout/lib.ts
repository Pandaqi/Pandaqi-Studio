// The only file that knows where pq-games lives (same pattern as tests/text/lib.ts).
const LIB = "../../../assets/lib/pq-games";

export { LayoutOperation } from "../../../assets/lib/pq-games/layout/layoutOperation";
export { LayoutOperationBuilder } from "../../../assets/lib/pq-games/layout/operation/layoutOperationBuilder";
export { RendererPandaqi } from "../../../assets/lib/pq-games/renderers/pandaqi/rendererPandaqi";
export { RendererPandaqiWebGPU } from "../../../assets/lib/pq-games/renderers/pandaqi/rendererPandaqiWebGPU";
export { RendererPixi } from "../../../assets/lib/pq-games/renderers/pixi/rendererPixi";
export { MaterialVisualizer } from "../../../assets/lib/pq-games/renderers/materialVisualizer";
export { ResourceShape } from "../../../assets/lib/pq-games/layout/resources/resourceShape";
export { ResourceImage } from "../../../assets/lib/pq-games/layout/resources/resourceImage";
export { ResourceGroup } from "../../../assets/lib/pq-games/layout/resources/resourceGroup";
export { ResourceText } from "../../../assets/lib/pq-games/layout/resources/resourceText";
export { Rectangle } from "../../../assets/lib/pq-games/geometry/shapes/rectangle";
export { Circle } from "../../../assets/lib/pq-games/geometry/shapes/circle";
export { Path } from "../../../assets/lib/pq-games/geometry/path";
export { Dims } from "../../../assets/lib/pq-games/geometry/dims";
export { Vector2 } from "../../../assets/lib/pq-games/geometry/vector2";
export { Color } from "../../../assets/lib/pq-games/layout/color/color";
export { ColorLike } from "../../../assets/lib/pq-games/layout/color/colorLike";
export { DropShadowEffect } from "../../../assets/lib/pq-games/layout/effects/dropShadowEffect";
export { LayoutEffect } from "../../../assets/lib/pq-games/layout/effects/layoutEffect";
export { StrokeAlign, StrokeType } from "../../../assets/lib/pq-games/layout/values";
export { TransformationMatrix } from "../../../assets/lib/pq-games/layout/tools/transformationMatrix";
export { TextConfig } from "../../../assets/lib/pq-games/layout/text/textConfig";
export { Container, Graphics, Sprite, Texture } from "../../../assets/lib/pq-games/renderers/pixi/pixi.mjs";

export const LIB_PATH = LIB;
