import Point from "../point"
import bezierCurve from "./bezierCurve";

// @SOURCE: https://www.gorillasun.de/blog/an-algorithm-for-polygons-with-rounded-corners/
export default (points:Point[], radius:number|number[] = 10) : Point[] =>
{
    if(!Array.isArray(radius)) { radius = [radius]; }
    
    const arr = [];
    for (let i = 0; i < points.length; i++) {
        const a = points[i]
        const b = points[(i+1) % points.length]
        const c = points[(i+2) % points.length]
        const curPointRadius = radius[(i + 1) % radius.length];

        const ba : Point = a.clone().sub(b).normalize()
        const bc : Point = c.clone().sub(b).normalize()
        
        // points in the direction the corner is accelerating towards
        const normal = ba.clone().add(bc).normalize()
        
        // shortest angle between the two edges
        const theta = ba.angleTo(bc)
        
        // find the circle radius that would cause us to round off half
        // of the shortest edge. We leave the other half for neighbouring corners to potentially cut.
        const minDist = Math.min(a.distTo(b), c.distTo(b));
        const maxR = 0.5 * minDist * Math.abs(Math.sin(0.5 * theta))
        const cornerR = Math.min(curPointRadius, maxR)
        
        // find the distance away from the corner that has a distance of
        // 2*cornerR between the edges
        const distance = Math.abs(cornerR / Math.sin(0.5*theta))
        
        // approximate an arc using a cubic bezier
        const c1 = b.clone().add(ba.clone().mult(distance))
        const c2 = b.clone().add(bc.clone().mult(distance))
        
        const bezierDist = 0.5523 // https://stackoverflow.com/a/27863181
        const p1 = c1.clone().sub(ba.clone().mult(2*cornerR*bezierDist))
        const p2 = c2.clone().sub(bc.clone().mult(2*cornerR*bezierDist))

        const corner = bezierCurve({ from: c1, to: c2, controlPoint1: p1, controlPoint2: p2 });
        arr.push(corner);
    }

    return arr.flat();
}