import Point from "js/pq_games/tools/geometry/point"
import BoxOutput from "./boxOutput"
import OutputGroup from "./outputGroup"

export default class FlowOutput extends OutputGroup
{
    gap: number
    grow: number
    shrink: number

    // set by parent to make flowing happen
    position: Point
    resizeAbsolute: Point // how many pixels to resize in each direction

    clone()
    {
        const b = new FlowOutput();
        return super.cloneInto(b);
    }

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