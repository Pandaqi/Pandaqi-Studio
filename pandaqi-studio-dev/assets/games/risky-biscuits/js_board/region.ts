import Point from "lib/pq-games/tools/geometry/point";
import Area from "./area";
import CONFIG from "./config";
import calculateCentroid from "lib/pq-games/tools/geometry/paths/calculateCentroid";
import subdividePath from "lib/pq-games/tools/geometry/paths/subdividePath";
import Path from "lib/pq-games/tools/geometry/paths/path";
import signRandom from "lib/pq-games/tools/random/signRandom";
import smoothPath from "lib/pq-games/tools/geometry/paths/smoothPath";
import PathAdvanced from "lib/pq-games/tools/geometry/paths/pathAdvanced";

export default class Region
{
    id:number
    points:Point[]
    neighbors:Region[]
    height: number // set through noise, 0 to 1
    area: Area
    centroid: Point;
    neighborsPerEdge: any[];
    outlines: PathAdvanced[];

    constructor(id:number, points:Point[])
    {
        this.id = id;
        this.points = points;
        this.centroid = calculateCentroid(this.points);
        this.neighbors = [];
        this.height = 0;
        this.area = null;
    }

    getType()
    {
        if(this.height < CONFIG.generation.noise.seaLevel) { return "sea"; }
        return "land";
    }

    getPoints() { return this.points; }
    getNeighbors() { return this.neighbors; }
    setNeighbors(regions:Region[])
    {
        this.neighbors = regions;
    }

    setArea(a) { this.area = a; }
    getArea() { return this.area; }
    hasArea() { return this.area != null; }

    connectNeighborsToEdges(voronoi)
    {
        const nbPerEdge = [];
        const numPoints = this.points.length;
        for(let i = 0; i < numPoints; i++)
        {
            const p1 = this.points[i];
            const p2 = this.points[(i+1) % numPoints];
            const vecTo = p1.vecTo(p2).normalize();
            const checkPoint = p1.halfwayTo(p2);
            checkPoint.add(vecTo.rotate(-0.5*Math.PI).scaleFactor(0.02));

            let correctNb = null;
            for(const nb of this.neighbors)
            {
                if(!voronoi.contains(nb.id, checkPoint.x, checkPoint.y)) { continue; }
                correctNb = nb;
                break;
            }

            nbPerEdge.push(correctNb);
        }
        this.neighborsPerEdge = nbPerEdge;
    }

    getPointsDisplay()
    {
        // @DEBUGGING
        //return this.getPoints();

        const points = [];
        for(let i = 0; i < this.points.length; i++)
        {
            const p1 = this.points[i];
            const p2 = this.points[(i+1) % this.points.length];
            const outline = this.getOutlineWith(p1, p2); // @TODO: is this just this.neighbors[i]? Think it is
            if(outline) { points.push(outline.toPath()) }
            else { points.push(p1); }
        }
        return points.flat();
    }

    clearOutlines() { this.outlines = null; }
    getOutlines() { return this.outlines.filter((elem) => elem != null); }
    calculateOutlines()
    {
        const arr : PathAdvanced[] = [];
        const numPoints = this.points.length;
        for(let i = 0; i < numPoints-1; i++)
        {
            const neighbor = this.neighborsPerEdge[i];
            if(!neighbor || neighbor.area == this.area) { arr.push(null); continue; }

            const p1 = this.points[i];
            const p2 = this.points[(i+1) % numPoints];

            let path

            // If the neighbor has already calculated their outlines, there MUST be a valid path for us
            // @TODO: this isn't always true yet, figure out why and FIX THAT
            if(neighbor.outlines != null) {
                let existingPath = neighbor.getOutlineWith(p1, p2);
                path = existingPath;
                const pathOrientedTheWrongWay = !path.getFirst().matches(p1);
                if(pathOrientedTheWrongWay) { path.reverse(); }
            } else {
                path = this.createJaggedLine(p1, p2); 
            }
            arr.push(path);
        }
        this.outlines = arr;
    }

    getOutlineWith(start:Point, end:Point) : PathAdvanced
    {
        for(const ol of this.outlines)
        {
            if(!ol || !ol.endPointsMatch(start, end)) { continue; }
            return ol.clone(true);
        }
        return null;
    }

    createJaggedLine(p1:Point, p2:Point) : PathAdvanced
    {
        const chunkSize = CONFIG.generation.edgeJitterChunkSize;
        let pathChopped = subdividePath({ path: [p1, p2], chunkSize: chunkSize });
        const maxOffset = CONFIG.generation.edgeJitterBounds;
        for(let i = 1; i < pathChopped.length - 1; i++)
        {
            const vec = pathChopped[i-1].vecTo(pathChopped[i]).normalize();
            const vecOrtho = vec.rotate(0.5*Math.PI*signRandom());
            const offset = vecOrtho.scaleFactor(maxOffset.random() * chunkSize);

            pathChopped[i].move(offset);
        }

        if(CONFIG.display.smoothOutlines)
        {
            pathChopped = smoothPath({ path: pathChopped });
        }

        return new PathAdvanced({ points: pathChopped });
    }
}