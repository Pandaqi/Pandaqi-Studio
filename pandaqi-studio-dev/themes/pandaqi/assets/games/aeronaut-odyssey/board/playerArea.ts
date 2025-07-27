import { Rectangle, Vector2 } from "lib/pq-games";

export default class PlayerArea
{
    rect: Rectangle;
    rot: number;
    anchor: Vector2;
    size: Vector2;

    constructor(areaData)
    {
        this.anchor = areaData.anchor;
        this.rot = areaData.rot;
        this.size = areaData.size;

        const rect = new Rectangle().fromTopLeft(this.anchor, this.size);
        rect.rotateFromPivot(new Vector2(0, 0.5), this.rot);
        this.rect = rect;
    }

    getRotation() { return this.rot; }
    getRectangle() { return this.rect; }
    getVec()
    {
        return new Vector2().fromAngle(this.rot * 0.5 * Math.PI).round();
    }
}