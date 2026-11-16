import { Vector2 } from "lib/pq-games"

export default class Cell
{
    x = 0
    y = 0
    pos = Vector2.ZERO

    edge = false
    quadrant = 0
    quadrantString = "top left"
    
    row = "1"
    column = "A"

    nbs = [] // neighbors by adjacency
    connNbs = [] // neighbors by being connected through the network
    allConnectedTiles = [] // all tiles connected through network (not just neighbors)

    networkSymbolCount = {} // how often a (edge) symbol occurs in our network; cached because too messy to calculate otherwise
    networkTypeCount = {} // same thing, but with tile types
    networkPoison = false // used when generating to forbid any new connections to network on a tile

    type = ""
    rot = 0
    symbols = [null, null, null] // first slot is always our rotation arrow, so always false, so don't even consider it

    botPositive = false // caches the bots answer to tiles

    setPosition(pos:Vector2)
    {
        this.pos = pos;
        this.x = pos.x;
        this.y = pos.y;
    }

    setLabelData(row:string, col:string)
    {
        this.row = row;
        this.column = col;
    }

    setGridData(isEdge:boolean, quad:number, quadLabel:string)
    {
        this.edge = isEdge;
        this.quadrant = quad;
        this.quadrantString = quadLabel;
    }

}