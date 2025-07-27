import Point from "js/pq_games/tools/geometry/point"
import { PowerDot } from "./main"
import GraphElement from "./graphElement"

export default class GraphNode extends GraphElement
{
    nodeType = "Regular"

    sequenceCounter = 0

    edgePoint = false
    whichEdges = []

    staticX = false
    staticY = false

    relaxVelocity = new Point()

    powerDots:PowerDot[] = []
    edgeAngles = []
    tempAngle = 0

    areasMade = 0

    intermediaryPointsCreated = 0 // intermediary points created, I guess
    intermediaryPointsExhausted = false

    connectionUsed:boolean[] = []
}