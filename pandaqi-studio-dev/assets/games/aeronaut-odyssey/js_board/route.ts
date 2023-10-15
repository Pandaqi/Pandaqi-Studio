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
import calculateBoundingBox from "js/pq_games/tools/geometry/paths/calculateBoundingBox";
import Rectangle from "js/pq_games/tools/geometry/rectangle";


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

    failed:boolean;
    conservative:boolean; // rounds block length downwards for more space
    pathBoundingBox: Rectangle;
    
    constructor(start:PointGraph, end:PointGraph)
    {
        this.start = start;
        this.end = end;
        this.types = [];
        this.disabled = false;
        this.multi = false;
        this.bonuses = [];
        this.set = null;
        this.failed = false;
    }

    removeFromPoints()
    {
        this.start.metadata.routes.splice(this.start.metadata.routes.indexOf(this), 1);
        this.start.removeConnectionByPoint(this.end);
        this.end.metadata.routes.splice(this.end.metadata.routes.indexOf(this), 1);
        this.end.removeConnectionByPoint(this.start);
    }

    getOther(p:PointGraph)
    {
        if(this.start == p) { return this.end; }
        return this.start;
    }

    isSingleBlock() { return this.getBlockLength() <= 1; }
    tooSmall() { return this.getBlockLengthRaw() < 0.9;} // simply no space to fit even ONE block

    getBlockLength()
    {
        return Math.round(this.getBlockLengthRaw());
    }

    getBlockLengthLow()
    {
        return Math.floor(this.getBlockLengthRaw());
    }

    getBlockLengthHigh()
    {
        return Math.ceil(this.getBlockLengthHigh());
    }

    getBlockLengthRaw()
    {
        return this.getRawLength() - 2*CONFIG.generation.cityRadius;
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

    getTypes() : number[]
    {
        const arr = this.types.slice();
        this.fillRestOfRoute(arr, this.getMainType());
        return arr;
    }

    // @NOTE: to which block the bonus is actually attached is only determined at draw time
    placeBonus(bonus:string)
    {
        this.bonuses.push(bonus);
    }

    getBonuses() : string[]
    {
        const arr = this.bonuses.slice();
        this.fillRestOfRoute(arr, null);
        return arr;
    }

    fillRestOfRoute(list:any[], val:any)
    {
        while(list.length < this.blockData.length)
        {
            list.push(val);
        }
    }

    refresh()
    {
        this.calculateBlocksAlongRoute();
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

        // @TODO: cleaner API for "clone settings from set partner"
        if(this.set)
        {
            const other = this.set.getOther(this);
            if(other.closestAngle)
            {
                this.closestAngle = other.closestAngle;
                this.curveSide = other.curveSide;
            }
        }

    }

    getAngleToClosestOtherRoute(p:PointGraph)
    {
        const routes : Route[] = p.metadata.routes;
        let anchorVec : PointGraph = p.vecTo(this.getOther(p)).normalize();

        let closestAng = 2*Math.PI;
        for(const route of routes)
        {
            if(route.matches(this)) { continue; }
            const sameSet = this.set && this.set.has(route);
            if(sameSet) { continue; }

            // this is the vector assuming the other route is STRAIGHT
            let routeVec = p.vecTo(route.getOther(p)).normalize();

            // this is the vector in case the other route has already been calculated
            // (in which case we properly apply its CURVE)
            if(route.blockData)
            {
                // if we are the start, then we want also the FIRST block
                // if we're the end, then we want the LAST block
                const weAreStart = route.start.matches(p);
                const blockIndex = weAreStart ? 0 : (route.blockData.length - 1);
                let rot = route.blockData[blockIndex].rot;
                if(!weAreStart) { rot += Math.PI; }
                routeVec = new Point().fromAngle(rot);
            }

            let ang = anchorVec.angleSignedTo(routeVec);            
            if(Math.abs(ang) > closestAng) { continue; }
            closestAng = ang;
        }

        return closestAng;
    }

    calculateBlocksAlongRoute()
    {
        if(this.tooSmall()) { this.failed = true; return; }

        let lengthInBlocks = this.getBlockLength();
        if(this.conservative) { lengthInBlocks = this.getBlockLengthLow(); }

        const resolution = 100;
        let targetLength = lengthInBlocks + 2*CONFIG.generation.cityRadius;
        if(this.isSingleBlock()) { targetLength = 0; } // single-block routes obviously cannot curve

        const line = this.getAsLine();

        // we might be the correct length already, but if we're close to another route
        // curve anyway to make more space
        
        const alreadyFine = line.length() > targetLength;
        const addRandomCurves = CONFIG.generation.addRandomCurvesWhenUnnecessary;
        if(alreadyFine && !this.isSingleBlock() && addRandomCurves)
        {
            const closeToAnotherRoute = Math.abs(this.closestAngle) <= CONFIG.display.maxAngleCurveAnyway;
            const setCurve = this.set ? this.set.randomCurve : null;
            const randOffset = setCurve ? setCurve : range(CONFIG.display.maxRandomRouteCurveBounds);
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
            stepSize: 0.05, // smaller = more precise fit, but more expensive to calculate
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

        this.offsetCurveForRouteSet(curve);

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

        const resCityMargin = 1.5; // just to make it a bit larger and give ourselves more freedom
        const resCityRounded = Math.ceil(0.5*resCityMargin*resolutionUsedByCity);
        const curveRelevant = curve.slice(resCityRounded, -resCityRounded);
        if(curveRelevant.length <= 2) { this.failed = true; return; }

        const pathSimple = simplifyPath({ path: curveRelevant, numSteps: 10 });
        const blockY = CONFIG.generation.blockHeightRelativeToWidth;
        const thickness = CONFIG.generation.routeOverlapThicknessFactor.lerp(CONFIG.boardClarityNumber);

        const pathSimpleThick = thickenPath({ path: pathSimple, thickness: thickness*blockY })

        this.path = curveRelevant;
        this.pathSimple = pathSimpleThick;
        this.pathBoundingBox = calculateBoundingBox(pathSimpleThick);
        this.blockData = arr;
    }

    offsetCurveForRouteSet(curve)
    {
        const partOfSet = this.set;
        if(!partOfSet) { return; }

        // calculate offset vectors for doubled routes
        const idx = this.set.indexOf(this);
        const num = this.set.count()
        const baseOffset = -0.5*(num - 1);
        const offsetForSet = baseOffset + idx;

        const blockY = CONFIG.generation.blockHeightRelativeToWidth;
        const marginBetweenSameSet = 0.25*blockY;

        let rot = 0;
        for(let i = 0; i < curve.length; i++)
        {
            const point = curve[i];
            if(i < curve.length - 1) {
                const nextPoint = curve[i+1];
                rot = point.vecTo(nextPoint).angle()
            }

            const vecForSet = new Point().fromAngle(rot);
            vecForSet.rotate(0.5*Math.PI).scale(blockY + marginBetweenSameSet);
            vecForSet.scale(offsetForSet);
            point.add(vecForSet);     
        }
    }
}