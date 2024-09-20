import Point from "js/pq_games/tools/geometry/point";
import BoardDisplay from "./boardDisplay";
import CONFIG from "./config";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import imageToPhaser from "js/pq_games/phaser/imageToPhaser";

export default class FixedFingers
{
    fixedFingers: number[]

    constructor(f:number[])
    {
        this.fixedFingers = f;
    }

    display(boardDisplay:BoardDisplay, pos:Point, height:number = 128)
    {
        const game = boardDisplay.game
        const size = CONFIG.fixedFingers.handScale * height;

        // hand background
        const res = CONFIG.visualizer.resLoader.getResource("fixed_fingers_spritesheet");
        const opSprite = new LayoutOperation({
            translate: pos,
            dims: new Point(size),
            frame: 5,
            pivot: Point.CENTER
        })
        const sprite = imageToPhaser(res, opSprite, game);

        // overlay the mask of each finger
        // (number in array = frame)
        for(const finger of this.fixedFingers)
        {
            const opFinger = new LayoutOperation({
                translate: pos,
                dims: new Point(size),
                frame: finger,
                pivot: Point.CENTER,
            })
            const spriteFinger = imageToPhaser(res, opFinger, game);
        }
    }
}