import Point from "./point"

export default class Circle 
{
    pos: Point;
    radius: number;
    
    constructor(pos, radius)
    {
        this.pos = pos;
        this.radius = radius;
    }

    getGridPoints(resolution)
    {
        const stepRadius = (this.radius / resolution);
        const numAngles = 8;
        const stepAngle = (2*Math.PI) / numAngles;

        const arr = [];
        const arrPerRadius = [];
        for(let i = 0; i <= resolution; i++)
        {
            const rad = i*stepRadius;
            let customNumAngles = numAngles;
            if(i == 0) { customNumAngles = 1; }

            const isEdge = (i == resolution);
            const perRadius = [];
            for(let a = 0; a < customNumAngles; a++)
            {
                const ang = a * stepAngle;
                const x = this.pos.x + Math.cos(ang)*rad;
                const y = this.pos.y + Math.sin(ang)*rad;
                const p = new Point(x,y);
                perRadius.push(p);
                arr.push(p);

                if(isEdge) { p.setEdge(true); }
            }

            let prevRadius = []; 
            if(i > 0) { prevRadius = arrPerRadius[i-1]; }
            for(let ii = 0; ii < perRadius.length; ii++)
            {
                const p = perRadius[ii];
                const pBefore = perRadius[(ii + perRadius.length - 1) % perRadius.length];
                const pAfter = perRadius[(ii + 1) % perRadius.length];
                p.addNeighbour(pBefore);
                p.addNeighbour(pAfter);

                if(prevRadius.length > 0)
                {
                    let idx = ii % prevRadius.length;
                    const pPrevRadius = prevRadius[idx];
                    p.addNeighbour(pPrevRadius);
                    pPrevRadius.addNeighbour(p);
                }
            }

            arrPerRadius.push(perRadius);
        }

        return arr;
    }
}