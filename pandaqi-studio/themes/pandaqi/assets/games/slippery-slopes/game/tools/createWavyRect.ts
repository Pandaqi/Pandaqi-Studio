import { Vector2, Path, ResourceShape } from "lib/pq-games";

export default (size:Vector2, amplitude:number, frequency:number, stepSize:number) =>
{
    const wave = [];
    const numSteps = Math.floor(size.x / stepSize);
    for(let i = 0; i < numSteps; i++)
    {
        const ang = (i / numSteps) * (2 * Math.PI) * frequency;
        const point = new Vector2(
            i * stepSize,
            amplitude * Math.sin(ang)
        )
        wave.push(point);
    }

    const pathRaw = [wave, new Vector2(size.x, 0), size.clone(), new Vector2(0, size.y)].flat();
    const path = new Path(pathRaw, true);
    const res = new ResourceShape({ shape: path });
    return res;
}