import Point from "js/pq_games/tools/geometry/point"
import { BackgroundScale } from "./backgroundInput"
import OutputGroup from "./outputGroup"

export default class BackgroundOutput extends OutputGroup
{
    img: string
    size: Point
    origin: Point
    scale: BackgroundScale

    clone()
    {
        const b = new BackgroundOutput();
        return super.cloneInto(b);
    }
}