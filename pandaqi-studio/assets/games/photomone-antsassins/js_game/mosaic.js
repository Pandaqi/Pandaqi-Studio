import Random from "js/pq_games/tools/random/main"
import Point from "./shapes/point"
import * as d3 from "./tools/d3-delaunay@6"

class MosaicGroup
{
    constructor(type, shapes)
    {
        this.type = type;
        this.shapes = shapes;
    }

    getType() { return this.type; }
    getShapes() { return this.shapes; }
}

class MosaicShape 
{
    constructor(points)
    {
        this.points = points;
        this.neighbors = [];
    }

    getPoints() { return this.points.slice(); }
    getNeighbors() { return this.neighbors.slice(); }
    setNeighbors(s) { this.neighbors = s; }
}

export default class Mosaic
{
    constructor(points)
    {
        this.setupGrid(points);
    }

    setSize(size)
    {
        this.size = size;
    }

    setupDelaunayList(config, points)
    {
        const arr = [];
        const minSize = Math.min(this.size.x, this.size.y);
        const bounds = config.mosaic.delaunayRandomization;
        for(const p of points)
        {
            const newPoint = p.clone();
            if(!newPoint.isOnEdge())
            {
                let varX = Random.range(bounds.min * minSize, bounds.max * minSize);
                if(Math.random() <= 0.5) { varX *= -1; }
                let varY = Random.range(bounds.min * minSize, bounds.max * minSize);
                if(Math.random() <= 0.5) { varY *= -1; }

                newPoint.x += varX;
                newPoint.y += varY;
            }
            arr.push([newPoint.x, newPoint.y]);
        }
        this.delaunayList = arr;
    }
    
    // @TODO: could be done much faster with fewer loops
    setupGrid(points)
    {
        const grid = [];
        this.grid = grid;

        const gridSize = { x: 0, y: 0 }
        this.gridSize = gridSize;
        for(const p of points)
        {
            gridSize.x = Math.max(gridSize.x, p.gridPos.x+1);
            gridSize.y = Math.max(gridSize.y, p.gridPos.y+1);
        }

        for(let x = 0; x < gridSize.x; x++)
        {
            grid[x] = [];
            for(let y = 0; y < gridSize.y; y++)
            {
                grid[x][y] = null;
            }
        }

        for(const p of points)
        {
            grid[p.gridPos.x][p.gridPos.y] = p;
        }
    }

    getShapes(config)
    {
        const list = [];
        const tileShape = config.tileShape;
        for(let x = 0; x < this.gridSize.x-1; x++)
        {
            for(let y = 0; y < this.gridSize.y-1; y++)
            {
                const p = this.grid[x][y];
                if(!p) { continue; }
                let pRight = null, pDown = null, pRightDown = null;
                let reverseTriangles = false;
                let mergeShapes = Math.random() <= config.mosaic.mergeShapesProbability;
                
                if(tileShape == "rectangle") {
                    pRight = this.grid[x+1][y];
                    pDown = this.grid[x][y+1];
                    pRightDown = this.grid[x+1][y+1];

                    reverseTriangles = Math.random() <= 0.5;
                } else {
                    const evenRow = (y % 2 == 0);
                    if(evenRow) {
                        pRight = this.grid[x+1][y];
                        if(x > 0) { pDown = this.grid[x-1][y+1]; }
                        pRightDown = this.grid[x][y+1];
                    } else {
                        pRight = this.grid[x+1][y];
                        pDown = this.grid[x][y+1];
                        pRightDown = this.grid[x+1][y+1];
                    }
                }

                const allPointsAvailable = (pRight && pRightDown && pDown);
                if(mergeShapes && allPointsAvailable)
                {
                    let shp1points = [p, pRight, pRightDown, pDown];
                    const shp1 = new MosaicShape(shp1points);
                    list.push(shp1);
                    continue;
                }

                if(pRight && pRightDown)
                {
                    let shp1points = [p, pRight, pRightDown];
                    if(reverseTriangles) { shp1points = [p, pRight, pDown]; }
                    const shp1 = new MosaicShape(shp1points);
                    list.push(shp1);
                }

                if(pDown && pRightDown)
                {
                    let shp2points = [p, pDown, pRightDown];
                    if(reverseTriangles) { shp2points = [pRight,pRightDown,pDown]; }
                    const shp2 = new MosaicShape(shp2points);
                    list.push(shp2);
                }

            }
        }

        for(const shape of list)
        {
            shape.setNeighbors(this.getNeighborsOfShape(shape, list));
        }

        return list;
    }

