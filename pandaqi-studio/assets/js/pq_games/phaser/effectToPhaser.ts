import LayoutEffect from "../layout/effects/layoutEffect";
import TintEffect from "../layout/effects/tintEffect";

export default (obj:any, effect:LayoutEffect) =>
{
    if(effect instanceof TintEffect) {
        obj.tint = effect.color.toHEXNumber();
    }

    // @TODO: shadow and grayscale
}