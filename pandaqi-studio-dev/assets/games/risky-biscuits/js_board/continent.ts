import Area from "./area";
import Point from "js/pq_games/tools/geometry/point";
import calculateCenter from "js/pq_games/tools/geometry/paths/calculateCenter";

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

    count() { return this.areas.length; }
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
}