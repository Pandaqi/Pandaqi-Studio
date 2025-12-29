import { Color } from "lib/pq-games";

export default (num:number, s:number, l:number) =>
{
    const randHue = Math.random() * 360;
    const stepSize = 180 / (num - 1);
    const arr = [];
    for(let i = 0; i < num; i++)
    {
        const hue = randHue + i * stepSize;
        const color = new Color(hue, s, l);
        arr.push(color);
    }
    return arr;
}