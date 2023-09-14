import Line from "js/pq_games/tools/geometry/line";
import PointGraph from "js/pq_games/tools/geometry/pointGraph";
import CONFIG from "./config";

export default class Route
{
    start: PointGraph;
    end: PointGraph;
    type: number;

    constructor(start:PointGraph, end:PointGraph)
    {
        this.start = start;
        this.end = end;
    }

    getBlockLength()
    {
        return Math.round(this.getRawLength() - 2*CONFIG.generation.cityRadius);
    }

    getRawLength()
    {
        return this.getAsLine().length();
    }

    matches(r:Route)
    {
        return (this.start == r.start && this.end == r.end) || (this.start == r.end && this.end == r.start);
    }

    getAsLine()
    {
        return new Line(this.start, this.end);
    }
}