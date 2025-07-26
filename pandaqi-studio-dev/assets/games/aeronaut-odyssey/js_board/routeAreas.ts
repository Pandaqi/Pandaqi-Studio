import Line from "lib/pq-games/tools/geometry/line";
import PointGraph from "lib/pq-games/tools/geometry/pointGraph";
import Route from "./route";
import CONFIG from "./config";
import arraysAreDuplicates from "lib/pq-games/tools/collections/arraysAreDuplicates";

export default class RouteAreas
{
    areas: PointGraph[][];

    get() { return this.areas.slice(); }
    generate(points:PointGraph[], routes:Route[])
    {

        for(const route of routes)
        {
            route.usedForArea = [false, false];
        }

        const areas = [];
        for(const p of points)
        {
            areas.push( this.calculateAreasForPoint(p) );
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

    calculateAreasForPoint(p:PointGraph)
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
    
    calculateArea(pointStart:PointGraph, routeStart:Route, dir:number)
    {
        let curPoint = pointStart;
        let curRoute = routeStart;
        let keepSearching = true;
        const area = [curPoint];
        const routes = [curRoute];
        //const maxAreaLength = CONFIG.generation.maxRouteAreaPoints;
        while(keepSearching)
        {
            const newPoint = curRoute.getOther(curPoint);
            area.push(newPoint);
            if(newPoint == pointStart) { keepSearching = false; break; }

            const incoming = new Line(newPoint, curPoint); // this is REVERSED to match the direction of outgoing routes on next point
            const newRoute = this.getRouteWithClosestAngle(incoming, newPoint, dir, curPoint);
            if(!newRoute) { break; }
            if(newRoute.isUsedForAreaBy(newPoint)) { break; }
            
            routes.push(newRoute);
            // not needed anymore => if(area.length >= maxAreaLength) { keepSearching = false; break; }

            curPoint = newPoint;
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

    getRouteWithClosestAngle(incoming:Line, p:PointGraph, dir:number, comingFrom:PointGraph)
    {
        const routes : Route[] = p.metadata.routes;
        let closestAngle = dir*10000;
        let closestRoute = null;
        for(const route of routes)
        {
            const otherPoint = route.getOther(p);
            if(comingFrom == otherPoint) { continue; }

            const line = new Line(p, otherPoint);
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