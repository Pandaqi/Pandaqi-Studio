import Value from "./value"
import SizeValue from "./sizeValue"
import Point from "js/pq_games/tools/geometry/point"


type value = number|SizeValue

interface FourSideOutput
{
    top:number,
    right:number,
    bottom:number,
    left:number
}

export { FourSideValue, FourSideOutput }
export default class FourSideValue extends Value
{
    top : SizeValue
    right : SizeValue
    bottom : SizeValue
    left : SizeValue

    constructor(t:value|FourSideValue = null, r:value = null, b:value = null, l:value = null)
    {
        super();

        let top = t;
        let right = r;
        let bottom = b;
        let left = l;

        if(t instanceof FourSideValue)
        {
            top = t.top;
            right = t.right;
            bottom = t.bottom;
            left = t.left;
        }

        this.top = new SizeValue(top as value);
        this.right = right != null ? new SizeValue(right) : this.top; 
        this.bottom = bottom != null ? new SizeValue(bottom) : this.top;
        this.left = left != null ? new SizeValue(left) : this.top;
    }

    fromHorizontals(left:value, right:value)
    {
        this.left = new SizeValue(left);
        this.right = new SizeValue(right);
        this.top = new SizeValue(0);
        this.bottom = new SizeValue(0);
    }

    fromVerticals(top:value, bottom:value)
    {
        this.top = new SizeValue(top);
        this.bottom = new SizeValue(bottom);
        this.right = new SizeValue(0);
        this.left = new SizeValue(0);
    }

    toCSS() : string
    {
        return [this.top.toCSS(), this.right.toCSS(), this.bottom.toCSS(), this.left.toCSS()].join(" "); 
    }

    dependsOnContent() : boolean
    {
        return this.top.dependsOnContent() || this.right.dependsOnContent() ||
                this.bottom.dependsOnContent() || this.left.dependsOnContent()
    }

    get()
    {
        return {
            top: this.top.get(),
            right: this.right.get(),
            bottom: this.bottom.get(),
            left: this.left.get()
        }
    }

    calc(parentSize : Point, contentSize = new Point().setXY(null,null)) : FourSideOutput
    {
        return {
            top: this.top.calcs(parentSize.y, contentSize.y),
            right: this.right.calcs(parentSize.x, contentSize.x),
            bottom: this.bottom.calcs(parentSize.y, contentSize.y),
            left: this.left.calcs(parentSize.x, contentSize.x)
        }
    }

    isVisible() : boolean
    {
        return this.top.get() != 0 || this.right.get() != 0 || this.bottom.get() != 0 || this.left.get() != 0
    }
}