    getNeighborsOfShape(shape, possibleShapes)
    {
        const nbs = new Set();
        for(const shape2 of possibleShapes)
        {
            if(!this.pointsMatch(shape.getPoints(), shape2.getPoints(), 2)) { continue; }
            nbs.add(shape2);
        }

        return Array.from(nbs);
    }

    pointsMatch(a, b, num = 2)
    {
        let numMatches = 0;
        for(const p1 of a)
        {
            for(const p2 of b)
            {
                if(p1 != p2) { continue; }
                numMatches++;
            }
        }
        return (numMatches == num);
    }

    getNeighborsOfGroup(group, shapesLeft)
    {
        const nbs = new Set();
        for(const shape1 of group)
        {
            const shapeNbs = shape1.getNeighbors();
            for(const shapeNb of shapeNbs)
            {
                if(!shapesLeft.includes(shapeNb)) { continue; }
                nbs.add(shapeNb);
            }
        }

        return Array.from(nbs);
    }

    growGroup(config, shapes)
    {
        const group = [];
        group.push(shapes.pop());

        const minGroupSize = config.tiles.groupSize.min;
        const maxGroupSize = config.tiles.groupSize.max;
        
        let continueGrowing = true;
        while(continueGrowing)
        {
            if(shapes.length <= 0) { break; }
            continueGrowing = true;
            
            const nbs = this.getNeighborsOfGroup(group, shapes);
            if(nbs.length <= 0) { break; }

            let nb = Random.fromArray(nbs);
            group.push(nb);
            shapes.splice(shapes.indexOf(nb), 1);

            if(group.length < minGroupSize) { continueGrowing = true; continue; }

            const growProb = 1.0 - 1.0*(group.length - minGroupSize)/(maxGroupSize - minGroupSize)
            if(Math.random() > growProb) { continueGrowing = false; continue; }
            if(group.length >= maxGroupSize) { continueGrowing = false; continue; }
        }

        return group
    }

    getGroups(config)
    {
        let shapes;
        if(config.mosaic.useDelaunay) { shapes = this.getShapesDelaunay(config); }
        else { shapes = this.getShapesRegular(config); }

        const types = [];
        for(let i = 0; i < config.mosaic.numColors; i++) { types.push(i); }
        Random.shuffle(types);

        const groups = [];
        let counter = -1;
        while(shapes.length > 0)
        {
            counter = (counter + 1) % types.length;

            const curType = types[counter];
            const groupShapes = this.growGroup(config, shapes);
            const group = new MosaicGroup(curType, groupShapes);
            groups.push(group);
        }

        return groups;
    }

    getShapesRegular(config)
    {
        const shapes = this.getShapes(config);
        Random.shuffle(shapes);
        return shapes;
    }

    getShapesDelaunay(config)
    {
        const delaunay = d3.Delaunay.from(this.delaunayList);
        const voronoi = delaunay.voronoi([0, 0, this.size.x, this.size.y]);

        const list = [];
        for(const pol of voronoi.cellPolygons())
        {
            const pts = [];
            for(const p of pol)
            {
                pts.push(new Point(p[0], p[1]));
            }

            const shp = new MosaicShape(pts);
            list.push(shp);
        }

        for(let i = 0; i < list.length; i++)
        {
            const shp = list[i];
            const neighbourIndices = voronoi.neighbors(i);
            const nbs = [];
            for(const idx of neighbourIndices)
            {
                nbs.push(list[idx]);
            }
            shp.setNeighbors(nbs);
        }

        Random.shuffle(list);
        return list;
    }
}