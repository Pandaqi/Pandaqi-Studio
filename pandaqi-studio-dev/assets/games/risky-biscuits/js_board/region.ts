import Point from "js/pq_games/tools/geometry/point";
import Area from "./area";
import CONFIG from "./config";
import Line from "js/pq_games/tools/geometry/line";
import calculateCentroid from "js/pq_games/tools/geometry/paths/calculateCentroid";
import { lineIntersectsLine } from "js/pq_games/tools/geometry/intersection/lineIntersectsLine";
import { pointIsInsidePolygon } from "js/pq_games/tools/geometry/intersection/pointInsideShape";

export default class Region
{
    id:number
    points:Point[]
    neighbors:Region[]
    height: number // set through noise, 0 to 1
    area: Area
    centroid: Point;
    neighborsPerEdge: any[];

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

    getOutlines()
    {
        const arr = [];
        const numPoints = this.points.length;
        for(let i = 0; i < numPoints; i++)
        {
            const neighbor = this.neighborsPerEdge[i];
            if(!neighbor) { continue; }
            if(neighbor.area == this.area) { continue; }

            const p1 = this.points[i];
            const p2 = this.points[(i+1) % numPoints];
            arr.push(new Line(p1, p2));
        }
        return arr;
    }
}