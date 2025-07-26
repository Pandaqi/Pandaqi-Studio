import Rectangle from "js/pq_games/tools/geometry/rectangle";
import LayoutOperation from "../layoutOperation";
import ResourceGroup from "../resources/resourceGroup";
import ResourceShape from "../resources/resourceShape";
import Point from "js/pq_games/tools/geometry/point";

export default (size:Point, group:ResourceGroup, color:string) =>
{
    const rect = new Rectangle().fromTopLeft(new Point(), size);
    const res = new ResourceShape({ shape: rect });
    const op = new LayoutOperation({ fill: color });
    group.add(res, op);
}