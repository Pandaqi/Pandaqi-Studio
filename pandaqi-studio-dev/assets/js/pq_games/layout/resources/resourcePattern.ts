import RepeatValue from "../values/repeatValue";
import TwoAxisValue from "../values/twoAxisValue";
import Resource from "./resource"
import { ImageLike } from "./resourceImage";

interface ResourcePatternParams
{
    callback?:Function
    image?: ImageLike
    repeat?: TwoAxisValue    
}

export default class ResourcePattern extends Resource
{
    image:ImageLike
    callback:Function
    repeat:TwoAxisValue

    constructor(params:ResourcePatternParams = {})
    {
        super()

        this.image = params.image;
        this.callback = params.callback;
        this.repeat = params.repeat ?? new TwoAxisValue(RepeatValue.NONE, RepeatValue.NONE);
    }
    
    clone() : ResourcePattern
    {
        return new ResourcePattern();
    }

    // @TODO: when executing, run loops to tile the image, and within those call the callback each time (with current iteration/position)
    
}