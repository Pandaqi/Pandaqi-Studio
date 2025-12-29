
import { Vector2, Path, movePath, rangeInteger, Line, range, subdividePath, ResourceGroup, ResourceShape, LayoutOperation } from "lib/pq-games";
import { CONFIG } from "../shared/config";

export default class WonkyRectangle
{
    pos: Vector2
    size : Vector2
    points: Vector2[]
    triangles: Path[];

    constructor(pos, size)
    {
        this.pos = pos;
        this.size = size;
    }

    generate()
    {
        const pathOffset = this.pos.clone().add(this.size.clone().scaleFactor(-0.5));

        let pathTop = this.getRandomSide(new Vector2(this.size.x, 0));
        pathTop = movePath(pathTop, pathOffset);

        let pathBottom = this.getRandomSide(new Vector2(this.size.x, 0), true);
        pathBottom = movePath(pathBottom, pathOffset);
        pathBottom = movePath(pathBottom, new Vector2(0, this.size.y));
        this.points = [pathTop, pathBottom].flat();

        this.triangles = [];
        this.addRectanglesTo(pathTop);
        this.addRectanglesTo(pathBottom);
    }

    // @NOTE: in all this it's crucial that all shapes (both the entire one and the triangles) are wound CLOCKWISE ("to the right")
    addRectanglesTo(path:Vector2[])
    {
        let halfWay = Math.floor(0.5*path.length);
        let indices = [
            rangeInteger(1,halfWay),
            rangeInteger(halfWay+1, path.length-1)
        ];

        const sizeUnit = Math.min(this.size.x, this.size.y);
        const gapToShape = CONFIG._drawing.cards.wonkyRect.triangleGap * sizeUnit;
        const maxTriangleHeight = CONFIG._drawing.cards.wonkyRect.triangleSize.clone().scale(sizeUnit); // 30,50
        const pointyTriangleFactor = 1.66; // line triangles naturally look bigger than pointy ones, so compensate for visual balance

        for(const idx of indices)
        {
            let useLine = Math.random() <= 0.25;

            const endPoint = (idx == path.length - 1) || idx == 0;
            const outwardPoint = idx % 2 == 1;
            if(endPoint || outwardPoint) { useLine = true; }
            
            const lineBefore = new Line(path[idx-1].clone(), path[idx].clone());
            if(useLine)
            {
                const startFactor = range(0.1, 0.5);
                const endFactor = Math.min(startFactor + range(0.425, 1.0), 1.0);
                const lineSegment = new Line(lineBefore.lerp(startFactor), lineBefore.lerp(endFactor));

                const vecOut = lineSegment.vector().rotate(-0.5*Math.PI).normalize();
                lineSegment.move(vecOut.clone().scaleFactor(gapToShape));

                const halfWay = lineSegment.lerp(range(0.33, 0.66)); // some random point roughly halfway
                const thirdPoint = halfWay.move(vecOut.clone().scaleFactor(maxTriangleHeight.random()));

                const triPath = new Path([lineSegment.start, lineSegment.end, thirdPoint]);
                this.triangles.push(triPath);
                continue;
            }

            const lineAfter = new Line(path[idx].clone(), path[idx+1].clone());

            const avgVec = lineBefore.vector().negate().normalize().add(lineAfter.vector().normalize());
            const randRot = range(-0.1, 0.1) * Math.PI;
            let vecs = [avgVec.rotate(randRot)];
            
            for(const vec of vecs)
            {
                const firstPoint = path[idx].clone().move(vec.clone().scaleFactor(gapToShape));
            
                const avgOrthoLeft = vec.clone().rotate(0.5*Math.PI);
                const avgOrthoRight = vec.clone().rotate(-0.5*Math.PI);
    
                const maxSize = maxTriangleHeight.random() * pointyTriangleFactor;
                const offsetLongSide = maxSize;
                const offsetLeft = maxTriangleHeight.random() * pointyTriangleFactor * 0.5;
                const offsetRight = maxTriangleHeight.random() * pointyTriangleFactor * 0.5;
                
                const anchorPoint = firstPoint.clone().move(vec.clone().scaleFactor(offsetLongSide));
                const thirdPoint = anchorPoint.clone().move(avgOrthoLeft.scaleFactor(offsetLeft));
                const secondPoint = anchorPoint.clone().move(avgOrthoRight.scaleFactor(offsetRight));
    
                const triPath = new Path([firstPoint, secondPoint, thirdPoint]);
                this.triangles.push(triPath);
            }
            
        }
    }

    getRandomSide(end:Vector2, reverse = false)
    {  
        let arr = [Vector2.ZERO.clone(), end.clone()];
        arr = subdividePath({ path: arr, numChunks: 6 });

        const offsetBounds = CONFIG._drawing.cards.wonkyRect.pointOffset;
        const scalar = this.size.y;
        const xScalar = 0.5; // control randomness on X axis
        const halfLength = 0.5*(arr.length - 1);
        for(let i = 0; i < arr.length; i++)
        {
            let offsetFromCenter = (Math.abs(i - halfLength)) / halfLength;
            let dirY = (i % 2 == 0) ? 1 : -1;
            if(reverse) { dirY *= -1; }
            dirY *= offsetFromCenter;
            let dirX = xScalar * (Math.random() - 0.5) * (1.0 - offsetFromCenter);

            // to make the edges go down more / create a semi-circular shape
            let yOffset = offsetFromCenter
            if(reverse) { yOffset *= -1; }
            dirY += yOffset;

            const offset = new Vector2(dirX, dirY).scaleFactor(offsetBounds.random()).scaleFactor(scalar);
            arr[i].move(offset);
        }

        if(reverse) { arr.reverse(); }
        return arr;
    }

    draw(group:ResourceGroup, color:string)
    {
        // the main box
        const path = new Path(this.points);
        const res = new ResourceShape({ shape: path });
        const op = new LayoutOperation({
            fill: color,
        })
        group.add(res, op);

        // the random triangles around it
        for(const triangle of this.triangles)
        {
            const res = new ResourceShape({ shape: triangle });
            group.add(res, op);
        }
    }
}