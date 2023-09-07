import Point from "js/pq_games/tools/geometry/point"

export default class Value
{

    dependsOnContent() : boolean
    {
        return false;
    }

    get() : any
    {
        return 0;
    }

    calc(parentSize : Point, contentSize : Point = null) : any
    {
        return 0;
    }
}