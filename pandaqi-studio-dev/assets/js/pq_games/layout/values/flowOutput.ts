import Point from "js/pq_games/tools/geometry/point"
import BoxOutput from "./boxOutput"

export default class FlowOutput
{
    gap: number
    resize: number

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
            const resize = this.resizeAbsolute.clone().scaleFactor(this.resize)
            b.size.move(resize);
        }
    }
}