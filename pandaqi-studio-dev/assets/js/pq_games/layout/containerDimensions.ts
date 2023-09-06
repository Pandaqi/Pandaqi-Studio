import Container from "./container"
import Point from "js/pq_games/tools/geometry/point"

export default class ContainerDimensions
{
    topLeft : Point
    bottomRight : Point

    x : number
    y : number
    width : number
    height : number

    constructor()
    {
        this.topLeft = new Point().setXY(Infinity, Infinity);
        this.bottomRight = new Point().setXY(-Infinity, -Infinity);
    }

    takeIntoAccount(c:Container)
    {
        var dims : ContainerDimensions = c.dimensions;
        this.topLeft.x = Math.min(this.topLeft.x, dims.x);
        this.topLeft.y = Math.min(this.topLeft.y, dims.y);
        this.bottomRight.x = Math.max(this.bottomRight.x, dims.x + dims.width);
        this.bottomRight.y = Math.max(this.bottomRight.y, dims.y + dims.height);
        this.refresh();
    }

    refresh()
    {
        this.x = this.topLeft.x;
        this.y = this.topLeft.y;
        this.width = (this.bottomRight.x - this.topLeft.x);
        this.height = (this.bottomRight.y - this.topLeft.y);
    }

    merge(d1:ContainerDimensions, d2:ContainerDimensions)
    {
        this.x = d1.x ?? d2.x;
        this.y = d1.y ?? d2.y;
        this.width = d1.width ?? d2.width;
        this.height = d1.height ?? d2.height;
    }

    getPos() : Point
    {
        return new Point().setXY(this.x, this.y);
    }

    getSize() : Point
    {
        return new Point().setXY(this.width, this.height);
    }
    
}