import { Vector2 } from "lib/pq-games"

interface SubwayData
{
    positionIndex?:number,
    counter?:number
}

interface PoliceData
{
    positionIndex?:number
}

interface EntranceData
{
    pos?: Vector2,
    building?: number,
    ingredient?: number,
    order?: Order,
}

type Order = number[]

export { Cell, SubwayData, PoliceData, EntranceData, Order }
export default class Cell
{
    pos = new Vector2()
    x = 0
    y = 0
    type = "empty"
    subType = ""
    dir = new Vector2(1,0)
    closedSides = [false,false,false,false]
    filledSquares = [false,false,false,false]

    roundabout = false
    deadend = false
    trafficSign = false

    entrance:EntranceData = {}
    police:PoliceData = {}
    subway:SubwayData = {}

    buildingIndex = -1
    originCrossing = -1

    setPosition(p:Vector2)
    {
        this.pos = p.clone();
        this.x = this.pos.x;
        this.y = this.pos.y;
    }

    setType(t:string = undefined, st:string = undefined)
    {
        if(t) { this.type = t; }
        if(st) { this.subType = st; }
    }

    setDir(d:Vector2)
    {
        this.dir = d;
    }

    isEmpty()
    {
        return this.type == "empty";
    }

    resetRoad()
    {
        this.type = "empty"
        this.originCrossing = -1;
        this.dir = new Vector2(1,0);
    }

    hasSubway()
    {
        return Object.keys(this.subway).length > 0;
    }

    hasPolice()
    {
        return Object.keys(this.police).length > 0;
    }

    hasEntrance()
    {
        return Object.keys(this.entrance).length > 0;
    }
}