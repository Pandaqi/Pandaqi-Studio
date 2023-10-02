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

    remove(r:Route)
    {
        this.routes.splice(this.indexOf(r), 1);

        const numRoutesLeft = this.count();
        if(numRoutesLeft <= 0) { return; }
        if(numRoutesLeft == 1)
        {
            this.routes[0].set = null;
            this.routes[0].refresh();
            return;
        }
        if(numRoutesLeft >= 2)
        {
            for(const route of this.routes)
            {
                route.refresh();
            }
        }
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