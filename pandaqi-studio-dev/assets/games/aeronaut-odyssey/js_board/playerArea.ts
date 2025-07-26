import Point from "lib/pq-games/tools/geometry/point";
import Rectangle from "lib/pq-games/tools/geometry/rectangle";

export default class PlayerArea
{
    rect: Rectangle;
    rot: number;
    anchor: Point;
    size: Point;

    constructor(areaData)
    {
        this.anchor = areaData.anchor;
        this.rot = areaData.rot;
        this.size = areaData.size;

        const rect = new Rectangle().fromTopLeft(this.anchor, this.size);
        rect.rotateFromPivot(new Point(0, 0.5), this.rot);
        this.rect = rect;
    }

    getRotation() { return this.rot; }
    getRectangle() { return this.rect; }
    getVec()
    {
        return new Point().fromAngle(this.rot * 0.5 * Math.PI).round();
    }
}