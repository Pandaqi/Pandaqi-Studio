import calculateCenter from "js/pq_games/tools/geometry/paths/calculateCenter";
import Continent from "./continent";
import Region from "./region";

export default class Area
{
    id:number
    regions:Region[]
    continent:Continent
    centroid: any;
    neighbors: Area[];

    constructor(id:number, regions:Region[])
    {
        this.id = id;
        this.setRegions(regions);
        this.continent = null;
    }

    getType() { return this.regions[0].getType(); }

    setContinent(c) { this.continent = c; }
    getContinent() { return this.continent; }
    hasContinent() { return this.continent != null; }

    getNeighbors() { return this.neighbors; }

    setRegions(regions:Region[])
    {
        this.regions = regions;
        for(const region of regions)
        {
            region.setArea(this);
        }

        this.refreshCentroid();
        this.refreshNeighbors();
    }

    refreshCentroid()
    {  
        let centroids = [];
        for(const region of this.regions)
        {
            centroids.push(region.centroid);
        }

        this.centroid = calculateCenter(centroids);
    }

    refreshNeighbors()
    {
        const areas : Set<Area> = new Set();
        for(const region of this.regions)
        {
            for(const nb of region.getNeighbors())
            {
                if(nb.area == this) { continue; }
                areas.add(nb.area);
            }
        }
        this.neighbors = Array.from(areas);
        console.log(this.neighbors);
    }

    getOutlines()
    {
        const arr = [];
        for(const r of this.regions)
        {
            arr.push(r.getOutlines());
        }
        return arr.flat();
    }
}