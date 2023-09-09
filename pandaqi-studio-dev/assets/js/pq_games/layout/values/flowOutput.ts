import Point from "js/pq_games/tools/geometry/point"
import BoxOutput from "./boxOutput"

export default class FlowOutput
{
    gap: number
    grow: number
    shrink: number

    // set by parent to make flowing happen
    position: Point
    resizeAbsolute: Point // how many pixels to resize in each direction

    applyToBox(b:BoxOutput)
    {
        if(this.position)
        {
            b.position = this.position.clone();
        }

        if(this.resizeAbsolute)
        {
            const isNegative = this.resizeAbsolute.x < 0 || this.resizeAbsolute.y < 0
            const numChunks = isNegative ? this.shrink : this.grow;

            const resize = this.resizeAbsolute.clone().scaleFactor(numChunks);
            b.size = b.size.clone().move(resize);
        }
    }
}