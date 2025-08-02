import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/MaterialVisualizer";
import Point from "js/pq_games/tools/geometry/point";
import BoardDisplay from "./boardDisplay";
import { CONFIG } from "./config";

export default class FixedFingers
{
    fixedFingers: number[]

    constructor(f:number[])
    {
        this.fixedFingers = f;
    }

    display(vis:MaterialVisualizer, group:ResourceGroup, boardDisplay:BoardDisplay, pos:Point, height:number = 128)
    {
        const size = CONFIG.fixedFingers.handScale * height;

        // hand background
        const res = vis.getResource("fixed_fingers_spritesheet");
        const opSprite = new LayoutOperation({
            pos: pos,
            size: new Point(size),
            frame: 5,
            pivot: Point.CENTER
        })
        group.add(res, opSprite);

        // overlay the mask of each finger
        // (number in array = frame)
        for(const finger of this.fixedFingers)
        {
            const opFinger = new LayoutOperation({
                pos: pos,
                size: new Point(size),
                frame: finger,
                pivot: Point.CENTER,
            })
            group.add(res, opFinger);
        }
    }
}