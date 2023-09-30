import Route from "./route";

export default class RouteSet
{
    routes:Route[]
    randomCurve:number;

    constructor()
    {
        this.routes = [];
        this.randomCurve = null;
    }

    has(r:Route) { return this.routes.includes(r); }
    count() { return this.routes.length; }
    add(r:Route)
    {
        this.routes.push(r);
        r.set = this;
    }

    indexOf(r:Route)
    {
        return this.routes.indexOf(r);
    }
    
    get(idx:number)
    {
        return this.routes[idx];
    }
}