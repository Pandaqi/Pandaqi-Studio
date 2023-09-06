import Point from "../../shapes/point"
import Random from "js/pq_games/tools/random/main"

class Shape
{
    constructor(points, fillStyle = "#FF0000", strokeStyle = "#000000")
    {
        this.points = points;
        this.fillStyle = fillStyle;
        this.fill = true;
        this.strokeStyle = strokeStyle;
        this.stroke = false;
    }
}

export default class PhotomoneGenerator
{
    constructor() 
    { 
        this.visualType = "shapes"
        this.shapes = [];
    }

    getShapes() { return this.shapes; }
    generate(config)
    {
        this.placeRandomShapes(config);
    }

    placeRandomShapes(config)
    {
        const possibleShapeTypes = config.shapes.possibleShapeTypes || ["rectangle", "circle", "triangle"];
        const possibleLocations = config.gridPoints.slice();
        Random.shuffle(possibleLocations);

        const numRots = config.shapes.numUniqueRotations;
        const possibleRotations = [];
        for(let i = 0; i < numRots; i++)
        {
            possibleRotations.push((i / numRots) * 2 * Math.PI);
        }

        const radiusBoundsBase = config.shapes.radius;
        const radiusBounds = { min: radiusBoundsBase.min * config.sizeGeneratorSquare, max: radiusBoundsBase.max * config.sizeGeneratorSquare };
        const numRadii = config.shapes.numUniqueRadii;
        const radiusStep = (radiusBounds.max - radiusBounds.min) / numRadii;
        const possibleRadii = [];
        for(let i = 0; i <= numRadii; i++)
        {
            possibleRadii.push(radiusBounds.min + radiusStep*i);
        }
        
        const possibleColors = config.shapes.colors.slice();

        const numBounds = config.shapes.numShapes;
        const numShapes = Random.rangeInteger(numBounds.min, numBounds.max);
        let finalShapes = [];

        const params = {
            types: possibleShapeTypes,
            locations: possibleLocations,
            rotations: possibleRotations,
            radii: possibleRadii,
            colors: possibleColors
        }

        Random.shuffle(params.colors)

        const bgColor = params.colors.pop();
        const bgPoints = this.getShapePoints({ numCorners: 4, radius: 1000 });
        const bgShape = new Shape(bgPoints, bgColor);
        finalShapes.push(bgShape);

        while(finalShapes.length < numShapes)
        {
            const newShapes = this.placeShapeGroup(params);
            finalShapes = finalShapes.concat(newShapes);
        }

        this.shapes = finalShapes;
    }

    placeShapeGroup(params)
    {
        const color = Random.fromArray(params.colors);
        const group = [];
        const groupPoints = [];
        let keepGrowing = true;

        const edgePositions = [];
        for(const loc of params.locations)
        {
            if(!loc.isOnEdge()) { continue; }
            if(!(loc.lineIndex == 0)) { continue; }
            edgePositions.push(loc);
        }

        let curPos = Random.fromArray(edgePositions);

        // @TODO: remove all points visited, or allow points to be used multiple times?
        const maxGroupSize = 7;
        const minGroupSize = 3;
        while(keepGrowing)
        {
            // place the current shape
            const shapeType = Random.fromArray(params.types);
            const rotation = Random.fromArray(params.rotations);

            // start with biggest radius, go smaller and smaller as we go
            const radiusIndexFactor = 1.0 - (group.length / maxGroupSize);
            const radiusIndex = Math.round(radiusIndexFactor * (params.radii.length-1)); 
            const radius = params.radii[radiusIndex];

            let numCorners = 128; // default is for CIRCLE
            if(shapeType == "rectangle") { numCorners = 4; }
            else if(shapeType == "triangle") { numCorners = 3; }
            else if(shapeType == "hexagon") { numCorners = 6; }

            const shapeParams = {
                numCorners: numCorners,
                pos: curPos,
                radius: radius,
                rotation: rotation
            }
            const points = this.getShapePoints(shapeParams);
            const shape = new Shape(points, color);
            group.push(shape);
            groupPoints.push(curPos);
            params.locations.splice(params.locations.indexOf(curPos), 1);

            if(group.length >= maxGroupSize) { break; }

            const nbs = this.getGrowingNeighbors(groupPoints, params);
            if(nbs.length <= 0) { break; }
            curPos = Random.fromArray(nbs);

            keepGrowing = Math.random() <= 1.0 / group.length;
            if(group.length < minGroupSize) { keepGrowing = true; }
            
        }

        return group;
    }

    getGrowingNeighbors(group, params)
    {
        const validNeighbors = new Set();
        for(const point of group)
        {
            const nbs = point.getNeighbours();
            if(nbs.length <= 0) { continue; }
            for(const nb of nbs)
            {
                if(!params.locations.includes(nb)) { continue; }
                validNeighbors.add(nb);
            }
        }

        return Array.from(validNeighbors);
    }

    getShapePoints(params)
    {
        let numCorners = params.numCorners || 4;
        let pos = params.pos || new Point(0,0);
        let radius = params.radius || 10;
        let angle = params.rotation || 0;
        let angleOffset = 2*Math.PI / numCorners;
        let arr = [];
        for(let i = 0; i < numCorners; i++)
        {
            const point = new Point(
                pos.x + Math.cos(angle)*radius,
                pos.y + Math.sin(angle)*radius,
            )
            arr.push(point);
            angle += angleOffset;
        }
        return arr;
    }
}