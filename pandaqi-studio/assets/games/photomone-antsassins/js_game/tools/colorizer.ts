import Color from "js/pq_games/layout/color/color"

export default class Colorizer
{
    generateEquidistant(num:number)
    {
        const baseHue = Math.random() * 360;
        const hueDistance = 360 / num;
        const colors = [];
        for(let i = 0; i < num; i++)
        {
            const h = (baseHue + hueDistance*i) % 360
            const c = new Color(h, 50, 50);
            colors.push(c);
        }

        return colors;
    }
}