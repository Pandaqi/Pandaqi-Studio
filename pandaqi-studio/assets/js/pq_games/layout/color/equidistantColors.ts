import Color from "./color";

export default (num:number = 1, s:number = 100, l:number = 100, a:number = 1) : Color[] =>
{
    const start = Math.random()*360;
    const offset = 360 / num;
    const arr = [];
    for(let i = 0; i < num; i++)
    {
        const hue = start + i*offset;
        arr.push(new Color(hue, s, l, a));
    }
    return arr;
}