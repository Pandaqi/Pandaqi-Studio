import Line from "js/pq_games/tools/geometry/line";
import PointGraph from "js/pq_games/tools/geometry/pointGraph";
import CONFIG from "./config";
import RouteSet from "./routeSet";

export default class Route
{
    start: PointGraph;
    end: PointGraph;
    types: number[];
    disabled: boolean;
    multi: boolean;
    bonuses: string[];
    set:RouteSet

    constructor(start:PointGraph, end:PointGraph)
    {
        this.start = start;
        this.end = end;
        this.types = [];
        this.disabled = false;
        this.multi = false;
        this.bonuses = [];
        this.set = null;
    }

    getOther(p:PointGraph)
    {
        if(this.start == p) { return this.end; }
        return this.start;
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

    addType(tp:number)
    {
        this.types.push(tp);
    }

    getTypes()
    {
        const arr = this.types.slice();
        while(arr.length < this.getBlockLength())
        {
            arr.push(this.types[0]);
        }
        return arr;
    }

    // @NOTE: to which block the bonus is actually attached is only determined at draw time
    placeBonus(bonus:string)
    {
        this.bonuses.push(bonus);
    }
}