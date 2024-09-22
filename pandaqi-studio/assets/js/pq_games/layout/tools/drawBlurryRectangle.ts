import Point from "js/pq_games/tools/geometry/point"
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import ResourceShape from "../resources/resourceShape";
import LayoutOperation from "../layoutOperation";
import BlurEffect from "../effects/blurEffect";
import ResourceGroup from "../resources/resourceGroup";

interface BlurryRectParams
{
    size?: Point,
    pos?: Point,
    color?: string,
    blur?: number,
    alpha?: number,
    composite?: GlobalCompositeOperation
}

// @TODO: not sure if pq_games/layout/tools folder is the best place for "common helper functions" like this ... will re-organize once I have more of these
export default (params:BlurryRectParams = {}, group:ResourceGroup = null) =>
{
    const rect = new Rectangle({ center: params.pos ?? new Point(), extents: params.size });
    const res = new ResourceShape(rect);
    const op = new LayoutOperation({
        fill: params.color ?? "#FFFFFF",
        effects: [new BlurEffect(params.blur ?? 5)],
        alpha: params.alpha ?? 1.0,
        composite: params.composite ?? "source-over"
    });
    if(group) { group.add(res, op); return group; }
    return { res, op };
}