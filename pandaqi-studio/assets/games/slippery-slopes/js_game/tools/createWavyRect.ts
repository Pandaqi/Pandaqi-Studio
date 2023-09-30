import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import Path from "js/pq_games/tools/geometry/paths/path";
import Point from "js/pq_games/tools/geometry/point";

export default (size:Point, amplitude:number, frequency:number, stepSize:number) =>
{
    const wave = [];
    const numSteps = Math.floor(size.x / stepSize);
    for(let i = 0; i < numSteps; i++)
    {
        const ang = (i / numSteps) * (2 * Math.PI) * frequency;
        const point = new Point(
            i * stepSize,
            amplitude * Math.sin(ang)
        )
        wave.push(point);
    }

    const pathRaw = [wave, new Point(size.x, 0), size.clone(), new Point(0, size.y)].flat();
    const path = new Path({ points: pathRaw, close: true });
    const res = new ResourceShape({ shape: path });
    return res;
}