import Point from "js/pq_games/tools/geometry/point"
import GraphNode from "./graphNode"

export default class GraphElement
{
    pos = new Point()
    x = 0
    y = 0
    
    type = ""
    visited = false
    edgePoint = false
    connections:GraphNode[] = []
    takenByMissionNode = false

    tempAngle = 0
    tempDistance = 0

    getPosition() 
    { 
        return this.pos.clone();
    }

    setPosition(pos:Point)
    {
        this.pos = pos.clone();
        this.x = this.pos.x;
        this.y = this.pos.y;
    }

    setType(t:string)
    {
        this.type = t;
    }

    setX(x:number)
    {
        this.setPosition(new Point(x, this.y));
    }

    setY(y:number)
    {
        this.setPosition(new Point(this.x, y));
    }

    move(pos:Point)
    {
        this.setPosition(this.pos.add(pos));
    }

    clampPositionTo(bounds:Point)
    {
        const newX = Math.max(Math.min(this.x, bounds.x), 0);
		const newY = Math.max(Math.min(this.y, bounds.y), 0);
        this.setPosition(new Point(newX, newY));
    }
}