import Container from "./container"
import Point from "js/pq_games/tools/geometry/point"
import BoxOutput from "../values/boxOutput"

export default class ContainerDimensions
{
    topLeft : Point
    bottomRight : Point

    x : number
    y : number
    width : number
    height : number

    constructor(x = null, y = null, width = null, height = null)
    {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.topLeft = new Point().setXY(Infinity, Infinity);
        this.bottomRight = new Point().setXY(-Infinity, -Infinity);
    }
    
    setPosition(p:Point)
    {
        this.x = p.x;
        this.y = p.y;
    }

    getPosition() : Point
    {
        return new Point().setXY(this.x, this.y);
    }

    setSize(p: Point)
    {
        this.width = p.x
        this.height = p.y
    }

    getSize() : Point
    {
        return new Point().setXY(this.width, this.height);
    }

    fromBox(b:BoxOutput)
    {
        this.setPosition(b.position.clone());
        this.setSize(b.size.clone());
    }

    takeIntoAccount(c:Container)
    {
        var dims : BoxOutput = c.boxOutput;
        this.topLeft.x = Math.min(this.topLeft.x, dims.position.x);
        this.topLeft.y = Math.min(this.topLeft.y, dims.position.y);
        this.bottomRight.x = Math.max(this.bottomRight.x, dims.position.x + dims.size.x);
        this.bottomRight.y = Math.max(this.bottomRight.y, dims.position.y + dims.size.y);
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

    
}