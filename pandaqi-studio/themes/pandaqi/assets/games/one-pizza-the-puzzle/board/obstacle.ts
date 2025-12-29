import { Line, Vector2 } from "lib/pq-games"

export default class Obstacle
{
    type:string
    borders:Line[] = []
    center = new Vector2()
    line:Line
    specialBuilding:string
    rot:number

    setType(t:string)
    {
        this.type = t;
    }

    setCenter(p:Vector2)
    {
        this.center = p;
    }

    setRotation(r:number)
    {
        this.rot = r;
    }

    setLine(l:Line)
    {
        this.line = l;
    }
}