import { Vector2Graph, Line } from "lib/pq-games";
import Route from "./route";

export default class RouteAreas
{
    areas: Vector2Graph[][];

    get() { return this.areas.slice(); }
    generate(points:Vector2Graph[], routes:Route[])
    {

        for(const route of routes)
        {
            route.usedForArea = [false, false];
        }

        const areas = [];
        for(const p of points)
        {
            areas.push( this.calculateAreasForVector2(p) );
        }

        const areasUnique = areas.flat(); 

        // the biggest areas will always be the ones covering the WHOLE thing, so remove it
        let biggestLength = 0;
        for(const area of areasUnique)
        {
            const length = area.length;
            if(length <= biggestLength) { continue; }
            biggestLength = length;
        }

        for(let i = areasUnique.length-1; i >= 0; i--)
        {
            if(areasUnique[i].length >= biggestLength) { areasUnique.splice(i,1);}
        }
        
        this.areas = areasUnique;
    }

    calculateAreasForVector2(p:Vector2Graph)
    {
        const routes : Route[] = p.metadata.routes;
        const arr = [];
        for(const route of routes)
        {
            // @OPTIMIZATION: each route can only be part of two areas
            // so don't try a new area from a route if we already have all of them
            // (we input the point, because the route uses that to determine in which DIRECTION it was used
            //  => was this point the start, or was it the end?)
            const routeAlreadyExhausted = route.isUsedForAreaBy(p);
            if(routeAlreadyExhausted) { continue; }

            const a1 = this.calculateArea(p, route, 1);
            if(a1.length <= 0) { continue; }
            arr.push(a1);
        }
        return arr;
    }
    
    calculateArea(pointStart:Vector2Graph, routeStart:Route, dir:number)
    {
        let curVector2 = pointStart;
        let curRoute = routeStart;
        let keepSearching = true;
        const area = [curVector2];
        const routes = [curRoute];
        //const maxAreaLength = CONFIG.generation.maxRouteAreaVector2s;
        while(keepSearching)
        {
            const newVector2 = curRoute.getOther(curVector2);
            area.push(newVector2);
            if(newVector2 == pointStart) { keepSearching = false; break; }

            const incoming = new Line(newVector2, curVector2); // this is REVERSED to match the direction of outgoing routes on next point
            const newRoute = this.getRouteWithClosestAngle(incoming, newVector2, dir, curVector2);
            if(!newRoute) { break; }
            if(newRoute.isUsedForAreaBy(newVector2)) { break; }
            
            routes.push(newRoute);
            // not needed anymore => if(area.length >= maxAreaLength) { keepSearching = false; break; }

            curVector2 = newVector2;
            curRoute = newRoute;
        }

        const valid = (area[0] == area[area.length-1]);
        if(!valid) { return []; }

        // save that we used all these routes (and in which direction)
        for(let i = 0; i < routes.length; i++)
        {
            routes[i].markUsedForArea(area[i]);
        }

        return area;
    }

    getRouteWithClosestAngle(incoming:Line, p:Vector2Graph, dir:number, comingFrom:Vector2Graph)
    {
        const routes : Route[] = p.metadata.routes;
        let closestAngle = dir*10000;
        let closestRoute = null;
        for(const route of routes)
        {
            const otherVector2 = route.getOther(p);
            if(comingFrom == otherVector2) { continue; }

            const line = new Line(p, otherVector2);
            let angle = incoming.vector().angleSignedTo(line.vector());
            if(Math.sign(angle) != Math.sign(dir)) { angle += dir*2*Math.PI; }
            
            let closer = angle < closestAngle;
            if(dir < 0) { closer = angle > closestAngle; }
            if(!closer) { continue; }

            closestAngle = angle;
            closestRoute = route;
        }
        return closestRoute;
    }
}