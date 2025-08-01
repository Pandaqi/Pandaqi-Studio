import { Vector2, PathAdvanced, calculateCentroid, subdividePath, signRandom, smoothPath } from "lib/pq-games";
import Area from "./area";
import { CONFIG } from "./config";

export default class Region
{
    id:number
    points:Vector2[]
    neighbors:Region[]
    height: number // set through noise, 0 to 1
    area: Area
    centroid: Vector2;
    neighborsPerEdge: any[];
    outlines: PathAdvanced[];

    constructor(id:number, points:Vector2[])
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

    getVector2s() { return this.points; }
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
        const numVector2s = this.points.length;
        for(let i = 0; i < numVector2s; i++)
        {
            const p1 = this.points[i];
            const p2 = this.points[(i+1) % numVector2s];
            const vecTo = p1.vecTo(p2).normalize();
            const checkVector2 = p1.halfwayTo(p2);
            checkVector2.add(vecTo.rotate(-0.5*Math.PI).scaleFactor(0.02));

            let correctNb = null;
            for(const nb of this.neighbors)
            {
                if(!voronoi.contains(nb.id, checkVector2.x, checkVector2.y)) { continue; }
                correctNb = nb;
                break;
            }

            nbPerEdge.push(correctNb);
        }
        this.neighborsPerEdge = nbPerEdge;
    }

    getVector2sDisplay()
    {
        // @DEBUGGING
        //return this.getVector2s();

        const points = [];
        for(let i = 0; i < this.points.length; i++)
        {
            const p1 = this.points[i];
            const p2 = this.points[(i+1) % this.points.length];
            const outline = this.getOutlineWith(p1, p2); // @TODO: is this just this.neighbors[i]? Think it is
            if(outline) { points.push(outline.toPathArray()) }
            else { points.push(p1); }
        }
        return points.flat();
    }

    clearOutlines() { this.outlines = null; }
    getOutlines() { return this.outlines.filter((elem) => elem != null); }
    calculateOutlines()
    {
        const arr : PathAdvanced[] = [];
        const numVector2s = this.points.length;
        for(let i = 0; i < numVector2s-1; i++)
        {
            const neighbor = this.neighborsPerEdge[i];
            if(!neighbor || neighbor.area == this.area) { arr.push(null); continue; }

            const p1 = this.points[i];
            const p2 = this.points[(i+1) % numVector2s];

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

    getOutlineWith(start:Vector2, end:Vector2) : PathAdvanced
    {
        for(const ol of this.outlines)
        {
            if(!ol || !ol.endPointsMatch(start, end)) { continue; }
            return ol.clone(true);
        }
        return null;
    }

    createJaggedLine(p1:Vector2, p2:Vector2) : PathAdvanced
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

        return new PathAdvanced(pathChopped);
    }
}