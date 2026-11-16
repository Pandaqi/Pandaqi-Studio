import { Vector2 } from "lib/pq-games"


export default class Cell
{
    x = 0
    y = 0
    pos = Vector2.ZERO

    row = "1"
    column = "A"
    nbs:Cell[] = []

    isEdge = false
    terrain = ""
    nature = ""
    stones = 0
    quadrant = 0
    road = ""
    roadOrient = 0
    landmark = ""

    falseSquare = false
    truthSquare = false
    tinyTreasure = false

    botPositive = false
    proposeData = {}

    setPosition(pos:Vector2)
    {
        this.pos = pos.clone();
        this.x = this.pos.x;
        this.y = this.pos.y;
    }

    setLabelData(row:string, column:string)
    {
        this.row = row;
        this.column = column;
    }

    setGridData(isEdge:boolean, quadrant:number)
    {
        this.isEdge = isEdge;
        this.quadrant = quadrant;
    }
}