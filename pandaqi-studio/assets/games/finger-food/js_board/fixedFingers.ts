import Point from "js/pq_games/tools/geometry/point";
import BoardDisplay from "./boardDisplay";
import CONFIG from "./config";

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
        const size = CONFIG.fixedFingers.handScale * height

        // hand background
        const sprite = game.add.sprite(pos.x, pos.y, "fixed_fingers_spritesheet");
        sprite.setFrame(5);
        sprite.setOrigin(0.5);
        sprite.displayWidth = size;
        sprite.displayHeight = size

        // overlay the mask of each finger
        // (number in array = frame)
        for(const finger of this.fixedFingers)
        {
            const sprite = game.add.sprite(pos.x, pos.y, "fixed_fingers_spritesheet");
            sprite.setFrame(finger);
            sprite.setOrigin(0.5);
            sprite.displayWidth = size;
            sprite.displayHeight = size;
        }
    }
}