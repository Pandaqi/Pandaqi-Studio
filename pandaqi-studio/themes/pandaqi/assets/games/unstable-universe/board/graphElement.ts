
import { Vector2 } from "lib/pq-games"
import GraphNode from "./graphNode"

export default class GraphElement
{
    pos = Vector2.ZERO
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

    setPosition(pos:Vector2)
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
        this.setPosition(new Vector2(x, this.y));
    }

    setY(y:number)
    {
        this.setPosition(new Vector2(this.x, y));
    }

    move(pos:Vector2)
    {
        this.setPosition(this.pos.add(pos));
    }

    clampPositionTo(bounds:Vector2)
    {
        const newX = Math.max(Math.min(this.x, bounds.x), 0);
		const newY = Math.max(Math.min(this.y, bounds.y), 0);
        this.setPosition(new Vector2(newX, newY));
    }
}