import Area from "./area";
import Point from "js/pq_games/tools/geometry/point";
import calculateCenter from "js/pq_games/tools/geometry/paths/calculateCenter";
import CONFIG from "./config";
import lerp from "js/pq_games/tools/numbers/lerp";
import clamp from "js/pq_games/tools/numbers/clamp";

export default class Continent
{
    areas:Area[]
    id:number
    centroid: Point;

    constructor(id:number, areas:Area[])
    {
        this.id = id;
        this.setAreas(areas);
    }

    getType() { return this.areas[0].getType(); }
    count() { return this.areas.length; }    
    countRegions()
    {
        let sum = 0;
        for(const area of this.areas)
        {
            sum += area.count();
        }
        return sum;
    }

    indexOf(area:Area) { return this.areas.indexOf(area); }
    getAreas() { return this.areas; }
    setAreas(areas:Area[])
    {
        this.areas = [];
        this.addAreas(areas);
    }
    addAreas(areas:Area[])
    {
        for(const area of areas)
        {
            this.areas.push(area);
            area.setContinent(this);
        }

        this.refreshCentroid();
    }

    mergeWith(c:Continent)
    {
        this.addAreas(c.getAreas());
    }

    refreshCentroid()
    {
        let centroids = [];
        for(const area of this.areas)
        {
            centroids.push(area.centroid);
        }
        this.centroid = calculateCenter(centroids);
    }

    getMostExtremeArea()
    {
        let maxDist = 0;
        let maxArea = null;
        for(const area of this.areas)
        {
            const dist = area.getDistanceToAreas(this.areas);
            if(dist <= maxDist) { continue;}
            maxDist = dist;
            maxArea = area;
        }
        return maxArea;
    }

    calculateScore()
    {
        let sum = 0;
        sum += CONFIG.generation.continents.scorePerArea * this.areas.length;

        // average number of regions per area
        // lower = harder (as the fight for space is tighter), so reward that
        const density = (this.countRegions() / this.areas.length); 
        const densityScoreBounds = CONFIG.generation.continents.scoreRegionDensityBounds;
        const densityMax = CONFIG.generation.areas.sizeBounds.max;
        const factor = clamp(1.0 - density/densityMax, 0.0, 1.0);
        sum += lerp(densityScoreBounds.min, densityScoreBounds.max, factor);

        // sea connections: more connections = more valuable
        // @TODO

        // artefacts = more artefacts = reduce score for balance
        // @TODO

        // randomness
        sum += CONFIG.generation.continents.scoreRandomness.random();

        return Math.round(sum);
    }
}