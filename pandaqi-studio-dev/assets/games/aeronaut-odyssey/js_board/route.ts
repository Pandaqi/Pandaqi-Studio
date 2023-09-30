import Line from "js/pq_games/tools/geometry/line";
import PointGraph from "js/pq_games/tools/geometry/pointGraph";
import CONFIG from "./config";
import RouteSet from "./routeSet";
import isZero from "js/pq_games/tools/numbers/isZero";
import signRandom from "js/pq_games/tools/random/signRandom";
import range from "js/pq_games/tools/random/range";
import bezierCurveWithLength from "js/pq_games/tools/geometry/paths/bezierCurveWithLength";
import calculatePathLength from "js/pq_games/tools/geometry/paths/calculatePathLength";
import Point from "js/pq_games/tools/geometry/point";
import simplifyPath from "js/pq_games/tools/geometry/paths/simplifyPath";
import thickenPath from "js/pq_games/tools/geometry/paths/thickenPath";


interface BlockData
{
    pos: Point,
    rot: number
}

export default class Route
{
    start: PointGraph;
    end: PointGraph;
    types: number[];
    disabled: boolean;
    multi: boolean;
    bonuses: string[];
    set:RouteSet;

    closestAngle: number;
    curveSide:number;
    blockData:BlockData[];
    path:Point[]
    pathSimple: Point[];

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

    isSingleBlock() { return this.getBlockLength() <= 1; }

    getBlockLength()
    {
        return Math.round(this.getRawLength() - 2*CONFIG.generation.cityRadius);
    }

    // @TODO: duplicate code, make nicer
    getBlockLengthCeiled()
    {
        return Math.ceil(this.getRawLength() - 2*CONFIG.generation.cityRadius);
    }

    getRawLength()
    {
        return this.getAsLine().length();
    }

    matches(r:Route|Line)
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
    
    getMainType()
    {
        return this.types[0];
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

    calculateCurvedPath()
    {
        this.calculateClosestClashingCurve();
        this.calculateBlocksAlongRoute();
    }

    calculateClosestClashingCurve()
    {
        const ang1 = this.getAngleToClosestOtherRoute(this.start);
        const ang2 = -this.getAngleToClosestOtherRoute(this.end); // invert this, as routes are created from start->end, so these angles will be exactly wrong otherwise
        let decidingAngle = ang1;
        if(Math.abs(ang2) < Math.abs(ang1)) { decidingAngle = ang2; }

        //const tooFarAwayToMatter = Math.abs(ang2) > CONFIG.display.maxAvoidanceAngleBetweenRoutes;
        //if(tooFarAwayToMatter) { return; }

        let sideAway = -Math.sign(decidingAngle);
        if(isZero(sideAway)) { sideAway = signRandom(); }
        this.closestAngle = decidingAngle;
        this.curveSide = sideAway * 0.5*Math.PI;
    }

    getAngleToClosestOtherRoute(p:PointGraph)
    {
        const doubleRouteAdjustment = 0.2*Math.PI;
        const routes : Route[] = p.metadata.routes;
        let anchorVec : PointGraph = p.vecTo(this.getOther(p)).normalize();

        let closestAng = 2*Math.PI;
        for(const route of routes)
        {
            if(route.matches(this)) { continue; }

            let routeVec = p.vecTo(route.getOther(p)).normalize();

            let ang = anchorVec.angleSignedTo(routeVec);
            if(route.set) { ang += -Math.sign(ang)*doubleRouteAdjustment; }
            
            if(Math.abs(ang) > closestAng) { continue; }
            closestAng = ang;
        }

        return closestAng;
    }

    calculateBlocksAlongRoute()
    {
        const lengthInBlocks = this.getBlockLength();
        const resolution = 100;
        let targetLength = lengthInBlocks + 2*CONFIG.generation.cityRadius;
        if(this.isSingleBlock()) { targetLength = 0; } // single-block routes obviously cannot curve

        const line = this.getAsLine();

        // we might be the correct length already, but if we're close to another route
        // curve anyway to make more space
        const alreadyFine = line.length() > targetLength;
        if(alreadyFine && !this.isSingleBlock())
        {
            const closeToAnotherRoute = Math.abs(this.closestAngle) <= CONFIG.display.maxAngleCurveAnyway;
            const setCurve = this.set ? this.set.randomCurve : null;
            // @TODO: control bounds through config
            const randOffset = setCurve ? setCurve : range(0.025, 0.175);
            if(closeToAnotherRoute) 
            { 
                targetLength += randOffset; 
                if(this.set) { this.set.randomCurve = randOffset; }
            }
        }

        const curveParams = {
            line: line,
            targetLength: targetLength,
            controlPointRotation: this.curveSide,
            stepSize: 0.15, // smaller = more precise fit, but more expensive to calculate
            resolution: resolution
        }

        // first, get the curve chopped into regular pieces
        const curve = bezierCurveWithLength(curveParams);

        // then sample at regular intervals to get block centers
        const pathLength = calculatePathLength(curve);
        const resolutionPerBlock = resolution / pathLength;
        let resolutionUsedByCity = resolutionPerBlock * (2*CONFIG.generation.cityRadius);
        let resolutionUsedByPath = resolution - resolutionUsedByCity;

        const indexStepSize = (resolutionUsedByPath / lengthInBlocks);
        let curIndex = 0.5*resolutionUsedByCity + 0.5*indexStepSize;

        const arr : BlockData[] = [];
        for(let i = 0; i < lengthInBlocks; i++)
        {
            const curIndexRounded = Math.round(curIndex);
            const point = curve[curIndexRounded];
            const blockData = {
                pos: point,
                rot: curve[curIndexRounded].vecTo(curve[curIndexRounded+1]).angle()
            }
            arr.push(blockData);
            curIndex += indexStepSize;
        }

        const resCityRounded = Math.ceil(0.5*resolutionUsedByCity);
        const curveRelevant = curve.slice(resCityRounded, -resCityRounded);
        const pathSimple = simplifyPath({ path: curveRelevant, numSteps: 10 });
        const blockY = CONFIG.generation.blockHeightRelativeToWidth;
        const pathSimpleThick = thickenPath({ path: pathSimple, thickness: 0.5*blockY })

        this.path = curveRelevant;
        this.pathSimple = pathSimpleThick;
        this.blockData = arr;
    }
}