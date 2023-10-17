import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import Path from "js/pq_games/tools/geometry/paths/path";
import subdividePath from "js/pq_games/tools/geometry/paths/subdividePath";
import Point from "js/pq_games/tools/geometry/point"
import movePath from "js/pq_games/tools/geometry/transform/movePath";
import CONFIG from "../js_shared/config";

export default class WonkyRectangle
{
    pos: Point
    size : Point
    points: Point[]

    constructor(pos, size)
    {
        this.pos = pos;
        this.size = size;
    }

    generate()
    {
        
        let pathTop = this.getRandomSide(new Point(this.size.x, 0));
        let pathBottom = this.getRandomSide(new Point(this.size.x, 0)).reverse();
        pathBottom = movePath(pathBottom, new Point(0, this.size.y));
        this.points = [pathTop, pathBottom].flat();

        // @TODO: generate the random rectangles around it as well
    }

    getRandomSide(end:Point)
    {  
        let arr = [new Point(), end.clone()];
        arr = subdividePath({ path: arr, numChunks: 6 });

        const offsetBounds = CONFIG.cards.wonkyRect.pointOffset;
        const scalar = this.size.y;
        for(let i = 0; i < arr.length; i++)
        {
            let dirY = (i % 2 == 0) ? 1 : -1;
            let dirX = Math.random() - 0.5;
            const offset = new Point(dirX, dirY).scaleFactor(offsetBounds.random()).scaleFactor(scalar);
            arr[i].move(offset);
        }

        return arr;
    }

    async draw(ctx, color:string)
    {
        // the main box
        const path = new Path({ points: this.points });
        const res = new ResourceShape({ shape: path });
        const op = new LayoutOperation({
            translate: this.pos,
            fill: color,
            pivot: new Point(0.5)
        })
        await res.toCanvas(ctx, op);

        // @TODO: the random rectangles around it
    }
}