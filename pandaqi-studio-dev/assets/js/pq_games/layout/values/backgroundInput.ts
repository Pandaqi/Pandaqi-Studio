import Point from "js/pq_games/tools/geometry/point"
import Container from "../containers/container"
import ResourceImage from "../resources/resourceImage"
import PropsInput from "./propsInput"
import PropsOutput from "./propsOutput"
import TwoAxisValue from "./twoAxisValue"
import Value from "./value"
import BackgroundOutput from "./backgroundOutput"
import InputGroup from "./inputGroup"

enum BackgroundScale {
    NONE,
    COVER,
    CONTAIN
}

enum BackgroundRepeat {
    NO_REPEAT,
    REPEAT_X,
    REPEAT_Y,
    REPEAT
}

export { BackgroundInput, BackgroundScale }
export default class BackgroundInput extends InputGroup
{
    img:ResourceImage
    size:TwoAxisValue
    scale:BackgroundScale
    position:TwoAxisValue
    repeat:BackgroundRepeat

    constructor(params:Record<string,any>)
    {
        super(params);

        // you can also input a (partially complete) BackgroundInput object directly
        if(params.background)
        {
            for(const prop in params.background)
            {
                this[prop] = params.background[prop];
            }
        }

        this.img = this.img ?? (params.img ?? new ResourceImage());
        this.scale = this.scale ?? (params.bgScale ?? BackgroundScale.NONE);

        const size = this.readTwoAxisParams(params, ["bgWidth", "bgHeight", "bgSize"]);
        this.size = this.size ?? new TwoAxisValue(size);

        const position = this.readTwoAxisParams(params, ["bgX", "bgY", "bgPos"]);
        this.position = this.position ?? new TwoAxisValue(position);

        this.repeat = this.repeat ?? (params.bgRepeat ?? BackgroundRepeat.NO_REPEAT);        
    }

    calc(c:Container)
    {
        const b = new BackgroundOutput();
        return super.calc(c, b);
    }

    applyToHTML(div:HTMLDivElement, wrapper:HTMLDivElement = null, parent:Container = null)
    {
        div.style.backgroundImage = this.img.getCSSUrl();
        div.style.backgroundSize = this.size.toCSS();
        if(this.scale != BackgroundScale.NONE)
        {
            div.style.backgroundSize = this.getScaleAsString();
        }
        
        div.style.backgroundPosition = this.position.toCSS();
        div.style.backgroundRepeat = this.getRepeatAsString();
    }

    getScaleAsString() : string
    {
        if(this.scale == BackgroundScale.CONTAIN) { return "contain"; }
        return "cover";
    }

    getRepeatAsString() : string
    {
        if(this.repeat == BackgroundRepeat.NO_REPEAT) { return "no-repeat"; }
        else if(this.repeat == BackgroundRepeat.REPEAT_X) { return "repeat-x"; }
        else if(this.repeat == BackgroundRepeat.REPEAT_Y) { return "repeat-y"; }
        else { return "repeat"; }
    }

}