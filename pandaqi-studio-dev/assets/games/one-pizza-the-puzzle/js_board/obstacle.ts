import Line from "js/pq_games/tools/geometry/line"
import Point from "js/pq_games/tools/geometry/point"

export default class Obstacle
{
    type:string
    borders:Line[] = [] // @TODO: type??
    center = new Point()
    line:Line
    specialBuilding:string
    rotation:number

    setType(t:string)
    {
        this.type = t;
    }

    setCenter(p:Point)
    {
        this.center = p;
    }

    setRotation(r:number)
    {
        this.rotation = r;
    }

    setLine(l:Line)
    {
        this.line = l;
    }
}