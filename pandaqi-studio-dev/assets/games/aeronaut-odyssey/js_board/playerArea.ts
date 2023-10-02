import Point from "js/pq_games/tools/geometry/point";
import Rectangle from "js/pq_games/tools/geometry/rectangle";

export default class PlayerArea
{
    rect: Rectangle;
    rotation: number;
    anchor: Point;
    size: Point;

    constructor(areaData)
    {
        this.anchor = areaData.anchor;
        this.rotation = areaData.rotation;
        this.size = areaData.size;

        const rect = new Rectangle().fromTopLeft(this.anchor, this.size);
        rect.rotateFromPivot(new Point(0, 0.5), this.rotation);
        this.rect = rect;
    }

    getRotation() { return this.rotation; }
    getRectangle() { return this.rect; }
    getVec()
    {
        return new Point().fromAngle(this.rotation * 0.5 * Math.PI).round();
    }
}