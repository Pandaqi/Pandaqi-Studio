import calculateCenter from "../paths/calculateCenter";
import pathToLineSegments from "../paths/pathToLineSegments";
import Point from "../point";

export default (path:Point[], offset:number) : Point[] =>
{
    const arr = [];
    const lines = pathToLineSegments(path);

    for(let i = 0; i < lines.length; i++)
    {
        const line1 = lines[i];
        const line2 = lines[(i+1) % lines.length];

        const vec1 = line1.vector();
        const vec2 = line2.vector();
        vec1.rotate(Math.PI);

        const insetVec = vec1.normalize().add(vec2.normalize()).normalize();
        const newPoint = line1.end.clone().move(insetVec.scaleFactor(offset));
        arr.push(newPoint)
    }

    // because of the structure above, the array is shifted, (first point registered is line1.END)
    // so we need to move the last element back to front
    const lastElem = arr.pop();
    arr.unshift(lastElem);

    return arr;
}