

import { PowerDot } from "./boardGeneration"
import GraphElement from "./graphElement"
import { Vector2 } from "lib/pq-games"

export default class GraphNode extends GraphElement
{
    nodeType = "Regular"

    sequenceCounter = 0

    edgePoint = false
    whichEdges = []

    staticX = false
    staticY = false

    relaxVelocity = Vector2.ZERO

    powerDots:PowerDot[] = []
    edgeAngles = []
    tempAngle = 0

    areasMade = 0

    intermediaryPointsCreated = 0 // intermediary points created, I guess
    intermediaryPointsExhausted = false

    connectionUsed:boolean[] = []
}