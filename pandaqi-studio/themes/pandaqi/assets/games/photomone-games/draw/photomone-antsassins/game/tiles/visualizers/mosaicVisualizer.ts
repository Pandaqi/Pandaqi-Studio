import { range } from "lib/pq-games";
import Line from "../../shapes/line"
import Vector2 from "../../shapes/point"

export default class MosaicVisualizer
{
    constructor() {}
    draw(config)
    {
        const gen = config.generator;
        const groups = gen.mosaic.getGroups(config);
        const ctx = config.ctx;
        const mcfg = config.mosaic;
        const mcfge = mcfg.enhancements;

        for(const group of groups)
        {
            const type = group.getType();
            const shapes = group.getShapes();
            let color = mcfg.colors[type];
            // @TODO
            if(vis.inkFriendly) { color = mcfg.colorsInkfriendly[type]; }

            let secondType = Math.floor(Math.random() * mcfg.numColors);
            if(secondType == type) { secondType = (secondType + 1) % mcfg.numColors; }
            let otherColor = mcfg.colors[secondType].toString();

            color = color.randomizeAll(mcfg.colorVariation)
            const darkerColor = color.lighten(-14).toString();
            color = color.toString();
    
            const path = new Path2D();
            const detailPath = new Path2D();
            const strokePath = new Path2D();
            for(const shp of shapes)
            {
                let points = shp.getPoints();
                points = this.shrinkShape(points, mcfg.shrinkShapeFactor);

                for(let i = 0; i < points.length; i++)
                {
                    const p = points[i];
                    if(i == 0) { path.moveTo(p.x, p.y); }
                    else { path.lineTo(p.x, p.y); }
                }

                const addInnerPolygon = mcfge.innerPolygons;
                if(addInnerPolygon)
                {
                    const fill = Math.random() <= mcfge.innerPolygonFillProbability;
                    const stroke = Math.random() <= mcfge.innerPolygonStrokeProbability;
                    if(!fill && !stroke) { continue; }

                    const innerPoints = this.shrinkAndOffsetShape(points, mcfge.innerPolygonBounds);
                    let targetPath = fill ? detailPath : strokePath;

                    let innerLines = [innerPoints];
                    if(stroke) { innerLines = this.pickRandomLines(innerPoints, mcfge.innerPolygonLinePickProbability); }

                    for(const line of innerLines)
                    {
                        for(let i = 0; i < line.length; i++)
                        {
                            const p = line[i];
                            if(i == 0) { targetPath.moveTo(p.x, p.y); }
                            else { targetPath.lineTo(p.x, p.y); }
                        }
                    }

                    continue;
  
                }

                const addHighlight = Math.random() <= mcfge.highlightProbability && mcfge.highlights;
                if(addHighlight)
                {
                    const highlightLine = this.getHighlightLine(points, mcfge.highlightShrinkFactor);
                    strokePath.moveTo(highlightLine.start.x, highlightLine.start.y);
                    strokePath.lineTo(highlightLine.end.x, highlightLine.end.y);
                }
            }

            ctx.fillStyle = color;
            ctx.fill(path);

            ctx.fillStyle = darkerColor;
            ctx.fill(detailPath);

            ctx.strokeStyle = mcfge.strokeColor;
            ctx.lineWidth = mcfge.strokeWidth * config.sizeSquare;
            ctx.stroke(strokePath);
        }
    }

    
    getShapeCenter(points)
    {
        const center = new Vector2(0,0);
        for(const p of points)
        {
            center.add(p.clone());
        }
        center.scaleFactor(1.0/points.length);
        return center;
    }

    getLineLength(points)
    {
        if(!points) { return 0; }
        let sum = 0;
        for(let i = 0; i < points.length; i++)
        {
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];
            sum += p1.distTo(p2);
        }
        return sum;
    }

    pickRandomLines(points, prob)
    {
        const list = [];
        let curLine = null;
        const totalLength = this.getLineLength(points);
        
        for(let i = 0; i < points.length; i++)
        {
            const curPoint = points[i];
            let pickPoint = Math.random() <= prob;

            if(curLine)
            {
                const lineTooShort = this.getLineLength(curLine) < 0.133*totalLength;
                const lineTooLong = this.getLineLength(curLine) > 0.66*totalLength;
                if(lineTooShort) { pickPoint = true; }
                if(lineTooLong) { pickPoint = false; }
                
                const pickedAllPoints = (curLine.length == (points.length - 1));
                if(pickedAllPoints) { pickPoint = false; }
            }

            if(!pickPoint) { 
                if(curLine) { list.push(curLine); curLine = null; } 
                continue; 
            }

            if(!curLine) { curLine = [curPoint]; }

            let nextPoint = points[(i + 1) % points.length];
            const connectRandomly = Math.random() <= 0.33*prob;
            if(connectRandomly) { 
                let randIndex = Math.floor(Math.random() * points.length);
                if(randIndex == i || randIndex == (i+1)) { randIndex = Math.round(i + 0.5*points.length) % points.length; }
                nextPoint = points[randIndex];
            }
            curLine.push(nextPoint);
        }

        return list;
    }

    getHighlightLine(points, s)
    {
        const shrunkPoints = this.shrinkShape(points, s);
        const randIndex = Math.floor(Math.random() * shrunkPoints.length);
        const p1 = shrunkPoints[randIndex];
        const p2 = shrunkPoints[(randIndex + 1) % shrunkPoints.length];
        return new Line(p1, p2);
    }

    shrinkAndOffsetShape(points, bounds)
    {
        const center = this.getShapeCenter(points);
        const scaleFactor = range(bounds.min, bounds.max);
        const list = [];
        let smallestDistToEdge = Infinity;
        for(const p of points)
        {
            const scaledPoint = p.clone().sub(center).scaleFactor(scaleFactor).add(center);
            const distToEdge = scaledPoint.distTo(p);
            smallestDistToEdge = Math.min(smallestDistToEdge, distToEdge);
            list.push(scaledPoint);
        }

        const randAngle = Math.random() * 2 * Math.PI;
        const randRadius = range(0, 0.5*smallestDistToEdge);
        const randOffset = new Vector2(
            Math.cos(randAngle) * randRadius,
            Math.sin(randAngle) * randRadius
        )
        for(const p of list)
        {
            p.add(randOffset);
        }

        return list;
    }

    shrinkShape(points, s)
    {
        const list = [];
        const center = this.getShapeCenter(points);
        for(const p of points)
        {
            list.push( p.clone().sub(center).scaleFactor(s).add(center) );
        }
        return list;
    }

    
    turnIntoCircle(points)
    {
        const center = new Vector2(0,0);
        for(const p of points)
        {
            center.add(p);
        }
        center.scaleFactor(1.0 / points.length);
        let radius = 0.85*0.5*points[0].distTo(points[1]);
        if(points.length <= 3) { radius *= 0.425; }

        return this.createCircle(center, radius, 8);
    }

    createCircle(center, radius, numPoints)
    {
        const angleOffset = 2*Math.PI / numPoints;
        const arr = [];
        for(let i = 0; i < numPoints; i++)
        {
            const angle = angleOffset*i;
            const offset = new Vector2(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius
            );
            const p = center.clone().add(offset);
            arr.push(p);
        }
        return arr;
    }
}