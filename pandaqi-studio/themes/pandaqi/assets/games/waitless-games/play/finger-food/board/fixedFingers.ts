
import BoardDisplay from "./boardDisplay";
import { MaterialVisualizer, ResourceGroup, Vector2, LayoutOperation } from "lib/pq-games";

export default class FixedFingers
{
    fixedFingers: number[]

    constructor(f:number[])
    {
        this.fixedFingers = f;
    }

    display(vis:MaterialVisualizer, group:ResourceGroup, boardDisplay:BoardDisplay, pos:Vector2, height:number = 128)
    {
        const size = vis.get("fixedFingers.handScale") * height;

        // hand background
        const res = vis.getResource("fixed_fingers_spritesheet");
        const opSprite = new LayoutOperation({
            pos: pos,
            size: new Vector2(size),
            frame: 5,
            pivot: Vector2.CENTER
        })
        group.add(res, opSprite);

        // overlay the mask of each finger
        // (number in array = frame)
        for(const finger of this.fixedFingers)
        {
            const opFinger = new LayoutOperation({
                pos: pos,
                size: new Vector2(size),
                frame: finger,
                pivot: Vector2.CENTER,
            })
            group.add(res, opFinger);
        }
    }
}