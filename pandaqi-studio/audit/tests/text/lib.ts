// The ONLY file that knows where pq-games lives.
//
// To copy these tests into the pq-games repository, put this folder at `<pq-games>/audit/text/` and
// change the paths below to `../../src/layout/...`. Nothing else in this folder imports the library
// directly.

const LIB = "../../../themes/pandaqi/assets/lib/pq-games";

export * from "../../../themes/pandaqi/assets/lib/pq-games/layout/text/index";
export { ResourceText } from "../../../themes/pandaqi/assets/lib/pq-games/layout/resources/resourceText";
export { ResourceGroup } from "../../../themes/pandaqi/assets/lib/pq-games/layout/resources/resourceGroup";
export { ResourceImage } from "../../../themes/pandaqi/assets/lib/pq-games/layout/resources/resourceImage";
export { DropShadowEffect } from "../../../themes/pandaqi/assets/lib/pq-games/layout/effects/dropShadowEffect";
export { OutlineEffect } from "../../../themes/pandaqi/assets/lib/pq-games/layout/effects/outlineEffect";
export { LayoutOperation } from "../../../themes/pandaqi/assets/lib/pq-games/layout/layoutOperation";
export { RendererPandaqi } from "../../../themes/pandaqi/assets/lib/pq-games/renderers/pandaqi/rendererPandaqi";
export { Vector2 } from "../../../themes/pandaqi/assets/lib/pq-games/geometry/vector2";
export { Dims } from "../../../themes/pandaqi/assets/lib/pq-games/geometry/dims";
export { Color } from "../../../themes/pandaqi/assets/lib/pq-games/layout/color/color";
export { StrokeAlign, StrokeType } from "../../../themes/pandaqi/assets/lib/pq-games/layout/values";

export const LIB_PATH = LIB;
