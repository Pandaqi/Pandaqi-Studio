import Point from "./point"

export default class Line 
{
    start: Point;
    end: Point;

    constructor(p1:Point, p2:Point)
    {
        this.start = p1;
        this.end = p2;
    }

    isPoint() { return this.start == this.end; }
    getStart() { return this.start; }
    getEnd() { return this.end; }
    getVector() { return this.start.vecTo(this.end); }
    getLength() { return this.start.distTo(this.end); }
    getAngle() { const vec = this.getVector(); return Math.atan2(vec.y, vec.x); }
    getCenter() { return this.start.clone().move(this.end).scale(0.5); }
    intersectsLine(l:Line, margin = 0.0)
    {
        const vec1 = this.getVector().normalize().scale(margin);
        const vec2 = l.getVector().normalize().scale(margin);
        
        return this.intersectsPure(
            this.start.x+vec1.x, this.start.y+vec1.y, this.end.x-vec1.x, this.end.y-vec1.y,
            l.start.x+vec2.x, l.start.y+vec2.y, l.end.x-vec2.x, l.end.y-vec2.y
        )
    }

    // @SOURCE: https://stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function
    // returns true if the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
    intersectsPure(a,b,c,d,p,q,r,s) {
        const eps = 0.00001; // epsilon always needed with these kinds of operations
        var det, gamma, lambda;
        det = (c - a) * (s - q) - (r - p) * (d - b);
        if (det === 0) { return false; } // parallel or anti-parallel
        
        lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
        gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
        return ((0-eps) < lambda && lambda < (1+eps)) && ((0-eps) < gamma && gamma < (1+eps));
    };
}
