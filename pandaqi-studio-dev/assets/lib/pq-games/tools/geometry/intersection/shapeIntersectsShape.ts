import Rectangle from "../rectangle";

// @TODO: create really fast check for circle intersection
// (that is especially stupid to do via Paths)
// both circleIntersectsCircle and circleIntersectsPath

const rectIntersectsRect = (rect1:Rectangle, rect2:Rectangle) =>
{
    const l1 = rect1.getTopLeft();
    const r1 = rect1.getBottomRight();
    const l2 = rect2.getTopLeft();
    const r2 = rect2.getBottomRight();
    return (l1.x < r2.x && r1.x > l2.x) && (l1.y < r2.y && r1.y > l2.y); 
}

export { rectIntersectsRect };